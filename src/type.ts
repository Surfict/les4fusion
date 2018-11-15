export interface DiscordStruct {
    discordId: string, channels: string[], name: String
}

export interface FusionStruct {
    channels: string[]
    name: string,
    forwardingName: boolean,
    forwardingDate: boolean,
    forwardingDiscord: boolean,
    active: boolean
}

export interface ConfigStruct {
    discordBotToken: string,
    discordBotId: String,
    discords: DiscordStruct[],
    fusions: FusionStruct[],
}