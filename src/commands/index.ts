import Discord, { Message, TextChannel } from "discord.js";
import i18next from "i18next";
import { DiscordStruct, FusionStruct } from "../type.js";
import config from "./../config.json";

export class Command {
  message: Message;
  discord: DiscordStruct | undefined;
  fusions: FusionStruct[] = [];
  discordBot: Discord.Client;

  constructor(message: Message, discordBot: Discord.Client) {
    this.message = message;
    this.discordBot = discordBot;
    this.discord = config.discords.find(
      discord => discord.discordId === this.message.guild.id
    )
    this.discord!.channels.forEach(channel => {
      config.fusions.forEach(fusion => {
        if (fusion.channels.some(chan => chan === channel)) {
          this.fusions.push(fusion)
        }
      })
    })
  }

  sort() {
    const messageTab = this.message.content.replace(/\s\s+/g, " ").split(" ");
    if (messageTab[1] === "!help") {
      this.help();
    } 
    else if (messageTab[1] === "!config") {
      this.configInfos();
    }
    //That commmand ask to the bot to not forward the message to others discords, so there is just nothing to do.
    else if (messageTab[1] === "!nofollow" || messageTab[1] === "!n") {
    } else {
      this.badCommand();
    }
  }

  help() {
    this.message.channel.send(i18next.t("fromBot.help"));
  }

  configInfos() {
    let mess = "Configuration du bot sur le discord " + this.message.guild.name + " :\nNombre de channels utilisées dans des fusions : " + this.fusions.length + "\n";
    if (this.fusions.length)
    {
      for (let i = 0; i < this.fusions.length; i++)
      {
       mess = mess + "\nFusion " + (i+1) + " : \nNom : " + this.fusions[i].name + "\nActive : " + this.fusions[i].active + "\nTransmet l'auteur des messages: " + this.fusions[i].forwardingName;
       mess = mess + "\nTransmet la date des messages : " + this.fusions[i].forwardingDate + "\nTransmet le nom du discord : " + this.fusions[i].forwardingDiscord + "\nChannels associés :\n";
       this.fusions[i].channels.forEach(chan => 
        {
          const channelDiscord = this.discordBot.channels.get(
            chan
          )! as TextChannel;
          mess = mess + channelDiscord.name + " du discord " +  channelDiscord .guild.name + "\n";
        })
      }
    }
    this.message.channel.send(mess);
  }

  badCommand() {
    this.message.channel.send(i18next.t("fromBot.commandeIntrouvable"));
  }
}
