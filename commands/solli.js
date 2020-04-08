const discord = require("discord.js");
module.exports.run = async (bot, message, args) => {

    return message.channel.send("Wil jij solliciteren? ");
}

module.exports.help = {
    name: "solliciteer"
}
