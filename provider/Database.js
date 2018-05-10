const Sequelize = require('sequelize');

const Database = new Sequelize('Eros', null, null, {
  dialect: 'sqlite',

  pool: {
    max: 10,
    min: 0,
    acquire: 30 * 1000
  },

  logging: false,
  omitNull: true,
  define: { freezeTableName: true },
  operatorsAliases: Sequelize.Op,
  storage: `${__dirname}/Eros.db`
});

module.exports = Database;
