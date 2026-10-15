const SAVE_KEY = "pet-adventure-save-v1";

const defaults = () => ({
  coins: 0,
  gems: 0,
  totalCoins: 0,
  totalGems: 0,
  unlockedPets: ["momo"],
  selectedPet: "momo",
  completedLevels: [],
  bestCoins: {},
  ownedOutfits: ["leaf-cape"],
  selectedOutfit: "leaf-cape",
  garden: ["flower-bed"],
  achievements: [],
  claimedMissions: [],
  soundEnabled: true,
  musicEnabled: true,
  tutorialSeen: false,
  lastLevel: "forest-1",
});

export class SaveStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      const data =
        saved && typeof saved === "object"
          ? { ...defaults(), ...saved }
          : defaults();
      data.totalCoins ??= data.coins;
      data.totalGems ??= data.gems;
      return data;
    } catch {
      return defaults();
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      return true;
    } catch {
      return false;
    }
  }

  addCurrency(type, amount) {
    if (type !== "coins" && type !== "gems") return;
    this.data[type] = Math.max(0, this.data[type] + amount);
    if (amount > 0) {
      const totalKey = type === "coins" ? "totalCoins" : "totalGems";
      this.data[totalKey] = (this.data[totalKey] ?? 0) + amount;
    }
    this.save();
  }

  unlockPet(id) {
    if (!this.data.unlockedPets.includes(id)) {
      this.data.unlockedPets.push(id);
      this.save();
      return true;
    }
    return false;
  }

  completeLevel(levelId, coins) {
    if (!this.data.completedLevels.includes(levelId))
      this.data.completedLevels.push(levelId);
    this.data.bestCoins[levelId] = Math.max(
      this.data.bestCoins[levelId] ?? 0,
      coins,
    );
    this.save();
  }
}
