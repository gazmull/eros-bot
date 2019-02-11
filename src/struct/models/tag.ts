import * as Sequelize from 'sequelize';
import { SequelizeAttributes } from '../../../typings/SequelizeAttributes';

export interface ITagAttributes {
  id?: number;
  authorId: string;
  guildId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  modifiedBy?: string;
  uses?: number;
  hoisted: boolean;
  content: string;
}

export interface ITagInstance extends Sequelize.Instance<ITagAttributes>, ITagAttributes { }

export const TagFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<ITagInstance, ITagAttributes> => {
  const attributes: SequelizeAttributes<ITagAttributes> = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    authorId: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    guildId: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    name: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    modifiedBy: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    uses: {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER
    },
    hoisted: {
      defaultValue: false,
      type: Sequelize.BOOLEAN
    },
    content: {
      allowNull: false,
      type: Sequelize.TEXT
    }
  };

  const Tag = sequelize.define<ITagInstance, ITagAttributes>('tags', attributes);

  return Tag;
};
