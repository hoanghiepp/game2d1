import { Player } from "../entities/Player.js";
import { Camera } from "./Camera.js";
import { overlaps } from "./Physics.js";
import { createLevel } from "../levels/data.js";
import { getPet } from "../systems/pets.js";

export class GameEngine {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.camera = new Camera();
    this.level = null;
    this.player = null;
    this.pet = getPet("momo");
    this.outfitColor = "#5aa376";
    this.state = "menu";
    this.particles = [];
    this.hearts = 3;
    this.runCoins = 0;
    this.runGems = 0;
    this.immediateGems = 0;
    this.elapsed = 0;
    this.secretFound = false;
    this.rescueAwarded = false;
  }

  startLevel(levelId, pet, outfitColor) {
    this.level = createLevel(levelId);
    this.level.checkpoint = { x: this.level.start.x, y: 454 };
    this.pet = pet;
    this.outfitColor = outfitColor;
    this.player = new Player(this.level.start);
    this.state = "playing";
    this.hearts = 3;
    this.runCoins = 0;
    this.runGems = 0;
    this.immediateGems = 0;
    this.elapsed = 0;
    this.secretFound = false;
    this.rescueAwarded = false;
    this.particles.length = 0;
    this.camera.x = 0;
    this.camera.y = 0;
    this.onEvent("level-start", { levelId });
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.onEvent("pause");
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.onEvent("resume");
  }

  retry() {
    if (!this.level) return;
    this.startLevel(this.level.id, this.pet, this.outfitColor);
  }

  leave() {
    this.state = "menu";
    this.level = null;
    this.player = null;
    this.particles.length = 0;
  }

  continueFromCheckpoint() {
    if (this.state !== "failed" || !this.level || !this.player) return;
    this.hearts = 3;
    this.player.reset({
      x: this.level.checkpoint.x,
      y: this.level.checkpoint.y - this.player.h,
    });
    this.player.invulnerable = 1.4;
    this.state = "playing";
    this.onEvent("resume");
  }

  recover() {
    if (this.player.invulnerable > 0 || this.state !== "playing") return;
    this.hearts -= 1;
    if (this.hearts <= 0) {
      this.state = "failed";
      this.onEvent("failed", { levelId: this.level.id });
      return;
    }
    this.player.reset({
      x: this.level.checkpoint.x,
      y: this.level.checkpoint.y - this.player.h,
    });
    this.player.invulnerable = 1.4;
    this.onEvent("checkpoint-retry", { hearts: this.hearts });
  }

  update(dt, input, viewWidth, viewHeight) {
    if (this.state !== "playing" || !this.level) return;
    this.elapsed += dt;
    for (const platform of this.level.movingPlatforms) {
      platform.x += platform.speed * platform.direction * dt;
      if (platform.x < platform.minX || platform.x > platform.maxX) {
        platform.x = Math.max(
          platform.minX,
          Math.min(platform.x, platform.maxX),
        );
        platform.direction *= -1;
      }
    }

    this.player.update(dt, input, this.level, this.pet, () => this.recover());
    if (this.state !== "playing") return;
    for (const checkpoint of this.level.checkpoints) {
      if (
        !checkpoint.active &&
        this.player.x + this.player.w / 2 >= checkpoint.x
      ) {
        checkpoint.active = true;
        this.level.checkpoint = { x: checkpoint.x, y: checkpoint.y };
        this.onEvent("checkpoint", { x: checkpoint.x });
      }
    }

    this.collectNearby(
      this.level.collectibles,
      this.pet.pickupRadius ?? 26,
      "coin",
      1,
    );
    this.collectNearby(this.level.gems, this.pet.pickupRadius ?? 26, "gem", 1);
    if (
      !this.level.rescue.rescued &&
      this.player.x + this.player.w / 2 >= this.level.rescue.x - 18
    ) {
      this.level.rescue.rescued = true;
      if (!this.rescueAwarded) {
        this.rescueAwarded = true;
        this.onEvent("rescue", { petId: this.level.rescue.pet });
      }
    }
    if (
      this.level.secret &&
      !this.secretFound &&
      Math.hypot(
        this.player.x - this.level.secret.x,
        this.player.y - this.level.secret.y,
      ) < 58
    ) {
      this.secretFound = true;
      this.runGems += 1;
      this.immediateGems += 1;
      this.onEvent("secret", { gems: 1 });
      this.spawnParticles(
        this.level.secret.x,
        this.level.secret.y,
        "#fff19c",
        12,
      );
    }
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 60 * dt;
      particle.life -= dt;
    }
    for (let index = this.particles.length - 1; index >= 0; index--) {
      if (this.particles[index].life <= 0) this.particles.splice(index, 1);
    }

    if (this.player.x + this.player.w >= this.level.goalX) {
      this.state = "complete";
      this.onEvent("complete", {
        levelId: this.level.id,
        coins: this.runCoins,
        gems: this.runGems,
        unbankedGems: this.runGems - this.immediateGems,
        rescued: this.level.rescue.rescued,
        elapsed: this.elapsed,
        secretFound: this.secretFound,
      });
    }
    this.camera.follow(this.player, viewWidth, viewHeight, this.level.width);
  }

  collectNearby(items, radius, kind, amount) {
    const playerX = this.player.x + this.player.w / 2;
    const playerY = this.player.y + this.player.h / 2;
    const reachSquared = radius * radius;
    for (const item of items) {
      if (item.collected) continue;
      const dx = playerX - item.x;
      const dy = playerY - item.y;
      if (
        dx * dx + dy * dy > reachSquared &&
        !overlaps(this.player, { x: item.x - 8, y: item.y - 10, w: 16, h: 20 })
      )
        continue;
      item.collected = true;
      if (kind === "coin") this.runCoins += amount;
      else this.runGems += amount;
      this.spawnParticles(
        item.x,
        item.y,
        kind === "coin" ? "#ffe291" : "#b7fbef",
        7,
      );
      this.onEvent("collect", { kind, amount });
    }
  }

  spawnParticles(x, y, color, count) {
    for (let index = 0; index < count; index++) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 32 + (index % 3) * 18;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 24,
        life: 0.55,
        maxLife: 0.55,
        radius: 2 + (index % 3),
        color,
      });
    }
  }
}
