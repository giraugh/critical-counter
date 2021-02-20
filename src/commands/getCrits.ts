import { Message } from '../../deps.ts'
import { Command } from '../commands.ts'
import { fmtCrits } from '../util.ts'
import { getCrits } from '../crits.ts'

export const handleGetCrits = async (message : Message, command : Command) => {
    // React to message
    message.addReaction('👍')

    const member = message.mentionedMembers[0]
    if (member) {
        const crits = await getCrits(message.guildID, member)
        message.reply(fmtCrits(crits, member.username, true))  
    }
}

