import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '/modules/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/../typeorm/migrations/*{.ts,.js}')],
});
// npm run migration:generate -- typeorm/migrations/Init
// npm run migration:run
// npm run migration:revert
