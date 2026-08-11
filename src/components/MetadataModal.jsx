import React, { useState } from 'react';
import { X, RefreshCw, Edit3, Globe, Code, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MetadataModal({ activeTab, standingsData, onClose, onRefreshData, onSaveOverride }) {
  const [modalTab, setModalTab] = useState('metadata'); // 'metadata' | 'edit'
  const [editingTeams, setEditingTeams] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const leagueData = standingsData?.leagues?.[activeTab];
  const metadata = leagueData?.metadata;
  const subLeagues = leagueData?.subLeagues || [];

  const handleInputChange = (subIdx, teamId, field, val) => {
    const num = parseFloat(val);
    setEditingTeams((prev) => ({
      ...prev,
      [`${subIdx}_${teamId}`]: {
        ...(prev[`${subIdx}_${teamId}`] || {}),
        subIdx,
        teamId,
        [field]: isNaN(num) ? val : num,
      },
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const keys = Object.keys(editingTeams);
      for (const key of keys) {
        const item = editingTeams[key];
        const { subIdx, teamId, ...updatedFields } = item;
        await onSaveOverride(activeTab, subIdx, teamId, updatedFields);
      }
      alert('데이터가 성공적으로 수정 및 재계산되었습니다!');
      setEditingTeams({});
    } catch (err) {
      alert(`저장 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{activeTab} 스크래핑 메타데이터 및 데이터 수정</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              웹 수집 정보 확인 및 데이터 수동 변경
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px', gap: '16px' }}>
          <button
            onClick={() => setModalTab('metadata')}
            style={{
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontWeight: modalTab === 'metadata' ? 700 : 500,
              color: modalTab === 'metadata' ? '#0f172a' : '#64748b',
              borderBottom: modalTab === 'metadata' ? '2px solid #000' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Globe size={15} />
            <span>수집 출처 & 파싱 메타데이터</span>
          </button>
          <button
            onClick={() => setModalTab('edit')}
            style={{
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontWeight: modalTab === 'edit' ? 700 : 500,
              color: modalTab === 'edit' ? '#0f172a' : '#64748b',
              borderBottom: modalTab === 'edit' ? '2px solid #000' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit3 size={15} />
            <span>데이터 직접 수정 (Override)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {modalTab === 'metadata' && (
            <>
              {/* Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: metadata?.status === 'success' ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${metadata?.status === 'success' ? '#bbf7d0' : '#fde68a'}`,
                }}
              >
                {metadata?.status === 'success' ? (
                  <CheckCircle size={18} color="#16a34a" />
                ) : (
                  <AlertTriangle size={18} color="#d97706" />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: metadata?.status === 'success' ? '#15803d' : '#b45309' }}>
                    {metadata?.status === 'success' ? '실시간 스크래핑 정상 완료' : '캐시 / 베이스라인 데이터 작동 중'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {metadata?.parser || '표준 파서 적용'}
                  </div>
                </div>
              </div>

              {/* Source URL Box */}
              <div className="meta-box">
                <div className="meta-label">🌐 원본 스크래핑 URL</div>
                <div className="meta-val">
                  <a href={metadata?.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                    {metadata?.sourceUrl}
                  </a>
                </div>
              </div>

              {/* Scraped Timestamp */}
              <div className="meta-box">
                <div className="meta-label">⏱️ 스크래핑 시각 (ISO)</div>
                <div className="meta-val">{metadata?.scrapedAt || new Date().toISOString()}</div>
              </div>

              {/* Selector / Parser Info */}
              <div className="meta-box">
                <div className="meta-label">💻 데이터 추출 및 파싱 로직 상세 (Selector Info)</div>
                <div className="meta-val" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {metadata?.selectorInfo || 'N/A'}
                </div>
              </div>

              {/* Refresh Action */}
              <button
                onClick={onRefreshData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                <RefreshCw size={16} />
                <span>웹에서 최신 정보 스크래핑 다시 실행</span>
              </button>
            </>
          )}

          {modalTab === 'edit' && (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                웹에서 긁어온 데이터가 틀리거나 테스트를 원하는 경우 아래에서 각 팀의 득점, 실점, 승률을 직접 변경할 수 있습니다.
              </p>

              {subLeagues.map((sub, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                    {sub.name}
                  </h4>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                          <th style={{ padding: '8px', textAlign: 'left' }}>팀명</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>득점(R)</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>실점(RA)</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>실제 승률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sub.teams.map((t) => {
                          const stateKey = `${sIdx}_${t.id}`;
                          const currentEdit = editingTeams[stateKey] || {};
                          return (
                            <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px', fontWeight: 600 }}>{t.team}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  className="edit-table-input"
                                  defaultValue={t.runsScored}
                                  onChange={(e) => handleInputChange(sIdx, t.id, 'runsScored', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  className="edit-table-input"
                                  defaultValue={t.runsAllowed}
                                  onChange={(e) => handleInputChange(sIdx, t.id, 'runsAllowed', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  step="0.001"
                                  className="edit-table-input"
                                  defaultValue={t.winRate}
                                  onChange={(e) => handleInputChange(sIdx, t.id, 'winRate', e.target.value)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveAll}
                disabled={isSaving || Object.keys(editingTeams).length === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: Object.keys(editingTeams).length > 0 ? '#16a34a' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: Object.keys(editingTeams).length > 0 ? 'pointer' : 'not-allowed',
                  marginTop: '10px',
                }}
              >
                {isSaving ? '저장 중...' : '수정사항 적용 및 즉시 재계산'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
