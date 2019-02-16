import * as Sequelize from 'sequelize';
import { SequelizeAttributes } from '../../../../typings/SequelizeAttributes';

export interface ILevelAttributes {
  id: string;
  guild: string;
  exp?: number;
  title?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILevelInstance extends Sequelize.Instance<ILevelAttributes>, ILevelAttributes { }

export const LevelFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<ILevelInstance, ILevelAttributes> => {
  const attributes: SequelizeAttributes<ILevelAttributes> = {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    guild: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    exp: {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER
    },
    title: {
      allowNull: false,
      defaultValue: 1,
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      onUpdate: 'CURRENT_TIMESTAMP'
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      onUpdate: 'CURRENT_TIMESTAMP'
    }
  };

  const Level = sequelize.define<ILevelInstance, ILevelAttributes>('levels', attributes);

  return Level;
};
