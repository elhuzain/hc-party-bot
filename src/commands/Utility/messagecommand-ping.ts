import { Message } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import MessageCommand = require("../../structure/MessageCommand");

export = new MessageCommand({
    command: {
        name: 'ping',
        description: 'Replies with Pong!',
        aliases: ['p'],
        permissions: ['SendMessages']
    },
    options: {
        cooldown: 5000
    },
    run: async (client, message, args) => {
        await message.reply({
            content: '**Pong!** ' + client.ws.ping + 'ms'
        });
    }
}).toJSON();