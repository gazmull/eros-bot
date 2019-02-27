import { Sequelize } from 'sequelize-typescript';
// @ts-ignore
import { db as cred } from '../../../auth';
import { Guild } from './factories/Guild';
import { Level } from './factories/Level';
import { Storage } from './factories/Storage';
import { Tag } from './factories/Tag';
import { Title } from './factories/Title';

// @ts-ignore
export const sequelize = new Sequelize({
  database: cred.database,
  host: cred.host,
  username: cred.username,
  password: cred.password,
  dialect: 'mariadb',
  define: {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: true
  },
  logging: false,
  modelPaths: [ __dirname + '/factories' ],
  operatorAliases: false,
  pool: {
    acquire: 30e3,
    max: 10,
    min: 0
  }
});

export const create = () => {
  return {
    sequelize,
    Op: Sequelize.Op,
    Guild,
    Level,
    Storage,
    Tag,
    Title
  };
};
