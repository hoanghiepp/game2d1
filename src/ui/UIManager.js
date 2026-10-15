import { LEVELS, LEVEL_INDEX } from "../levels/data.js";
import { drawPet } from "../game/CanvasRenderer.js";
import { MISSIONS, OUTFITS, PETS, WORLDS } from "../systems/pets.js";

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const petUnlockText = {
  bibi: "Giải cứu Bibi ở Lối mòn đầu tiên",
  mimi: "Giải cứu Mimi ở Cầu nấm nhún",
  kiki: "Giải cứu Kiki ở Thung lũng đom đóm",
  piko: "Tìm 8 viên ngọc trong rừng",
  tutu: "Thu thập 25 đồng xu",
};

export class UIManager {
  constructor(root, save, onAction) {
    this.root = root;
    this.save = save;
    this.onAction = onAction;
    this.scene = "home";
    this.worldId = "forest";
    this.modal = null;
    this.modalData = {};
    this.noticeTimer = 0;
    this.buildShell();
    this.root.addEventListener("click", (event) => this.handleClick(event));
  }

  buildShell() {
    this.root.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <button class="brand-mark" type="button" data-action="home" aria-label="Về trang chính"><span class="brand-leaf"></span><span>Pet Adventure</span></button>
          <div class="topbar-tools">
            <span class="currency-pill"><span class="coin-mark"></span><b id="coin-total">0</b></span>
            <span class="currency-pill gem-pill"><span class="gem-mark"></span><b id="gem-total">0</b></span>
            <button class="icon-button audio-button" type="button" data-action="music" role="switch" aria-checked="true" aria-label="Bật hoặc tắt nhạc nền" title="Nhạc nền">♫</button>
            <button class="icon-button settings-button" type="button" data-action="settings" aria-label="Cài đặt" title="Cài đặt">⚙</button>
          </div>
        </header>
        <main class="play-area" id="play-area">
          <canvas id="game-canvas" aria-label="Thế giới phiêu lưu của Momo"></canvas>
          <section class="game-hud" id="game-hud" aria-live="polite" hidden>
            <div class="hud-leading"><button class="icon-button pause-button" type="button" data-action="pause" aria-label="Tạm dừng" title="Tạm dừng">Ⅱ</button><div class="level-chip"><span class="live-dot"></span><span id="hud-level">Rừng Xanh</span></div></div>
            <div class="hud-trailing"><span class="heart-count" id="hud-hearts">♥ ♥ ♥</span><span class="hud-coin"><span class="coin-mark"></span><b id="hud-coins">0</b></span><span class="hud-gem"><span class="gem-mark"></span><b id="hud-gems">0</b></span></div>
          </section>
          <section class="touch-controls" id="touch-controls" aria-label="Điều khiển cảm ứng" hidden>
            <div class="move-buttons"><button class="touch-button" type="button" data-control="left" aria-label="Đi sang trái">‹</button><button class="touch-button" type="button" data-control="right" aria-label="Đi sang phải">›</button></div>
            <button class="touch-button jump-button" type="button" data-control="jump" aria-label="Nhảy">NHẢY</button>
          </section>
          <div class="screen-layer" id="screen-layer"></div>
          <div class="toast" id="toast" role="status" aria-live="polite"></div>
        </main>
        <footer class="footer-line"><span>Khám phá theo nhịp của riêng bạn</span><span>Chơi ngoại tuyến · Không mua hàng trong game</span></footer>
      </div>`;
    this.layer = this.root.querySelector("#screen-layer");
    this.gameHud = this.root.querySelector("#game-hud");
    this.controls = this.root.querySelector("#touch-controls");
    this.updateWallet();
    this.renderScene();
  }

  handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    const data = { ...button.dataset };
    this.onAction(action, data);
  }

  setScene(scene, data = {}) {
    this.scene = scene;
    if (data.worldId) this.worldId = data.worldId;
    this.modal = null;
    this.renderScene();
    this.updateLayoutState();
  }

  showModal(type, data = {}) {
    this.modal = type;
    this.modalData = data;
    this.renderModal();
    this.updateLayoutState();
  }

  closeModal() {
    this.modal = null;
    this.renderModal();
    this.updateLayoutState();
  }

  updateLayoutState() {
    const playing = this.scene === "game";
    this.gameHud.hidden = !playing;
    this.controls.hidden = !playing;
    this.root
      .querySelector(".play-area")
      .classList.toggle("is-playing", playing);
  }

  updateWallet() {
    this.root.querySelector("#coin-total").textContent = this.save.data.coins;
    this.root.querySelector("#gem-total").textContent = this.save.data.gems;
    const musicButton = this.root.querySelector(".audio-button");
    musicButton.classList.toggle("is-muted", !this.save.data.musicEnabled);
    musicButton.setAttribute(
      "aria-checked",
      String(this.save.data.musicEnabled),
    );
  }

  updateHud(engine) {
    if (!engine.level || this.scene !== "game") return;
    this.root.querySelector("#hud-level").textContent = engine.level.name;
    this.root.querySelector("#hud-hearts").textContent =
      "♥ ".repeat(engine.hearts).trim() || "♡";
    this.root.querySelector("#hud-coins").textContent = engine.runCoins;
    this.root.querySelector("#hud-gems").textContent = engine.runGems;
  }

  toast(message) {
    const element = this.root.querySelector("#toast");
    element.textContent = message;
    element.classList.add("is-visible");
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(
      () => element.classList.remove("is-visible"),
      2100,
    );
  }

  renderScene() {
    this.layer.innerHTML =
      this.scene === "home"
        ? this.homeTemplate()
        : this.scene === "worlds"
          ? this.worldsTemplate()
          : this.scene === "levels"
            ? this.levelsTemplate()
            : this.scene === "pets"
              ? this.petsTemplate()
              : this.scene === "inventory"
                ? this.inventoryTemplate()
                : this.scene === "garden"
                  ? this.gardenTemplate()
                  : this.scene === "achievements"
                    ? this.achievementsTemplate()
                    : this.scene === "missions"
                      ? this.missionsTemplate()
                      : this.scene === "settings"
                        ? this.settingsTemplate()
                        : "";
    this.renderModal();
    this.renderPetPreviews();
    this.updateWallet();
  }

  homeTemplate() {
    const hasProgress = this.save.data.completedLevels.length > 0;
    return `<section class="home-screen scene-content">
      <div class="home-copy"><p class="eyebrow"><span class="eyebrow-dot"></span> CUỘC PHIÊU LƯU NHỎ CỦA BẠN</p>
        <h1>Pet Adventure</h1>
        <p class="home-description">Cùng Momo khám phá khu rừng và gặp những người bạn mới.</p>
        <button class="primary-button" type="button" data-action="worlds"><span>${hasProgress ? "Tiếp tục hành trình" : "Bắt đầu hành trình"}</span><span class="button-symbol" aria-hidden="true">→</span></button>
      </div>
      <canvas class="home-pet" width="150" height="140" data-pet-preview="momo" aria-label="Momo, chú cáo phiêu lưu"></canvas>
      <nav class="home-nav" aria-label="Menu chính">
        <button class="nav-link" data-action="pets"><span class="nav-index">01</span><span><b>Thú cưng</b><small>${this.save.data.unlockedPets.length} người bạn đã gặp</small></span><span class="nav-arrow">↗</span></button>
        <button class="nav-link" data-action="inventory"><span class="nav-index">02</span><span><b>Kho đồ</b><small>Áo choàng và phụ kiện</small></span><span class="nav-arrow">↗</span></button>
        <button class="nav-link" data-action="garden"><span class="nav-index">03</span><span><b>Khu vườn</b><small>Góc nhỏ của Momo</small></span><span class="nav-arrow">↗</span></button>
        <button class="nav-link" data-action="achievements"><span class="nav-index">04</span><span><b>Huy hiệu</b><small>${this.save.data.achievements.length} dấu mốc đáng nhớ</small></span><span class="nav-arrow">↗</span></button>
        <button class="nav-link" data-action="missions"><span class="nav-index">05</span><span><b>Nhiệm vụ</b><small>Việc nhỏ, quà dễ thương</small></span><span class="nav-arrow">↗</span></button>
      </nav>
      <span class="paw-decor paw-one" aria-hidden="true"></span><span class="paw-decor paw-two" aria-hidden="true"></span>
    </section>`;
  }

  worldsTemplate() {
    return `<section class="map-screen scene-content">
      <div class="screen-heading"><div><p class="eyebrow">BẢN ĐỒ PHIÊU LƯU</p><h2>Chọn một thế giới</h2><p class="section-subtitle">Rừng Xanh đang chờ bước chân đầu tiên của bạn.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="world-list">${WORLDS.map((world, index) => {
        const ready = world.status === "ready";
        return `<button class="world-row ${ready ? "is-ready" : "is-coming"}" style="--world-color:${world.color}" data-action="open-world" data-world="${world.id}" ${ready ? "" : "disabled"}>
          <span class="world-number">0${index + 1}</span><span class="world-swatch"><i></i><i></i><i></i></span><span class="world-copy"><b>${world.name}</b><small>${world.subtitle}</small></span><span class="world-status">${ready ? "3 màn chơi  ↗" : "Chưa mở"}</span>
        </button>`;
      }).join("")}</div>
      <p class="honest-note">Hiện có 3 màn chơi hoàn chỉnh trong Rừng Xanh. Ba thế giới còn lại sẽ được bổ sung sau.</p>
    </section>`;
  }

  levelsTemplate() {
    const world = WORLDS.find((item) => item.id === this.worldId) ?? WORLDS[0];
    if (world.status !== "ready") return "";
    return `<section class="map-screen scene-content">
      <div class="screen-heading"><div><p class="eyebrow">${escapeHTML(world.name.toUpperCase())} · BẢN ĐỒ</p><h2>Chọn chặng đường</h2><p class="section-subtitle">Mỗi đoạn đường có một người bạn đang cần giúp đỡ.</p></div><button class="text-button" data-action="worlds">← Thế giới</button></div>
      <div class="level-list">${LEVELS.map((level, index) => {
        const unlocked =
          index === 0 ||
          this.save.data.completedLevels.includes(LEVELS[index - 1].id);
        const done = this.save.data.completedLevels.includes(level.id);
        const best = this.save.data.bestCoins[level.id] ?? 0;
        return `<button class="level-row ${unlocked ? "" : "is-locked"} ${done ? "is-done" : ""}" data-action="start-level" data-level="${level.id}" ${unlocked ? "" : "disabled"}>
          <span class="level-index">${done ? "✓" : `0${index + 1}`}</span><span class="level-line"></span><span class="level-copy"><b>${level.name}</b><small>${level.subtitle}${done ? ` · ${best} xu tốt nhất` : ""}</small></span><span class="level-arrow">${unlocked ? "→" : "🔒"}</span>
        </button>`;
      }).join("")}</div>
      <p class="honest-note">${this.save.data.completedLevels.length ? "Bạn có thể chơi lại chặng cũ để tìm thêm xu và ngọc." : "Đi từng chặng một nhé. Bạn luôn có thể quay lại bản đồ."}</p>
    </section>`;
  }

  petsTemplate() {
    return `<section class="collection-screen scene-content">
      <div class="screen-heading"><div><p class="eyebrow">BỘ SƯU TẬP</p><h2>Những người bạn</h2><p class="section-subtitle">Mỗi người bạn mang theo một cách khám phá riêng.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="pet-grid">${PETS.map((pet) => {
        const unlocked = this.save.data.unlockedPets.includes(pet.id);
        const selected = this.save.data.selectedPet === pet.id;
        return `<article class="pet-card ${unlocked ? "" : "is-locked"} ${selected ? "is-selected" : ""}" style="--pet-color:${pet.color};--pet-light:${pet.light}">
          <div class="pet-portrait"><span class="pet-sun"></span><canvas class="pet-preview" width="100" height="90" data-pet-preview="${pet.id}" aria-label="${pet.name}, ${pet.kind}"></canvas>${selected ? '<span class="selected-tag">ĐANG ĐI CÙNG</span>' : ""}</div>
          <div class="pet-card-copy"><div class="pet-title"><b>${pet.name}</b><span>${pet.kind}</span></div><p>${pet.description}</p><small class="ability-line">${pet.ability}</small>
            ${unlocked ? `<button class="small-button ${selected ? "is-current" : ""}" data-action="select-pet" data-pet="${pet.id}" ${selected ? "disabled" : ""}>${selected ? "Đang đồng hành" : "Chọn bạn này"}</button>` : `<small class="unlock-line">${petUnlockText[pet.id]}</small>`}
          </div>
        </article>`;
      }).join("")}</div>
      <p class="honest-note">Kỹ năng có tác dụng trong màn chơi; Momo luôn có thể nhảy kép để khám phá.</p>
    </section>`;
  }

  inventoryTemplate() {
    return `<section class="collection-screen scene-content">
      <div class="screen-heading"><div><p class="eyebrow">KHO ĐỒ · KHÔNG CÓ MUA BẰNG TIỀN THẬT</p><h2>Đồ đi chơi của Momo</h2><p class="section-subtitle">Dùng xu tìm thấy trong màn chơi để mở phụ kiện.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="outfit-list">${OUTFITS.map((outfit) => {
        const owned = this.save.data.ownedOutfits.includes(outfit.id);
        const selected = this.save.data.selectedOutfit === outfit.id;
        return `<div class="outfit-row" style="--outfit-color:${outfit.color}"><span class="outfit-swatch"></span><span class="outfit-copy"><b>${outfit.name}</b><small>${selected ? "Đang mặc" : owned ? "Đã mở khóa" : "Phụ kiện trang trí"}</small></span>${owned ? `<button class="small-button" data-action="select-outfit" data-outfit="${outfit.id}" ${selected ? "disabled" : ""}>${selected ? "Đang dùng" : "Mặc"}</button>` : `<button class="small-button purchase-button" data-action="buy-outfit" data-outfit="${outfit.id}" ${this.save.data.coins < outfit.cost ? "disabled" : ""}>${outfit.cost} xu</button>`}</div>`;
      }).join("")}</div>
    </section>`;
  }

  gardenTemplate() {
    const decorations = [
      { id: "flower-bed", name: "Luống hoa nhỏ", cost: 0, symbol: "✿" },
      { id: "bird-bath", name: "Bồn tắm cho chim", cost: 10, symbol: "◉" },
      { id: "mushroom-seat", name: "Ghế nấm", cost: 16, symbol: "⌂" },
      { id: "wind-chime", name: "Chuông gió lá", cost: 22, symbol: "♫" },
    ];
    return `<section class="garden-screen scene-content">
      <div class="screen-heading"><div><p class="eyebrow">GÓC NHỎ CỦA MỌI NGƯỜI</p><h2>Khu vườn của Momo</h2><p class="section-subtitle">Trang trí bằng xu phiêu lưu, không cần mua gì thêm.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="garden-view"><div class="garden-sun"></div><div class="garden-hill hill-a"></div><div class="garden-hill hill-b"></div><div class="garden-ground"></div><div class="garden-items">${decorations
        .filter((item) => this.save.data.garden.includes(item.id))
        .map(
          (item, index) =>
            `<span class="garden-decoration decoration-${index}">${item.symbol}</span>`,
        )
        .join(
          "",
        )}</div><div class="garden-label">${this.save.data.garden.length} / ${decorations.length} món đồ trong vườn</div></div>
      <div class="garden-shop">${decorations
        .map((item) => {
          const owned = this.save.data.garden.includes(item.id);
          return `<div class="garden-item"><span>${item.symbol}</span><b>${item.name}</b><button class="small-button" data-action="buy-garden" data-item="${item.id}" ${owned || this.save.data.coins < item.cost ? "disabled" : ""}>${owned ? "Đã đặt" : item.cost ? `${item.cost} xu` : "Đã có"}</button></div>`;
        })
        .join("")}</div>
    </section>`;
  }

  achievementsTemplate() {
    const badges = [
      {
        id: "first-step",
        title: "Bước chân đầu tiên",
        text: "Hoàn thành màn chơi đầu tiên.",
        done: this.save.data.completedLevels.length >= 1,
        mark: "01",
      },
      {
        id: "forest-friend",
        title: "Người bạn của rừng",
        text: "Giải cứu cả ba thú cưng trong Rừng Xanh.",
        done: ["bibi", "mimi", "kiki"].every((id) =>
          this.save.data.unlockedPets.includes(id),
        ),
        mark: "02",
      },
      {
        id: "gem-seeker",
        title: "Ánh sáng lấp lánh",
        text: "Tìm được 5 viên ngọc.",
        done: this.save.data.gems >= 5,
        mark: "03",
      },
      {
        id: "garden-host",
        title: "Chủ vườn mến khách",
        text: "Trang trí khu vườn với 3 món đồ.",
        done: this.save.data.garden.length >= 3,
        mark: "04",
      },
    ];
    return `<section class="collection-screen scene-content"><div class="screen-heading"><div><p class="eyebrow">DẤU MỐC KHÁM PHÁ</p><h2>Huy hiệu của bạn</h2><p class="section-subtitle">Mỗi huy hiệu kể lại một điều bạn đã làm được.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="badge-list">${badges.map((badge) => `<div class="badge-row ${badge.done ? "is-earned" : ""}"><span class="badge-mark">${badge.done ? "✦" : badge.mark}</span><span><b>${badge.title}</b><small>${badge.text}</small></span><span class="badge-state">${badge.done ? "ĐÃ ĐẠT" : "CHƯA ĐẠT"}</span></div>`).join("")}</div></section>`;
  }

  missionsTemplate() {
    const states = MISSIONS.map((mission) => {
      let progress = 0;
      let target = 1;
      if (mission.id === "first-trail") {
        progress = Math.min(this.save.data.completedLevels.length, 1);
      } else if (mission.id === "forest-friends") {
        target = 3;
        progress = ["bibi", "mimi", "kiki"].filter((id) =>
          this.save.data.unlockedPets.includes(id),
        ).length;
      } else if (mission.id === "gem-finder") {
        target = 3;
        progress = Math.min(this.save.data.totalGems, target);
      }
      return {
        ...mission,
        progress,
        target,
        complete: progress >= target,
        claimed: this.save.data.claimedMissions.includes(mission.id),
      };
    });
    return `<section class="collection-screen scene-content"><div class="screen-heading"><div><p class="eyebrow">NHỮNG VIỆC NHỎ TRÊN ĐƯỜNG ĐI</p><h2>Nhiệm vụ</h2><p class="section-subtitle">Tự chọn điều bạn muốn làm. Không có hạn giờ.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="mission-list">${states
        .map((mission, index) => {
          const reward = mission.reward.coins
            ? `${mission.reward.coins} xu`
            : `${mission.reward.gems} ngọc`;
          const status = mission.claimed
            ? "Đã nhận"
            : mission.complete
              ? "Nhận quà"
              : `${mission.progress} / ${mission.target}`;
          return `<article class="mission-row ${mission.complete ? "is-complete" : ""}"><span class="mission-index">0${index + 1}</span><div class="mission-copy"><b>${mission.title}</b><small>${mission.text}</small><span class="mission-progress"><i style="--progress:${(mission.progress / mission.target) * 100}%"></i></span></div><div class="mission-reward"><small>THƯỞNG · ${reward}</small><button class="small-button" data-action="claim-mission" data-mission="${mission.id}" ${!mission.complete || mission.claimed ? "disabled" : ""}>${status}</button></div></article>`;
        })
        .join("")}</div></section>`;
  }

  settingsTemplate() {
    return `<section class="settings-screen scene-content"><div class="screen-heading"><div><p class="eyebrow">TÙY CHỈNH</p><h2>Cài đặt</h2><p class="section-subtitle">Chỉnh trò chơi cho thoải mái với bạn.</p></div><button class="text-button" data-action="home">← Trang chính</button></div>
      <div class="setting-row"><span><b>Âm thanh</b><small>Âm báo khi nhảy và nhặt vật phẩm</small></span><button class="toggle-button ${this.save.data.soundEnabled ? "is-on" : ""}" data-action="toggle-sound" role="switch" aria-checked="${this.save.data.soundEnabled}"><span></span></button></div>
      <div class="setting-row"><span><b>Nhạc nền</b><small>Giai điệu nhẹ nhàng tạo ngay trên thiết bị</small></span><button class="toggle-button ${this.save.data.musicEnabled ? "is-on" : ""}" data-action="toggle-music" role="switch" aria-checked="${this.save.data.musicEnabled}"><span></span></button></div>
      <div class="privacy-note"><b>Riêng tư trên thiết bị</b><p>Game không tạo tài khoản, không gửi dữ liệu ra máy chủ và không yêu cầu quyền truy cập thiết bị.</p></div>
    </section>`;
  }

  renderPetPreviews() {
    for (const canvas of this.layer.querySelectorAll("[data-pet-preview]")) {
      const pet = PETS.find((item) => item.id === canvas.dataset.petPreview);
      const context = canvas.getContext("2d");
      if (!pet || !context) continue;
      if (canvas.classList.contains("home-pet")) {
        drawPet(context, 75, 118, pet, 1.65, 1, 0, "#4b496f");
      } else {
        drawPet(context, 50, 84, pet, 1.35, 1, 0, "#70ad75");
      }
    }
  }

  renderModal() {
    const modal = this.modal;
    if (!modal) {
      this.layer.querySelector(".modal-shade")?.remove();
      return;
    }
    const content =
      modal === "pause"
        ? this.pauseModal()
        : modal === "complete"
          ? this.completeModal()
          : modal === "failed"
            ? this.failedModal()
            : modal === "tutorial"
              ? this.tutorialModal()
              : "";
    if (!content) return;
    const oldModal = this.layer.querySelector(".modal-shade");
    if (oldModal) oldModal.outerHTML = content;
    else this.layer.insertAdjacentHTML("beforeend", content);
  }

  pauseModal() {
    return `<div class="modal-shade"><section class="game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><span class="modal-eyebrow">DỪNG CHÂN MỘT CHÚT</span><h2 id="modal-title">Nghỉ một lát nhé?</h2><p>Thế giới đang tạm dừng. Bạn có thể tiếp tục bất cứ lúc nào.</p><div class="modal-actions"><button class="primary-button" data-action="resume">Tiếp tục chơi</button><button class="text-button" data-action="quit-game">Về bản đồ</button></div></section></div>`;
  }

  completeModal() {
    const {
      levelId,
      coins = 0,
      gems = 0,
      rescued = false,
      secretFound = false,
    } = this.modalData;
    const index = LEVEL_INDEX[levelId] ?? 0;
    const next = LEVELS[index + 1];
    return `<div class="modal-shade"><section class="game-modal result-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><span class="result-sun">✦</span><span class="modal-eyebrow">MỘT CHẶNG ĐƯỜNG ĐÃ XONG</span><h2 id="modal-title">Thật tuyệt vời!</h2><p>Momo đã về đến nhà an toàn. Cảm ơn bạn đã giúp những người bạn trong rừng.</p><div class="reward-line"><span><i class="coin-mark"></i> ${coins} xu</span><span><i class="gem-mark"></i> ${gems} ngọc</span>${rescued ? "<span>♡ Đã giải cứu bạn</span>" : ""}${secretFound ? "<span>✦ Tìm thấy bí mật</span>" : ""}</div><div class="modal-actions"><button class="primary-button" data-action="${next ? "next-level" : "levels"}" data-level="${next?.id ?? ""}">${next ? "Đi tiếp chặng sau" : "Về bản đồ"}</button><button class="text-button" data-action="retry">Chơi lại chặng này</button></div></section></div>`;
  }

  failedModal() {
    return `<div class="modal-shade"><section class="game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><span class="modal-eyebrow">MỌI CUỘC PHIÊU LƯU ĐỀU CÓ LÚC NGHỈ</span><h2 id="modal-title">Thử lại nhé?</h2><p>Momo sẽ bắt đầu lại ở checkpoint gần nhất trong lượt chơi mới.</p><div class="modal-actions"><button class="primary-button" data-action="retry">Chơi lại màn này</button><button class="text-button" data-action="quit-game">Về bản đồ</button></div></section></div>`;
  }

  tutorialModal() {
    return `<div class="modal-shade tutorial-shade"><section class="game-modal tutorial-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><span class="modal-eyebrow">CHÀO MỪNG ĐẾN RỪNG XANH</span><h2 id="modal-title">Momo sẵn sàng rồi!</h2><p>Đi dọc con đường, nhặt những đồng xu và giúp người bạn đang chờ ở cuối màn.</p><div class="control-legend"><span><b>← →</b><small>Di chuyển</small></span><span><b>Space</b><small>Nhảy kép</small></span><span><b>● ●</b><small>Nút cảm ứng</small></span></div><button class="primary-button" data-action="close-tutorial">Cùng đi nào</button></section></div>`;
  }
}
