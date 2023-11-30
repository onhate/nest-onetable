import { Inject } from '@nestjs/common';
import type { Entity, OneModel as OneTableOneModel, Table } from 'dynamodb-onetable';
import { Model } from 'dynamodb-onetable';

export const paramsSymbol = Symbol('OneTable:TableConstructorParams');
export const tableSymbol = Symbol('OneTable:Table');

export const OneTable = () => Inject(tableSymbol);

export function OneModel<T extends OneTableOneModel, M = Entity<T>>(name: string, fields: T, timestamps?: boolean | string) {
  class OneTableModel extends Model<M> {
    public static readonly fields: T = fields;
    constructor(@OneTable() table: Table) {
      super(table, name, { fields, timestamps });
    }
  }

  return OneTableModel;
}
