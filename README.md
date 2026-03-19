# ConvoAI 🤖

ConvoAI is a full-stack AI chatbot that can remember conversations, take voice input, and even answer questions from uploaded documents.

## Features
- Remembers previous messages in a chat
- Voice input and speech output
- Upload documents and ask questions based on them
- Multiple chat threads
- User login and authentication

## Tech Stack
Frontend:
- React (Vite)
- CSS

Backend:
- Node.js
- Express
- MongoDB

AI:
- Groq API (LLaMA 3)

## Project Structure
backend/
frontend/

## How to run

### Backend
cd backend  
npm install  
npm start  

### Frontend
cd frontend  
npm install  
npm run dev  

## Environment variables

Create a `.env` file in backend:

MONGODB_URL=your_mongodb_url  
GROQ_API_KEY=your_api_key  
JWT_SECRET=your_secret  

---

This project was built as part of my learning in full-stack development and AI integration.
