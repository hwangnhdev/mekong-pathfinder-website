# Tích hợp Landing Page `light.html` vào Taxonomy Repo

## Phân tích vấn đề

File `light.html` là một trang HTML hoàn chỉnh 3619 dòng bao gồm:
- **CSS inline** (~2400 dòng) với thiết kế riêng (Be Vietnam Pro, light blue theme)
- **HTML body** (~1000 dòng): Header riêng, Hero 3D, Story, Problem, Benefits, Demo (Leaflet map + tab), Gallery, Solution, CTA, Footer riêng
- **JavaScript** (~180 dòng): Three.js 3D city animation cho hero

Landing page hiện tại (`app/(marketing)/page.tsx`) được bọc bởi `app/(marketing)/layout.tsx` — layout này thêm **header + footer riêng** của repo. Nếu chỉ thay nội dung page.tsx, sẽ bị **2 header + 2 footer** chồng lên nhau.

## Vấn đề Route Conflict

> [!IMPORTANT]
> `app/(marketing)/page.tsx` và `app/(home)/page.tsx` đều serve `/`. Next.js 13 **không cho phép** 2 page cùng URL — sẽ báo lỗi build. Vì vậy **không thể** tạo route group mới để tránh layout.

## Giải pháp đề xuất

**Tách layout thành client component có điều kiện:**

```
app/(marketing)/layout.tsx       ← đơn giản hóa, gọi shell
app/(marketing)/layout-shell.tsx ← NEW: client component, check pathname
app/(marketing)/page.tsx         ← REPLACE: full landing page JSX
styles/landing.css               ← NEW: CSS extracted từ light.html
```

Khi người dùng vào `/`:
- `layout-shell.tsx` dùng `usePathname()` → phát hiện là trang chủ → **render `{children}` trực tiếp** (không thêm header/footer của repo)
- `page.tsx` tự cung cấp header + hero + sections + footer đầy đủ

Khi người dùng vào `/blog`, `/pricing`, `/docs`:
- `layout-shell.tsx` → render bình thường với header + footer của repo

## Các File Cần Tạo / Sửa

---

### CSS

#### [NEW] [landing.css](file:///d:/2026/Code/taxonomy/styles/landing.css)
- Toàn bộ CSS từ `<style>` trong `light.html`
- Scope một số selector nguy hiểm (`body`, `header`, `nav`, `footer`) dưới `.landing-page` wrapper
- Bỏ quy tắc `html { scroll-snap-type: y mandatory }` (có thể ảnh hưởng toàn app)
- Giữ nguyên `:root`, `*`, `@keyframes`, và tất cả class selectors

---

### Layout

#### [NEW] [layout-shell.tsx](file:///d:/2026/Code/taxonomy/app/(marketing)/layout-shell.tsx)
Client component — dùng `usePathname()` để quyết định render header/footer hay không.

#### [MODIFY] [layout.tsx](file:///d:/2026/Code/taxonomy/app/(marketing)/layout.tsx)
Đơn giản hóa: chỉ gọi `<MarketingLayoutShell>{children}</MarketingLayoutShell>`

---

### Landing Page

#### [MODIFY] [page.tsx](file:///d:/2026/Code/taxonomy/app/(marketing)/page.tsx)
`'use client'` component với:
- Import `@/styles/landing.css`
- JSX cho toàn bộ nội dung HTML (header, hero, sections, footer) trong `<div className="landing-page">`
- `useEffect` chạy:
  - Load Google Fonts (Be Vietnam Pro)
  - Load Leaflet CSS + JS (cho demo map)
  - Load Three.js CDN → khởi tạo 3D city scene
  - Demo tab switching
  - Alert filter, route recalc, community submit interactions

---

## Các Điểm Cần Chú Ý

> [!NOTE]
> Three.js và Leaflet được load qua CDN trong `useEffect` (giống nguyên bản HTML). Leaflet map sẽ render bản đồ thật OpenStreetMap của Cần Thơ với markers flood.

> [!WARNING]
> CSS của landing page có một số selector toàn cục (`* {}`, `html {}`) — những selector này **an toàn** vì: `*` chỉ thêm box-sizing và reset margin/padding (CSS reset chuẩn), `html` chỉ thêm `scroll-behavior: smooth`. Các selector nguy hiểm hơn (`body`, `header`, `nav`, `footer`) sẽ được đổi thành `.landing-page body`, v.v.

> [!NOTE]
> `layout-shell.tsx` là client component nhưng điều này **không ảnh hưởng SSR** của blog/docs pages — children vẫn là server components, React cho phép điều này.

## Verification Plan

- Chạy `pnpm dev` → kiểm tra `/` hiển thị đúng landing page
- Kiểm tra `/blog`, `/pricing` vẫn có header/footer của repo bình thường
- Kiểm tra 3D hero animation hoạt động
- Kiểm tra demo tabs switching
- Kiểm tra Leaflet map load được

## Open Questions

> [!IMPORTANT]
> Bạn có muốn kết nối nút **"Đăng nhập"** trong landing page với route `/login` của repo không? Hiện tại header của landing page có nút "Tải ứng dụng" — không có nút login. Tôi có thể thêm hoặc giữ nguyên theo thiết kế gốc.
