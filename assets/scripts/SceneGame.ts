
import * as cc from 'cc';
import { Location, RubikCube } from './Rubik';
const { ccclass, property } = cc._decorator;

const RUBIK_ORDER: number = 3;

@ccclass('SceneGame')
export class SceneGame extends cc.Component {

    @property
    btnShow: cc.Button = null!;

    rubikCube: RubikCube = null!;

    onLoad() {
        this.initData();
        this.initUI();
        this.registerEvents();
    }

    initData() {
        this.rubikCube = new RubikCube(RUBIK_ORDER);
        this.rubikCube.initRubik();
        this.rubikCube.rotateSide(Location.UP, 1, 90);
        this.rubikCube.printRubikCube();
    }

    initUI() {

    }

    registerEvents() {

    }

    onBtnShow() {
        this.rubikCube.printRubikCube();
    }

}

