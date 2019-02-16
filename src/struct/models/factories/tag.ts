import * as Sequelize from 'sequelize';
import { SequelizeAttributes } from '../../../../typings/SequelizeAttributes';

export interface ITagAttributes {
  author: string;
  guild: string;
  name: string;
  modifiedBy?: string;
  uses?: number;
  hoisted: boolean;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITagInstance extends Sequelize.Instance<ITagAttributes>, ITagAttributes { }

export const TagFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<ITagInstance, ITagAttributes> => {
  const attributes: SequelizeAttributes<ITagAttributes> = {
    author: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    guild: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    name: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    modifiedBy: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    uses: {
      defaultValue: 0,
      type: Sequelize.INTEGER
    },
    hoisted: {
      defaultValue: false,
      type: Sequelize.BOOLEAN
    },
    content: {
      allowNull: true,
      type: Sequelize.TEXT
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

  const Tag = sequelize.define<ITagInstance, ITagAttributes>('tags', attributes);

  return Tag;
};
