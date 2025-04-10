// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [summonerName, setSummonerName] = useState('');
  const [summonerTag, setSummonerTag] = useState('');
  const [dataType, setDataType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summonerName || !summonerTag || !dataType) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.get('/api/dados', {
        params: { nome: summonerName, tag: summonerTag, tipo: dataType }
      });
      setResults(response.data);
      sessionStorage.setItem('lastSummonerName', summonerName);
      sessionStorage.setItem('lastSummonerTag', summonerTag);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao buscar dados';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🔍 Dados de League of Legends</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome do Invocador"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          disabled={isLoading}
        />
        
        <input
          type="text"
          placeholder="Tag (ex: BR1)"
          value={summonerTag}
          onChange={(e) => setSummonerTag(e.target.value.replace('#', ''))}
          disabled={isLoading}
        />
        
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          disabled={isLoading}
          required
        >
          <option value="">Selecione o tipo de dado</option>
          <option value="maestria">Top 10 Maestrias</option>
          <option value="winrate">Winrate Ranqueado</option>
        </select>
        
        <button 
          type="submit" 
          disabled={isLoading || !summonerName || !summonerTag || !dataType}
        >
          {isLoading ? '⏳ Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <span>❌</span> {error}
        </div>
      )}

      {results?.tipo === 'winrate' && (
        <div className="result-container">
          <h2>📊 Winrate:</h2>
          <p>{results.dados}</p>
        </div>
      )}

      {results?.tipo === 'maestria' && (
        <div className="result-container">
          <h2>🏆 Top 10 Maestrias:</h2>
          {results.dados?.length > 0 ? (
            <ul className="champion-list">
              {results.dados.map((champ) => (
                <li key={`${champ.championIcon}-${champ.posicao}`} className="champion-item">
                  <button
                    className="champion-link"
                    onClick={() => navigate(`/champion/${encodeURIComponent(champ.nome)}`)}
                    disabled={isLoading}
                  >
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.championIcon}.png`}
                      alt={champ.nome}
                      className="champion-icon"
                    />
                    <div className="champion-info">
                      <strong>#{champ.posicao}</strong> – {champ.nome}
                      <div className="champion-points">
                        {champ.championPoints.toLocaleString()} pts
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Nenhum dado de maestria encontrado</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
