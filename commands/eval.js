const { errorEmbed } = require("../utilities/embeds");

module.exports = {
	name: "eval",
	description: "i uhh... actually have no idea what this does. some weird math thingy",
	botPermissions: ["EMBED_LINKS"],
	botOwnerOnly: true,
	args: true,
	disabled: true,
	async execute(message, args) {
		function clean(text) {
			if (typeof(text) === "string") {
				return text.replace(/`/g, `\`${  String.fromCharCode(8203)}`).replace(/@/g, `@${  String.fromCharCode(8203)}`);
			} else {
				return text;
			}
		}
		try {
			const code = args.join(" ");
			let evaled = eval(code);
			if (typeof evaled !== "string") {
				evaled = require("util").inspect(evaled);
			}
			if(`\`\`\`xl\n${clean(evaled)}\n\`\`\``.length > 2000) {
				return message.channel.send("the output was too long. but hey, no error? i think?");
			}
			console.log(`evalling ${code} from ${message.author.tag}`);
			message.channel.send(`\`\`\`xl\n${clean(evaled)}\n\`\`\``);
		} catch (err) {
			if(`\`\`\`xl\n${clean(err)}\n\`\`\``.length > 2000) {
				return message.channel.send("the output was too long... and there was an error?");
			}
			message.channel.send(errorEmbed(`\`\`\`xl\n${clean(err)}\n\`\`\``));
		}
	},
};
