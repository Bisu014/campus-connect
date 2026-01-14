import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ComplaintCard from '@/components/ComplaintCard';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Complaint, ComplaintCategory } from '@/types';
import { FileX, Filter } from 'lucide-react';

const CATEGORIES: ComplaintCategory[] = [
  'Academic',
  'Infrastructure',
  'Faculty',
  'Hostel',
  'Library',
  'Canteen',
  'Sports',
  'Administration',
  'Other',
];

const AllComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ComplaintCategory>('all');

  useEffect(() => {
    if (!user) return;

    const complaintsRef = collection(db, 'complaints');
    let q;

    if (user.role === 'hod') {
      // HOD sees only their branch complaints
      q = query(
        complaintsRef,
        where('branch', '==', user.branch),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Admin/Principal sees ALL complaints
      q = query(complaintsRef, orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData: Complaint[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        complaintsData.push({
          ...data,
          id: docSnapshot.id,
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

  // Update status using updateDoc()
  const handleResolve = async (complaintId: string) => {
    if (!user) return;

    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, {
        status: 'Resolved',
        resolvedAt: Timestamp.now(),
        resolvedBy: user.name,
      });
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  return (
    <DashboardLayout
      title={user?.role === 'hod' ? 'Department Complaints' : 'All Complaints'}
      subtitle={user?.role === 'hod' 
        ? `Managing ${user.branch} department grievances`
        : 'Overview of all campus grievances'
      }
    >
      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'Pending', 'Resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | ComplaintCategory)}
            className="form-input w-auto py-1.5 text-sm"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <span className="text-sm text-muted-foreground ml-auto">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </span>
        </div>
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
            No Complaints Found
          </h3>
          <p className="text-muted-foreground">
            {statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'There are no complaints to display.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              showStudentInfo={true}
              showResolveButton={true}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AllComplaints;
