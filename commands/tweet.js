const embeds = require("../utilities/embeds");
require("dotenv").config();
var Twitter = require("twitter");

module.exports = {
	name: "tweet",
	description: "Make VukkyBot say things on twitter!",
	botPermissions: ["EMBED_LINKS", "MANAGE_MESSAGES"],
	cooldown: 120,
	execute(message, args) {
		if(args.slice(0).join(" ").length > 280) return message.channel.send(embeds.errorEmbed("Sorry, but that tweet's too long."));
		message.react("⬆");
		const filter = (reaction, user) => {
			return ["⬆"].includes(reaction.emoji.name) && user.id != message.author.id && user.bot == false;
		};
		message.awaitReactions(filter, { max: 1 })
			.then(collected => {
				message.reactions.removeAll();
				var client = new Twitter({
					consumer_key: process.env.TWITTER_KEY,
					consumer_secret: process.env.TWITTER_SECRET,
					access_token_key: process.env.TWITTER_ACCESS,
					access_token_secret: process.env.TWITTER_ACCESS_SECRET
				});
				client.post("statuses/update", {status: args.slice(0).join(" ")})
					.then(function (tweet) {
						message.react("✅");
						message.reply(`your tweet was approved by a user! Here it is: https://twitter.com/i/status/${tweet.id_str}`);
					})
					.catch(function (error) {
						throw error;
					});
			});
	},
};
