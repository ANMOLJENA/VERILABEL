# VeriLabel Frontend

React + Vite frontend for the VeriLabel medicine-label verification flow.

## Requirements

- Node.js 20+
- Backend API running locally

## Quick Start

1. Copy the env template.
   `copy .env.example .env` on Windows or `cp .env.example .env` on macOS/Linux
2. If your backend runs on the default port, you can keep `.env` as-is.
3. Install dependencies:
   `npm install`
4. Start the app:
   `npm run dev`

The frontend defaults to [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Environment

- `VITE_API_BASE_URL` points to the backend API.
- Default value: `http://127.0.0.1:5000`
- If the backend port changes, update `.env` to match.

## Handoff Notes

- `node_modules` should not be committed for handoff; reinstall with `npm install`.
- The project uses standard Vite scripts and should run on both Windows and macOS.
