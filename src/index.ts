import Discord, { Message, TextChannel } from "discord.js";
import config from "./config.json";
import { ConfigStruct, DiscordStruct } from "./type.js";
import { util } from "./util/index.js";
import { Command } from "./commands/index.js";
import { EventEmitter } from "events";
import i18next from "i18next";
import { translation } from "./i18n/index.js";
import { Check } from "./checks/index.js";

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

// TODO Follow message on channel that we are interested by, not all of them

/**************Checks ************************/
const conf: ConfigStruct = config;
const err = new EventEmitter();
err.on("error", value => {
  console.error(value);
  process.exit();
});

// Bots initialisation
// Discord
const discordBot = new Discord.Client();
Check.checkDiscordBot(discordBot).catch(e => {
  err.emit("error", e);
});

Check.isConfigOk(discordBot).catch(e => {
  err.emit("error", e);
});

/**************End Checks ************************/

discordBot.login(config.discordBotToken);
discordBot.on("error", console.error);

// For every message on the discord
discordBot.on("message", (message: Message) => {
  //Command to the bot
  if (message.content.indexOf(discordBot.user.id) !== -1) {
    const commandes = new Command(message, discordBot);
    commandes.sort();
  } else {
    if (!util.isMessageAlreadyFromTheBot(message.author.id, discordBot.user.id)) {
      const messageId = message.channel.id;
      const filesFromMessage = util.imagesToArray(message);

      if (util.isInFusion(messageId)) {
        const fusions = util.fusionsConcernedList(messageId);
        fusions.forEach(fusion => {
          fusion.channels.forEach(channel => {
            const channelDiscord = discordBot.channels.get(
              channel
            )! as TextChannel;

            if (channelDiscord) {

              if (message.embeds.length)
              {
                channelDiscord.send(util.formatMessage(message, fusion), {
                  files: filesFromMessage,
                  embed: new Discord.RichEmbed(message.embeds[0])
                });
              }
              else 
              {
                channelDiscord.send(util.formatMessage(message, fusion), {
                files: filesFromMessage,              
              });
            }
            }
          });
        });
      }
    }
  }
});
