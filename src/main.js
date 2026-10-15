import "./styles/main.css";
import { AudioManager } from "./audio/AudioManager.js";
import { CanvasRenderer } from "./game/CanvasRenderer.js";
import { GameEngine } from "./game/GameEngine.js";
import { InputManager } from "./game/InputManager.js";
import { LEVELS, LEVEL_INDEX } from "./levels/data.js";
import { SaveStore } from "./storage/SaveStore.js";
import { getPet, MISSIONS, OUTFITS } from "./systems/pets.js";
import { UIManager } from "./ui/UIManager.js";

const app = document.querySelector("#app");
const save = new SaveStore();
const audio = new AudioManager();

let ui;
let engine;
let lastFrame = 0;
let lastHudUpdate = 0;

const outfitColor = () =>
  OUTFITS.find((outfit) => outfit.id === save.data.selectedOutfit)?.color ??
  "#5aa376";

function awardBadge(id) {
  if (save.data.achievements.includes(id)) return;
  save.data.achievements.push(id);
  save.save();
}

function evaluatePetUnlocks() {
  if (save.data.totalGems >= 8) save.unlockPet("piko");
  if (save.data.totalCoins >= 25) save.unlockPet("tutu");
}

function isMissionComplete(id) {
  if (id === "first-trail") return save.data.completedLevels.length >= 1;
  if (id === "forest-friends") {
    return ["bibi", "mimi", "kiki"].every((petId) =>
      save.data.unlockedPets.includes(petId),
    );
  }
  if (id === "gem-finder") return save.data.totalGems >= 3;
  return false;
}

function handleGameEvent(eventName, payload = {}) {
  if (eventName === "level-start") {
    save.data.lastLevel = payload.levelId;
    save.save();
    ui.setScene("game");
  } else if (eventName === "pause") {
    ui.showModal("pause");
  } else if (eventName === "resume") {
    ui.closeModal();
  } else if (eventName === "checkpoint") {
    audio.play("checkpoint");
    ui.toast("Đã lưu checkpoint mới!");
  } else if (eventName === "checkpoint-retry") {
    ui.toast("Momo đã quay lại checkpoint. Cố lên!");
  } else if (eventName === "collect") {
    audio.play(payload.kind);
  } else if (eventName === "secret") {
    save.addCurrency("gems", payload.gems);
    evaluatePetUnlocks();
    ui.updateWallet();
    audio.play("gem");
    ui.toast("Bạn tìm thấy một viên ngọc bí mật!");
  } else if (eventName === "rescue") {
    const unlocked = save.unlockPet(payload.petId);
    audio.play("rescue");
    if (unlocked) {
      const pet = getPet(payload.petId);
      ui.toast(`${pet.name} đã trở thành bạn của Momo!`);
    }
  } else if (eventName === "complete") {
    audio.play("win");
    const bonus = payload.rescued ? 3 : 0;
    const rewardedCoins = payload.coins + bonus;
    save.addCurrency("coins", rewardedCoins);
    save.addCurrency("gems", payload.unbankedGems ?? payload.gems);
    save.completeLevel(payload.levelId, payload.coins);
    evaluatePetUnlocks();
    if (payload.levelId === LEVELS[0].id) awardBadge("first-step");
    if (
      ["bibi", "mimi", "kiki"].every((petId) =>
        save.data.unlockedPets.includes(petId),
      )
    )
      awardBadge("forest-friend");
    if (save.data.gems >= 5) awardBadge("gem-seeker");
    if (save.data.garden.length >= 3) awardBadge("garden-host");
    ui.updateWallet();
    ui.showModal("complete", { ...payload, coins: rewardedCoins });
  } else if (eventName === "failed") {
    ui.showModal("failed", payload);
  }
}

engine = new GameEngine(handleGameEvent);
ui = new UIManager(app, save, (action, data) => handleAction(action, data));
const renderer = new CanvasRenderer(app.querySelector("#game-canvas"));
const input = new InputManager(app);

function startLevel(levelId) {
  const level = LEVELS.find((item) => item.id === levelId);
  if (!level) return;
  audio.getContext();
  audio.setMusicEnabled(save.data.musicEnabled);
  engine.startLevel(level.id, getPet(save.data.selectedPet), outfitColor());
  if (!save.data.tutorialSeen && level.id === LEVELS[0].id) {
    engine.pause();
    ui.showModal("tutorial");
  }
}

function handleAction(action, data) {
  if (action === "home") {
    engine.leave();
    ui.setScene("home");
  } else if (action === "worlds") {
    ui.setScene("worlds");
  } else if (action === "open-world") {
    ui.setScene("levels", { worldId: data.world });
  } else if (action === "levels") {
    engine.leave();
    ui.setScene("levels");
  } else if (action === "start-level") {
    startLevel(data.level);
  } else if (action === "pause") {
    engine.pause();
  } else if (action === "resume") {
    engine.resume();
  } else if (action === "close-tutorial") {
    save.data.tutorialSeen = true;
    save.save();
    engine.resume();
  } else if (action === "retry") {
    if (!engine.level) return;
    if (engine.state === "failed") engine.continueFromCheckpoint();
    else startLevel(engine.level.id);
  } else if (action === "next-level") {
    startLevel(data.level);
  } else if (action === "quit-game") {
    engine.leave();
    ui.setScene("levels");
  } else if (action === "pets") {
    ui.setScene("pets");
  } else if (action === "select-pet") {
    if (save.data.unlockedPets.includes(data.pet)) {
      save.data.selectedPet = data.pet;
      save.save();
      ui.setScene("pets");
    }
  } else if (action === "inventory") {
    ui.setScene("inventory");
  } else if (action === "buy-outfit") {
    const outfit = OUTFITS.find((item) => item.id === data.outfit);
    if (!outfit || save.data.coins < outfit.cost) return;
    save.data.coins -= outfit.cost;
    save.data.ownedOutfits.push(outfit.id);
    save.data.selectedOutfit = outfit.id;
    save.save();
    ui.setScene("inventory");
  } else if (action === "select-outfit") {
    if (!save.data.ownedOutfits.includes(data.outfit)) return;
    save.data.selectedOutfit = data.outfit;
    save.save();
    ui.setScene("inventory");
  } else if (action === "garden") {
    ui.setScene("garden");
  } else if (action === "buy-garden") {
    const costs = {
      "flower-bed": 0,
      "bird-bath": 10,
      "mushroom-seat": 16,
      "wind-chime": 22,
    };
    const cost = costs[data.item];
    if (
      cost === undefined ||
      save.data.garden.includes(data.item) ||
      save.data.coins < cost
    )
      return;
    save.data.coins -= cost;
    save.data.garden.push(data.item);
    save.save();
    if (save.data.garden.length >= 3) awardBadge("garden-host");
    ui.setScene("garden");
  } else if (action === "achievements") {
    ui.setScene("achievements");
  } else if (action === "missions") {
    ui.setScene("missions");
  } else if (action === "claim-mission") {
    const mission = MISSIONS.find((item) => item.id === data.mission);
    if (
      !mission ||
      save.data.claimedMissions.includes(mission.id) ||
      !isMissionComplete(mission.id)
    )
      return;
    save.data.claimedMissions.push(mission.id);
    if (mission.reward.coins) save.addCurrency("coins", mission.reward.coins);
    if (mission.reward.gems) save.addCurrency("gems", mission.reward.gems);
    evaluatePetUnlocks();
    save.save();
    ui.updateWallet();
    ui.setScene("missions");
  } else if (action === "settings") {
    ui.setScene("settings");
  } else if (action === "sound" || action === "toggle-sound") {
    save.data.soundEnabled = !save.data.soundEnabled;
    audio.setEnabled(save.data.soundEnabled);
    save.save();
    ui.setScene(ui.scene);
  } else if (action === "music") {
    save.data.musicEnabled = !save.data.musicEnabled;
    audio.getContext();
    audio.setMusicEnabled(save.data.musicEnabled);
    save.save();
    ui.updateWallet();
  } else if (action === "toggle-music") {
    save.data.musicEnabled = !save.data.musicEnabled;
    audio.setMusicEnabled(save.data.musicEnabled);
    save.save();
    ui.setScene("settings");
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" || event.key.toLowerCase() === "p") {
    if (engine.state === "playing") engine.pause();
    else if (engine.state === "paused" && ui.modal === "pause") engine.resume();
  }
});

document.addEventListener("visibilitychange", () => {
  lastFrame = 0;
  if (document.hidden && engine.state === "playing") engine.pause();
});

function frame(timestamp) {
  const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
  lastFrame = timestamp;
  engine.update(dt, input.read(), renderer.width, renderer.height);
  renderer.render(engine, timestamp);
  if (timestamp - lastHudUpdate > 100) {
    ui.updateHud(engine);
    lastHudUpdate = timestamp;
  }
  requestAnimationFrame(frame);
}

window.addEventListener("beforeunload", () => {
  input.destroy();
  renderer.destroy();
  audio.destroy();
});

requestAnimationFrame(frame);
