const { Client, Intents, Permissions, Collection } = require("discord.js");
const bioHandler = require("./bioHandler"); // Bio storage helper
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const config = require("./config.json");
const fs = require("fs");
const server = require("./server.js");
const commands = require("./deploy-commands.js");

// ✅ Initialize client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// ✅ Commands Collection (Removes duplicates)
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// ✅ Bot Ready Event
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`${config.status}`, { type: "WATCHING" });
});

// ✅ Message Command: Set Bio
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith("!setbio")) {
        const bio = message.content.replace("!setbio ", "");
        bioHandler.setBio(message.author.id, bio);
        message.reply(`Bio set: "${bio}".`);
    }
});

// ✅ Presence Update: Assign/Remove Role Based on Bio & Status
client.on("presenceUpdate", async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.member) return;
    const userId = newPresence.member.id;
    const requiredStatus = "online";
    const roleToAssign = newPresence.guild.roles.cache.find((r) => r.name === "SpecialRole");

    if (newPresence.status === requiredStatus && bioHandler.isBioValid(userId)) {
        await newPresence.member.roles.add(roleToAssign);
        console.log(`✅ Assigned ${roleToAssign.name} to ${newPresence.member.user.tag}`);
    } else {
        await newPresence.member.roles.remove(roleToAssign);
        console.log(`❌ Removed ${roleToAssign.name} from ${newPresence.member.user.tag}`);
    }
});

// ✅ Command Interaction Handling
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

// ✅ Start bot
client.login(process.env.TOKEN || config.token);
