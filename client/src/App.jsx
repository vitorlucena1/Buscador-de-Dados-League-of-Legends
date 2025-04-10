// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChampionDetailsPage from './pages/ChampionDetailsPage';
import './styles/Home.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/champion/:championName" element={<ChampionDetailsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
