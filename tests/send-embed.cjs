const assert = require('node:assert/strict');
const { MessageFlags } = require('discord.js');
const command = require('../dist/commands/Utility/slashcommand-send-embed');

async function run(values) {
    const replies = [];
    await command.run({}, {
        options: { getString: name => values[name] ?? null },
        reply: async payload => { replies.push(payload); },
    });
    assert.equal(replies.length, 1);
    return replies[0];
}

(async () => {
    assert.equal(command.command.name, 'send-embed');
    assert.ok(command.command.options.length <= 25);
    const reply = await run({
        title: 'Title', description: 'Description', url: 'https://example.com',
        color: '#5865F2', 'author-name': 'Author', 'author-url': 'https://example.com/author',
        'author-icon': 'https://example.com/author.png', 'footer-text': 'Footer',
        'footer-icon': 'https://example.com/footer.png', image: 'https://example.com/image.png',
        thumbnail: 'https://example.com/thumb.png', timestamp: '2026-10-21T12:00:00Z',
        fields: JSON.stringify([{ name: 'Label', value: 'Value', inline: true }]),
    });
    const embed = reply.embeds[0].toJSON();
    assert.equal(embed.title, 'Title');
    assert.equal(embed.description, 'Description');
    assert.equal(embed.url, 'https://example.com/');
    assert.equal(embed.color, 0x5865F2);
    assert.equal(embed.author.name, 'Author');
    assert.equal(embed.author.url, 'https://example.com/author');
    assert.equal(embed.author.icon_url, 'https://example.com/author.png');
    assert.equal(embed.footer.text, 'Footer');
    assert.equal(embed.footer.icon_url, 'https://example.com/footer.png');
    assert.equal(embed.image.url, 'https://example.com/image.png');
    assert.equal(embed.thumbnail.url, 'https://example.com/thumb.png');
    assert.equal(embed.timestamp, '2026-10-21T12:00:00.000Z');
    assert.deepEqual(embed.fields, [{ name: 'Label', value: 'Value', inline: true }]);
    assert.equal(reply.flags, undefined);
    assert.ok((await run({ title: 'Now', timestamp: 'now' })).embeds[0].data.timestamp);
    for (const values of [
        {}, { title: 'X', color: 'invalid' }, { title: 'X', image: 'javascript:alert(1)' },
        { title: 'X', fields: 'invalid JSON' }, { fields: '{}' },
        { fields: JSON.stringify([{ name: 'X', value: 'Y', inline: 'yes' }]) },
        { fields: JSON.stringify(Array.from({ length: 26 }, () => ({ name: 'X', value: 'Y' }))) },
        { title: 'X', timestamp: 'tomorrow' }, { 'author-icon': 'https://example.com/x' },
        { 'footer-icon': 'https://example.com/x' }, { url: 'https://example.com' },
        { title: 'X'.repeat(256), description: 'X'.repeat(4096), 'footer-text': 'X'.repeat(2048) },
    ]) {
        const invalid = await run(values);
        assert.equal(invalid.flags, MessageFlags.Ephemeral);
        assert.equal(invalid.embeds, undefined);
    }
    console.log('send-embed: complete payload, timestamp, and invalid-input checks passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
