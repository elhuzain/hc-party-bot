import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand({
    command: {
        name: 'show-modal',
        description: '[TESTING COMMAND] Opens a modal.',
        type: 1,
        options: []
    },
    options: {
        botDevelopers: true
    },
    run: async (client: DiscordBot, interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.showModal(
            {
                custom_id: 'example-modal-id',
                title: 'Example Modal',
                components: [{
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'example-modal-id-field-1',
                        label: 'What is your Discord username?',
                        max_length: 15,
                        min_length: 2,
                        placeholder: 'Enter your username here!',
                        style: 1,
                        required: true
                    }]
                }]
            }
        )
    }
}).toJSON();