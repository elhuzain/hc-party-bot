import { ChatInputCommandInteraction } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand({
    command: {
        name: 'help',
        description: 'Replies with a list of available application commands.',
        type: 1,
        options: []
    },
    options: {
        cooldown: 10000
    },
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.reply({
            content: `${client.collection.application_commands.map((cmd) => '\`/' + cmd.command.name + '\`').join(', ')}`
        });
    }
}).toJSON();