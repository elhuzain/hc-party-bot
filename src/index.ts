import 'dotenv/config';
import fs from 'fs';
import DiscordBot = require('./client/DiscordBot');

fs.writeFileSync('./terminal.log', '', 'utf-8');
const client = new DiscordBot();

export = client;

client.connect();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);