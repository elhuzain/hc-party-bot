import { success } from "../../utils/Console";
import Event = require("../../structure/Event");

export = new Event({
    event: 'clientReady',
    once: true,
    run: (__client__, client) => {
        success('Logged in as ' + client.user.displayName + ', took ' + ((Date.now() - __client__.login_timestamp) / 1000) + "s.")
    }
}).toJSON();