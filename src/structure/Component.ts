import type DiscordBot from '../client/DiscordBot';
import type * as D from 'discord.js';

type Interaction = D.ButtonInteraction | D.AnySelectMenuInteraction | D.ModalSubmitInteraction;
interface Structure<I extends Interaction> {
    customId: string;
    type: 'modal' | 'select' | 'button';
    options?: { public?: boolean };
    run: (client: DiscordBot, interaction: I) => D.Awaitable<void>;
}
class Component<I extends Interaction = Interaction> {
    data: Structure<I> & { __type__: 3 };
    constructor(structure: Structure<I>) { this.data = { __type__: 3, ...structure }; }
    toJSON() { return { ...this.data }; }
}
export = Component;
