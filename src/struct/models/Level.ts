import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'levels' })
export class Level extends Model<Partial<Level>> {
  @Column
  public user: string;

  @Column
  public guild: string;

  @Column({ defaultValue: 0 })
  public exp?: number;

  @Column({ defaultValue: 0 })
  public title?: number;
}
