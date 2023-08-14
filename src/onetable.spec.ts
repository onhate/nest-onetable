import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OneModel } from './decorators';
import { OnetableModule } from './module';

@Injectable()
export class OneModelX extends OneModel('OneModelX', {
  pk: { type: String, value: '${id}', hidden: true },
  sk: { type: String, value: 'latest', hidden: true },
  id: { type: String, value: '${id}', required: true }
}) {}

@Injectable()
class Service {
  constructor(public readonly model: OneModelX) {
  }
}

describe('OneTable', () => {
  it('should instantiate custom models', async () => {
    const module = await Test.createTestingModule({
      imports: [
        OnetableModule.register({
          global: false,
          client: jest.mocked(DynamoDBClient),
          name: 'test:table:name',
          partial: true,
          schema: {
            format: 'onetable:1.1.0',
            version: '0.0.1',
            indexes: {
              primary: { hash: 'pk', sort: 'sk' }
            },
            models: {}
          }
        })
      ],
      providers: [OneModelX, Service]
    })
      .compile()
      .then(app => app.init());

    const node = module.get(Service);
    expect(node.model).toBeDefined();
  });
});
