import type { Client } from "discord.js";
import type DiscordBot from "../../client/DiscordBot";
import { success } from "../../utils/Console";
import Event = require("../../structure/Event");

export = new Event({
    event: 'clientReady',
    once: true,
    run: (__client__: DiscordBot, client: Client<true>): void => {
        success('Logged in as ' + client.user.displayName + ', took ' + ((Date.now() - __client__.login_timestamp) / 1000) + "s.")
    }
}).toJSON();