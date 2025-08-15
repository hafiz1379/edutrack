import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SalaryPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newPayment, setNewPayment] = useState({
    teacherId: '',
    month: '',
    amount: '',
    paymentMethod: '',
    notes: ''
  });
  const [editingPayment, setEditingPayment] = useState(null);
  const [error, setError] = useState('');
  const { auth } = useAuth();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Online', 'Check'];

  useEffect(() => {
    fetchPayments();
    fetchTeachers();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/salaries');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching salary payments:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const addPayment = async () => {
    try {
      if (!newPayment.teacherId || !newPayment.month || !newPayment.amount || !newPayment.paymentMethod) {
        setError('Please fill all required fields');
        return;
      }
      
      await axios.post('/api/salaries', newPayment);
      setNewPayment({
        teacherId: '',
        month: '',
        amount: '',
        paymentMethod: '',
        notes: ''
      });
      setError('');
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record salary payment');
      console.error('Error adding salary payment:', err);
    }
  };

  const updatePayment = async () => {
    try {
      if (!editingPayment.month || !editingPayment.amount || !editingPayment.paymentMethod) {
        setError('Please fill all required fields');
        return;
      }
      
      await axios.put(`/api/salaries/${editingPayment.teacherId}/${editingPayment.paymentId}`, {
        month: editingPayment.month,
        amount: editingPayment.amount,
        paymentMethod: editingPayment.paymentMethod,
        notes: editingPayment.notes
      });
      setEditingPayment(null);
      setError('');
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salary payment');
      console.error('Error updating salary payment:', err);
    }
  };

  const deletePayment = async (teacherId, paymentId) => {
    try {
      await axios.delete(`/api/salaries/${teacherId}/${paymentId}`);
      fetchPayments();
    } catch (err) {
      console.error('Error deleting salary payment:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Salary Management</h2>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
          <span className="font-medium">Total Payments:</span> {payments.length}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Add Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Record New Salary Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              value={newPayment.teacherId}
              onChange={(e) => setNewPayment({...newPayment, teacherId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.subject})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={newPayment.month}
              onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={newPayment.paymentMethod}
              onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Method</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={newPayment.notes}
              onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Additional notes"
            />
          </div>
        </div>
        <button
          onClick={addPayment}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Record Payment
        </button>
      </div>

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Salary Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={editingPayment.month}
                  onChange={(e) => setEditingPayment({...editingPayment, month: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={editingPayment.paymentMethod}
                  onChange={(e) => setEditingPayment({...editingPayment, paymentMethod: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingPayment.notes}
                  onChange={(e) => setEditingPayment({...editingPayment, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingPayment(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updatePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Salary Payments History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-800 font-medium">
                            {payment.teacherName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payment.teacherName}</div>
                        <div className="text-sm text-gray-500">Base: ${payment.baseSalary}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{payment.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{payment.month}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">${payment.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(payment.paymentDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={payment.notes}>
                      {payment.notes || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {auth.role === 'super' && (
                      <>
                        <button 
                          onClick={() => setEditingPayment({
                            teacherId: payment.teacherId,
                            paymentId: payment.id,
                            month: payment.month,
                            amount: payment.amount,
                            paymentMethod: payment.paymentMethod,
                            notes: payment.notes
                          })}
                          className="text-yellow-600 hover:text-yellow-900 mr-3 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => deletePayment(payment.teacherId, payment.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                    {auth.role === 'sub' && (
                      <span className="text-gray-400">No actions</span>
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

export default SalaryPaymentsPage;