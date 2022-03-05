const {
  Client,
  Intents,
  MessageEmbed,
  Collection,
  Message,
  WebhookClient
} = require("discord.js");

const db = require("orio.db")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const config = require("./config.js");
client.login(config.TOKEN);

client.commands = new Collection();
client.aliases = new Collection();

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  let command = message.content.split(" ")[0].slice(config.prefix.length);
  let params = message.content.split(" ").slice(1);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    cmd.run(client, message, params);
  }
});

const fs = require("fs");
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  console.log(`total ${files.length} commands!`);
  files.forEach((f) => {
    let props = require(`./commands/${f}`);
    console.log(`${props.help.name} active command.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

//status comamnd
client.on("ready", async () => {
  console.log("Im Login!");
  client.user.setActivity("Hello World!");
});



client.on("guildMemberAdd", async member => {
const guild = member.guild;
const data = db.get(`${guild.id}.logs`);
if(!data) return;

const channel = guild.channels.cache.get(data);
if(!channel) return;

const embed = new MessageEmbed()
.setTitle("Member Joined")
.setColor("GREEN")
.setThumbnail(member.user.displayAvatarURL())
.setDescription(`${member.user.tag} has joined the server.`)
.setTimestamp();
channel.send({ embeds: [embed] });


})


client.on("guildMemberRemove", async member => {
const guild = member.guild;
const data = db.get(`${guild.id}.logs`);
if(!data) return;

const channel = guild.channels.cache.get(data);
if(!channel) return;

const embed = new MessageEmbed()
.setTitle("Member Left")
.setColor("RED")
.setThumbnail(member.user.displayAvatarURL())
.setDescription(`${member.user.tag} has left the server.`)
.setTimestamp();
channel.send({ embeds: [embed] });

})
