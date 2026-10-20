import type DiscordBot from '../client/DiscordBot';
import type * as D from 'discord.js';

interface Structure<K extends keyof D.ClientEvents> {
    event: K;
    once?: boolean;
    run: (client: DiscordBot, ...args: D.ClientEvents[K]) => D.Awaitable<void>;
}
class Event<K extends keyof D.ClientEvents = keyof D.ClientEvents> {
    data: Structure<K> & { __type__: 5 };
    constructor(structure: Structure<K>) { this.data = { __type__: 5, ...structure }; }
    toJSON() { return { ...this.data }; }
}
export = Event;
