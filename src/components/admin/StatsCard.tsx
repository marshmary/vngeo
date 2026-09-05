import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: 'chart' | 'calendar' | 'users' | 'clock';
  color: 'blue' | 'green' | 'purple' | 'orange';
  isNumeric?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  isNumeric = true,
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-info-soft',
      icon: 'text-info',
      value: 'text-info-strong',
    },
    green: {
      bg: 'bg-success-soft',
      icon: 'text-success',
      value: 'text-success-strong',
    },
    purple: {
      bg: 'bg-brand-subtle',
      icon: 'text-brand',
      value: 'text-brand-hover',
    },
    orange: {
      bg: 'bg-warning-soft',
      icon: 'text-warning',
      value: 'text-warning-strong',
    },
  };

  const icons = {
    chart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  const classes = colorClasses[color];
  const displayValue = isNumeric && typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <div className="bg-card rounded-card shadow-card p-6 hover:shadow-overlay transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${classes.value}`}>
            {displayValue}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`${classes.bg} p-3 rounded-card`}>
          <svg
            className={`w-6 h-6 ${classes.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
