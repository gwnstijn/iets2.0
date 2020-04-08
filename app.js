/*
Bot gemaakt door Casper voor Egghosting.
Graag niks wijzigingen zonder toestemming van de developer.
*/

//Discord setup & load botConfig
const discord = require("discord.js");
const botConfig = require("./botconfig.json");
const fs = require("fs");

const bot = new discord.Client();
bot.commands = new discord.Collection();

//SETUP FOR MUSIC
const queue = new Map();

//Load all the commands.
fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if (jsFiles.length <= 0) {
        console.log("Geen commando's gevonden!");
        return;
    }

    jsFiles.forEach((f, i) => {

        var fileGet = require(`./commands/${f}`);
        console.log(`Het commando ${f} is geladen!`);

        bot.commands.set(fileGet.help.name, fileGet);
    })
});

bot.on('error', console.error);

//Bot klaar met laden bericht & status -> FREE
bot.on("ready", async () => {

    console.log(`${bot.user.username} is klaar voor gebruik!`);

    bot.user.setActivity("Naar !help", {
        type: "WATCHING"
    });

    /*setInterval(() => {
        let guild = bot.guilds.find(guild => guild.name === "The Dutch Mannekes");
        var kanal = guild.channels.find("id", "509242364699607068");
        kanal.send(`!disboard bump`);
    }, 10000); // Runs this every 10 seconds.*/
});

//Joinmessage & rol
bot.on("guildMemberAdd", member => {

    //WELKOMS BERICHT ;)

    const channel = member.guild.channels.find("id", "695196273057202243");

    if (!channel) return console.log("Oeps! Het welkomskanaal is niet gevonden!");
    //FETCH MEMBER COUNT -> #member
        member.guild.fetchMembers().then(g => {
            let count = 0;
            g.members.forEach((member) => {
                count++;
            });
            var icon = member.guild.iconURL;
            var joindate = member.joinedAt.toString().split(" ");

            var joinEmbed = new discord.RichEmbed()
                    .setAuthor("Welkom op kinkercraft!", icon)
                    .setColor("#29e53f")
                    .setDescription(`Welkom ${member}!`)
                    .addField("Jouw joindatum:", `${joindate[2]} ${joindate[1]} ${joindate[3]} ${joindate[4]}`)
                    .setFooter(`Je bent lid nummer #${count}!`);
                
            channel.send(joinEmbed);
        });
});

//Commando's aan het bekijken. ;)
bot.on("message", async message => {

    var prefix = botConfig.prefix;

    //IDEEEN KANAAL
    if (message.channel.id == "695610426628505611") {
        var idee = message.cleanContent;
        message.delete(1000);

        var kickEmbed = new discord.RichEmbed()
            .setTitle("Suggestie van " + message.author.username)
            .addField("Uitleg:", idee)
            .setColor("FFFF00")
            .setTimestamp(message.timestamp);

        var kickChannel = message.guild.channels.find("id", "695610426628505611");
        if (!kickChannel) return console.error("suggestiekanaal niet gevonden!");

        kickChannel.send({
            embed: kickEmbed
        }).then(embedMessage => {
            embedMessage.react("👍");
            embedMessage.react("👎");
        });
    }

    if (!message.content.includes(prefix)) return;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var arguments = messageArray.slice(1);

    var commands = bot.commands.get(command.slice(prefix.length));

    if (commands) commands.run(bot, message, arguments, queue);

});

try {

    //message deleted
    bot.on('messageDelete', function(message) {
		
		if (message.author.bot) return;

        if (message.channel.type == 'text') {
            var bericht = "Onbekend";
            if (message.cleanContent != "") {
                if (message.cleanContent.length < 950) {
                    bericht = message.cleanContent;
                }
            }

            var banEmbed = new discord.RichEmbed()
                .setTitle("LOG: Bericht verwijderd")
                .setColor("#ff8000")
                .addField("Gebruiker:", message.author)
                .addField("Kanaal:", message.channel)
                .addField("Bericht:", bericht);

            var banChannel = message.guild.channels.find("id", botConfig.logkanaal);
            if (!banChannel) return console.error("Logkanaal niet gevonden!");
            banChannel.send(banEmbed);
        }

    });

    //message update
    bot.on('messageUpdate', function(oldMessage, newMessage) {
	
		if (oldMessage.author.bot) return;
		if (newMessage.author.bot) return;

        if (newMessage.channel.type == 'text' && newMessage.cleanContent != oldMessage.cleanContent) {
            var bericht1 = "Onbekend";
            if (oldMessage.cleanContent != "") {
                if (oldMessage.cleanContent.length < 950) {
                    bericht1 = oldMessage.cleanContent;
                }
            }

            var bericht2 = "Onbekend";
            if (newMessage.cleanContent != "") {
                if (newMessage.cleanContent.length < 950) {
                    bericht2 = newMessage.cleanContent;
                }
            }

            var banEmbed = new discord.RichEmbed()
                .setTitle("LOG: Bericht gewijzigd")
                .setColor("#ff8000")
                .addField("Gebruiker:", newMessage.author)
                .addField("Kanaal:", newMessage.channel)
                .addField("Oude bericht:", bericht1)
                .addField("Nieuwe bericht:", bericht2);

            var banChannel = newMessage.guild.channels.find("id", botConfig.logkanaal);
            if (!banChannel) return console.error("Logkanaal niet gevonden!");
            banChannel.send(banEmbed);
        }

    });

    //user has joined a guild
    bot.on('guildMemberAdd', function(user) {
        var banEmbed = new discord.RichEmbed()
            .setTitle("LOG: Gebruiker gejoined")
            .setColor("#ff8000")
            .addField("Gebruiker:", user);

        var banChannel = user.guild.channels.find("id", botConfig.logkanaal);
        if (!banChannel) return console.error("Logkanaal niet gevonden!");
        banChannel.send(banEmbed);

    });

    //user has joined a guild
    bot.on('guildMemberRemove', function(user) {

        var banEmbed = new discord.RichEmbed()
            .setTitle("LOG: Gebruiker geleaved")
            .setColor("#ff8000")
            .addField("Gebruiker:", user);

        var banChannel = user.guild.channels.find("id", botConfig.logkanaal);
        if (!banChannel) return console.error("Logkanaal niet gevonden!");
        banChannel.send(banEmbed);
    });

    //user in a guild has been updated
    bot.on('guildMemberUpdate', function(oldMember, newMember) {

        //declare changes
        var Changes = {
            unknown: 0,
            addedRole: 1,
            removedRole: 2,
            username: 3,
            nickname: 4
        };
        var change = Changes.unknown;

        //check if roles were removed
        var removedRole = '';
        oldMember.roles.forEach(function(value) {
            if (!newMember.roles.find('id', value.id)) {
                change = Changes.removedRole;
                removedRole = value.name;
            }
        });

        //check if roles were added
        var addedRole = '';
        newMember.roles.forEach(function(value) {
            if (!oldMember.roles.find('id', value.id)) {
                change = Changes.addedRole;
                addedRole = value.name;
            }
        });

        //check if username changed
        if (newMember.user.username != oldMember.user.username)
            change = Changes.username;

        //check if nickname changed
        if (newMember.nickname != oldMember.nickname)
            change = Changes.nickname;

        //log to console
        switch (change) {
            case Changes.unknown:
                var banEmbed = new discord.RichEmbed()
                    .setTitle("LOG: Gebruiker gewijzigd")
                    .setColor("#ff8000")
                    .addField("Gebruiker:", newMember.user)
                    .addField("Wat?", "Onbekend");

                var banChannel = newMember.guild.channels.find("id", botConfig.logkanaal);
                if (!banChannel) return console.error("Logkanaal niet gevonden!");
                banChannel.send(banEmbed);
                break;
            case Changes.addedRole:
                var banEmbed = new discord.RichEmbed()
                    .setTitle("LOG: Gebruiker gewijzigd")
                    .setColor("#ff8000")
                    .addField("Gebruiker:", newMember.user)
                    .addField("Wat?", "Rol toegevoegd -> " + addedRole);

                var banChannel = newMember.guild.channels.find("id", botConfig.logkanaal);
                if (!banChannel) return console.error("Logkanaal niet gevonden!");
                banChannel.send(banEmbed);
                break;
            case Changes.removedRole:
                var banEmbed = new discord.RichEmbed()
                    .setTitle("LOG: Gebruiker gewijzigd")
                    .setColor("#ff8000")
                    .addField("Gebruiker:", newMember.user)
                    .addField("Wat?", "Rol verwijderd -> " + removedRole);

                var banChannel = newMember.guild.channels.find("id", botConfig.logkanaal);
                if (!banChannel) return console.error("Logkanaal niet gevonden!");
                banChannel.send(banEmbed);
                break;
            case Changes.username:
                var banEmbed = new discord.RichEmbed()
                    .setTitle("LOG: Gebruiker gewijzigd")
                    .setColor("#ff8000")
                    .addField("Gebruiker:", newMember.user)
                    .addField("Wat?", "Naam gewijzigd van `" + oldMember.user +
                        '` naar `' + newMember.user + "`");

                var banChannel = newMember.guild.channels.find("id", botConfig.logkanaal);
                if (!banChannel) return console.error("Logkanaal niet gevonden!");
                banChannel.send(banEmbed);
                break;
            case Changes.nickname:
                if (oldMember.nickname == null) {
                    var row = `Nicknaam gewijzigd van \`geen\` naar \`${newMember.nickname}\`.`;
                } else if (newMember.nickname == null) {
                    var row = `Nicknaam gewijzigd van \`${oldMember.nickname}\` naar \`geen\`.`;
                } else {
                    var row = `Nicknaam gewijzigd van \`${oldMember.nickname}\` naar \`${newMember.nickname}\`.`;
                }
                var banEmbed = new discord.RichEmbed()
                    .setTitle("LOG: Gebruiker gewijzigd")
                    .setColor("#ff8000")
                    .addField("Gebruiker:", newMember.user)
                    .addField("Wat?", row);

                var banChannel = newMember.guild.channels.find("id", botConfig.logkanaal);
                if (!banChannel) return console.error("Logkanaal niet gevonden!");
                banChannel.send(banEmbed);
                break;
        }

    });

} catch (error) {
    console.error(error);
};

bot.login(process.env.token);
