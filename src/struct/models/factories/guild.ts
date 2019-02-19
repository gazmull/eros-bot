import * as Sequelize from 'sequelize';
// @ts-ignore
import { defaultPrefix } from '../../../../auth';
import { SequelizeAttributes } from '../../../../typings/SequelizeAttributes';

export interface IGuildAttributes {
  cdChannel?: string;
  cdRole?: string;
  id: string;
  loli: boolean;
  nsfwChannel?: string;
  nsfwRole?: string;
  owner: string;
  prefix: string;
  twitterChannel?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuildInstance extends Sequelize.Instance<IGuildAttributes>, IGuildAttributes { }

// tslint:disable-next-line: max-line-length
export const GuildFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<IGuildInstance, IGuildAttributes> => {
  const attributes: SequelizeAttributes<IGuildAttributes> = {
    cdChannel: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    cdRole: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    id: {
      primaryKey: true,
      type: Sequelize.STRING
    },
    loli: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    },
    nsfwChannel: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    nsfwRole: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    owner: Sequelize.TEXT,
    prefix: {
      defaultValue: defaultPrefix,
      type: Sequelize.TEXT
    },
    twitterChannel: {
      allowNull: true,
      defaultValue: null,
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

  const Guild = sequelize.define<IGuildInstance, IGuildAttributes>('guilds', attributes);

  return Guild;
};
