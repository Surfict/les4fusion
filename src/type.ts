export interface discordStruct {
    discordId: string, channels: string[], name: String
}

export interface fusionStruct {
    channels: string[]
    name: string,
    forwardingName: boolean,
    forwardingDate: boolean
}


export interface configStruct {
    discordBotToken: string,
    discords: discordStruct[],
    fusions: fusionStruct[],
}