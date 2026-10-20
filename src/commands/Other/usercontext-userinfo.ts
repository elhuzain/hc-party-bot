import { UserContextMenuCommandInteraction, MessageFlags } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand<UserContextMenuCommandInteraction>({
    command: {
        name: 'User Information',
        type: 2,
    },
    options: {
        cooldown: 5000
    },
    run: async (client, interaction) => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: 'This command requires a server.', flags: MessageFlags.Ephemeral });
            return;
        }
        const target = interaction.targetMember;

        if (!target) {
            await interaction.reply({
                content: `Invalid target!`
            });

            return;
        }
        
        const array = [
            `**Displayname:** ${target.user.displayName}`,
            `**Bot?** ${target.user.bot ? 'Yes' : 'No'}`,
            `**Guild Owner?** ${target.user.id == target.guild.ownerId ? 'Yes' : 'No'}`,
        ];

        await interaction.reply({
            content: array.join('\n'),
            flags: MessageFlags.Ephemeral
        });
    }
}).toJSON();