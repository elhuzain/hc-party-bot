import { ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");
import config = require("../../config");

export = new ApplicationCommand({
    command: {
        name: 'reload',
        description: 'Reload every command.',
        type: 1,
        options: []
    },
    options: {
        botDevelopers: true
    },
    run: async (client, interaction) => {
        await interaction.deferReply();

        try {
            client.commands_handler.reload();

            await client.commands_handler.registerApplicationCommands(config.development);

            await interaction.editReply({
                content: 'Successfully reloaded application commands and message commands.'
            });
        } catch (err) {
            await interaction.editReply({
                content: 'Something went wrong.',
                files: [
                    new AttachmentBuilder(Buffer.from(`${err}`, 'utf-8'), { name: 'output.ts' })
                ]
            });
        };
    }
}).toJSON();