import test from "node:test";
import assert from "node:assert/strict";
import { SaveStore } from "../src/storage/SaveStore.js";

test("coins, gems, unlocks, and completed levels persist locally", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  const save = new SaveStore();
  save.addCurrency("coins", 18);
  save.addCurrency("gems", 2);
  save.data.coins -= 12;
  save.unlockPet("bibi");
  save.completeLevel("forest-1", 7);
  save.save();

  const loaded = new SaveStore();
  assert.equal(loaded.data.coins, 6);
  assert.equal(loaded.data.totalCoins, 18);
  assert.equal(loaded.data.gems, 2);
  assert.equal(loaded.data.totalGems, 2);
  assert.ok(loaded.data.unlockedPets.includes("bibi"));
  assert.ok(loaded.data.completedLevels.includes("forest-1"));
  assert.equal(loaded.data.bestCoins["forest-1"], 7);
});
