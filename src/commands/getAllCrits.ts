import { Message } from '../../deps.ts'
import { Command } from '../commands.ts'
import { getAllCrits, Crits } from '../crits.ts'
import { fmtCrits, getMemberName } from '../util.ts'

export const handleGetAllCrits = async (message : Message, command : Command) => {
    // React to message
    message.addReaction('👍')

    // get all crits and then format them
    const crits = await getAllCrits(message.guildID)
    const msgs = await Promise.all(crits.map(async (crits : Crits) => {
        return fmtCrits(crits, await getMemberName(crits.userID, message.guild))
    }))
    message.reply(msgs.join('\n'))
}

