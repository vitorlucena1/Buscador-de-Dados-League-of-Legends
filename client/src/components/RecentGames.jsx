// src/components/RecentGames.jsx
import React from 'react';
import PropTypes from 'prop-types';

const RecentGames = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return <div className="no-matches">Nenhuma partida recente encontrada</div>;
  }

  return (
    <div id="matches-list" className="matches-list">
      {matches.map((match, index) => (
        <div key={index} className={`match-card ${match.win ? 'victory' : 'defeat'}`}>
          <div className="match-result">{match.win ? 'Vitória' : 'Derrota'}</div>
          <div className="match-stats">
            <div className="match-kda">
              {match.kills}/{match.deaths}/{match.assists}
              <small>
                {((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2)}:1 KDA
              </small>
            </div>
            <div className="match-cs">
              {match.totalCS} CS ({Math.round(match.totalCS / (match.gameDuration / 60))}/min)
            </div>
          </div>
          <div className="match-duration">
            {Math.floor(match.gameDuration / 60)}:
            {(match.gameDuration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      ))}
    </div>
  );
};

RecentGames.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      win: PropTypes.bool,
      kills: PropTypes.number,
      deaths: PropTypes.number,
      assists: PropTypes.number,
      totalCS: PropTypes.number,
      gameDuration: PropTypes.number,
      championId: PropTypes.number
    })
  )
};

export default RecentGames;
