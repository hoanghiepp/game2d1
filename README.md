# Pet Adventure

Game platformer 2D offline, điều khiển Momo khám phá Rừng Xanh. Hình ảnh được vẽ bằng Canvas; âm thanh được tạo cục bộ bằng Web Audio. Game không dùng tài khoản, backend, quảng cáo hay thanh toán.

## Chạy trên Windows

Cần cài Node.js 20 trở lên. Mở PowerShell tại thư mục dự án:

```powershell
npm install
npm run dev
```

Mở địa chỉ Vite in trong terminal, thường là `http://localhost:5173`. Dừng server bằng `Ctrl+C`.

Kiểm tra mã và tạo bản web production:

```powershell
npm test
npm run build
npm run preview
```

Thư mục `dist/` là bản web đã build. Các file trong `src/` là mã nguồn để chỉnh sửa.

## Điều khiển

- Máy tính: `←` / `→` hoặc `A` / `D` để đi; `Space`, `W` hoặc `↑` để nhảy. Momo nhảy kép.
- Điện thoại: giữ hai nút mũi tên để di chuyển; chạm nút `NHẢY`.
- `Esc` hoặc `P` tạm dừng/tiếp tục. Đổi tab sẽ tự tạm dừng.
- Đụng chướng ngại hoặc rơi sẽ mất một tim và trở về checkpoint. Hết tim có thể tiếp tục ở checkpoint.

## Nội dung hiện có

Rừng Xanh có ba màn chơi với nền tảng cố định/di chuyển, nấm và gai, checkpoint, xu, ngọc, kho báu ẩn, cứu thú cưng và cổng kết thúc. Màn kế tiếp mở sau khi hoàn thành màn trước. Momo, Bibi, Piko, Mimi, Kiki và Tutu có sprite Canvas cùng khả năng dùng trong gameplay; thú cưng được mở bằng giải cứu hoặc tích lũy vật phẩm trong game.

Menu có bản đồ, bộ sưu tập, nhiệm vụ nhận thưởng một lần, huy hiệu, phụ kiện dùng xu, khu vườn và cài đặt âm thanh. Tiến trình lưu bằng `localStorage` trên thiết bị/trình duyệt hiện tại; xóa dữ liệu trình duyệt sẽ xóa save.

Vương Quốc Kẹo, Đại Dương Kỳ Diệu và Núi Tuyết hiện mới có metadata hiển thị trên bản đồ, **chưa có màn chơi để vào**. Chưa có câu đố màu sắc, sinh vật biển hay bề mặt băng cho các thế giới này.

## Cấu trúc

```text
src/
  audio/       Âm thanh Web Audio
  entities/    Nhân vật người chơi
  game/        Game loop, input, va chạm, camera, Canvas renderer
  levels/      Dữ liệu và factory tạo màn
  storage/     Lưu tiến trình localStorage
  systems/     Thú cưng, thế giới, nhiệm vụ, trang phục
  styles/      Giao diện responsive
  ui/          Menu, HUD và các màn hình
tests/         Kiểm thử Node.js
```

Game loop dùng `requestAnimationFrame` với `delta time` giới hạn tối đa 50 ms mỗi frame. Canvas giới hạn device pixel ratio ở 2 để tránh buffer quá lớn trên màn hình mật độ cao.

## Chuẩn bị Android với Capacitor

Các lệnh sau tạo project Android trong thư mục `android/`; cần Android Studio, Android SDK và JDK phù hợp để mở/build ứng dụng. Chưa tạo APK hay xác nhận chạy trên thiết bị trong repo này.

```powershell
npm install @capacitor/android
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Sau khi sửa web source, chạy lại:

```powershell
npm run build
npx cap sync android
```

Capacitor đã cấu hình `webDir: "dist"`, trỏ tới output của Vite.
