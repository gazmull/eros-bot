import { InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { StringResolvable } from 'discord.js';
import * as Fandom from 'nodemw';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Logger } from 'winston';
import CountdownScheduler from '../src/functions/CountdownScheduler';
import Twitter from '../src/functions/Twitter';
import ErosCommandHandler from '../src/struct/command/commandHandler';
import ErosError from '../src/struct/ErosError';
import { Guild } from '../src/struct/models/Guild';
import { Level } from '../src/struct/models/Level';
import { Storage } from '../src/struct/models/Storage';
import { Tag } from '../src/struct/models/Tag';
import { Title } from '../src/struct/models/Title';
import Selection from '../src/struct/util/Selection';
import IErosClientOptions from './auth';
import { Embeds, FieldsEmbed } from 'discord-paginationembed';

declare module 'discord-akairo' {
  export interface ClientUtil {
    selection: Selection;
    getArticle: (title: string) => Promise<string>;
    sleep: (ms: number) => Promise<void>;
  }
}

declare module 'discord.js' {
  export interface Client extends ErosClient { }
}

declare global {
  interface IDialog {
    category?: string;
    command?: string;
    title?: string;
    description?: StringResolvable;
    image?: string;
    fields?: {
      name: string;
      value: StringResolvable;
      inline?: boolean;
    }[];
    contributors?: string[];
  }
}

interface ErosClient {
  commandHandler: ErosCommandHandler;
  listenerHandler: ListenerHandler;
  inhibitorHandler: InhibitorHandler;
  config: IErosClientOptions;
  fandomApi: Fandom;
  logger: Logger;
  scheduler: CountdownScheduler;
  twitter: Twitter;
  ErosError: typeof ErosError;
  db: {
    sequelize: Sequelize;
    Op: typeof Op;
    Guild: typeof Guild;
    Level: typeof Level;
    Storage: typeof Storage;
    Tag: typeof Tag;
    Title: typeof Title;
  }
}

export interface ICountdown {
  [ date: number ]: string[];
}

export interface IKamihimeFandom {
  atkMax?: number;
  hpMax?: number;
  obtained?: string;
  avatar?: string;
  description: string;
  element?: string;
  main?: string;
  name: string;
  preview?: string;
  rarity?: string;
  tier?: string;
  type?: string;
}

export interface IKamihimeFandomFormatted {
  name: string;
  atk?: number;
  atkFLB?: number;
  hp?: number;
  hpFLB?: number;
  obtainedFrom?: string;
  releaseWeapon?: string;
  releases?: string;
  favouriteWeapon?: string;
  souls?: string[];
  weapons?: string[];
  masterBonus?: string;
  soulPoints?: string;
  description: string;
  rarity?: string;
  tier?: string;
  thumbnail: string;
  preview: string;
  link?: string;
  type?: string;
  skill?: {
    name: string;
    description: string;
  }[];
  skillFLB?: {
    name: string;
    description: string;
  }[];
  element?: string;
  burst?: {
    name: string;
    description: string;
    upgradeDescription?: string;
  };
  burstDesc?: string[];
  burstFLBDesc?: string;
  abilities?: {
    name: string;
    cooldown: string;
    duration?: string;
    description: string;
    upgradeDescription?: string;
  }[];
  assistAbilities?: {
    name: string;
    description: string;
    upgrades?: string[];
  }[];

  mex?: {
    name: string;
    description: string;
    cooldown: string;
    duration?: string;
  }[],
  summon?: {
    name: string;
    cooldown: string;
    description: string;
  };
  effect?: {
    name: string;
    description: string[];
  };
  harem?: string;
}

export interface IKamihimeFandomEidolon extends IKamihimeFandom {
  summonAtk: string;
  summonAtkDes: string;
  summonCd: string;
  eidolonEffect: string;
  eidolonEffectDes0: string;
  eidolonEffectDes1: string;
  eidolonEffectDes2: string;
  eidolonEffectDes3: string;
  eidolonEffectDes4: string;
}

export interface IKamihimeFandomKamihime extends IKamihimeFandom {
  burstName: string;
  burstDesc: string;
  burstPowerupDesc: string;
  ability1Name: string;
  ability1Desc: string;
  ability1PowerupDesc: string;
  ability1Cd: string;
  ability1Dur?: string;
  ability2Name: string;
  ability2Desc: string;
  ability2PowerupDesc: string;
  ability2Cd: string;
  ability2Dur?: string;
  ability3Name?: string;
  ability3Desc?: string;
  ability3PowerupDesc?: string;
  ability3Cd?: string;
  ability3Dur?: string;
  ability4Name?: string;
  ability4Desc?: string;
  ability4PowerupDesc?: string;
  ability4Cd?: string;
  ability4Dur?: string;
  assistName?: string;
  assistDesc?: string;
  assistPowerupDesc?: string;
  assistPowerup2Desc?: string;
  assist2Name?: string;
  assist2Desc?: string;
  assist2PowerupDesc?: string;
  assist2Powerup2Desc?: string;
  favouriteWeapon?: string;
  releaseWeapon?: string;
}

export interface IKamihimeFandomSoul extends IKamihimeFandomKamihime {
  masterBonus: string;
  soulP: string;
  weapon1: string;
  weapon2?: string;
  soul1?: string;
  soul2?: string;
  assist1Name: string;
  assist1Desc: string;
  assist2Name?: string;
  assist2Desc?: string;
  mex1Name?: string;
  mex1Desc?: string;
  mex1Cd?: string;
  mex1Dur?: string;
  mex2Name?: string;
  mex2Desc?: string;
  mex2Cd?: string;
  mex2Dur?: string;
}

export interface IKamihimeFandomWeapon extends IKamihimeFandomKamihime {
  weaponType: string;
  skillType?: string;
  skill?: string;
  skill2Type?: string;
  skill2?: string;
  skillFlbType?: string;
  skillFlb?: string;
  skillFlbDesc?: string;
  skill2FlbType?: string;
  skill2Flb?: string;
  skill2FlbDesc?: string;
  skillDesc?: string;
  skill2Desc?: string;
  element2?: string;
  element3?: string;
  element4?: string;
  element5: string;
  element6: string;
  atkFlb?: number;
  hpFlb?: number;
  burstFlbDesc?: string;
  burstDesc0?: string;
  burstDesc1?: string;
  burstDesc2?: string;
  burstDesc3?: string;
  releases?: string;
}

export interface IKamihimeDB extends IKamihimeFandom {
  error?: {
    code: number;
    message?: string|string[];
    stack?: string;
  };
  _rowId: number;
  approved: number;
  harem1Resource1?: string;
  harem1Resource2?: string;
  harem1Title?: string;
  harem2Resource1?: string;
  harem2Resource2?: string;
  harem2Title?: string;
  harem3Resource1?: string;
  harem3Resource2?: string;
  harem3Title?: string;
  id: string;
  loli: number;
  peeks?: number;
  atk?: number;
  hp?: number;
}
