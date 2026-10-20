# <samp>DiscordJS-V14-Bot-Template</samp> v3

A Discord bot commands, components and events handler based on **discord.js v14** and fully written in TypeScript.

Did you like the project? Click on the star button (⭐️) right above your screen, thank you!

## Features
- Updated to the latest version of [discord.js v14.x](https://github.com/discordjs/discord.js/releases).
- Supports all possible type of commands.
    - Message commands.
    - Application commands:
        - Chat Input
        - User context
        - Message context
- Handles components.
    - Buttons
    - Select menus
    - Modals
    - Autocomplete
- Easy and simple to use.
- Advanced command options.
- Simple Database included (YAML).

## Commands, Components, and Events structure:
### Message commands:

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype).<br>
`Awaitable` means the function might be **async**.

```ts
new MessageCommand({
    command: {
        name: string, // The command name
        description?: string, // The command description (optional)
        aliases?: string[], // The command aliases (optional)
        permissions?: PermissionResolvable[], // The command permissions (optional)
    },
    options?: Partial<{
        cooldown: number, // The command cooldown, in milliseconds
        botOwner: boolean, // Bot owner can only run it? (true = yes, false = no)
        guildOwner: boolean, // Guild owner can only run it? (true = yes, false = no)
        botDevelopers: boolean, // Bot developers can only run it? (true = yes, false = no)
        nsfw: boolean // The command contains NSFW content? (true = yes, false = no)
    }>,
    run: Awaitable<(client: DiscordBot, message: Message, args: string[]) => void> // The main function to execute the command
});
```

### Application commands (Chat input, User context, Message context):

[`APIApplicationCommand`](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure), [`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype).<br>
`Awaitable` means the function might be **async**.

```ts
new ApplicationCommand({
    command: APIApplicationCommand,
    options?: Partial<{
        cooldown: number, // The command cooldown, in milliseconds
        botOwner: boolean, // Bot owner can only run it? (true = yes, false = no)
        guildOwner: boolean, // Guild owner can only run it? (true = yes, false = no)
        botDevelopers: boolean, // Bot developers can only run it? (true = yes, false = no)
    }>,
    run: Awaitable<(client: DiscordBot, interaction: Interaction) => void> // The main function to execute the command
});
```

### Components:
#### Autocomplete:

`Awaitable` means the function might be **async**.

```ts
new AutocompleteComponent({
    commandName: string,
    run: Awaitable<(client: DiscordBot, interaction: AutocompleteInteraction) => void> // The main function to execute the command
});
```

#### Buttons, Select Menus, and Modals:

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype).<br>
`Awaitable` means the function might be **async**.

```ts
new Component({
    customId: string,
    type: 'modal' | 'select' | 'button',
    options?: Partial<{
        public: boolean // Other users can use the main interaction author button/select? (true = yes, false = no)
    }>
    run: Awaitable<(client: DiscordBot, interaction: Interaction) => void> // The main function to execute the command
});
```

### Events:

`Awaitable` means the function might be **async**.<br>
`K` is a type parameter, extends `keyof ClientEvents`.

```ts
new Event({
    event: K,
    once?: boolean, // The event can only happen once? (true = yes, false = no)
    run: Awaitable<(client: DiscordBot, ...args: ClientEvents[K]) => void>
});
```

## Dependencies
- **colors** → latest
- **discord.js** → 14.13.0 or newer
- **dotenv** → latest
- **quick-yaml.db** → latest

> [!NOTE]
> **Node.js v22** or newer is required to run **discord.js**.

## Setup
1. Install a code editor ([Visual Studio Code](https://code.visualstudio.com/Download) for an example).
2. Download this project as a **.zip** file: [Download](https://github.com/TFAGaming/DiscordJS-V14-Bot-Template/archive/refs/heads/main.zip)
3. Extract the **.zip** file into a normal folder.
4. Open your code editor, click on **Open Folder**, and select the new created folder.
5. Rename the following files:

- `src/example.config.ts` → `src/config.ts`: Used for handler configuration. A local `src/config.ts` is already provided; edit it or copy the example.
- `.env.example` → `.env`: Used for secrets, like the Discord bot token.
- `example.database.yml` → `database.yml`: Used as a main file for the database.
- `example.terminal.log` → `terminal.log`: Used as a clone of terminal (to save previous terminal messages).

6. Fill all the required values in **config.ts** and **.env**.

> [!CAUTION]
> Please remember not to share your Discord bot token! This will give access to attackers to do anything they want with your bot, so please keep the token in a safe place, which is the **.env** file.

7. Install dependencies: `npm install`.
8. Check types and build: `npm run typecheck && npm run build`.

9. Run `npm start` to start the compiled bot, or `npm run dev` to run the TypeScript source during development. Rebuild after source changes before using `npm start`.
10. Enjoy! The bot should be online.

## Contributing
Feel free to fork the repository and submit a new pull request if you wish to contribute to this project.

Before you submit a pull request, ensure you tested it and have no issues. Also, keep the same coding style, which means don't use many unnecessary spaces or tabs.

Thank you to all the people who contributed to **DiscordJS-V14-Bot-Template**!

<img src="https://contrib.rocks/image?repo=TFAGaming/DiscordJS-V14-Bot-Template">

## Support
Join our Discord server if you have any questions to ask, or if you have a problem with this project, you can go to the [issues section](https://github.com/TFAGaming/DiscordJS-V14-Bot-Template/issues) and submit a new issue.

<a href="https://discord.gg/E6VFACWu5V">
  <img src="https://discord.com/api/guilds/918611797194465280/widget.png?style=banner3">
</a>

## License
[**GPL-3.0**](./LICENSE), General Public License v3
### Custom embeds

Use `/send-embed` to post an embed in the current channel. Options include
`title`, `description`, `url`, `color` (six hex digits), `author-name`,
`author-url`, `author-icon`, `footer-text`, `footer-icon`, `image`,
`thumbnail`, `timestamp` (`now` or an ISO 8601 date/time with timezone), and `fields`.

For `fields`, enter a JSON array, for example:
`[{"name":"Status","value":"Online","inline":true}]`.
Up to 25 fields and 6000 total embed text characters are supported. Author links
and icons require an author name; footer icons require footer text; title links
require a title. URLs must use HTTP or HTTPS. Invalid input receives a private reply.
Discord supplies video, provider, proxy URLs, and media dimensions; these cannot be
set by bots.

Restart the bot to register the new command, or use the existing reload command.
After building, run `node tests/send-embed.cjs` to verify its payload and validation.

### Game: gamble

Use `/gamble coins:10 range:0–10 bet:5`. The required `coins` stake is a whole
number from 1 to 100 and cannot exceed your balance. The optional `bet` is a
whole number inside the selected inclusive range; leaving it out generates a
random guess independently from the draw.

Players are created on first game use with 100 coins and `lastDailyClaim: 0`
(no claim yet). Existing records and balances are preserved.

| Range | Winning payout (includes stake) |
| --- | --- |
| 0–5 | stake × 2 |
| 0–10 | stake × 5 |
| 0–100 | stake × 16 |
| 0–1000 | stake × 50 |

Only an exact match wins. A loss costs the stake. For example, staking 10 coins
in 0–100 returns 160 coins on a win, for a net gain of 150 coins.
Draws use Node's cryptographic random number generator. Balance settlement is
synchronous and assumes a single bot process. No daily reward command is included yet.

After building, run `node tests/players.cjs` and `node tests/gamble.cjs`.
