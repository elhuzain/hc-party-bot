import type DiscordBot from '../client/DiscordBot';
import type * as D from 'discord.js';

type Interaction = D.ChatInputCommandInteraction | D.UserContextMenuCommandInteraction | D.MessageContextMenuCommandInteraction;
interface Options { cooldown?: number; botOwner?: boolean; guildOwner?: boolean; botDevelopers?: boolean }
interface Structure<I extends Interaction> {
    command: D.RESTPostAPIApplicationCommandsJSONBody;
    options?: Options;
    run: (client: DiscordBot, interaction: I) => D.Awaitable<void>;
}
class ApplicationCommand<I extends Interaction = D.ChatInputCommandInteraction> {
    data: Structure<I> & { __type__: 1 };
    constructor(structure: Structure<I>) { this.data = { __type__: 1, ...structure }; }
    toJSON() { return { ...this.data }; }
}
export = ApplicationCommand;
