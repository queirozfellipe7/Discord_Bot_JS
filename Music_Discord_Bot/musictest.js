/*const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const streamOptions = {seek: 0, volume:1};

const token = 'ODYyODUxMDUwODQ2NjgzMTk3.YOeWqQ.9kbAFtsctPubvVxopz0cHgCQLkk';
bot.login(token);
const PREFIX = '!'
bot.on('ready', () => {
    console.log('estou pronto para ser usado!');
    });


bot.on('message', async message =>{
    let args = message.content.substring(PREFIX.length).split(" ");
    console.log(args[0]);

    switch(args[0]){
        case 'play':
          if(!message.member.voiceChannel){
              messagem.channel.send("Tem que ta em um canal de voz garai");
          }
        break;

        case 'stop':
            memama();
        break;
    }

});*/


const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const queue = new Map();
client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('?')) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${'?'}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${'?'}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${'?'}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "Tu tem q ta em um canal de voz, C!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login('ODYyODUxMDUwODQ2NjgzMTk3.YOeWqQ.9kbAFtsctPubvVxopz0cHgCQLkk');