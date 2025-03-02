require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;
//const GUILD_ID = process.env.GUILD_ID;
//const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
//const VERIFY_CHANNEL_ID = process.env.VERIFY_CHANNEL_ID;



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
        welcomeChannel.send(`Welcome <@${member.id}> to **${member.guild.name}**! 🎉 Check your inbox for a message, ${member.user.username}!`);
    }

    const verifyChannel = message.guild.channels.cache.find(channel => channel.name === "airdrop-verification");
    if (verifyChannel) {
        verifyChannel.send(`<@${member.id}> please verify your account by entering the airdrop verification code`);
    }


    // Send private message to the new member
    try {
        await member.send(`Welcome to the server, ${member.user.username}! Check the rules, verify your account, and claim your airdrop via the official BOMT link: https://claims.bomtai.cloud`);
        await member.send(`Use your airdrop code to verify and unlock all BOMT server channels.`);
        
    } catch (err) {
        console.error('Could not send direct message to new member:', err);
    }


});


client.on("messageCreate", async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Find the verification channel dynamically
    const verifyChannel = message.guild.channels.cache.find(channel => channel.name === "airdrop-verification");

    // Ensure the verification channel exists and the message is sent in it
    if (!verifyChannel || message.channel.id !== verifyChannel.id) return;

    // Ensure user input is not empty
    const userCode = message.content.trim();
    if (!userCode) return; 

    // The actual verification code (replace with your real one)
    const VERIFICATION_CODE = "12345";

    // Find the user in the server
    const guild = message.guild;
    const member = await guild.members.fetch(message.author.id).catch(() => null);

    if (!member) {
        return message.reply("❌ You are not a member of this server.");
    }

    // Check if user input matches the verification code
    if (userCode === VERIFICATION_CODE) {
        try {
            // Find the verified role dynamically
            const verifiedRole = guild.roles.cache.find(role => role.name === "verified");

            if (!verifiedRole) return message.reply("❌ Verified role not found.");

            // Ensure the user does NOT already have the verified role
            if (member.roles.cache.has(verifiedRole.id)) {
                return message.reply("✅ You are already verified!");
            }

            // Confirmation message
            const successMsg = await message.reply("✅ Verification successful! You now have access to all channels.");

            // Delete all messages in the verification channel after verification
            setTimeout(async () => {
                try {
                    const fetchedMessages = await verifyChannel.messages.fetch({ limit: 100 });
                    verifyChannel.bulkDelete(fetchedMessages, true).catch(err => console.error("Failed to clear messages:", err));
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            }, 3000);

            // Delete user's verification message and bot reply after 3 seconds
            setTimeout(() => {
                message.delete().catch(err => console.error("Failed to delete message:", err));
                successMsg.delete().catch(err => console.error("Failed to delete bot reply:", err));
            }, 3000);

        } catch (error) {
            console.error("Error adding role:", error);
            message.reply("❌ Failed to assign role. Please contact an admin.");
        }
    } else {
        // Delete incorrect input after 3 seconds
        message.reply("❌ Invalid verification code. Please try again.")
            .then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => console.error("Failed to delete bot reply:", err));
                }, 3000);
            })
            .catch(err => console.error("Failed to send reply:", err));

        setTimeout(() => {
            message.delete().catch(err => console.error("Failed to delete message:", err));
        }, 3000);
    }
});

// Event: Moderate Messages (Delete links if not admin)
client.on('messageCreate', (message) => {
    console.log(message.content);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && (message.content.includes("http") ||
         message.content.includes("https")  ||
         message.content.includes("www") ||
          message.content.includes("Www")                                                                           
       )) {
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
client.login(process.env.TOKEN );