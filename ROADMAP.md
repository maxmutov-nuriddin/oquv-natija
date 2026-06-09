# CoddyResults Roadmap

CoddyResults - mentorlar uchun Firebase asosidagi dars natijalari platformasi. Bu yerda mentor o'quvchilarga homework, attendance, activity score beradi, coin va analytics ko'radi, Telegram report yuboradi.

## Texnologiyalar

- React 19
- Vite
- Firebase Auth
- Firestore
- Recharts
- xlsx
- Tailwind CSS
- vite-plugin-pwa
- lucide-react

## Asosiy buyruqlar

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment

Kerakli envlar:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_WORKER_URL=
VITE_WORKER_RUN_TOKEN=
```

## Firebase data structure

```txt
teachers/{uid}
users/{uid}/groups/{groupId}
users/{uid}/students/{studentId}
users/{uid}/records/{recordId}
users/{uid}/settings/reward-system
```

### teachers/{uid}

- Teacher profile.
- `checkMentorId` bo'lsa, bu mentor CoddyCheck'dan sync qilingan.
- `autoPushEnabled` avtomatik pushni boshqaradi.

### users/{uid}/groups

- Mentor guruhlari.
- Check'dan kelgan guruhlarda `checkGroupId` va `syncSource=coddycheck` bo'ladi.
- Jadval `weekdays`, `lessonStart`, `lessonEnd` orqali yuradi.

### users/{uid}/students

- Mentor o'quvchilari.
- Check'dan kelgan o'quvchilarda `checkStudentId`, `checkStatus`, `checkLocked`, `checkActive` bo'ladi.
- Homework, attendance, activity, coins maydonlari Result ichida boshqariladi.

### users/{uid}/records

- Har dars uchun student score recordlari.
- Push flow oxirgi `LESSON_BATCH` recordlar asosida status hisoblaydi.

### users/{uid}/settings/reward-system

- Scoring weights.
- Telegram settings.
- Battle/game settings.
- Sync settings.

## Asosiy sahifalar

- Login/Auth
- Dashboard
- Groups
- Analytics
- Settings
- Privileges
- Quiz/Game

## Dasturchi vazifalari

### 1. Firebase rules

- Har teacher faqat o'z `users/{uid}` datasini o'qib/yoza olsin.
- `teachers/{uid}` profile o'qish/yozish qoidalari aniq bo'lsin.
- SyncWorker Firebase Admin bilan ishlagani uchun rulesdan tashqarida, lekin frontend rules qat'iy bo'lishi kerak.

### 2. Auth flow

- Check'dan sync qilingan mentor telefon va Check paroli bilan kira olishi kerak.
- Manual register flow alohida tekshirilsin.
- Reset password flow test qilinsin.
- Login errorlar aniq matn bilan chiqsin.

### 3. Dashboard

- Auto group detection `date` va `currentTime` bo'yicha ishlasin.
- Manual group tanlash ishlasin.
- Score save qilishda duplicate record bo'lmasin.
- Lesson lock/unlock flow tekshirilsin.
- Telegram lesson report yuborish tekshirilsin.

### 4. Groups

- Group CRUD.
- Student CRUD.
- Check sync qilingan guruh va o'quvchilar uchun identity maydonlar buzilmasin.
- Group rename bo'lsa student group maydoni ham yangilansin.

### 5. Analytics

- Group, student, coin va progress statistikasi.
- Oxirgi 90 kun records query performance.
- Recharts bundle optimizatsiyasi.

### 6. Settings

- Scoring weights validation.
- Telegram bot token/chat id test.
- Worker sync tugmalari:
  - Pull
  - Push
  - Sync
- `VITE_WORKER_URL` va `VITE_WORKER_RUN_TOKEN` yo'q bo'lsa aniq xabar chiqsin.

### 7. Sync UX

- Oxirgi sync vaqti ko'rsatilsin.
- Push natijasi mentor uchun aniq ko'rinsin.
- Failed sync error history ko'rsatilsin.
- Manual push faqat joriy mentor uid bilan ishlasin.

### 8. PWA

- Manifest iconlar to'g'ri chiqsin.
- Service worker update flow tekshirilsin.
- Firebase offline cache behavior tekshirilsin.

## Acceptance criteria

- `npm run build` muvaffaqiyatli o'tadi.
- Firebase env bo'lsa real login ishlaydi.
- Firebase env bo'lmasa demo/error holati tushunarli.
- Mentor group, student va score boshqara oladi.
- Telegram report yuboriladi.
- Sync tugmalari Worker bilan ishlaydi.
- Firestore rules boshqa user datasiga kirishni bloklaydi.

