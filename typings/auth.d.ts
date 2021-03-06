import { AkairoOptions } from 'discord-akairo';

export default interface IErosClientOptions extends AkairoOptions {
  token: string;
  docs: string;
  inviteLink: string;
  supportLink: string;
  defaultPrefix: string;
  blacklist?: string[];
  emojis: {
    embarassed: string;
    loading: string;
    'SSR+': string;
    SSR: string;
    SR: string;
    R: string;
    N: string;
  };
  url: {
    api: string;
    player: string;
    root: string;
    gallery: string;
    fandom: string;
  };
  countdownAuthorized: string[];
  db: {
    username: string;
    password?: string;
    database: string;
    host: string;
    port: number;
  },
  twitter?: {
    access_token_key: string;
    access_token_secret: string;
    consumer_key: string;
    consumer_secret: string;
    user: string;
  }
}
