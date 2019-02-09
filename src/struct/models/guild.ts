import * as Sequelize from 'sequelize';
import { defaultPrefix } from '../../../auth';
import { SequelizeAttributes } from '../../../typings/SequelizeAttributes';

export interface IGuildAttributes {
  cdChannelID?: string;
  cdRoleID?: string;
  id: string;
  loli: boolean;
  name: string;
  nsfwChannelID?: string;
  nsfwRoleID?: string;
  owner: string;
  prefix: string;
  twitterChannelID?: string;
}

export interface IGuildInstance extends Sequelize.Instance<IGuildAttributes>, IGuildAttributes { }

// tslint:disable-next-line: max-line-length
export const GuildFactory = (sequelize: Sequelize.Sequelize): Sequelize.Model<IGuildInstance, IGuildAttributes> => {
  const attributes: SequelizeAttributes<IGuildAttributes> = {
    cdChannelID: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    cdRoleID: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    },
    id: {
      primaryKey: true,
      type: Sequelize.TEXT,
      unique: true
    },
    loli: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    },
    name: Sequelize.TEXT,
    nsfwChannelID: Sequelize.TEXT,
    nsfwRoleID: Sequelize.TEXT,
    owner: Sequelize.TEXT,
    prefix: {
      defaultValue: defaultPrefix,
      type: Sequelize.TEXT
    },
    twitterChannelID: {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.TEXT
    }
  };

  const Guild = sequelize.define<IGuildInstance, IGuildAttributes>('guilds', attributes);

  return Guild;
};
