import { AttachmentBuilder, Message } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import MessageCommand = require("../../structure/MessageCommand");
import config = require("../../config");

export = new MessageCommand({
    command: {
        name: 'reload',
        description: 'Reload every command.',
        aliases: []
    },
    options: {
        botDevelopers: true
    },
    run: async (client: DiscordBot, message: Message<true>, args: string[]): Promise<void> => {
        message = await message.reply({
            content: 'Please wait...'
        });

        try {
            client.commands_handler.reload();

            await client.commands_handler.registerApplicationCommands(config.development);

            await message.edit({
                content: 'Successfully reloaded application commands and message commands.'
            });
        } catch (err) {
            await message.edit({
                content: 'Something went wrong.',
                files: [
                    new AttachmentBuilder(Buffer.from(`${err}`, 'utf-8'), { name: 'output.ts' })
                ]
            });
        };
    }
}).toJSON();