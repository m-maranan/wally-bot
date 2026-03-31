# DiscordBot

A simple Discord bot starter built with Node.js and `discord.js`.

## Requirements

- Node.js 18.18 or newer
- A Discord application with a bot user
- Your bot token and application ID

## Setup

1. Install dependencies:
   `npm install discord.js dotenv`
2. Create your local environment file:
   `Copy-Item .env.example .env`
3. Fill in `.env` with your Discord values.
4. Register the global slash commands:
   `npm run register`
5. Start the bot:
   `npm start`

## Environment Variables

- `DISCORD_TOKEN` is your bot token from the Discord Developer Portal.
- `DISCORD_CLIENT_ID` is your application ID.

## Commands

- `/ping` checks whether the bot is online.
- `/setupconfessions confession_channel logs_channel` configures where confessions are posted and where the private logs are sent.
- `/confess` opens a modal so a user can submit an anonymous confession.

## How Confessions Work

- The confession is posted anonymously in the configured confession channel.
- The user's Discord tag, user ID, and confession text are sent to the configured logs channel.
- Only members with `Manage Server` can change the confession setup.
- Channel settings are stored per server, so each server can have its own confession setup.

## Global Commands Note

Global slash commands work in every server where the bot is installed, but Discord can take a little time to make new or updated commands appear everywhere.

## Invite Link

Use the Discord Developer Portal installation page or this format:

`https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=8`

`permissions=8` requests Administrator access.
