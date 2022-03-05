const Discord = require('discord.js');
const db = require("orio.db")

module.exports.run = async (client, message, args) => {

if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply({ content: "You do not have permission to use this command." });

let channel = message.mentions.channels.first();
if(!channel) return message.reply({ content: "Please mention a channel." });

let guild = message.guild;
await db.set(`${guild.id}.logs`, channel.id);
return message.reply({ content: "Logging channel set." });

//embed example
// const embed = new Discord.MessageEmbed()
// .setTitle("Title")
// .setDescription("Description")
// .setColor("BLUE")
// .setTimestamp();
// message.channel.send({ embeds: [embed] });

}

module.exports.help = {
    name: "loginsetupopen"
}

module.exports.conf = {
    aliases: ["login-setup-open"]
}
