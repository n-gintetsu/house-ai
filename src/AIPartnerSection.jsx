import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AIServiceComparisonMockup from './AIServiceComparisonMockup';
import PartnerServiceContents from './PartnerServiceContents';
import AIDiagnosisModal from './AIDiagnosisModal';
import ToolHubPage from './ToolHubPage';
import CostCalculatorPage from './CostCalculatorPage';
import DictionaryPage from './DictionaryPage';
import MortgageSimulatorPage from './MortgageSimulatorPage';
import InvestorDrillPage from './InvestorDrillPage';
import InvestmentLoanPage from './InvestmentLoanPage';
import HouseAiRankingPage from './HouseAiRankingPage';
import AISateiPage from './AISateiPage';

export default function AIPartnerSection({ onTabChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedTool, setSelectedTool] = useState(null);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    const handler = () => setCurrentView('toolHub');
    window.addEventListener('open-tool-hub', handler);
    return () => window.removeEventListener('open-tool-hub', handler);
  }, []);

  const handleSelectTool = (toolId) => {
    if (toolId === 'costs') {
      setSelectedTool('costs');
      setCurrentView('tool-detail');
    } else if (toolId === 'dictionary') {
      setSelectedTool('dictionary');
      setCurrentView('tool-detail');
    } else if (toolId === 'mortgage') {
      setSelectedTool('mortgage');
      setCurrentView('tool-detail');
    } else if (toolId === 'beginner') {
      setSelectedTool('beginner');
      setCurrentView('tool-detail');
    } else if (toolId === 'investment') {
      setSelectedTool('investment');
      setCurrentView('tool-detail');
    } else if (toolId === 'satei') {
      setSelectedTool('satei');
      setCurrentView('tool-detail');
    } else {
      onTabChange('chat');
    }
  };

  if (currentView === 'tool-detail' && selectedTool === 'costs') {
    return (
      <CostCalculatorPage onBack={() => setCurrentView('toolHub')} onSelectTool={handleSelectTool} />
    );
  }

  if (currentView === 'tool-detail' && selectedTool === 'dictionary') {
    return (
      <DictionaryPage onBack={() => setCurrentView('toolHub')} />
    );
  }

  if (currentView === 'tool-detail' && selectedTool === 'mortgage') {
    return (
      <MortgageSimulatorPage onBack={() => setCurrentView('toolHub')} onOpenConcierge={() => {}} />
    );
  }

  if (showRanking) {
    return <HouseAiRankingPage onBack={() => setShowRanking(false)} />;
  }

  if (currentView === 'tool-detail' && selectedTool === 'satei') {
    return (
      <AISateiPage
        onBack={() => setCurrentView('toolHub')}
      />
    );
  }

  if (currentView === 'tool-detail' && selectedTool === 'investment') {
    return (
      <InvestmentLoanPage
        onBack={() => setCurrentView('toolHub')}
        onOpenTool={(tool) => { setSelectedTool(tool); setCurrentView('tool-detail'); }}
      />
    );
  }

  if (currentView === 'tool-detail' && selectedTool === 'beginner') {
    return (
      <InvestorDrillPage onBack={() => setCurrentView('toolHub')} onOpenTool={(tool) => { setSelectedTool(tool); setCurrentView('tool-detail'); }} onShowRanking={() => setShowRanking(true)} />
    );
  }

  if (currentView === 'toolHub') {
    return (
      <ToolHubPage
        onSelectTool={handleSelectTool}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  return (
    <section style={{ position: 'relative', background: '#F7F9FC', padding: '80px 20px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <motion.div style={{ position: 'absolute', top: '25%', left: '25%', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15 }} animate={{ background: ['radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', 'radial-gradient(circle, rgba(147,51,234,0.2), transparent 70%)', 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)'] }} transition={{ duration: 8, repeat: Infinity }} />

      <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '64px' }}>
          <motion.h2
            style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginBottom: '12px', background: 'linear-gradient(135deg, #111827, #1e3a5f, #7c3aed, #2563eb, #111827)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            AI提携サービス
          </motion.h2>
          <p style={{ color: '#4B5563', fontSize: '18px' }}>AIがあなたに合うサービスを整理・比較します</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '48px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <AIServiceComparisonMockup />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <PartnerServiceContents onOpenModal={() => setModalOpen(true)} onOpenToolPage={() => setCurrentView('toolHub')} />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ai-partner-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <AIDiagnosisModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
