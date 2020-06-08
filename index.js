const Discord = require('discord.js');
 const client = new Discord.Client();

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.login('NzE5NTc1OTgwMzA1NTQ3MzU4.Xt5gqA.EtzVMuqCJXD6uki4SnTH7y02t7k');

// At least we can login!
