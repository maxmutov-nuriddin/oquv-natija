import { useMemo, useState } from "react";
import { ArrowLeft, Check, Play, RefreshCw, Trophy, Users, X, Eye, ChevronRight } from "lucide-react";

// ─── Questions: 4 per level per topic (for up to 4 teams) ────────────────────
const TOPICS_DATA = [
  {
    id: "html", name: "HTML asoslari", icon: "🌐",
    color: "#58cc02", colorDark: "#46a302",
    questions: {
      100: [
        { q: "HTML ning to'liq nomi nima?", a: "HyperText Markup Language" },
        { q: "Sarlavha uchun qaysi teglar ishlatiladi?", a: "<h1> dan <h6> gacha — 6 ta sarlavha tegi bor" },
        { q: "HTML da ro'yxat elementi uchun qaysi teg?", a: "<li> — list item. <ul> tartibsiz, <ol> tartibli ro'yxat" },
        { q: "HTML da izoh (comment) qanday yoziladi?", a: "<!-- bu izoh -->" },
      ],
      200: [
        { q: "<strong> va <em> teglari qanday farqlanadi?", a: "<strong> qalin (bold), <em> kursiv (italic) matn ko'rsatadi" },
        { q: "<a> tegining href va target='_blank' nima?", a: "href — havola manzili. target='_blank' — yangi tabda ochadi" },
        { q: "id va class atributlarining asosiy farqi?", a: "id — yagona (bitta element), class — ko'p elementga berilishi mumkin" },
        { q: "<div> va <span> qanday farqlanadi?", a: "<div> — block (qatorni egallaydi), <span> — inline (ichida joylashadi)" },
      ],
      300: [
        { q: "HTML da rasm qo'shish uchun teg va atributlar?", a: "<img src='...' alt='...'> — src manba yo'li, alt tavsif matni" },
        { q: "HTML forma elementlari qaysilar? (4 ta)", a: "<form>, <input>, <button>, <select>, <textarea>, <label>" },
        { q: "Semantik HTML teglari nima? 4 misol bering.", a: "Sahifa ma'nosi uchun: <header>, <main>, <footer>, <article>, <section>, <nav>" },
        { q: "<table> elementining asosiy teglari?", a: "<table>, <tr> — satr, <th> — sarlavha katak, <td> — ma'lumot katak" },
      ],
      400: [
        { q: "HTML formasida POST va GET metodlari qanday farqlanadi?", a: "GET — URL da ko'rinadi, qidiruv uchun. POST — body da yashirin, login/forma uchun" },
        { q: "Viewport meta tegi nima uchun kerak?", a: "Mobil qurilmalarda to'g'ri ko'rinish uchun: <meta name='viewport' content='width=device-width'>" },
        { q: "input type'larini nomlang — kamida 5 ta", a: "text, password, email, number, checkbox, radio, file, submit, date, tel, range" },
        { q: "Accessibility uchun qanday atributlar ishlatiladi?", a: "alt (rasm), aria-label, role, tabindex, for+id (label bog'lash)" },
      ],
      500: [
        { q: "HTML5 da yangi semantic teglar va ularning farqi?", a: "<article> mustaqil kontent, <section> bo'lim, <aside> qo'shimcha, <figure> media — hep semantic ma'no beradi" },
        { q: "data-* atributlari nima va qachon ishlatiladi?", a: "Custom ma'lumot saqlash: data-id='5'. JS da element.dataset.id bilan o'qiladi" },
        { q: "localStorage, sessionStorage va cookie farqlari?", a: "localStorage — doimiy saqlanadi. sessionStorage — tab yopilganda o'chadi. Cookie — server bilan almashiladi, muddati bor" },
        { q: "iframe nima va qanday xavfligi bor?", a: "Boshqa sahifani ichiga yuklaydi. XSS va clickjacking xavfi bor, sandbox atributi himoyalaydi" },
      ],
    },
  },
  {
    id: "css", name: "CSS asoslari", icon: "🎨",
    color: "#1cb0f6", colorDark: "#1899d6",
    questions: {
      100: [
        { q: "CSS da rang belgilashning 3 usuli?", a: "Nom (red), HEX (#ff0000), RGB (rgb(255,0,0))" },
        { q: "Elementni ko'rinmas qilish uchun qaysi property?", a: "display: none — joyni ham olmaydi. visibility: hidden — joy qoladi" },
        { q: "Font o'lchamini belgilovchi CSS property?", a: "font-size: 16px yoki font-size: 1rem" },
        { q: "CSS selektor turlarini ayting — 3 ta", a: "Element (div), class (.box), id (#header), attribute ([type='text']), pseudo (:hover)" },
      ],
      200: [
        { q: "display: flex va display: block farqi?", a: "Flex — elementlarni bir qatorda joylashtiradi. Block — qatorni to'liq egallaydi" },
        { q: "Box Model qaysi 4 qismdan iborat?", a: "Content → Padding (ichki bo'shliq) → Border (chegara) → Margin (tashqi bo'shliq)" },
        { q: "justify-content va align-items nima qiladi?", a: "justify-content — asosiy o'q (gorizontal), align-items — ko'ndalang o'q (vertikal) tekislaydi" },
        { q: "margin: 10px 20px 30px 40px — har qiymat?", a: "Soat bo'ylab: top=10, right=20, bottom=30, left=40" },
      ],
      300: [
        { q: "position: relative, absolute, fixed farqlari?", a: "Relative — o'z joyidan siljiydi. Absolute — positioned otaga nisbatan. Fixed — oynaga nisbatan (scroll da qoladi)" },
        { q: "CSS transition nima va qanday yoziladi?", a: "O'zgarishni silliq animatsiya qiladi: transition: property duration timing. Masalan: transition: all 0.3s ease" },
        { q: "Flexbox da flex: 1 nima anglatadi?", a: "flex-grow: 1, flex-shrink: 1, flex-basis: 0 — element bo'sh joyni to'liq oladi" },
        { q: "z-index qachon ta'sir qilmaydi?", a: "Faqat position: static BO'LMAGAN elementlarga ta'sir qiladi (relative, absolute, fixed, sticky)" },
      ],
      400: [
        { q: "CSS specificity (ustuvorlik) hisoblanish tartibi?", a: "!important > Inline > ID (#) > Class/pseudo (.) > Element tegi. 0,1,0,0 formatida hisoblanadi" },
        { q: "CSS media query nima va qanday yoziladi?", a: "@media (max-width: 768px) { ... } — ekran o'lchamiga qarab stil o'zgartiradi" },
        { q: "CSS Grid va Flexbox asosiy farqi?", a: "Flexbox — 1 o'lchamli (qator YOKI ustun). Grid — 2 o'lchamli (qator VA ustun bir vaqtda)" },
        { q: "CSS custom properties (variables) qanday ishlaydi?", a: ":root { --color: red; } deb e'lon, color: var(--color) bilan ishlatiladi. Kaskadlanadi" },
      ],
      500: [
        { q: "CSS animation va transition farqi?", a: "Transition — 2 holat orasida silliq o'tish. Animation — @keyframes bilan murakkab, bir necha bosqichli animatsiya" },
        { q: "BEM metodologiyasi nima?", a: "Block__Element--Modifier — komponent, uning elementi va holati nomini ketma-ket belgilash usuli. Misol: .card__title--large" },
        { q: "Repaint va reflow farqi va oldini olish?", a: "Reflow — layout qayta hisoblash (juda og'ir). Repaint — rang qayta chizish. CSS transform/opacity ishlatish samaraliroq" },
        { q: "CSS :root nima va nima uchun ishlatiladi?", a: ":root — HTML hujjatining eng yuqori elementi. Global CSS o'zgaruvchilarni e'lon qilish uchun ishlatiladi" },
      ],
    },
  },
  {
    id: "js", name: "JavaScript", icon: "⚡",
    color: "#ffc800", colorDark: "#e5b400",
    questions: {
      100: [
        { q: "var, let, const farqlari nima?", a: "var — function scope, ko'tariladi. let/const — block scope. const — o'zgarmas qiymat" },
        { q: "🧮 Mini: typeof 42 nima chiqaradi?", a: "\"number\"" },
        { q: "JavaScript da boolean qiymatlar qaysilar?", a: "true va false — faqat 2 ta boolean qiymat mavjud" },
        { q: "🧮 Mini: [1, 2, 3].length = ?", a: "3" },
      ],
      200: [
        { q: "=== va == operatorlar farqi?", a: "=== qat'iy — tur VA qiymat. == — faqat qiymat, tur o'zgartirilishi mumkin (0 == false → true)" },
        { q: "🧮 Mini: Math.max(3, 7, 2) = ?", a: "7" },
        { q: "Funksiya e'lon qilishning 2 usuli?", a: "function foo(){} — declaration. const foo = () => {} — arrow funksiya (expression)" },
        { q: "🧮 Mini: 'hello'.toUpperCase() = ?", a: "\"HELLO\"" },
      ],
      300: [
        { q: "map(), filter(), reduce() nima qiladi?", a: "map — har elementni o'zgartiradi. filter — shartga moslarni tanlaydi. reduce — bitta qiymatga qisqartiradi" },
        { q: "🧮 Mini: [1,2,3].filter(x => x > 1) = ?", a: "[2, 3]" },
        { q: "Closure (yopilma) nima?", a: "Ichki funksiya tashqi funksiyaning o'zgaruvchilariga kirish huquqiga ega bo'lishi. Funksiya yaratilgan muhitni «eslaydi»" },
        { q: "🧮 Mini: ['a','b','c'].indexOf('b') = ?", a: "1 (index 0 dan boshlanadi)" },
      ],
      400: [
        { q: "Promise nima? async/await bilan qanday ishlaydi?", a: "Promise — asinxron amal natijasi (pending/fulfilled/rejected). async/await — sinxron uslubda yozishga imkon beradi" },
        { q: "🧮 Mini: [1,2,3].map(x => x*2) = ?", a: "[2, 4, 6]" },
        { q: "Event bubbling vs capturing va stopPropagation?", a: "Bubbling — hodisa boladan otaga. Capturing — otadan bolaga. stopPropagation() — hodisaning keyingi elementlarga tarqalishini to'xtatadi" },
        { q: "Destrukturizatsiya (destructuring) nima?", a: "const {a,b} = obj; yoki const [x,y] = arr; — ob'ekt/massivdan qiymat chiqarish uchun" },
      ],
      500: [
        { q: "Prototype chain (prototip zanjiri) nima?", a: "Har obyekt prototipidan xususiyat meros oladi. obj.__proto__ bilan ko'rish mumkin. Null da tugaydi" },
        { q: "🧮 Mini: null == undefined va null === undefined?", a: "null == undefined → true (bo'sh tenglik). null === undefined → false (tur farq qiladi)" },
        { q: "null va undefined farqi?", a: "undefined — o'zgaruvchi e'lon qilingan, qiymat yo'q. null — ataylab bo'sh qiymat berilgan" },
        { q: "🧮 Mini: typeof null = ?", a: "\"object\" — bu JavaScript ning tarixiy xatosi, null aslida object emas" },
      ],
    },
  },
  {
    id: "it", name: "IT Terminlar", icon: "💻",
    color: "#ff4b4b", colorDark: "#ea2b2b",
    questions: {
      100: [
        { q: "API ning to'liq nomi nima?", a: "Application Programming Interface — dasturlar o'rtasida ma'lumot almashish interfeysi" },
        { q: "URL ning to'liq nomi?", a: "Uniform Resource Locator — internet da resurs manzili" },
        { q: "IDE nima?", a: "Integrated Development Environment — kod yozish muhiti (VSCode, WebStorm, IntelliJ)" },
        { q: "🧮 Mini: 8 bit = ? byte", a: "1 byte (8 bit = 1 byte)" },
      ],
      200: [
        { q: "Frontend va Backend farqi?", a: "Frontend — foydalanuvchi ko'radigan qism (brauzer). Backend — server, ma'lumotlar bazasi, biznes mantiq" },
        { q: "Git: commit, push, pull farqi?", a: "Commit — lokal saqlash. Push — serverga yuborish. Pull — serverdan tortib olish" },
        { q: "DNS nima?", a: "Domain Name System — domen nomini (google.com) IP manzilga (142.250.x.x) aylantiradi" },
        { q: "🧮 Mini: 1 KB = ? byte", a: "1024 byte" },
      ],
      300: [
        { q: "HTTP va HTTPS farqi? SSL/TLS nima?", a: "HTTPS — SSL/TLS shifrlash ishlatadi. Ma'lumotlar yo'lda o'qib bo'lmaydi. Parollar, bank ma'lumotlar himoyalangan" },
        { q: "REST API metodlari nima qiladi?", a: "GET — o'qish, POST — yaratish, PUT — to'liq yangilash, PATCH — qisman yangilash, DELETE — o'chirish" },
        { q: "JSON nima va qayerda ishlatiladi?", a: "JavaScript Object Notation — ma'lumot almashish formati. API larda serverdan klientga ma'lumot uzatishda" },
        { q: "🧮 Mini: Binary 1010 = o'nlik sanoqda necha?", a: "10 (1×8 + 0×4 + 1×2 + 0×1 = 10)" },
      ],
      400: [
        { q: "SQL va NoSQL farqi? Misollar keltiring.", a: "SQL — jadval asosida (MySQL, PostgreSQL). NoSQL — hujjat/kalit-qiymat asosida (MongoDB, Redis)" },
        { q: "Docker nima? Image va container farqi?", a: "Konteynerizatsiya platformasi. Image — qolip (blueprint). Container — ishlaydigan Image nusxasi. Izolyatsiyalashga imkon beradi" },
        { q: "OAuth nima va nima uchun ishlatiladi?", a: "Uchinchi tomon autentifikatsiyasi. 'Google bilan kirish' — parol bermay tizimga kirish imkoniyati" },
        { q: "🧮 Mini: 1 MB = ? KB", a: "1024 KB (va 1 GB = 1024 MB)" },
      ],
      500: [
        { q: "Microservices va monolithic arxitektura farqi?", a: "Monolith — bitta katta dastur. Microservices — kichik mustaqil xizmatlar, har biri alohida deploy bo'ladi" },
        { q: "CI/CD nima?", a: "Continuous Integration/Continuous Deployment — kod har commit da avtomatik test va deploy qilinadi. GitHub Actions misoli" },
        { q: "Big O notation: O(n) va O(n²) farqi?", a: "O(n) — chiziqli (elementlar soni bilan proporsional). O(n²) — kvadratik (ikki ichma-ich sikl). O(n) samaraliroq" },
        { q: "TCP va UDP farqi?", a: "TCP — ishonchli, tartibli uzatish (kafolatlangan yetkazib berish). UDP — tez, ishonchsiz (video, gaming, streaming)" },
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
      return { type: "question", used: false, q: q.q, a: q.a, topicIcon: q.topicIcon, topicColor: q.topicColor };
    });
  });

  // Place mystery cells (~12% of pts≥200 slots)
  const pool = [];
  POINT_VALUES.filter((p) => p >= 200).forEach((pts) =>
    board[pts].forEach((_, slot) => pool.push({ pts, slot }))
  );
  const sh2 = [...pool].sort(() => Math.random() - 0.5);
  const count = Math.max(2, Math.round(pool.length * 0.12));
  sh2.slice(0, count).forEach(({ pts, slot }, i) => {
    board[pts][slot].type = i < Math.ceil(count * 0.6) ? "bonus" : "minus";
  });

  return board;
}

// ─── SETUP (2 steps: teams → topics) ─────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [step,          setStep]          = useState(1);
  const [teamCount,     setTeamCount]     = useState(2);
  const [teamNames,     setTeamNames]     = useState(["1-Jamoa", "2-Jamoa", "3-Jamoa", "4-Jamoa"]);
  const [selectedTopics, setSelectedTopics] = useState([]);

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
    onStart(teams, selectedTopics);
  }

  return (
    <div className="qg-setup-wrap">
      <div className="panel qg-setup-card">
        {/* Header */}
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <span style={{ background: "var(--gold)", borderRadius: "var(--radius-sm)", padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={22} color="#fff" />
          </span>
          <div>
            <h3 style={{ margin: 0 }}>Quiz O'yini</h3>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
              {step === 1 ? "1-qadam: Jamoalar" : "2-qadam: Mavzular"}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="qg-setup-section">
              <label className="qg-setup-label">Jamoalar soni</label>
              <div className="qg-count-row">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className={`qg-count-btn ${teamCount === n ? "primary-button" : "secondary-button"}`}
                    onClick={() => setTeamCount(n)}
                  >
                    <Users size={15} /> {n} jamoa
                  </button>
                ))}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                Har ball darajasida <strong style={{ color: "var(--text)" }}>{teamCount} ta savol</strong> bo'ladi
              </p>
            </div>

            <div className="qg-setup-section">
              <label className="qg-setup-label">Jamoa nomlari</label>
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
              Mavzularni tanlash <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="qg-setup-section">
              <label className="qg-setup-label">
                Mavzularni tanlang — alohida-alohida
                {selectedTopics.length > 0 && (
                  <span style={{ marginLeft: 8, color: "var(--blue)", fontWeight: 800 }}>
                    {selectedTopics.length} ta tanlandi
                  </span>
                )}
              </label>
              <div className="qg-topic-select-grid">
                {TOPICS_DATA.map((topic) => {
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
                <ArrowLeft size={16} /> Orqaga
              </button>
              <button
                className="primary-button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                disabled={selectedTopics.length < 1}
                onClick={handleStart}
              >
                <Play size={18} /> O'yinni boshlash
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
export function QuizGamePage() {
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

  function handleStart(newTeams, selectedIds) {
    const tc = newTeams.length;
    const sel = selectedIds.map((id) => TOPICS_DATA.find((t) => t.id === id));
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

  if (phase === "setup") return <SetupScreen onStart={handleStart} />;
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
