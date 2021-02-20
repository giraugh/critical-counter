import { startBot, Message } from './deps.ts'
import { serve } from './deps.ts'
import { token } from './src/config.ts'
import { handleMessage } from './src/handlers.ts'

const ready = () =>
    console.log('Bot connected to Discord')

const messageCreate = (message : Message) => {
    handleMessage(message)
}

startBot({
    token,
    intents: ['GUILDS', 'GUILD_MESSAGES'],
    eventHandlers: {ready, messageCreate}
})

// We start a web server to placate the overloads at google.com
console.log('Starting web server...')
const s = serve({ port: 8080 })
for await (const req of s) {
    const headers = new Headers()
    headers.set('Location', 'https://discord.com/oauth2/authorize?client_id=798390200585289749&scope=bot&permissions=22592')
    req.respond({
        status: 302,
        headers,
        body: ''
    })
    
}
