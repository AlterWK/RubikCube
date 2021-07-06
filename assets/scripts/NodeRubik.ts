import * as cc from 'cc';
import { RubikCell } from './Rubik';
const { _decorator, Component } = cc;
const { ccclass, property } = _decorator;

@ccclass('NodeRubik')
export class NodeRubik extends Component {

    rubikCell: RubikCell = null!;

    onLoad() {

    }
}
