export default class Engine {
    cursor;
    entities = [];
    laws = [];
    f: number;

    constructor(
        public ctx
    ) {
        this.f = 0;
        this.cursor = this.getCursor(ctx.canvas);
    }

    addLaw(law) {
        this.laws.push(law);
    }

    add(ents) {
        this.entities = this.entities.concat(ents);
    }

    clean() {
        this.entities = this.entities.filter(({ alive }) => alive);
    }

    run() {
        const { ctx, ctx: { canvas: { width, height } } } = this;

        const loop = () => {
            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.restore();

            if (this.f % 10) {
                this.entities.forEach(ent => {

                    !ent.__catched && ent.move();
                    ent.render(this.ctx);
                });
            } else {
                this.entities.forEach(ent => {
                    //速度主动设为0，优化进洞检测性能，让球静止
                    if (Math.abs(ent.vx) < 0.05) {
                        ent.vx = 0;
                    }

                    if (Math.abs(ent.vy) < 0.05) {
                        ent.vy = 0;
                    }

                    !ent.__catched && ent.move();
                    ent.render(this.ctx);
                });
            }


            this.laws.forEach(law => law());

            this.f++;

            window.requestAnimationFrame(loop);
        };

        loop();
    }

    getCursor(elem) {
        const cursor = {
            x: 0, // 鼠标x(相对于传入元素)
            y: 0, // 鼠标y(相对于传入元素)
            down: false, // 鼠标按下状态
            lockOn: null, // 鼠标点击锁定, 避免速度过快移出物体造成拖动丢失
            justClicked: false, // 用于表明鼠标刚刚点击, 还没有移动, 用于区分 内部移动 和 外部点击后 移入内部
        };

        elem.addEventListener('mousemove', ({ offsetX, offsetY }) => {
            cursor.x = offsetX;
            cursor.y = offsetY;
            cursor.justClicked = false;
        }, false);

        elem.addEventListener('mousedown', () => {
            cursor.down = true;
            cursor.justClicked = true;
        }, false);

        elem.addEventListener('mouseup', () => {
            cursor.down = false;
            cursor.lockOn = null;
            cursor.justClicked = false;
        }, false);

        elem.addEventListener('mouseout', () => {
            cursor.down = false;
            cursor.lockOn = null;
            cursor.justClicked = false;
        }, false);

        return cursor;
    }


    checkCollide(entities, cb) {
        const len = entities.length;
        let i, j;
        for (i = 0; i < len - 1; i++) {
            const A = entities[i];
            for (j = i + 1; j < len; j++) {
                const B = entities[j]
                    , distance = this.getDistance(A, B)
                    , maybeCollide = A.vx || A.vy || B.vx || B.vy;
                //至少其一有速度才可能碰撞

                if (distance < A.radius + B.radius && maybeCollide) {
                    cb(A, B, distance);
                }
            }
        }
    }

    //防止重合，动画为帧动画，有可能一下子越过了切点相交
    noCross(A, B, distance) {

        if (A.radius + B.radius > distance) {
            const d = (A.radius + B.radius - distance) / 2
                // 夹角
                , beta = Math.atan2(B.y - A.y, B.x - A.x)
                , dx = Math.cos(beta) * d
                , dy = Math.sin(beta) * d;

            //乘以1.05保证能够退回近似相切状态
            A.x -= dx * 1.05;
            A.y -= dy * 1.05;
            B.x += dx * 1.05;
            B.y += dy * 1.05;
        }
    }

    elasticCollide(A, B) {
        // ** 连线方向正碰
        // 连线方向矢量
        const X = [B.x - A.x, B.y - A.y];
        const lenX = Math.sqrt(Math.pow(X[0], 2) + Math.pow(X[1], 2)); // 连线向量长度
        // 连线方向上的速度
        const vAX = ((A.vx * X[0] + 0 * X[1]) / lenX) + ((0 * X[0] + A.vy * X[1]) / lenX);
        const vBX = ((B.vx * X[0] + 0 * X[1]) / lenX) + ((0 * X[0] + B.vy * X[1]) / lenX);
        const vAXN = ((A.m - B.m) * vAX + 2 * B.m * vBX) / (A.m + B.m);
        const vBXN = (2 * A.m * vAX + (B.m - A.m) * vBX) / (A.m + B.m);

        // ** 切面方向v不变
        // 切线方向矢量
        let Y = [1, -X[0] / X[1]]; // 取一个与X垂直的向量
        let lenY = Math.sqrt(Math.pow(Y[0], 2) + Math.pow(Y[1], 2)); // 切线向量长度
        if (lenY > 9999999999) {
            lenY = 1;
            Y = [0, 1];
        };
        // 切线方向上的速度
        const vAY = ((A.vx * Y[0] + 0 * Y[1]) / lenY) + ((0 * Y[0] + A.vy * Y[1]) / lenY);
        const vBY = ((B.vx * Y[0] + 0 * Y[1]) / lenY) + ((0 * Y[0] + B.vy * Y[1]) / lenY);

        // ** 合成新速度
        // 连线方向上的新速度是标量, 方向与X相同, 现在映射到x, y上
        const oX = Math.atan2(X[1], X[0]);// 连线与x轴的夹角
        const oY = Math.atan2(Y[1], Y[0]);// 切线与x轴的夹角
        const mapxA = vAXN * Math.cos(oX) + vAY * Math.cos(oY);
        const mapyA = vAXN * Math.sin(oX) + vAY * Math.sin(oY); // 正负问题?
        const mapxB = vBXN * Math.cos(oX) + vBY * Math.cos(oY);
        const mapyB = vBXN * Math.sin(oX) + vBY * Math.sin(oY); // 正负问题?

        A.vx = mapxA;
        A.vy = mapyA;
        B.vx = mapxB;
        B.vy = mapyB;
    }

    bungee(entity, elastane) {
        this.__draftBase(entity, entity => {

            if ((entity.vx < 0.5 && entity.vy < 0.5) || entity.__catched) {
                // 绘制弹簧和瞄准线
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(entity.x, entity.y);
                this.ctx.lineTo(this.cursor.x, this.cursor.y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(entity.x, entity.y);
                this.ctx.setLineDash([4, 4]); // 线段长, 空隙长
                this.ctx.lineDashOffset = 0;
                this.ctx.strokeStyle = '#2979FF';
                this.ctx.lineWidth = 1;
                this.ctx.lineTo(entity.x - (this.cursor.x - entity.x) * 3, entity.y - (this.cursor.y - entity.y) * 3);
                this.ctx.stroke();
                this.ctx.restore();

                const len = this.getDistance(entity, this.cursor);

                entity.vx = (entity.x - this.cursor.x) * elastane * 0.1;
                entity.vy = (entity.y - this.cursor.y) * elastane * 0.1;
            }
        }, true);
    }

    __draftBase(entity, move, ifCatch = true) {
        //在球体上点击
        const ifIn = this.getDistance(this.cursor, entity) <= entity.radius;

        if (ifIn && this.cursor.down && this.cursor.justClicked) {
            this.cursor.lockOn = entity;
            entity.__catched = ifCatch;
        }

        if (this.cursor.down && this.cursor.lockOn === entity) {
            move(entity);
        } else {
            entity.__catched = false;
        }
    }

    getDistance(A, B) {

        return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2)) + 3;
    }

}