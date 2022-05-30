import * as cc from 'cc';
import { RubikCell } from './Rubik';
const { ccclass, property } = cc._decorator;

enum CubeType {
    CENTER = 0,
    CORNER = 1,
    ARRIS = 2,
}

async function loadRes(url: string, type: typeof cc.Asset) {
    return new Promise<any>((resolve, reject) => {
        let res = cc.resources.get(url, type);
        if (res) {
            resolve(res);
        } else {
            cc.resources.load(url, type, (error, res) => {
                if (!error) {
                    resolve(res);
                } else {
                    reject(error.message);
                }
            });
        }
    });
}

@ccclass('NodeRubik')
export class NodeRubik extends cc.Component {
    cubeType: CubeType = CubeType.CENTER;
    rubikCells: RubikCell[] = [];

    static async instantiate() {
        let prefab: cc.Prefab = await loadRes('cube', cc.Prefab)!;
        let node: cc.Node = cc.instantiate(prefab);
        node.getComponent(NodeRubik)?.init();
        return node;
    }

    init() {}

    onLoad() {
        this.initData();
        this.initUI();
        this.registerEvents();
    }

    initData() {}

    initUI() {}

    registerEvents() {}

    set meshColor(color: cc.Color) {
        let meshRender = this.getComponent(cc.MeshRenderer)!;
        //!: 此种方式获取的材质是共享材质，一旦修改则所有引用到该材质的渲染均发生改变
        // let material = meshRender.getMaterial(0);
        //*:获取当前材质，是材质变体，改变不会影响其他材质
        let material = meshRender.material;
        material?.setProperty('mainColor', color, 0);
    }
}
