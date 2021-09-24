import { createServer, Factory, Model, Response } from 'miragejs';
import faker from 'faker';

type User = {
  name: string;
  email: string;
  created_at: string;
};

export function makeServer() {
  const server = createServer({
    models: {
      user: Model.extend<Partial<User>>({}),
    },

    factories: {
      user: Factory.extend({
        name(i: number) {
          return `${faker.name.firstName()} ${faker.name.lastName()}`;
        },
        email() {
          return faker.internet.email().toLowerCase();
        },
        createdAt() {
          return faker.date.recent(10);
        },
      }),
    },

    seeds(server) {
      server.createList('user', 200);
    },

    routes() {
      this.namespace = 'api';
      this.timing = 750;

      this.get('/users', (schema, request) => {
        const { page = 1, per_page = 10 } = request.queryParams;

        const total = schema.all('user').length;
        const pageStart = (Number(page) - 1) * Number(per_page);
        const pageEnd = pageStart + Number(per_page);

        const users = schema.all('user').models.slice(pageStart, pageEnd);

        return new Response(
          200,
          {
            'x-total-count': String(total),
          },
          {
            users,
          }
        );
      });
      this.post('/users');

      this.namespace = '';
      this.passthrough();
    },
  });

  return server;
}
