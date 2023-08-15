# @OneTable

Welcome to the **Nest-Onetable** library! This library provides a convenient way to integrate the power
of [DynamoDB OneTable](https://github.com/sensedeep/dynamodb-onetable) with [NestJS](https://nestjs.com/) applications.
It simplifies the process of creating and working with DynamoDB tables using the OneTable library within your NestJS
modules.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Module Registration](#module-registration)
    - [Creating a Model](#creating-a-model)
    - [Under the Hood](#under-the-hood)
- [Contributing](#contributing)
- [License](#license)

## Installation

To start using the Nest-Onetable library in your NestJS project, follow these steps:

1. Install the package using npm or yarn:

```bash
npm install nest-onetable
```

or

```bash
yarn add nest-onetable
```

## Usage

### Module Registration

To get started, you need to register the `nest-onetable` module in your NestJS application. Here's how you can do it:

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnetableModule } from 'nest-onetable';

@Module({
  imports: [
    OnetableModule.register({
      // here you can pass either the configuration object you would pass to the new Table() constructor directly or 
      // a factory provider that returns the configuration object but with the benefits of dependency injection
      useFactory(config: ConfigService, client: DynamoDBClient) {
        return {
          client,
          global: false, // optional, defaults to true
          name: config.get('ONETABLE_NAME'),
          partial: true,
          schema: {
            format: 'onetable:1.1.0',
            version: '0.0.1',
            indexes: {
              primary: { hash: 'pk', sort: 'sk' }
            },
            models: {}
          }
        };
      },
      inject: [ConfigService, DynamoDBClient]
    })
  ]
})
export class AppModule {}
```

Now you can inject the `Table` instance into your services (but you don't need to do that, keep reading!):

```typescript
import { Injectable } from '@nestjs/common';
import { Table } from 'dynamodb-onetable';
import { OneTable } from 'nest-onetable';

@Injectable()
class UsersService {
  constructor(@OneTable() public readonly table: Table) {
  }
}
```

### Creating a Model

The boring part of creating a model is to have the `Table` instance to pass to the `Model` constructor. But
the `nest-onetable` `OneModel` class factory simplifies the process of creating OneTable Models. See below:

```typescript
import { Injectable } from '@nestjs/common';
import { OneModel } from 'nest-onetable';

@Injectable()
export class UsersModel extends OneModel('Users', {
  pk: { type: String, value: 'Users#', hidden: true },
  sk: { type: String, value: 'Users#${id}', hidden: true },
  id: { type: String, generate: 'ulid', required: true },
  name: { type: String, required: true }
}) {}

@Injectable()
class UsersService {
  constructor(public readonly model: UsersModel) {
  }

  getUsers() {
    return this.model.query(); // thanks to OneTable type inferences from the schema you get a typed object here
  }
}
```

### Under the Hood

The `OneModel` class factory is a wrapper around the `Model` class constructor. It creates a new class that extends the
`Model` and already injects the `Table` instance into the constructor facilitated by Nest.js the dependency injection.

[See the code](./src/decorators.ts)

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on
the [GitHub repository](https://github.com/onhate/nest-onetable).

## License

This project is licensed under the [MIT License](LICENSE).

---

We hope you find the `nest-onetable` library helpful for your NestJS applications. If you have any questions or need
assistance, feel free to reach out to us on the [GitHub repository](https://github.com/onhate/nest-onetable). Happy
coding! 🚀
