import * as Sequelize from 'sequelize';
import { SequelizeAttributes } from '../../../../typings/SequelizeAttributes';

export interface ITitleAttributes {
  id: number;
  name: string;
  threshold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITitleInstance extends Sequelize.Instance<ITitleAttributes>, ITitleAttributes { }

export const TitleFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<ITitleInstance, ITitleAttributes> => {
  const attributes: SequelizeAttributes<ITitleAttributes> = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING
    },
    threshold: {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)')
    }
  };

  const Title = sequelize.define<ITitleInstance, ITitleAttributes>('titles', attributes);

  return Title;
};
