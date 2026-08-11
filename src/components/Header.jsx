import React from 'react';
import { Database, BarChart2 } from 'lucide-react';

export default function Header({ activeTab, onOpenMetadata }) {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'KBO':
        return 'KBO 피타고리안 승률 비교표';
      case 'MLB':
        return 'Pythagorean Expectancy';
      case 'NPB':
        return 'Pythagorean Expectancy';
      default:
        return '피타고리안 승률 비교표';
    }
  };

  return (
    <header className="app-header">
      <div className="header-title-container">
        <div className="header-icon">
          <BarChart2 size={16} color="#0f172a" />
        </div>
        <h1 className="header-title">{getHeaderTitle()}</h1>
      </div>
      <button className="metadata-btn" onClick={onOpenMetadata} title="데이터 출처 및 파싱 상세 정보 보기 / 수동 수정">
        <Database size={14} />
        <span>출처 & 데이터 수정</span>
      </button>
    </header>
  );
}
