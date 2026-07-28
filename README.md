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
- Pyramid **color** = vs Expected (On track / 1 behind / 2+ behind), so juniors with lower Expected are judged fairly
- Absolute skill (weighted Actual → L0–L3) is still shown in the person detail panel
- Equal-third absolute bands: **L0 &lt; 1**, **L1 [1, 1.67)**, **L2 [1.67, 2.33)**, **L3 [2.33, 3]**
- Click a person for Expected / Actual detail and to change their pyramid role

## Excel layout expected

| Competency | Sub_Competency | Weightage | Person A | | | Person B | ... |
|---|---|---|---|---|---|---|---|
| | | | Expected | Self (ignored) | Actual | Expected | ... |

People names sit in row 1 after Weightage, every 3 columns.
