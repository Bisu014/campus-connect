import React from 'react';
import { Complaint } from '@/types';
import StatusBadge from './StatusBadge';
import { Calendar, User, Tag, Building } from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintCardProps {
  complaint: Complaint;
  onResolve?: (id: string) => void;
  showResolveButton?: boolean;
  showStudentInfo?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onResolve,
  showResolveButton = false,
  showStudentInfo = false,
}) => {
  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMM dd, yyyy • h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="card-elevated p-6 animate-fade-in hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Tag className="w-3.5 h-3.5" />
            {complaint.category}
          </span>
          <StatusBadge status={complaint.status} />
        </div>
        {showResolveButton && complaint.status === 'Pending' && onResolve && (
          <button
            onClick={() => onResolve(complaint.id)}
            className="btn-success text-sm"
          >
            Mark Resolved
          </button>
        )}
      </div>

      <p className="text-foreground leading-relaxed mb-4">
        {complaint.description}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(complaint.timestamp)}
        </div>
        {showStudentInfo && (
          <>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {complaint.studentName || complaint.studentEmail}
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              {complaint.branch}
            </div>
          </>
        )}
      </div>

      {complaint.resolvedAt && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
          Resolved on {formatDate(complaint.resolvedAt)}
          {complaint.resolvedBy && ` by ${complaint.resolvedBy}`}
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;
