import { Inject } from '@nestjs/common';
import type { Entity, OneModel as OneTableOneModel, Table } from 'dynamodb-onetable';
import { Model } from 'dynamodb-onetable';

export const paramsSymbol = Symbol('OneTable:TableConstructorParams');
export const tableSymbol = Symbol('OneTable:Table');

export const OneTable = () => Inject(tableSymbol);

export function OneModel<T extends OneTableOneModel>(name: string, fields: T, timestamps?: boolean | string) {
  class OneTableModel extends Model<Entity<typeof fields>> {
    public readonly fields: T;
    constructor(@OneTable() table: Table) {
      super(table, name, { fields, timestamps });
      this.fields = fields;
    }
  }

  return OneTableModel;
}
