import * as cc from 'cc';
import { NodeRubik } from './NodeRubik';
import { Location, RenderColor, RubikCube } from './Rubik';
const { ccclass, property } = cc._decorator;

const RUBIK_ORDER: number = 3;

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
        this.rubikCube.initRubik();
        this.rubikCube.rotateSide(Location.BEHIND, 3, -90);
        this.rubikCube.printRubikCube();
    }

    initUI() {
        this.btnShow.node.on('click', this.onBtnShow, this);
        this.btnShuffle.node.on('click', this.onBtnShuffle, this);
        this.btnReset.node.on('click', this.onBtnRset, this);
        this.testGraphics();
        this.createRubik();
    }

    registerEvents() {}

    testGraphics() {
        let node = new cc.Node();
        node.parent = this.node;
        node.position = cc.v3(0, 0, 0);
        let graphics = node.addComponent(cc.Graphics);
        graphics.lineWidth = 2;
        graphics.color = cc.color(255, 0, 0);
        graphics.moveTo(0, 0);
        graphics.lineTo(100, 100);
        graphics.close();
        graphics.stroke();
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

    async createRubik() {
        for (let order = 0; order < RUBIK_ORDER; ++order) {
            for (let row = 0; row < RUBIK_ORDER; ++row) {
                for (let col = 0; col < RUBIK_ORDER; ++col) {
                    let nodeRubik = await NodeRubik.instantiate();
                    nodeRubik.position = cc.v3(order, row, col);
                    this.panelCube.addChild(nodeRubik);
                    nodeRubik.getComponent(NodeRubik)!.meshColor = RenderColor[Math.floor(Math.random() * 5)];
                }
            }
        }
    }
}
