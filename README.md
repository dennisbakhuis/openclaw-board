# OpenClaw Board

A Kanban board where **tickets are markdown files** and **columns are folders on disk**.

Built with Next.js 15, TypeScript, Tailwind CSS, dnd-kit, and gray-matter.

## Features

- 📋 4-column Kanban: **Todo → In Progress → Review → Done**
- 🗂️ Tickets stored as Markdown files with YAML frontmatter
- 🖱️ Drag-and-drop between columns (powered by dnd-kit)
- 🌑 Dark theme throughout
- ⚡ Next.js 15 App Router, server components for data fetching

## Ticket format

```markdown
---
id: ticket-123456789
title: My ticket
priority: medium        # low | medium | high
labels: [bug, urgent]
created: 2026-03-14T20:00:00Z
---

Ticket body / description goes here.
```

Tickets live in:

```
tickets/
  todo/
  in-progress/
  review/
  done/
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Docker

### Single container

```bash
docker build -t openclaw-board .
docker run -p 3000:3000 -v $(pwd)/tickets:/data/tickets openclaw-board
```

### Docker Compose

```bash
docker compose up
```

Tickets are persisted in the `./tickets` folder on the host via a bind mount.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Get ticket |
| PUT | `/api/tickets/:id` | Update ticket |
| PATCH | `/api/tickets/:id` | Move to column |
| DELETE | `/api/tickets/:id` | Delete ticket |
