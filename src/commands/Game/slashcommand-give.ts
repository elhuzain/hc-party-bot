import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');

const command = new SlashCommandBuilder()
    .setName('give')
    .setDescription('Send coins from your balance to another user.')
    .addUserOption(option => option
        .setName('user').setDescription('User to receive the coins.').setRequired(true))
    .addIntegerOption(option => option
        .setName('amount').setDescription('Positive whole number of coins to send.')
        .setRequired(true).setMinValue(1).setMaxValue(Number.MAX_SAFE_INTEGER));

export = new ApplicationCommand({
    command: command.toJSON(),
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        const recipient = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        // Acknowledge before transferring coins so expired interactions cannot charge users.
        await interaction.deferReply();
        let result: ReturnType<DiscordBot['players']['transferCoins']>;
        try {
            result = client.players.transferCoins(interaction.user.id, recipient.id, amount);
        } catch (err) {
            await interaction.deleteReply();
            await interaction.followUp({
                content: err instanceof Error ? err.message : 'Unable to transfer coins.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        await interaction.editReply({
            content: `You sent ${amount} coins to <@${recipient.id}>. Your balance: ${result.sender.coins} coins.`,
            allowedMentions: { parse: [] },
        });
    },
}).toJSON();
