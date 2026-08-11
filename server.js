import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { fetchMLBStandings } from './scrapers/mlbScraper.js';
import { fetchKBOSthandings } from './scrapers/kboScraper.js';
import { fetchNPBStandings } from './scrapers/npbScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'standings.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Helper to load current data
function loadStandingsData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading standings.json:', err.message);
    }
  }
  return null;
}

// Helper to save data
function saveStandingsData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Function to refresh all scrapers
async function refreshAllStandings() {
  console.log('[Server] Refreshing all baseball standings...');
  const [kbo, mlb, npb] = await Promise.all([
    fetchKBOSthandings(),
    fetchMLBStandings(),
    fetchNPBStandings(),
  ]);

  const standingsObj = {
    lastUpdated: new Date().toISOString(),
    leagues: {
      KBO: kbo,
      MLB: mlb,
      NPB: npb,
    },
  };

  saveStandingsData(standingsObj);
  return standingsObj;
}

// API Routes
app.get('/api/standings', async (req, res) => {
  let data = loadStandingsData();
  if (!data) {
    data = await refreshAllStandings();
  }
  res.json(data);
});

app.post('/api/scrape', async (req, res) => {
  try {
    const data = await refreshAllStandings();
    res.json({ success: true, message: 'Fresh standings scraped successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/override', (req, res) => {
  const { league, subLeagueIndex, teamId, updatedFields } = req.body;
  const data = loadStandingsData();

  if (!data || !data.leagues || !data.leagues[league]) {
    return res.status(400).json({ success: false, error: 'Invalid league or data not initialized' });
  }

  const leagueData = data.leagues[league];
  const subLeague = leagueData.subLeagues[subLeagueIndex || 0];

  if (!subLeague || !subLeague.teams) {
    return res.status(400).json({ success: false, error: 'SubLeague not found' });
  }

  const team = subLeague.teams.find((t) => t.id === teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: 'Team not found' });
  }

  // Update specified fields
  Object.assign(team, updatedFields);
  leagueData.metadata.isOverridden = true;
  leagueData.metadata.lastOverrideAt = new Date().toISOString();

  saveStandingsData(data);
  res.json({ success: true, message: `Team ${team.team} updated successfully`, data });
});

// Serve Vite production build if exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`[Server] Pythagorean Baseball Backend running on http://localhost:${PORT}`);
  // Initial check / refresh if data file does not exist
  if (!loadStandingsData()) {
    await refreshAllStandings();
  }
});
