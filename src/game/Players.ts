import type { QuickYAML } from 'quick-yaml.db';

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
}
