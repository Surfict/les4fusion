import config from "./../config.json";
import { ConfigStruct, FusionStruct } from "../type.js";
import { Client, Message } from "discord.js";
import { uniq } from "lodash";
import moment from "moment";
export class util {
  static isMessageAlreadyFromTheBot(idAuthor: string) {
    console.log(idAuthor);
    console.log(config.discordBotId);
    return idAuthor === config.discordBotId;
  }

  static imagesToArray(message: Message): string[] {
    const files: string[] = [];
    if (message.attachments.size > 0) {
      message.attachments.forEach(attach => {
        files.push(attach.url);
      });
    }
    return files;
  }

  static async isConfigOk(discordBot: Client) {
    const conf: ConfigStruct = config;
    // Data consistency
    const discordsChannels: string[] = [];
    const fusionChannels: string[] = [];
    const discordsIds: string[] = [];
    conf.discords.forEach(discord => {
      discordsChannels.concat(discord.channels);
      discordsIds.push(discord.discordId);
    });

    conf.fusions.forEach(fusion => {
      fusionChannels.concat(fusion.channels);
    });

    if (!fusionChannels.every(r => discordsChannels.indexOf(r) !== -1)) {
      throw "There is no data consistency between the discords channels and theirs fusions. Please check the config file.";
    }

    //Is there any duplicate Discords or channels ?
    if (uniq(discordsIds).length !== discordsIds.length) {
      throw "There is a duplicate Discord in your config file";
    } else if (
      uniq(discordsChannels).length !== discordsChannels.length ||
      uniq(fusionChannels).length !== fusionChannels.length
    ) {
      throw "There is a duplicate channel in your config file";
    }

    await discordBot.login(config.discordBotToken);

    //Are the Discord ids provided found by the bot ?
    conf.discords.forEach(discord => {
      const disc = discordBot.guilds.get(discord.discordId);
      if (!disc) {
        throw "The discord " +
          discord.discordId +
          " is not find by the discord bot. Please check your configuration file or check that the bot is on your Discord Server";
      }
    });
    // Are the channels id provided found by the bot ? (is the bot on the Discord server, and is the ID provided good ?)
    discordsChannels.forEach(channel => {
      const chan = discordBot.channels.get(channel);
      if (!chan) {
        throw "The channel " +
          channel +
          " is not find by the discord bot. Please check your configuration file.";
      }
    });
  }

  static async checkDiscordBot(discordBot: any) {
    try {
      await discordBot.login(config.discordBotToken);
    } catch (error) {
      throw "Discord bot didn't start. Please verify your token in the config file. Message error : " +
        error;
    }
  }

  // Check if the message come from a channel that want to forward the message
  static isInFusion(idChannelMessage: string) {
    let allChannels: string[] = [];

    config.fusions.forEach(fusion => {
      if (fusion.active) {
        allChannels = allChannels.concat(fusion.channels);
      }
    });

    return allChannels.some(
      channels => channels.indexOf(idChannelMessage) !== -1
    );
  }

  // Send an array of the channel we went to forward the message to

  static fusionsConcernedList(idChannelMessage: string) {
    const fusions: FusionStruct[] = [];

    config.fusions.forEach(fusion => {
      if (fusion.active) {
        if (
          fusion.channels.some(
            channel => channel.indexOf(idChannelMessage) !== -1
          )
        ) {
          const channelsToForward: string[] = [];
          fusion.channels.forEach(channel => {
            if (channel !== idChannelMessage) {
              channelsToForward.push(channel);
            }

            fusions.push({
              active: true,
              channels: channelsToForward,
              name: fusion.name,
              forwardingDate: fusion.forwardingDate,
              forwardingName: fusion.forwardingName,
              forwardingDiscord: fusion.forwardingDiscord
            });
          });
        }
      }
    });
    return fusions;
  }

  static formatMessage(message: Message, fusion: FusionStruct) {
    let mess = "";

    if (fusion.forwardingDiscord) {
      mess = message.guild.name;
    }

    if (fusion.forwardingName) {
      if (mess) {
        mess = mess + ", " + message.author.username;
      } else {
        mess = message.author.username;
      }
    }

    if (fusion.forwardingDate) {
      if (mess) {
        mess = mess + " à " + moment().format("h:mm") + " : ";
      } else {
        mess = moment().format("h:mm") + " : ";
      }
    } else {
      if (mess) {
        mess = mess + " : ";
      }
    }

    mess = mess + message.content;
    return mess;
  }
}
