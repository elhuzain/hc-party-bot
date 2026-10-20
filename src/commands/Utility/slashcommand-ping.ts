import { ChatInputCommandInteraction } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand({
    command: {
        name: 'ping',
        description: 'Replies with Pong!',
        type: 1,
        options: []
    },
    options: {
        cooldown: 5000
    },
    run: async (client, interaction) => {
        await interaction.reply({
            content: '**Pong!** ' + client.ws.ping + 'ms'
        });
    }
}).toJSON();