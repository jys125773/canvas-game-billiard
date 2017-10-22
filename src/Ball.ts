import { FRICTION } from './config';

export default class Ball {
    m = 1;
    vx = 0;
    vy = 0;
    ax = 0;
    ay = 0;
    f = FRICTION; // 摩擦力系数
    alive = true; // 为false证明可以清理了

    constructor(
        public x,
        public y,
        public radius,
        public image,
        public type = 'ball'
    ) {

    }

    move() {
        this.vx += this.ax;
        this.vy += this.ay;
        // 摩擦力
        this.vx *= 1 - this.f;
        this.vy *= 1 - this.f;
        // 移动
        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx) {
        ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    destory() {
        this.alive = false;
    }
}