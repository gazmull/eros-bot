import * as Sequelize from 'sequelize';
import { ILevelAttributes, ILevelInstance } from '../../src/struct/models/factories/level';
import { IStorageAttributes, IStorageInstance } from '../../src/struct/models/factories/storage';
import { ITitleAttributes, ITitleInstance } from '../../src/struct/models/factories/title';
import { IGuildAttributes, IGuildInstance } from '../../src/struct/models/factories/guild';
import { ITagAttributes, ITagInstance } from '../../src/struct/models/factories/tag';

export interface DbInterface {
  sequelize: Sequelize.Sequelize;
  Sequelize: Sequelize.SequelizeStatic;
  Guild: Sequelize.Model<IGuildInstance, IGuildAttributes>;
  Level: Sequelize.Model<ILevelInstance, ILevelAttributes>;
  Storage: Sequelize.Model<IStorageInstance, IStorageAttributes>;
  Tag: Sequelize.Model<ITagInstance, ITagAttributes>;
  Title: Sequelize.Model<ITitleInstance, ITitleAttributes>;
}
