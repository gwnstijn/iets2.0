module.exports.run = async (bot, message, args) => {

    const archief = "695324582504038500";

    var type = args[0];

    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Je hebt geen toegang tot dit commando!");

    // Als bericht in ticket kanaal is dan verwijder kanaal ander zend bericht
    if (message.channel.parentID == "695320319480823818") {
        try {
            if (type.toLowerCase() == "ARCHIEF".toLowerCase()) {
                message.channel.setParent(archief).then((settedParent) => {

                // Zet perms voor support team
                settedParent.overwritePermissions(message.guild.roles.find("id", "695210987476746281"), {
                    "READ_MESSAGES": false
                });

                // Zet perms voor user
                settedParent.overwritePermissions(bot.users.find(user => user.username === message.channel.name.split("-")[0].substr(1)), {
                    "READ_MESSAGES": false
                });
                
                }).catch(err => {
                    console.error("Fout bij sluiten ticket -> " + err);
                });
                return message.channel.send("Succesvol verplaatst naar het archief!");
            } else if (type.toLowerCase() == "PRULLENBAK".toLowerCase()) {
                return message.channel.delete();
            }
        } catch(error) {
            return message.channel.send("Kies uit ARCHIEF of PRULLENBAK!");
        };

    } else {
        message.channel.send("Gelieve dit commando in een ticket kanaal te doen. (Is het een bot bestelling, dan graag zorgen dat de bestelling eerst wordt afgesloten!)");
    }
}

module.exports.help = {
    name: "close",
    description: "Sluit een ticket.",
}
