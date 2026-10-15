import { moveAndCollide, overlaps } from "../game/Physics.js";

export class Player {
  constructor(position) {
    this.w = 34;
    this.h = 44;
    this.reset(position);
  }

  reset(position) {
    this.x = position.x;
    this.y = position.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.facing = 1;
    this.doubleJumpUsed = false;
    this.glideTime = 0;
    this.invulnerable = 0;
  }

  update(dt, input, level, pet, onFall) {
    const direction = Number(input.right) - Number(input.left);
    const speed = 245 * (pet.speedMultiplier ?? 1);
    this.vx = direction * speed;
    if (direction) this.facing = direction;

    if (input.jumpPressed) {
      if (this.grounded) {
        this.vy = -510 * (pet.jumpMultiplier ?? 1);
        this.grounded = false;
      } else if (pet.doubleJump && !this.doubleJumpUsed) {
        this.vy = -430;
        this.doubleJumpUsed = true;
      }
    }

    if (this.grounded) this.doubleJumpUsed = false;
    const canGlide =
      pet.glide && input.jumpHeld && this.vy > 0 && this.glideTime < 1.5;
    this.vy = Math.min(
      this.vy + (canGlide ? 540 : 1500) * dt,
      canGlide ? 190 : 820,
    );
    if (canGlide) this.glideTime += dt;
    if (this.grounded) this.glideTime = 0;
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    moveAndCollide(this, level, dt);
    this.x = Math.max(0, Math.min(this.x, level.width - this.w));
    if (this.y > 760) onFall();

    for (const hazard of level.hazards) {
      if (hazard.broken || this.invulnerable > 0 || !overlaps(this, hazard))
        continue;
      if (pet.breaksCrates && hazard.type === "crate") {
        hazard.broken = true;
        continue;
      }
      onFall();
      break;
    }
  }
}
