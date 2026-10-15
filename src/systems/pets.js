export const PETS = [
  {
    id: "momo",
    name: "Momo",
    kind: "Cáo",
    color: "#e9824f",
    light: "#ffd08c",
    description: "Người bạn dũng cảm, luôn sẵn sàng khám phá.",
    ability: "Nhảy kép nhẹ nhàng",
    doubleJump: true,
  },
  {
    id: "bibi",
    name: "Bibi",
    kind: "Thỏ",
    color: "#dc91b7",
    light: "#ffe0eb",
    description: "Đôi chân dài giúp Bibi bật lên thật cao.",
    ability: "Nhảy cao hơn",
    jumpMultiplier: 1.28,
  },
  {
    id: "piko",
    name: "Piko",
    kind: "Rồng con",
    color: "#63bda7",
    light: "#d2f5c7",
    description: "Vỗ cánh lướt êm qua những khoảng trống.",
    ability: "Lướt khi đang rơi",
    glide: true,
  },
  {
    id: "mimi",
    name: "Mimi",
    kind: "Mèo",
    color: "#9b8bd1",
    light: "#e8dcff",
    description: "Bàn chân nhanh nhẹn đưa Mimi đi xa hơn.",
    ability: "Chạy nhanh",
    speedMultiplier: 1.3,
  },
  {
    id: "kiki",
    name: "Kiki",
    kind: "Chim nhỏ",
    color: "#f0bd4d",
    light: "#fff1a8",
    description: "Đôi mắt tinh tường thấy vật phẩm từ xa.",
    ability: "Hút xu ở gần",
    pickupRadius: 78,
  },
  {
    id: "tutu",
    name: "Tutu",
    kind: "Gấu trúc",
    color: "#526b61",
    light: "#eaf0df",
    description: "Cú húc mạnh phá được thùng gỗ giòn.",
    ability: "Phá vật cản gỗ",
    breaksCrates: true,
  },
];

export const WORLDS = [
  {
    id: "forest",
    name: "Rừng Xanh",
    subtitle: "Lối mòn dưới tán lá",
    color: "#4f9b72",
    status: "ready",
    levels: ["forest-1", "forest-2", "forest-3"],
  },
  {
    id: "candy",
    name: "Vương Quốc Kẹo",
    subtitle: "Đang được chăm chút",
    color: "#e58f9a",
    status: "coming",
  },
  {
    id: "ocean",
    name: "Đại Dương Kỳ Diệu",
    subtitle: "Đang được chăm chút",
    color: "#69b8c0",
    status: "coming",
  },
  {
    id: "snow",
    name: "Núi Tuyết",
    subtitle: "Đang được chăm chút",
    color: "#9baec9",
    status: "coming",
  },
];

export const OUTFITS = [
  { id: "leaf-cape", name: "Áo choàng lá", cost: 0, color: "#5aa376" },
  { id: "sunny-scarf", name: "Khăn nắng", cost: 12, color: "#f2bf54" },
  { id: "berry-bow", name: "Nơ quả mọng", cost: 20, color: "#e77c83" },
  { id: "cloud-hood", name: "Mũ mây", cost: 28, color: "#8dbbd7" },
];

export const MISSIONS = [
  {
    id: "first-trail",
    title: "Bước chân đầu tiên",
    text: "Hoàn thành một chặng đường.",
    reward: { coins: 6 },
  },
  {
    id: "forest-friends",
    title: "Bạn của khu rừng",
    text: "Giải cứu Bibi, Mimi và Kiki.",
    reward: { coins: 10 },
  },
  {
    id: "gem-finder",
    title: "Ánh sáng lấp lánh",
    text: "Tìm được 3 viên ngọc.",
    reward: { gems: 1 },
  },
];

export function getPet(id) {
  return PETS.find((pet) => pet.id === id) ?? PETS[0];
}
