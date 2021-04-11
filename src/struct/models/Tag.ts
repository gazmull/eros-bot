import { Column, Model, Table } from 'sequelize-typescript';

@Table({ charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci', tableName: 'tags' })
export class Tag extends Model<Partial<Tag>> {
  @Column
  public author: string;

  @Column
  public guild: string;

  @Column
  public name: string;

  @Column({ defaultValue: null })
  public modifiedBy?: string;

  @Column({ defaultValue: 0 })
  public uses?: number;

  @Column({ defaultValue: false })
  public hoisted: boolean;

  @Column
  public content: string;
}
