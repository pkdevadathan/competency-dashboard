# OFH Competency Dashboard

Interactive team competency pyramid built with **React + TypeScript + Vite**. Also ships as a **desktop app** (Electron) you can zip and share — no Azure hosting or Entra login.

## Run locally (browser)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Desktop app (Windows only)

Share a Windows GUI with teammates — no Azure hosting or Entra login.

### Dev (Electron + Vite hot reload)

```bash
npm install
npm run electron:dev
```

### Build the Windows tool

You can run this from a Mac; it still produces Windows x64 artifacts:

```bash
npm run electron:build:win
```

Outputs under `release/`:

- `Team Pyramid-*-Windows-Portable.exe` — double-click, no install
- `Team Pyramid-*-Windows.zip` — unzip and run

Put that file on SharePoint / Teams. Stakeholders:

1. Download / unzip the app
2. Download the latest Excel from SharePoint (in the browser)
3. Open **Team Pyramid** → **Upload Excel** (or drag-drop the `.xlsm`)

> IT note: unsigned `.exe` may be blocked by SmartScreen / allowlists. Ask early if you need code signing or an IT-approved distribution path.

## What it does

- Loads the sample workbook from `public/data/OFH_Competancy.xlsm` (sheet `OFH_Competancy`)
- Or upload your own `.xlsx` / `.xlsm` with the same layout
- Computes a **weighted average** from each person's **Actual** scores using the **Weightage** column (`sum(score × weight) / sum(weight)`, where L1=1, L2=2, L3=3)
- Ignores **Self Score** completely
- Pyramid **color** = vs Expected (On track / 1 behind / 2+ behind), so juniors with lower Expected are judged fairly
- Absolute skill (weighted Actual → L0–L3) is still shown in the person detail panel
- Equal-third absolute bands: **L0 &lt; 1**, **L1 [1, 1.67)**, **L2 [1.67, 2.33)**, **L3 [2.33, 3]**
- Click a person for Expected / Actual detail and to change their pyramid role

## Excel layout expected

| Competency | Sub_Competency | Weightage | Person A | | | Person B | ... |
|---|---|---|---|---|---|---|---|
| | | | Expected | Self (ignored) | Actual | Expected | ... |

People names sit in row 1 after Weightage, every 3 columns.
