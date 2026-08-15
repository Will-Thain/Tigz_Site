import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "data", "runtime.json");

export async function readStore<T>(key: string, fallback: T): Promise<T> {
  try {
    const json = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
    return (json[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(key: string, value: T): Promise<void> {
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
  } catch {
    json = {};
  }
  json[key] = value;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(json, null, 2)}\n`);
}
