import DiscordBot = require("../DiscordBot");
import config = require("../../config");
import { error } from "../../utils/Console";
import { MessageFlags } from "discord.js";

class ComponentsListener {
    constructor(client: DiscordBot) {
        client.on('interactionCreate', async (interaction) => {
            const checkUserPermissions = async (component: { options?: { public?: boolean } }) => {
                if (component.options?.public === false && (!interaction.isMessageComponent() || interaction.user.id !== (interaction.message.interactionMetadata?.user.id ?? interaction.message.interaction?.user.id))) {
                    await (interaction as import("discord.js").MessageComponentInteraction).reply({
                        content: config.messages.COMPONENT_NOT_PUBLIC,
                        flags: MessageFlags.Ephemeral
                    });

                    return false;
                }

                return true;
            }

            try {
                if (interaction.isButton()) {
                    const component = client.collection.components.buttons.get(interaction.customId);

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    try {
                        await component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isAnySelectMenu()) {
                    const component = client.collection.components.selects.get(interaction.customId);

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    try {
                        await component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isModalSubmit()) {
                    const component = client.collection.components.modals.get(interaction.customId);

                    if (!component) return;

                    try {
                        await component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isAutocomplete()) {
                    const component = client.collection.components.autocomplete.get(interaction.commandName);

                    if (!component) return;

                    try {
                        await component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }
            } catch (err) {
                error(err);
            }
        });
    }
}

export = ComponentsListener;