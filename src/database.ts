import { Client } from '../deps.ts'

const clientConfig = {
    user: Deno.env.get('POSTGRES_USER'),
    password: Deno.env.get('POSTGRES_PASSWORD'),
    database: Deno.env.get('POSTGRES_DB'),
    port: Number(Deno.env.get('POSTGRES_PORT')),
    hostname: Deno.env.get('POSTGRES_HOST')
}
const client = new Client(clientConfig)

console.log(
    `Connecting to database \
    '${clientConfig.database}' at\
    ${clientConfig.hostname}:${clientConfig.port}@${clientConfig.user}...`
)

await client.connect()

export const getAllUserCrits = async (guildID : string) => {
    const res = await client.queryObject(`SELECT * FROM Crits WHERE guildID='${guildID}'`)
    return res.rows
}

export const getUserCrits = async (guildID : string, userID : string) => {
    const res = await client.queryObject(
        `SELECT * FROM Crits WHERE guildID='${guildID}' AND userID='${userID}'`
    )
    return res.rows
}

export const addCrit = (field : string) => async (guildID : string, userID : string) => {
    return await client.queryObject(
        `INSERT INTO Crits (guildID, userID, ${field}) VALUES ('${guildID}', '${userID}', 1) ON CONFLICT (guildID, userID) DO UPDATE SET ${field} = Crits.${field} + 1`
    )
}

export const addCrit1 = addCrit('crit1s')
export const addCrit20 = addCrit('crit20s')
