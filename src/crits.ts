import { Member } from 'https://deno.land/x/discordeno/mod.ts'
import * as db from './database.ts'

export type CritType = 'Crit20' | 'Crit1'

export interface Crits {
    Crit20: number,
    Crit1: number
    userID: string
}

// temporary storage solution
const crits = new Map()

const critsFromDBResult = (res : any) : Crits => ({
    userID: res.userid,
    Crit20: res.crit20s,
    Crit1: res.crit1s
})

export const addCrit = async (guildID : string, member : Member, critType : CritType) => {
    if (critType == 'Crit20') {
        await db.addCrit20(guildID, member.id)
    } else {
        await db.addCrit1(guildID, member.id)
    }
}

export const getCrits = async (guildID : string, member : Member) : Promise<Crits> => {
    const res = await db.getUserCrits(guildID, member.id)
    if (res[0])
        return critsFromDBResult(res[0])
    else
        return { userID: member.id, Crit20: 0, Crit1: 0 }
}

export const getAllCrits = async (guildID : string) => {
    const res = await db.getAllUserCrits(guildID)
    return res.map(critsFromDBResult)
}
    
