import * as Sequelize from 'sequelize';
// @ts-ignore
import { db as cred } from '../../../auth.js';
import { DbInterface } from '../../../typings/DbInterface';
import { GuildFactory } from './guild';
import { TagFactory } from './tag';

export const create = (): DbInterface => {
  const sequelize = new Sequelize(cred.database, cred.username, cred.password, {
    host: cred.host,
    define: { freezeTableName: true },
    dialect: 'mysql',
    logging: false,
    omitNull: true,
    operatorsAliases: false,
    pool: {
      acquire: 30 * 1000,
      max: 10,
      min: 0
    }
  });

  return {
    sequelize,
    Sequelize,
    Guild: GuildFactory(sequelize),
    Tag: TagFactory(sequelize)
  };
};
