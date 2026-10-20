import type DiscordBot from '../client/DiscordBot';
import type * as D from 'discord.js';
interface CommandOptions { cooldown?: number; botOwner?: boolean; guildOwner?: boolean; botDevelopers?: boolean; nsfw?: boolean }

interface Structure {
    command: { name: string; description?: string; aliases?: string[]; permissions?: D.PermissionResolvable[] };
    options?: CommandOptions;
    run: (client: DiscordBot, message: D.Message<true>, args: string[]) => D.Awaitable<void>;
}
class MessageCommand {
    data: Structure & { __type__: 2 };
    constructor(structure: Structure) { this.data = { __type__: 2, ...structure }; }
    toJSON() { return { ...this.data }; }
}
export = MessageCommand;
