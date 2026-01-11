# 🎮 MagmaNode Minecraft Discord Bot

A powerful Discord bot to control and manage your Minecraft server hosted on MagmaNode panel.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- 🚀 **Server Control**: Start, restart, and stop your Minecraft server with buttons
- 📁 **File Explorer**: Browse server files and folders directly from Discord
- 💻 **Console Commands**: Execute server commands remotely
- 📄 **File Management**: View, edit, upload, and delete files
- 📦 **Mod Manager**: Upload mods directly from URLs
- 📊 **Server Status**: Monitor CPU, RAM, disk usage, and uptime
- 🔴 **DND Status**: Bot runs with Do Not Disturb status
- ⚡ **Slash Commands**: Modern Discord slash command support

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/panel` | Open the server control panel |
| `/cmd` | Send a command to the server console |
| `/viewfile` | View contents of a file |
| `/editfile` | Edit server files (server.properties, etc.) |
| `/uploadmod` | Upload mods/files from a URL |
| `/deletefile` | Delete files from the server |

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- Discord Bot Token
- MagmaNode API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/magmanode-bot.git
cd magmanode-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
DISCORD_TOKEN=your_discord_bot_token_here
PANEL_API_KEY=your_magmanode_api_key_here
```

4. **Run the bot**
```bash
npm start
```

## ⚙️ Configuration

### Getting Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** section
4. Copy the token
5. Enable **MESSAGE CONTENT INTENT**

### Getting MagmaNode API Key

1. Log into [panel.magmanode.com](https://panel.magmanode.com)
2. Go to **Account Settings** → **API Credentials**
3. Create a new API key
4. Copy the key

### Server ID

Your server ID is already configured in the code:
```javascript
SERVER_ID: 'd44bbb23-1a70-4daa-94a0-79522fec3049'
```

To change it, edit the `CONFIG` object in `index.js`.

## 🌐 Deployment

### Deploy on Render.com (Free)

1. Fork this repository
2. Go to [Render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Add environment variables
6. Deploy!

### Keep Bot Online 24/7

Use [UptimeRobot](https://uptimerobot.com) to ping your Render URL every 5 minutes.

## 📦 File Structure

```
magmanode-bot/
├── index.js              # Main bot file
├── package.json          # Dependencies
├── .env                  # Environment variables (not committed)
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── LICENSE              # MIT License
└── start-bot.bat        # Windows startup script
```

## 🛠️ Development

### Run with PM2 (24/7)

```bash
npm install -g pm2
pm2 start index.js --name magmanode-bot
pm2 startup
pm2 save
```

### Windows Batch File

Double-click `start-bot.bat` to run the bot with a GUI menu.

## 🐛 Troubleshooting

### Bot not responding to slash commands

1. Make sure you've invited the bot with `applications.commands` scope
2. Wait up to 1 hour for Discord to sync commands globally
3. Check bot permissions in your server

### File Explorer showing "undefined"

The MagmaNode API might return data in a different format. Check console logs for the API response structure.

### Bot keeps disconnecting

- Check your internet connection
- Verify your Discord token is valid
- Check Render/hosting platform logs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [MagmaNode](https://magmanode.com/) - Minecraft server hosting
- [Render](https://render.com/) - Free hosting platform

## 📧 Support

For support, create an issue in this repository.

---

Made with ❤️ for Minecraft server management
