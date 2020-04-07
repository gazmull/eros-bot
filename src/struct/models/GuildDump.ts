import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'guildsDump' })
export class GuildDump extends Model<GuildDump> {
  @PrimaryKey
  @Column({ autoIncrement: false, type: DataType.STRING })
  public id: string;

  @Column({ defaultValue: () => Date.now().toString() })
  public dumpedAt: string;
}
