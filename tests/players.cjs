const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { openDatabase } = require('../dist/utils/Database');
const { Players } = require('../dist/game/Players');

const file = join(mkdtempSync('/tmp/hc-players-'), 'database.yml');
const database = openDatabase(file);
const players = new Players(database);
assert.deepEqual(players.get('123'), { coins: 100, lastDailyClaim: 0 });
players.update('123', { coins: 100 });
players.update('123', { lastDailyClaim: 1792584000000 });
assert.deepEqual(new Players(openDatabase(file)).get('123'), {
    coins: 100, lastDailyClaim: 1792584000000,
});
assert.deepEqual(players.get('456'), { coins: 100, lastDailyClaim: 0 });
const before = readFileSync(file, 'utf8');
for (const changes of [
    { coins: -1 }, { coins: 0.5 }, { coins: Infinity },
    { coins: Number.MAX_SAFE_INTEGER + 1 }, { lastDailyClaim: -1 }, { lastDailyClaim: NaN },
]) assert.throws(() => players.update('123', changes));
assert.equal(readFileSync(file, 'utf8'), before);
assert.throws(() => players.get(''));
database.set('player-789', { coins: 'invalid', lastDailyClaim: 0 });
assert.throws(() => players.get('789'));
assert.equal(database.get('player-789').coins, 'invalid');
console.log('Player defaults, persistence, isolation, partial updates, and validation passed.');
