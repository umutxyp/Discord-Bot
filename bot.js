const { Client, Intents, MessageEmbed } = require("discord.js")

const client = new Client({
    intents:[
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

const config = require("./config.js")
client.login(config.TOKEN)

client.on("ready", async () => {
console.log("Im Login!")
client.user.setActivity("Hello World!")
})



//test command
client.on("messageCreate", async msg => {
if(msg.guild){
if(!msg.author.bot){
if(msg.content.includes("!test")){
msg.reply({content:"Test message."})
}}}
})

//ping command
client.on("messageCreate", async msg => {
if(msg.guild){
if(!msg.author.bot){
if(msg.content.includes("!ping")){
msg.reply({content:"My Ping: "+client.ws.ping})
}}}
})


//embed message
client.on("messageCreate", async msg => {
if(msg.guild){
if(!msg.author.bot){
if(msg.content.includes("!embed")){

const embed = new MessageEmbed()
.setTitle("Embed Title")
.setColor("BLUE")
.setDescription("test message..")
.setThumbnail(client.user.displayAvatarURL())
.setTimestamp()
msg.channel.send({ embeds:[embed] })

}}}
})
    
