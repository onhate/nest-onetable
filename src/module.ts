import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { Table } from 'dynamodb-onetable';
import type { TableConstructorParams } from 'dynamodb-onetable/dist/cjs/Table';
import { paramsSymbol, tableSymbol } from './decorators';

type TableParamsProvider = Omit<FactoryProvider<TableConstructorParams<any>>, 'provide'> | TableConstructorParams<any>;
type OnetableModuleOptions = TableParamsProvider & {
  global?: boolean;
};

@Module({})
export class OnetableModule {
  static register(params: OnetableModuleOptions): DynamicModule {
    const configProvider =
      'useFactory' in params //
        ? { provide: paramsSymbol, ...params }
        : { provide: paramsSymbol, useValue: params };

    const tableProvider = {
      provide: tableSymbol,
      inject: [paramsSymbol],
      useFactory: (params: TableConstructorParams<any>) => new Table(params)
    };

    return {
      module: OnetableModule,
      global: params.global ?? true,
      providers: [configProvider, tableProvider],
      exports: [tableSymbol]
    };
  }
}
