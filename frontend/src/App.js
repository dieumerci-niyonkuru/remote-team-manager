import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import api from './api';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  const [status, setStatus] = useState('Checking backend...');
  useEffect(() => {
    api.get('/health/')
      .then(res => setStatus(`✅ Backend OK: ${JSON.stringify(res.data)}`))
      .catch(err => setStatus(`❌ Backend error: ${err.message}`));
  }, []);
  return (
    <div>
      <h1>Remote Team Manager</h1>
      <p>{status}</p>
    </div>
  );
}

function Teams() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    api.get('/teams/').then(res => setTeams(res.data)).catch(console.error);
  }, []);
  return (
    <div>
      <h2>Teams</h2>
      <ul>{teams.map(t => <li key={t.id}>{t.name}</li>)}</ul>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    api.get('/tasks/').then(res => setTasks(res.data)).catch(console.error);
  }, []);
  return (
    <div>
      <h2>Tasks</h2>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}

export default App;
