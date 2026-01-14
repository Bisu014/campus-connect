import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ComplaintCard from '@/components/ComplaintCard';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Complaint } from '@/types';
import { FileX } from 'lucide-react';

const MyComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Resolved'>('all');

  useEffect(() => {
    if (!user) return;

    // Query complaints using onSnapshot() for real-time updates
    const complaintsRef = collection(db, 'complaints');
    const q = query(
      complaintsRef,
      where('studentEmail', '==', user.email),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData: Complaint[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        complaintsData.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
        } as Complaint);
      });
      setComplaints(complaintsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  return (
    <DashboardLayout
      title="My Complaints"
      subtitle="Track the status of your submitted grievances"
    >
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'Pending', 'Resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All' : status}
            <span className="ml-2 text-xs opacity-70">
              ({status === 'all' 
                ? complaints.length 
                : complaints.filter((c) => c.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {filter === 'all' ? 'No Complaints Yet' : `No ${filter} Complaints`}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'You haven\'t submitted any complaints yet.'
              : `You don't have any ${filter.toLowerCase()} complaints.`}
          </p>
          {filter === 'all' && (
            <a href="/lodge-complaint" className="btn-primary mt-6 inline-flex">
              Lodge Your First Complaint
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              showStudentInfo={false}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyComplaints;
