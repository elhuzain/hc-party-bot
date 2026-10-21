import { randomInt } from 'node:crypto';
import type { Players } from './Players';

export const STEAL_SUCCESS_CHANCE = 30;
export const STEAL_FAILURE_PENALTY = 10;

/** Settle both balances synchronously in the single bot process. */
export function steal(
    players: Players,
    thiefId: string,
    victimId: string,
    drawNumber: (exclusiveMax: number) => number = randomInt,
) {
    if (thiefId === victimId) throw new Error('You cannot steal from yourself.');
    const thief = players.get(thiefId);
    const victim = players.get(victimId);
    if (thief.coins < STEAL_FAILURE_PENALTY) {
        throw new Error(`You need at least ${STEAL_FAILURE_PENALTY} coins to cover a failed attempt.`);
    }
    if (victim.coins < 10) throw new Error('This user needs at least 10 coins to steal from them.');

    const succeeded = drawNumber(100) < STEAL_SUCCESS_CHANCE;
    const percentage = succeeded ? 10 + drawNumber(71) : null;
    // BigInt avoids rounding errors near the maximum supported balance.
    const amount = percentage === null
        ? STEAL_FAILURE_PENALTY
        : Number(BigInt(victim.coins) * BigInt(percentage) / 100n);
    const thiefBalance = thief.coins + (succeeded ? amount : -amount);
    const victimBalance = victim.coins + (succeeded ? -amount : amount);
    if (!Number.isSafeInteger(thiefBalance) || !Number.isSafeInteger(victimBalance)) {
        throw new Error('This attempt would exceed the maximum supported balance.');
    }
    players.update(thiefId, { coins: thiefBalance });
    players.update(victimId, { coins: victimBalance });
    return { succeeded, percentage, amount, thiefBalance, victimBalance };
}
