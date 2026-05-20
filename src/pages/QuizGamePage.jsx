import { useMemo, useState } from "react";
import { ArrowLeft, Check, Play, RefreshCw, Trophy, Users, X, Eye, ChevronRight } from "lucide-react";

// ─── Questions: 4 per level per topic (for up to 4 teams) ────────────────────
const TOPICS_DATA = [
  {
    id: "html", name: "HTML asoslari", icon: "🌐",
    color: "#58cc02", colorDark: "#46a302",
    questions: {
      100: [
        { q: "HTML da sarlavha uchun qaysi teg ishlatiladi?", a: "<h1> dan <h6> gacha — eng katta <h1>, eng kichik <h6>" },
        { q: "HTML da paragraf (abzats) uchun qaysi teg?", a: "<p> — paragraph tegi. Har bir matn bo'lagi uchun ishlatiladi" },
        { q: "HTML da rasm qo'shish uchun qaysi teg?", a: "<img src='rasm.jpg' alt='tavsif'> — src manba, alt tavsif matni" },
        { q: "HTML da havola (link) yaratish uchun qaysi teg?", a: "<a href='https://...'>Matn</a> — href da manzil ko'rsatiladi" },
      ],
      200: [
        { q: "HTML da qalin (bold) matn uchun qaysi teg?", a: "<strong> yoki <b> — ikkalasi ham matnni qalin qiladi" },
        { q: "HTML da tartibsiz ro'yxat qanday yaratiladi?", a: "<ul> ichida <li> teglar: <ul><li>1</li><li>2</li></ul>" },
        { q: "<div> va <span> ning farqi nima?", a: "<div> — block element (qatorni egallaydi). <span> — inline element (ichida joylashadi)" },
        { q: "HTML da tugma (button) yaratish uchun qaysi teg?", a: "<button>Bosing</button> — yoki <input type='button' value='Bosing'>" },
      ],
      300: [
        { q: "HTML da forma (form) yaratish uchun qaysi teglar?", a: "<form> ichida <input>, <button>, <label> teglar ishlatiladi" },
        { q: "id va class atributlari qanday farqlanadi?", a: "id — sahifada yagona (bitta element). class — ko'p elementga bir xil nom berish mumkin" },
        { q: "HTML da matn kiritish inputi qanday yaratiladi?", a: "<input type='text'> — matn uchun. <input type='password'> — parol uchun (yashirilgan)" },
        { q: "<br> va <hr> teglari nima qiladi?", a: "<br> — yangi qatorga o'tkazadi. <hr> — gorizontal chiziq chizadi" },
      ],
      400: [
        { q: "Semantik HTML teglari nima? 4 ta misol bering.", a: "<header>, <footer>, <main>, <nav>, <section>, <article> — sahifa tuzilishini ma'noli ifodalaydi" },
        { q: "alt atributi nima uchun kerak?", a: "Rasm yuklanmasa ko'rinadigan matn. Ko'zi ojizlar uchun screen reader o'qiydi" },
        { q: "HTML da <meta charset> nima uchun?", a: "<meta charset='UTF-8'> — O'zbek va boshqa harflar to'g'ri ko'rinishi uchun kodlashni belgilaydi" },
        { q: "<input> ning eng ko'p ishlatiladigan type'lari?", a: "text, password, email, number, checkbox, radio, submit, file, date" },
      ],
      500: [
        { q: "Viewport meta tegi nima va nima uchun kerak?", a: "<meta name='viewport' content='width=device-width, initial-scale=1'> — Mobilga moslashish uchun" },
        { q: "<select> va <option> teglar nima qiladi?", a: "<select> — dropdown ro'yxat yaratadi. <option> — har bir tanlov elementi" },
        { q: "HTML da required, placeholder, maxlength nima qiladi?", a: "required — majburiy maydon. placeholder — bo'sh bo'lganda ko'rinadigan matn. maxlength — maksimal belgilar soni" },
        { q: "target='_blank' nima qiladi?", a: "Havolani yangi tabda ochadi. Xavfsizlik uchun rel='noopener noreferrer' ham qo'shiladi" },
      ],
    },
  },
  {
    id: "css", name: "CSS asoslari", icon: "🎨",
    color: "#1cb0f6", colorDark: "#1899d6",
    questions: {
      100: [
        { q: "CSS da matn rangini beruvchi property?", a: "color: red; — matn rangi. background-color: blue; — fon rangi" },
        { q: "CSS da shrift (font) o'lchamini belgilovchi property?", a: "font-size: 16px; — pikselda yoki font-size: 1rem;" },
        { q: "CSS da elementga chegara (border) qanday qo'shiladi?", a: "border: 1px solid black; — qalinlik, tur, rang tartibida" },
        { q: "CSS da elementni ko'rinmas qilish uchun qaysi property?", a: "display: none; — elementni to'liq yashiradi va joy olmaydi" },
      ],
      200: [
        { q: "margin va padding farqi nima?", a: "margin — elementning TASHQI bo'shliqlari. padding — elementning ICHKI bo'shliqlari" },
        { q: "CSS da elementlar bir qatorda turishi uchun?", a: "display: flex; — flexbox yordamida elementlar bir qatorda joylashadi" },
        { q: "CSS da matnni qalin (bold) qilish uchun?", a: "font-weight: bold; yoki font-weight: 700; — 100 dan 900 gacha qiymat" },
        { q: "CSS da elementning kengligi va balandligi?", a: "width: 200px; va height: 100px; — piksel, %, vw/vh va boshqa birliklar" },
      ],
      300: [
        { q: "Flexbox da elementlarni markazga olish uchun?", a: "justify-content: center; (gorizontal) va align-items: center; (vertikal)" },
        { q: "CSS da :hover nima?", a: "Sichqoncha element ustiga kelganda ishlaydigan stil: button:hover { background: blue; }" },
        { q: "CSS class va id selektorlari qanday yoziladi?", a: "class — .classname { } (nuqta bilan). id — #idname { } (panjara bilan)" },
        { q: "border-radius nima qiladi?", a: "Elementning burchaklarini yumaloqlashtiradi. border-radius: 50% — to'liq doira qiladi" },
      ],
      400: [
        { q: "position: relative va position: absolute farqi?", a: "relative — o'z joyidan siljiydi. absolute — eng yaqin positioned elementga nisbatan joylashadi" },
        { q: "CSS media query nima va qanday yoziladi?", a: "@media (max-width: 768px) { } — mobil uchun stil o'zgartirish" },
        { q: "CSS da box-shadow qanday yoziladi?", a: "box-shadow: 0 4px 8px rgba(0,0,0,0.1); — x-offset y-offset blur rang" },
        { q: "overflow: hidden nima qiladi?", a: "Elementdan tashqariga chiqgan kontent yashiriladi. Yumaloq rasm qilishda ishlatiladi" },
      ],
      500: [
        { q: "CSS transition nima va qanday yoziladi?", a: "transition: all 0.3s ease; — o'zgarishlarni silliq animatsiya qiladi" },
        { q: "CSS Grid va Flexbox asosiy farqi?", a: "Flexbox — 1 o'lchamli (qator YOKI ustun). Grid — 2 o'lchamli (qator VA ustun bir vaqtda)" },
        { q: "z-index nima va qachon ishlaydi?", a: "Elementlar bir-birining ustiga chiqishi tartibini belgilaydi. Faqat position: static bo'lmagan elementda ishlaydi" },
        { q: "CSS o'zgaruvchilar (variables) qanday e'lon qilinadi?", a: ":root { --asosiy-rang: #3b82f6; } — ishlatish: color: var(--asosiy-rang);" },
      ],
    },
  },
  {
    id: "js", name: "JavaScript", icon: "⚡",
    color: "#ffc800", colorDark: "#e5b400",
    questions: {
      100: [
        { q: "JS da o'zgaruvchi qanday e'lon qilinadi?", a: "let ism = 'Ali'; yoki const yosh = 20; — let o'zgaradi, const o'zgarmaydi" },
        { q: "🧮 Mini: console.log(3 + 5) nima chiqaradi?", a: "8 — ikki sonni qo'shadi" },
        { q: "JS da matnni konsolga chiqarish uchun?", a: "console.log('Salom, dunyo!'); — F12 → Console da ko'rinadi" },
        { q: "🧮 Mini: typeof 'hello' nima chiqaradi?", a: "'string' — matn turi" },
      ],
      200: [
        { q: "JS da if-else qanday yoziladi?", a: "if (yosh >= 18) { console.log('Katta'); } else { console.log('Kichik'); }" },
        { q: "🧮 Mini: [1, 2, 3].length = ?", a: "3 — massivdagi elementlar soni" },
        { q: "JS da massiv (array) qanday yaratiladi?", a: "const mevalar = ['olma', 'nok', 'banan']; — kvadrat qavsda vergul bilan ajratib" },
        { q: "JS da funksiya qanday e'lon qilinadi?", a: "function salomlash(ism) { return 'Salom ' + ism; } — yoki const f = () => {}" },
      ],
      300: [
        { q: "JS da massivga element qo'shish uchun qaysi metod?", a: ".push() — oxiriga qo'shadi. .unshift() — boshiga qo'shadi" },
        { q: "🧮 Mini: [1,2,3].map(x => x*2) = ?", a: "[2, 4, 6] — har elementni 2 ga ko'paytiradi" },
        { q: "JS da ob'ekt qanday yaratiladi?", a: "const odam = { ism: 'Ali', yosh: 20 }; — kalit: qiymat juftligi" },
        { q: "🧮 Mini: 'salom'.toUpperCase() = ?", a: "'SALOM' — barcha harflarni katta qiladi" },
      ],
      400: [
        { q: "=== va == operatorlarining farqi?", a: "=== qat'iy tenglik — tur VA qiymat. == — faqat qiymat tekshiradi (0 == false → true)" },
        { q: "🧮 Mini: [1,2,3,4,5].filter(x => x > 3) = ?", a: "[4, 5] — 3 dan katta elementlarni filtrlaydi" },
        { q: "JS da DOM dan element olish uchun qaysi metodlar?", a: "document.getElementById('id') yoki document.querySelector('.class')" },
        { q: "JS da click hodisasini qanday qo'shiladi?", a: "tugma.addEventListener('click', function() { ... }); — hodisa tinglovchi" },
      ],
      500: [
        { q: "async/await nima va nima uchun kerak?", a: "Asinxron amallarni sinxron uslubda yozishga imkon beradi. await Promise kutadi, async funksiya Promise qaytaradi" },
        { q: "Destrukturizatsiya (destructuring) nima?", a: "const {ism, yosh} = odam; — ob'ektdan. const [a, b] = arr; — massivdan qiymat chiqarish" },
        { q: "localStorage qanday ishlatiladi?", a: "localStorage.setItem('key', 'value'); — saqlash. localStorage.getItem('key'); — o'qish. Brauzer yopilsa ham qoladi" },
        { q: "map(), filter(), find() nima qiladi?", a: "map — har elementni o'zgartiradi. filter — shartga moslarni tanlaydi. find — birinchi mosini topadi" },
      ],
    },
  },
  {
    id: "it", name: "IT Terminlar", icon: "💻",
    color: "#ff4b4b", colorDark: "#ea2b2b",
    questions: {
      100: [
        { q: "Browser (brauzer) nima? Misol bering.", a: "Internet sahifalarni ko'rsatuvchi dastur: Chrome, Firefox, Safari, Edge" },
        { q: "Bug nima?", a: "Dasturlardagi xato yoki muammo. Uni topib tuzatish 'debugging' deyiladi" },
        { q: "Download va Upload farqi?", a: "Download — internetdan qurilmaga yuklab olish. Upload — qurilmadan internetga yuborish" },
        { q: "🧮 Mini: 8 bit = ? byte", a: "1 byte — 8 bit = 1 byte" },
      ],
      200: [
        { q: "Frontend va Backend farqi?", a: "Frontend — foydalanuvchi ko'radigan qism (HTML, CSS, JS). Backend — server, ma'lumotlar bazasi" },
        { q: "Git nima va nima uchun ishlatiladi?", a: "Kod versiyalarini saqlash tizimi. commit, push, pull — jamoaviy ishlashda yordam beradi" },
        { q: "npm nima?", a: "Node Package Manager — JS kutubxonalarini o'rnatish uchun: npm install react" },
        { q: "🧮 Mini: 1 KB = ? byte", a: "1024 byte" },
      ],
      300: [
        { q: "API nima?", a: "Application Programming Interface — dasturlar o'rtasida ma'lumot almashish interfeysi. Masalan: ob-havo APIsi" },
        { q: "HTTP va HTTPS farqi nima?", a: "HTTPS — ma'lumotlar shifrlangan (xavfsiz). HTTP — ochiq (xavfsiz emas). 🔒 belgisi HTTPS ni ko'rsatadi" },
        { q: "JSON nima?", a: "JavaScript Object Notation — ma'lumot almashish formati: {\"ism\": \"Ali\", \"yosh\": 20}" },
        { q: "Responsive dizayn nima?", a: "Sayt barcha qurilmalarda (telefon, planshet, kompyuter) to'g'ri ko'rinadigan dizayn" },
      ],
      400: [
        { q: "Database (ma'lumotlar bazasi) nima? Misol bering.", a: "Ma'lumotlarni tartibli saqlash tizimi: MySQL, PostgreSQL (SQL), MongoDB (NoSQL)" },
        { q: "Framework nima? Misol bering.", a: "Dastur yaratishni tezlashtiruvchi tayyor asos: React, Vue (frontend), Django, Laravel (backend)" },
        { q: "Hosting nima?", a: "Saytni internetda ko'rsatish uchun server jayi. Netlify, Vercel, GitHub Pages — bepul hosting misollari" },
        { q: "Open source nima?", a: "Kodi hammaga ochiq dastur. VS Code, Linux, React — open source. Bepul ishlatish va o'zgartirish mumkin" },
      ],
      500: [
        { q: "REST API nima? HTTP metodlari?", a: "GET — o'qish, POST — yaratish, PUT — yangilash, DELETE — o'chirish. JSON formatda ma'lumot almashadi" },
        { q: "SQL nima? Oddiy so'rov qanday yoziladi?", a: "Structured Query Language — ma'lumotlar bazasi tili. SELECT * FROM users WHERE id = 1;" },
        { q: "Git da commit, push, pull nima?", a: "Commit — lokal saqlash. Push — GitHubga yuborish. Pull — GitHubdan yangilash" },
        { q: "Domain va IP manzil nima?", a: "IP — kompyuter manzili (142.250.185.78). Domain — odam o'qiydigan nom (google.com). DNS tarjima qiladi" },
      ],
    },
  },
];

// ─── Russian questions ────────────────────────────────────────────────────────
const TOPICS_DATA_RU = [
  {
    id: "html", name: "Основы HTML", icon: "🌐",
    color: "#58cc02", colorDark: "#46a302",
    questions: {
      100: [
        { q: "Какой тег используется для заголовка в HTML?", a: "От <h1> до <h6> — самый большой <h1>, самый маленький <h6>" },
        { q: "Какой тег используется для абзаца в HTML?", a: "<p> — тег параграфа. Используется для каждого блока текста" },
        { q: "Какой тег добавляет изображение в HTML?", a: "<img src='фото.jpg' alt='описание'> — src источник, alt текстовое описание" },
        { q: "Какой тег создаёт ссылку в HTML?", a: "<a href='https://...'>Текст</a> — в атрибуте href указывается адрес" },
      ],
      200: [
        { q: "Какой тег делает текст жирным (bold) в HTML?", a: "<strong> или <b> — оба делают текст жирным" },
        { q: "Как создать неупорядоченный список в HTML?", a: "<ul> с тегами <li>: <ul><li>1</li><li>2</li></ul>" },
        { q: "В чём разница между <div> и <span>?", a: "<div> — блочный элемент (занимает всю строку). <span> — строчный (размещается внутри)" },
        { q: "Какой тег создаёт кнопку в HTML?", a: "<button>Нажмите</button> или <input type='button' value='Нажмите'>" },
      ],
      300: [
        { q: "Какие теги используются для создания формы в HTML?", a: "<form> внутри которой <input>, <button>, <label>" },
        { q: "В чём разница между атрибутами id и class?", a: "id — уникален (один элемент). class — можно назначить многим элементам" },
        { q: "Как создать поле ввода текста в HTML?", a: "<input type='text'> — для текста. <input type='password'> — для пароля (скрытый)" },
        { q: "Что делают теги <br> и <hr>?", a: "<br> — перенос строки. <hr> — горизонтальная разделительная линия" },
      ],
      400: [
        { q: "Что такое семантические теги HTML? Назовите 4 примера.", a: "<header>, <footer>, <main>, <nav>, <section>, <article> — описывают смысл содержимого страницы" },
        { q: "Зачем нужен атрибут alt?", a: "Текст при незагруженном изображении. Читается screen reader для слабовидящих пользователей" },
        { q: "Зачем нужен мета тег charset?", a: "<meta charset='UTF-8'> — задаёт кодировку для правильного отображения символов" },
        { q: "Самые используемые значения type у <input>?", a: "text, password, email, number, checkbox, radio, submit, file, date" },
      ],
      500: [
        { q: "Что такое мета тег viewport и зачем он нужен?", a: "<meta name='viewport' content='width=device-width, initial-scale=1'> — адаптация под мобильные устройства" },
        { q: "Что делают теги <select> и <option>?", a: "<select> — создаёт выпадающий список. <option> — каждый пункт выбора" },
        { q: "Что делают атрибуты required, placeholder, maxlength?", a: "required — обязательное поле. placeholder — текст при пустом поле. maxlength — максимум символов" },
        { q: "Что делает target='_blank'?", a: "Открывает ссылку в новой вкладке. Для безопасности добавляют rel='noopener noreferrer'" },
      ],
    },
  },
  {
    id: "css", name: "Основы CSS", icon: "🎨",
    color: "#1cb0f6", colorDark: "#1899d6",
    questions: {
      100: [
        { q: "Какое свойство CSS задаёт цвет текста?", a: "color: red; — цвет текста. background-color: blue; — цвет фона" },
        { q: "Какое свойство CSS задаёт размер шрифта?", a: "font-size: 16px; — в пикселях или font-size: 1rem;" },
        { q: "Как добавить рамку (border) к элементу в CSS?", a: "border: 1px solid black; — толщина, стиль, цвет" },
        { q: "Какое свойство CSS скрывает элемент?", a: "display: none; — полностью скрывает и убирает из потока документа" },
      ],
      200: [
        { q: "В чём разница между margin и padding?", a: "margin — внешние отступы элемента. padding — внутренние отступы" },
        { q: "Как расположить элементы в одну строку в CSS?", a: "display: flex; — элементы выстраиваются в ряд с помощью flexbox" },
        { q: "Как сделать текст жирным в CSS?", a: "font-weight: bold; или font-weight: 700; — значения от 100 до 900" },
        { q: "Какие свойства задают размеры элемента?", a: "width: 200px; и height: 100px; — пиксели, %, vw/vh и другие единицы" },
      ],
      300: [
        { q: "Как выровнять элементы по центру во Flexbox?", a: "justify-content: center; (горизонталь) и align-items: center; (вертикаль)" },
        { q: "Что такое :hover в CSS?", a: "Стиль при наведении мыши: button:hover { background: blue; }" },
        { q: "Как записываются селекторы class и id в CSS?", a: "class — .classname { } (с точкой). id — #idname { } (с решёткой)" },
        { q: "Что делает border-radius?", a: "Скругляет углы элемента. border-radius: 50% — делает полный круг" },
      ],
      400: [
        { q: "В чём разница между position: relative и position: absolute?", a: "relative — смещается от своего места. absolute — позиционируется относительно positioned родителя" },
        { q: "Что такое media query в CSS и как записывается?", a: "@media (max-width: 768px) { } — изменение стилей для мобильных устройств" },
        { q: "Как записывается box-shadow в CSS?", a: "box-shadow: 0 4px 8px rgba(0,0,0,0.1); — x-offset y-offset blur цвет" },
        { q: "Что делает overflow: hidden?", a: "Скрывает контент, выходящий за пределы элемента. Используют для круглых изображений" },
      ],
      500: [
        { q: "Что такое transition в CSS и как записывается?", a: "transition: all 0.3s ease; — плавная анимация изменений свойств" },
        { q: "В чём главное отличие CSS Grid от Flexbox?", a: "Flexbox — одномерный (строка ИЛИ столбец). Grid — двумерный (строки И столбцы вместе)" },
        { q: "Что такое z-index и когда работает?", a: "Задаёт порядок наложения. Работает только на элементах без position: static" },
        { q: "Как объявляются CSS переменные?", a: ":root { --main-color: #3b82f6; } — использование: color: var(--main-color);" },
      ],
    },
  },
  {
    id: "js", name: "JavaScript", icon: "⚡",
    color: "#ffc800", colorDark: "#e5b400",
    questions: {
      100: [
        { q: "Как объявляется переменная в JS?", a: "let name = 'Али'; или const age = 20; — let можно изменить, const нельзя" },
        { q: "🧮 Мини: console.log(3 + 5) что выведет?", a: "8 — складывает два числа" },
        { q: "Как вывести текст в консоль в JS?", a: "console.log('Привет, мир!'); — виден в F12 → Console" },
        { q: "🧮 Мини: typeof 'hello' что выведет?", a: "'string' — тип данных строка" },
      ],
      200: [
        { q: "Как записывается if-else в JS?", a: "if (age >= 18) { console.log('Взрослый'); } else { console.log('Ребёнок'); }" },
        { q: "🧮 Мини: [1, 2, 3].length = ?", a: "3 — количество элементов в массиве" },
        { q: "Как создаётся массив (array) в JS?", a: "const fruits = ['яблоко', 'груша', 'банан']; — в квадратных скобках через запятую" },
        { q: "Как объявляется функция в JS?", a: "function greet(name) { return 'Привет ' + name; } — или const f = () => {}" },
      ],
      300: [
        { q: "Какой метод добавляет элемент в массив в JS?", a: ".push() — добавляет в конец. .unshift() — добавляет в начало" },
        { q: "🧮 Мини: [1,2,3].map(x => x*2) = ?", a: "[2, 4, 6] — умножает каждый элемент на 2" },
        { q: "Как создаётся объект в JS?", a: "const person = { name: 'Али', age: 20 }; — пары ключ: значение" },
        { q: "🧮 Мини: 'привет'.toUpperCase() = ?", a: "'ПРИВЕТ' — делает все буквы заглавными" },
      ],
      400: [
        { q: "В чём разница между === и ==?", a: "=== строгое равенство — тип И значение. == — только значение (0 == false → true)" },
        { q: "🧮 Мини: [1,2,3,4,5].filter(x => x > 3) = ?", a: "[4, 5] — фильтрует элементы больше 3" },
        { q: "Как получить элемент из DOM в JS?", a: "document.getElementById('id') или document.querySelector('.class')" },
        { q: "Как добавить обработчик события click в JS?", a: "button.addEventListener('click', function() { ... });" },
      ],
      500: [
        { q: "Что такое async/await и зачем нужно?", a: "Позволяет писать асинхронный код в синхронном стиле. await ждёт Promise, async возвращает Promise" },
        { q: "Что такое деструктуризация (destructuring)?", a: "const {name, age} = person; — из объекта. const [a, b] = arr; — из массива" },
        { q: "Как используется localStorage?", a: "localStorage.setItem('key', 'value'); — сохранить. localStorage.getItem('key'); — прочитать" },
        { q: "Что делают map(), filter(), find()?", a: "map — изменяет каждый элемент. filter — выбирает подходящие. find — находит первый совпадающий" },
      ],
    },
  },
  {
    id: "it", name: "IT Термины", icon: "💻",
    color: "#ff4b4b", colorDark: "#ea2b2b",
    questions: {
      100: [
        { q: "Что такое браузер? Приведите примеры.", a: "Программа для просмотра веб-страниц: Chrome, Firefox, Safari, Edge" },
        { q: "Что такое баг (bug)?", a: "Ошибка или неисправность в программе. Её поиск называется 'debugging'" },
        { q: "В чём разница между Download и Upload?", a: "Download — скачать из интернета на устройство. Upload — загрузить на сервер" },
        { q: "🧮 Мини: 8 бит = ? байт", a: "1 байт — 8 бит = 1 байт" },
      ],
      200: [
        { q: "В чём разница между Frontend и Backend?", a: "Frontend — часть, которую видит пользователь (HTML, CSS, JS). Backend — сервер, база данных" },
        { q: "Что такое Git и для чего используется?", a: "Система контроля версий кода. commit, push, pull — помогает в командной работе" },
        { q: "Что такое npm?", a: "Node Package Manager — для установки JS библиотек: npm install react" },
        { q: "🧮 Мини: 1 КБ = ? байт", a: "1024 байт" },
      ],
      300: [
        { q: "Что такое API?", a: "Application Programming Interface — интерфейс обмена данными между программами. Пример: API погоды" },
        { q: "В чём разница между HTTP и HTTPS?", a: "HTTPS — данные зашифрованы (безопасно). HTTP — открытые данные. 🔒 означает HTTPS" },
        { q: "Что такое JSON?", a: "JavaScript Object Notation — формат обмена данными: {\"name\": \"Али\", \"age\": 20}" },
        { q: "Что такое адаптивный дизайн (responsive design)?", a: "Сайт корректно отображается на всех устройствах: телефон, планшет, ПК" },
      ],
      400: [
        { q: "Что такое база данных? Приведите примеры.", a: "Система хранения данных: MySQL, PostgreSQL (SQL), MongoDB (NoSQL)" },
        { q: "Что такое фреймворк? Приведите примеры.", a: "Готовая основа для ускорения разработки: React, Vue (frontend), Django, Laravel (backend)" },
        { q: "Что такое хостинг?", a: "Место на сервере для сайта в интернете. Netlify, Vercel, GitHub Pages — бесплатный хостинг" },
        { q: "Что такое open source?", a: "Программа с открытым кодом. VS Code, Linux, React — open source. Бесплатно использовать и изменять" },
      ],
      500: [
        { q: "Что такое REST API? HTTP методы?", a: "GET — чтение, POST — создание, PUT — обновление, DELETE — удаление. Данные в формате JSON" },
        { q: "Что такое SQL? Запишите простой запрос.", a: "Structured Query Language — язык для баз данных. SELECT * FROM users WHERE id = 1;" },
        { q: "Что такое commit, push, pull в Git?", a: "Commit — локальное сохранение. Push — отправка на GitHub. Pull — получение обновлений" },
        { q: "Что такое домен и IP адрес?", a: "IP — адрес компьютера (142.250.185.78). Domain — понятное имя (google.com). DNS переводит одно в другое" },
      ],
    },
  },
];

const POINT_VALUES = [100, 200, 300, 400, 500];
const TEAM_COLORS  = ["#ff4b4b", "#1cb0f6", "#58cc02", "#ffc800"];

// Point level colors (matches site palette)
const PT = {
  100: { color: "#58cc02", colorDark: "#46a302", light_bg: "#f0fdf4", light_bd: "#86efac", light_bdb: "#4ade80", light_c: "#166534" },
  200: { color: "#1cb0f6", colorDark: "#1899d6", light_bg: "#eff6ff", light_bd: "#93c5fd", light_bdb: "#60a5fa", light_c: "#1e40af" },
  300: { color: "#ffc800", colorDark: "#e5b400", light_bg: "#fefce8", light_bd: "#fde047", light_bdb: "#facc15", light_c: "#854d0e" },
  400: { color: "#ff9600", colorDark: "#e07800", light_bg: "#fff7ed", light_bd: "#fdba74", light_bdb: "#fb923c", light_c: "#9a3412" },
  500: { color: "#ff4b4b", colorDark: "#ea2b2b", light_bg: "#fff1f2", light_bd: "#fda4af", light_bdb: "#f43f5e", light_c: "#9f1239" },
};

// Board: board[pts] = [ { type, used, q, a, topicIcon, topicColor }, ... ] — length = teamCount
// Questions are randomly drawn from all selected topics and placed per price level
function initBoard(selectedTopics, teamCount) {
  const board = {};

  POINT_VALUES.forEach((pts) => {
    // Gather all questions at this price from every selected topic
    const allQs = [];
    selectedTopics.forEach((topic) => {
      (topic.questions[pts] || []).forEach((q) =>
        allQs.push({ ...q, topicIcon: topic.icon, topicColor: topic.color })
      );
    });
    // Shuffle then assign one question per team slot (wrap if fewer questions than teams)
    const sh = [...allQs].sort(() => Math.random() - 0.5);
    board[pts] = Array.from({ length: teamCount }, (_, slot) => {
      const q = sh[slot % sh.length];
      return { type: q.cellType || "question", used: false, q: q.q, a: q.a, topicIcon: q.topicIcon, topicColor: q.topicColor };
    });
  });

  // Place mystery cells (~12% of pts≥200 slots) — skip cells already typed
  const pool = [];
  POINT_VALUES.filter((p) => p >= 200).forEach((pts) =>
    board[pts].forEach((cell, slot) => { if (cell.type === "question") pool.push({ pts, slot }); })
  );
  const sh2 = [...pool].sort(() => Math.random() - 0.5);
  const count = Math.max(2, Math.round(pool.length * 0.12));
  sh2.slice(0, count).forEach(({ pts, slot }, i) => {
    board[pts][slot].type = i < Math.ceil(count * 0.6) ? "bonus" : "minus";
  });

  return board;
}

// ─── SETUP (2 steps: teams → topics) ─────────────────────────────────────────
const LANG_LABELS = { uz: "O'zbek 🇺🇿", ru: "Русский 🇷🇺" };
const DEFAULT_TEAM_NAMES = {
  uz: ["1-Jamoa", "2-Jamoa", "3-Jamoa", "4-Jamoa"],
  ru: ["Команда 1", "Команда 2", "Команда 3", "Команда 4"],
};
const SOURCE_LABELS = {
  uz: { default: "Standart savollar", custom: "Faqat mening savollarim", all: "Barchasi" },
  ru: { default: "Стандартные вопросы", custom: "Только мои вопросы",     all: "Все вопросы" },
};

function SetupScreen({ onStart, customTopics }) {
  const [step,           setStep]          = useState(1);
  const [gameLang,       setGameLang]      = useState("uz"); // "uz" | "ru"
  const [teamCount,      setTeamCount]     = useState(2);
  const [teamNames,      setTeamNames]     = useState(["1-Jamoa", "2-Jamoa", "3-Jamoa", "4-Jamoa"]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [source, setSource] = useState("default"); // "default" | "custom" | "all"

  const defaultTopics = gameLang === "ru" ? TOPICS_DATA_RU : TOPICS_DATA;
  const customTopicsForLang = (customTopics || []).map(topic => ({
    ...topic,
    questions: Object.fromEntries(
      Object.entries(topic.questions).map(([pts, qs]) => [
        pts, qs.filter(q => (q.lang || "uz") === gameLang)
      ])
    ),
  })).filter(t => Object.values(t.questions).some(a => a.length > 0));

  const availableTopics = source === "default"
    ? defaultTopics
    : source === "custom"
    ? customTopicsForLang
    : [...defaultTopics, ...customTopicsForLang];

  function switchLang(l) {
    setGameLang(l);
    setTeamNames(DEFAULT_TEAM_NAMES[l]);
    setSelectedTopics([]);
  }

  function toggleTopic(id) {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleStart() {
    if (!selectedTopics.length) return;
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      id: i, name: teamNames[i] || `${i + 1}-Jamoa`, score: 0, color: TEAM_COLORS[i],
    }));
    onStart(teams, selectedTopics, [...TOPICS_DATA, ...(customTopics || [])]);
  }

  return (
    <div className="qg-setup-wrap">
      <div className="panel qg-setup-card">
        {/* Header */}
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <span style={{ background: "var(--gold)", borderRadius: "var(--radius-sm)", padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={22} color="#fff" />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>Quiz {gameLang === "ru" ? "Игра" : "O'yini"}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
              {gameLang === "ru"
                ? (step === 1 ? "Шаг 1: Команды" : "Шаг 2: Темы")
                : (step === 1 ? "1-qadam: Jamoalar" : "2-qadam: Mavzular")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {["uz", "ru"].map(l => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                style={{
                  padding: "5px 10px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer",
                  border: `2px solid ${gameLang === l ? "#7c3aed" : "#e2e8f0"}`,
                  background: gameLang === l ? "#ede9fe" : "white",
                  color: gameLang === l ? "#7c3aed" : "#94a3b8",
                }}
              >{l === "uz" ? "🇺🇿 UZ" : "🇷🇺 RU"}</button>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="qg-setup-section">
              <label className="qg-setup-label">{gameLang === "ru" ? "Количество команд" : "Jamoalar soni"}</label>
              <div className="qg-count-row">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className={`qg-count-btn ${teamCount === n ? "primary-button" : "secondary-button"}`}
                    onClick={() => setTeamCount(n)}
                  >
                    <Users size={15} /> {n} {gameLang === "ru" ? "команды" : "jamoa"}
                  </button>
                ))}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                {gameLang === "ru"
                  ? <>На каждом уровне будет <strong style={{ color: "var(--text)" }}>{teamCount} вопроса</strong></>
                  : <>Har ball darajasida <strong style={{ color: "var(--text)" }}>{teamCount} ta savol</strong> bo'ladi</>}
              </p>
            </div>

            <div className="qg-setup-section">
              <label className="qg-setup-label">{gameLang === "ru" ? "Названия команд" : "Jamoa nomlari"}</label>
              <div className="qg-names-list">
                {Array.from({ length: teamCount }, (_, i) => (
                  <div key={i} className="qg-name-row">
                    <span className="qg-color-dot" style={{ background: TEAM_COLORS[i] }} />
                    <input
                      className="control"
                      style={{ flex: 1 }}
                      value={teamNames[i]}
                      onChange={(e) => {
                        const u = [...teamNames]; u[i] = e.target.value; setTeamNames(u);
                      }}
                      placeholder={`${i + 1}-Jamoa`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              className="primary-button"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              onClick={() => setStep(2)}
            >
              {gameLang === "ru" ? "Выбрать темы" : "Mavzularni tanlash"} <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="qg-setup-section">
              <label className="qg-setup-label">{gameLang === "ru" ? "Источник вопросов" : "Savollar manbai"}</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { val: "default", label: SOURCE_LABELS[gameLang].default },
                  { val: "custom",  label: SOURCE_LABELS[gameLang].custom },
                  { val: "all",     label: SOURCE_LABELS[gameLang].all },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => { setSource(opt.val); setSelectedTopics([]); }}
                    style={{
                      padding: "7px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${source === opt.val ? "#7c3aed" : "#e2e8f0"}`,
                      background: source === opt.val ? "#ede9fe" : "white",
                      color: source === opt.val ? "#7c3aed" : "#64748b",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {source === "custom" && customTopicsForLang.length === 0 && (
                <p style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600, marginTop: "8px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 12px" }}>
                  {gameLang === "ru"
                    ? "💡 Нет ваших вопросов на русском. Добавьте в Настройки → «Quiz savollari»."
                    : "💡 Hali o'z savollaringiz yo'q. Sozlamalar → \"Quiz savollari\" bo'limida qo'shing."}
                </p>
              )}
            </div>

            <div className="qg-setup-section">
              <label className="qg-setup-label">
                {gameLang === "ru" ? "Выберите темы" : "Mavzularni tanlang — alohida-alohida"}
                {selectedTopics.length > 0 && (
                  <span style={{ marginLeft: 8, color: "var(--blue)", fontWeight: 800 }}>
                    {selectedTopics.length} {gameLang === "ru" ? "выбрано" : "ta tanlandi"}
                  </span>
                )}
              </label>
              <div className="qg-topic-select-grid">
                {availableTopics.map((topic) => {
                  const active = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      className={`qg-topic-select-btn${active ? " selected" : ""}`}
                      style={active ? { borderColor: topic.color, borderBottomColor: topic.colorDark } : {}}
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <span className="qgts-icon">{topic.icon}</span>
                      <span className="qgts-name">{topic.name}</span>
                      <span className="qgts-check" style={active ? { background: topic.color, borderColor: topic.colorDark } : {}}>
                        {active && <Check size={13} color="#fff" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="qg-legend">
              <span className="qg-legend-item" style={{ background: "#fefce8", border: "1px solid #fde047", color: "#854d0e" }}>
                🧮 Mini masalalar bor
              </span>
              <span className="qg-legend-item" style={{ background: "#fff1f2", border: "1px solid #fda4af", color: "#991b1b" }}>
                ??? — maxfiy katakchalar
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="secondary-button"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} /> {gameLang === "ru" ? "Назад" : "Orqaga"}
              </button>
              <button
                className="primary-button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                disabled={selectedTopics.length < 1}
                onClick={handleStart}
              >
                <Play size={18} /> {gameLang === "ru" ? "Начать игру" : "O'yinni boshlash"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── END SCREEN ───────────────────────────────────────────────────────────────
function EndScreen({ teams, onReset }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return (
    <div className="qg-setup-wrap">
      <div className="panel qg-setup-card">
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <span style={{ background: "var(--gold)", borderRadius: "var(--radius-sm)", padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={22} color="#fff" />
          </span>
          <div>
            <h3 style={{ margin: 0 }}>O'yin Tugadi!</h3>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>Yakuniy natijalar</p>
          </div>
        </div>

        {sorted[0] && (
          <div className="qg-winner-card" style={{ borderColor: sorted[0].color, borderBottomColor: sorted[0].color, background: `${sorted[0].color}14` }}>
            🏆 G'olib: <strong style={{ color: sorted[0].color }}>{sorted[0].name}</strong> — {sorted[0].score} ball!
          </div>
        )}

        <div className="qg-final-list">
          {sorted.map((team, idx) => (
            <div key={team.id} className="qg-final-row" style={{ borderColor: team.color, borderBottomColor: team.color }}>
              <span className="qgfr-rank">{idx === 0 ? "🏆" : `${idx + 1}.`}</span>
              <span className="qgfr-name" style={{ color: team.color }}>{team.name}</span>
              <span className="qgfr-score">{team.score} ball</span>
            </div>
          ))}
        </div>

        <button
          className="primary-button"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={onReset}
        >
          <RefreshCw size={16} /> Qayta boshlash
        </button>
      </div>
    </div>
  );
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
export function QuizGamePage({ settings }) {
  const customTopics = (settings?.customTopics || []);
  const [phase, setPhase]   = useState("setup");
  const [teams, setTeams]   = useState([]);
  const [topics, setTopics] = useState([]);
  const [board, setBoard]   = useState({});
  const [teamCount, setTeamCount] = useState(2);
  const [currentTurn, setCurrentTurn] = useState(0); // index into teams[]

  // active cell: { pts, slot }
  const [activeCell,    setActiveCell]    = useState(null);
  const [showAnswer,    setShowAnswer]    = useState(false);
  const [resultEffect,  setResultEffect]  = useState(null);
  const [specialPhase,  setSpecialPhase]  = useState(false); // bonus/minus announce

  const totalCells = POINT_VALUES.length * teamCount;

  const usedCells = useMemo(() => {
    if (!Object.keys(board).length) return 0;
    return Object.values(board).reduce(
      (acc, slots) => acc + slots.filter((s) => s.used).length,
      0
    );
  }, [board]);

  function handleStart(newTeams, selectedIds, allTopics) {
    const tc = newTeams.length;
    const pool = allTopics || TOPICS_DATA;
    const sel = selectedIds.map((id) => pool.find((t) => t.id === id)).filter(Boolean);
    setTeams(newTeams);
    setTeamCount(tc);
    setTopics(sel);
    setBoard(initBoard(sel, tc));
    setCurrentTurn(0);
    setPhase("game");
  }

  function openCell(pts, slot) {
    const cell = board[pts]?.[slot];
    if (!cell || cell.used) return;
    setActiveCell({ pts, slot });
    setShowAnswer(false);
    setResultEffect(null);
    setSpecialPhase(cell.type !== "question");
  }

  function handleResult(correct) {
    const cell = board[activeCell.pts][activeCell.slot];
    const pts  = activeCell.pts;
    const mult = cell.type === "bonus" ? 2 : 1;
    const earn = correct ? pts * mult : 0;
    // minus penalty applies even if score goes negative
    const pen  = !correct && cell.type === "minus" ? -(Math.floor(pts / 2)) : 0;
    const delta = earn + pen;

    const currentTeamId = teams[currentTurn]?.id;
    setTeams((prev) =>
      prev.map((t) => t.id === currentTeamId ? { ...t, score: t.score + delta } : t)
    );
    setResultEffect({ type: correct ? "correct" : "incorrect", delta });

    setTimeout(() => {
      setBoard((prev) => {
        const updated = prev[activeCell.pts].map((c, i) =>
          i === activeCell.slot ? { ...c, used: true } : c
        );
        return { ...prev, [activeCell.pts]: updated };
      });
      setCurrentTurn((t) => (t + 1) % teams.length);
      setActiveCell(null);
      setResultEffect(null);
    }, 1400);
  }

  function skipCell() {
    if (!activeCell) return;
    setBoard((prev) => {
      const updated = prev[activeCell.pts].map((c, i) =>
        i === activeCell.slot ? { ...c, used: true } : c
      );
      return { ...prev, [activeCell.pts]: updated };
    });
    setCurrentTurn((t) => (t + 1) % teams.length);
    setActiveCell(null);
    setSpecialPhase(false);
  }

  function resetGame() {
    setPhase("setup");
    setTeams([]); setTopics([]); setBoard({});
    setCurrentTurn(0); setActiveCell(null); setShowAnswer(false);
    setResultEffect(null); setSpecialPhase(false);
  }

  useMemo(() => {
    if (phase === "game" && totalCells > 0 && usedCells === totalCells) {
      const t = setTimeout(() => setPhase("end"), 500);
      return () => clearTimeout(t);
    }
  }, [usedCells, totalCells, phase]);

  const activeCellData = activeCell ? board[activeCell.pts]?.[activeCell.slot] : null;

  if (phase === "setup") return <SetupScreen onStart={handleStart} customTopics={customTopics} />;
  if (phase === "end")   return <EndScreen teams={teams} onReset={resetGame} />;

  return (
    <div className="qg-wrap">

      {/* ── Scoreboard ── */}
      <div className="qg-scoreboard">
        <div className="qg-scores">
          {teams.map((team, idx) => {
            const isCurrentTurn = idx === currentTurn;
            return (
              <div
                key={team.id}
                className={`qg-team-card${isCurrentTurn ? " active-turn" : ""}`}
                style={{ borderColor: team.color, borderBottomColor: team.color }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
                  <span className="qg-turn-badge">{idx + 1}-Jamoa {isCurrentTurn ? "▶" : ""}</span>
                  <div className="qg-team-name" style={{ color: team.color }}>{team.name}</div>
                </div>
                <div className="qg-team-score">{team.score} <span>ball</span></div>
              </div>
            );
          })}
        </div>
        <div className="qg-meta">
          <div className="qg-progress-wrap">
            <div className="qg-progress-track">
              <div className="qg-progress-fill" style={{ width: `${(usedCells / totalCells) * 100}%` }} />
            </div>
            <span className="qg-prog-label">{usedCells}/{totalCells}</span>
          </div>
          <button className="secondary-button qg-finish-btn" onClick={() => setPhase("end")}>
            <Trophy size={14} /> Yakunlash
          </button>
        </div>
      </div>

      {/* ── Board: teams as columns, point values as rows ── */}
      <div className="qg-board-panel">
        <div
          className="qg-board"
          style={{ gridTemplateColumns: `repeat(${teamCount}, 1fr)` }}
        >
          {/* Team column headers */}
          {teams.map((team, idx) => (
            <div key={team.id} className="qg-col-header" style={{ borderColor: team.color }}>
              <span className="qg-col-order">{idx + 1}-Jamoa</span>
              <span className="qg-col-name" style={{ color: team.color }}>{team.name}</span>
            </div>
          ))}

          {/* Cells: for each point level × each team column */}
          {POINT_VALUES.flatMap((pts) =>
            teams.map((_, slot) => {
              const cell = board[pts]?.[slot];
              if (!cell) return null;
              const isMystery = cell.type !== "question";
              const ptColor = PT[pts].color;
              const ptDark  = PT[pts].colorDark;
              return (
                <button
                  key={`${pts}_${slot}`}
                  className={`qg-cell${cell.used ? " used" : ""}${isMystery ? " mystery" : ""}`}
                  style={!cell.used && !isMystery ? { "--qc": ptColor, "--qcb": ptDark } : {}}
                  onClick={() => openCell(pts, slot)}
                  disabled={cell.used}
                >
                  {cell.used ? (
                    <span className="qg-cell-used">✓</span>
                  ) : isMystery ? (
                    <span className="qg-cell-mystery">???</span>
                  ) : (
                    <>
                      <span className="qg-cell-pts" style={{ color: ptColor }}>{pts}</span>
                      <span className="qg-cell-unit" style={{ color: ptColor }}>BALL</span>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Question Modal ── */}
      {activeCell && (() => {
        const currentTeam = teams[currentTurn];
        const ptMeta = PT[activeCell.pts];
        return (
          <div className="qg-overlay">
            <div className="qg-modal">

              {/* Header: topic icon + pts badge */}
              <div className="qg-modal-head" style={{ borderColor: activeCellData?.topicColor, background: `${activeCellData?.topicColor}18` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{activeCellData?.topicIcon}</span>
                  <span className="qg-modal-cat" style={{ color: activeCellData?.topicColor }}>
                    {currentTurn + 1}-Jamoa navbati
                  </span>
                </div>
                <span
                  className="qg-modal-pts"
                  style={{ background: ptMeta?.light_bg, color: ptMeta?.light_c, borderColor: ptMeta?.light_bd }}
                >
                  {activeCellData?.type === "bonus"
                    ? `⚡ ${activeCell.pts * 2} BALL`
                    : activeCellData?.type === "minus"
                    ? `💀 MINUS`
                    : `${activeCell.pts} BALL`}
                </span>
              </div>

              {/* Current team indicator */}
              <div className="qg-current-team" style={{ borderColor: currentTeam?.color, background: `${currentTeam?.color}12` }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)" }}>{currentTurn + 1}-Jamoa:</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: currentTeam?.color }}>{currentTeam?.name}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{currentTeam?.score} ball</span>
              </div>

              {/* Special announce screen */}
              {specialPhase ? (
                <div className="qg-special">
                  <div className="qg-special-icon">
                    {activeCellData?.type === "bonus" ? "⚡" : "💀"}
                  </div>
                  <div className="qg-special-title" style={{ color: activeCellData?.type === "bonus" ? "#a16207" : "#be123c" }}>
                    {activeCellData?.type === "bonus" ? "BONUS SAVOL!" : "MINUS SAVOL!"}
                  </div>
                  <p className="qg-special-desc">
                    {activeCellData?.type === "bonus"
                      ? `To'g'ri javob bersangiz ${activeCell.pts * 2} BALL olasiz!`
                      : `Noto'g'ri javob bersangiz −${Math.floor(activeCell.pts / 2)} ball ayriladi!`}
                  </p>
                  <button
                    className={activeCellData?.type === "bonus" ? "primary-button" : "danger-button"}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={() => setSpecialPhase(false)}
                  >
                    <Eye size={16} /> Savolni ko'rish
                  </button>
                </div>
              ) : (
                <>
                  {/* Question */}
                  <div className="qg-question">{activeCellData?.q}</div>

                  {!showAnswer ? (
                    <button
                      className="primary-button"
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      onClick={() => setShowAnswer(true)}
                    >
                      <Eye size={16} /> Javobni ko'rish
                    </button>
                  ) : (
                    <>
                      <div className="qg-answer">{activeCellData?.a}</div>

                      {resultEffect === null ? (
                        <>
                          <div className="qg-verdict-row">
                            <button className="primary-button qg-correct-btn" onClick={() => handleResult(true)}>
                              <Check size={18} /> To'g'ri
                            </button>
                            <button className="danger-button qg-incorrect-btn" onClick={() => handleResult(false)}>
                              <X size={18} /> Noto'g'ri
                            </button>
                          </div>
                          <button className="secondary-button qg-skip-btn" onClick={skipCell}>
                            O'tkazib yuborish
                          </button>
                        </>
                      ) : (
                        <div className={`qg-result-effect ${resultEffect.type}`}>
                          {resultEffect.type === "correct"
                            ? <><Check size={30} /> +{resultEffect.delta} BALL</>
                            : <><X size={30} /> {resultEffect.delta !== 0 ? `${resultEffect.delta} BALL` : "Ball qo'shilmadi"}</>}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
