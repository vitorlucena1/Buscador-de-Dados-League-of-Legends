// src/components/ChampionStats.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ChampionStats = ({ stats }) => {
  // Funções auxiliares para cálculos
  const getPercentage = (wins, total) =>
    total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : 'N/A';

  const getKDA = (kills, deaths, assists, total) =>
    total > 0
      ? `${(kills / total).toFixed(1)} / ${(deaths / total).toFixed(1)} / ${(assists / total).toFixed(1)}`
      : 'N/A';

  const getCSPerMin = (totalCS, totalGameDuration) =>
    totalGameDuration > 0 ? (totalCS / totalGameDuration).toFixed(1) : 'N/A';

  return (
    <div className="champion-stats">
      <div className="stat-card">
        <h3>WinRate Recente</h3>
        <p id="winrate-stat">
          {stats.total > 0 ? getPercentage(stats.vitorias, stats.total) : 'N/A'}
        </p>
      </div>
      <div className="stat-card">
        <h3>Partidas</h3>
        <p id="matches-stat">
          {stats ? `${stats.vitorias}V ${stats.total - stats.vitorias}D` : 'N/A'}
        </p>
      </div>
      <div className="stat-card">
        <h3>K/D/A Geral</h3>
        <p id="kda-stat">
          {stats.total > 0 ? getKDA(stats.totalKills, stats.totalDeaths, stats.totalAssists, stats.total) : 'N/A'}
        </p>
      </div>
      <div className="stat-card">
        <h3>CS por Minuto</h3>
        <p id="cspm-stat">
          {stats.totalGameDuration > 0 ? getCSPerMin(stats.totalCS, stats.totalGameDuration) : 'N/A'}
        </p>
      </div>
    </div>
  );
};

ChampionStats.propTypes = {
  stats: PropTypes.shape({
    vitorias: PropTypes.number,
    total: PropTypes.number,
    totalKills: PropTypes.number,
    totalDeaths: PropTypes.number,
    totalAssists: PropTypes.number,
    totalCS: PropTypes.number,
    totalGameDuration: PropTypes.number
  }).isRequired,
};

export default ChampionStats;
