import './App.css'
import {  Routes, Route } from "react-router-dom";
import AuthGuard from './components/AuthGaurd';
import SignInComponent from './components/SignInComponent';
import MainLayout from './components/MainLayout';
import { useEffect } from 'react';
import { useChatStore } from './store/chatStore';
import { initSocket } from './api/socket';
import AddContactForm from './components/AddContactForm';
import NewContactForm from './components/NewContactForm';

function App() {

  const {setActiveChat} = useChatStore()
  
   useEffect(() => {
    const handleKeyDown = (event: any) => {
      // Check if the pressed key is 'Escape'.
      if (event.key === 'Escape') {
        setActiveChat(null, null)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    initSocket()
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/signIn" element={<SignInComponent />} />

        <Route element={<AuthGuard />}>
          <Route path="/" element={<MainLayout />} />
          <Route path="/add/:id" element={<AddContactForm />} />
          <Route path="/add/" element={<NewContactForm />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
