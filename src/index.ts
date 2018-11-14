import Discord, { Message, TextChannel } from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import config from "./config.json";
import { configStruct, discordStruct } from "./type.js";
import moment, { Moment, now } from "moment";
import { util } from "./util/index.js";
import { Command } from "./commands/index.js";
import { EventEmitter } from "events";
import i18next from "i18next";
import { translation } from "./i18n/index.js";

i18next.init({
  lng: "fr_FR",
  debug: false,
  resources: {
    fr_FR: {
      translation: {
        ...translation
      }
    }
  }
});

moment().format();

// TODO Follow message on channel that we are interested by, not all of them

/**************Checks ************************/
let conf: configStruct = config;
let err = new EventEmitter();
err.on("error", value => {
  console.error(value);
  process.exit();
});

// Bots initialisation
// Discord
let discordBot = new Discord.Client();
util.checkDiscordBot(discordBot).catch(e => {
  err.emit("error", e);
});

util.isConfigOk(discordBot).catch(e => {
  err.emit("error", e);
});

/**************End Checks ************************/

discordBot.login(config.discordBotToken);
discordBot.on("error", console.error);

// Var init
let discords = conf.discords;



// For every message on the discord
discordBot.on("message", (message: Message) => {
  //Command to the bot
  if (message.content.indexOf(discordBot.user.id) !== -1) {
    const commandes = new Command(message);
    commandes.sort();
  } else {

    if (util.isInFusion(message))
    {
      
    }


    let discords = conf.discords;
    let files = util.imagesToArray(message);
    discords.forEach(element => {
      if (message.channel.id === element.channelId) {
        // Is the message coming from the bot ?
        if (!util.isMessageAlreadyPosted(message.content)) {

          // We are going to sent this message to all the neighbords that have asked for it.
          discords.forEach(discord => {
            if (discord.neighboards) {
              let neighbords = discord.neighboards_name;
              neighbords.forEach(neihboard => {
                if (neihboard === element.name) {
                  const channel = discordBot.channels.get(
                    discord.channelId
                  )! as TextChannel;
                  if (channel !== undefined) {
                    if (discord.here.everyTime) {
                      sendHere(discord, message, channel);
                    }
                    channel.send(
                      element.name +
                        ", " +
                        message.author.username +
                        " à " +
                        moment().format("h:mm") +
                        " : " +
                        message.content,
                      { files: files }
                    );
                  }
                }
              });
            }
          });
        }
      }
    });
  }
});
