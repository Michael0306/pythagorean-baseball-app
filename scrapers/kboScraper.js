import axios from 'axios';

export async function fetchKBOSthandings() {
  const sourceUrl = 'https://sports.daum.net/record/kbo';
  const apiUrl = 'https://sports.daum.net/prx/hermes/api/team/rank.json?leagueCode=kbo';
  const scrapedAt = new Date().toISOString();

  try {
    const response = await axios.get(apiUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': sourceUrl,
      },
    });

    if (response.data && Array.isArray(response.data.list)) {
      const list = response.data.list;

      // Sort by rank ascending
      list.sort((a, b) => (a.rank?.rank || 99) - (b.rank?.rank || 99));

      const teams = list.map((item, idx) => {
        const rankObj = item.rank || {};
        const statObj = item.stat || {};

        const wins = parseInt(rankObj.win || 0, 10);
        const losses = parseInt(rankObj.loss || 0, 10);
        const draws = parseInt(rankObj.draw || 0, 10);
        const runsScored = parseInt(statObj.batR || 0, 10); // 득점 (2번째 표 9번째 열)
        const runsAllowed = parseInt(statObj.pitR || 0, 10); // 실점 (3번째 표 6번째 열)

        const totalGames = wins + losses;
        const winRate = rankObj.wpct
          ? parseFloat(rankObj.wpct)
          : totalGames > 0
          ? parseFloat((wins / totalGames).toFixed(3))
          : 0;

        return {
          id: `kbo_${item.cpTeamId?.toLowerCase() || idx}`,
          team: item.shortNameKo || item.nameKo || item.nameMain,
          teamCode: item.cpTeamId || 'KBO',
          rank: parseInt(rankObj.rank || idx + 1, 10), // 순위 (1번째 표 1번째 열)
          wins,
          losses,
          draws,
          winRate, // 승률 (1번째 표 7번째 열)
          runsScored,
          runsAllowed,
        };
      });

      return {
        metadata: {
          league: 'KBO',
          sourceUrl,
          apiUrl,
          scrapedAt,
          status: 'success',
          parser: 'Daum Sports KBO Live Data',
          selectorInfo: '1번째 표 1열(순위: rank.rank), 1번째 표 7열(승률: rank.wpct), 2번째 표 9열(득점: stat.batR), 3번째 표 6열(실점: stat.pitR)',
        },
        subLeagues: [{ name: 'KBO League', teams }],
      };
    }

    throw new Error('Daum KBO API did not return a valid list array');
  } catch (error) {
    console.warn('[KBO Scraper Warning] Using verified baseline data:', error.message);
    const fallbackTeams = getFallbackKBOData();
    return {
      metadata: {
        league: 'KBO',
        sourceUrl,
        scrapedAt,
        status: 'fallback_cache',
        parser: 'KBO Baseline Cache (Daum Sports fallback)',
        selectorInfo: 'Pre-loaded verified season standings (10 Teams)',
        errorMessage: error.message,
      },
      subLeagues: [{ name: 'KBO League', teams: fallbackTeams }],
    };
  }
}

export const fetchKBOStandings = fetchKBOSthandings;

export function getFallbackKBOData() {
  return [
    { id: 'kbo_kia', team: 'KIA', teamCode: 'KIA', rank: 1, wins: 87, losses: 55, draws: 2, winRate: 0.613, runsScored: 858, runsAllowed: 717 },
    { id: 'kbo_sam', team: 'Samsung', teamCode: 'SAM', rank: 2, wins: 78, losses: 64, draws: 2, winRate: 0.549, runsScored: 770, runsAllowed: 720 },
    { id: 'kbo_lg', team: 'LG', teamCode: 'LG', rank: 3, wins: 76, losses: 66, draws: 2, winRate: 0.535, runsScored: 808, runsAllowed: 752 },
    { id: 'kbo_doo', team: 'Doosan', teamCode: 'DOO', rank: 4, wins: 74, losses: 68, draws: 2, winRate: 0.521, runsScored: 757, runsAllowed: 748 },
    { id: 'kbo_kt', team: 'KT', teamCode: 'KT', rank: 5, wins: 71, losses: 70, draws: 3, winRate: 0.504, runsScored: 766, runsAllowed: 772 },
    { id: 'kbo_ssg', team: 'SSG', teamCode: 'SSG', rank: 6, wins: 72, losses: 70, draws: 2, winRate: 0.507, runsScored: 740, runsAllowed: 786 },
    { id: 'kbo_lot', team: 'Lotte', teamCode: 'LOT', rank: 7, wins: 66, losses: 74, draws: 4, winRate: 0.471, runsScored: 750, runsAllowed: 781 },
    { id: 'kbo_han', team: 'Hanwha', teamCode: 'HAN', rank: 8, wins: 66, losses: 76, draws: 2, winRate: 0.465, runsScored: 730, runsAllowed: 782 },
    { id: 'kbo_nc', team: 'NC', teamCode: 'NC', rank: 9, wins: 61, losses: 81, draws: 2, winRate: 0.430, runsScored: 739, runsAllowed: 825 },
    { id: 'kbo_kiw', team: 'Kiwoom', teamCode: 'KIW', rank: 10, wins: 58, losses: 86, draws: 0, winRate: 0.403, runsScored: 673, runsAllowed: 825 },
  ];
}

