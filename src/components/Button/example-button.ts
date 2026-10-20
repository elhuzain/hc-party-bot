import { ButtonInteraction, MessageFlags } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import Component = require("../../structure/Component");

export = new Component<ButtonInteraction>({
    customId: 'example-button-id',
    type: 'button',
    run: async (client: DiscordBot, interaction: ButtonInteraction): Promise<void> => {

        await interaction.reply({
            content: 'Replied from a Button interaction!',
            flags: MessageFlags.Ephemeral
        });

    }
}).toJSON();