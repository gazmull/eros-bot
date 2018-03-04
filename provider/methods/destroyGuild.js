const { status, error, warn } = require('../../utils/console');
const guilds = require('../models/guild');

module.exports = async guild => {
  try {
    const guildEntry = await guilds.destroy({ where: { id: guild.id } });
    const guildSize = guild.client.guilds.size;
    if (!guildEntry)
      return warn(`${guild.name} (ID: ${guild.id}) does not exist in the database, left anyway. ${guildSize} total guilds.`);
    status(`${guild.name} (ID: ${guild.id}) destroyed. ${guildSize} total guilds.`);
  } catch (err) {
    error(err.stack);
  }
};
