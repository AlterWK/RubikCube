import * as cc from 'cc';
import { Matrix } from './Matrix';

const CONTRAST_NUM = 5;

export const RUBIK_ORDER: number = 3;

export enum Location {
    UP = 0,
    LEFT = 1,
    FRONT = 2,
    BEHIND = 3,
    RIGHT = 4,
    DOWN = 5,
    INVALID = -1,
}

//逆时针
const RELEATED_SET: { [index: number]: Location[] } = {
    [Location.UP]: [Location.LEFT, Location.FRONT, Location.RIGHT, Location.BEHIND],
    [Location.LEFT]: [Location.UP, Location.BEHIND, Location.DOWN, Location.FRONT],
    [Location.FRONT]: [Location.UP, Location.LEFT, Location.DOWN, Location.RIGHT],
    [Location.BEHIND]: [Location.UP, Location.RIGHT, Location.DOWN, Location.LEFT],
    [Location.RIGHT]: [Location.UP, Location.FRONT, Location.DOWN, Location.BEHIND],
    [Location.DOWN]: [Location.LEFT, Location.FRONT, Location.RIGHT, Location.BEHIND],
};

export enum Color {
    WHITE = 0,
    BLUE = 1,
    RED = 2,
    ORANGE = 3,
    GREEN = 4,
    YELLOW = 5,
    INVALID = -1,
}

export const RenderColor: { [inbdex: number]: cc.Color } = {
    [Color.WHITE]: cc.color(255, 255, 255),
    [Color.BLUE]: cc.color(0, 0, 255),
    [Color.RED]: cc.color(255, 0, 0),
    [Color.ORANGE]: cc.color(255, 125, 0),
    [Color.GREEN]: cc.color(0, 255, 0),
    [Color.YELLOW]: cc.color(255, 255, 0),
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
        return this.location > Location.INVALID && this.color > Color.INVALID;
    }
}

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
        this.matrix = Matrix.create(this.row, this.col);
    }

    pushRubikCell(cell: RubikCell) {
        this.rubikCells.push(cell);
    }

    findRubikCell(row: number, col: number) {
        if (row < 0 || row >= this.row || col < 0 || col >= this.col) {
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
        return RELEATED_SET[this.originLocation];
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
            ret += this.rubikCells[row * this.row + col].color;
            if (col == this.col - 1) {
                ret += ']';
            } else {
                ret += ',';
            }
        }
        ret += newLine ? '\n' : '';
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
     !上下行相反，列一致，前后行相反，列一致，左右行列一致
*/

const RUBIK_PLANE: number = 6;

export class RubikCube {
    private order: number = 0;
    private rubikFaces: Map<Location, RubikFace> = new Map<Location, RubikFace>();
    private cubes: { cells: RubikCell[] }[] = [];

    constructor(order: number) {
        this.order = order;
        this.initRubik();
        this.initCubes();
    }

    private initRubik() {
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

    private initCubes() {
        for (let order = 0; order < this.order; ++order) {
            for (let row = 0; row < this.order; ++row) {
                for (let col = 0; col < this.order; ++col) {
                    this.cubes.push({ cells: this.getRubikCells(order, row, col) });
                }
            }
        }
        console.log();
    }

    shuffleRubik() {
        for (let i = 0; i < 10; ++i) {
            let location = Math.floor(Math.random() * RUBIK_PLANE);
            let index = Math.floor(Math.random() * this.order + 1);
            let degree = 90 * Math.floor(Math.random() * 4 - Math.random() * 4);
            console.log(`当前旋转面:${location},边:${index},角度:${degree}`);
            this.rotateSide(location, index, degree);
            this.printRubikCube();
            console.log('* * * * * * * * * *');
        }
    }

    resetRubik() {
        this.rubikFaces.forEach((rubikFace) => {
            rubikFace.resetRubikCells();
        });
    }

    /**
     *!: index为按location方向正数第几行或是第几列
     */
    rotateSide(location: Location, index: number, degree: number) {
        //!只有触摸面为边界面时才进行旋转,否则直交换关联面对应行列的值
        let isMiddle = !(index == 1 || index == this.order);
        if (!isMiddle) {
            this.rubikFaces.get(location)!.rotate(degree);
        }
        let releatedFaces = this.getReleatedFace(location);
        if (degree < 0) {
            degree += 360;
        }
        for (; degree > 0; degree -= 90) {
            for (let i = 0; i < releatedFaces.length - 1; ++i) {
                if (location == Location.UP) {
                    releatedFaces[i].swapWithRow(releatedFaces[i + 1], isMiddle ? index - 1 : 0);
                } else if (location == Location.DOWN) {
                    releatedFaces[i].swapWithRow(releatedFaces[i + 1], isMiddle ? index - 1 : this.order - 1);
                } else if (location == Location.LEFT) {
                    releatedFaces[i].swapWithCol(releatedFaces[i + 1], isMiddle ? index - 1 : 0);
                } else if (location == Location.RIGHT) {
                    releatedFaces[i].swapWithCol(releatedFaces[i + 1], isMiddle ? index - 1 : this.order - 1);
                } else if (location == Location.FRONT) {
                    releatedFaces[i].swapWithRow(releatedFaces[i + 1], isMiddle ? index - 1 : this.order - 1);
                } else if (location == Location.BEHIND) {
                    releatedFaces[i].swapWithRow(releatedFaces[i + 1], isMiddle ? index - 1 : 0);
                }
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
                console.error('unknown location:', location);
                break;
        }
        let ret: RubikFace[] = [];
        for (let location of locations) {
            ret.push(this.rubikFaces.get(location)!);
        }
        return ret;
    }

    getColors(order: number, row: number, col: number) {
        let ret: { [index: number]: cc.Color } = {};
        let cube = this.cubes[order * this.order * this.order + row * this.order + col];
        for (let cell of cube.cells) {
            if (cell.isValid()) {
                ret[cell.location] = RenderColor[cell.color];
            }
        }
        return ret;
    }

    getRubikCells(order: number, row: number, col: number) {
        let ret: RubikCell[] = [];
        let locations: Location[] = [];
        if (order === 0) {
            locations.push(Location.DOWN);
        } else if (order === RUBIK_ORDER - 1) {
            locations.push(Location.UP);
        }
        if (row === 0) {
            locations.push(Location.BEHIND);
        } else if (row === RUBIK_ORDER - 1) {
            locations.push(Location.FRONT);
        }
        if (col === 0) {
            locations.push(Location.LEFT);
        } else if (col === RUBIK_ORDER - 1) {
            locations.push(Location.RIGHT);
        }
        console.log(`当前查找为第${order}层，第${row}行，第${col}列`);
        for (let location of locations) {
            let data = this.convertRowColByLocation(location, order, row, col);
            console.log(`查找到${Location[location]}，第${data.row}行，第${data.col}列`);
            let cell = this.rubikFaces.get(location)?.findRubikCell(data.row, data.col);
            ret.push(cell!);
        }
        return ret;
    }

    //!: 上下行相反，列一致，前后行相反，列一致，左右行列一致
    convertRowColByLocation(location: Location, order: number, row: number, col: number) {
        let ret: { row: number; col: number } = null!;
        switch (location) {
            case Location.UP: //order定值2
                // !(2, 0, 0) -> (0, 0) (2, 0, 1) -> (0, 1) (2, 0, 2) -> (0, 2)
                // !(2, 1, 0) -> (1, 0) (2, 1, 1) -> (1, 1) (2, 1, 2) -> (1, 2)
                // !(2, 2, 0) -> (2, 0) (2, 2, 0) -> (2, 0) (2, 2, 2) -> (2, 2)
                ret = { row: row, col: col };
                break;
            case Location.DOWN: //order定值0
                // !(0, 0, 0) -> (2, 0) (0, 0, 1) -> (2, 1) (0, 0, 2) -> (2, 2)
                // !(0, 1, 0) -> (1, 0) (0, 1, 1) -> (1, 1) (0, 1, 2) -> (1, 2)
                // !(0, 2, 0) -> (0, 0) (0, 2, 1) -> (0, 1) (0, 2, 2) -> (0, 2)
                ret = { row: this.order - row - 1, col: col };
                break;
            case Location.LEFT: //col定值0
                // !(2, 0, 0) -> (0, 2) (2, 1, 0) -> (0, 1) (2, 2, 0) -> (0, 0)
                // !(1, 0, 0) -> (1, 2) (1, 1, 0) -> (1, 1) (1, 2, 0) -> (1, 0)
                // !(0, 0, 0) -> (2, 2) (0, 1, 0) -> (2, 1) (0, 2, 0) -> (2, 0)
                ret = { row: this.order - order - 1, col: this.order - row - 1 };
                break;
            case Location.RIGHT: //col定值2
                // !(2, 0, 2) -> (0, 2) (2, 1, 2) -> (0, 1) (2, 2, 2) -> (0, 0)
                // !(1, 0, 2) -> (1, 2) (1, 1, 2) -> (1, 1) (1, 2, 2) -> (1, 0)
                // !(0, 0, 2) -> (2, 2) (0, 1, 2) -> (2, 1) (0, 2, 2) -> (2, 0)
                ret = { row: this.order - order - 1, col: this.order - row - 1 };
                break;
            case Location.FRONT: //row定值2
                // !(2, 2, 2) -> (0, 2) (2, 2, 1) -> (0, 1) (2, 2, 0) -> (0, 0)
                // !(1, 2, 2) -> (1, 2) (1, 2, 1) -> (1, 1) (1, 2, 0) -> (1, 0)
                // !(0, 2, 2) -> (2, 2) (0, 2, 1) -> (2, 1) (0, 2, 0) -> (2, 0)
                ret = { row: this.order - order - 1, col: col };
                break;
            case Location.BEHIND: //row定值0
                // !(2, 0, 2) -> (0, 2) (2, 0, 1) -> (0, 1) (2, 0, 0) -> (0, 0)
                // !(1, 0, 2) -> (1, 2) (1, 0, 1) -> (1, 1) (1, 0, 0) -> (1, 0)
                // !(0, 0, 2) -> (2, 2) (0, 0, 1) -> (2, 1) (0, 0, 0) -> (2, 0)
                ret = { row: order, col: col };
                break;
        }
        return ret;
    }

    printRubikCube() {
        let str = ``;
        let strUp = this.rubikFaces.get(Location.UP)!.convertToString();
        str += strUp;
        for (let i = 0; i < RUBIK_ORDER; ++i) {
            str += this.rubikFaces.get(Location.LEFT)!.convertToStringOneRow(i);
            str += '\t' + this.rubikFaces.get(Location.FRONT)!.convertToStringOneRow(i);
            str += '\t' + this.rubikFaces.get(Location.RIGHT)!.convertToStringOneRow(i);
            str += '\n';
        }
        let strDown = this.rubikFaces.get(Location.DOWN)!.convertToString();
        str += strDown;
        let strBehind = this.rubikFaces.get(Location.BEHIND)!.convertToString();
        str += strBehind;
        console.log('当前魔方排列为:\n', str);
    }
}
