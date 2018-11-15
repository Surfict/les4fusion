import config from "./../config.json";
import { FusionStruct } from "../type.js";
import { Message } from "discord.js";
import moment from "moment";
export class util {
  static isMessageAlreadyFromTheBot(idAuthor: string, botID: string) {
    return idAuthor === botID;
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
      if (fusion.active && fusion.channels.some(channel => channel.indexOf(idChannelMessage) !== -1)) {
        const channelsToForward: string[] = [];
        fusion.channels.forEach(channel => {
          if (channel !== idChannelMessage) {
            channelsToForward.push(channel);
          }
        });
        fusions.push({
          active: true,
          channels: channelsToForward,
          name: fusion.name,
          forwardingDate: fusion.forwardingDate,
          forwardingName: fusion.forwardingName,
          forwardingDiscord: fusion.forwardingDiscord
        });
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
