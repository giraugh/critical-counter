import { config } from "../deps.ts";

// Load .env config
const env = { ...config(), ...Deno.env.toObject() };
if (!env.DISCORD_TOKEN)
  throw Error("Expected DISCORD_TOKEN environment variable");

export const dbPath = env.DB_PATH ?? "./main.db";
export const token = env.DISCORD_TOKEN;
