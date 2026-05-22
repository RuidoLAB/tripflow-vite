# TripFlow ✈️

React + Vite · Supabase · Vercel

## Estructura

```
tripflow-vite/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   ├── supabase.js
│   │   └── budget.js
│   ├── hooks/
│   │   └── useAuth.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   └── components/
│       ├── Hero.jsx
│       ├── PrepaidCard.jsx
│       ├── StatsBar.jsx
│       ├── AddExpenseForm.jsx
│       ├── CategoryChart.jsx
│       ├── CityBreakdown.jsx
│       └── ExpenseList.jsx
└── supabase-schema.sql
```

## Variables de entorno en Vercel

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
