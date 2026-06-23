# 📖 Hướng dẫn sử dụng & Custom repo Taxonomy (shadcn/taxonomy)

> Đây là boilerplate Next.js 13 App Router đầy đủ tính năng: Landing page, Blog, Docs, Dashboard, Auth (GitHub), Billing (Stripe), Editor (EditorJS).

---

## 🗺️ Bản đồ kiến trúc

```
taxonomy/
├── app/                    ← Tất cả các trang (Next.js App Router)
│   ├── (marketing)/        ← Trang công khai: Landing, Blog, Pricing
│   ├── (auth)/             ← Đăng nhập / Đăng ký
│   ├── (dashboard)/        ← Trang sau khi đăng nhập
│   ├── (docs)/             ← Trang tài liệu
│   ├── (editor)/           ← Trình soạn thảo bài viết
│   └── api/                ← API Routes
│
├── config/                 ← ⭐ Cấu hình trung tâm (sửa nhiều nhất)
│   ├── site.ts             ← Tên web, mô tả, URL, social links
│   ├── marketing.ts        ← Menu điều hướng trang công khai
│   ├── dashboard.ts        ← Menu sidebar dashboard
│   └── subscriptions.ts    ← Gói Free / Pro (Stripe)
│
├── content/                ← ⭐ Nội dung viết bằng MDX
│   ├── blog/               ← Bài viết blog (.mdx)
│   ├── docs/               ← Tài liệu (.mdx)
│   ├── guides/             ← Hướng dẫn (.mdx)
│   └── pages/              ← Trang tĩnh (.mdx)
│
├── components/             ← UI Components tái sử dụng
├── prisma/schema.prisma    ← Cấu trúc database
├── styles/                 ← CSS toàn cục
└── .env.local              ← Biến môi trường (secrets)
```

---

## 🚀 PHẦN 1: Cách sử dụng repo

### 1.1 Các trang có sẵn

| URL | Mô tả | File |
|-----|-------|------|
| `/` | Landing page (trang chủ) | `app/(marketing)/page.tsx` |
| `/blog` | Danh sách bài blog | `app/(marketing)/blog/` |
| `/pricing` | Bảng giá | `app/(marketing)/pricing/` |
| `/docs` | Tài liệu | `app/(docs)/` |
| `/login` | Đăng nhập GitHub | `app/(auth)/login/` |
| `/register` | Đăng ký | `app/(auth)/register/` |
| `/dashboard` | Quản lý bài viết | `app/(dashboard)/dashboard/` |
| `/dashboard/billing` | Thanh toán Stripe | `app/(dashboard)/dashboard/billing/` |
| `/dashboard/settings` | Cài đặt tài khoản | `app/(dashboard)/dashboard/settings/` |
| `/editor/[postId]` | Soạn thảo bài viết | `app/(editor)/editor/` |

### 1.2 Luồng hoạt động

```
Người dùng vào /  →  Xem landing page
       ↓
Nhấn "Get Started" → Chuyển đến /login
       ↓
Đăng nhập GitHub  → Chuyển đến /dashboard
       ↓
Tạo bài viết mới  → Chuyển đến /editor/[id]
       ↓  
Soạn thảo với EditorJS → Lưu vào MySQL
```

### 1.3 Tính năng chính

- ✅ **Auth**: Đăng nhập bằng GitHub OAuth (NextAuth.js)
- ✅ **Blog**: Viết bài bằng MDX (file .mdx trong /content/blog)
- ✅ **Docs**: Tài liệu dạng MDX có sidebar tự động
- ✅ **Dashboard**: Quản lý bài viết cá nhân
- ✅ **Editor**: Soạn thảo WYSIWYG với EditorJS
- ✅ **Billing**: Gói Free/Pro tích hợp Stripe
- ✅ **Dark Mode**: Tự động theo hệ thống
- ✅ **Email**: Gửi magic link qua Postmark

---

## 🎨 PHẦN 2: Custom cho dự án của bạn

### ✏️ Bước 1: Đổi thông tin trang web

**File:** [`config/site.ts`](file:///d:/2026/Code/taxonomy/config/site.ts)

```ts
export const siteConfig: SiteConfig = {
  name: "Tên Dự Án Của Bạn",           // ← Đổi tên
  description: "Mô tả dự án của bạn",   // ← Đổi mô tả
  url: "https://yourdomain.com",         // ← Đổi domain
  ogImage: "https://yourdomain.com/og.jpg",
  links: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourusername/yourrepo",
  },
}
```

---

### 🧭 Bước 2: Thay đổi menu điều hướng

**Menu ngoài (trang công khai)** — [`config/marketing.ts`](file:///d:/2026/Code/taxonomy/config/marketing.ts)
```ts
mainNav: [
  { title: "Tính năng", href: "/#features" },
  { title: "Bảng giá", href: "/pricing" },
  { title: "Blog", href: "/blog" },
]
```

**Menu trong (dashboard)** — [`config/dashboard.ts`](file:///d:/2026/Code/taxonomy/config/dashboard.ts)
```ts
sidebarNav: [
  { title: "Bài viết", href: "/dashboard", icon: "post" },
  { title: "Thanh toán", href: "/dashboard/billing", icon: "billing" },
  { title: "Cài đặt", href: "/dashboard/settings", icon: "settings" },
]
```

---

### 📝 Bước 3: Thêm/sửa bài viết Blog

Tạo file `.mdx` mới trong `content/blog/`:

```mdx
---
title: Tiêu đề bài viết của bạn
description: Mô tả ngắn
date: 2024-01-15
published: true
authors:
  - ten-tac-gia
---

# Nội dung bài viết

Viết nội dung bình thường bằng Markdown...
```

> **Lưu ý:** File phải có `published: true` mới hiện ra ngoài web.

---

### 📚 Bước 4: Thêm trang Docs

Tạo file `.mdx` trong `content/docs/`:

```mdx
---
title: Tên trang docs
description: Mô tả
---

Nội dung tài liệu...
```

Cấu trúc sidebar docs được định nghĩa trong [`config/docs.ts`](file:///d:/2026/Code/taxonomy/config/docs.ts)

---

### 🏠 Bước 5: Sửa Landing Page

**File:** [`app/(marketing)/page.tsx`](file:///d:/2026/Code/taxonomy/app/(marketing)/page.tsx)

Đây là file lớn nhất (~15KB). Tìm và sửa:
- **Hero section**: Tiêu đề và mô tả chính
- **Features section**: Các tính năng nổi bật
- **CTA buttons**: Nút kêu gọi hành động

---

### 💰 Bước 6: Cấu hình gói giá (Stripe)

**File:** [`config/subscriptions.ts`](file:///d:/2026/Code/taxonomy/config/subscriptions.ts)

```ts
export const freePlan: SubscriptionPlan = {
  name: "Miễn phí",
  description: "Giới hạn 3 bài viết.",
  stripePriceId: "",
}

export const proPlan: SubscriptionPlan = {
  name: "Pro",
  description: "Không giới hạn bài viết.",
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID || "",
}
```

---

### 🗄️ Bước 7: Cấu hình Database

**File:** [`prisma/schema.prisma`](file:///d:/2026/Code/taxonomy/prisma/schema.prisma)

Database có sẵn các bảng:
- `users` — Thông tin người dùng
- `accounts` — OAuth accounts
- `sessions` — Phiên đăng nhập
- `posts` — Bài viết (title, content JSON, published)

Khi thêm field mới:
```bash
# 1. Sửa schema.prisma
# 2. Chạy migration
pnpm prisma migrate dev --name ten-migration
# 3. Generate lại client
pnpm prisma generate
```

---

### 🔐 Bước 8: Cài đặt biến môi trường

**File:** [`.env.local`](file:///d:/2026/Code/taxonomy/.env.local)

| Biến | Cần thiết cho | Cách lấy |
|------|---------------|----------|
| `NEXTAUTH_SECRET` | Auth (bắt buộc) | Chạy: `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | Đăng nhập GitHub | GitHub → Settings → Developer Settings → OAuth Apps |
| `GITHUB_CLIENT_SECRET` | Đăng nhập GitHub | Cùng chỗ với Client ID |
| `DATABASE_URL` | Lưu dữ liệu | MySQL local hoặc PlanetScale |
| `STRIPE_API_KEY` | Thanh toán | Stripe Dashboard |
| `POSTMARK_API_TOKEN` | Gửi email | Postmark Account |

---

## 🔧 PHẦN 3: Các tác vụ thường dùng

### Setup lần đầu hoàn chỉnh

```bash
# 1. Cài dependencies
pnpm install

# 2. Copy và điền env
cp .env.example .env.local

# 3. Tạo database
pnpm prisma migrate dev

# 4. Chạy dev
pnpm dev
```

### Các lệnh hữu ích

```bash
pnpm dev          # Chạy development server
pnpm build        # Build production
pnpm start        # Chạy production (cần build trước)
pnpm lint         # Kiểm tra lỗi code

# Prisma (database)
pnpm prisma studio          # Giao diện quản lý DB trực quan
pnpm prisma migrate dev     # Chạy migration mới
pnpm prisma generate        # Generate Prisma Client
```

---

## ⚡ PHẦN 4: Workflow phát triển khuyến nghị

```
1. Sửa config/site.ts      → Đổi tên, URL
2. Sửa config/marketing.ts → Đổi menu
3. Sửa app/(marketing)/page.tsx → Đổi landing page
4. Thêm bài blog vào content/blog/
5. Setup GitHub OAuth → Đăng nhập được
6. Setup MySQL → Dashboard hoạt động
7. (Tuỳ chọn) Setup Stripe → Billing hoạt động
8. (Tuỳ chọn) Setup Postmark → Email hoạt động
```

> **💡 Tip:** Bạn có thể bỏ qua Stripe và Postmark nếu chưa cần. Chỉ cần GitHub OAuth + MySQL là đã dùng được dashboard đầy đủ!

---

## ❓ FAQ

**Q: Tôi muốn xoá tính năng Stripe?**
A: Xoá route `/dashboard/billing`, xoá `stripePriceId` khỏi User model trong schema.prisma, và bỏ các import liên quan.

**Q: Tôi muốn thêm đăng nhập Google thay vì GitHub?**
A: Sửa file `app/api/auth/[...nextauth]/route.ts`, thêm `GoogleProvider` từ `next-auth/providers/google`.

**Q: Tôi muốn đổi database từ MySQL sang PostgreSQL?**
A: Sửa `provider = "postgresql"` trong `prisma/schema.prisma`, cập nhật `DATABASE_URL`, rồi chạy `pnpm prisma migrate dev`.
