const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { openDatabase } = require('../dist/utils/Database');
const { Players } = require('../dist/game/Players');
const { gamble, GAMBLE_RANGES } = require('../dist/game/Gamble');
const players = new Players(openDatabase(join(mkdtempSync('/tmp/hc-gamble-'), 'db.yml')));
assert.deepEqual(GAMBLE_RANGES, [
    { max: 5, multiplier: 2 }, { max: 10, multiplier: 5 },
    { max: 100, multiplier: 16 }, { max: 1000, multiplier: 50 },
]);
for (const { max: range, multiplier } of GAMBLE_RANGES) {
    const id = String(range);
    const win = gamble(players, id, 10, range, range, max => {
        assert.equal(max, range + 1);
        return range;
    });
    assert.equal(win.won, true);
    assert.equal(win.payout, 10 * multiplier);
    assert.equal(win.balance, 90 + 10 * multiplier);
    assert.equal(players.get(id).lastDailyClaim, 0);
}
const zero = gamble(players, '1', 100, 10, 0, () => 0);
assert.equal(zero.bet, 0);
assert.equal(zero.won, true);
const loss = gamble(players, '2', 100, 10, 0, () => 10);
assert.equal(loss.balance, 0);
assert.equal(loss.payout, 0);
assert.throws(() => gamble(players, '2', 1, 10, 0));
assert.equal(players.get('2').coins, 0);
let calls = 0;
const random = gamble(players, '3', 1, 100, undefined, max => {
    assert.equal(max, 101);
    return ++calls === 1 ? 12 : 13;
});
assert.equal(calls, 2);
assert.equal(random.bet, 12);
assert.equal(random.draw, 13);
assert.equal(random.balance, 99);
for (const args of [[0, 10], [101, 10], [1.5, 10], [1, 20], [1, 50], [1, 10, 11], [1, 10, -1], [1, 10, 0.5]]) {
    const before = players.get('4');
    assert.throws(() => gamble(players, '4', ...args));
    assert.deepEqual(players.get('4'), before);
}
players.update('5', { coins: Number.MAX_SAFE_INTEGER });
assert.throws(() => gamble(players, '5', 100, 1000, 0, () => 0));
assert.equal(players.get('5').coins, Number.MAX_SAFE_INTEGER);
console.log('Gamble: all ranges, inclusive boundaries, win/loss, random bet, validation, insufficient funds, and overflow passed.');
