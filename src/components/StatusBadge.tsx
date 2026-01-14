import React from 'react';
import { ComplaintStatus } from '@/types';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Resolved':
        return {
          className: 'status-badge status-resolved',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      case 'Escalated':
        return {
          className: 'status-badge status-escalated',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'Pending':
      default:
        return {
          className: 'status-badge status-pending',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={config.className}>
      {config.icon}
      <span className="ml-1.5">{status}</span>
    </span>
  );
};

export default StatusBadge;
