import * as Sequelize from 'sequelize';
import { SequelizeAttributes } from '../../../../typings/SequelizeAttributes';

export interface IStorageAttributes {
  item: string;
  user: string;
  amount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStorageInstance extends Sequelize.Instance<IStorageAttributes>, IStorageAttributes { }

// tslint:disable-next-line:max-line-length
export const StorageFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<IStorageInstance, IStorageAttributes> => {
  const attributes: SequelizeAttributes<IStorageAttributes> = {
    item: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    user: {
      allowNull: false,
      type: Sequelize.STRING
    },
    amount: {
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

  const Storage = sequelize.define<IStorageInstance, IStorageAttributes>('storage', attributes);

  return Storage;
};
