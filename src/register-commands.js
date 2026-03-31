const {
  ChannelType,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');
require('dotenv').config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in your .env file.');
}

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  new SlashCommandBuilder()
    .setName('setupconfessions')
    .setDescription('Set the confession channel and confession logs channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('confession_channel')
        .setDescription('The public channel where anonymous confessions will be posted.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('logs_channel')
        .setDescription('The private channel where confession logs will be posted.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Send an anonymous confession.'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(DISCORD_CLIENT_ID),
    { body: commands }
  );

  console.log('Global slash commands registered successfully. These can take a little time to appear in every server.');
}

registerCommands().catch((error) => {
  console.error('Failed to register commands:', error);
  process.exitCode = 1;
});
