# 📁 هيكل مشروع مسارات SaaS — شرح كامل

منصة SaaS متعددة المستأجرين (Multi-Tenant) لإدارة النقل الجامعي.
مبنية على: Next.js 15 · TypeScript · Prisma ORM · PostgreSQL · NextAuth.js

---

## 🗂️ هيكل المجلدات

```
masarat-saas/
├── app/                        ← كل الصفحات والـ API (Next.js App Router)
│   ├── layout.tsx              ← اللاياوت الجذري (RTL + الخطوط + SessionProvider)
│   ├── page.tsx                ← الصفحة الرئيسية (تُعيد redirect إلى /login)
│   ├── globals.css             ← الأنماط العامة للتطبيق
│   │
│   ├── (auth)/                 ← مجموعة صفحات المصادقة (Route Group)
│   │   └── login/page.tsx      ← صفحة تسجيل الدخول
│   │
│   ├── dashboard/              ← قسم لوحة التحكم الرئيسية
│   │   ├── layout.tsx          ← لاياوت الداشبورد (Sidebar + Header)
│   │   ├── page.tsx            ← الصفحة الرئيسية للداشبورد
│   │   ├── tenants/            ← إدارة المؤسسات
│   │   ├── users/              ← إدارة المستخدمين والأدوار
│   │   └── passengers/         ← إدارة الركاب والطلاب
│   │
│   ├── api/                    ← API Routes (Server-Side)
│   │   ├── auth/[...nextauth]/ ← نقطة نهاية NextAuth للمصادقة
│   │   └── v1/                 ← API الإصدار الأول
│   │       ├── tenants/        ← CRUD المؤسسات
│   │       ├── users/          ← CRUD المستخدمين
│   │       └── passengers/     ← CRUD الركاب
│   │
│   └── generated/prisma/       ← Prisma Client المولّد تلقائياً (لا تعدّله)
│
├── components/                 ← المكونات المشتركة القابلة لإعادة الاستخدام
│   ├── app-sidebar.tsx         ← الشريط الجانبي الرئيسي للتنقل
│   ├── nav-user.tsx            ← بطاقة المستخدم في أسفل الـ Sidebar
│   ├── providers/
│   │   └── session-provider.tsx ← يُغلّف NextAuth SessionProvider للـ Client
│   └── ui/                     ← مكونات واجهة shadcn/ui (Button, Card, Badge...)
│
├── lib/                        ← المنطق الأساسي والأدوات المساعدة
│   ├── prisma.ts               ← إنشاء وتصدير Prisma Client (Singleton Pattern)
│   ├── auth.ts                 ← إعدادات NextAuth (Providers, JWT Callbacks)
│   ├── tenant.ts               ← دوال مساعدة لعزل بيانات المستأجرين
│   ├── api-response.ts         ← دوال توحيد شكل استجابات الـ API
│   └── utils.ts                ← أدوات مساعدة عامة (cn للأنماط...)
│
├── prisma/
│   ├── schema.prisma           ← تعريف كامل لقاعدة البيانات (13 جدول)
│   └── migrations/             ← ملفات ترحيل قاعدة البيانات
│
├── types/                      ← تعريفات TypeScript المخصصة
├── hooks/                      ← React Hooks المخصصة
├── middleware.ts               ← حارس المسارات (Auth + Tenant Injection)
├── .env                        ← متغيرات البيئة (DATABASE_URL)
├── .env.local                  ← متغيرات البيئة المحلية (NEXTAUTH_SECRET)
└── prisma.config.ts            ← إعدادات Prisma CLI
```

---

## 🔗 الترابط بين الملفات

### 1. تدفق الطلب من المتصفح

```
المتصفح يفتح أي رابط
        ↓
middleware.ts  ← أول ما يُنفَّذ قبل أي صفحة
  ├── هل المسار عام؟ (login / api/auth) → اسمح بالمرور
  ├── هل فيه JWT Token صالح؟ → لا → حوّل لـ /login
  ├── هل له صلاحية؟ (Super Admin للـ tenants) → لا → حوّل لـ /dashboard
  └── أضف headers (x-tenant-id, x-user-id, x-user-roles) → اسمح بالمرور
        ↓
app/layout.tsx  ← يُطبَّق على كل الصفحات
  └── يُغلّف بـ SessionProvider + TooltipProvider + إعدادات RTL/خطوط
        ↓
app/dashboard/layout.tsx  ← يُطبَّق على صفحات /dashboard فقط
  ├── يقرأ بيانات الجلسة (useSession)
  ├── يبني هيكل: SidebarProvider > AppSidebar + SidebarInset
  └── يُمرّر {children} → الصفحة المطلوبة
```

### 2. تدفق بيانات الجلسة والمصادقة

```
صفحة Login
    ↓ يرسل (tenant_code + user_name + password)
lib/auth.ts (NextAuth CredentialsProvider)
    ↓ يستعلم قاعدة البيانات عبر
lib/prisma.ts → PostgreSQL
    ↓ ينشئ JWT Token يحتوي:
      { id, user_name, tenant_id, roles }
    ↓ يُخزَّن في Cookie مشفر
    ↓
middleware.ts يستخرج التوكن من كل طلب
    ↓ يُمرّر tenant_id عبر x-tenant-id header
    ↓
API Routes تقرأ الـ header وتعزل البيانات
```

### 3. تدفق بيانات الشريط الجانبي (Sidebar)

```
NextAuth Session (useSession)
        ↓
app/dashboard/layout.tsx
  يستخرج: name, role, tenantLabel, avatarFallback
        ↓ يُمرّرها كـ props
components/app-sidebar.tsx
  يعرض: القائمة الجانبية + معلومات المستخدم
        ↓ يمرّر user للـ footer
components/nav-user.tsx
  يعرض: بطاقة المستخدم + زر تسجيل الخروج
```

### 4. تدفق طلبات الـ API

```
الصفحة (Client Component)
    ↓ fetch("/api/v1/tenants")
middleware.ts يضيف x-tenant-id header تلقائياً
    ↓
app/api/v1/tenants/route.ts
    ↓ يقرأ headers("x-tenant-id")
    ↓ يستدعي
lib/prisma.ts → prisma.tenant.findMany(...)
    ↓ يُرجع نتيجة موحدة الشكل عبر
lib/api-response.ts → { success: true, data: [...] }
    ↓
الصفحة تعرض البيانات
```

---

## 📦 طبقات المشروع

| الطبقة | المسؤولية | الملفات |
|--------|-----------|---------|
| **Routing Layer** | توجيه المسارات وحمايتها | `middleware.ts`, `app/**/layout.tsx` |
| **Auth Layer** | المصادقة والتفويض | `lib/auth.ts`, `app/api/auth/`, `.env.local` |
| **UI Layer** | واجهة المستخدم | `components/`, `app/**/page.tsx` |
| **API Layer** | منطق الأعمال من جهة السيرفر | `app/api/v1/**/route.ts` |
| **Data Layer** | الوصول لقاعدة البيانات | `lib/prisma.ts`, `prisma/schema.prisma` |
| **Utility Layer** | أدوات مشتركة | `lib/utils.ts`, `lib/api-response.ts`, `lib/tenant.ts` |

---

## 🗄️ نموذج قاعدة البيانات (Multi-Tenant)

```
Tenant (المؤسسة)
  ├── id, name, code, is_active
  └── يرتبط بـ: Users, Passengers, Vehicles, Drivers, Stations...

User (المستخدم)
  ├── id, user_name, full_name, password (bcrypt), tenant_id
  └── user_roles → [ 'super_admin' | 'admin' | 'driver' | 'user' ]

Passenger (الراكب/الطالب)
  └── يرتبط بـ tenant_id (عزل البيانات)
```

---

## 🔐 نظام عزل البيانات (Multi-Tenancy)

كل بيانات المؤسسة معزولة تلقائياً:
- **JWT Token** يحمل `tenant_id` للمستخدم
- **Middleware** يُمرّر `tenant_id` كـ header لكل طلب API
- **API Routes** تُصفّي الاستعلامات بـ `WHERE tenant_id = ?`
- **Super Admin** (بدون tenant_id) يرى بيانات كل المؤسسات

---

## ⚙️ متغيرات البيئة

| المتغير | الملف | الغرض |
|---------|-------|-------|
| `DATABASE_URL` | `.env` | رابط اتصال PostgreSQL |
| `NEXTAUTH_SECRET` | `.env.local` | مفتاح تشفير JWT |
| `NEXTAUTH_URL` | `.env.local` | رابط التطبيق (للـ Callbacks) |

---

## 🚀 تدفق التشغيل

```
1. npm run dev  ← يُشغّل Next.js dev server
2. المتصفح → http://localhost:3000
3. app/page.tsx → redirect("/login")
4. صفحة تسجيل الدخول → NextAuth → JWT
5. redirect("/dashboard")
6. middleware يتحقق من الجلسة
7. dashboard/layout.tsx يعرض الـ Sidebar
8. dashboard/page.tsx يجلب الإحصائيات
```
