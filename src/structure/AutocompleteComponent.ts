import type DiscordBot from '../client/DiscordBot';
import type * as D from 'discord.js';

interface Structure {
    commandName: string;
    run: (client: DiscordBot, interaction: D.AutocompleteInteraction) => D.Awaitable<void>;
}
class AutocompleteComponent {
    data: Structure & { __type__: 4 };
    constructor(structure: Structure) { this.data = { __type__: 4, ...structure }; }
    toJSON() { return { ...this.data }; }
}
export = AutocompleteComponent;
