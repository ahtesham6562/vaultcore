<div align="center">

# 🏦 VaultCore — Neo-Bank Infrastructure

> Internship Project | Full-Stack Banking Simulation

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)

A full-stack Neo-Bank simulation built during a 4-week internship — featuring double-entry ledger, stock trading, fraud detection, and audit compliance.

</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, JWT |
| **Database** | PostgreSQL, Flyway, Hibernate |
| **Frontend** | React 19, Recharts, Vite |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## ✅ Features

### Week 1 — Security & Ledger
- 🔐 Immutable double-entry ledger with PostgreSQL triggers
- 🔑 JWT + Refresh Token authentication
- 🛡️ Spring Security with `STATELESS` sessions
- 🖥️ React Login / Register page

### Week 2 — Transaction Engine
- ⚙️ `@Transactional(isolation = SERIALIZABLE)` transfers
- 🧵 100-thread concurrency tested
- 💸 Send Money multi-step wizard
- 📡 Real-time balance API

### Week 3 — Trading & APIs
- 📈 Mock Stock API — 8 NSE stocks with ±2% live fluctuation
- 🛒 Buy / Sell stocks with portfolio tracking
- 📊 Recharts bar + pie chart dashboard
- ⚡ Latency under 300ms ✓

### Week 4 — Audit & Compliance
- 🔍 AspectJ AOP audit logging
- 📄 PDF monthly statements via iText
- 🚨 Fraud detection — 2FA trigger on ₹50,000+
- 🚀 Java 21 Virtual Threads for Balance API

---

## 🚀 Quick Start

### Run with Docker

```bash
docker-compose up --build
```

Then open:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Health Check | http://localhost:8080/actuator/health |

---

## 📁 Project Structure

```
vaultcore/
├── backend/          # Spring Boot REST API
├── frontend/         # React 19 SPA (Vite)
└── docker-compose.yml
```

---

## 🔒 Security

| Protection | Implementation |
|------------|----------------|
| SQL Injection | JPA / Hibernate parameterized queries |
| XSS | Spring Security response headers |
| Fraud Detection | 2FA trigger on high-value transactions |
| Audit Trail | AspectJ AOP logging on all sensitive ops |

> ⚠️ OWASP ZAP scan recommended before production deployment.

---

## 📬 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `GET` | `/api/balance` | Fetch real-time balance |
| `POST` | `/api/transfer` | Transfer funds |
| `GET` | `/api/stocks` | List NSE stocks |
| `POST` | `/api/stocks/buy` | Buy stock |
| `POST` | `/api/stocks/sell` | Sell stock |
| `GET` | `/api/statements/pdf` | Download PDF statement |

---

<div align="center">
  <sub>Built with ❤️ during a 4-week internship · VaultCore © 2025</sub>
</div>