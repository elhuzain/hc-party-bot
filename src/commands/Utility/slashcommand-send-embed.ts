import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
    type APIEmbedField,
} from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');

const command = new SlashCommandBuilder()
    .setName('send-embed')
    .setDescription('Send a custom embed in this channel.')
    .addStringOption(option => option.setName('title').setDescription('Embed title.').setMaxLength(256))
    .addStringOption(option => option.setName('description').setDescription('Embed description.').setMaxLength(4096))
    .addStringOption(option => option.setName('url').setDescription('HTTP(S) link opened by clicking the title.'))
    .addStringOption(option => option.setName('color').setDescription('Six-digit hex color, for example #5865F2.'))
    .addStringOption(option => option.setName('author-name').setDescription('Author name.').setMaxLength(256))
    .addStringOption(option => option.setName('author-url').setDescription('HTTP(S) author link; requires author-name.'))
    .addStringOption(option => option.setName('author-icon').setDescription('HTTP(S) author icon URL; requires author-name.'))
    .addStringOption(option => option.setName('footer-text').setDescription('Footer text.').setMaxLength(2048))
    .addStringOption(option => option.setName('footer-icon').setDescription('HTTP(S) footer icon URL; requires footer-text.'))
    .addStringOption(option => option.setName('image').setDescription('HTTP(S) image URL.'))
    .addStringOption(option => option.setName('thumbnail').setDescription('HTTP(S) thumbnail URL.'))
    .addStringOption(option => option.setName('timestamp').setDescription('ISO 8601 date/time with timezone, or "now".'))
    .addStringOption(option => option.setName('fields')
        .setDescription('JSON array: [{"name":"Label","value":"Text","inline":true}] (up to 25 fields).')
        .setMaxLength(6000));

function parseFields(input: string): APIEmbedField[] {
    let fields: unknown;
    try {
        fields = JSON.parse(input);
    } catch {
        throw new Error('fields must be a valid JSON array, for example [{"name":"Label","value":"Text","inline":true}].');
    }
    if (!Array.isArray(fields) || fields.length > 25) {
        throw new Error('fields must be an array containing at most 25 fields.');
    }
    return fields.map((field: unknown): APIEmbedField => {
        if (typeof field !== 'object' || field === null ||
            !('name' in field) || typeof field.name !== 'string' || !field.name.trim() || field.name.length > 256 ||
            !('value' in field) || typeof field.value !== 'string' || !field.value.trim() || field.value.length > 1024 ||
            ('inline' in field && typeof field.inline !== 'boolean')) {
            throw new Error('Each field needs a name (1–256 characters), value (1–1024 characters), and optional inline boolean.');
        }
        return { name: field.name, value: field.value, ...('inline' in field ? { inline: field.inline as boolean } : {}) };
    });
}

export = new ApplicationCommand({
    command: command.toJSON(),
    run: async (_client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        let embed: EmbedBuilder;
        try {
            const options = interaction.options;
            const url = (name: string): string | undefined => {
                const value = options.getString(name);
                if (value === null) return undefined;
                let parsed: URL;
                try {
                    parsed = new URL(value);
                } catch {
                    throw new Error(name + ' must be a valid HTTP(S) URL.');
                }
                if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
                    throw new Error(name + ' must use HTTP or HTTPS.');
                }
                return parsed.href;
            };

            embed = new EmbedBuilder();
            const title = options.getString('title');
            const description = options.getString('description');
            const link = url('url');
            const color = options.getString('color');
            const authorName = options.getString('author-name');
            const authorURL = url('author-url');
            const authorIcon = url('author-icon');
            const footerText = options.getString('footer-text');
            const footerIcon = url('footer-icon');
            const image = url('image');
            const thumbnail = url('thumbnail');
            const timestamp = options.getString('timestamp');
            const fields = options.getString('fields');

            if ((authorURL || authorIcon) && !authorName) throw new Error('author-url and author-icon require author-name.');
            if (footerIcon && !footerText) throw new Error('footer-icon requires footer-text.');
            if (link && !title) throw new Error('url requires a title.');

            if (title !== null) embed.setTitle(title);
            if (description !== null) embed.setDescription(description);
            if (link) embed.setURL(link);
            if (color !== null) {
                if (!/^#?[0-9a-f]{6}$/i.test(color)) throw new Error('color must be six hex digits, for example #5865F2.');
                embed.setColor(parseInt(color.replace(/^#/, ''), 16));
            }
            if (authorName !== null) embed.setAuthor({ name: authorName, url: authorURL, iconURL: authorIcon });
            if (footerText !== null) embed.setFooter({ text: footerText, iconURL: footerIcon });
            if (image) embed.setImage(image);
            if (thumbnail) embed.setThumbnail(thumbnail);
            if (fields !== null) embed.addFields(parseFields(fields));
            if (timestamp !== null) {
                if (timestamp.toLowerCase() === 'now') {
                    embed.setTimestamp();
                } else {
                    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp) ||
                        !Number.isFinite(Date.parse(timestamp))) {
                        throw new Error('timestamp must be "now" or an ISO 8601 date/time, for example 2026-10-21T12:00:00Z.');
                    }
                    embed.setTimestamp(new Date(timestamp));
                }
            }
            if (embed.length > 6000) throw new Error('The combined embed text must not exceed 6000 characters.');
            if (!title?.trim() && !description?.trim() && !authorName?.trim() && !footerText?.trim() &&
                !embed.data.fields?.length && !image && !thumbnail) {
                throw new Error('Provide some embed text, fields, an image, or a thumbnail.');
            }
            // Validate locally so invalid input can be reported privately.
            embed.toJSON();
        } catch (err) {
            await interaction.reply({
                content: err instanceof Error ? err.message : 'Invalid embed options.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] } });
    },
}).toJSON();
