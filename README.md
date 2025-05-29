# IT Agent Desktop App

A cross-platform desktop IT support application built with Electron and React.

## Features

- LLM-powered chatbot for IT support
- Native installation on macOS and Windows
- Employee lookup via CSV
- Structured issue navigation
- Script execution capabilities
- Modern, clean UI with avatars
- Local knowledge base integration

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run electron:dev
```

3. Build for production:
```bash
npm run electron:build
```

## Project Structure

- `/electron` - Electron main process code
- `/src` - React application source code
- `/public` - Static assets
- `/dist` - Built application
- `/release` - Packaged applications for distribution

## Tech Stack

- Electron
- React
- Vite
- Node.js

## License

MIT 