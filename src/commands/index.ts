import { Message } from "discord.js";
import i18next from "i18next";
import { DiscordStruct } from "../type.js";
import config from "./../config.json";

export class Command {
  message: Message;
  discord: DiscordStruct | undefined;

  constructor(message: Message) {
    this.message = message;
    this.discord = config.discords.find(
      discord => discord.discordId === this.message.guild.id
    );
  }

  sort() {
    const messageTab = this.message.content.replace(/\s\s+/g, " ").split(" ");
    if (messageTab[1] === "!help") {
      this.help();
    } else if (messageTab[1] === "!infos") {
      this.resume();
    } else if (messageTab[1] === "!discords") {
      this.neighboardsList();
    } else if (messageTab[1] === "!here") {
      this.here();
    } else if (messageTab[1] === "!partenaires") {
      this.all();
    } else if (messageTab[1] === "!rappel") {
      this.rappel();
    }
    //That commmand ask to the bot to not forward the message to others discords, so there is just nothing to do.
    else if (messageTab[1] === "!nofollow") {
    } else {
      this.badCommand();
    }
  }

  help() {
    this.message.channel.send(i18next.t("fromBot.help"));
  }

  neighboards() {
    /*
    if (this.discord) {
      this.message.channel.send(
        "Discords associés activés : " +
          (this.discord.neighboards ? "oui" : "non")
      );
    }
    */
  }

  neighboardsList() {
    if (this.discord) {
      /*
      if (
        this.discord.neighboards &&
        this.discord.neighboards_name.length > 0
      ) {
        let answer = "Liste des discords associés :\n";
        this.discord.neighboards_name.forEach(name => {
          answer += name + "\n";
        });
        this.message.channel.send(answer);
      } else {
        this.message.channel.send("Aucun discord associé.");
      }
    }
    */
  }
  }

  rappel() {
    this.message.channel.send(i18next.t("fromBot.rappel"));
  }

  here() {
    /*
    if (this.discord) {
      if (this.discord.here) {
        this.message.channel.send("Here : activé");
      } else {
        this.message.channel.send("Here : désactivé");
      }
    }
    */
  }

  all() {
    let answer = "Liste de tous les discords associés au scanner des 4 :\n";
    config.discords.forEach(discord => {
      answer += discord.name + "\n";
    });
    this.message.channel.send(answer);
  }

  resume() {
    this.neighboards();
    this.neighboardsList();
    this.here();
  }

  badCommand() {
    this.message.channel.send(i18next.t("fromBot.commandeIntrouvable"));
  }
}
