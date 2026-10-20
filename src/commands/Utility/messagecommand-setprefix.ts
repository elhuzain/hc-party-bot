import { Message } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import MessageCommand = require("../../structure/MessageCommand");
import config = require("../../config");

export = new MessageCommand({
    command: {
        name: 'setprefix',
        description: 'Set prefix for this guild.',
        aliases: []
    },
    options: {
        cooldown: 5000
    },
    run: async (client: DiscordBot, message: Message<true>, args: string[]): Promise<void> => {
        if (!args[0]) {
            await message.reply({
                content: 'You must provide the prefix!'
            });

            return;
        }

        if (args[0].length > 5) {
            await message.reply({
                content: 'The prefix is too long! (' + args[0].length + ' > 5)'
            });

            return;
        }

        if (args[0] === config.commands.prefix) {
            client.database.delete('prefix-' + message.guild.id);
        } else {
            client.database.set('prefix-' + message.guild.id, args[0]);
        }

        await message.reply({
            content: 'Successfully updated the prefix to \`' + args[0] + '\`.'
        });
    }
}).toJSON();