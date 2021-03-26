const http = require("http");
const fs = require("fs");
const url = require("url");
const fetch = require("node-fetch");
const config = require("./dashboard/static/dashboard.json");
const api = require("./utilities/config");
const port = config.port;
require("dotenv").config();

var sessions = {};

console.log("Starting server...");
http.createServer((req, res) => {
	if(req.method != "POST") {
		let responseCode = 404;
		let content = "404 Error";
		const urlObj = url.parse(req.url, true);
		if (urlObj.pathname === "/panel") {
			if (urlObj.query.code) {
				const accessCode = urlObj.query.code;
				const data = {
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					grant_type: "authorization_code",
					redirect_uri: config.redirect_uri,
					code: accessCode,
					scope: "identify",
				};

				fetch("https://discord.com/api/oauth2/token", {
					method: "POST",
					body: new URLSearchParams(data),
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				})
					.then(discordRes => discordRes.json())
					.then(info => {
						sessions[accessCode] = {};
						sessions[accessCode].active = true;
						sessions[accessCode].info = info;
						
						return info;
					})
					.then(info => fetch("https://discord.com/api/users/@me", {
						headers: {
							authorization: `${info.token_type} ${info.access_token}`,
						},
					}))
					.then(userRes => userRes.json())
					.then(userRes => {
						if (isValidUser(userRes)) {
							responseCode = 200;
							content = fs.readFileSync("./dashboard/html/panel.html");
							res.writeHead(responseCode, {
								"content-type": "text/html;charset=utf-8",
							});
				
							res.write(content);
							res.end();
						} else {
							responseCode = 200; 
							content = fs.readFileSync("./dashboard/html/403.html");
							res.writeHead(responseCode, {
								"content-type": "text/html;charset=utf-8",
							});
				
							res.write(content);
							res.end();
						}
					});
			}
		} else {
			if (urlObj.pathname === "/") {
				responseCode = 200;
				//console.log(infoJson);
				content = fs.readFileSync("./dashboard/html/index.html");
				res.writeHead(responseCode, {
					"content-type": "text/html;charset=utf-8",
				});
		
				res.write(content);
				res.end();
			} else if (urlObj.pathname === "/loggedout") {
				responseCode = 200;
				content = fs.readFileSync("./dashboard/html/loggedout.html");
				res.writeHead(responseCode, {
					"content-type": "text/html;charset=utf-8",
				});
		
				res.write(content);
				res.end();
			} else {
				fs.readFile(`${__dirname }/dashboard/static/${req.url}`, function (err,data) {
					if (err) {
						res.writeHead(404);
						res.end(JSON.stringify(err));
						return;
					}
					res.writeHead(200);
					res.end(data);
				});
				
			}
		}
	} else {
		//console.log(req);
		if(req.url == "/gimmedata") {
			let body = "";
			req.on("data", chunk => {
				body += chunk.toString(); // convert Buffer to string
			});
			req.on("end", () => {
				let sid = decodeReq(body);
				res.end(JSON.stringify(sessions[sid]));
			});
		}
		if(req.url == "/logout") {
			let body = "";
			req.on("data", chunk => {
				body += chunk.toString(); // convert Buffer to string
			});
			req.on("end", () => {
				let sid = decodeReq(body);
				if (sessions[sid]) {
					if (sessions[sid].active) {
						sessions[sid].active = false;
					}
				}
				res.end("Logged Out");
			});
		}
		if(req.url == "/set") {
			let body = "";
			req.on("data", chunk => {
				body += chunk.toString(); // convert Buffer to string
			});
			req.on("end", () => {
				let sid = body.split("=")[1].split("&")[0]; //this could probably just be made to use the JSON i create soon but I don't care
				if(!sessions[sid]) return res.end("403");
				if(sessions[sid].active) {
					let data = JSON.parse('{"' + decodeURI(body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}' //eslint-disable-line 
					); //I get errors if that comment is removed so i guess its important hahahaaha aim so funny pls help im dying inside if you see this dm me helpppppp
					if(data.option != "misc.owner") {
						if(!isNaN(parseInt(data.value))) {
							api.set(data.option, parseInt(data.value));
						} else {
							if (typeof data.value == "string") {
								if (data.value == "true" || data.value == "false") {
									api.set(data.option, data.value == "true");
								} else {
									api.set(data.option, data.value.toString());
								}
							} else {
								if (typeof data.value == "boolean") {
									api.set(data.option, data.value == "true");
								}
							}
						}
					}
					res.end("set");
				} else {
					res.end("403");
				}
			});
		}
		if(req.url == "/get") {
			let body = "";
			req.on("data", chunk => {
				body += chunk.toString(); // convert Buffer to string
			});
			req.on("end", () => {
				let sid = decodeReq(body);
				let requestedOption = body.split("=")[2];
				api.get(requestedOption).then(data => {
					if(!sessions[sid]) return res.end("403");
					if(sessions[sid].active) {
						if (requestedOption != "misc.owner") {
							res.end(data.toString());
						} else {
							res.end(JSON.stringify(data));
						}
					} else {
						res.end("403");
					}
				});
			});
		} else {
			if(req.url == "/cfg") {
				let body = "";
				req.on("data", chunk => {
					body += chunk.toString(); // convert Buffer to string
				});
				req.on("end", () => {
					//let sid = decodeReq(body);
					res.end(fs.readFileSync("./config.json")); //send them the vukkybot config to use as a template for all existing options
				});
			}
		}
	}
})
	.listen(port);
function isValidUser(user) {
	return config.dashboardAccess.includes(user.id);
}

function decodeReq(req) {
	return req.split("=")[1];
}