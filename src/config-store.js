const fs = require('node:fs');
const path = require('node:path');

const dataDirectory = path.join(__dirname, 'data');
const configPath = path.join(dataDirectory, 'confession-config.json');

function ensureStore() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }
}

function readConfig() {
  ensureStore();
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw || '{}');
}

function writeConfig(config) {
  ensureStore();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getGuildConfig(guildId) {
  const config = readConfig();
  return config[guildId] || null;
}

function setGuildConfig(guildId, guildConfig) {
  const config = readConfig();
  config[guildId] = guildConfig;
  writeConfig(config);
}

module.exports = {
  getGuildConfig,
  setGuildConfig,
};
