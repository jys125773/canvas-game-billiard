export const ctxTable = document.getElementById('table').getContext('2d');
export const ctxPlayZone = document.getElementById('playzone').getContext('2d');

const ballsMap = {};
for (let i = 1; i < 16; i++) {
    ballsMap[`ball${i}`] = `./public/images/ball${i}.png`;
}

export const imagesSourceMap = {
    table: './public/images/table.jpg',
    whiteBall: './public/images/white_ball.png',
    yellowBall: './public/images/yellow_ball.png',
    ...ballsMap
};

export const FRICTION = 0.015;//摩擦系数
export const POWER = 5;//击球力度
export const WIDTH = 736; //案宽
export const HEIGHT = 480;//案高
export const THICKNESS = 32;//边缘厚度

export const RADIUS = 15; //球半径
export const yellowBallPostions = (function () {
    const list = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j <= i; j++) {
            const x = 520 + i * 2 * RADIUS
                , y = HEIGHT / 2 - RADIUS * i + j * 2 * RADIUS;

            list.push({ x, y });
        };
    };

    return list;
})();

export const HOLE_RADIUS = 20;
export const holePositions = [
    { x: THICKNESS - 6, y: THICKNESS - 6 },
    { x: THICKNESS + WIDTH / 2 - 2, y: THICKNESS - 10 },
    { x: THICKNESS + WIDTH, y: THICKNESS - 6 },
    { x: THICKNESS - 6, y: HEIGHT + THICKNESS + 2 },
    { x: THICKNESS + WIDTH / 2 - 2, y: HEIGHT + THICKNESS + 10 - 2 },
    { x: THICKNESS + WIDTH, y: HEIGHT + THICKNESS + 2 },
];

