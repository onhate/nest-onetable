import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Entity } from 'dynamodb-onetable';
import { EntityParametersForCreate } from 'dynamodb-onetable/dist/cjs/Model';
import { OneModel, OnetableModule } from './index';

@Injectable()
export class OneModelX extends OneModel('OneModelX', {
  pk: { type: String, value: 'ModelX#', hidden: true },
  sk: { type: String, value: 'ModelX#${id}', hidden: true },
  id: { type: String, generate: 'ulid' },
  name: { type: String, required: true },
  description: { type: String, required: false }
}) {}

type TypeOfModelX = typeof OneModelX.fields;
type ModelX = Entity<TypeOfModelX>

@Injectable()
class Service {
  constructor(public readonly model: OneModelX) {
  }

  async create(props: EntityParametersForCreate<TypeOfModelX>): Promise<ModelX> {
    return await this.model.create(props);
  }
}

describe('OneTable', () => {
  async function setup() {
    return await Test.createTestingModule({
      imports: [
        OnetableModule.register({
          global: false,
          client: new DynamoDBClient({
            endpoint: 'http://localhost:5002',
            region: 'local',
            credentials: {
              accessKeyId: 'fake',
              secretAccessKey: 'fake'
            }
          }),
          name: 'onetable',
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
  }


  it('should instantiate custom models', async () => {
    const module = await setup();
    const service = module.get(Service);
    expect(service.model).toBeDefined();
  });

  it('should validate types', async () => {
    const module = await setup();
    const service = module.get(Service);

    const result = await service.create({ name: 'one and only one table' });
    expect(result.id).toHaveLength(26); // ulid
    expect(result.name).toBe('one and only one table');
  });
});