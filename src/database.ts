import { Client } from '../deps.ts'
import { config } from '../deps.ts'

export type CritsDBFields = 'userID' | 'guildID' | 'crit1s' | 'crit20s'
export type CritsDBRow = Record<CritsDBFields, unknown>

const env = { ...config(), ...Deno.env.toObject() }
const clientConfig = {
    user: env['POSTGRES_USER'] ?? 'root',
    password: env['POSTGRES_PASSWORD'] ?? 'password' ,
    database: env['POSTGRES_DB'] ?? 'db',
    port: Number(env['POSTGRES_PORT']) ?? 5432,
    hostname: env['POSTGRES_HOST']
}
const client = new Client(clientConfig)

console.log(
    `Connecting to database \
    '${clientConfig.database}' at\
    ${clientConfig.hostname}:${clientConfig.port}@${clientConfig.user}...`
)

await client.connect()

export const getAllUserCrits = async (guildID : string) : Promise<CritsDBRow[]> => {
    const res = await client.queryObject(`SELECT * FROM Crits WHERE guildID='${guildID}'`)
    return res.rows
}

export const getUserCrits = async (guildID : string, userID : string): Promise<CritsDBRow[]> => {
    const res = await client.queryObject(
        `SELECT * FROM Crits WHERE guildID='${guildID}' AND userID='${userID}'`
    )
    return res.rows
}

export const setCrits = (field : string) => async (guildID : string, userID : string, amount : number) => {
    return await client.queryObject(
        `INSERT INTO Crits (guildID, userID, ${field}) VALUES ('${guildID}', '${userID}', ${amount}) ON CONFLICT (guildID, userID) DO UPDATE SET ${field} = '${amount}'`
    )
}

export const addCrit = (field : string) => async (guildID : string, userID : string) => {
    return await client.queryObject(
        `INSERT INTO Crits (guildID, userID, ${field}) VALUES ('${guildID}', '${userID}', 1) ON CONFLICT (guildID, userID) DO UPDATE SET ${field} = Crits.${field} + 1`
    )
}

export const addCrit1 = addCrit('crit1s')
export const addCrit20 = addCrit('crit20s')
export const setCrits1 = setCrits('crit1s')
export const setCrits20 = setCrits('crit20s')
