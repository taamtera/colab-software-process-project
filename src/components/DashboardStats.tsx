'use client';

import React from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  PieChart,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'sky' | 'emerald' | 'violet' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trend,
  trendValue,
  color = 'sky'
}) => {
  const colorClasses = {
    sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm transition-all hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`text-xs font-semibold flex items-center gap-1 ${
            trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
            trend === 'down' ? 'text-rose-600 dark:text-rose-400' :
            'text-slate-600 dark:text-slate-400'
          }`}>
            {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      icon: <FileCheckIcon className="w-5 h-5" />,
      label: 'Active TORs This Month',
      value: '24',
      subtext: '+3 new postings',
      trend: 'up' as const,
      trendValue: '+14%',
      color: 'sky' as const
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Total Market Value',
      value: '142.5M',
      subtext: 'THB',
      trend: 'up' as const,
      trendValue: '+8.2%',
      color: 'emerald' as const
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Avg AI Match Score',
      value: '86.3%',
      subtext: '±4.2 points',
      trend: 'up' as const,
      trendValue: '+2.1%',
      color: 'violet' as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Participating Vendors',
      value: '387',
      subtext: '+32 this quarter',
      trend: 'up' as const,
      trendValue: '+9%',
      color: 'amber' as const
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Avg Bidding Period',
      value: '14 days',
      subtext: 'Until deadline',
      trend: 'neutral' as const,
      trendValue: '-2 days',
      color: 'rose' as const
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Successful Bids',
      value: '89',
      subtext: 'From 156 total',
      trend: 'up' as const,
      trendValue: '+12%',
      color: 'sky' as const
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Crawl Updates',
      value: '1,204',
      subtext: 'Last 30 days',
      trend: 'up' as const,
      trendValue: '+18%',
      color: 'emerald' as const
    },
    {
      icon: <PieChart className="w-5 h-5" />,
      label: 'Top Category',
      value: 'Web & Mobile',
      subtext: '42% of all TORs',
      trend: 'neutral' as const,
      trendValue: 'Stable',
      color: 'violet' as const
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
          📊 Market Intelligence Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              subtext={stat.subtext}
              trend={stat.trend}
              trendValue={stat.trendValue}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Category Distribution Chart Mock */}
      <div className="theme-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          📈 TOR Distribution by Category
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Web & Mobile', value: 42, bar: 'bg-sky-500' },
            { name: 'AI & Analytics', value: 28, bar: 'bg-violet-500' },
            { name: 'Infrastructure', value: 18, bar: 'bg-emerald-500' },
            { name: 'Data & Security', value: 12, bar: 'bg-amber-500' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.bar} transition-all`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="theme-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            🏆 Top Performing District
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">Chatuchak</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            28 active TORs • ฿52.3M total
          </p>
        </div>

        <div className="theme-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            ⚡ Highest Demand Tech
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">Next.js / React</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Required in 34 TORs • 71% match rate
          </p>
        </div>

        <div className="theme-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            🎯 Vendor Satisfaction
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">4.7 / 5.0</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Based on 234 reviews • Highly recommended
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple icon component (can be replaced with lucide-react icon)
const FileCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
