# DSA Visual — Server Guidelines

## Structure
```
server/
  index.js         — Express entry point (compression, helmet, static serving)
  config/
    db.js          — MongoDB connection via Mongoose
  models/
    Visualization.js   — Saved visualization states
    AlgorithmMeta.js   — Algorithm metadata and complexity info
  routes/
    visualizations.js  — CRUD for saved visualizations
    algorithms.js      — GET algorithm metadata
```

## Commands
```bash
npm run dev    # Start with --watch (auto-restart on changes)
npm start      # Production start
```

## Environment Variables
Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsa-visual
NODE_ENV=development
```

## Conventions
- **ES Modules** (`"type": "module"` in package.json)
- Express with `compression` + `helmet` middleware
- Mongoose for MongoDB — use lean queries where possible
- Index frequently queried fields in models
- In production, serve the client `dist/` folder as static files
- All API routes prefixed with `/api`
- Use proper HTTP status codes and JSON error responses
