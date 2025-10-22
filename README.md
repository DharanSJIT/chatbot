# 🤖 AI Chatbot LLM

A modern, responsive AI chatbot application built with React and powered by LLaMA 3.1 model. Features real-time streaming responses, persistent chat history, and a sleek dark/light mode interface.

##  Features

- **🚀 Lightning-fast AI responses** powered by Groq LLaMA 3.1-8B
- **💬 Real-time streaming** with character-by-character typing animation
- **📱 Fully responsive design** optimized for desktop and mobile
- **🌙 Dark/Light mode** toggle for comfortable viewing
- **💾 Persistent chat history** with cloud storage via AstraDB
- **🔍 Search functionality** to find messages across conversations
- **📤 Export conversations** in Text, Markdown, or PDF formats
- **🔗 Share conversations** via links or email
- **👤 User authentication** with secure session management
- **🎨 Modern UI** with smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Lucide React** for beautiful icons
- **jsPDF** for PDF export functionality

### Backend
- **Node.js** with Express.js
- **AstraDB** (Cassandra) for scalable data storage
- **CORS** enabled for cross-origin requests

### AI Integration
- **API** with LLaMA 3.1-8B-Instant model
- **Streaming responses** for real-time interaction

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AstraDB account and database
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot-app
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` in root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```
   
   Create `backend/.env`:
   ```env
   ASTRA_DB_APPLICATION_TOKEN=your_astra_token
   ASTRA_DB_API_ENDPOINT=your_astra_endpoint
   PORT=3001
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Sign up** for an account or continue as guest
2. **Start chatting** by typing your message
3. **Create new chats** using the sidebar or menu
4. **Search conversations** using the search feature
5. **Export or share** your conversations

### Key Features
- **Mobile-friendly**: Responsive design works on all devices
- **Keyboard shortcuts**: Press Enter to send, Shift+Enter for new line
- **Real-time streaming**: Watch AI responses appear in real-time
- **Chat management**: Rename, delete, and organize conversations
- **Export options**: Save conversations in multiple formats

## 🏗️ Architecture

```
chatbot-app/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.jsx        # Authentication component
│   │   └── Sidebar.jsx     # Chat history sidebar
│   ├── config/             # Configuration files
│   │   └── api.js          # API endpoints
│   └── App.jsx             # Main application
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express server
│   └── config/
│       └── database.js     # AstraDB configuration
└── public/                 # Static assets
```


## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect repository to Render
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- **DataStax AstraDB** for scalable database solutions
- **Vercel** and **Render** for hosting platforms
- **Tailwind CSS** for the beautiful UI framework

## 📞 Support

For support, email [dharan.mj05@gmail.com] or create an issue in the repository.

---

**Built with ❤️ using React, Node.js, and AI**