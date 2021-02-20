import { Message, sendMessage } from '../../deps.ts'
import { Command } from '../commands.ts'
import { getAllCrits } from '../crits.ts'
import { getMemberName } from '../util.ts'
import { makeGraph } from '../graph.ts'

export const handleShowGraph = async (message : Message, command : Command) => {
    // React to message
    message.addReaction('👍')

    // Get crit type from command
    const critType = command.critType!

    // Get all crits
    const allCrits = await getAllCrits(message.guildID)
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

