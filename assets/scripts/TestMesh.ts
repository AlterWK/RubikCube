import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('TestMesh')
export class TestMesh extends cc.Component {
    @property(cc.MeshRenderer)
    cubeMesh: cc.MeshRenderer = null!;
    @property(cc.MeshRenderer)
    planeMesh: cc.MeshRenderer = null!;

    private createCubeMesh(): cc.Mesh | null {
        let colors: number[] = [];
        // front red
        colors.push(255, 0, 0, 255);
        colors.push(255, 0, 0, 255);
        colors.push(255, 0, 0, 255);
        colors.push(255, 0, 0, 255);

        // right green
        colors.push(0, 255, 0, 255);
        colors.push(0, 255, 0, 255);
        colors.push(0, 255, 0, 255);
        colors.push(0, 255, 0, 255);

        // back blue
        colors.push(0, 0, 255, 255);
        colors.push(0, 0, 255, 255);
        colors.push(0, 0, 255, 255);
        colors.push(0, 0, 255, 255);

        // left indigo
        colors.push(0, 255, 255, 255);
        colors.push(0, 255, 255, 255);
        colors.push(0, 255, 255, 255);
        colors.push(0, 255, 255, 255);

        // up yellow
        colors.push(255, 0, 255, 255);
        colors.push(255, 0, 255, 255);
        colors.push(255, 0, 255, 255);
        colors.push(255, 0, 255, 255);

        // down purple
        colors.push(255, 255, 0, 255);
        colors.push(255, 255, 0, 255);
        colors.push(255, 255, 0, 255);
        colors.push(255, 255, 0, 255);

        let config = cc.utils.readMesh(this.cubeMesh.mesh!);
        config.colors = colors;
        config.uvs = [];
        let mesh = cc.utils.createMesh(config);

        console.log(mesh);

        return mesh;
    }

    onLoad() {
        // cc.macro.SHOW_MESH_WIREFRAME = true;
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.cubeMesh.mesh = this.createCubeMesh();
    }

    onTouchMove(t: any, event: cc.EventTouch) {
        let dif = event.getDelta();
        let q_tmp = new cc.Quat();
        let v_tmp = new cc.Vec3(-dif.y, dif.x, 0);
        v_tmp.normalize();
        let out_Q = cc.Quat.rotateAround(q_tmp, this.cubeMesh.node.rotation, v_tmp, Math.PI * 0.01);
        this.cubeMesh.node.setRotation(out_Q.x, out_Q.y, out_Q.z, out_Q.w);
    }
}
