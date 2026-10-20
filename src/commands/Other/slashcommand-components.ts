import { ChatInputCommandInteraction } from "discord.js";
import DiscordBot = require("../../client/DiscordBot");
import ApplicationCommand = require("../../structure/ApplicationCommand");

export = new ApplicationCommand({
    command: {
        name: 'components',
        description: '[TESTING COMMAND] Replies with an example of components to test.',
        type: 1,
        options: []
    },
    options: {
        botDevelopers: true
    },
    run: async (client, interaction) => {
        await interaction.reply({
            content: `Click on the Button and select an option from the Select Menu below.`,
            components: [
                {
                    type: 1,
                    components: [{
                        type: 2, // Button
                        custom_id: 'example-button-id',
                        label: 'Example Button',
                        style: 1
                    }]
                },
                {
                    type: 1,
                    components: [{
                        type: 3, // String Select Menu
                        custom_id: 'example-menu-id',
                        placeholder: 'Click here to choose an option',
                        options: [
                            { label: 'Banana', value: 'option-banana' },
                            { label: 'Orange', value: 'option-orange' },
                            { label: 'Apple', value: 'option-apple' },
                        ]
                    }]
                },
            ]
        });
    }
}).toJSON();