import path from 'node:path';
import { info, error, success } from '../../utils/Console';
import { readdirSync } from 'fs';
import DiscordBot = require('../DiscordBot');
import Component = require('../../structure/Component');
import AutocompleteComponent = require('../../structure/AutocompleteComponent');
import Event = require('../../structure/Event');

class EventsHandler {
    client: DiscordBot;

    constructor(client: DiscordBot) {
        this.client = client;
    }

    load = () => {
        let total = 0;

        for (const directory of readdirSync(path.join(__dirname, '../../events'))) {
            for (const file of readdirSync(path.join(__dirname, '../../events', directory)).filter((f) => f.endsWith(path.extname(__filename)))) {
                try {
                    const module = require('../../events/' + directory + '/' + file) as LoadedModule;

                    if (!module) continue;

                    if (module.__type__ === 5) {
                        if (!module.event || !module.run) {
                            error('Unable to load the event ' + file);
                            continue;
                        }

                        if (module.once) {
                            this.client.once(module.event, (...args) => module.run(this.client, ...args));
                        } else {
                            this.client.on(module.event, (...args) => module.run(this.client, ...args));
                        }

                        info(`Loaded new event: ` + file);

                        total++;
                    } else {
                        error('Invalid event type ' + (module as { __type__: unknown }).__type__ + ' from event file ' + file);
                    }
                } catch (err) {
                    error('Unable to load a event from the path: ' + 'src/events/' + directory + '/' + file);
                }
            }
        }

        success(`Successfully loaded ${total} events.`);
    }
}

export = EventsHandler;
type LoadedModule = Event['data'];
