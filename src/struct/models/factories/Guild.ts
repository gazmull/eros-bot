import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IErosClientOptions from '../../../../typings/auth';

// tslint:disable-next-line:no-var-requires
const { defaultPrefix }: { defaultPrefix: IErosClientOptions['defaultPrefix'] } = require('../../../../auth');

@Table({ tableName: 'guilds' })
export class Guild extends Model<Guild> {
  @Column({ defaultValue: null })
  public cdChannel?: string;

  @Column({ defaultValue: null })
  public cdRole?: string;

  @PrimaryKey
  @Column({ autoIncrement: false, type: DataType.STRING })
  public id: string;

  @Column({ defaultValue: false })
  public loli?: boolean;

  @Column({ defaultValue: null })
  public nsfwChannel?: string;

  @Column({ defaultValue: null })
  public nsfwRole?: string;

  @Column({ defaultValue: null })
  public owner: string;

  @Column({ defaultValue: defaultPrefix })
  public prefix: string;

  @Column({ defaultValue: null })
  public twitterChannel?: string;
}
