import Engine from './Engine';
import Table from './Table';
import Ball from './Ball';
import Hole from './Hole';

import {
    ctxTable,
    ctxPlayZone,
    imagesSourceMap,
    yellowBallPostions,
    holePositions,
    HOLE_RADIUS,
    RADIUS,
    HEIGHT,
    POWER,
} from './config';

export default class Game {
    constructor() {
        this.init();
    }

    async loadSource() {
        try {
            const imagesMap: { [prop: string]: HTMLElement } = {};
            await Promise.all(
                Object.keys(imagesSourceMap).map(key =>
                    new Promise(resolve => {
                        const theImage = new Image();
                        theImage.src = imagesSourceMap[key];
                        theImage.onload = () => {
                            imagesMap[key] = theImage;
                            resolve();
                        };
                    }))
            );

            return imagesMap;
        } catch (error) {
            console.log('loadSource', error);
        }
    }

    async init() {
        const imagesMap = await this.loadSource();

        const table = new Table();
        table.render(ctxTable, imagesMap['table']);

        const holes = holePositions.map(({ x, y }) => new Hole(x, y, HOLE_RADIUS));

        const generalBalls = yellowBallPostions.map(({ x, y }, index) =>
            new Ball(x, y, RADIUS, imagesMap[`ball${index + 1}`])
        );

        const cueBall = new Ball(170, HEIGHT / 2, RADIUS, imagesMap['whiteBall'], 'cue');
        const balls = generalBalls.concat(cueBall);
        const engine = new Engine(ctxPlayZone);

        engine.add(balls);

        console.log(balls)

        engine.addLaw(() => {

            engine.bungee(cueBall, POWER);
        });

        const { minX, minY, maxX, maxY } = table;
        engine.addLaw(() => {
            balls.forEach(ball => {
                if (ball.x < minX) {
                    ball.vx = -ball.vx;
                    ball.x = minX;
                }

                if (ball.x > maxX) {
                    ball.vx = -ball.vx;
                    ball.x = maxX;
                }

                if (ball.y < minY) {
                    ball.vy = -ball.vy;
                    ball.y = minY;
                }

                if (ball.y > maxY) {
                    ball.vy = -ball.vy;
                    ball.y = maxY;
                }

            });
        });

        engine.addLaw(() => {
            balls.forEach(ball => {
                if (ball.vx !== 0 || ball.vy !== 0) {
                    holes.forEach(hole => {
                        if (engine.getDistance(ball, hole) < hole.radius) {
                            ball.destory();

                            // if (ball.type === 'cue') {
                            //     alert('you lose');
                            // }
                        }
                    });
                }
            });

            engine.clean();

            // if (engine.entities.length === 1) {
            //     alert('you win');
            // }
        });

        engine.addLaw(() => {
            engine.checkCollide(balls, (A, B, distance) => {

                engine.noCross(A, B, distance);
                engine.elasticCollide(A, B);
            });
        });

        engine.run();
    }
}