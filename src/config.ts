import { config } from "https://deno.land/x/dotenv/mod.ts"

// Load .env config
const env = config()
if (!env.DISCORD_TOKEN)
    throw Error('Expected DISCORD_TOKEN environment variable')

export const token = env.DISCORD_TOKEN
export const commands = {
    addCrit20: '!crit20',
    addCrit1: '!crit1',
    getCrits: '!crits'
}
