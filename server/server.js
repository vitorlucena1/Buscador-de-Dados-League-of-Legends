// server/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.RIOT_API_KEY;

// Configuração do CORS para aceitar requisições do client
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const riotApi = axios.create({
  baseURL: 'https://americas.api.riotgames.com',
  timeout: 10000,
  headers: {
    'X-Riot-Token': API_KEY,
    'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
});

// Rota para dados de maestria e winrate
app.get('/api/dados', async (req, res) => {
  try {
    const { nome, tag, tipo } = req.query;
    
    if (!nome || !tag || !tipo) {
      return res.status(400).json({ error: 'Nome, tag e tipo são obrigatórios' });
    }

    // Busca a conta do invocador
    const { data: accountData } = await riotApi.get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`
    );
    
    const puuid = accountData.puuid;

    if (tipo === 'maestria') {
      const [masteryRes, championsRes] = await Promise.all([
        axios.get(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`, {
          headers: { 'X-Riot-Token': API_KEY },
          timeout: 10000
        }),
        axios.get('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json', {
          timeout: 10000
        })
      ]);

      const champions = championsRes.data.data;
      const top10 = masteryRes.data
      .slice(0, 10)
      .map((mastery, index) => {
      const champion = Object.values(champions).find(c => parseInt(c.key) === mastery.championId);
      return {
      posicao: index + 1,
      nome: champion?.name || `Campeão ${mastery.championId}`,
      // Se o champion estiver encontrado, use champion.id (ex: "Chogath" em vez de "Cho'Gath")
      championIcon: champion ? champion.id : mastery.championId,
      championPoints: mastery.championPoints
    };
  });


      return res.json({ tipo: 'maestria', dados: top10 });
    } else if (tipo === 'winrate') {
      const { data: matchIds } = await riotApi.get(
        `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        { params: { queue: 420, start: 0, count: 20 } }
      );

      let stats = { vitorias: 0, total: 0 };
      const matchDetails = await Promise.allSettled(
        matchIds.map(matchId => riotApi.get(`/lol/match/v5/matches/${matchId}`))
      );

      matchDetails.forEach(result => {
        if (result.status === 'fulfilled') {
          const participant = result.value.data.info.participants.find(p => p.puuid === puuid);
          if (participant) {
            stats.total++;
            if (participant.win) stats.vitorias++;
          }
        }
      });

      const winrate = stats.total > 0 ? ((stats.vitorias / stats.total) * 100).toFixed(2) : 0;
      return res.json({
        tipo: 'winrate',
        dados: `${winrate}% (${stats.vitorias}V/${stats.total - stats.vitorias}D)`
      });
    }

    return res.status(400).json({ error: 'Tipo inválido' });
  } catch (error) {
    console.error('Erro no endpoint /api/dados:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Rota para obter o PUUID do invocador
app.get('/api/puuid', async (req, res) => {
  try {
    const { nome, tag } = req.query;
    
    if (!nome || !tag) {
      return res.status(400).json({ error: 'Nome e tag são obrigatórios' });
    }

    const { data } = await riotApi.get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`
    );

    return res.json({ puuid: data.puuid });
  } catch (error) {
    console.error('Erro no endpoint /api/puuid:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Rota para obter detalhes das partidas de um campeão específico
app.get('/api/detalhes', async (req, res) => {
  try {
    const { puuid, champion } = req.query;

    if (!puuid || !champion) {
      return res.status(400).json({ error: 'PUUID e champion são obrigatórios' });
    }

    const championId = parseInt(champion);
    const { data: matchIds } = await riotApi.get(
      `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      { params: { queue: 420, start: 0, count: 10 } }
    );

    let stats = {
      vitorias: 0,
      total: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalCS: 0,
      totalGameDuration: 0,
      matches: []
    };

    const matchDetails = await Promise.allSettled(
      matchIds.map(matchId => riotApi.get(`/lol/match/v5/matches/${matchId}`))
    );

    matchDetails.forEach(result => {
      if (result.status === 'fulfilled') {
        const participant = result.value.data.info.participants.find(
          p => p.puuid === puuid && p.championId === championId
        );

        if (participant) {
          stats.total++;
          if (participant.win) stats.vitorias++;

          stats.totalKills += participant.kills;
          stats.totalDeaths += participant.deaths;
          stats.totalAssists += participant.assists;
          stats.totalCS += participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0);
          stats.totalGameDuration += result.value.data.info.gameDuration / 60;

          stats.matches.push({
            win: participant.win,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            totalCS: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
            gameDuration: result.value.data.info.gameDuration,
            championId: participant.championId
          });
        }
      }
    });

    return res.json(stats);
  } catch (error) {
    console.error('Erro no endpoint /api/detalhes:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Em produção, servir arquivos estáticos do client
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
