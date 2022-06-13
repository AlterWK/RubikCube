import * as cc from 'cc';
import { Horizontal, Matrix, Vertical } from './Matrix';

export const RUBIK_ORDER: number = 3;

export enum Location {
    UP = 0,
    LEFT = 1,
    FRONT = 2,
    BACK = 3,
    RIGHT = 4,
    DOWN = 5,
    INVALID = -1,
}

//逆时针
const RELEATED_SET: { [index: number]: Location[] } = {
    [Location.UP]: [Location.BACK, Location.LEFT, Location.RIGHT, Location.FRONT],
    [Location.LEFT]: [Location.UP, Location.BACK, Location.FRONT, Location.DOWN],
    [Location.FRONT]: [Location.UP, Location.LEFT, Location.RIGHT, Location.DOWN],
    [Location.BACK]: [Location.UP, Location.RIGHT, Location.LEFT, Location.DOWN],
    [Location.RIGHT]: [Location.UP, Location.FRONT, Location.BACK, Location.DOWN],
    [Location.DOWN]: [Location.BACK, Location.LEFT, Location.RIGHT, Location.FRONT],
};

export enum Color {
    INDIGO = 0,
    BLUE = 1,
    RED = 2,
    PURPLE = 3,
    GREEN = 4,
    YELLOW = 5,
    INVALID = -1,
}

// !:这里颜色的选取有些问题，使用白，橙两色时，渲染出来会有相同颜色的面，很奇怪
export const RenderColor: { [inbdex: number]: cc.Color } = {
    [Color.INDIGO]: cc.color(0, 255, 255), //white
    [Color.BLUE]: cc.color(0, 0, 255),
    [Color.RED]: cc.color(255, 0, 0),
    [Color.PURPLE]: cc.color(255, 0, 255), //orange
    [Color.GREEN]: cc.color(0, 255, 0),
    [Color.YELLOW]: cc.color(255, 255, 0),
};

export class RubikCell {
    location: Location = Location.UP;
    color: Color = Color.INDIGO;
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
        this.index = index ?? this.index;
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
    private _matrix: Matrix<RubikCell> = null!;

    static create(row: number, col: number, location: Location, color: Color) {
        let ret = new RubikFace(row, col, location, color);
        ret.init();
        return ret;
    }

    get matrix() {
        return this._matrix;
    }

    constructor(row: number, col: number, location: Location, color: Color) {
        this.col = col;
        this.row = row;
        this.originColor = color;
        this.originLocation = location;
    }

    init() {
        let index: number = 0;
        for (let row = 0; row < this.row; ++row) {
            for (let col = 0; col < this.col; ++col) {
                this.pushRubikCell(new RubikCell(row, col, this.originLocation, this.originColor, index++));
            }
        }
        let [horizontal, vertical] = this.queryAlignMode();
        this._matrix = Matrix.create<RubikCell>(this.row, this.col, horizontal, vertical);
        this._matrix.reset(this.rubikCells);
    }

    queryAlignMode(): [Horizontal, Vertical] {
        switch (this.originLocation) {
            case Location.UP:
            case Location.LEFT:
            case Location.BACK:
                return [Horizontal.LEFT_TO_RIGHT, Vertical.UP_TO_DOWN];
            case Location.DOWN:
            case Location.FRONT:
            case Location.RIGHT:
                return [Horizontal.RIGHT_RO_LEFT, Vertical.DOWN_TO_UP];
            default:
                return [Horizontal.LEFT_TO_RIGHT, Vertical.UP_TO_DOWN];
        }
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
        // return this.rubikCells[index];
        return this._matrix.findElement(row, col)!;
    }

    resetRubikCells() {
        let index: number = 0;
        for (let i = 0; i < this.row; ++i) {
            for (let j = 0; j < this.col; ++j) {
                let rubikCell = this.rubikCells[i * this.row + j];
                rubikCell.reset(i, j, this.originLocation, this.originColor, index++);
            }
        }
        this._matrix.reset(this.rubikCells);
    }

    clone() {
        let ret = RubikFace.create(this.row, this.col, this.originLocation, this.originColor);
        for (const rubikCell of this.rubikCells) {
            ret.rubikCells.push(rubikCell.clone());
        }
        return ret;
    }

    rotate(degree: number) {
        this._matrix.rotate(degree);
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
            ret += this.findRubikCell(row, col).color;
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
                    [0, 0, 0]                                   [0, 1, 2]
                    [0, 0, 0]                                   [3, 4, 5]
                    [0, 0, 0]                                   [6, 7, 8]

         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [0, 1, 2]   [0, 1, 2]   [0, 1, 2]
         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [3, 4, 5]   [3, 4, 5]   [3, 4, 5]
         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [6, 7, 8]   [6, 7, 8]   [6, 7, 8]

                    [5, 5, 5]                                   [0, 1, 2]
                    [5, 5, 5]                                   [3, 4, 5]
                    [5, 5, 5]                                   [6, 7, 8]

                    [3, 3, 3]                                   [0, 1, 2]
                    [3, 3, 3]                                   [3, 4, 5]
                    [3, 3, 3]                                   [6, 7, 8]
     !上下行相反，列一致，前后行相反，列一致，左右行列一致
*/

/* 
                    [0, 0, 0]                                   [0, 1, 2]
                    [0, 0, 0]                                   [3, 4, 5]
                    [0, 0, 0]                                   [6, 7, 8]

         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [0, 1, 2]   [8, 7, 6]   [8, 7, 6]
         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [3, 4, 5]   [5, 4, 3]   [5, 4, 3]
         [1, 1, 1]  [2, 2, 2]  [4, 4, 4]            [6, 7, 8]   [2, 1, 0]   [2, 1, 0]

                    [5, 5, 5]                                   [8, 7, 6]
                    [5, 5, 5]                                   [5, 4, 3]
                    [5, 5, 5]                                   [2, 1, 0]

                    [3, 3, 3]                                   [0, 1, 2]
                    [3, 3, 3]                                   [3, 4, 5]
                    [3, 3, 3]                                   [6, 7, 8]
     !上下行列相反，左右行列相反，前后行列相反
     !上左后行列相同，下右前行列相同
*/

const RUBIK_PLANE: number = 6;

export class RubikCube {
    private order: number = 0;
    private rubikFaces: Map<Location, RubikFace> = new Map<Location, RubikFace>();
    private cubes: { cells: RubikCell[] }[] = [];

    constructor(order: number) {
        this.order = order;
        this.initRubik();
        this.updateCubes();
    }

    private initRubik() {
        this.rubikFaces.set(Location.UP, this.createOneRubikFace(Location.UP, Color.INDIGO));
        this.rubikFaces.set(Location.DOWN, this.createOneRubikFace(Location.DOWN, Color.YELLOW));
        this.rubikFaces.set(Location.LEFT, this.createOneRubikFace(Location.LEFT, Color.BLUE));
        this.rubikFaces.set(Location.RIGHT, this.createOneRubikFace(Location.RIGHT, Color.GREEN));
        this.rubikFaces.set(Location.FRONT, this.createOneRubikFace(Location.FRONT, Color.RED));
        this.rubikFaces.set(Location.BACK, this.createOneRubikFace(Location.BACK, Color.PURPLE));
    }

    createOneRubikFace(location: Location, color: Color) {
        let rubikFace: RubikFace = RubikFace.create(this.order, this.order, location, color);
        return rubikFace;
    }

    private updateCubes() {
        this.cubes = [];
        for (let order = 0; order < this.order; ++order) {
            for (let row = 0; row < this.order; ++row) {
                for (let col = 0; col < this.order; ++col) {
                    this.cubes.push({ cells: this.getRubikCells(order, row, col) });
                }
            }
        }
        /*  this.cubes.forEach((data, index) => {
            console.log('当前块颜色：', index);
            data.cells.forEach((cell) => {
                console.log(`${Location[cell.location]} : ${Color[cell.color]}`);
            });
        }); */
    }

    shuffleRubik() {
        for (let i = 0; i < 10; ++i) {
            let location = Math.floor(Math.random() * RUBIK_PLANE);
            let index = Math.floor(Math.random() * this.order + 1);
            let degree = 90 * Math.floor(Math.random() * 4 - Math.random() * 4);
            console.log(`当前旋转面:${Location[location]},边:${index},角度:${degree}`);
            this.rotateSide(location, index, degree);
            this.printRubikCube();
            console.log('* * * * * * * * * *');
        }
    }

    resetRubik() {
        this.rubikFaces.forEach((rubikFace) => {
            rubikFace.resetRubikCells();
        });
        this.updateCubes();
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

        let matrix = Matrix.create<RubikCell>(this.order * 3, this.order * 3, Horizontal.LEFT_TO_RIGHT, Vertical.UP_TO_DOWN);
        let matrixes = this.getReleatedMatrix(location);
        matrix.packageMatrix(matrixes as any);
        matrix.rotate(degree);
        let temp = matrix.unpackMatrix();
        for (let i = 0; i < matrixes.length; ++i) {
            for (let j = 0; j < matrixes[i].elements.length; ++j) {
                for (let k = 0; k < matrixes[i].elements[j].length; ++k) {
                    matrixes[i].elements[j][k].copy(temp[i].elements[j][k]);
                }
            }
        }

        /* if (degree < 0) {
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
                } else if (location == Location.BACK) {
                    releatedFaces[i].swapWithRow(releatedFaces[i + 1], isMiddle ? index - 1 : 0);
                }
            }
        } */
        this.updateCubes();
    }

    getReleatedMatrix(location: Location) {
        let ret: Matrix<RubikCell>[] = [];
        let locations = this.rubikFaces.get(location)!.releatedLocations;
        for (let location of locations) {
            ret.push(this.rubikFaces.get(location)!.matrix);
        }
        return ret;
    }

    getReleatedFace(location: Location) {
        let locations: Location[] = [];
        switch (location) {
            case Location.UP:
            case Location.DOWN:
            case Location.FRONT:
            case Location.BACK:
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
            locations.push(Location.BACK);
        } else if (row === RUBIK_ORDER - 1) {
            locations.push(Location.FRONT);
        }
        if (col === 0) {
            locations.push(Location.LEFT);
        } else if (col === RUBIK_ORDER - 1) {
            locations.push(Location.RIGHT);
        }
        for (let location of locations) {
            let data = this.convertRowColByLocation(location, order, row, col);
            let cell = this.rubikFaces.get(location)?.findRubikCell(data.row, data.col);
            ret.push(cell!);
        }
        return ret;
    }

    // !: 这里转换是将魔方实际的行列层转到对应面的行列
    convertRowColByLocation(location: Location, order: number, row: number, col: number) {
        let ret: { row: number; col: number } = null!;
        switch (location) {
            case Location.UP: //order定值2
                ret = { row: row, col: col };
                break;
            case Location.DOWN: //order定值0
                ret = { row: this.order - row - 1, col: this.order - col - 1 };
                break;
            case Location.LEFT: //col定值0
                ret = { row: this.order - order - 1, col: row };
                break;
            case Location.RIGHT: //col定值2
                ret = { row: order, col: this.order - row - 1 };
                break;
            case Location.BACK: //row定值0
                ret = { row: this.order - order - 1, col: col };
                break;
            case Location.FRONT: //row定值2
                ret = { row: order, col: this.order - col - 1 };
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
        let strBehind = this.rubikFaces.get(Location.BACK)!.convertToString();
        str += strBehind;
        console.log('当前魔方排列为:\n', str);
    }
}
