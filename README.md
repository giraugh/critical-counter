# Critical Counter

Discord bot for keeping track of natural 20 and natural 1 rolls in Role Playing games.

## Usage

First [invite the bot to your server](https://critical-counter-3rz4fnszrq-ts.a.run.app)

Then run a `!help` command to list the available commands.

## Building and Running

To run this project you will require
- [Deno](http://deno.land)
- [Docker](http://docker.com)

Ensure the following binaries are on your PATH:
- `deno`
- `docker-compose`

Clone the repo

```bash
git clone http://github.com/retroverse/critical-counter.git
```

cd into the repo

```bash
cd critical-coutner
```

You will require a discord token to run the bot. Go to the [Discord Developer Console](https://discord.com/developers/applications), create an application, create a bot and copy the bot token. We will put the bot token in a `.env` file.

Create a `.env` file

```bash
touch .env
```

Use your preferred text editor to add the token to the `.env` file. It should look like the following with `<TOKEN>` replaced with your token

```env
DISCORD_TOKEN=<TOKEN>
```

# For Production

Build the containers

```bash
docker-compose build
```

Start the containers

```bash
docker-compose up
```

After a while you should see the bot come online.

# For Development

*For development purposes, [denon](https://github.com/denosaurs/denon) can be used to auto-restart the bot. If not using `denon`, replace any use of `denon` with `deno`*

When developing you can run the deno program outside of a container. However, you will have to update the environment variables so that it can find the database inside the postgres container. To do so, add the following line to the `.env` file.

```env
POSTGRES_HOST=localhost
```

Start the postgres database

```bash
docker-compose up postgres
```

Once the database is ready, in a seperate shell you can start the bot

```bash
denon run --allow-net --allow-read --allow-env main.ts
```

You should see the bot come online and automatically restart if you change any source files.

# Contributing

If you have a suggestion for this bot or have encountered a bug, please open a new issue after checking whether one exists for your problem.

Pull Requests are welcome :smiley:
