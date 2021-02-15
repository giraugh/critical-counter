import { Message } from 'https://deno.land/x/discordeno/mod.ts'
import { CritType, addCrit, getCrits } from './crits.ts'

const COMM_PREF = '!'
const COMM_CRIT20 = COMM_PREF + 'crit20'
const COMM_CRIT1 = COMM_PREF + 'crit1'
const COMM_GET = COMM_PREF + 'crits'


export const handleGetAllCommand = (message : Message) => {
    // React to message
    message.addReaction('👍')
}

export const handleGetCommand = (message : Message) => {
    // React to message
    message.addReaction('👍')

    const member = message.mentionedMembers[0]
    if (member) {
        const crits = getCrits(member)
        message.reply(`${member.username} has ${crits['Crit20']} nat20s and ${crits['Crit1']} crit1s`)
    }
}

export const handleCritCommand = (message : Message, critType : CritType) => {
    // react to message
    const reaction = critType == 'Crit20' ? '👌' : '😢'
    message.addReaction(reaction)
    
    // Add a crit
    const member = message.mentionedMembers[0]
    if (member) {
        // Add the crit
        addCrit(member, critType)

        // Report the new crit count
        const crits = getCrits(member)
        message.reply(`${member.username} now has ${crits[critType]} crits (${critType})`)
    }
}

export const isCommandWithMention = (command : string, msg : Message) =>
    hasPrefix(command, msg.content) && msg.mentions.length == 1 

export const isCommandWithoutMention = (command : string, msg : Message) =>
    hasPrefix(command, msg.content) && msg.mentions.length == 0

const hasPrefix = (prefix : string, str : string) =>
    str.slice(0, prefix.length) === prefix

