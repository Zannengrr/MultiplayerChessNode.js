"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = void 0;
class Direction {
    constructor(dirx, diry) {
        this.directionX = 0;
        this.directionY = 0;
        if (dirx != 0 && diry != 0 && (Math.abs(dirx) - Math.abs(diry) > 0)) {
            this.directionX = dirx;
            this.directionY = diry;
            return;
        }
        this.directionX = this.NormalizeToDirection(dirx);
        this.directionY = this.NormalizeToDirection(diry);
    }
    static IsDirectionValid(directionArray, directionToTestAgainst) {
        for (var i = 0; i < directionArray.length; i++) {
            if (this.CompareDirections(directionArray[i], directionToTestAgainst)) {
                return true;
            }
        }
        return false;
    }
    static CompareDirections(source, target) {
        return (source.directionX == target.directionX && source.directionY == target.directionY);
    }
    NormalizeToDirection(numberToNormalize) {
        let direction = 0;
        if (numberToNormalize != 0) {
            direction = numberToNormalize / Math.abs(numberToNormalize);
        }
        return direction;
    }
}
exports.Direction = Direction;
//# sourceMappingURL=Direction.js.map