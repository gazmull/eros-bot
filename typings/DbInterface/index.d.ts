import * as Sequelize from 'sequelize';
import { IGuildAttributes, IGuildInstance } from '../../src/struct/models/guild';

export interface DbInterface {
  sequelize: Sequelize.Sequelize;
  Sequelize: Sequelize.SequelizeStatic;
  Guild: Sequelize.Model<IGuildInstance, IGuildAttributes>;
}
