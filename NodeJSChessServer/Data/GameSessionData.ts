export class GameSessionData {
    public UserId: string;
    public IsPublic: boolean;

    public constructor(userId: string, isPublic: boolean) {
        this.UserId = userId;
        this.IsPublic = isPublic;
    }
}