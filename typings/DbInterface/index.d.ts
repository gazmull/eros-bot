import * as Sequelize from 'sequelize';
import { IGuildAttributes, IGuildInstance } from '../../src/struct/models/guild';
import { ITagAttributes, ITagInstance } from '../../src/struct/models/tag';

export interface DbInterface {
  sequelize: Sequelize.Sequelize;
  Sequelize: Sequelize.SequelizeStatic;
  Guild: Sequelize.Model<IGuildInstance, IGuildAttributes>;
  Tag: Sequelize.Model<ITagInstance, ITagAttributes>;
}
