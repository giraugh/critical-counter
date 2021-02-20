import { Message } from '../../deps.ts'
import { Command } from '../commands.ts'
import { setCrits } from '../crits.ts'
import { reportNewCrits } from '../util.ts'

export const handleSetCrits = async (message : Message, command : Command) => {
    // Determine amount from message
    const words = message.content.split(' ')
    const amount = words.find(w => String(+w) === w)
    if (!amount) {
        // Negative reply and message
        message.addReaction('👎')
        message.reply('Set command requires an amount to set to.')
        return
    }

    // React to message
    message.addReaction('👍')

    // Get critType from message
    const critType = command.critType!

    // Set the new amount
    const member = message.mentionedMembers[0]
    if (member) {
        // Update the crit count
        await setCrits(message.guildID, member, critType, Number(amount))

        // Report the new amount
        await reportNewCrits(message, member, critType)
    }
}

