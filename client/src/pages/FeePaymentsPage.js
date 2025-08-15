import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FeePaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    month: '',
    amount: '',
    paymentMethod: ''
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
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/fees');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const addPayment = async () => {
    try {
      if (!newPayment.studentId || !newPayment.month || !newPayment.amount || !newPayment.paymentMethod) {
        setError('Please fill all fields');
        return;
      }
      
      await axios.post('/api/fees', newPayment);
      setNewPayment({
        studentId: '',
        month: '',
        amount: '',
        paymentMethod: ''
      });
      setError('');
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
      console.error('Error adding payment:', err);
    }
  };

  const updatePayment = async () => {
    try {
      if (!editingPayment.month || !editingPayment.amount || !editingPayment.paymentMethod) {
        setError('Please fill all fields');
        return;
      }
      
      await axios.put(`/api/fees/${editingPayment.studentId}/${editingPayment.paymentId}`, {
        month: editingPayment.month,
        amount: editingPayment.amount,
        paymentMethod: editingPayment.paymentMethod
      });
      setEditingPayment(null);
      setError('');
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
      console.error('Error updating payment:', err);
    }
  };

  const deletePayment = async (studentId, paymentId) => {
    try {
      await axios.delete(`/api/fees/${studentId}/${paymentId}`);
      fetchPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Fee Payments Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Add Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Record New Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={newPayment.studentId}
              onChange={(e) => setNewPayment({...newPayment, studentId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.class?.name || 'N/A'})
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
        </div>
        <button
          onClick={addPayment}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Record Payment
        </button>
      </div>

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Payment</h3>
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
          <h3 className="text-lg font-semibold">Fee Payments History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{payment.className}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {auth.role === 'super' && (
                      <>
                        <button 
                          onClick={() => setEditingPayment({
                            studentId: payment.studentId,
                            paymentId: payment.id,
                            month: payment.month,
                            amount: payment.amount,
                            paymentMethod: payment.paymentMethod
                          })}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deletePayment(payment.studentId, payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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

export default FeePaymentsPage;