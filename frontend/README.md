# Prelegal frontend

Next.js (App Router) app for Prelegal's document creators. Currently ships a
prototype Mutual NDA creator ([SCRUM-5](https://robbywh.atlassian.net/browse/SCRUM-5)):
fill in a form and download a completed Mutual NDA based on the
[Common Paper Mutual NDA, Version 1.0](https://commonpaper.com/standards/mutual-nda/1.0/)
(the same template in [`../templates/mutual-nda.md`](../templates/mutual-nda.md) and
[`../templates/mutual-nda-coverpage.md`](../templates/mutual-nda-coverpage.md)).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/page.tsx` — renders the Mutual NDA creator.
- `components/mutual-nda-creator.tsx` — form + live preview + download.
- `lib/mutual-nda.ts` — form data model, Standard Terms clause text, and the
  plain-text document builder used for the downloaded file.
