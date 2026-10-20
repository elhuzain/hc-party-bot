import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type DiscordBot from '../client/DiscordBot';
import ApplicationCommand = require('../structure/ApplicationCommand');

export function createAdminCoinsCommand(action: 'add' | 'remove'): ApplicationCommand['data'] {
    const command = new SlashCommandBuilder()
        .setName(action + '-coins')
        .setDescription(action === 'add' ? 'Add coins to a user’s balance.' : 'Remove coins from a user’s balance.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addUserOption(option => option.setName('user').setDescription('User whose balance to change.').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Positive whole number of coins.')
            .setRequired(true).setMinValue(1).setMaxValue(Number.MAX_SAFE_INTEGER));

    return new ApplicationCommand({
        command: command.toJSON(),
        run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
            if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: 'Only server administrators can use this command.', flags: MessageFlags.Ephemeral });
                return;
            }

            await interaction.deferReply();
            const user = interaction.options.getUser('user', true);
            const amount = interaction.options.getInteger('amount', true);
            let content: string;
            try {
                const player = client.players.changeCoins(user.id, amount, action);
                content = action === 'add'
                    ? `Added ${amount} coins to <@${user.id}>. Balance: ${player.coins} coins.`
                    : `Removed ${amount} coins from <@${user.id}>. Balance: ${player.coins} coins.`;
            } catch (err) {
                content = err instanceof Error ? err.message : 'Unable to update the balance.';
            }
            await interaction.editReply({ content, allowedMentions: { parse: [] } });
        },
    }).toJSON();
}
