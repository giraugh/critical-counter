import { Message, Member, Guild, fetchMembers, cache } from '../deps.ts'
import { Command } from './commands.ts'
import { getAllCrits, getCrits, CritType, Crits } from './crits.ts'

export const reportNewCrits = async (message : Message, member : Member, critType : CritType) => {
    const crits = await getCrits(message.guildID, member)
    const critStr = critType == 'Crit20' ? 'nat 20' : 'nat 1'
    const pluralStr = crits[critType] > 1 ? 's' : ''
    message.reply(
        `*${member.username}* now has **${crits[critType]}** ${critType}${pluralStr}`
    )
}

export const fmtCrits = (crits : Crits, name? : String, updated? : boolean) => {
    const infix = updated ? 'now ' : ''
    return `*${name}* ${infix}has **${crits['Crit20']}** nat 20s and **${crits['Crit1']}** nat 1s`
}

export const getMemberName = async (userID : string, guild? : Guild) : Promise<string> => {
    // Check cache
    const memberFromCache = cache.members.get(userID)
    if (memberFromCache)
        return memberFromCache.username

    // On cache miss, fetch all members (will catch for future calls)
    if (!guild)
        return String(userID)

    const members = await fetchMembersWithCrits(guild)
    const member = members.get(userID)
    if (!member) {
        console.warn(`Unable to find member w/ id "${userID}"`)
        return String(userID)
    }
    
    return member.username
}

export const fetchMembersWithCrits = async (guild : Guild) => {
    const crits = await getAllCrits(guild.id)
    const userIDs = crits.map(({ userID }) => userID)
    const members = await fetchMembers(guild, { userIDs })
    return members
}
