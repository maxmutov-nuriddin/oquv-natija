# FullCoddyResultsProjects Logic

Bu papka Coddy Results appi. React + Vite frontend Firebase Auth va Firestore bilan ishlaydi. App o'qituvchilarga guruh, o'quvchi, dars recordlari, ball, coin va gamificationni yuritish uchun kerak.

## Entry va auth oqimi

`src/main.jsx` appni mount qiladi. `src/App.jsx` auth holatini `useTeacherAuth()` orqali tekshiradi:

- `loading` paytida loading screen chiqadi.
- Teacher login bo'lmagan bo'lsa `/login` sahifasi.
- Teacher login bo'lgan bo'lsa `DashboardApp`.

`src/hooks/useTeacherAuth.js` teacher login/register/reset/profile/password amallarini boshqaradi.

## Data oqimi

`src/hooks/useDashboardData.js` asosiy Firestore data hook:

1. Firebase config borligini tekshiradi.
2. `ensureAdminSession()` orqali user sessionni ta'minlaydi.
3. `users/{uid}` namespace ichidan realtime listenerlar ochadi:
   - `students`
   - `groups`
   - `records`
   - `settings/reward-system`
4. UI shu state bilan ishlaydi.

Collectionlar:

- `users/{uid}/students`: o'quvchilar, group, score, coin, Check sync idlari.
- `users/{uid}/groups`: guruhlar, dars kunlari/vaqti, Check group id.
- `users/{uid}/records`: har bir dars/lesson uchun homework, attendance, activity recordlar.
- `users/{uid}/settings/reward-system`: scoring weight va reward sozlamalari.
- `teachers/{uid}`: teacher profili va Check mentor bog'lanishi.

## Asosiy sahifalar

- `DashboardApp`: ichki route/layout boshqaruvi.
- `DashboardPage`: umumiy dashboard.
- `GroupsPage`: guruhlar va dars kiritish.
- `AnalyticsPage`: statistika.
- `PrivilegesPage`: coin/privilege/gift workflowlar.
- `QuizGamePage`: quiz/game ekranlari.
- `SettingsPage`: reward, profile, sync va boshqa sozlamalar.
- `AuthPage`: login/reset auth ekrani.

## Papkalar

- `components/forms`: student/group/gift/block modal va formalar.
- `components/groups`: lesson entry panel.
- `components/student`: student card va profile modal.
- `components/battles`: group/clan/boss competition UI.
- `components/games`: bonus drum va mystery box.
- `components/senior`: projector va clan panel.
- `components/ui`: modal, stat card, loading, empty state, export, timer va umumiy UI.
- `hooks`: auth va dashboard data.
- `lib`: scoring, title, telegram, comics va util funksiyalar.
- `data`: demo/default data.
- `constants`: umumiy constantlar.
- `i18n`: uz/ru textlar.

## Scoring va sync bilan bog'lanish

Teacher dars record kiritganda `records` yangilanadi. `lib/scoring.js` shu recordlardan score/coin/summary hisoblaydi. `CoddySyncWorker` keyin shu Firestore ma'lumotlarini o'qib, oxirgi darslar bo'yicha Check backendga status/comment qaytarishi mumkin.

Check'dan kelgan student/group/teacherlar `CoddySyncWorker` orqali Firestorega `checkStudentId`, `checkGroupId`, `checkMentorId`, `syncSource: coddycheck` kabi fieldlar bilan bog'lanadi. App ichidagi ball va recordlar sync paytida o'chirilmasligi kerak.

