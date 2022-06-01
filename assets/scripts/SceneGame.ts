import * as cc from 'cc';
import { NodeRubik } from './NodeRubik';
import { Location, RubikCube, RUBIK_ORDER } from './Rubik';
const { ccclass, property } = cc._decorator;

const CELL_SIZE: number = 50;

@ccclass('SceneGame')
export class SceneGame extends cc.Component {
    @property(cc.Button)
    btnShow: cc.Button = null!;
    @property(cc.Button)
    btnShuffle: cc.Button = null!;
    @property(cc.Button)
    btnReset: cc.Button = null!;
    @property(cc.Node)
    panelCube: cc.Node = null!;

    rubikCube: RubikCube = null!;

    onLoad() {
        this.initData();
        this.initUI();
        this.registerEvents();
    }

    initData() {
        this.rubikCube = new RubikCube(RUBIK_ORDER);
        this.rubikCube.rotateSide(Location.BEHIND, 3, -90);
        this.rubikCube.printRubikCube();
    }

    initUI() {
        this.btnShow.node.on('click', this.onBtnShow, this);
        this.btnShuffle.node.on('click', this.onBtnShuffle, this);
        this.btnReset.node.on('click', this.onBtnRset, this);
        this.createRubik();
    }

    registerEvents() {
        cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onTouchMove(touch: cc.Touch, event: cc.EventTouch) {
        let dif = event.getDelta();
        let q_tmp = new cc.Quat();
        let v_tmp = new cc.Vec3(-dif.y, dif.x, 0);
        v_tmp.normalize();
        let out_Q = cc.Quat.rotateAround(q_tmp, this.panelCube.rotation, v_tmp, Math.PI * 0.01);
        this.panelCube.setRotation(out_Q.x, out_Q.y, out_Q.z, out_Q.w);
    }

    onBtnShow() {
        this.rubikCube.printRubikCube();
    }

    onBtnRset() {
        this.rubikCube.resetRubik();
    }

    onBtnShuffle() {
        this.rubikCube.shuffleRubik();
    }

    /*
    !                      ▲ y
    !                      |
    !                      |
    !                      |
    !                      |
    !                      |
    !                      |
    !                    o · —— —— —— —— —— ▶ x
    !                     ／
    !                    ／
    !                   ／
    !                  ／
    !                 ／
    !              z ◣
    ! 自下而上绘制各个层级的块
    */
    async createRubik() {
        let middle = Math.floor(RUBIK_ORDER / 2);
        for (let order = 0; order < RUBIK_ORDER; ++order) {
            for (let row = 0; row < RUBIK_ORDER; ++row) {
                for (let col = 0; col < RUBIK_ORDER; ++col) {
                    let nodeRubik = await NodeRubik.instantiate();
                    nodeRubik.position = cc.v3((col - middle) * CELL_SIZE, (order - middle) * CELL_SIZE, (row - middle) * CELL_SIZE);
                    nodeRubik.setScale(cc.v3(CELL_SIZE, CELL_SIZE, CELL_SIZE));
                    this.panelCube.addChild(nodeRubik);
                    nodeRubik.getComponent(NodeRubik)!.paintColor(this.rubikCube.getColors(order, row, col));
                }
            }
        }
    }

    updateRubik() {
        this.panelCube.removeAllChildren();
        this.createRubik();
    }
}
