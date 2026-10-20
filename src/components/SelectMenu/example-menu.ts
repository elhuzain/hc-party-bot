import DiscordBot = require("../../client/DiscordBot");
import Component = require("../../structure/Component");
import { MessageFlags } from "discord.js";

export = new Component<import("discord.js").AnySelectMenuInteraction>({
    customId: 'example-menu-id',
    type: 'select',
    run: async (client, interaction) => {

        await interaction.reply({
            content: 'Replied from a Select Menu interaction! (You selected **' + interaction.values[0] + '**).',
            flags: MessageFlags.Ephemeral
        });

    }
}).toJSON();