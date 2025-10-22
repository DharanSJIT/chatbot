# Chatbot Backend

Express.js backend for AstraDB integration.

## Setup

```bash
cd backend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Messages  
- `POST /api/messages` - Save message
- `GET /api/messages/:userId` - Get user messages

## Environment Variables

```
PORT=3001
ASTRA_DB_APPLICATION_TOKEN=your_token
ASTRA_DB_API_ENDPOINT=your_endpoint
```

## Deployment

Ready for deployment to:
- Vercel
- Railway
- Render
- Heroku