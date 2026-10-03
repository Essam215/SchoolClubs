import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, ShoppingBag, Flame, Zap, Check, Star, Crown } from 'lucide-react';
import './Gamification.css';

export default function Gamification() {
  const { user, gamification, claimReward } = useApp();

  return (
    <div className="gamification-page">
      {/* Top Gamification Banner */}
      <div className="gamification-banner glass-panel">
        <div className="banner-left">
          <div className="streak-box">
            <Flame className="flame-icon" size={36} />
            <div>
              <h3 className="streak-count">{user.streak} Days</h3>
              <span className="streak-label">Active Login Streak</span>
            </div>
          </div>

          <div className="user-score-box">
            <div className="score-item">
              <span className="score-val">{user.xp} XP</span>
              <span className="score-title">Available XP</span>
            </div>
            <div className="score-item">
              <span className="score-val">Lvl {user.level}</span>
              <span className="score-title">Current Rank</span>
            </div>
          </div>
        </div>

        <div className="banner-right">
          <button className="btn btn-primary btn-lg">
            <Flame size={20} /> Claim Daily 50 XP Bonus
          </button>
        </div>
      </div>

      <div className="gamification-grid">
        {/* Left: Leaderboard */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-heading flex items-center gap-2">
            <Trophy className="text-warning" size={22} /> Student Leaderboard (Top XP)
          </h3>

          <div className="leaderboard-list">
            {gamification.leaderboard.map((item, idx) => (
              <div key={item.name} className={`leaderboard-item ${item.name === user.name ? 'current-user' : ''}`}>
                <div className="rank-badge">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${item.rank}`}
                </div>
                <img src={item.avatar} alt={item.name} className="leaderboard-avatar" />
                <div className="leaderboard-user-info">
                  <h4 className="user-title flex items-center gap-2">
                    {item.name} {idx === 0 && <Crown size={14} className="text-warning"/>}
                  </h4>
                  <span className="user-club-sub">{item.club}</span>
                </div>
                <div className="leaderboard-scores">
                  <span className="xp-tag"><Zap size={13}/> {item.xp} XP</span>
                  <span className="lvl-tag">Lvl {item.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rewards Store */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-heading flex items-center gap-2">
            <ShoppingBag className="text-accent" size={22} /> Rewards & Perks Catalog
          </h3>

          <div className="rewards-grid">
            {gamification.rewards.map(reward => (
              <div key={reward.id} className="reward-card">
                <div className="flex justify-between items-start mb-2">
                  <span className="reward-category">{reward.category}</span>
                  <span className="reward-cost"><Zap size={12}/> {reward.cost} XP</span>
                </div>

                <h4 className="reward-title">{reward.title}</h4>

                <div className="reward-footer mt-4">
                  {reward.claimed ? (
                    <span className="claimed-badge flex items-center gap-1">
                      <Check size={14}/> Claimed
                    </span>
                  ) : (
                    <button 
                      className={`btn ${user.xp >= reward.cost ? 'btn-primary' : 'btn-outline'} btn-sm w-full`}
                      disabled={user.xp < reward.cost}
                      onClick={() => claimReward(reward.id)}
                    >
                      {user.xp >= reward.cost ? 'Claim Perk' : 'Not Enough XP'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
