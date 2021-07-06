
import { _decorator, Component, Node } from 'cc';
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
    }

    resetRubik() {

    }

    initUI() {

    }

}

