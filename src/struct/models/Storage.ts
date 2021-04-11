import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Storage extends Model<Partial<Storage>> {
  @Column
  public item: string;

  @Column
  public user: string;

  @Column({ defaultValue: 1 })
  public amount?: number;
}
