import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');
import { gamble, GAMBLE_RANGES } from '../../game/Gamble';

const command = new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Guess the drawn number. Exact matches win; larger ranges pay more.')
    .addIntegerOption(option => option
        .setName('coins')
        .setDescription('Coins to stake (1–100). A loss costs this amount.')
        .setRequired(true).setMinValue(1).setMaxValue(100))
    .addIntegerOption(option => option
        .setName('range')
        .setDescription('Inclusive range. Win payout includes your stake: ×2, ×5, ×16, or ×50.')
        .setRequired(true)
        .addChoices(...GAMBLE_RANGES.map(({ max, multiplier }) => ({ name: `0–${max} (×${multiplier} payout)`, value: max }))))
    .addIntegerOption(option => option
        .setName('bet')
        .setDescription('Number to guess within your range. Omit to choose randomly.')
        .setMinValue(0).setMaxValue(1000));

export = new ApplicationCommand({
    command: command.toJSON(),
    options: {
        cooldown: 5000,
    },
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        // Acknowledge before changing the balance so expired interactions cannot charge a stake.
        await interaction.deferReply();
        let result: ReturnType<typeof gamble>;
        try {
            result = gamble(
                client.players,
                interaction.user.id,
                interaction.options.getInteger('coins', true),
                interaction.options.getInteger('range', true),
                interaction.options.getInteger('bet') ?? undefined,
            );
        } catch (err) {
            await interaction.deleteReply();
            await interaction.followUp({
                content: err instanceof Error ? err.message : 'Unable to complete this game.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        const net = result.payout - result.stake;
        const embed = new EmbedBuilder()
            .setTitle(result.won ? 'You won!' : 'Better luck next time!')
            .setColor(result.won ? 0x57F287 : 0xED4245)
            .setDescription(`Exact-match draw from **0–${result.range}**. Winning payout: **×${result.multiplier}**, including the stake.`)
            .addFields(
                { name: 'Your bet', value: String(result.bet), inline: true },
                { name: 'Drawn number', value: String(result.draw), inline: true },
                { name: 'Stake', value: `${result.stake} coins`, inline: true },
                { name: 'Payout', value: `${result.payout} coins`, inline: true },
                { name: 'Net change', value: `${net > 0 ? '+' : ''}${net} coins`, inline: true },
                { name: 'Balance', value: `${result.balance} coins`, inline: true },
            );
        await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
    },
}).toJSON();
