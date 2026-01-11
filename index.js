require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

// Configuration from environment variables
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  PANEL_API_KEY: process.env.PANEL_API_KEY,
  SERVER_ID: 'd44bbb23-1a70-4daa-94a0-79522fec3049',
  PANEL_URL: 'https://panel.magmanode.com'
};

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Open the server control panel'),
  new SlashCommandBuilder()
    .setName('cmd')
    .setDescription('Send a command to the server console')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to execute')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('editfile')
    .setDescription('Edit a file on the server')
    .addStringOption(option =>
      option.setName('filepath')
        .setDescription('Path to the file (e.g., /server.properties)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('content')
        .setDescription('New file content')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('uploadmod')
    .setDescription('Upload a mod/file from URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Direct download URL of the file')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('directory')
        .setDescription('Target directory (e.g., /mods)')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('viewfile')
    .setDescription('View contents of a file')
    .addStringOption(option =>
      option.setName('filepath')
        .setDescription('Path to the file (e.g., /server.properties)')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('deletefile')
    .setDescription('Delete a file from the server')
    .addStringOption(option =>
      option.setName('filepath')
        .setDescription('Path to the file to delete')
        .setRequired(true)
    )
].map(command => command.toJSON());

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(CONFIG.DISCORD_TOKEN);
  
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// Function to send power action to MagmaNode
async function sendPowerAction(action) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/power`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      },
      body: JSON.stringify({ signal: action })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return { success: true, action };
  } catch (error) {
    console.error('Error sending power action:', error);
    return { success: false, error: error.message };
  }
}

// Function to list files in a directory
async function listFiles(directory = '/') {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/files/list?directory=${encodeURIComponent(directory)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, files: data.data, directory };
  } catch (error) {
    console.error('Error listing files:', error);
    return { success: false, error: error.message };
  }
}

// Function to read file content
async function readFile(filePath) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/files/contents?file=${encodeURIComponent(filePath)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const content = await response.text();
    return { success: true, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
}

// Function to write/update file content
async function writeFile(filePath, content) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/files/write?file=${encodeURIComponent(filePath)}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      },
      body: content
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
}

// Function to upload file from URL
async function uploadFileFromURL(filePath, fileURL) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/files/pull`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      },
      body: JSON.stringify({
        url: fileURL,
        directory: filePath,
        filename: fileURL.split('/').pop()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

// Function to delete file
async function deleteFile(filePath) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/files/delete`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      },
      body: JSON.stringify({
        root: '/',
        files: [filePath]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}

// Function to send console command
async function sendConsoleCommand(command) {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/command`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      },
      body: JSON.stringify({ command })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return { success: true, command };
  } catch (error) {
    console.error('Error sending command:', error);
    return { success: false, error: error.message };
  }
}

// Function to get console logs
async function getConsoleLogs() {
  const url = `${CONFIG.PANEL_URL}/api/client/servers/${CONFIG.SERVER_ID}/websocket`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${CONFIG.PANEL_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error getting console logs:', error);
    return { success: false, error: error.message };
  }
}

// Create control panel embed and buttons
function createControlPanel() {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🎮 Minecraft Server Control Panel')
    .setDescription('Control your MagmaNode Minecraft server')
    .addFields(
      { name: 'Server ID', value: `\`${CONFIG.SERVER_ID}\``, inline: false }
    )
    .setFooter({ text: 'Click a button to control the server' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('start')
        .setLabel('Start')
        .setEmoji('🚀')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('restart')
        .setLabel('Restart')
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Stop')
        .setEmoji('🛑')
        .setStyle(ButtonStyle.Danger)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('files_/')
        .setLabel('File Explorer')
        .setEmoji('📁')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('console')
        .setLabel('Console')
        .setEmoji('💻')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

// Create file browser embed
function createFileBrowser(files, directory) {
  const embed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle('📁 File Explorer')
    .setDescription(`**Current Directory:** \`${directory}\``)
    .setTimestamp();

  // Check if files is an array
  if (!Array.isArray(files) || files.length === 0) {
    embed.addFields({ name: 'Contents', value: '*Empty directory or no access*' });
    return { embeds: [embed], components: [] };
  }

  // Sort: folders first, then files
  const folders = files.filter(f => f.is_directory || f.is_file === false).slice(0, 10);
  const fileList = files.filter(f => !f.is_directory && f.is_file !== false).slice(0, 10);

  let fileText = '';
  
  if (folders.length > 0) {
    fileText += '**📁 Folders:**\n';
    folders.forEach(f => {
      const name = f.name || f.attributes?.name || 'Unknown';
      fileText += `📁 ${name}\n`;
    });
  }
  
  if (fileList.length > 0) {
    fileText += '\n**📄 Files:**\n';
    fileList.forEach(f => {
      const name = f.name || f.attributes?.name || 'Unknown';
      const size = formatBytes(f.size || f.attributes?.size || 0);
      fileText += `📄 ${name} (${size})\n`;
    });
  }

  if (fileText === '') {
    fileText = '*Empty directory*';
  }

  embed.addFields({ name: 'Contents', value: fileText });

  // Create navigation buttons
  const buttons = [];
  
  // Back button if not in root
  if (directory !== '/') {
    const parentDir = directory.split('/').slice(0, -1).join('/') || '/';
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`files_${parentDir}`)
        .setLabel('⬆️ Back')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  // Folder buttons (max 4 per row)
  folders.slice(0, 4).forEach(folder => {
    const folderName = folder.name || folder.attributes?.name || 'Unknown';
    const newPath = directory === '/' ? `/${folderName}` : `${directory}/${folderName}`;
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`files_${newPath}`)
        .setLabel(folderName.slice(0, 20))
        .setEmoji('📁')
        .setStyle(ButtonStyle.Primary)
    );
  });

  // Split buttons into rows (5 buttons per row max)
  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
    rows.push(row);
  }

  return { embeds: [embed], components: rows };
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('Bot is ready to control your Minecraft server!');
  
  // Set bot status to DND (Do Not Disturb)
  client.user.setPresence({
    status: 'dnd', // Options: 'online', 'idle', 'dnd', 'invisible'
    activities: [{
      name: 'Minecraft Server',
      type: 3 // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
    }]
  });
  
  registerCommands();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Kept for backwards compatibility
  if (message.content.toLowerCase() === '!panel') {
    await message.channel.send(createControlPanel());
  }
  
  if (message.content.toLowerCase().startsWith('!cmd ')) {
    const command = message.content.slice(5).trim();
    
    if (!command) {
      return message.reply('❌ Please provide a command. Example: `!cmd say Hello World` or use `/cmd` slash command');
    }
    
    const result = await sendConsoleCommand(command);
    
    const embed = new EmbedBuilder()
      .setTimestamp();
    
    if (result.success) {
      embed
        .setColor(0x57F287)
        .setTitle('💻 Console Command Sent')
        .setDescription(`\`\`\`\n${command}\n\`\`\``)
        .addFields({ name: 'Status', value: '✅ Command executed' });
    } else {
      embed
        .setColor(0xED4245)
        .setTitle('❌ Error')
        .setDescription('Failed to send command')
        .addFields({ name: 'Error', value: result.error });
    }
    
    await message.reply({ embeds: [embed] });
  }
});

client.on('interactionCreate', async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'panel') {
      await interaction.reply(createControlPanel());
      return;
    }
    
    if (interaction.commandName === 'cmd') {
      await interaction.deferReply();
      
      const command = interaction.options.getString('command');
      const result = await sendConsoleCommand(command);
      
      const embed = new EmbedBuilder()
        .setTimestamp();
      
      if (result.success) {
        embed
          .setColor(0x57F287)
          .setTitle('💻 Console Command Sent')
          .setDescription(`\`\`\`\n${command}\n\`\`\``)
          .addFields({ name: 'Status', value: '✅ Command executed' });
      } else {
        embed
          .setColor(0xED4245)
          .setTitle('❌ Error')
          .setDescription('Failed to send command')
          .addFields({ name: 'Error', value: result.error });
      }
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (interaction.commandName === 'viewfile') {
      await interaction.deferReply();
      
      const filepath = interaction.options.getString('filepath');
      const result = await readFile(filepath);
      
      const embed = new EmbedBuilder()
        .setTimestamp();
      
      if (result.success) {
        const content = result.content.length > 1900 
          ? result.content.substring(0, 1900) + '\n... (truncated)' 
          : result.content;
        
        embed
          .setColor(0x5865F2)
          .setTitle(`📄 ${filepath}`)
          .setDescription(`\`\`\`\n${content}\n\`\`\``);
      } else {
        embed
          .setColor(0xED4245)
          .setTitle('❌ Error')
          .setDescription('Failed to read file')
          .addFields({ name: 'Error', value: result.error });
      }
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (interaction.commandName === 'editfile') {
      await interaction.deferReply();
      
      const filepath = interaction.options.getString('filepath');
      const content = interaction.options.getString('content');
      const result = await writeFile(filepath, content);
      
      const embed = new EmbedBuilder()
        .setTimestamp();
      
      if (result.success) {
        embed
          .setColor(0x57F287)
          .setTitle('✅ File Updated')
          .setDescription(`Successfully updated \`${filepath}\``)
          .addFields({ name: 'New Content', value: `\`\`\`\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\`\`\`` });
      } else {
        embed
          .setColor(0xED4245)
          .setTitle('❌ Error')
          .setDescription('Failed to update file')
          .addFields({ name: 'Error', value: result.error });
      }
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (interaction.commandName === 'uploadmod') {
      await interaction.deferReply();
      
      const url = interaction.options.getString('url');
      const directory = interaction.options.getString('directory') || '/mods';
      const result = await uploadFileFromURL(directory, url);
      
      const embed = new EmbedBuilder()
        .setTimestamp();
      
      if (result.success) {
        embed
          .setColor(0x57F287)
          .setTitle('📦 File Upload Started')
          .setDescription(`Uploading file to \`${directory}\``)
          .addFields({ name: 'URL', value: url });
      } else {
        embed
          .setColor(0xED4245)
          .setTitle('❌ Error')
          .setDescription('Failed to upload file')
          .addFields({ name: 'Error', value: result.error });
      }
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (interaction.commandName === 'deletefile') {
      await interaction.deferReply();
      
      const filepath = interaction.options.getString('filepath');
      const result = await deleteFile(filepath);
      
      const embed = new EmbedBuilder()
        .setTimestamp();
      
      if (result.success) {
        embed
          .setColor(0x57F287)
          .setTitle('🗑️ File Deleted')
          .setDescription(`Successfully deleted \`${filepath}\``);
      } else {
        embed
          .setColor(0xED4245)
          .setTitle('❌ Error')
          .setDescription('Failed to delete file')
          .addFields({ name: 'Error', value: result.error });
      }
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }
  }

  // Handle button interactions
  if (!interaction.isButton()) return;

  await interaction.deferReply();

  const customId = interaction.customId;

  // Handle console button
  if (customId === 'console') {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💻 Server Console')
      .setDescription('Use `/cmd <command>` to send commands to the server console.')
      .addFields(
        { name: 'Examples', value: '```\n/cmd command:say Hello World\n/cmd command:list\n/cmd command:tp PlayerName ~ ~ ~\n/cmd command:gamemode creative PlayerName\n```' },
        { name: 'Note', value: 'Commands are executed directly on the server console.' }
      )
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Handle file browser
  if (customId.startsWith('files_')) {
    const directory = customId.replace('files_', '');
    const result = await listFiles(directory);

    if (result.success) {
      console.log('Files API response:', JSON.stringify(result.files, null, 2)); // Debug log
      const browserMsg = createFileBrowser(result.files, result.directory);
      await interaction.editReply(browserMsg);
    } else {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Error')
        .setDescription('Failed to load directory')
        .addFields({ name: 'Error', value: result.error });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
    return;
  }

  // Handle power actions
  const action = customId; // 'start', 'restart', or 'stop'
  const actionEmojis = {
    start: '🚀',
    restart: '🔄',
    stop: '🛑'
  };

  const result = await sendPowerAction(action);

  const responseEmbed = new EmbedBuilder()
    .setTimestamp();

  if (result.success) {
    responseEmbed
      .setColor(0x57F287)
      .setTitle(`${actionEmojis[action]} Server ${action.charAt(0).toUpperCase() + action.slice(1)} Command Sent`)
      .setDescription(`Successfully sent **${action}** command to the server!`)
      .addFields({ name: 'Status', value: '✅ Command executed', inline: true });
  } else {
    responseEmbed
      .setColor(0xED4245)
      .setTitle('❌ Error')
      .setDescription(`Failed to ${action} the server`)
      .addFields({ name: 'Error', value: result.error, inline: false });
  }

  await interaction.editReply({ embeds: [responseEmbed] });
});

client.login(CONFIG.DISCORD_TOKEN);