import { ModalSubmitInteraction, MessageFlags } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import Component = require("../../structure/Component");

export = new Component<ModalSubmitInteraction>({
    customId: 'example-modal-id',
    type: 'modal',
    run: async (client: DiscordBot, interaction: ModalSubmitInteraction): Promise<void> => {

        const field = interaction.fields.getTextInputValue('example-modal-id-field-1');

        await interaction.reply({
            content: 'Hello **' + field + '**.',
            flags: MessageFlags.Ephemeral
        });

    }
}).toJSON();