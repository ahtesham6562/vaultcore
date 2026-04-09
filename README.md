\# VaultCore — Neo-Bank Infrastructure



> Internship Project | Full-Stack Banking Simulation



\## Tech Stack

\- \*\*Backend:\*\* Java 21, Spring Boot 3.5, Spring Security, JWT

\- \*\*Database:\*\* PostgreSQL, Flyway, Hibernate

\- \*\*Frontend:\*\* React 19, Recharts, Vite

\- \*\*Infrastructure:\*\* Docker, Docker Compose, Nginx



\## Features



\### Week 1 — Security \& Ledger

\- Immutable double-entry ledger with PostgreSQL triggers

\- JWT + Refresh Token authentication

\- Spring Security with STATELESS sessions

\- React Login/Register page



\### Week 2 — Transaction Engine

\- `@Transactional(isolation = SERIALIZABLE)` transfers

\- 100-thread concurrency tested

\- Send Money multi-step wizard

\- Real-time balance API



\### Week 3 — Trading \& APIs

\- Mock Stock API — 8 NSE stocks with ±2% live fluctuation

\- Buy/Sell stocks with portfolio tracking

\- Recharts bar + pie chart dashboard

\- Latency under 300ms ✓



\### Week 4 — Audit \& Compliance

\- AspectJ AOP audit logging

\- PDF monthly statements via iText

\- Fraud detection — 2FA trigger on ₹50,000+

\- Java 21 Virtual Threads for Balance API



\## Quick Start



```bash

docker-compose up --build

```



Then open:

\- Frontend: http://localhost:3000

\- Backend: http://localhost:8080

\- Health: http://localhost:8080/actuator/health



\## Security

\- SQL Injection protected via JPA/Hibernate

\- XSS protection via Spring Security headers

\- OWASP ZAP scan recommended before production

