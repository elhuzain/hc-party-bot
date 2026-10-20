import path from 'node:path';
import { info, error, success } from '../../utils/Console';
import { readdirSync } from 'fs';
import DiscordBot = require('../DiscordBot');
import Component = require('../../structure/Component');
import AutocompleteComponent = require('../../structure/AutocompleteComponent');

class ComponentsHandler {
    client: DiscordBot;

    constructor(client: DiscordBot) {
        this.client = client;
    }

    load = () => {
        for (const directory of readdirSync(path.join(__dirname, '../../components'))) {
            for (const file of readdirSync(path.join(__dirname, '../../components', directory)).filter((f) => f.endsWith(path.extname(__filename)))) {
                try {
                    const module = require('../../components/' + directory + '/' + file) as LoadedModule;

                    if (!module) continue;

                    if (module.__type__ === 3) {
                        if (!module.customId || !module.type || !module.run) {
                            error('Unable to load the button/select/modal component ' + file);
                            continue;
                        }

                        switch (module.type) {
                            case 'modal': {
                                this.client.collection.components.modals.set(module.customId, module);
                                break;
                            }
                            case 'select': {
                                this.client.collection.components.selects.set(module.customId, module);
                                break;
                            }
                            case 'button': {
                                this.client.collection.components.buttons.set(module.customId, module);
                                break;
                            }
                            default: {
                                error('Invalid component type (not: button, select, or modal): ' + file);
                                continue;
                            }
                        }

                        info(`Loaded new component (type: ${module.type}) : ` + file);
                    } else if (module.__type__ === 4) {
                        if (!module.commandName || !module.run) {
                            error('Unable to load the autocomplete component ' + file);
                            continue;
                        }

                        this.client.collection.components.autocomplete.set(module.commandName, module);

                        info(`Loaded new component (type: autocomplete) : ` + file);
                    } else {
                        error('Invalid component type ' + (module as { __type__: unknown }).__type__ + ' from component file ' + file);
                    }
                } catch {
                    error('Unable to load a component from the path: ' + 'src/component/' + directory + '/' + file);
                }
            }
        }

        const componentsCollection = this.client.collection.components;

        success(`Successfully loaded ${componentsCollection.autocomplete.size + componentsCollection.buttons.size + componentsCollection.selects.size + componentsCollection.buttons.size} components.`);
    }

    reload = () => {
        this.client.collection.components.autocomplete.clear();
        this.client.collection.components.buttons.clear();
        this.client.collection.components.modals.clear();
        this.client.collection.components.selects.clear();

        this.load();
    }
}

export = ComponentsHandler;
type LoadedModule = Component['data'] | AutocompleteComponent['data'];
