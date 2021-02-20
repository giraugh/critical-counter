import { startBot, Message } from './deps.ts'
import { token, commands } from './src/config.ts'
import {
    isCommandWithMention,
    isCommandWithoutMention,
    handleCritCommand,
    handleGetCommand,
    handleGetAllCommand,
    handleShowGraphCommand,
    handleHelpCommand
} from './src/commands.ts'

const ready = () => console.log('Bot connected to Discord')

const messageCreate = (message : Message) => {
    // Check for commands
    const isCrit20Comm = isCommandWithMention(commands.addCrit20, message)
    const isCrit1Comm = isCommandWithMention(commands.addCrit1, message)
    const isGetComm = isCommandWithMention(commands.getCrits, message)
    const isGetAllComm = isCommandWithoutMention(commands.getCrits, message)
    const isGraph20sComm = isCommandWithoutMention(commands.showGraph20, message)
    const isGraph1sComm = isCommandWithoutMention(commands.showGraph1, message)
    const isHelpComm = isCommandWithoutMention(commands.help, message)

    // Handle add commands
    if (isCrit20Comm || isCrit1Comm)
        handleCritCommand(message, isCrit20Comm ? 'Crit20' : 'Crit1')

    // handle get command
    if (isGetComm)
       handleGetCommand(message)

    // handle get all command
    if (isGetAllComm)
        handleGetAllCommand(message)

    // handle show graph command
    if (isGraph1sComm || isGraph20sComm)
        handleShowGraphCommand(message, isGraph20sComm ? 'Crit20' : 'Crit1')

    if (isHelpComm)
        handleHelpCommand(message)
}

startBot({
    token,
    intents: ['GUILDS', 'GUILD_MESSAGES'],
    eventHandlers: {ready, messageCreate}
})
