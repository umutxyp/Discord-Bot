const Discord = require('discord.js');

module.exports.run = async (client, message, args) => {
message.reply({ content: "My Ping: " + client.ws.ping });
}

module.exports.conf = {
    aliases: []
}

module.exports.help = {
    name: "ping"
}
