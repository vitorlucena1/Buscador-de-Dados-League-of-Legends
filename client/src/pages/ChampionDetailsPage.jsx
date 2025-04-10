// src/pages/ChampionDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChampionHeader from '../components/ChampionHeader';
import ChampionStats from '../components/ChampionStats';
import RecentGames from '../components/RecentGames';
import '../styles/ChampionDetails.css';

const ChampionDetailsPage = () => {
  const { championName } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [championData, setChampionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChampionDetails = async () => {
      const summonerName = sessionStorage.getItem('lastSummonerName');
      const summonerTag = sessionStorage.getItem('lastSummonerTag');

      if (!summonerName || !summonerTag) {
        setError('Nenhum invocador encontrado na sessão.');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Obter PUUID do invocador
        const puuidRes = await axios.get(`/api/puuid?nome=${encodeURIComponent(summonerName)}&tag=${encodeURIComponent(summonerTag)}`);
        const puuid = puuidRes.data.puuid;

        // 2. Buscar dados de campeões
        const championsRes = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json');
        const championsData = championsRes.data.data;
        const decodedName = decodeURIComponent(championName);
        const championFound = Object.values(championsData).find(c => c.name === decodedName);

        if (!championFound) {
          throw new Error('Campeão não encontrado');
        }
        setChampionData(championFound);

        // 3. Buscar estatísticas do campeão
        const statsRes = await axios.get(`/api/detalhes?puuid=${puuid}&champion=${championFound.key}`);
        setStats(statsRes.data);
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Erro ao buscar detalhes do campeão.';
        setError(msg);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampionDetails();
  }, [championName]);

  if (isLoading) {
    return (
      <div className="champion-details-container">
        <div className="loading-message">
          <div className="loading"></div> Carregando detalhes do campeão...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="champion-details-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/')}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="champion-details-container">
      <ChampionHeader
        championName={championData.name}
        championId={championData.id}
      />
      <ChampionStats stats={stats} />

      <div className="recent-games">
        <h2>Últimas Partidas</h2>
        <RecentGames matches={stats.matches} />
      </div>

      <button className="back-button" onClick={() => navigate('/')}>
        Voltar
      </button>
    </div>
  );
};

export default ChampionDetailsPage;
