import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ComplaintCategory } from '@/types';
import { Send, CheckCircle } from 'lucide-react';

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

const LodgeComplaint: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: '' as ComplaintCategory | '',
    description: '',
    attachmentUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) return;

    setLoading(true);

    try {
      // Add document to Firestore using addDoc()
      await addDoc(collection(db, 'complaints'), {
        studentEmail: user.email,
        studentName: user.name,
        category: formData.category,
        description: formData.description,
        status: 'Pending',
        timestamp: Timestamp.now(),
        branch: user.branch,
        attachmentUrl: formData.attachmentUrl || null,
      });

      setSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        navigate('/my-complaints');
      }, 2000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout title="Lodge Complaint" subtitle="Submit a new grievance">
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Complaint Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your complaint has been registered successfully. You will be notified of any updates.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your complaints...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Lodge Complaint" 
      subtitle="Submit a new grievance for review"
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplaintCategory })}
              required
              className="form-input appearance-none cursor-pointer"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              placeholder="Describe your complaint in detail. Include relevant dates, locations, and any individuals involved..."
              className="form-input resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum 20 characters. Be specific and factual.
            </p>
          </div>

          {/* Attachment URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Attachment URL (Optional)
            </label>
            <input
              type="url"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="form-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Link to supporting documents (Google Drive, Dropbox, etc.)
            </p>
          </div>

          {/* Metadata Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Submitted by:</strong> {user?.name} ({user?.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Department:</strong> {user?.branch}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.category || formData.description.length < 20}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Complaint
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LodgeComplaint;
