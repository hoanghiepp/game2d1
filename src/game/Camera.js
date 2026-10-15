export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  follow(target, viewWidth, viewHeight, worldWidth) {
    const wantedX = Math.max(
      0,
      Math.min(
        target.x + target.w / 2 - viewWidth * 0.42,
        worldWidth - viewWidth,
      ),
    );
    const wantedY = Math.max(0, target.y + target.h / 2 - viewHeight * 0.62);
    this.x += (wantedX - this.x) * 0.12;
    this.y += (wantedY - this.y) * 0.1;
  }
}
