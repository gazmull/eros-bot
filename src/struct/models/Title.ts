import { Column, Model, Table, Unique } from 'sequelize-typescript';

@Table({ charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', tableName: 'titles' })
export class Title extends Model<Partial<Title>> {
  @Column
  public name: string;

  @Unique
  @Column
  public threshold: number;
}
