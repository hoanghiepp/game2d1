const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
};

export function drawPet(
  ctx,
  x,
  y,
  pet,
  size = 1,
  facing = 1,
  time = 0,
  outfit = "#5aa376",
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size * facing, size);
  const bounce = Math.sin(time * 8) * 1.5;
  ctx.translate(0, bounce);

  ctx.fillStyle = "rgba(35, 66, 48, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (pet.id !== "tutu") {
    ctx.fillStyle = pet.light;
    ctx.beginPath();
    ctx.ellipse(
      -20,
      -16,
      pet.id === "kiki" ? 10 : 15,
      pet.id === "kiki" ? 6 : 8,
      -0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = pet.color;
    ctx.beginPath();
    ctx.ellipse(-24, -17, pet.id === "kiki" ? 7 : 10, 5, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = pet.color;
  ctx.beginPath();
  ctx.ellipse(0, -18, 16, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pet.color;
  if (pet.id === "bibi") {
    ctx.beginPath();
    ctx.ellipse(-10, -45, 5, 18, -0.14, 0, Math.PI * 2);
    ctx.ellipse(8, -46, 5, 18, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3bfd4";
    ctx.beginPath();
    ctx.ellipse(-10, -45, 2, 11, -0.14, 0, Math.PI * 2);
    ctx.ellipse(8, -46, 2, 11, 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === "tutu") {
    ctx.beginPath();
    ctx.arc(-10, -37, 8, 0, Math.PI * 2);
    ctx.arc(10, -37, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === "kiki") {
    ctx.beginPath();
    ctx.moveTo(-9, -32);
    ctx.lineTo(-6, -42);
    ctx.lineTo(-1, -32);
    ctx.moveTo(6, -33);
    ctx.lineTo(13, -41);
    ctx.lineTo(14, -29);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-13, -31);
    ctx.lineTo(-17, pet.id === "piko" ? -45 : -48);
    ctx.quadraticCurveTo(-5, -43, -4, -31);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -32);
    ctx.lineTo(13, pet.id === "piko" ? -45 : -48);
    ctx.quadraticCurveTo(20, -39, 15, -28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pet.light;
    ctx.beginPath();
    ctx.moveTo(-13, -35);
    ctx.lineTo(-14, -43);
    ctx.lineTo(-8, -34);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -35);
    ctx.lineTo(14, -43);
    ctx.lineTo(14, -32);
    ctx.fill();
  }

  ctx.fillStyle = pet.light;
  ctx.beginPath();
  ctx.ellipse(4, -12, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c3b32";
  ctx.beginPath();
  if (pet.id === "tutu") {
    ctx.fillStyle = "#f5f5eb";
    ctx.ellipse(-2, -23, 7, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(14, -22, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#26342e";
  }
  ctx.arc(3, -23, 2, 0, Math.PI * 2);
  ctx.arc(13, -22, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b75b54";
  ctx.beginPath();
  ctx.arc(9, -15, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = outfit;
  ctx.beginPath();
  ctx.moveTo(-13, -9);
  ctx.quadraticCurveTo(0, -15, 14, -8);
  ctx.lineTo(10, -1);
  ctx.quadraticCurveTo(0, -6, -10, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f8e7b7";
  ctx.beginPath();
  ctx.ellipse(-7, -1, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -1, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (pet.id === "piko") {
    ctx.fillStyle = pet.color;
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.quadraticCurveTo(-36, -35, -31, -3);
    ctx.quadraticCurveTo(-23, -5, -14, -7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, -12);
    ctx.quadraticCurveTo(35, -35, 31, -3);
    ctx.quadraticCurveTo(23, -5, 15, -7);
    ctx.fill();
  } else if (pet.id === "kiki") {
    ctx.fillStyle = "#e8a642";
    ctx.beginPath();
    ctx.moveTo(16, -17);
    ctx.lineTo(25, -14);
    ctx.lineTo(16, -11);
    ctx.fill();
  }
  ctx.restore();
}

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.width = 960;
    this.height = 540;
    this.scale = 1;
    this.dpr = 1;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
    const portrait = rect.width < rect.height;
    this.scale = portrait
      ? rect.height / 540
      : Math.min(rect.width / 960, rect.height / 540);
    this.width = rect.width / this.scale;
    this.height = rect.height / this.scale;
    this.ctx.setTransform(
      this.dpr * this.scale,
      0,
      0,
      this.dpr * this.scale,
      0,
      0,
    );
  }

  render(game, timestamp) {
    const { ctx, width, height } = this;
    const level = game.level;
    const palette = level?.palette ?? {
      sky: "#c7b8d8",
      far: "#d7bfce",
      near: "#e7c5b8",
      ground: "#dfaF9f",
      top: "#e9c9a9",
      accent: "#f1cc68",
    };
    ctx.save();
    if (level) {
      ctx.fillStyle = palette.sky;
    } else {
      const menuSky = ctx.createLinearGradient(0, 0, 0, height);
      menuSky.addColorStop(0, "#bfb1d4");
      menuSky.addColorStop(0.52, "#d9c1d0");
      menuSky.addColorStop(1, "#f2d4b8");
      ctx.fillStyle = menuSky;
    }
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width * 0.77,
      height * 0.15,
      10,
      width * 0.77,
      height * 0.15,
      height * 0.42,
    );
    glow.addColorStop(0, "rgba(255, 245, 180, 0.62)");
    glow.addColorStop(1, "rgba(255, 245, 180, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    this.drawHills(game.camera.x, width, height, palette, timestamp);
    if (level) {
      ctx.save();
      ctx.translate(-game.camera.x, -game.camera.y);
      this.drawWorld(level, game, timestamp);
      if (game.player) {
        const pet = game.pet;
        drawPet(
          ctx,
          game.player.x + game.player.w / 2,
          game.player.y + game.player.h,
          pet,
          1,
          game.player.facing,
          timestamp / 1000,
          game.outfitColor,
        );
      }
      this.drawParticles(game.particles);
      ctx.restore();
    } else {
      this.drawMenuScene(timestamp);
    }
    ctx.restore();
  }

  drawHills(cameraX, width, height, palette, time) {
    const { ctx } = this;
    for (let layer = 0; layer < 3; layer++) {
      const factor = [0.12, 0.25, 0.4][layer];
      const base = height * [0.64, 0.76, 0.88][layer];
      ctx.fillStyle = [palette.far, palette.near, palette.ground][layer];
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, base);
      for (let x = -180; x <= width + 180; x += 180) {
        const screenX = x - ((cameraX * factor) % 180);
        ctx.quadraticCurveTo(
          screenX + 45,
          base - 58 - Math.sin(x * 0.03 + time * 0.0002) * 8,
          screenX + 90,
          base,
        );
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(248, 255, 212, 0.42)";
    for (let index = 0; index < 12; index++) {
      const x = (index * 137 - cameraX * 0.08) % (width + 80);
      const y = 70 + ((index * 83) % Math.max(90, height * 0.43));
      ctx.beginPath();
      ctx.arc(
        (x + width + 80) % (width + 80),
        y + Math.sin(time / 600 + index) * 5,
        2 + (index % 3),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    const butterflyColors = ["#ef7e83", "#f0bd4d", "#8e91d0"];
    for (let index = 0; index < butterflyColors.length; index++) {
      const span = width + 60;
      const x = ((time * 0.018 + index * 173) % span) - 30;
      const y =
        height * (0.22 + index * 0.11) + Math.sin(time / 430 + index) * 9;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(time / 350 + index) * 0.18);
      ctx.fillStyle = butterflyColors[index];
      ctx.beginPath();
      ctx.ellipse(-4, -2, 4, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(4, -2, 4, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff4d3";
      ctx.fillRect(-0.7, -4, 1.4, 7);
      ctx.restore();
    }
  }

  drawWorld(level, game, time) {
    const { ctx } = this;
    for (let index = 0; index < Math.ceil(level.width / 280); index++) {
      const x = index * 280 + 30;
      this.drawTree(x, 454, index);
    }
    this.drawFlowerPatches(level);

    for (const platform of level.platforms)
      this.drawPlatform(platform, level.palette);
    for (const platform of level.movingPlatforms) {
      ctx.fillStyle = "#bd9261";
      roundRect(ctx, platform.x, platform.y, platform.w, platform.h, 9);
      ctx.fill();
      ctx.fillStyle = "#e9c985";
      roundRect(ctx, platform.x + 3, platform.y, platform.w - 6, 7, 4);
      ctx.fill();
    }

    for (const hazard of level.hazards) {
      if (hazard.broken) continue;
      if (hazard.type === "mushroom") this.drawMushroom(hazard);
      else if (hazard.type === "crate") this.drawCrate(hazard);
      else this.drawThorns(hazard);
    }
    for (const point of level.checkpoints)
      this.drawCheckpoint(point, point.active);
    for (const item of level.collectibles)
      if (!item.collected) this.drawCoin(item, time);
    for (const item of level.gems)
      if (!item.collected) this.drawGem(item, time);
    if (!level.rescue.rescued) {
      this.drawPet(
        ctx,
        level.rescue.x,
        level.rescue.y + 40,
        level.rescue.pet,
        time,
        true,
      );
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 14px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText("Cứu bạn!", level.rescue.x, level.rescue.y - 15);
    }
    this.drawGoal(level.goalX, 454, time);
    if (level.secret && !game.secretFound)
      this.drawSecretHint(level.secret, time);
  }

  drawTree(x, groundY, index) {
    const { ctx } = this;
    const height = 64 + ((index * 19) % 40);
    ctx.fillStyle = "rgba(51, 96, 66, 0.72)";
    roundRect(ctx, x + 21, groundY - height, 12, height, 5);
    ctx.fill();

    const canopyColors = ["#70aa75", "#82b879", "#65a873", "#79a98c"];
    ctx.fillStyle = canopyColors[index % canopyColors.length];
    for (const [dx, dy, radius] of [
      [12, 0, 27],
      [34, -13, 30],
      [52, 5, 23],
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx, groundY - height + dy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ["#e79a83", "#f0c85c", "#d991b0"][index % 3];
    for (const [dx, dy] of [
      [18, -10],
      [39, -25],
      [48, 8],
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx, groundY - height + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(230, 245, 180, 0.42)";
    ctx.beginPath();
    ctx.arc(x + 27, groundY - height - 15, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFlowerPatches(level) {
    const { ctx } = this;
    const flowerColors = [
      "#ef7881",
      "#f3c751",
      "#75bfc0",
      "#a78ac8",
      "#fff0d2",
    ];
    for (const platform of level.platforms) {
      if (platform.h < 100) continue;
      for (
        let x = platform.x + 48;
        x < platform.x + platform.w - 24;
        x += 172
      ) {
        const color = flowerColors[Math.floor(x / 172) % flowerColors.length];
        const y = platform.y - 9;
        ctx.strokeStyle = "#5c9a68";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, platform.y - 2);
        ctx.lineTo(x, y + 3);
        ctx.stroke();
        ctx.fillStyle = color;
        for (let petal = 0; petal < 5; petal++) {
          const angle = (petal * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(
            x + Math.cos(angle) * 3.4,
            y + Math.sin(angle) * 3.4,
            2.4,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.fillStyle = "#f7d66c";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawPlatform(platform, palette) {
    const { ctx } = this;
    ctx.fillStyle = palette.ground;
    roundRect(ctx, platform.x, platform.y, platform.w, platform.h, 11);
    ctx.fill();
    ctx.fillStyle = palette.top;
    roundRect(ctx, platform.x, platform.y, platform.w, 13, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(226, 210, 150, 0.36)";
    for (let x = platform.x + 20; x < platform.x + platform.w - 12; x += 54) {
      ctx.fillRect(x, platform.y + 33 + (x % 3) * 7, 4, 3);
    }
  }

  drawMushroom(hazard) {
    const { ctx } = this;
    ctx.fillStyle = "#fff0cf";
    roundRect(
      ctx,
      hazard.x + 12,
      hazard.y + 16,
      hazard.w - 24,
      hazard.h - 16,
      5,
    );
    ctx.fill();
    ctx.fillStyle = "#dd7c78";
    ctx.beginPath();
    ctx.ellipse(
      hazard.x + hazard.w / 2,
      hazard.y + 17,
      hazard.w / 2,
      17,
      0,
      Math.PI,
      0,
    );
    ctx.fill();
    ctx.fillStyle = "#fff8dc";
    ctx.beginPath();
    ctx.arc(hazard.x + hazard.w * 0.36, hazard.y + 9, 3, 0, Math.PI * 2);
    ctx.arc(hazard.x + hazard.w * 0.68, hazard.y + 14, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawThorns(hazard) {
    const { ctx } = this;
    ctx.fillStyle = "#5d7650";
    for (let x = hazard.x; x < hazard.x + hazard.w; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, hazard.y + hazard.h);
      ctx.lineTo(x + 6, hazard.y + 4);
      ctx.lineTo(x + 12, hazard.y + hazard.h);
      ctx.fill();
    }
    ctx.fillStyle = "#d58b77";
    ctx.beginPath();
    ctx.arc(hazard.x + hazard.w / 2, hazard.y + 1, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCrate(crate) {
    const { ctx } = this;
    ctx.fillStyle = "#b88250";
    roundRect(ctx, crate.x, crate.y, crate.w, crate.h, 5);
    ctx.fill();
    ctx.strokeStyle = "#e3bd79";
    ctx.lineWidth = 3;
    ctx.strokeRect(crate.x + 5, crate.y + 5, crate.w - 10, crate.h - 10);
    ctx.beginPath();
    ctx.moveTo(crate.x + 6, crate.y + 6);
    ctx.lineTo(crate.x + crate.w - 6, crate.y + crate.h - 6);
    ctx.moveTo(crate.x + crate.w - 6, crate.y + 6);
    ctx.lineTo(crate.x + 6, crate.y + crate.h - 6);
    ctx.stroke();
  }

  drawCoin(item, time) {
    const { ctx } = this;
    const bob = Math.sin(time / 250 + item.x) * 3;
    ctx.fillStyle = "rgba(255, 236, 160, 0.24)";
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1c553";
    ctx.beginPath();
    ctx.ellipse(item.x, item.y + bob, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffeb9d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(item.x, item.y + bob, 5, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawGem(item, time) {
    const { ctx } = this;
    const bob = Math.sin(time / 300 + item.x) * 4;
    ctx.fillStyle = "rgba(143, 238, 229, 0.2)";
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#77d3d0";
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 17 + bob);
    ctx.lineTo(item.x + 12, item.y + bob);
    ctx.lineTo(item.x, item.y + 17 + bob);
    ctx.lineTo(item.x - 12, item.y + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d7ffff";
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 11 + bob);
    ctx.lineTo(item.x + 5, item.y + bob);
    ctx.lineTo(item.x, item.y + 5 + bob);
    ctx.fill();
  }

  drawCheckpoint(point, active) {
    const { ctx } = this;
    ctx.fillStyle = "#866c4f";
    roundRect(ctx, point.x, point.y - 54, 5, 55, 2);
    ctx.fill();
    ctx.fillStyle = active ? "#f1c553" : "#d7e1b3";
    ctx.beginPath();
    ctx.moveTo(point.x + 5, point.y - 51);
    ctx.lineTo(point.x + 32, point.y - 43);
    ctx.lineTo(point.x + 5, point.y - 34);
    ctx.closePath();
    ctx.fill();
  }

  drawGoal(x, y, time) {
    const { ctx } = this;
    ctx.fillStyle = "rgba(246, 255, 190, 0.22)";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - 40,
      32 + Math.sin(time / 220) * 3,
      53,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#f8e38a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y - 40, 19, 39, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff5c8";
    ctx.font = "bold 13px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("VỀ NHÀ", x, y - 91);
  }

  drawSecretHint(secret, time) {
    const { ctx } = this;
    ctx.fillStyle = `rgba(255, 247, 176, ${0.42 + Math.sin(time / 190) * 0.18})`;
    ctx.beginPath();
    ctx.arc(secret.x, secret.y, 8, 0, Math.PI * 2);
    ctx.fill();
    for (let index = 0; index < 3; index++) {
      const angle = time / 400 + (index * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(
        secret.x + Math.cos(angle) * 18,
        secret.y + Math.sin(angle) * 18,
        2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  drawPet(ctx, x, y, petId, time, caged) {
    const pet = {
      momo: { color: "#e9824f", light: "#ffd08c" },
      bibi: { color: "#dc91b7", light: "#ffe0eb" },
      mimi: { color: "#9b8bd1", light: "#e8dcff" },
      kiki: { color: "#f0bd4d", light: "#fff1a8" },
      piko: { color: "#63bda7", light: "#d2f5c7" },
      tutu: { color: "#526b61", light: "#eaf0df" },
    }[petId] ?? { color: "#dc91b7", light: "#ffe0eb" };
    if (caged) {
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      roundRect(ctx, x - 34, y - 48, 68, 54, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      for (const barX of [x - 23, x - 8, x + 8, x + 23]) {
        ctx.beginPath();
        ctx.moveTo(barX, y - 46);
        ctx.lineTo(barX, y + 4);
        ctx.stroke();
      }
    }
    drawPet(
      ctx,
      x,
      y,
      { ...pet, id: petId, light: pet.light, color: pet.color },
      0.72,
      1,
      time / 700,
      "#70ad75",
    );
  }

  drawParticles(particles) {
    const { ctx } = this;
    for (const particle of particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawMenuScene(time) {
    const { ctx, width, height } = this;
    if (height > width) {
      this.drawTree(width * 0.08, height * 0.78, 1);
      this.drawTree(width * 0.88, height * 0.78, 2);
      return;
    }
    this.drawTree(width * 0.18, height * 0.83, 1);
    this.drawTree(width * 0.78, height * 0.83, 2);
  }

  destroy() {
    this.resizeObserver.disconnect();
  }
}
