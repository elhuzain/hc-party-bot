import { randomInt } from 'node:crypto';
import type { Players } from './Players';

export const GAMBLE_RANGES = [
    { max: 5, multiplier: 3 },
    { max: 10, multiplier: 6 },
    { max: 100, multiplier: 16 },
    { max: 1000, multiplier: 50 },
] as const;

export interface GambleResult {
    bet: number;
    draw: number;
    range: number;
    stake: number;
    multiplier: number;
    payout: number;
    won: boolean;
    balance: number;
}

/** Deduct the stake and settle the draw synchronously in the single bot process. */
export function gamble(
    players: Players,
    userId: string,
    stake: number,
    range: number,
    bet?: number,
    drawNumber: (exclusiveMax: number) => number = randomInt,
): GambleResult {
    const player = players.get(userId);
    if (!Number.isInteger(stake) || stake < 1 || stake > 100) {
        throw new Error('Choose a whole coin amount between 1 and 100.');
    }
    const selectedRange = GAMBLE_RANGES.find(option => option.max === range);
    if (!selectedRange) {
        throw new Error('Choose one of these ranges: 0–5, 0–10, 0–100, or 0–1000.');
    }
    if (bet !== undefined && (!Number.isInteger(bet) || bet < 0 || bet > range)) {
        throw new Error(`Your bet must be a whole number from 0 to ${range}.`);
    }
    if (player.coins < stake) {
        throw new Error(`You only have ${player.coins} coins. Choose a smaller stake.`);
    }

    const chosenBet = bet ?? drawNumber(range + 1);
    const draw = drawNumber(range + 1);
    const won = chosenBet === draw;
    // Payout includes the original stake; net profit is payout minus stake.
    const multiplier = selectedRange.multiplier;
    const payout = won ? stake * multiplier : 0;
    const balance = player.coins - stake + payout;
    if (!Number.isSafeInteger(balance)) {
        throw new Error('This game would exceed the maximum supported balance.');
    }
    players.update(userId, { coins: balance });
    return { bet: chosenBet, draw, range, stake, multiplier, payout, won, balance };
}
