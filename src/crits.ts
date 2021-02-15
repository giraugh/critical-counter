import { Member } from 'https://deno.land/x/discordeno/mod.ts'

export type CritType = 'Crit20' | 'Crit1'

export interface Crits {
    'Crit20': number,
    'Crit1': number
}

// temporary storage solution
const crits = new Map()

export const addCrit = (member : Member, critType : CritType) => {
    const counts = getCrits(member)
    const counts_ = { ...counts, [critType]: counts[critType] + 1 }
    crits.set(member.id, counts_)
}

export const getCrits = (member : Member) : Crits => {
    if (crits.has(member.id)) {
        return crits.get(member.id)
    } else {
        const counts = { 'Crit20': 0, 'Crit1': 0 }
        return counts
    }
}

export const getAllCrits = () =>
    crits.entries()
