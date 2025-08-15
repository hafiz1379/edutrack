import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const { auth } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudentsForClass = async (classId) => {
    try {
      const res = await axios.get(`/api/classes/${classId}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    fetchStudentsForClass(cls._id);
  };

  const addClass = async () => {
    try {
      if (!newClassName.trim()) {
        setError('Class name is required');
        return;
      }
      
      await axios.post('/api/classes', { name: newClassName });
      setNewClassName('');
      setError('');
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add class');
      console.error('Error adding class:', err);
    }
  };

  const updateClass = async () => {
    try {
      if (!editingClass.name.trim()) {
        setError('Class name is required');
        return;
      }
      
      await axios.put(`/api/classes/${editingClass._id}`, { name: editingClass.name });
      setEditingClass(null);
      setError('');
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update class');
      console.error('Error updating class:', err);
    }
  };

  const deleteClass = async (id) => {
    try {
      await axios.delete(`/api/classes/${id}`);
      fetchClasses();
      if (selectedClass && selectedClass._id === id) {
        setSelectedClass(null);
      }
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  const removeStudentFromClass = async (studentId) => {
    try {
      await axios.delete(`/api/students/${studentId}/class`);
      // Update local state
      setStudents(prev => prev.filter(s => s._id !== studentId));
      setSelectedClass(prev => ({
        ...prev,
        studentCount: prev.studentCount - 1
      }));
    } catch (err) {
      console.error('Error removing student from class:', err);
    }
  };

  const getPaymentStatus = (feeStatus) => {
    if (!feeStatus || feeStatus.length === 0) return 'No payments';
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentPayment = feeStatus.find(p => p.month === currentMonth);
    
    return currentPayment ? 'Paid' : 'Pending';
  };

  const getPaymentStatusColor = (feeStatus) => {
    if (!feeStatus || feeStatus.length === 0) return 'bg-gray-100 text-gray-800';
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentPayment = feeStatus.find(p => p.month === currentMonth);
    
    return currentPayment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classes Management</h2>
        {selectedClass && (
          <button
            onClick={() => setSelectedClass(null)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Classes
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!selectedClass ? (
        <>
          {/* Add Class Form */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter class name"
              />
              <button
                onClick={addClass}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Add Class
              </button>
            </div>
          </div>

          {/* Classes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <div 
                key={cls._id} 
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => handleClassClick(cls)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                    {auth.role === 'super' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClass(cls);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClass(cls._id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}
                    </div>
                    <div className="text-blue-600 text-sm font-medium">
                      View Students →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Class Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedClass.name}</h3>
                <p className="text-gray-600">{students.length} {students.length === 1 ? 'Student' : 'Students'}</p>
              </div>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                Class ID: {selectedClass._id.toString().slice(-6)}
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Students in {selectedClass.name}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grades</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">ID: {student._id.toString().slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(student.feeStatus)}`}>
                          {getPaymentStatus(student.feeStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.grades && student.grades.length > 0 ? (
                          <div className="text-sm text-gray-500">
                            {student.grades.map((grade, index) => (
                              <div key={index}>
                                {grade.subject}: {grade.score}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No grades</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Details
                        </button>
                        {auth.role === 'super' && (
                          <button 
                            onClick={() => removeStudentFromClass(student._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove from Class
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Class</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={editingClass.name}
                onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateClass}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Student Details</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{selectedStudent.class?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fee Payments</h4>
                {selectedStudent.feeStatus && selectedStudent.feeStatus.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStudent.feeStatus.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{payment.month}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    No fee payments recorded
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Grades</h4>
                {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStudent.grades.map((grade, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{grade.subject}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{grade.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    No grades recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;