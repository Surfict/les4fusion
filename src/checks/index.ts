import { Client } from "discord.js";
import { ConfigStruct } from "../type";
import config from "./../config.json";
import { uniq } from "lodash";

export class Check {
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
}
