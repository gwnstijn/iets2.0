const discord = require("discord.js");
const botConfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Oeps! Jij mag dit niet!");

    var aantal = args[0];

    if (!aantal) return message.channel.send("Geef een aantal op.")

    message.channel.fetchMessages({limit:aantal})
        .then(messages => {
            message.channel.bulkDelete(messages);
            message.channel.send(`Succesvol ${aantal} berichten verwijderd!`).then(message => {
                message.delete(1000);
            })
        }).catch(error => {
            return message.channel.send(`Oeps! Verwijderen van ${aantal} berichten is mislukt!`);
        })

    var warnEmbed = new discord.RichEmbed()
        .setTitle("Kanaal gecleared")
        .setColor("#ee0000")
        .addField("Door:", message.author)
        .addField("Kanaal:", message.channel)
        .addField("Aantal:", aantal);

        var warnChannel = message.guild.channels.find("id", botConfig.strafkanaal);
    if (!warnChannel) return message.guild.send("Logkanaal niet gevonden!");

    warnChannel.send(warnEmbed);

}

module.exports.help = {
    name: "clear",
    description: "Verwijder een aantal berichten in een kanaal.",
    perm: "admin",
    sortcount: 9,
    cata: "staff"
}