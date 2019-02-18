import { Inhibitor, InhibitorOptions } from 'discord-akairo';
import ErosClient from '../ErosClient';

export default class ErosInhibitor extends Inhibitor {
  constructor (id: string, options?: InhibitorOptions) {
    super(id, options);
  }

  public client: ErosClient;
}
