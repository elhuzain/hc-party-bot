import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');
import { DAILY_REWARD } from '../../game/Players';

export = new ApplicationCommand({
    command: new SlashCommandBuilder()
        .setName('daily')
        .setDescription(`Claim ${DAILY_REWARD} coins once every 24 hours.`)
        .toJSON(),
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();
        let content: string;
        try {
            const result = client.players.claimDaily(interaction.user.id);
            const nextClaim = `<t:${Math.ceil(result.nextClaimAt / 1000)}:R>`;
            content = result.claimed
                ? `You claimed your daily ${DAILY_REWARD} coins! Your balance: ${result.player.coins} coins. You can claim again ${nextClaim}.`
                : `You already claimed your daily reward. You can claim again ${nextClaim}.`;
        } catch (err) {
            content = err instanceof Error ? err.message : 'Unable to claim your daily reward.';
        }
        await interaction.editReply({ content, allowedMentions: { parse: [] } });
    },
}).toJSON();
