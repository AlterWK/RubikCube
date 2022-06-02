import * as cc from 'cc';

// 创建一个立方体
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

const POINTS: number[][] = [
    [0.5, 0.5, 0.5], //v0
    [-0.5, 0.5, 0.5], //v1
    [-0.5, -0.5, 0.5], //v2
    [0.5, -0.5, 0.5], //v3
    [0.5, -0.5, -0.5], //v4
    [0.5, 0.5, -0.5], //v5
    [-0.5, 0.5, -0.5], //v6
    [-0.5, -0.5, -0.5], //v7
];

const COLORS: number[][] = [
    [255, 0, 0, 255], //red
    [0, 255, 0, 255], //green
    [0, 0, 255, 255], //blue
    [255, 255, 0, 255], //yellow
    [255, 0, 255, 255], //purple
    [0, 255, 255, 255], //indigo
];

const positions: number[] = [];
//front v0-v1-v2-v3
positions.push(...POINTS[0]);
positions.push(...POINTS[1]);
positions.push(...POINTS[2]);
positions.push(...POINTS[3]);
//right v0-v3-v4-v5
positions.push(...POINTS[0]);
positions.push(...POINTS[3]);
positions.push(...POINTS[4]);
positions.push(...POINTS[5]);
//up v0-v5-v6-v1
positions.push(...POINTS[0]);
positions.push(...POINTS[5]);
positions.push(...POINTS[6]);
positions.push(...POINTS[1]);
//left v1-v6-v7-v2
positions.push(...POINTS[1]);
positions.push(...POINTS[6]);
positions.push(...POINTS[7]);
positions.push(...POINTS[2]);
//down v7-v4-v3-v2
positions.push(...POINTS[7]);
positions.push(...POINTS[4]);
positions.push(...POINTS[3]);
positions.push(...POINTS[2]);
//back v4-v7-v6-v5
positions.push(...POINTS[4]);
positions.push(...POINTS[7]);
positions.push(...POINTS[6]);
positions.push(...POINTS[5]);

const colors: number[] = [];
//front v0-v1-v2-v3 red
colors.push(...COLORS[0]);
colors.push(...COLORS[0]);
colors.push(...COLORS[0]);
colors.push(...COLORS[0]);
//right v0-v3-v4-v5 green
colors.push(...COLORS[1]);
colors.push(...COLORS[1]);
colors.push(...COLORS[1]);
colors.push(...COLORS[1]);
//up v0-v5-v6-v1 blue
colors.push(...COLORS[2]);
colors.push(...COLORS[2]);
colors.push(...COLORS[2]);
colors.push(...COLORS[2]);
//left v1-v6-v7-v2 yellow
colors.push(...COLORS[3]);
colors.push(...COLORS[3]);
colors.push(...COLORS[3]);
colors.push(...COLORS[3]);
//down v7-v4-v3-v2 purple
colors.push(...COLORS[4]);
colors.push(...COLORS[4]);
colors.push(...COLORS[4]);
colors.push(...COLORS[4]);
//back v4-v7-v6-v5 indigo
colors.push(...COLORS[5]);
colors.push(...COLORS[5]);
colors.push(...COLORS[5]);
colors.push(...COLORS[5]);

// !:为保证每面颜色不同，不同面间不能共用顶点
const indices: number[] = [];
//front
indices.push(0, 1, 2, 0, 2, 3);
//right
indices.push(4, 5, 6, 4, 6, 7);
//up
indices.push(8, 9, 10, 8, 10, 11);
//left
indices.push(12, 13, 14, 12, 14, 15);
//down
indices.push(16, 17, 18, 16, 18, 19);
//back
indices.push(20, 21, 22, 20, 22, 23);

export const MeshConfig: cc.primitives.IGeometry = {
    positions: positions,
    colors: colors,
    indices: indices,
};
