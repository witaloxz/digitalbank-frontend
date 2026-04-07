# 💳 BankDash Frontend

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue.svg)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 About the Project

A modern and responsive interface for BankDash, a complete digital bank. It provides an interactive dashboard, transfers, card management, loans, and much more.

### 🎯 Objective

Demonstrate frontend development skills using React, TypeScript, and TailwindCSS, following UI/UX best practices.

---

## ✨ Features

### 🔐 Authentication
- Login and registration
- Route protection
- Session management (JWT)

### 📊 Dashboard
- Cards with balance, income, and expenses
- Interactive charts (Recharts)
- Weekly activity
- Expense statistics
- Balance history
- Quick transfer

### 💸 Transfers
- Via account number
- Via Pix key
- Receipt (PDF/Image)
- Transfer history

### 📝 Bank Statement
- Transaction listing
- Filters by type/date
- Statement export

### 💳 Cards
- Card listing
- Virtual card creation
- Block/remove
- Spending by category
- Card transactions

### 📊 Loans
- Loan request
- Installment calculation
- Active loans listing
- Installment payment (boleto)

### 🛡️ Life Insurance
- Insurance request
- Status tracking

### 🔔 Notifications
- Real-time notifications (WebSocket)
- Mark as read
- Unread counter

### 👤 Profile
- Edit personal data
- Change password
- Preferences (language, notifications)
- Pix keys

### 👑 Admin
- Dashboard with statistics
- User management
- Transaction management
- Loan management
- Insurance management
- System settings

---

## 🛠️ Technologies

| Technology | Version | Purpose |
|------------|--------|------------|
| React | 18 | UI library |
| TypeScript | 5.0 | Static typing |
| Vite | 5.0 | Build tool |
| TailwindCSS | 3.4 | Styling |
| React Router DOM | 6.22 | Routing |
| TanStack Query | 5.0 | State management |
| Recharts | 2.12 | Charts |
| Framer Motion | 11.0 | Animations |
| i18next | 23.0 | Internationalization |
| Axios | 1.6 | HTTP requests |
| Zod | 3.22 | Form validation |
| React Hook Form | 7.48 | Forms |
| Sonner | 1.4 | Toasts |
| STOMP/WebSocket | - | Real-time notifications |

---

## 📁 Project Structure

```
src/
├── components/
├── context/
├── hooks/
├── lib/
├── pages/
├── services/
├── utils/
└── i18n/
```

---

## 🚀 How to Run

### Requirements
- Node.js 20+
- npm or yarn

### Installation

```bash
git clone https://github.com/witaloxz/digitalbank-frontend.git
cd digitalbank-frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔧 Environment Variables

```env
VITE_API_URL=http://localhost:8080
VITE_API_URL=https://digitalbank-backend.onrender.com
```

---

## 🌐 Deploy (Vercel)

- Connect repository
- Set VITE_API_URL
- Auto deploy on push

vercel.json:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 📱 Responsiveness

- Desktop
- Tablet
- Mobile

---

## 🧪 Tests

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

---

## 📦 Scripts

| Command | Description |
|--------|------------|
| npm run dev | Development |
| npm run build | Production build |
| npm run preview | Preview |
| npm run lint | Lint |
| npm run test | Tests |

---

## 🔗 Links

- Frontend: https://digitalbank-frontend.vercel.app
- Backend: https://digitalbank-backend.onrender.com
- Swagger: https://digitalbank-backend.onrender.com/swagger-ui.html

---

## 📄 License

MIT © Witalo Dias Santos
