import { Matrix } from "./Matrix";

const CONTRAST_NUM = 5;

export enum Location {
    UP = 0,
    LEFT = 1,
    FRONT = 2,
    BEHIND = 3,
    RIGHT = 4,
    DOWN = 5,
    INVALID = 99,
};

const LOCATION_SET = [
    Location.UP,
    Location.LEFT,
    Location.DOWN,
    Location.RIGHT,
    Location.FRONT,
    Location.BEHIND,
    Location.INVALID
]

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
    index: number = 0;

    constructor(row: number, col: number, location: Location, color: Color, index: number) {
        this.row = row;
        this.col = col;
        this.location = location;
        this.color = color;
        this.index = index;
    }

    reset(row: number, col: number, location: Location, color: Color, index?: number) {
        this.row = row;
        this.col = col;
        this.location = location;
        this.color = color;
        this.index = index || this.index;
    }

    clone() {
        return new RubikCell(this.row, this.col, this.location, this.color, this.index);
    }

    copy(other: RubikCell) {
        this.col = other.col;
        this.row = other.row;
        this.color = other.color;
        this.location = other.location;
        this.index = other.index;
    }

    swap(other: RubikCell) {
        let clone = this.clone();
        this.copy(other);
        other.copy(clone);
    }

    isValid() {
        return this.location < Location.INVALID && this.color < Color.INVALID;
    }
};

export class RubikFace {
    private row: number = 0;
    private col: number = 0;
    private originColor: Color = Color.INVALID;
    private originLocation: Location = Location.INVALID;
    private rubikCells: RubikCell[] = [];
    private matrix: Matrix = null!;

    static create(row: number, col: number, location: Location, color: Color) {
        let ret = new RubikFace(row, col, location, color);
        ret.init();
        return ret;
    }

    constructor(row: number, col: number, location: Location, color: Color) {
        this.col = col;
        this.row = row;
        this.originColor = color;
        this.originLocation = location;
    }

    init() {
        this.matrix = Matrix.create(this.row, this.col)
    }

    pushRubikCell(cell: RubikCell) {
        this.rubikCells.push(cell)
    }

    findRubikCell(row: number, col: number) {
        if (row < 0 || row > this.row || col < 0 || col > this.col) {
            console.error(`search index is invalid!, current input is row:${row} col:${col}`);
            return new RubikCell(0, 0, Location.INVALID, Color.INVALID, 0);
        }
        let index = row * this.row + col;
        return this.rubikCells[index];
    }

    resetRubikCells() {
        this.matrix.reset();
        for (let i = 0; i < this.row; ++i) {
            for (let j = 0; j < this.col; ++j) {
                let rubikCell = this.findRubikCell(i, j);
                rubikCell.reset(i, j, this.originLocation, this.originColor);
            }
        }
    }

    clone() {
        let ret = RubikFace.create(this.row, this.col, this.originLocation, this.originColor);
        for (const rubikCell of this.rubikCells) {
            ret.rubikCells.push(rubikCell.clone());
        }
        return ret;
    }

    rotate(degree: number) {
        this.matrix.rotate(degree);
        let contrast = this.clone();
        for (let i = 0; i < this.row; ++i) {
            for (let j = 0; j < this.col; ++j) {
                let targetIndex = this.matrix.findElement(i, j);
                let rubikCell = this.findRubikCell(i, j);
                rubikCell.copy(contrast.rubikCells[targetIndex]);
                rubikCell.row = i;
                rubikCell.col = j;
            }
        }
    }

    get releatedLocations() {
        let ret: Location[] = [];
        for (const location of LOCATION_SET) {
            if (location != this.originLocation && location != Location.INVALID && this.originLocation + location != CONTRAST_NUM) {
                ret.push(location);
            }
        }
        return ret;
    }

    swapWithRow(rubikFace: RubikFace, row: number) {
        for (let col = 0; col < this.col; ++col) {
            let rubikCell = this.findRubikCell(row, col);
            let otherCell = rubikFace.findRubikCell(row, col);
            rubikCell.swap(otherCell);
        }
    }

    swapWithCol(rubikFace: RubikFace, col: number) {
        for (let row = 0; row < this.row; ++row) {
            let rubikCell = this.findRubikCell(row, col);
            let otherCell = rubikFace.findRubikCell(row, col);
            rubikCell.swap(otherCell);
        }
    }

    convertToString() {
        let ret: string = '';
        let format = this.originLocation == Location.LEFT || this.originLocation == Location.RIGHT ? '' : '\t';
        for (let i = 0; i < this.row; ++i) {
            ret += format + this.convertToStringOneRow(i, true);
        }
        return ret;
    }

    convertToStringOneRow(row: number, newLine?: boolean) {
        let ret = '[';
        for (let col = 0; col < this.col; ++col) {
            ret += this.rubikCells[row * this.row + col].color
            if (col == this.col - 1) {
                ret += ']';
            } else {
                ret += ',';
            }
        }
        ret += newLine ? "\n" : '';
        return ret;
    }
}

/* 
                [0, 0, 0]
                [0, 0, 0]
                [0, 0, 0]

     [1, 1, 1]  [2, 2, 2]  [4, 4, 4]
     [1, 1, 1]  [2, 2, 2]  [4, 4, 4]
     [1, 1, 1]  [2, 2, 2]  [4, 4, 4]

                [5, 5, 5]
                [5, 5, 5]
                [5, 5, 5]

                [3, 3, 3]
                [3, 3, 3]
                [3, 3, 3]
     !六面行列统一：由左至右，由上至下            
*/

const RUBIK_PLANE: number = 6;

export class RubikCube {

    private order: number = 0;
    private rubikFaces: Map<Location, RubikFace> = new Map<Location, RubikFace>();

    constructor(order: number) {
        this.order = order;
    }

    initRubik() {
        this.rubikFaces.set(Location.UP, this.createOneRubikFace(Location.UP, Color.WHITE));
        this.rubikFaces.set(Location.DOWN, this.createOneRubikFace(Location.DOWN, Color.YELLOW));
        this.rubikFaces.set(Location.LEFT, this.createOneRubikFace(Location.LEFT, Color.BLUE));
        this.rubikFaces.set(Location.RIGHT, this.createOneRubikFace(Location.RIGHT, Color.GREEN));
        this.rubikFaces.set(Location.FRONT, this.createOneRubikFace(Location.FRONT, Color.RED));
        this.rubikFaces.set(Location.BEHIND, this.createOneRubikFace(Location.BEHIND, Color.ORANGE));
    }

    createOneRubikFace(location: Location, color: Color) {
        let rubikFace: RubikFace = RubikFace.create(this.order, this.order, location, color);
        let index: number = 0;
        for (let row = 0; row < this.order; ++row) {
            for (let col = 0; col < this.order; ++col) {
                rubikFace.pushRubikCell(new RubikCell(row, col, location, color, index++));
            }
        }
        return rubikFace;
    }

    shuffleRubik() {

    }

    resetRubik() {
        this.rubikFaces.forEach((rubikFace) => {
            rubikFace.resetRubikCells();
        })
    }

    /** 
     *!: index为按location方向正数第几行或是第几列
    */
    rotateSide(location: Location, index: number, degree: number) {
        //!只有触摸面为边界面时才进行旋转,否则直交换关联面对应行列的值
        if (index == 0 || index == this.order) {
            this.rubikFaces.get(location)!.rotate(degree);
        }
        let releatedFaces = this.getReleatedFace(location);
        //todo:保证关联面按逆时针顺序排列
        for (let i = 0; i < releatedFaces.length - 1; ++i) {
            if (location == Location.UP || location == Location.DOWN) {
                releatedFaces[i].swapWithRow(releatedFaces[i + 1], index);
            } else if (location == Location.LEFT || location == Location.RIGHT) {
                releatedFaces[i].swapWithCol(releatedFaces[i + 1], index);
            }
        }
    }

    getReleatedFace(location: Location) {
        let locations: Location[] = [];
        switch (location) {
            case Location.UP:
            case Location.DOWN:
            case Location.FRONT:
            case Location.BEHIND:
            case Location.LEFT:
            case Location.RIGHT:
                locations = this.rubikFaces.get(location)!.releatedLocations;
                break;
            default:
                console.error("unknown location:", location);
                break;
        }
        let ret: RubikFace[] = [];
        for (let location of locations) {
            ret.push(this.rubikFaces.get(location)!);
        }
        return ret;
    }

    printRubikCube() {
        let str = ``;
        let strUp = this.rubikFaces.get(Location.UP)!.convertToString();
        str += strUp;
        for (let i = 0; i < 3; ++i) {
            str += this.rubikFaces.get(Location.LEFT)!.convertToStringOneRow(i);
            str += '\t' + this.rubikFaces.get(Location.FRONT)!.convertToStringOneRow(i);
            str += '\t' + this.rubikFaces.get(Location.RIGHT)!.convertToStringOneRow(i);
            str += '\n';
        }
        let strDown = this.rubikFaces.get(Location.DOWN)!.convertToString();
        str += strDown;
        let strBehind = this.rubikFaces.get(Location.BEHIND)!.convertToString();
        str += strBehind;
        console.log("当前魔方排列为:\n", str);
    }

}