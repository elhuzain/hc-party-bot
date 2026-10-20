import type { AutocompleteInteraction } from "discord.js";
import type DiscordBot from "../../client/DiscordBot";
import AutocompleteComponent = require("../../structure/AutocompleteComponent");

export = new AutocompleteComponent({
    commandName: 'autocomplete',
    run: async (client: DiscordBot, interaction: AutocompleteInteraction): Promise<void> => {
        const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];

        const currentInput = interaction.options.getFocused();
        const filteredFruits = fruits.filter(fruit => fruit.toLowerCase().startsWith(currentInput.toLowerCase()));

        await interaction.respond(filteredFruits.map(fruit => ({ name: fruit, value: fruit })));
    }
}).toJSON();