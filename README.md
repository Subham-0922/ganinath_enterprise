<<<<<<< HEAD
# ganinath_enterprise
Client Application
=======
# React + Vite

# 🚀 How to Run the Software

Follow the steps below to run the software on your computer.

## 1. 📦 Install Dependencies

**Run this command only the first time** after downloading/cloning the project:

```bash
npm i
```

This installs all the required dependencies.

---

## 2. 🌐 Run in Browser

To run the application only in the browser:

```bash
npm run dev
```

After running the command, open the URL shown in the terminal (usually something like `http://localhost:5173`).

---

## 3. 💻 Run the Software with Electron

If you want to run the application as the **desktop software** using Electron, you need to run **both commands one by one**.

### Step 1 — Start the Development Server

```bash
npm run dev
```

Keep this terminal running.

### Step 2 — Start Electron

Open a **new terminal** in the same project folder and run:

```bash
npm run electron
```

Electron will then open the application as a desktop window.

---

## 📌 Quick Reference

| What you want        | Command                                 |
| -------------------- | --------------------------------------- |
| Install dependencies | `npm i`                                 |
| Run in browser       | `npm run dev`                           |
| Run desktop software | `npm run dev` → then `npm run electron` |

### ⚠️ Important

* `npm i` is required **only the first time**.
* For the **browser**, run only `npm run dev`.
* For the **desktop/Electron version**, run:

  1. `npm run dev`
  2. Open a new terminal
  3. `npm run electron`
* Do **not** close the terminal running `npm run dev` while using Electron.

---

## 🛑 Stopping the Software

To stop a running command, press:

```text
Ctrl + C
```

in the terminal.
