export const TOPICS_DATA = [
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

export const TOPICS_DATA_RU = [
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
