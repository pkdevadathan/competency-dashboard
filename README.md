# OFH Competency Dashboard

Interactive team competency pyramid built with **React + TypeScript + Vite**.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What it does

- Loads the sample workbook from `public/data/OFH_Competancy.xlsm` (sheet `OFH_Competancy`)
- Or upload your own `.xlsx` / `.xlsm` with the same layout
- Computes a **weighted average** from each person's **Actual** scores using the **Weightage** column (`sum(score × weight) / sum(weight)`, where L1=1, L2=2, L3=3)
- Ignores **Self Score** completely
- Maps the average (1–3) to **L1 (red) / L2 (amber) / L3 (green)** and colors the pyramid
- Click a person for Expected / Actual detail and to change their pyramid role

## Excel layout expected

| Competency | Sub_Competency | Weightage | Person A | | | Person B | ... |
|---|---|---|---|---|---|---|---|
| | | | Expected | Self (ignored) | Actual | Expected | ... |

People names sit in row 1 after Weightage, every 3 columns.
