import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Ticket } from 'lucide-react';
import { logger } from '@/lib/logger';
import { cinematicEntrance, cinematicHover } from '@/lib/animations';
import { InvestmentStakeholder, PipelinePhase, PHASE_SEQUENCE, CHANNEL_METADATA } from './types';
import LeadScoreBadge from './LeadScoreBadge';

function StakeholderCard({ stakeholder, phase, onProgress, onDragStart }: { 
  stakeholder: InvestmentStakeholder; 
  phase: PipelinePhase; 
  onProgress: (id: string, phase: PipelinePhase) => void;
  onDragStart: (id: string, phase: PipelinePhase) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const currentDepth = PHASE_SEQUENCE.indexOf(phase);
  const nextPhase = PHASE_SEQUENCE[currentDepth + 1];

  const handleGenerateProposal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: stakeholder.id })
      });
      if (res.ok) alert('Strategic Options Package generated and secured.');
    } catch (err) {
      logger.error('Proposal generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      variants={cinematicEntrance}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={cinematicHover}
      className={`stakeholder-card-premium cinematic-glow bezel priority-${stakeholder.strategicIntensity}`}
      draggable
      onDragStart={() => onDragStart(stakeholder.id, phase)}
      style={{
        animationDelay: `${Math.random() * 0.3}s`
      }}
    >
      {stakeholder.strategicIntensity === 'hot' && <div className="strategic-pulse"></div>}
      <div className="stakeholder-card-gloss"></div>
      
      <div className="stakeholder-card-header-premium">
        <div className="stakeholder-name-wrap">
          <div className="stakeholder-name-main serif">{stakeholder.name}</div>
          <div className="stakeholder-origin">
            <span style={{ color: CHANNEL_METADATA[stakeholder.originChannel]?.color }}>
              {CHANNEL_METADATA[stakeholder.originChannel]?.icon}
            </span>
            <span style={{ letterSpacing: '0.5px' }}>{stakeholder.originChannel.toUpperCase()}</span>
          </div>
        </div>
        
        {stakeholder.intelligenceScore !== undefined && (
          <LeadScoreBadge score={stakeholder.intelligenceScore} />
        )}
      </div>
      
      <div className="stakeholder-card-body-premium">
        <div className="stakeholder-info-grid">
          <div className="info-item">
            <span className="info-label">Portfolio Focus</span>
            <span className="info-val">{stakeholder.portfolioPreference || 'General Inventory'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Investment Capacity</span>
            <span className="info-val gold-text">{stakeholder.capitalAllocation || 'N/A'}</span>
          </div>
        </div>

        {/* Neural Matching (Stage 6) Display */}
        {stakeholder.aiProfiling?.topMatches && stakeholder.aiProfiling.topMatches.length > 0 && (
          <div className="neural-matches-mini">
            <div className="neural-header">
              <span className="neural-icon">⚡</span>
              <span className="neural-title">Neural Matches</span>
            </div>
            <div className="match-list">
              {stakeholder.aiProfiling.topMatches.slice(0, 2).map((match, i) => (
                <div key={i} className="match-pill">
                  <span className="match-score">{match.matchScore}%</span>
                  <span className="match-reason">{match.matchReason.length > 30 ? match.matchReason.substring(0, 30) + '...' : match.matchReason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stakeholder.assignedPartnerName && (
          <div className="stakeholder-assignment-line">
            <span className="assignment-icon">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span className="assignment-val">Advisor: {stakeholder.assignedPartnerName}</span>
          </div>
        )}

        {/* Stage 7: Sales Incentives Indicator */}
        {('automation' in stakeholder && (stakeholder.automation as any).viewingRewardActive) && (
          <div className="incentive-badge-mini animate-pulse">
            <Ticket size={10} />
            <span>VIP VIEWING REWARD ACTIVE</span>
          </div>
        )}
      </div>
      
      <div className="stakeholder-card-footer-premium">
        <div className="stakeholder-status-row">
          <span className="stakeholder-timer">
            {stakeholder.createdAt?.toDate ? (
              <>Ingestion: {new Date(stakeholder.createdAt.seconds * 1000).toLocaleDateString()}</>
            ) : (
              'Active Operational Intel'
            )}
          </span>
          <div className={`priority-pill priority-${stakeholder.strategicIntensity}`}>
            {stakeholder.strategicIntensity.toUpperCase()}
          </div>
        </div>

        <div className="card-actions-row">
          {stakeholder.aiProfiling?.topMatches?.length > 0 && (
            <button 
              className={`btn-orb ${isGenerating ? 'loading' : ''}`}
              onClick={handleGenerateProposal}
              disabled={isGenerating}
            >
              <Briefcase size={12} />
              <span>{isGenerating ? 'Structuring...' : 'Propose Package'}</span>
            </button>
          )}

          {nextPhase && (
            <button
              className="btn-progress-stakeholder"
              onClick={() => onProgress(stakeholder.id, phase)}
            >
              <span>Advance</span>
              <span className="arrow">→</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StakeholderCard;
