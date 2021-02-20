import { Message, sendMessage } from '../../deps.ts'
import { Command, commands } from '../commands.ts'

export const handleShowHelp = async (message : Message, command : Command) => {
    // React to message
    message.addReaction('👍')

    // Create a help embed
    const embed = {
        title: 'Critical Counter',
        description: 'Discord tool for keeping track of critical rolls in roleplaying games.',
        footer: { text: 'Created by Giraugh (http://ewanb.me)' },
        fields: [{
            name: 'Commands',
            value: commands.map(c =>
                `**${c.name}** (*!${c.usage}*)\n${c.description}`
            ).join('\n\n')
        }]
    }

    // send the embed
    sendMessage(message.channelID, { embed })
}

