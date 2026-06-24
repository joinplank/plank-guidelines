import 'dotenv/config';
import { buildContainer } from './shared/config/awilix.config';
import { buildApp } from './app';

async function main(): Promise<void> {
  const container = buildContainer();
  const app = await buildApp(container);

  const port = Number(process.env.PORT ?? 3000);

  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
