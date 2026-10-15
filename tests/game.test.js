import test from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "../src/game/GameEngine.js";
import { Player } from "../src/entities/Player.js";
import { createLevel, LEVELS } from "../src/levels/data.js";
import { getPet } from "../src/systems/pets.js";

const neutralInput = {
  left: false,
  right: false,
  jumpHeld: false,
  jumpPressed: false,
};

test("Rừng Xanh has three independent playable level definitions", () => {
  assert.equal(LEVELS.length, 3);
  assert.deepEqual(
    LEVELS.map((level) => level.world),
    ["forest", "forest", "forest"],
  );
  const firstRun = createLevel("forest-1");
  const secondRun = createLevel("forest-1");
  firstRun.collectibles[0].collected = true;
  assert.equal(secondRun.collectibles[0].collected, false);
});

test("player lands, walks, and jumps from the ground", () => {
  const player = new Player({ x: 80, y: 360 });
  const level = createLevel("forest-1");
  for (let frame = 0; frame < 60 && !player.grounded; frame++) {
    player.update(1 / 60, neutralInput, level, getPet("momo"), () => {});
  }
  assert.equal(player.grounded, true);
  const startX = player.x;
  player.update(
    1 / 60,
    { ...neutralInput, right: true, jumpPressed: true },
    level,
    getPet("momo"),
    () => {},
  );
  assert.ok(player.x > startX);
  assert.ok(player.vy < 0);
});

test("moving platforms move and reverse at their bounds", () => {
  const events = [];
  const game = new GameEngine((name) => events.push(name));
  game.startLevel("forest-2", getPet("momo"), "#5aa376");
  const platform = game.level.movingPlatforms[0];
  const initialX = platform.x;
  game.update(0.1, neutralInput, 960, 540);
  assert.notEqual(platform.x, initialX);
  platform.x = platform.maxX - 1;
  platform.direction = 1;
  game.update(0.1, neutralInput, 960, 540);
  assert.equal(platform.direction, -1);
});

test("checkpoint retries recover and pause freezes the level timer", () => {
  const game = new GameEngine(() => {});
  game.startLevel("forest-1", getPet("momo"), "#5aa376");
  game.player.y = 800;
  game.update(1 / 60, neutralInput, 960, 540);
  assert.equal(game.hearts, 2);
  assert.equal(game.player.x, game.level.start.x);
  const elapsed = game.elapsed;
  game.pause();
  game.update(1, { ...neutralInput, right: true }, 960, 540);
  assert.equal(game.elapsed, elapsed);
});

test("retry after losing all hearts continues from the last checkpoint", () => {
  const game = new GameEngine(() => {});
  game.startLevel("forest-1", getPet("momo"), "#5aa376");
  game.level.checkpoint = { x: 1200, y: 402 };
  game.hearts = 1;
  game.player.y = 800;
  game.update(1 / 60, neutralInput, 960, 540);
  assert.equal(game.state, "failed");
  game.continueFromCheckpoint();
  assert.equal(game.state, "playing");
  assert.equal(game.hearts, 3);
  assert.equal(game.player.x, 1200);
});

test("a secret gem is awarded once even when the level is completed", () => {
  let result;
  const game = new GameEngine((name, payload) => {
    if (name === "complete") result = payload;
  });
  game.startLevel("forest-1", getPet("momo"), "#5aa376");
  game.player.x = game.level.secret.x;
  game.player.y = game.level.secret.y;
  game.update(0, neutralInput, 960, 540);
  assert.equal(game.runGems, 1);
  game.player.x = game.level.goalX;
  game.update(0, neutralInput, 960, 540);
  assert.equal(result.unbankedGems, 0);
  assert.equal(result.gems, 1);
});

test("collecting the goal transitions to the win state", () => {
  const events = [];
  const game = new GameEngine((name) => events.push(name));
  game.startLevel("forest-3", getPet("momo"), "#5aa376");
  game.player.x = game.level.goalX;
  game.update(0, neutralInput, 960, 540);
  assert.equal(game.state, "complete");
  assert.ok(events.includes("complete"));
});

test("leaving a level clears gameplay before returning to menus", () => {
  const game = new GameEngine(() => {});
  game.startLevel("forest-1", getPet("momo"), "#5aa376");
  game.leave();
  assert.equal(game.state, "menu");
  assert.equal(game.level, null);
  assert.equal(game.player, null);
});
