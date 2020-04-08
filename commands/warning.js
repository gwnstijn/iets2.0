const discord = require("discord.js");
const fs = require("fs");
const botConfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {
    const warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"));

    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Oeps! Jij mag dit niet!");
    
    var user = message.guild.member(message.mentions.users.first());

    if (!user) return message.channel.send("Oeps! Die speler bestaat niet!");

    if (user.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Oeps! Jij mag deze persoon niet warnen!");

    var reason = args.join(" ").slice(22);

    if (!reason) return message.channel.send("Geef een reden op.")

    if (!warns[user.id]) warns[user.id] = {
        warns: 0
    }

    warns[user.id].warns++;

    fs.writeFile("./warnings.json", JSON.stringify(warns), (err) => {
        if (err) console.log(err);
    });

    var warnEmbed = new discord.RichEmbed()
        .setTitle("Gebruiker gewarned")
        .setColor("#ee0000")
        .addField("Gebruiker:", user)
        .addField("Gewarned door:", message.author)
        .addField("Totaal aantal warns:", warns[user.id].warns)
        .addField("Reden:", reason);

        var warnChannel = message.guild.channels.find("id", botConfig.strafkanaal);
    if (!warnChannel) return message.guild.send("Logkanaal niet gevonden!");

    warnChannel.send(warnEmbed);

    var banEmbed2 = new discord.RichEmbed()
        .setTitle("U heeft een warn ontvangen in TheKingdom!")
        .setColor("#ee0000")
        .addField("Reden:", reason);
        
        user.send(banEmbed2).then(function() {
            return message.channel.send("Deze gebruiker is succesvol gewarned en heeft hier bericht van gekregen!");
        }).catch(function() {
            return message.channel.send("Deze gebruiker is succesvol gewarned, maar heeft hier GEEN bericht van gekregen!");
        });

    if (warns[user.id].warns == 3) {
		message.channel.send(`Attentie ${user.user}! Nog 1 warn, en je hebt een ban!`);
    } else if (warns[user.id].warns == 4) {
        message.guild.member(user).ban(reason);
        message.channel.send(`${user.user} is verbannen, omdat deze persoon 4 warns heeft!`);
    }

}

module.exports.help = {
    name: "warn",
    description: "Geef een speler een warn.",
    perm: "admin",
    sortcount:1,
    cata: "staff"
}