const { Client, Intents, Permissions, Collection } = require("discord.js");
const bioHandler = require('./bioHandler'); // Bio storage help


const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const config = require('./config.json');
const fs = require("fs");
const generated = new Set();
const server = require('./server.js');
const commands = require('./deploy-commands.js')
const { Client, GatewayIntentBits, Permissions, Collection } = require("discord.js");
const bioHandler = require('./bioHandler'); // Bio storage help

const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const config = require('./config.json');
const fs = require("fs");
const generated = new Set();
const server = require('./server.js');
const commands = require('./deploy-commands.js');

// ✅ Move `client` declaration ABOVE `client.commands`
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection(); // ✅ Now it's correctly placed

const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${config.status}`, { type: "WATCHING" }); // Set the bot's activity status
    /* You can change the activity type to:
     * LISTENING
     * WATCHING
     * COMPETING
     * STREAMING (you need to add a twitch.tv url next to type like this:   { type: "STREAMING", url: "https://twitch.tv/twitch_username_here"} )
     * PLAYING (default)
    */
});
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!setbio')) {
        const bio = message.content.replace('!setbio ', '');
        bioHandler.setBio(message.author.id, bio);
        message.reply(`Bio set: "${bio}".`);
    }
});
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.member) return;

    const userId = newPresence.member.id;
    const requiredStatus = "online"; // Change this to your required status

    const roleToAssign = newPresence.guild.roles.cache.find(r => r.name === "SpecialRole");

    if (newPresence.status === requiredStatus && bioHandler.isBioValid(userId)) {
        await newPresence.member.roles.add(roleToAssign);
        console.log(`✅ Assigned ${roleToAssign.name} to ${newPresence.member.user.tag}`);
    } else {
        await newPresence.member.roles.remove(roleToAssign);
        console.log(`❌ Removed ${roleToAssign.name} from ${newPresence.member.user.tag}`);
    }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.token || token);

