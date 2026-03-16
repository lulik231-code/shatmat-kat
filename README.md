# ♟️ שחמט לילדים — Chess Kids

אפליקציית שחמט לילדי גן בעברית עם מצב סולו ומצב אונליין בין תלמידים.

---

## 🚀 שלב 1: הגדרת Supabase (10 דקות)

### 1.1 צור פרויקט
1. כנס ל-[supabase.com](https://supabase.com) ← **New Project**
2. שם הפרויקט: `chess-kids`
3. בחר סיסמה חזקה ל-Database
4. בחר **Europe (Frankfurt)** או **Israel** לשרת קרוב

### 1.2 הרץ את הסכמה
1. ב-Dashboard ← **SQL Editor** ← **New Query**
2. העתק את כל התוכן מקובץ `supabase_schema.sql`
3. לחץ **Run** — תראה: `Success. No rows returned`

### 1.3 הפעל Realtime
1. ב-Dashboard ← **Database** ← **Replication**
2. מצא את הטבלאות: `games`, `presence`, `game_invites`
3. הפעל את ה-toggle ל-**Insert** ו-**Update** לכל אחת

### 1.4 קבל את המפתחות
1. ב-Dashboard ← **Settings** ← **API**
2. העתק:
   - **Project URL** (נראה כך: `https://xxxxx.supabase.co`)
   - **anon/public key** (מחרוזת ארוכה)

### 1.5 צור קובץ `.env`
ביצור הפרויקט, צור קובץ בשם `.env` בתיקיית הפרויקט:
```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

---

## 💻 שלב 2: הרצת הפרויקט

```bash
# התקן dependencies
npm install

# הרץ בסביבת פיתוח
npm start

# הפרויקט יפתח בכתובת: http://localhost:3000
```

---

## 👤 שלב 3: יצירת חשבון מנהל ראשי

1. פתח `http://localhost:3000/teacher/register`
2. הרשם עם האימייל: **lulik231@gmail.com**
3. הסיסמה שתבחר — זה חשבון Super Admin אוטומטי

---

## 🏫 שלב 4: הרשמת מורה (Flow מלא)

1. מורה נכנס ל-`/teacher/register` ← ממלא שם + אימייל + סיסמה
2. המורה מועבר למסך "ממתין לאישור"
3. **המנהל** (lulik231@gmail.com) נכנס ← `/admin` ← לוחץ ✅ אשר
4. המורה מתחבר ← `/login` ← מועבר ל-Dashboard

---

## 📱 שלב 5: הוספת תלמידים (Flow מלא)

1. המורה ב-Dashboard ← **+ כיתה חדשה** ← נותן שם ואימוג'י
2. **+ הוסף תלמיד** ← שם + אוואטר + (אופציונלי) אימייל הורה
3. בלוח הכיתה יופיע **🔗 קישור כניסה לתלמידים** — שלח להורים

### קישור תלמיד:
```
https://YOUR_DOMAIN/student/INVITE_CODE
```
הילד לוחץ על הפנים שלו — נכנס ישירות!

---

## 🎮 מבנה האפליקציה

```
/              → דף הבית (Solo / Online)
/solo          → שחק נגד רובוט
/login         → כניסת מורים
/teacher/register → הרשמת מורה
/teacher/waiting  → ממתין לאישור
/admin         → לוח מנהל ראשי
/teacher/dashboard → לוח המורה
/student/:code → כניסת תלמידים (ויזואלית)
/lobby         → לובי כיתה (מי מחובר)
/game/:id      → משחק אונליין
```

---

## 🏗️ מבנה הקבצים

```
src/
├── lib/
│   ├── supabase.js      # חיבור Supabase
│   └── store.js         # Zustand global state
├── components/
│   ├── Board/
│   │   ├── ChessBoard.jsx   # לוח השחמט המלא
│   │   ├── PlayerBar.jsx    # פס שחקן עם ניקוד
│   │   └── HourglassTimer.jsx # שעון חול אנימטיבי
│   └── UI/
│       ├── LoadingScreen.jsx
│       ├── BackButton.jsx
│       └── WinModal.jsx     # מסך ניצחון עם קונפטי
├── hooks/
│   ├── useBot.js        # לוגיקת הרובוט
│   └── useOnlineGame.js # Realtime sync
└── pages/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── TeacherRegister.jsx
    ├── WaitingApproval.jsx
    ├── SuperAdminDash.jsx
    ├── TeacherDash.jsx
    ├── StudentLogin.jsx    # בחירת אוואטר ויזואלית
    ├── LobbyPage.jsx       # לובי אונליין עם Presence
    ├── GamePage.jsx        # משחק אונליין Realtime
    └── SoloPage.jsx        # משחק vs רובוט
```

---

## 🔒 אבטחה — RLS

- **אימיילים לא נחשפים** — תלמידים לא יכולים לראות אימיילים של אחרים
- מורה רואה רק את הכיתות שלו
- תלמיד רואה רק חברי כיתתו
- Super Admin רואה הכל

---

## 🚀 פריסה לאינטרנט (Netlify — חינמי)

```bash
npm run build
# גרור את תיקיית build/ ל-netlify.com
```

הוסף ב-Netlify: **Environment Variables** ← אותם משתני סביבה מהקובץ `.env`

---

## 🔮 תוספות עתידיות

- [ ] מפת מסעות עם פאזלים
- [ ] הודעות קוליות בעברית (Web Speech API)
- [ ] התקדמות תלמיד + סטטיסטיקות למורה
- [ ] מצב צפייה למורה בזמן משחק
- [ ] לוח תוצאות כיתתי
