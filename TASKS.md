# TASKS — Wokeflow AI Communication Assistant
**อัพเดทล่าสุด:** 21 เมษายน 2569  
**Pilot:** Chatrium Rawai Phuket | **URL:** https://ai.wokeflow.net

---

## ✅ Done — Tier A (Feature Complete)

- [x] **A1** Draft History — sidebar บันทึก 30 drafts ล่าสุด, click reload ได้
- [x] **A2** Outlook Deep-link — "Open in Outlook ↗" 1 คลิก
- [x] **A3** Template Library — 8 templates, modal filter ตาม task type
- [x] **A4** Regenerate Variants — Shorter/Warmer/More formal/Custom + switcher v1 v2 v3
- [x] **A5** Multi-language Output — EN / 中文 / 日本語 / 한국어 / ไทย
- [x] Sprint 1a — Cost tracking + monthly ceiling (฿50/user/month)
- [x] Sprint 1b — Magic-link auth + route protection middleware
- [x] Sprint 1c — "Powered by Wokeflow" branding in sidebar
- [x] Deploy scripts — `new-customer.sh`, `update-customer.sh`, `list-customers.sh`
- [x] Product Bible — `PRODUCT_BIBLE.md` + `PRODUCT_BIBLE.docx`

---

## 🔵 Active — Tier B (ถัดไป)

- [ ] **B1** Brand Voice Score — คะแนน 0–100 ต่อ draft (MARCOM KPI)
- [ ] **B4** Analytics Dashboard — ขยาย /admin/usage ให้ GM มี data ตัดสินใจ
- [ ] **B2** Recipient Memory — จำ context ลูกค้า repeat guest
- [ ] **B3** Team Review Workflow — FO draft → GM approve
- [ ] **B5** Mobile-responsive layout

---

## 🟡 Pending — Business / Operational

- [ ] **D-1** Pricing final — รอ pilot feedback เดือน 1
- [ ] **D-2** Anthropic billing corporate card — Sakchai
- [ ] **D-3** Brand voice MARCOM sign-off — Richard Mehr
- [ ] **D-4** Pilot user list 30 คน — Richard Mehr
- [ ] **D-5** Subdomain final (ai.chatrium.com vs ai.wokeflow.net) — Sakchai + IT
- [ ] Staff training session — Chatrium Rawai (วันที่ยังไม่กำหนด)
- [ ] Wokeflow Master Admin panel — dashboard เห็นทุก customer instance

---

## 🔮 Someday — Tier C / D

- [ ] **C1** PMS Integration (Opera/Protel) — auto-pull guest data
- [ ] **C2** M365 SSO + Outlook Native Add-in (Phase 4 roadmap)
- [ ] **C3** Wokeflow Master Admin — subscription gate, central billing
- [ ] **C4** White-label per property (โลโก้/สีของโรงแรมเอง)
- [ ] Guest Review Response AI (Booking.com, Agoda, Google)
- [ ] Marketing Copy AI (Newsletter, Social)
- [ ] Cross-property HQ Dashboard

---

## 📋 Info

| รายการ | รายละเอียด |
|---|---|
| VPS | srv1467971 (KVM2 — 2vCPU/8GB/100GB) |
| Capacity | ~5–6 customers (ปัจจุบัน 1) |
| Image | ghcr.io/enimdee/chatrium-ai:latest |
| Repo | github.com/enimdee/chatrium-ai |
| CI/CD | GitHub Actions → push main → deploy อัตโนมัติ |
| AI Model | Claude Sonnet 4.6 + prompt caching |
| Auth | Magic-link (custom JWT) |
| Contacts | Sakchai (Product), Richard Mehr (Pilot), Anuwat (Infra) |
