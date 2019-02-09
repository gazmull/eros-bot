import { ClientUtil } from 'discord-akairo';
import Selection from '../src/struct/util/Selection';
import { Message as Msg } from 'discord.js';

declare global {
  interface Message extends Msg {}
  interface IClientUtil extends ClientUtil {
    selection: Selection;
    getArticle: (title: string) => Promise<string>;
    getArticleCategories: (title: string) => Promise<{ title: string }>;
  }

  interface IKamihimeWiki {
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

  interface IKamihimeWikiEidolon extends IKamihimeWiki {
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

  interface IKamihimeWikiKamihime extends IKamihimeWiki {
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
    assistName?: string;
    assistDesc?: string;
    assistPowerupDesc?: string;
    favouriteWeapon?: string;
    releaseWeapon?: string;
  }

  interface IKamihimeWikiSoul extends IKamihimeWikiKamihime {
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
  }

  interface IKamihimeWikiWeapon extends IKamihimeWikiKamihime {
    weaponType: string;
    skillType?: string;
    skill?: string;
    skill1?: string;
    skillType2?: string;
    skill2?: string;
    skill1Fbl?: string;
    skill2Fbl?: string;
    skillDesc?: string;
    skill2Desc?: string;
    element2?: string;
    element3?: string;
    element4?: string;
    atkFbl?: number;
    hpFbl?: number;
    burstFbl?: string;
    burstDesc0?: string;
    burstDesc1?: string;
    burstDesc2?: string;
    burstDesc3?: string;
    releases?: string;
  }

  interface IKamihimeDB extends IKamihimeWiki {
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
  }
}