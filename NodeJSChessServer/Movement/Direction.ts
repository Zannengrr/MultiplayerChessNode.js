export class Direction {
    directionX: number = 0;
    directionY: number = 0;
    constructor(dirx: number, diry: number) {
        if (dirx != 0 && diry != 0 && (Math.abs(dirx) - Math.abs(diry) > 0)) {
            this.directionX = dirx;
            this.directionY = diry;
            return;
        }

        this.directionX = this.NormalizeToDirection(dirx);
        this.directionY = this.NormalizeToDirection(diry);
    }

    static IsDirectionValid(directionArray: Direction[], directionToTestAgainst: Direction): boolean {
        for (var i = 0; i < directionArray.length; i++) {
            if (this.CompareDirections(directionArray[i], directionToTestAgainst)) {
                return true;
            }
        }
        return false;
    }

    static CompareDirections(source: Direction, target: Direction): boolean {
        return (source.directionX == target.directionX && source.directionY == target.directionY)
    }

    NormalizeToDirection(numberToNormalize: number): number {
        let direction: number = 0;
        if (numberToNormalize != 0) {
            direction = numberToNormalize / Math.abs(numberToNormalize);
        }
        return direction;
    }
}