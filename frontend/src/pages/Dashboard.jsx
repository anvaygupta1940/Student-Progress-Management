import React, { useState, useEffect } from 'react';
import { studentsAPI, syncAPI } from '../services/api';
import { downloadFile } from '../services/api';
import StudentTable from '../components/StudentTable';
import StudentForm from '../components/StudentForm';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingStudent) {
        // Update existing student
        await studentsAPI.update(editingStudent._id, formData);
        toast.success('Student updated successfully');
      } else {
        // Create new student
        await studentsAPI.create(formData);
        toast.success('Student created successfully');
      }
      
      setShowForm(false);
      setEditingStudent(null);
      await fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error saving student:', error);
      const message = error.response?.data?.message || 'Failed to save student';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await studentsAPI.delete(studentId);
      toast.success('Student deleted successfully');
      await fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting student:', error);
      const message = error.response?.data?.message || 'Failed to delete student';
      toast.error(message);
    }
  };

  const handleSyncStudent = async (handle) => {
    try {
      const loadingToast = toast.loading(`Syncing data for ${handle}...`);
      
      await syncAPI.syncStudent(handle);
      
      toast.dismiss(loadingToast);
      toast.success(`Data synced successfully for ${handle}`);
      
      await fetchStudents(); // Refresh the list to show updated data
    } catch (error) {
      console.error('Error syncing student:', error);
      const message = error.response?.data?.message || 'Failed to sync student data';
      toast.error(message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const loadingToast = toast.loading('Preparing CSV export...');
      
      const response = await studentsAPI.exportCSV();
      
      // Create filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `students-${date}.csv`;
      
      downloadFile(response.data, filename);
      
      toast.dismiss(loadingToast);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      const message = error.response?.data?.message || 'Failed to export CSV';
      toast.error(message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <StudentTable
        students={students}
        loading={loading}
        onAdd={handleAddStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onSync={handleSyncStudent}
        onExport={handleExportCSV}
      />

      <StudentForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        student={editingStudent}
        loading={formLoading}
      />
    </div>
  );
};

export default Dashboard;