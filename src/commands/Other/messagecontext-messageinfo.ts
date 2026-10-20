import { MessageContextMenuCommandInteraction, MessageFlags } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand({
    command: {
        name: 'Message Information',
        type: 3,
    },
    options: {
        cooldown: 5000
    },
    run: async (client: DiscordBot, interaction: MessageContextMenuCommandInteraction): Promise<void> => {
        const target = interaction.targetMessage;

        if (!target) {
            await interaction.reply({
                content: `Invalid target!`
            });

            return;
        }

        const array = [
            `**Author:** ${target.author.toString()}`,
            `**Content:** ${target.content}`,
            `**Has attachments?** ${target.attachments.size > 0 ? 'Yes' : 'No'}`,
        ];

        await interaction.reply({
            content: array.join('\n'),
            flags: MessageFlags.Ephemeral
        });
    }
}).toJSON();