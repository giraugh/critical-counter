import { config } from '../deps.ts'

// Load .env config
const env = { ...config(), ...Deno.env.toObject() }
if (!env.DISCORD_TOKEN)
    throw Error('Expected DISCORD_TOKEN environment variable')

export const token = env.DISCORD_TOKEN
export const commands = {
    addCrit20: '!crit20',
    addCrit1: '!crit1',
    getCrits: '!crits',
    showGraph20: '!graph20',
    showGraph1: '!graph1',
    help: '!helpcc'
}

export const commandHelp = {
    addCrit20: {
        name: 'Add Crit 20',
        usage: commands['addCrit20'] + ' @user',
        description: 'Add a natural 20 for mentioned user.'
    },
    addCrit1: {
        name: 'Add Crit 1',
        usage: commands['addCrit1'] + ' @user',
        description: 'Add a natural 1 for mentioned user.'
    },
    getCrits: {
        name: 'Get Crits',
        usage: commands['getCrits'] + ' @user | ' + commands['getCrits'],
        description: 'Get crits for mentioned user or all users if no mention.'
    },
    showGraph20: {
        name: 'Show Graph of 20s',
        usage: commands['showGraph20'],
        description: 'Show a graph of natural 20s for all users.'
    },
    showGraph1: {
        name: 'Show Graph of 1s',
        usage: commands['showGraph1'],
        description: 'Show a graph of natural 1s for all users.'
    },
    help: {
        name: 'Help',
        description: 'Show help information.',
        usage: commands['help']
    }
}
