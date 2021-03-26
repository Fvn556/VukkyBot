let config = require("../config.json");
require("dotenv").config();
var mysql = require("mysql");
const fs = require("fs");
var sql;
const vukkytils = require("./vukkytils");

module.exports = {
	init: function() {
		if (!config.misc.mysql) {
			if (config.misc.remoteSettings) {
				console.log("[cfg] remoteSettings is enabled but mysql is disabled! Exiting...");
				process.exit(1);
			} else {
				console.log("[cfg] Ready!");
			}
		} else {
			if (config.misc.remoteSettings) {
				let con = mysql.createConnection({
					host: process.env.SQL_HOST,
					user: process.env.SQL_USER,
					password: process.env.SQL_PASS,
					database: process.env.SQL_DB
				});
		
				sql = "CREATE TABLE settings (cfg VARCHAR(255), cfgvalue VARCHAR(255))";
				con.query(sql, function (err, result) {
					if (err) {
						if(err.code == "ER_TABLE_EXISTS_ERROR") {
							console.log("[cfg] Table already exists");
						} else {
							console.log(err);
							console.log("[cfg] Table creation failed.");
						}
					} else {
						console.log("[cfg] Table created");
					}
				});
				con.end();
				console.log("[cfg] ready");
			}
		}
		delete require.cache[require.resolve("../config.json")];
		config = require("../config.json");
	},
	set: function(optionName, value) {
		let config = require("../config.json");
		console.log("I have been called");
		if (!config.misc.remoteSettings) {
			let h = `config.${optionName}`;
			
			if (eval(h)) {
				console.log("CHANGING: ", eval(h = value));
				//eval(h = value);
				config.counting.channelName = "fucking work pls";
				fs.writeFile("../config.json", JSON.stringify(config, null, 4), function writeJSON(err) {
					console.log(JSON.stringify(config, null, 4));
					if (err) return console.log(err);
				});
			}
		} else {
			console.log("mysql");
			let con = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
	
			sql = `SELECT * FROM settings WHERE cfg = "${optionName}"`;
			con.query(sql, function (err, result) {
				if (err) console.log(err);
				if (result.lenght > 0) {
					if(optionName != "misc.owner") {
						sql = `UPDATE settings set cfgvalue = ${value} WHERE cfg = ${optionName}`;
						con.query(sql, function (err, result) {
							if (err) {
								console.log(err);
							}
						});
						
						con.end();
					} else {
						sql = `DELETE FROM settings WHERE cfg = "${optionName}"`;
						con.query(sql, function (err, result) {
							if (err) {
								console.log("Oopsie has happened!");
								console.log(err);
							}
						});
						for (let i = 0; i < value.length; i++) {
								
							sql = `INSERT INTO settings(cfg, cfgvalue) VALUES ("${optionName}", "${value[i]}")`;
							
							con.query(sql, function (err, result) {
								if (err) {
									console.log("fuck");
									console.log(err);
								}
							});
						}
						
						con.end();
					}
				} else {
					if(optionName != "misc.owner") {
						sql = `INSERT INTO settings(cfg, cfgvalue) VALUES ("${optionName}", "${value}")`;
							
						con.query(sql, function (err, result) {
							if (err) {
								console.log("Oopsie has happened!");
								console.log(err);
							}
						});
						
						con.end();
					} else {
						
						sql = `DELETE FROM settings WHERE cfg = "${optionName}"`;
						con.query(sql, function (err, result) {
							if (err) {
								console.log("Oopsie has happened!");
								console.log(err);
							}
						});
						for (let i = 0; i < value.length; i++) {
								
							sql = `INSERT INTO settings(cfg, cfgvalue) VALUES ("${optionName}", "${value[i]}")`;
							
							con.query(sql, function (err, result) {
								if (err) {
									console.log("fuck");
									console.log(err);
								}
							});
						}
						
						con.end();
					}
				}
			});
		}
		delete require.cache[require.resolve("../config.json")];
		config = require("../config.json");
	},
	get: async function(optionName) {
		let config = require("../config.json");
		if (!config.misc.remoteSettings) {
			return eval(`config.${optionName}`);
		} else {


			//promise begin
			let everythingIsFine = new Promise((resolve, reject) => {
				let con = mysql.createConnection({
					host: process.env.SQL_HOST,
					user: process.env.SQL_USER,
					password: process.env.SQL_PASS,
					database: process.env.SQL_DB
				});
		
				sql = `SELECT * FROM settings WHERE cfg = "${optionName}"`;
				con.query(sql, function (err, result) {
					if (err) console.log(err);
					if (result.length == 0) {
						console.log("config option doesnt exist, creating it.");
	
						if (optionName != "misc.owner") {
							sql = `INSERT INTO settings(cfg, cfgvalue) VALUES ("${optionName}", "${eval(`config.${optionName}`)}")`;
							
							con.query(sql, function (err, result) {
								if (err) {
									console.log("fuck");
									console.log(err);
								}
							});
							resolve(eval(`config.${optionName}`));
						} else {
							let outputArray = [];
							for (let i = 0; i < config.misc.owner.length; i++) {
								
								sql = `INSERT INTO settings(cfg, cfgvalue) VALUES ("${optionName}", "${config.misc.owner[i]}")`;
								
								con.query(sql, function (err, result) {
									if (err) {
										console.log("fuck");
										console.log(err);
									}
								});
								outputArray.push(config.misc.owner[i]);
							}
							resolve(outputArray);

						}
						con.end();
					} else {
						con.end();
						
						if (result[0].cfg == "misc.owner") {
							let outputArray = [];
							for (let i= 0; i < result.length; i++) {
								outputArray.push(result[i].cfgvalue);
							}
							resolve(outputArray);
						} else {
							resolve(result[0].cfgvalue);
						}
					}
				});
			}); // promise end
			delete require.cache[require.resolve("../config.json")];
			config = require("../config.json");
			return await everythingIsFine;
		}
	}

};
