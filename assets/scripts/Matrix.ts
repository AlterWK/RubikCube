import { cloneDeep } from 'lodash-es';

export enum Horizontal {
    LEFT_TO_RIGHT,
    RIGHT_RO_LEFT,
}

export enum Vertical {
    UP_TO_DOWN,
    DOWN_TO_UP,
}

export class Point {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    rotate(degree: number) {
        let radians = (degree / 180) * Math.PI;
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);
        let x = this.x;
        this.x = cos * x - sin * this.y;
        this.y = sin * x + cos * this.y;
        return this;
    }
}

export class Matrix<T> {
    private row: number = 0;
    private col: number = 0;
    private horizontal: Horizontal = Horizontal.LEFT_TO_RIGHT;
    private vertical: Vertical = Vertical.UP_TO_DOWN;
    private _elements: T[][] = [];

    static create<T>(row: number, col: number, horizontal: Horizontal, vertical: Vertical) {
        let ret = new Matrix<T>(row, col, horizontal, vertical);
        ret.init();
        return ret;
    }

    get elements() {
        return this._elements;
    }

    constructor(row: number, col: number, horizontal: Horizontal, vertical: Vertical) {
        this.row = row;
        this.col = col;
        this.horizontal = horizontal;
        this.vertical = vertical;
    }

    init() {
        for (let i = 0; i < this.row; ++i) {
            this._elements[i] = [];
        }
    }

    findElement(row: number, col: number) {
        if (row < 0 || row > this.row || col < 0 || col > this.col) {
            console.error(`search index is invalid!, current input is row:${row} col:${col}`);
            return null;
        }
        return this._elements[row][col];
    }

    insertElement(row: number, col: number, element: T) {
        this._elements[row][col] = element;
    }

    clone() {
        let ret = new Matrix(this.row, this.col, this.horizontal, this.vertical);
        for (const element of this._elements) {
            let temp: T[] = [];
            for (const entity of element) {
                temp.push(entity);
            }
            ret._elements.push(temp);
        }
        return ret;
    }

    /**
    **  矩阵绕中心点旋转，旋转角度均为90度的整数倍
    **  0, 1, 2      6, 3, 0
    **  3, 4, 5  --> 7, 4, 1
    **  6, 7, 8      8, 5, 2 

    **  A(i, j) -> A(j, N - i - 1) -> A(N - i - 1, N - j - 1) -> A(N - j - 1, i) 
    **  A(0, 1) -> A(1, 2) -> A(2, 1) -> A(1, 0)
    **  A(0, 0) -> A(0, 2) -> A(2, 2) -> A(2, 0)
    */
    rotate(degree: number) {
        if (degree % 90 != 0) {
            console.error('degree must be integral multiply 90');
            return;
        }
        if (degree == 0) {
            return;
        }
        if (degree < 0) {
            degree += 360;
        }
        // 执行一次逆时针90度旋转
        for (let i = 0; i < Math.floor(this.row / 2); i++) {
            for (let j = i; j < this.col - i - 1; j++) {
                // console.log(`x:${i}, y:${j}`);
                let temp = this._elements[i][j];
                this._elements[i][j] = this._elements[j][this.col - i - 1];
                this._elements[j][this.col - i - 1] = this._elements[this.col - i - 1][this.col - j - 1];
                this._elements[this.col - i - 1][this.col - j - 1] = this._elements[this.col - j - 1][i];
                this._elements[this.col - j - 1][i] = temp;
            }
        }
        degree -= 90;
        this.rotate(degree);
    }

    reset(elements: T[]) {
        for (let row = 0; row < this.row; ++row) {
            for (let col = 0; col < this.col; ++col) {
                let index = 0,
                    r = row,
                    c = col;
                if (this.horizontal == Horizontal.RIGHT_RO_LEFT) {
                    r = this.row - row - 1;
                }
                if (this.vertical == Vertical.DOWN_TO_UP) {
                    c = this.col - col - 1;
                }
                index = r * this.row + c;
                this._elements[row][col] = elements[index];
            }
        }
    }

    // top -> left -> right -> down
    packageMatrix(data: [Matrix<T>, Matrix<T>, Matrix<T>, Matrix<T>]) {
        let ROW = Math.floor(this.row / 3);
        let COL = Math.floor(this.col / 3);
        for (let row = 0; row < this.row; ++row) {
            for (let col = 0; col < this.col; ++col) {
                if (
                    (row >= 0 && row < ROW && col >= 0 && col < COL) ||
                    (row >= 0 && row < ROW && col >= 2 * COL && col < 3 * COL) ||
                    (row >= 2 * ROW && row < 3 * ROW && col >= 0 && col < COL) ||
                    (row >= 2 * ROW && row < 3 * ROW && col >= 2 * COL && col < 3 * col) ||
                    (row >= ROW && row < 2 * ROW && col >= COL && col < 2 * COL)
                ) {
                    this._elements[row][col] = null!;
                }

                if (row >= 0 && row < ROW && col >= COL && col < 2 * COL) {
                    this._elements[row][col] = data[0].findElement(row, col - COL)!;
                } else if (row >= ROW && row < 2 * ROW && col >= 0 && col < COL) {
                    this._elements[row][col] = data[1].findElement(row - ROW, col)!;
                } else if (row >= ROW && row < 2 * ROW && col >= 2 * COL && col < 3 * COL) {
                    this._elements[row][col] = data[2].findElement(row - ROW, col - 2 * COL)!;
                } else if (row >= 2 * ROW && row < 3 * ROW && col >= COL && col < 2 * COL) {
                    this._elements[row][col] = data[3].findElement(row - 2 * ROW, col - COL)!;
                }
            }
        }
    }

    unpackMatrix() {
        let ret: Matrix<T>[] = [];
        let ROW = Math.floor(this.row / 3);
        let COL = Math.floor(this.col / 3);
        for (let i = 0; i < 4; ++i) {
            let matrix = Matrix.create<T>(ROW, COL, Horizontal.LEFT_TO_RIGHT, Vertical.UP_TO_DOWN);
            ret.push(matrix);
        }
        for (let row = 0; row < this.row; ++row) {
            for (let col = 0; col < this.col; ++col) {
                if (row >= 0 && row < ROW && col >= COL && col < 2 * COL) {
                    ret[0].insertElement(row, col - COL, this._elements[row][col]);
                } else if (row >= ROW && row < 2 * ROW && col >= 0 && col < COL) {
                    ret[1].insertElement(row - ROW, col, this._elements[row][col]);
                } else if (row >= ROW && row < 2 * ROW && col >= 2 * COL && col < 3 * COL) {
                    ret[2].insertElement(row - ROW, col - 2 * COL, this._elements[row][col]);
                } else if (row >= 2 * ROW && row < 3 * ROW && col >= COL && col < 2 * COL) {
                    ret[3].insertElement(row - 2 * ROW, col - COL, this._elements[row][col]);
                }
            }
        }
        return ret;
    }
}
