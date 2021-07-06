
import { _decorator, Component } from 'cc';
import { RubikCube } from './Rubik';
const { ccclass, property } = _decorator;

const RUBIK_ORDER: number = 3;

@ccclass('SceneGame')
export class SceneGame extends Component {

    rubikCube: RubikCube = null!;

    onLoad() {
        this.initData();
        this.initUI();
    }

    initData() {
        this.rubikCube = new RubikCube(RUBIK_ORDER);
        this.rubikCube.initRubik();
        this.rubikCube.rotateSide(0, 1, 90);
    }

    resetRubik() {

    }

    initUI() {

    }

}

