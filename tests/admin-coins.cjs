const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { Players } = require('../dist/game/Players');
const { openDatabase } = require('../dist/utils/Database');
const add = require('../dist/commands/Game/slashcommand-add-coins');
const remove = require('../dist/commands/Game/slashcommand-remove-coins');
const players = new Players(openDatabase(join(mkdtempSync('/tmp/hc-admin-coins-'), 'db.yml')));

async function invoke(command, admin, amount, guild = true) {
    const responses = [];
    await command.run({ players }, {
        inGuild: () => guild,
        memberPermissions: { has: flag => admin && flag === PermissionFlagsBits.Administrator },
        options: { getUser: () => ({ id: '123' }), getInteger: () => amount },
        reply: async payload => responses.push(payload),
        deferReply: async () => {},
        editReply: async payload => responses.push(payload),
    });
    return responses[0];
}

(async () => {
    for (const command of [add, remove]) {
        assert.equal(command.command.default_member_permissions, String(PermissionFlagsBits.Administrator));
        assert.equal(command.command.dm_permission, false);
        assert.ok(command.command.options.every(option => option.required));
        await invoke(command, false, 10);
        await invoke(command, true, 10, false);
    }
    assert.equal(players.get('123').coins, 100);
    players.update('123', { lastDailyClaim: 123456 });
    await invoke(add, true, 50);
    assert.equal(players.get('123').coins, 150);
    await invoke(remove, true, 20);
    assert.deepEqual(players.get('123'), { coins: 130, lastDailyClaim: 123456 });
    const insufficient = await invoke(remove, true, 131);
    assert.match(insufficient.content, /No coins were removed/);
    assert.equal(players.get('123').coins, 130);
    for (const amount of [0, -1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        await invoke(add, true, amount);
        await invoke(remove, true, amount);
        assert.equal(players.get('123').coins, 130);
    }
    players.update('123', { coins: Number.MAX_SAFE_INTEGER });
    await invoke(add, true, 1);
    assert.equal(players.get('123').coins, Number.MAX_SAFE_INTEGER);
    await invoke(remove, true, Number.MAX_SAFE_INTEGER);
    assert.equal(players.get('123').coins, 0);
    console.log('Admin coin commands: permissions, amounts, balance updates, insufficient funds, and overflow passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
