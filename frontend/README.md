# Pipeline Frontend

React + TypeScript + Tailwind CSS frontend for the Pipeline audio processing application.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` with CORS enabled

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── client.ts          # API client (all HTTP calls)
├── types/
│   └── api.ts             # TypeScript types matching backend
├── components/
│   ├── Dashboard.tsx       # Session list view
│   ├── SessionDetail.tsx   # Individual session view
│   ├── AudioUpload.tsx    # Upload form component
│   ├── Chat.tsx           # Q&A chat interface
│   └── common/            # Reusable UI components
├── hooks/
│   ├── useSessions.ts     # Fetch sessions list
│   ├── useSession.ts      # Fetch single session
│   ├── useAudioUpload.ts  # Handle audio upload
│   └── useChat.ts         # Handle Q&A chat
├── utils/
│   └── constants.ts       # API base URL, endpoints
├── App.tsx                # Main app component with routing
└── main.tsx               # Entry point
```

## Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Backend Requirements

Ensure your backend has:

1. CORS enabled for `http://localhost:5173`
2. `GET /sessions` endpoint
3. `GET /sessions/{id}` endpoint
4. `POST /ingest_audio` endpoint (accepts multipart/form-data with field "file")
5. `POST /ask` endpoint (accepts FormData with field "query")

See `API_CONTRACT.md` for detailed API specifications.

