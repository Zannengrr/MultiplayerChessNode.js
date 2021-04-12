export class NetworkMessage {
    public messageName: string;
    public data: object;

    constructor(messageName: string, data: object) {
        this.messageName = messageName;
        this.data = data;
    }
}