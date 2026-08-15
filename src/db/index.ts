import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const client = postgres(url, { max: 1 });
  return drizzle(client, { schema });
}
