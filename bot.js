const {
  Client,
  Intents,
  MessageEmbed,
  Collection,
  Message,
} = require("discord.js");

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

//test command
client.on("messageCreate", async (msg) => {
  if (msg.guild) {
    if (!msg.author.bot) {
      if (msg.content.includes("!test")) {
        msg.reply({ content: "Test message." });
      }
    }
  }
});

//ping command
client.on("messageCreate", async (msg) => {
  if (msg.guild) {
    if (!msg.author.bot) {
      if (msg.content.includes("!ping")) {
        msg.reply({ content: "My Ping: " + client.ws.ping });
      }
    }
  }
});

//embed message
client.on("messageCreate", async (msg) => {
  if (msg.guild) {
    if (!msg.author.bot) {
      if (msg.content.includes("!embed")) {
        const embed = new MessageEmbed()
          .setTitle("Embed Title")
          .setColor("BLUE")
          .setDescription("test message..")
          .setThumbnail(client.user.displayAvatarURL())
          .setTimestamp();
        msg.channel.send({ embeds: [embed] });
      }
    }
  }
});
