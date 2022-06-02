import { cloneDeep } from 'lodash-es';

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
    row: number = 0;
    col: number = 0;
    private elements: T[][] = [];

    static create<T>(row: number, col: number) {
        let ret = new Matrix<T>(row, col);
        ret.init();
        return ret;
    }

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    init() {
        for (let i = 0; i < this.row; ++i) {
            this.elements[i] = [];
        }
    }

    findElement(row: number, col: number) {
        if (row < 0 || row > this.row || col < 0 || col > this.col) {
            console.error(`search index is invalid!, current input is row:${row} col:${col}`);
            return null;
        }
        return this.elements[row][col];
    }

    clone() {
        let ret = new Matrix(this.row, this.col);
        for (const element of this.elements) {
            let temp: T[] = [];
            for (const entity of element) {
                temp.push(entity);
            }
            ret.elements.push(temp);
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
                let temp = this.elements[i][j];
                this.elements[i][j] = this.elements[j][this.col - i - 1];
                this.elements[j][this.col - i - 1] = this.elements[this.col - i - 1][this.col - j - 1];
                this.elements[this.col - i - 1][this.col - j - 1] = this.elements[this.col - j - 1][i];
                this.elements[this.col - j - 1][i] = temp;
            }
        }
        degree -= 90;
        this.rotate(degree);
    }

    reset(elements: T[]) {
        for (let row = 0; row < this.row; ++row) {
            for (let col = 0; col < this.col; ++col) {
                this.elements[row][col] = elements[row * this.row + col];
            }
        }
    }
}
