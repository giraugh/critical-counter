import { Member } from 'https://deno.land/x/discordeno/mod.ts'
import * as db from './database.ts'

export type CritType = 'Crit20' | 'Crit1'

export interface Crits {
    Crit20: number,
    Crit1: number
    userId: string
}

// temporary storage solution
const crits = new Map()

const critsFromDBResult = (res : any) : Crits => ({
    userId: res.userid,
    Crit20: res.crit20s,
    Crit1: res.crit1s
})

export const addCrit = async (member : Member, critType : CritType) => {
    if (critType == 'Crit20') {
        await db.addCrit20(member.id)        
    } else {
        await db.addCrit1(member.id)
    }
}

export const getCrits = async (member : Member) : Promise<Crits> => {
    const res = await db.getUserCrits(member.id)
    return critsFromDBResult(res[0])
}

export const getAllCrits = async () => {
    const res = await db.getAllUserCrits()
    return res.map(critsFromDBResult)
}
    
