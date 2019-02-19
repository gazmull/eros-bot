import * as Sequelize from 'sequelize';
// @ts-ignore
import { db as cred } from '../../../auth';
import { DbInterface } from '../../../typings/DbInterface';
import { GuildFactory } from './factories/guild';
import { LevelFactory } from './factories/level';
import { StorageFactory } from './factories/storage';
import { TagFactory } from './factories/tag';
import { TitleFactory } from './factories/title';

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
    Level: LevelFactory(sequelize),
    Storage: StorageFactory(sequelize),
    Tag: TagFactory(sequelize),
    Title: TitleFactory(sequelize)
  };
};
