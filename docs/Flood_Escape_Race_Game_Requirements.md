# Flood Escape Race -- Game Requirements

## 1. Mục tiêu

Flood Escape Race là trò chơi tương tác nhiều người chơi nhằm trình diễn
khả năng **AI dẫn đường tránh ngập của Mekong Pathfinder**.

Người chơi không chọn toàn bộ lộ trình ngay từ đầu mà **ra quyết định
từng đoạn đường** tại mỗi ngã rẽ, mô phỏng việc đưa ra quyết định khi
điều kiện giao thông thay đổi liên tục.

## 2. Mô hình trò chơi

-   Multiplayer.
-   01 Host (màn hình lớn).
-   N người chơi (điện thoại).
-   Tham gia bằng QR Code.
-   Tất cả xuất phát cùng lúc.

## 3. Luật chơi

-   Mỗi trận gồm **2 Round**.
-   Mỗi Round có:
    -   01 điểm xuất phát.
    -   01 điểm đến.
    -   Khoảng **5--6 lượt lựa chọn**.
-   Mỗi lượt chỉ được chọn **01 đoạn đường**.
-   Hoàn thành Round 1 sẽ tự động chuyển sang Round 2.
-   Kết quả cuối cùng là tổng điểm của cả hai Round.

## 4. Gameplay

    Start
     ↓
    Lượt 1 → Xe chạy
     ↓
    Lượt 2 → Xe chạy
     ↓
    Lượt 3 → ...
     ↓
    Destination

Người chơi chỉ nhìn thấy các đoạn đường kế tiếp thay vì toàn bộ lộ
trình.

## 5. Cơ chế chọn đường

Ở mỗi giao lộ: - Hiển thị bản đồ. - Hiển thị vị trí hiện tại. - Hiển thị
3 đoạn đường kế tiếp bằng các màu khác nhau. - Người chơi chọn một màu
để quyết định hướng đi. - Xe di chuyển tới giao lộ tiếp theo và sinh lựa
chọn mới.

## 6. Giao diện điện thoại

### Phần trên

-   Bản đồ.
-   Vị trí hiện tại.
-   Điểm đến.
-   Ba đoạn đường được tô màu.

### Phần dưới

-   3 nút chọn tương ứng màu trên bản đồ.
-   Đồng hồ đếm ngược 8--10 giây.
-   Hết giờ hệ thống tự chọn.

## 7. Giao diện Host

-   Bản đồ lớn hiển thị toàn bộ người chơi.
-   Mỗi người chơi có một màu riêng.
-   Hiển thị đường đi theo thời gian thực.
-   Leaderboard cập nhật liên tục.
-   Hiển thị Round, lượt hiện tại và thời gian.

## 8. Animation

Sau khi người chơi chọn: 1. Xe chạy 2--3 giây. 2. Cập nhật vị trí. 3.
Hiển thị giao lộ mới. 4. Sinh 3 lựa chọn tiếp theo.

## 9. Sự kiện động (tùy chọn)

-   Mưa lớn.
-   Điểm ngập mới.
-   Đóng đường.
-   Kẹt xe.
-   Xe cứu thương ưu tiên.

Các sự kiện sẽ thay đổi bản đồ và ảnh hưởng các lượt tiếp theo.

## 10. Chấm điểm

Điểm dựa trên: - Hoàn thành nhanh. - Không đi vào vùng ngập. - Chọn
đường tối ưu. - Về đích. - Trừ điểm khi đi sai hoặc đi vào vùng ngập.

## 11. Flow trận đấu

1.  Quét QR.
2.  Join Room.
3.  Chờ Host.
4.  Round 1.
5.  5--6 lượt lựa chọn.
6.  Hoàn thành.
7.  Round 2.
8.  Tổng kết và Leaderboard.

## 12. Luồng hệ thống

Host tạo Room → Người chơi Join → Host Start → Server gửi
Origin/Destination → Người chơi chọn từng đoạn đường → Server cập nhật
vị trí → Host animate → Sinh lựa chọn mới → Lặp đến khi về đích.

## 13. Yêu cầu kỹ thuật

### Mobile

-   Responsive.
-   WebSocket realtime.
-   Hiển thị bản đồ và 3 lựa chọn.

### Host

-   Bản đồ toàn màn hình.
-   Theo dõi tất cả người chơi.
-   Leaderboard realtime.

### Backend

-   Quản lý Room.
-   Đồng bộ WebSocket.
-   Sinh lựa chọn đường.
-   Chấm điểm.
-   Lưu lịch sử lựa chọn.

## Mục tiêu trải nghiệm

Người chơi và khán giả hiểu được khả năng **AI dẫn đường thích ứng theo
tình trạng ngập** của Mekong Pathfinder thông qua việc ra quyết định
từng đoạn đường trong thời gian thực.
