import steal = require('./slashcommand-steal');

export = {
    ...steal,
    command: { ...steal.command, name: 'rob' },
};
