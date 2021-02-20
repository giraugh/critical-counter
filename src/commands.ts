import { Message, Member, Guild, cache, fetchMembers, sendMessage } from '../deps.ts'
import { CritType, Crits, addCrit, getCrits, getAllCrits } from './crits.ts'
import { makeGraph } from './graph.ts'
import { commandHelp } from './config.ts'

const COMM_PREF = '!'
const COMM_CRIT20 = COMM_PREF + 'crit20'
const COMM_CRIT1 = COMM_PREF + 'crit1'
const COMM_GET = COMM_PREF + 'crits'

export const handleHelpCommand = async (message : Message) => {
    // React to message
    message.addReaction('👍')

    // Create a help embed
    const embed = {
        title: 'Critical Counter',
        description: 'Discord tool for keeping track of critical rolls in roleplaying games.',
        footer: { text: 'Created by Giraugh (http://ewanb.me)' },
        fields: [{
            name: 'Commands',
            value: Object.entries(commandHelp).map(([comm, help]) =>
                `**${comm}** (*${help.usage}*)\n${help.description}`
            ).join('\n\n')
        }]
    }

    // send the embed
    sendMessage(message.channelID, { embed })
}

export const handleShowGraphCommand = async (message : Message, critType : CritType) => {
    // React to message
    message.addReaction('👍')

    // Get all crits
    const allCrits = await getAllCrits()
    let pairs : [string, number][] = []
    for (let crit of allCrits) {
        let uName = await getMemberName(crit.userID, message.guild)
        let count = crit[critType]
        pairs.push([uName, count])
    }

    // Create graph string
    const graphResults : Map<string, number> = new Map(pairs)
    const graph = makeGraph(graphResults, { barLength: 20 })

    // Make and post the graph string as an embed
    const graphEmbed = {
        title: `Count of Natural ${critType == 'Crit20' ? '20s' : '1s'}`,
        fields: [{ name: 'Crits', value: graph }]
    }
    sendMessage(message.channelID, { embed: graphEmbed })
}

export const handleGetAllCommand = async (message : Message) => {
    // React to message
    message.addReaction('👍')

    // get all crits and then format them
    const crits = await getAllCrits()
    const msgs = await Promise.all(crits.map(async (crits : Crits) => {
        return fmtCrits(crits, await getMemberName(crits.userID, message.guild))
    }))
    message.reply(msgs.join('\n'))
}

export const handleGetCommand = async (message : Message) => {
    // React to message
    message.addReaction('👍')

    const member = message.mentionedMembers[0]
    if (member) {
        const crits = await getCrits(member)
        message.reply(fmtCrits(crits, member.username, true))  
    }
}

export const handleCritCommand = async (message : Message, critType : CritType) => {
    // react to message
    const reaction = critType == 'Crit20' ? '👌' : '😢'
    message.addReaction(reaction)
    
    // Add a crit
    const member = message.mentionedMembers[0]
    if (member) {
        // Add the crit
        await addCrit(member, critType)

        // Report the new crit count
        const crits = await getCrits(member)
        const critStr = critType == 'Crit20' ? 'nat 20' : 'nat 1'
        const pluralStr = crits[critType] > 1 ? 's' : ''
        message.reply(`*${member.username}* now has **${crits[critType]}** ${critType}${pluralStr}`)
    }
}

export const isCommandWithMention = (command : string, msg : Message) =>
    hasPrefix(command, msg.content) && msg.mentions.length == 1 

export const isCommandWithoutMention = (command : string, msg : Message) =>
    hasPrefix(command, msg.content) && msg.mentions.length == 0

const hasPrefix = (prefix : string, str : string) =>
    str.slice(0, prefix.length) === prefix

const fmtCrits = (crits : Crits, name? : String, updated? : boolean) => {
    const infix = updated ? 'now ' : ''
    return `*${name}* ${infix}has **${crits['Crit20']}** nat 20s and **${crits['Crit1']}** nat 1s`
}

const getMemberName = async (userID : string, guild? : Guild) : Promise<string> => {
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

const fetchMembersWithCrits = async (guild : Guild) => {
    const crits = await getAllCrits()
    const userIDs = crits.map(({ userID }) => userID)
    const members = await fetchMembers(guild, { userIDs })
    return members
}
