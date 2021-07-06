export enum Location {
    UP = 0,
    LEFT = 1,
    FRONT = 2,
    BEHIND = 3,
    RIGHT = 4,
    DOWN = 5,
    INVALID = 99,
};

export enum Color {
    WHITE = 0,
    BLUE = 1,
    RED = 2,
    ORANGE = 3,
    GREEN = 4,
    YELLOW = 5,
    INVALID = 99,
};

export class RubikCell {
    location: Location = Location.UP;
    color: Color = Color.WHITE;
    row: number = 0;
    col: number = 0;

    constructor(row: number, col: number, location: Location, color: Color) {
        this.row = row;
        this.col = col;
        this.location = location;
        this.color = color;
    }

    swap(other: RubikCell) {
        let col = this.col;
        let row = this.row;
        let color = this.color;
        let location = this.location;
        this.col = other.col;
        this.row = other.row;
        this.color = other.color;
        this.location = other.location;
        other.col = col;
        other.row = row;
        other.location = location;
        other.color = color;
    }

    isValid() {
        return this.location < Location.INVALID && this.color < Color.INVALID;
    }
};

export class RubikFace {
    private width: number = 0;
    private height: number = 0;
    private originColor: Color = null!;
    private originLocation: Location = null!;
    private rubikCells: RubikCell[] = [];

    constructor(width: number, height: number, location: Location, color: Color) {
        this.height = height;
        this.width = width;
        this.originColor = color;
        this.originLocation = location;
    }

    pushRubikCell(cell: RubikCell) {
        this.rubikCells.push(cell)
    }

    findRubikCell(row: number, col: number) {
        if (row < 0 || row > this.width || col < 0 || col > this.height) {
            console.error(`search index is invalid!, current input is row:${row} col:${col}`);
            return new RubikCell(0, 0, Location.INVALID, Color.INVALID);
        }
        let index = row * this.width + col;
        return this.rubikCells[index];
    }

    resetRubikCells() {
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                let rubikCell = this.findRubikCell(i, j);
                rubikCell.col = i;
                rubikCell.row = j;
                rubikCell.location = this.originLocation;
                rubikCell.color = this.originColor;
            }
        }
    }
    /* 
       0, 1, 2      -1,  1,  1
       3, 4, 5  --> -1,  0,  1
       7, 8, 9      -1, -1, -1
    */

    convertToCenter() {
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                let rubikCell = this.findRubikCell(i, j);
                rubikCell.row -= 1;
                rubikCell.col -= 1;
            }
        }
    }

    convertToLeftTop() {

    }

    rotate(degree: number) {

    }
}

const RUBIK_PLANE: number = 6;

export class RubikCube {

    private order: number = 0;
    private rubikFaces: RubikFace[] = [];

    constructor(order: number) {
        this.order = order;
    }

    initRubik() {
        for (let i = 0; i < RUBIK_PLANE; ++i) {
            let rubikFace: RubikFace = new RubikFace(this.order, this.order, i, i);
            for (let row = 0; row < this.order; ++row) {
                for (let col = 0; col < this.order; ++col) {
                    rubikFace.pushRubikCell(new RubikCell(row, col, i, i));
                }
            }
            this.rubikFaces.push(rubikFace);
        }
    }

    shuffleRubik() {

    }

    resetRubik() {
        for (let i = 0; i < RUBIK_PLANE; ++i) {
            this.rubikFaces[i].resetRubikCells();
        }
    }

    rotateSide(side: Location, index?: number) {

    }

}