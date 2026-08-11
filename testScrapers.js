import { fetchKBOSthandings } from './scrapers/kboScraper.js';
import { fetchMLBStandings } from './scrapers/mlbScraper.js';
import { fetchNPBStandings } from './scrapers/npbScraper.js';

async function testAllScrapers() {
  console.log('Testing KBO Scraper...');
  const kbo = await fetchKBOSthandings();
  console.log('KBO Metadata:', kbo.metadata);
  console.log('KBO Teams Count:', kbo.subLeagues[0].teams.length);

  console.log('\nTesting MLB Scraper...');
  const mlb = await fetchMLBStandings();
  console.log('MLB Metadata:', mlb.metadata);
  console.log('MLB AL Teams:', mlb.subLeagues[0].teams.length, '| NL Teams:', mlb.subLeagues[1].teams.length);

  console.log('\nTesting NPB Scraper...');
  const npb = await fetchNPBStandings();
  console.log('NPB Metadata:', npb.metadata);
  console.log('NPB Central Teams:', npb.subLeagues[0].teams.length, '| Pacific Teams:', npb.subLeagues[1].teams.length);
}

testAllScrapers();
