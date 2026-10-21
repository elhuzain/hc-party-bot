import type { ActivityOptions, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import type ApplicationCommand from '../structure/ApplicationCommand';
import type MessageCommand from '../structure/MessageCommand';
import type Component from '../structure/Component';
import type AutocompleteComponent from '../structure/AutocompleteComponent';
import { Client, Collection, Partials } from "discord.js";
import CommandsHandler = require("./handler/CommandsHandler");
import { warn, error, info, success } from "../utils/Console";
import config = require("../config");
import CommandsListener = require("./handler/CommandsListener");
import ComponentsHandler = require("./handler/ComponentsHandler");
import ComponentsListener = require("./handler/ComponentsListener");
import EventsHandler = require("./handler/EventsHandler");
import { openDatabase } from '../utils/Database';
import { Players } from '../game/Players';

class DiscordBot extends Client {
    collection = {
        application_commands: new Collection<string, ApplicationCommand<import("discord.js").ChatInputCommandInteraction | import("discord.js").UserContextMenuCommandInteraction | import("discord.js").MessageContextMenuCommandInteraction>["data"]>(),
        message_commands: new Collection<string, MessageCommand["data"]>(),
        message_commands_aliases: new Collection<string, string>(),
        components: {
            buttons: new Collection<string, Component<import("discord.js").ButtonInteraction>["data"]>(),
            selects: new Collection<string, Component<import("discord.js").AnySelectMenuInteraction>["data"]>(),
            modals: new Collection<string, Component<import("discord.js").ModalSubmitInteraction>["data"]>(),
            autocomplete: new Collection<string, AutocompleteComponent["data"]>()
        }
    }
    rest_application_commands_array: RESTPostAPIApplicationCommandsJSONBody[] = [];
    login_attempts = 0;
    login_timestamp = 0;
    statusMessages: ActivityOptions[] = [
        { name: 'Welcome to H.C Party!', type: 4 },
        { name: 'Enjoy your stay!', type: 4 },
    ];

    commands_handler = new CommandsHandler(this);
    components_handler = new ComponentsHandler(this);
    events_handler = new EventsHandler(this);
    database = openDatabase(config.database.path);
    players = new Players(this.database);

    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: 'keep this empty',
                    type: 4,
                    state: 'DiscordJS-V14-Bot-Template v3'
                }]
            }
        });
        
        new CommandsListener(this);
        new ComponentsListener(this);
    }

    startStatusRotation = () => {
        let index = 0;
        setInterval(() => {
            this.user?.setPresence({ activities: [this.statusMessages[index]] });
            index = (index + 1) % this.statusMessages.length;
        }, 4000);
    }

    connect = async () => {
        warn(`Attempting to connect to the Discord bot... (${this.login_attempts + 1})`);

        this.login_timestamp = Date.now();

        try {
            await this.login(process.env.CLIENT_TOKEN);
            this.commands_handler.load();
            this.components_handler.load();
            this.events_handler.load();
            this.startStatusRotation();

            warn('Attempting to register application commands... (this might take a while!)');
            await this.commands_handler.registerApplicationCommands(config.development);
            success('Successfully registered application commands. For specific guild? ' + (config.development.enabled ? 'Yes' : 'No'));
        } catch (err) {
            error('Failed to connect to the Discord bot, retrying...');
            error(err);
            this.login_attempts++;
            setTimeout(this.connect, 5000);
        }
    }
}

export = DiscordBot;
