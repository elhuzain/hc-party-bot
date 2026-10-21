import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');
import { steal } from '../../game/Steal';

const command = new SlashCommandBuilder()
    .setName('steal')
    .setDescription('30% chance to steal 10–80% of someone’s coins. Failure costs 10 coins.')
    .setDMPermission(false)
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to steal coins from.')
        .setRequired(true));

export = new ApplicationCommand({
    command: command.toJSON(),
    options: { cooldown: 60000 },
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        const victim = interaction.options.getUser('user', true);
        if (victim.bot) {
            await interaction.reply({ content: 'You cannot steal from bots.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Acknowledge before moving coins so expired interactions cannot charge users.
        await interaction.deferReply();
        let result: ReturnType<typeof steal>;
        try {
            result = steal(client.players, interaction.user.id, victim.id);
        } catch (err) {
            await interaction.deleteReply();
            await interaction.followUp({
                content: err instanceof Error ? err.message : 'Unable to complete this attempt.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        const content = result.succeeded
            ? `You stole ${result.amount} coins (${result.percentage}%, rounded down) from <@${victim.id}>!`
            : `You were caught! You paid ${result.amount} coins to <@${victim.id}>.`;
        await interaction.editReply({
            content: `${content}\nYour balance: ${result.thiefBalance} coins. Their balance: ${result.victimBalance} coins.`,
            allowedMentions: { parse: [] },
        });
    },
}).toJSON();
