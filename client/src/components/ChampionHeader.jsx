// src/components/ChampionHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ChampionHeader = ({ championName, championId }) => {
  // Formata o nome caso o id não esteja disponível
  const formattedName = championName
    .replace(/[\s.'"]/g, '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '');
  
  // A preferência é usar o ID do campeão (fornecido pelo Data Dragon)
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${championId || formattedName}.png`;

  return (
    <div className="champion-header">
      <img className="champion-image" src={imageUrl} alt={championName} />
      <div className="champion-info">
        <h1>{championName}</h1>
      </div>
    </div>
  );
};

ChampionHeader.propTypes = {
  championName: PropTypes.string.isRequired,
  championId: PropTypes.string,
};

export default ChampionHeader;
