const Discord = require('discord.js');
const ms = require('ms');
module.exports.run = async (client, message, args) => {

    if(!message.member.permissions.has("ADMINISTRATOR")) return message.reply("You do not have permission to use this command.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]); 
    if(!member) return message.reply("Please mention a member.");
    
    let time = args[1]
    if(!time) return message.reply("Please enter a time.");
    time = ms(time);
    if(!time) return message.reply("Please enter a valid time.");

    let reason = args.slice(2).join(" ");
    if(!reason) return message.reply("Please provide a reason.");

    member.timeout(time, reason)
    .then(() => {

    let embed = new Discord.MessageEmbed()
    .setTitle("User Timeout")
    .setDescription(`${member.user.tag} has been timed out for ${ms(time, { long: true })}.`)
    .addField("Reason", reason)
    .setColor("RED")
    .setTimestamp();
    message.channel.send({ embeds: [embed] });

    })
    .catch(err => {
    return message.reply("An error occured.");
    });

}
module.exports.conf = {
    aliases: []
}

module.exports.help = {
    name: "timeout"
}
