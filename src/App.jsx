import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Subject from './pages/Subject';
import Exam from './pages/Exam';
import Results from './pages/Results';
import History from './pages/History';
import Braindead from './pages/Braindead';
import Admin from './pages/Admin';

function App() {
  return (
    <>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <Header />
      <main className="container animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subject/:subjectId" element={<Subject />} />
          <Route path="/exam/:subjectId/:sessionId" element={<Exam />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/braindead" element={<Braindead />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
