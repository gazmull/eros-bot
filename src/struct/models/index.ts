import * as Sequelize from 'sequelize';
import { DbInterface } from '../../../typings/DbInterface';
import { GuildFactory } from './guild';

export const create = (): DbInterface => {
  const sequelize = new Sequelize('Eros', null, null, {
    define: { freezeTableName: true },
    dialect: 'sqlite',
    logging: false,
    omitNull: true,
    operatorsAliases: true,
    pool: {
      acquire: 30 * 1000,
      max: 10,
      min: 0
    },
    storage: `${__dirname}/../../../provider/Eros.db`
  });

  return {
    sequelize,
    Sequelize,
    Guild: GuildFactory(sequelize)
  };
};