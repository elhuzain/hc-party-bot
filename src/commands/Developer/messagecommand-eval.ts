import { AttachmentBuilder, Message } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import MessageCommand = require("../../structure/MessageCommand");

export = new MessageCommand({
    command: {
        name: 'eval',
        description: 'Execute a JavaScript code.',
        aliases: ['ev']
    },
    options: {
        botOwner: true
    },
    run: async (client: DiscordBot, message: Message<true>, args: string[]): Promise<void> => {
        if (!args[0]) {
            await message.reply({
                content: 'You must provide the code in order to execute it!'
            });

            return;
        }

        message = await message.reply({
            content: 'Please wait...'
        });

        const code = args.slice(0).join(' ');

        try {
            let result = eval(code);

            if (typeof result !== 'string') result = require('util').inspect(result);

            result = `${result}`.replace(new RegExp(client.token!, 'gi'), 'CLIENT_TOKEN'); // To avoid showing the client token to the public

            await message.edit({
                content: 'OK, no errors.',
                files: [
                    new AttachmentBuilder(Buffer.from(`${result}`, 'utf-8'), { name: 'output.ts' })
                ]
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