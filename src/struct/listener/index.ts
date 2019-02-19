import { Listener, ListenerOptions } from 'discord-akairo';
import ErosClient from '../ErosClient';

export default class ErosListener extends Listener {
  constructor (id: string, options?: ListenerOptions) {
    super(id, options);
  }

  public client: ErosClient;
}
