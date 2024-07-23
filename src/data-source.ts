import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number.parseInt(process.env.DATABASE_PORT ?? "54585"),
  username: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: ["error"],
  entities: ["src/entity/*.ts", "src/entity/*.js"],
  migrations: ["src/migration/*.ts", "src/migration/*.js"],
  // extra: {
  //   timezone: "Z", // Use UTC timezone
  // },
});
