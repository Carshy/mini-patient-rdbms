# mini-patient-rdbms

A minimal demo application that includes a tiny in-memory RDBMS, an Express backend wired to that RDBMS, and a React + Tailwind frontend UI for managing patients, doctors and appointments.

This README explains how the pieces fit together and how to run the app locally.

**Important:** The RDBMS is in-memory. All data lives in RAM and is lost when processes stop or restart. After any restart, recreate the tables and seed data (instructions below).

**Project layout (important folders):**
- **`rdbms/`**: in-memory relational engine implementation (tables, storage, parser, engines).
- **`backend/`**: Express server that talks to the in-memory RDBMS.
- **`frontend/`**: React + Tailwind UI.

**What this project provides**
- A simple in-memory relational engine you can interact with via a REPL or the backend.
- An Express API connected to the RDBMS for CRUD operations.
- A React UI that performs CRUD on patients, doctors, and appointments.

Getting started
---------------

Prerequisites
- Node.js (v16+ recommended)

Quick start (recommended order)

1) Run the in-memory RDBMS/demo (optional)
- From the project root you can run a demo that creates temporary data and then clears it:

```bash
cd rdbms
npm install
npm run demo
```

2) Start the RDBMS REPL (creates persistent-in-session tables)
- The REPL will create the three tables (`patients`, `doctors`, `appointments`) for interactive use. This is a good way to explore the RDBMS directly.

```bash
cd rdbms
npm install
npm run repl
```

3) Start the backend server and seed the database
- Open a new terminal, navigate to the `backend` folder, install dependencies, and start the server. Then run the seed script to create the three tables and add sample data.

```bash
cd backend
npm install
npm start        # starts the Express server
npm run seed     # creates tables and seeds sample data (patients, doctors, appointments)
```

Note: If you killed or restarted the backend process, you must run `npm start` and then `npm run seed` again because data is stored only in memory.

4) Start the frontend
- In a new terminal, navigate to the `frontend` folder, install dependencies, and start the Vite dev server.

```bash
cd frontend
npm install
npm run dev
```

- Open the app in your browser at: http://localhost:5173

What you can do in the app
- View a Dashboard with summary info.
- Perform full CRUD on `patients`, `doctors`, and `appointments` from the UI.

Key npm scripts (summary)
- In `rdbms/`:
   - `npm run demo` : run a demo script that creates and then clears demo data.
   - `npm run repl` : start the interactive REPL; this will create the three tables in memory.
- In `backend/`:
   - `npm start` : start the Express API server connected to the in-memory RDBMS.
   - `npm run seed` : run the seed script that creates the `patients`, `doctors`, and `appointments` tables and inserts sample records.
- In `frontend/`:
   - `npm run dev` : start the Vite dev server for the React + Tailwind frontend (default port 5173).

Notes about persistence and development workflow
------------------------------------------------
- This project uses an in-memory RDBMS: data is stored in RAM only. When the server stops or the process is restarted, all data is lost.
- After any restart you must:
   1. Start the backend server (`cd backend && npm start`).
 2. Create/seed the tables again (`cd backend && npm run seed`) or start the RDBMS REPL (`cd rdbms && npm run repl`) which creates the tables.
- If you want to play with data without manually re-seeding each time, consider modifying the project to persist to disk (not included in this demo).

Developer tips
--------------
- Use the `rdbms` REPL to try SQL statements directly and observe how the in-memory engine works.
- The backend is a thin Express layer exposing the RDBMS operations as HTTP endpoints; you can inspect `backend/routes/` to see the API routes.
- The frontend uses `src/services/api.js` to call the backend API.

Acknowledgements & next steps
-----------------------------
- This project is a teaching demo of an in-memory RDBMS + full-stack UI. If you'd like, I can:
   - add a scripts section to the root `package.json` to orchestrate starting all parts, or
   - add a small Docker compose file (with a node process) for easier runs, or
   - add a persistence layer to save data to disk.

If you want any of those changes, tell me which and I can implement them.

---
Updated README to include setup, run steps, and clear notes about in-memory data.

After completing the RDBMS here's how the trivial web application is built:

### Backend (Express.js)
1. Created REST API endpoints
2. Initialized database on server start

### Frontend (React)
1. Patient list and detail views
2. Doctor management interface
3. Appointment scheduling
4. Forms with validation
5. Search and filtering

### Integration
1. Connect frontend to backend
2. Display data in tables/cards
3. Handle CRUD operations

## 📝 License

MIT License - Free to use for your interview and projects!

---

## 🙏 Credits

Built entirely from scratch as a technical interview challenge. No external database libraries or ORMs used - just pure JavaScript and Node.js built-in modules.

**Thank you for going through my project** 🚀