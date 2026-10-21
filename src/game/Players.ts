import type { QuickYAML } from 'quick-yaml.db';

export const DAILY_REWARD = 100;
export const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface Player {
    coins: number;
    /** Unix timestamp in milliseconds; 0 means no daily reward claimed yet. */
    lastDailyClaim: number;
}

function validatePlayer(value: unknown): asserts value is Player {
    if (typeof value !== 'object' || value === null ||
        !('coins' in value) || !Number.isSafeInteger(value.coins) || Number(value.coins) < 0 ||
        !('lastDailyClaim' in value) || !Number.isSafeInteger(value.lastDailyClaim) || Number(value.lastDailyClaim) < 0) {
        throw new Error('Player coins and lastDailyClaim must be non-negative safe integers.');
    }
}

export class Players {
    constructor(private readonly database: QuickYAML) {}

    private key(userId: string): string {
        if (!/^\d+$/.test(userId)) throw new Error('A Discord user ID is required.');
        return `player-${userId}`;
    }

    /** Creates a player on first access. Existing invalid data is never overwritten. */
    get(userId: string): Player {
        const key = this.key(userId);
        if (!this.database.has(key)) {
            const player: Player = { coins: 100, lastDailyClaim: 0 };
            this.database.set(key, { ...player });
            return player;
        }

        const player: unknown = this.database.get(key);
        validatePlayer(player);
        return { coins: player.coins, lastDailyClaim: player.lastDailyClaim };
    }

    /** Keep the entire read/modify/write operation synchronous in one bot process. */
    update(userId: string, changes: Partial<Player>): Player {
        const player = { ...this.get(userId), ...changes };
        validatePlayer(player);
        this.database.set(this.key(userId), player);
        return player;
    }

    /** Check eligibility and persist the reward and claim time together synchronously. */
    claimDaily(userId: string, now = Date.now()) {
        if (!Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid claim time.');
        const player = this.get(userId);
        const nextClaimAt = player.lastDailyClaim + DAILY_INTERVAL_MS;
        if (player.lastDailyClaim !== 0 && now < nextClaimAt) {
            return { claimed: false as const, player, nextClaimAt };
        }
        const coins = player.coins + DAILY_REWARD;
        if (!Number.isSafeInteger(coins)) {
            throw new Error('This reward would exceed the maximum supported balance.');
        }
        return {
            claimed: true as const,
            player: this.update(userId, { coins, lastDailyClaim: now }),
            nextClaimAt: now + DAILY_INTERVAL_MS,
        };
    }

    /** Validate both balances before transferring, without yielding between writes. */
    transferCoins(senderId: string, recipientId: string, amount: number) {
        if (senderId === recipientId) throw new Error('You cannot give coins to yourself.');
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            throw new Error('The amount must be a positive whole number within the supported limit.');
        }
        const sender = this.get(senderId);
        if (amount > sender.coins) {
            throw new Error(`You only have ${sender.coins} coins. Choose a smaller amount.`);
        }
        const recipient = this.get(recipientId);
        const recipientBalance = recipient.coins + amount;
        if (!Number.isSafeInteger(recipientBalance)) {
            throw new Error('This would exceed the recipient’s maximum supported balance.');
        }
        return {
            sender: this.update(senderId, { coins: sender.coins - amount }),
            recipient: this.update(recipientId, { coins: recipientBalance }),
        };
    }

    changeCoins(userId: string, amount: number, action: 'add' | 'remove'): Player {
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            throw new Error('The amount must be a positive whole number within the supported limit.');
        }
        const player = this.get(userId);
        if (action === 'remove' && amount > player.coins) {
            throw new Error(`This user only has ${player.coins} coins. No coins were removed.`);
        }
        const coins = action === 'add' ? player.coins + amount : player.coins - amount;
        if (!Number.isSafeInteger(coins)) throw new Error('This would exceed the maximum supported balance.');
        return this.update(userId, { coins });
    }
}
