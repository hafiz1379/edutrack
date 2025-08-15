import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '', contact: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [error, setError] = useState('');
  const { auth } = useAuth();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const addTeacher = async () => {
    try {
      if (!newTeacher.name || !newTeacher.subject) {
        setError('Name and subject are required');
        return;
      }
      
      await axios.post('/api/teachers', newTeacher);
      setNewTeacher({ name: '', subject: '', contact: '' });
      setError('');
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
      console.error('Error adding teacher:', err);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`/api/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
    }
  };

  const updateTeacher = async () => {
    try {
      if (!editingTeacher.name || !editingTeacher.subject) {
        setError('Name and subject are required');
        return;
      }
      
      await axios.put(`/api/teachers/${editingTeacher._id}`, {
        name: editingTeacher.name,
        subject: editingTeacher.subject,
        contact: editingTeacher.contact
      });
      setEditingTeacher(null);
      setError('');
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teacher');
      console.error('Error updating teacher:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Teachers Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Add Teacher Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter teacher name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Optional)</label>
            <input
              type="text"
              value={newTeacher.contact}
              onChange={(e) => setNewTeacher({...newTeacher, contact: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter contact info"
            />
          </div>
        </div>
        <button
          onClick={addTeacher}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Teacher
        </button>
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Teacher</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={editingTeacher.subject}
                  onChange={(e) => setEditingTeacher({...editingTeacher, subject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={editingTeacher.contact}
                  onChange={(e) => setEditingTeacher({...editingTeacher, contact: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateTeacher}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Teachers List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.contact || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {auth.role === 'super' && (
                      <>
                        <button 
                          onClick={() => setEditingTeacher({
                            _id: teacher._id,
                            name: teacher.name,
                            subject: teacher.subject,
                            contact: teacher.contact || ''
                          })}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteTeacher(teacher._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {auth.role === 'sub' && (
                      <span className="text-gray-400">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;