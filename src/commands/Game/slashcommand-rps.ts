import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import DiscordBot = require('../../client/DiscordBot');
import ApplicationCommand = require('../../structure/ApplicationCommand');
import { rps, RPS_CHOICES } from '../../game/Rps';

export = new ApplicationCommand({
    command: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Rock, paper, scissors! Win 10 coins, lose 5 coins, or draw for no change.')
        .addStringOption(option => option
            .setName('bet')
            .setDescription('Your choice. You need at least 5 coins to play.')
            .setRequired(true)
            .addChoices(...RPS_CHOICES.map(choice => ({ name: choice, value: choice }))))
        .toJSON(),
    options: { cooldown: 5000 },
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();
        let result: ReturnType<typeof rps>;
        try {
            result = rps(client.players, interaction.user.id, interaction.options.getString('bet', true));
        } catch (err) {
            await interaction.deleteReply();
            await interaction.followUp({
                content: err instanceof Error ? err.message : 'Unable to complete this game.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }
        const message = result.outcome === 'win' ? 'You won 10 coins!'
            : result.outcome === 'loss' ? 'You lost 5 coins.' : 'It’s a draw! No coins changed.';
        await interaction.editReply({
            content: `You chose **${result.bet}**. I chose **${result.botChoice}**.\n${message}\nYour balance: ${result.balance} coins.`,
            allowedMentions: { parse: [] },
        });
    },
}).toJSON();
