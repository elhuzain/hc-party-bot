import { Message } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import MessageCommand = require("../../structure/MessageCommand");
import config = require("../../config");

export = new MessageCommand({
    command: {
        name: 'help',
        description: 'Replies with a list of available message commands.',
        aliases: ['h']
    },
    options: {
        cooldown: 10000
    },
    run: async (client, message, args) => {
        await message.reply({
            content: `${client.collection.message_commands.map((cmd) => '\`' + client.database.ensure('prefix-' + message.guild.id, config.commands.prefix) + cmd.command.name + '\`').join(', ')}`
        });
    }
}).toJSON();