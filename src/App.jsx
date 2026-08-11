import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeagueTables from './components/LeagueTables';
import ExponentPicker from './components/ExponentPicker';
import BottomTabBar from './components/BottomTabBar';
import MetadataModal from './components/MetadataModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [activeTab, setActiveTab] = useState('KBO');
  const [exponent, setExponent] = useState(1.83); // Global exponent state retained across tabs
  const [standingsData, setStandingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  // Fetch initial standings data
  const fetchStandings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/standings`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setStandingsData(data);
    } catch (err) {
      console.error('Failed to load standings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  // Trigger web re-scraping
  const handleRefreshScrape = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/scrape`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStandingsData(data.data);
        alert('실시간 스크래핑이 완료되었습니다!');
      } else {
        alert(`스크래핑 실패: ${data.error}`);
      }
    } catch (err) {
      alert(`스크래핑 요청 오류: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual data override save
  const handleSaveOverride = async (league, subLeagueIndex, teamId, updatedFields) => {
    const res = await fetch(`${API_BASE}/api/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ league, subLeagueIndex, teamId, updatedFields }),
    });
    const data = await res.json();
    if (data.success) {
      setStandingsData(data.data);
    } else {
      throw new Error(data.error);
    }
  };

  const currentLeagueData = standingsData?.leagues?.[activeTab];

  return (
    <div className="app-container">
      {/* Header */}
      <Header activeTab={activeTab} onOpenMetadata={() => setIsMetadataOpen(true)} />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {isLoading && !standingsData ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>데이터를 불러오는 중...</div>
            <div style={{ fontSize: '14px' }}>KBO, MLB, NPB 실시간 승률 정보를 수집하고 있습니다.</div>
          </div>
        ) : error && !standingsData ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>오류가 발생했습니다</div>
            <div style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</div>
            <button
              onClick={fetchStandings}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <LeagueTables activeTab={activeTab} leagueData={currentLeagueData} exponent={exponent} />
        )}
      </main>

      {/* Floating Exponent Selector (Maintained globally across tab changes) */}
      <ExponentPicker exponent={exponent} onChangeExponent={setExponent} />

      {/* Bottom Fixed Navigation Tabs */}
      <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Metadata Transparency & Manual Data Override Modal */}
      {isMetadataOpen && (
        <MetadataModal
          activeTab={activeTab}
          standingsData={standingsData}
          onClose={() => setIsMetadataOpen(false)}
          onRefreshData={handleRefreshScrape}
          onSaveOverride={handleSaveOverride}
        />
      )}
    </div>
  );
}
