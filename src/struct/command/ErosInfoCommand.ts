import { Message } from 'discord.js';
import fetch from 'node-fetch';
import ErosCommand, { ICommandOptions } from '.';
import { IKamihimeDB } from '../../../typings';

export default abstract class ErosInfoCommand extends ErosCommand {
  constructor (id: string, options: ICommandOptions) {
    super(id, options);
  }

  public async exec (message: Message, args: any): Promise<any>;

  public async exec (
    message: Message,
    { item, approved, accurate, type }: { item: string, approved: boolean, accurate: boolean, type: string }
  ) {
    await message.util.send(`${this.client.config.emojis.loading} Awaiting KamihimeDB's repsonse...`);

    const data = await this.acquire(item, approved, accurate, type);

    if (!data) return message.util.edit(`No item named ${item} found.`);
    else if (data.info) return data.info;

    return this.awaitSelection(message, data.rows);
  }

  public async acquire (item: string, approved = false, accurate = false, type: string = null) {
    const typeQ = type || '';
    const isAccurate = accurate ? '&accurate=1' : '';
    const isApproved = approved ? '&approved=1' : '';
    const { url } = this.client.config;
    const request = await fetch(`${url.api}search?name=${encodeURI(item)}${typeQ}${isApproved}${isAccurate}`, {
      headers: { Accept: 'application/json' }
    });
    const rows = await request.json();

    if (rows.error) throw rows.error.message;

    if (!rows.length) return null;
    else if (rows.length === 1) return { info: rows[0] as IKamihimeDB };

    return { rows: rows as IKamihimeDB[] };
  }

  public async awaitSelection (message: Message, rows: IKamihimeDB[]) {
    const character = await this.client.util.selection.exec(message, this, rows);

    return character || null;
  }
}
