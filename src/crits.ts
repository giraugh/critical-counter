import { Member } from 'https://deno.land/x/discordeno/mod.ts'
import * as db from './database.ts'

export type CritType = 'Crit20' | 'Crit1'

export interface Crits {
    Crit20: number,
    Crit1: number
    userID: string
}

export const addCrit = async (guildID : string, member : Member, critType : CritType) => {
    if (critType == 'Crit20') {
        await db.addCrit20(guildID, member.id)
    } else {
        await db.addCrit1(guildID, member.id)
    }
}

export const setCrits = async (guildID : string, member : Member, critType : CritType, amount : number) => {
    if (critType == 'Crit20') {
        await db.setCrits20(guildID, member.id, amount)
    } else {
        await db.setCrits1(guildID, member.id, amount)
    }
}

export const getCrits = async (guildID : string, member : Member) : Promise<Crits> => {
    const res = await db.getUserCrits(guildID, member.id)
    if (res[0])
        return critsFromRow(res[0])
    else
        return { userID: member.id, Crit20: 0, Crit1: 0 }
}

export const getAllCrits = async (guildID : string) : Promise<Crits[]> => {
    const res = await db.getAllUserCrits(guildID)
    return res.map(critsFromRow)
}

const critsFromRow = (row : db.CritsDBRow) : Crits => ({
    userID: row.userid as string,
    Crit20: row.crit20s as number,
    Crit1: row.crit1s as number
})

