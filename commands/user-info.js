const { MessageEmbed } = require("discord.js");
module.exports.run = async (client, message, args) => {
  let user =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]) ||
    message.member;

  const embed = new MessageEmbed()
    .setTitle(user.user.tag + " User Info")
    .setColor("BLUE")
    .setThumbnail(user.user.displayAvatarURL())
    .setDescription(
      `**User ID: \`${user.id}\`
    User Server Joined Time: <t:${user.joinedTimestamp}:f>
    User Account Created Time: <t:${user.user.createdTimestamp}:f>
    Member Roles Count: \`${user.roles.cache.size}\`
    Member Server Name: \`${user.nickname || user.user.username}\`
    Member Permissions: \`${user.permissions.toArray()}\`\n
    Roles: ${user.roles.cache.map((cs) => cs)}
    **`
    )
    .setTimestamp();
  message.channel.send({ embeds: [embed] });
};

module.exports.help = {
  name: "user-info",
};
module.exports.conf = {
  aliases: ["userinfo"],
};
