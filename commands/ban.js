const embeds = require("../utilities/embeds");
const vukkytils = require("../utilities/vukkytils");

module.exports = {
	name: "ban",
	description: "ban someone",
	botPermissions: ["EMBED_LINKS", "BAN_MEMBERS"],
	userPermissions: ["BAN_MEMBERS"],
	guildOnly: true,
	args: true,
	usage: "<@user> [reason]",
	cooldown: 0,
	execute(message, args) {
		var mentionedUser = message.guild.member(message.mentions.users.first());
		var banReason = args.slice(1).join(" ") || "no reason specified";
		if (!mentionedUser) return message.channel.send(vukkytils.getString("PING_REQUIRED"));
		if(mentionedUser.id === message.author.id) return message.channel.send(vukkytils.getString("CANT_BAN_SELF"));
		if(mentionedUser.id === message.client.user.id) return message.channel.send(vukkytils.getString("BOT_PAIN"));
		if(mentionedUser.user.bot === true && !mentionHighestRole >= authorHighestRole) message.channel.send("ban the bot ban the bot ban the bot ban the bot aaaaa");

		var authorHighestRole = message.member.roles.highest.position;
		var mentionHighestRole = mentionedUser.roles.highest.position;
		if(mentionHighestRole >= authorHighestRole) return message.channel.send("you cant ban members with an equal or higher position than you");
		if(!mentionedUser.bannable) return message.channel.send("i cant ban this person");

		mentionedUser.send(`you got banned (smh) from **${message.guild.name}**${(banReason !== "no reason specified") ? ` for ${banReason}.` : "."}`)
			.then(() => iHateThis())
			.catch(() => iHateThis());

		function iHateThis() {
			mentionedUser.ban({reason: `done by ${message.author.tag} - ${banReason}`})
				.then(message.channel.send(embeds.successEmbed(`banned <@${mentionedUser.id}> (${mentionedUser.id}) from **${message.guild.name}**${(banReason !== "no reason specified") ? `, for ${banReason}.` : "."}`)));
		}
	},
};
