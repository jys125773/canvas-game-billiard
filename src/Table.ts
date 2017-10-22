import { WIDTH, HEIGHT, THICKNESS } from './config';

export default class Table {
    minX = THICKNESS;
    maxX = WIDTH + THICKNESS;
    minY = THICKNESS;
    maxY = HEIGHT + THICKNESS;

    constructor() { }

    render(ctx, image) {
        ctx.drawImage(image, 0, 0, 800, 544);
    }
}