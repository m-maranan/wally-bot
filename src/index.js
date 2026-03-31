const {
  ActionRowBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
require('dotenv').config();

const { getGuildConfig, setGuildConfig } = require('./config-store');

const { DISCORD_TOKEN } = process.env;
const confessionModalId = 'confession-modal';
const confessionInputId = 'confession-input';

if (!DISCORD_TOKEN) {
  throw new Error('Missing DISCORD_TOKEN in your .env file.');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
        return;
      }

      if (interaction.commandName === 'setupconfessions') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          await interaction.reply({
            content: 'You need the Manage Server permission to configure confession channels.',
            ephemeral: true,
          });
          return;
        }

        const confessionChannel = interaction.options.getChannel('confession_channel', true);
        const logsChannel = interaction.options.getChannel('logs_channel', true);
        const allowedTypes = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

        if (!allowedTypes.includes(confessionChannel.type) || !allowedTypes.includes(logsChannel.type)) {
          await interaction.reply({
            content: 'Both channels must be standard server text or announcement channels.',
            ephemeral: true,
          });
          return;
        }

        setGuildConfig(interaction.guildId, {
          confessionChannelId: confessionChannel.id,
          logsChannelId: logsChannel.id,
        });

        await interaction.reply({
          content: `Confessions will post in ${confessionChannel} and logs will go to ${logsChannel}.`,
          ephemeral: true,
        });
        return;
      }

      if (interaction.commandName === 'confess') {
        const guildConfig = getGuildConfig(interaction.guildId);

        if (!guildConfig) {
          await interaction.reply({
            content: 'Confessions are not configured yet. Ask an admin to run /setupconfessions first.',
            ephemeral: true,
          });
          return;
        }

        const modal = new ModalBuilder()
          .setCustomId(confessionModalId)
          .setTitle('Anonymous Confession');

        const confessionInput = new TextInputBuilder()
          .setCustomId(confessionInputId)
          .setLabel('What do you want to confess?')
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(1)
          .setMaxLength(1000)
          .setPlaceholder('Type your anonymous confession here...')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(confessionInput));
        await interaction.showModal(modal);
      }

      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === confessionModalId) {
      const guildConfig = getGuildConfig(interaction.guildId);

      if (!guildConfig) {
        await interaction.reply({
          content: 'Confessions are not configured yet. Ask an admin to run /setupconfessions first.',
          ephemeral: true,
        });
        return;
      }

      const confessionChannel = await interaction.guild.channels.fetch(guildConfig.confessionChannelId);
      const logsChannel = await interaction.guild.channels.fetch(guildConfig.logsChannelId);

      if (!confessionChannel || !logsChannel) {
        await interaction.reply({
          content: 'One or both configured confession channels no longer exist. Please ask an admin to run /setupconfessions again.',
          ephemeral: true,
        });
        return;
      }

      const confessionText = interaction.fields.getTextInputValue(confessionInputId).trim();
      const submittedAt = new Date();

      const confessionEmbed = new EmbedBuilder()
        .setTitle('Anonymous Confession')
        .setDescription(confessionText)
        .setColor(0x2f3136)
        .setTimestamp(submittedAt);

      const logEmbed = new EmbedBuilder()
        .setTitle('Confession Log')
        .setColor(0xb22222)
        .addFields(
          { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
          { name: 'Confession Channel', value: `<#${confessionChannel.id}>` },
          { name: 'Confession', value: confessionText }
        )
        .setTimestamp(submittedAt);

      await confessionChannel.send({ embeds: [confessionEmbed] });
      await logsChannel.send({ embeds: [logEmbed] });

      await interaction.reply({
        content: 'Your confession has been posted anonymously.',
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Interaction handling failed:', error);

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Something went wrong while handling that action.',
        ephemeral: true,
      });
    }
  }
});

client.login(DISCORD_TOKEN);
