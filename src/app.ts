import 'module-alias/register';

import express from 'express';
import type { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';

import { logger } from './Middlewares';
import { defaultErrorHandler, notFoundHandler } from './lib';
import { port } from '@/config';
import { expressMiddleware } from '@apollo/server/express4';
import { createApolloGraphqlServer } from './graphql';

const init = async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  app.use(compression());

  app.use(logger());
  // app.use(limiter);

  app.get('/', (req: Request, res: Response) => {
    res.json({ route: { voyager: '/voyager', graphql: '/graphql' } });
  });

  app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));
  app.use('/graphql', expressMiddleware(await createApolloGraphqlServer()));

  app.use(notFoundHandler);
  app.use(defaultErrorHandler);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`GraphQL Server running at http://localhost:${port}/graphql`);
    console.log(`Voyager Graph Doc  at http://localhost:${port}/voyager`);
  });
};
init();
