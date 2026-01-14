import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Complaint } from '@/types';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let q;
    const complaintsRef = collection(db, 'complaints');

    if (user.role === 'student') {
      // Students see only their complaints
      q = query(
        complaintsRef,
        where('studentEmail', '==', user.email),
        orderBy('timestamp', 'desc')
      );
    } else if (user.role === 'hod') {
      // HOD sees only their department's complaints
      q = query(
        complaintsRef,
        where('branch', '==', user.branch),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Admin/Principal sees all complaints
      q = query(complaintsRef, orderBy('timestamp', 'desc'));
    }

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

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    escalated: complaints.filter((c) => c.status === 'Escalated').length,
  };

  const resolutionRate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 0;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout
      title={`${getWelcomeMessage()}, ${user?.name?.split(' ')[0] || 'User'}`}
      subtitle={user?.role === 'student' 
        ? 'Track your complaints and submit new ones'
        : `Managing ${user?.role === 'hod' ? user.branch + ' department' : 'all'} complaints`
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-elevated p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Total Complaints</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Pending</span>
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
              </div>
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Resolved</span>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold text-success">{stats.resolved}</div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">Resolution Rate</span>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">{resolutionRate}%</div>
            </div>
          </div>

          {/* Quick Actions for Students */}
          {user?.role === 'student' && (
            <div className="card-elevated p-6 mb-8">
              <h3 className="text-lg font-display font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <a href="/lodge-complaint" className="btn-primary">
                  Lodge New Complaint
                </a>
                <a href="/my-complaints" className="btn-outline">
                  View My History
                </a>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-display font-semibold mb-4">
              {user?.role === 'student' ? 'Recent Complaints' : 'Recent Activity'}
            </h3>
            {complaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints found.</p>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 5).map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{complaint.description.slice(0, 60)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {complaint.category} • {complaint.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`status-badge ${
                      complaint.status === 'Resolved' 
                        ? 'status-resolved' 
                        : complaint.status === 'Escalated'
                        ? 'status-escalated'
                        : 'status-pending'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
