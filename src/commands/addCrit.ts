import { Message } from '../../deps.ts'
import { Command } from '../commands.ts'
import { addCrit } from '../crits.ts'
import { reportNewCrits } from '../util.ts'

export const handleAddCrit = async (message : Message, command : Command) => {
    // Get critType from command
    const critType = command.critType!
    
    // react to message
    const reaction = critType == 'Crit20' ? '👌' : '😢'
    message.addReaction(reaction)

    // Add a crit
    const member = message.mentionedMembers[0]
    if (member) {
        // Add the crit
        await addCrit(message.guildID, member, critType)

        // Report the new crit count
        await reportNewCrits(message, member, critType)
    }
}

