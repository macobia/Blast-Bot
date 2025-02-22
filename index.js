require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Discord bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event: Welcome new members
client.on('guildMemberAdd', async (member) => {
    // Welcome message in the "welcome" channel
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome");
    if (welcomeChannel) {
        welcomeChannel.send(`Welcome <@${member.id}> to **${member.guild.name}**! 🎉 I love you, ${member.user.username}!`);
    }

    // Send private message to the new member
    try {
        await member.send(`Welcome to the server, ${member.user.username}! Please make sure to check the rules and verify your account.`);
    } catch (err) {
        console.error('Could not send direct message to new member:', err);
    }

    // Optional: Handle server authentication (assign a "Verified" role or similar)
    const verifyRole = member.guild.roles.cache.find(role => role.name === "Verified");

    if (verifyRole) {
        // Assign the "Verified" role to the new member
        await member.roles.add(verifyRole);
    }
});

// Event: Moderate Messages (Delete links if not admin)
client.on('messageCreate', (message) => {
    console.log(message.content);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.content.includes("http")) {
        message.delete();
        message.channel.send(`${message.author}, posting links is not allowed.`);
    }
});

// Express server for API interactions
app.get('/', (req, res) => {
    res.send('Discord Bot is running!');
});

// API route to send a message to a specific user
app.get('/send-message/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            await user.send('Hello from the bot!');
            res.send(`Message sent to ${user.tag}`);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});

// Login Discord bot
client.login(process.env.TOKEN);

// require('dotenv').config();
// const express = require('express');
// const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Initialize Discord bot
// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMembers,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent
//     ]
// });

// // Event: Bot is ready
// client.once('ready', () => {
//     console.log(`Logged in as ${client.user.tag}`);
 
// });

// client.on("messageCreate", (message) => {
//     console.log(message.content)
// })

// // Event: Welcome new members
// client.on('guildMemberAdd', (member) => {
//     const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome");
//     if (welcomeChannel) {
//         welcomeChannel.send(`Welcome <@${member.id}> to **${member.guild.name}**! 🎉`);
//     }
//     member.send("Welcome to the server! Make sure to check the rules.");
// });

// // Event: Moderate Messages (Delete links if not admin)
// client.on('messageCreate', (message) => {
//     if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.content.includes("http")) {
//         message.delete();
//         message.channel.send(`${message.author}, posting links is not allowed.`);
//     }
// });

// // Express server for API interactions
// app.get('/', (req, res) => {
//     res.send('Discord Bot is running!');
// });

// // API route to send a message to a specific user
// app.get('/send-message/:userId', async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const user = await client.users.fetch(userId);
//         if (user) {
//             await user.send('Hello from the bot!');
//             res.send(`Message sent to ${user.tag}`);
//         } else {
//             res.status(404).send('User not found');
//         }
//     } catch (error) {
//         res.status(500).send(`Error: ${error.message}`);
//     }
// });

// // Start Express server
// app.listen(PORT, () => {
//     console.log(`Express server running on http://localhost:${PORT}`);
// });

// // Login Discord bot
// client.login(process.env.TOKEN);



//to add verfication for new members

// client.on('guildMemberAdd', async (member) => {
//     const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome");
//     const unverifiedRole = member.guild.roles.cache.find(role => role.name === "Unverified");
//     const verifiedRole = member.guild.roles.cache.find(role => role.name === "Verified");

//     // Check if both roles exist
//     if (!unverifiedRole || !verifiedRole) {
//         console.error('One or both roles are missing!');
//         return;
//     }

//     // Assign the "Unverified" role when a user joins
//     try {
//         await member.roles.add(unverifiedRole);
//     } catch (err) {
//         console.error('Error adding Unverified role:', err);
//     }

//     // Send a welcome message to the "welcome" channel
//     if (welcomeChannel) {
//         welcomeChannel.send(`Welcome <@${member.id}>! Please verify yourself by reacting to the verification message.`);
//     }

//     // Send a direct message with instructions
//     try {
//         await member.send('Welcome to the server! Please react to the message in #verification to gain access to the rest of the server.');
//     } catch (error) {
//         console.error("Could not send DM to new member", error);
//     }
// });

// // Add a reaction role system (reaction to a message to verify)
// client.on('messageCreate', async (message) => {
//     if (message.content === '!verify' && message.channel.name === 'verification') {
//         const verifyMessage = await message.channel.send('React with ✅ to verify yourself!');
//         await verifyMessage.react('✅');
//     }
// });

// // Assign the "Verified" role when the user reacts to the verification message
// client.on('messageReactionAdd', async (reaction, user) => {
//     if (reaction.emoji.name === '✅' && reaction.message.content.includes('React with ✅ to verify yourself!')) {
//         const member = await reaction.message.guild.members.fetch(user.id);
//         const unverifiedRole = reaction.message.guild.roles.cache.find(role => role.name === "Unverified");
//         const verifiedRole = reaction.message.guild.roles.cache.find(role => role.name === "Verified");

//         // Ensure roles are found
//         if (!unverifiedRole || !verifiedRole) {
//             console.error('One or both roles are missing!');
//             return;
//         }

//         try {
//             await member.roles.remove(unverifiedRole);
//             await member.roles.add(verifiedRole);
//             member.send('You have been verified! You now have full access to the server.');
//         } catch (err) {
//             console.error('Error assigning roles:', err);
//         }
//     }
// });
