import { PermissionsBitField, ChannelType, MessageFlags } from "discord.js";
import DiscordBot = require("../DiscordBot");
import config = require("../../config");
import MessageCommand = require("../../structure/MessageCommand");
import { handleMessageCommandOptions, handleApplicationCommandOptions } from "./CommandOptions";
import ApplicationCommand = require("../../structure/ApplicationCommand");
import { error } from "../../utils/Console";

class CommandsListener {
    constructor(client: DiscordBot) {
        client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.inGuild()) return;

            if (!config.commands.message_commands) return;

            let prefix = config.commands.prefix;

            if (client.database.has('prefix-' + message.guild.id)) {
                prefix = String(client.database.get('prefix-' + message.guild.id));
            }

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/\s+/g);
            const commandInput = (args.shift() ?? "").toLowerCase();

            if (!commandInput.length) return;

            const command =
                client.collection.message_commands.get(commandInput) ||
                client.collection.message_commands.get(client.collection.message_commands_aliases.get(commandInput) ?? "");

            if (!command) return;

            try {
                if (command.options) {
                    const commandContinue = await handleMessageCommandOptions(message, command.options, command.command);

                    if (!commandContinue) return;
                }

                if (command.command?.permissions && !message.member?.permissions.has(PermissionsBitField.resolve(command.command.permissions))) {
                    await message.reply({
                        content: config.messages.MISSING_PERMISSIONS
                    });

                    return;
                }

                await command.run(client, message, args);
            } catch (err) {
                error(err);
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand() && !interaction.isMessageContextMenuCommand()) return;

            if (!config.commands.application_commands.chat_input && interaction.isChatInputCommand()) return;
            if (!config.commands.application_commands.user_context && interaction.isUserContextMenuCommand()) return;
            if (!config.commands.application_commands.message_context && interaction.isMessageContextMenuCommand()) return;

            const command = client.collection.application_commands.get(interaction.commandName);

            if (!command) return;

            try {
                if (command.options) {
                    const commandContinue = await handleApplicationCommandOptions(interaction, command.options, command.command);

                    if (!commandContinue) return;
                }

                await command.run(client, interaction);
            } catch (err) {
                error(err);
            }
        });
    }
}

export = CommandsListener;