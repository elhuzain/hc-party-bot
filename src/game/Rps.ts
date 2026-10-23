import { randomInt } from 'node:crypto';
import type { Players } from './Players';

export const RPS_CHOICES = ['rock', 'paper', 'scissors'] as const;
export type RpsChoice = typeof RPS_CHOICES[number];
const beats: Record<RpsChoice, RpsChoice> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

/** Draw and settle synchronously so another game cannot spend the same balance. */
export function rps(
    players: Players,
    userId: string,
    bet: string,
    drawNumber: (exclusiveMax: number) => number = randomInt,
) {
    if (!RPS_CHOICES.includes(bet as RpsChoice)) {
        throw new Error('Choose rock, paper, or scissors.');
    }
    const player = players.get(userId);
    if (player.coins < 5) throw new Error('You need at least 5 coins to play.');
    const botChoice = RPS_CHOICES[drawNumber(RPS_CHOICES.length)];
    const outcome = bet === botChoice ? 'draw' : beats[bet as RpsChoice] === botChoice ? 'win' : 'loss';
    const change = outcome === 'win' ? 10 : outcome === 'loss' ? -5 : 0;
    const balance = player.coins + change;
    if (!Number.isSafeInteger(balance)) {
        throw new Error('This game would exceed the maximum supported balance.');
    }
    if (change !== 0) players.update(userId, { coins: balance });
    return { bet, botChoice, outcome, change, balance };
}
