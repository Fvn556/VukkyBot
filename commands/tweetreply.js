const embeds = require("../utilities/embeds");
require("dotenv").config();
var Twitter = require("twitter");

module.exports = {
	name: "tweetreply",
	description: "Make VukkyBot reply to things things on twitter!",
	botPermissions: ["EMBED_LINKS", "MANAGE_MESSAGES"],
	cooldown: 120,
	aliases: ["replytweet"],
	execute(message, args) {
		if(args.slice(1).join(" ").length > 280) return message.channel.send(embeds.errorEmbed("Sorry, but that tweet's too long."));
		if(isNaN(args[0])) return message.channel.send(embeds.errorEmbed("Your Tweet ID isn't a number!"));
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
				client.post("statuses/update", {status: args.slice(1).join(" "), in_reply_to_status_id: args[0], auto_populate_reply_metadata: true})
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