import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import IErosClientOptions from '../../typings/auth';
import { Guild } from './models/Guild';
import { Level } from './models/Level';
import { Storage } from './models/Storage';
import { Tag } from './models/Tag';
import { Title } from './models/Title';

// tslint:disable-next-line:no-var-requires
const { db }: { db: IErosClientOptions['db'] } = require('../../auth');

export const sequelize = new Sequelize({
  dialect: 'mariadb',
  host: db.host,
  database: db.database,
  username: db.username,
  password: db.password,
  define: {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: true
  },
  logging: false,
  modelPaths: [ __dirname + '/models' ],
  pool: {
    acquire: 30e3,
    max: 10,
    min: 0
  }
});

export const create = () => {
  return {
    sequelize,
    Op,
    Guild,
    Level,
    Storage,
    Tag,
    Title
  };
};