import { Message } from '../deps.ts'
import { CritType } from './crits.ts'
import { handleAddCrit } from './commands/addCrit.ts'
import { handleGetCrits } from './commands/getCrits.ts'
import { handleGetAllCrits } from './commands/getAllCrits.ts'
import { handleSetCrits } from './commands/setCrits.ts'
import { handleShowGraph } from './commands/showGraph.ts'
import { handleShowHelp } from './commands/showHelp.ts'

export interface Command {
    name: string
    command: string
    mentions: number
    usage: string
    description: string
    critType? : CritType
    handler: CommandHandler 
}

type CommandHandler = (message : Message, command : Command) => Promise<void>

export const commands : Command[] = [
    {
        name: 'Add Crit 20',
        command: 'crit20',
        mentions: 1,
        usage: 'crit20 @user',
        description: 'Add a natural 20 for mentioned user.',
        critType: 'Crit20',
        handler: handleAddCrit
    },
    {
        name: 'Add Crit 1',
        command: 'crit1',
        mentions: 1,
        usage: 'crit1 @user',
        description: 'Add a natural 1 for mentioned user.',
        critType: 'Crit1',
        handler: handleAddCrit
    },
    {
        name: 'Get All Crits',
        command: 'crits',
        mentions: 0,
        usage: 'crits',
        description: 'Get crits for all users.',
        handler: handleGetAllCrits
    },
    {
        name: 'Get Crits',
        command: 'crits',
        mentions: 1,
        usage: 'crits @user',
        description: 'Get crits for mentioned user.',
        handler: handleGetCrits
    },
    {
        name: 'Set Crits 20',
        command: 'set20',
        mentions: 1,
        usage: 'set20 @user amount',
        description: 'Set count of natural 20s to a specified amount for a given user.',
        critType: 'Crit20',
        handler: handleSetCrits
    },
    {
        name: 'Set Crits 1',
        command: 'set1',
        mentions: 1,
        usage: 'set1 @user amount',
        description: 'Set count of natural 1s to a specified amount for a given user.',
        critType: 'Crit1',
        handler: handleSetCrits
    },
    {
        name: 'Show Graph of 20s',
        command: 'graph20',
        mentions: 0,
        usage: 'graph20',
        description: 'Show a graph of natural 20s for all users.',
        critType: 'Crit20',
        handler: handleShowGraph
    },
    {
        name: 'Show Graph of 1s',
        command: 'graph1',
        mentions: 0,
        usage: 'graph1', 
        description: 'Show a graph of natural 1s for all users.',
        critType: 'Crit1',
        handler: handleShowGraph
    },
    {
        name: 'Help',
        command: 'helpcc',
        mentions: 0,
        usage: 'helpcc',
        description: 'Show help information.',
        handler: handleShowHelp
    }
]

export const isCommand = (command : Command, message : Message, prefix : string = '!') => {
    // Check for prefix
    if (!hasPrefix(prefix, message.content))
        return false

    // Check for command
    if (!hasPrefix(prefix + command.command, message.content))
        return false

    // Check for mentions
    if (command.mentions !== message.mentions.length)
        return false

    return true
}

export const hasPrefix = (prefix : string, str : string) =>
    str.slice(0, prefix.length) === prefix
