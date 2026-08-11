import React from 'react';

export function calculatePythagorean(r, ra, exponent) {
  if (!r && !ra) return 0.5;
  const rExp = Math.pow(r, exponent);
  const raExp = Math.pow(ra, exponent);
  if (rExp + raExp === 0) return 0.5;
  return rExp / (rExp + raExp);
}

export default function LeagueTables({ activeTab, leagueData, exponent }) {
  if (!leagueData || !leagueData.subLeagues) {
    return (
      <div className="hero-section">
        <p className="hero-subtitle">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // Hero Section Titles matching screenshots
  const getHeroContent = () => {
    switch (activeTab) {
      case 'KBO':
        return {
          title: 'KBO League Analysis',
          subtitle: 'Objective comparison of actual win percentage vs. Pythagorean expectation based on runs scored and allowed.',
        };
      case 'MLB':
        return {
          title: 'Major League Baseball',
          subtitle: 'Current Season • Standings vs Expected Performance',
        };
      case 'NPB':
        return {
          title: 'NPB ピタゴラス勝率比較表',
          subtitle: 'Current season standings vs. expected performance.',
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const hero = getHeroContent();

  return (
    <div>
      {/* Hero Header */}
      <div className="hero-section">
        <h2 className="hero-title">{hero.title}</h2>
        <p className="hero-subtitle">{hero.subtitle}</p>
      </div>

      {/* Sub-league Tables */}
      {leagueData.subLeagues.map((subLeague, subIdx) => {
        // Calculate Pythagorean Win Rate and Pythagorean Rank for each team
        const processedTeams = subLeague.teams.map((t) => {
          const pythRate = calculatePythagorean(t.runsScored, t.runsAllowed, exponent);
          return { ...t, pythWinRate: pythRate };
        });

        // Determine Pythagorean Rank by sorting copy by pythWinRate descending
        const sortedByPyth = [...processedTeams].sort(
          (a, b) => b.pythWinRate - a.pythWinRate || (b.runsScored - b.runsAllowed) - (a.runsScored - a.runsAllowed)
        );

        const pythRankMap = new Map();
        sortedByPyth.forEach((t, idx) => {
          pythRankMap.set(t.id, idx + 1);
        });

        // Final list sorted by ACTUAL RANK (1..N) as requested
        const finalTableTeams = processedTeams
          .map((t) => ({
            ...t,
            pythRank: pythRankMap.get(t.id),
          }))
          .sort((a, b) => a.rank - b.rank);

        return (
          <div key={subIdx} className="subleague-container">
            {/* Show subleague title if MLB or NPB or > 1 subleague */}
            {(leagueData.subLeagues.length > 1 || activeTab !== 'KBO') && (
              <h3 className="subleague-title">{subLeague.name}</h3>
            )}

            <div className="table-card">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>팀명</th>
                    <th style={{ textAlign: 'center' }}>순위</th>
                    <th style={{ textAlign: 'center' }}>피타고리안 순위</th>
                    <th style={{ textAlign: 'right' }}>실제 승률</th>
                    <th style={{ textAlign: 'right' }}>피타고리안 승률</th>
                    <th style={{ textAlign: 'right' }}>득점</th>
                    <th style={{ textAlign: 'right' }}>실점</th>
                  </tr>
                </thead>
                <tbody>
                  {finalTableTeams.map((t) => {
                    const isTopRank = t.rank <= 3;
                    const diffRank = t.rank - t.pythRank; // Positive means pyth rank is better than actual rank

                    return (
                      <tr key={t.id}>
                        {/* Team Name */}
                        <td>
                          <div className="team-cell">
                            {t.teamCode && <span className="team-code-tag">{t.teamCode}</span>}
                            <span>{t.team}</span>
                          </div>
                        </td>

                        {/* Actual Rank */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={isTopRank ? 'rank-badge-dark' : 'rank-badge-light'}>
                            {t.rank}
                          </span>
                        </td>

                        {/* Pythagorean Rank */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="rank-badge-light">{t.pythRank}</span>
                          {diffRank !== 0 && (
                            <span className={`diff-tag ${diffRank > 0 ? 'diff-positive' : 'diff-negative'}`}>
                              {diffRank > 0 ? `▲${diffRank}` : `▼${Math.abs(diffRank)}`}
                            </span>
                          )}
                        </td>

                        {/* Actual Win Rate */}
                        <td style={{ textAlign: 'right' }} className="value-num">
                          {typeof t.winRate === 'number' ? t.winRate.toFixed(3) : t.winRate}
                        </td>

                        {/* Pythagorean Win Rate */}
                        <td className="value-num" style={{ textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                          {t.pythWinRate.toFixed(3)}
                        </td>

                        {/* Runs Scored */}
                        <td style={{ textAlign: 'right' }} className="value-num">
                          {t.runsScored}
                        </td>

                        {/* Runs Allowed */}
                        <td style={{ textAlign: 'right' }} className="value-num">
                          {t.runsAllowed}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
