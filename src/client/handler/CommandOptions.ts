import { Message, MessageFlags } from "discord.js";
import MessageCommand = require("../../structure/MessageCommand");
import ApplicationCommand = require("../../structure/ApplicationCommand");
import config = require("../../config");

const application_commands_cooldown = new Map<string, string[]>();
const message_commands_cooldown = new Map<string, string[]>();

const handleApplicationCommandOptions = async (interaction: import('discord.js').ChatInputCommandInteraction | import('discord.js').ContextMenuCommandInteraction, options: NonNullable<ApplicationCommand['data']['options']>, command: ApplicationCommand['data']['command']) => {
    if (options.botOwner) {
        if (interaction.user.id !== config.users.ownerId) {
            await interaction.reply({
                content: config.messages.NOT_BOT_OWNER,
                flags: MessageFlags.Ephemeral
            });

            return false;
        }
    }

    if (options.botDevelopers) {
        if (config.users?.developers?.length > 0 && !config.users?.developers?.includes(interaction.user.id)) {
            await interaction.reply({
                content: config.messages.NOT_BOT_DEVELOPER,
                flags: MessageFlags.Ephemeral
            });

            return false;
        }
    }

    if (options.guildOwner) {
        if (interaction.user.id !== interaction.guild?.ownerId) {
            await interaction.reply({
                content: config.messages.NOT_GUILD_OWNER,
                flags: MessageFlags.Ephemeral
            });

            return false;
        }
    }

    if (options.cooldown) {
        const cooldownFunction = () => {
            let data = application_commands_cooldown.get(interaction.user.id) ?? [];

            data.push(interaction.commandName);

            application_commands_cooldown.set(interaction.user.id, data);

            setTimeout(() => {
                let data = application_commands_cooldown.get(interaction.user.id) ?? [];

                data = data.filter((v) => v !== interaction.commandName);

                if (data.length <= 0) {
                    application_commands_cooldown.delete(interaction.user.id);
                } else {
                    application_commands_cooldown.set(interaction.user.id, data);
                }
            }, options.cooldown);
        }

        if (application_commands_cooldown.has(interaction.user.id)) {
            let data = application_commands_cooldown.get(interaction.user.id) ?? [];

            if (data.some((cmd) => cmd === interaction.commandName)) {
                await interaction.reply({
                    content: config.messages.GUILD_COOLDOWN.replace(/%cooldown%/g, String(options.cooldown / 1000)),
                    flags: MessageFlags.Ephemeral
                });

                return false;
            } else {
                cooldownFunction();
            }
        } else {
            application_commands_cooldown.set(interaction.user.id, [interaction.commandName]);
            cooldownFunction();
        }
    }

    return true;
}

const handleMessageCommandOptions = async (message: Message<true>, options: NonNullable<MessageCommand['data']['options']>, command: MessageCommand['data']['command']) => {
    if (options.botOwner) {
        if (message.author.id !== config.users.ownerId) {
            await message.reply({
                content: config.messages.NOT_BOT_OWNER
            });

            return false;
        }
    }

    if (options.botDevelopers) {
        if (config.users?.developers?.length > 0 && !config.users?.developers?.includes(message.author.id)) {
            await message.reply({
                content: config.messages.NOT_BOT_DEVELOPER
            });

            return false;
        }
    }

    if (options.guildOwner) {
        if (message.author.id !== message.guild.ownerId) {
            await message.reply({
                content: config.messages.NOT_GUILD_OWNER
            });

            return false;
        }
    }

    if (options.nsfw) {
        if ((!('nsfw' in message.channel) || !message.channel.nsfw)) {
            await message.reply({
                content: config.messages.CHANNEL_NOT_NSFW
            });

            return false;
        }
    }

    if (options.cooldown) {
        const cooldownFunction = () => {
            let data = message_commands_cooldown.get(message.author.id) ?? [];

            data.push(command.name);

            message_commands_cooldown.set(message.author.id, data);

            setTimeout(() => {
                let data = message_commands_cooldown.get(message.author.id) ?? [];

                data = data.filter((cmd) => cmd !== command.name);

                if (data.length <= 0) {
                    message_commands_cooldown.delete(message.author.id);
                } else {
                    message_commands_cooldown.set(message.author.id, data);
                }
            }, options.cooldown);
        }

        if (message_commands_cooldown.has(message.author.id)) {
            let data = message_commands_cooldown.get(message.author.id) ?? [];

            if (data.some((v) => v === command.name)) {
                await message.reply({
                    content: config.messages.GUILD_COOLDOWN.replace(/%cooldown%/g, String(options.cooldown / 1000))
                });

                return false;
            } else {
                cooldownFunction();
            }
        } else {
            message_commands_cooldown.set(message.author.id, [command.name]);
            cooldownFunction();
        }
    }

    return true;
}

export { handleApplicationCommandOptions, handleMessageCommandOptions }