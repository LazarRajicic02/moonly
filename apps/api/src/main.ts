import { createNestApp } from './create-app';

async function bootstrap() {
  const expressApp = await createNestApp();
  const port = process.env.API_PORT
    ? Number(process.env.API_PORT)
    : process.env.PORT
      ? Number(process.env.PORT)
      : 3001;

  expressApp.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Luna API listening on :${port}`);
  });
}

bootstrap();
