import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    studentId: "",
    gender: "",
    dateOfBirth: "",
    parentContact: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { auth } = useAuth();

  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [currentPage, searchTerm, classFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/students", {
        params: {
          page: currentPage,
          limit: studentsPerPage,
          search: searchTerm,
          class: classFilter,
        },
      });
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/api/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const addStudent = async () => {
    try {
      if (
        !newStudent.name ||
        !newStudent.class ||
        !newStudent.studentId ||
        !newStudent.gender ||
        !newStudent.dateOfBirth ||
        !newStudent.parentContact
      ) {
        setError("Please fill all fields");
        return;
      }

      await axios.post("/api/students", newStudent);
      setNewStudent({
        name: "",
        class: "",
        studentId: "",
        gender: "",
        dateOfBirth: "",
        parentContact: "",
      });
      setError("");
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student");
      console.error("Error adding student:", err);
    }
  };

  const updateStudent = async () => {
    try {
      if (
        !editingStudent.name ||
        !editingStudent.class ||
        !editingStudent.studentId ||
        !editingStudent.gender ||
        !editingStudent.dateOfBirth ||
        !editingStudent.parentContact
      ) {
        setError("Please fill all fields");
        return;
      }

      await axios.put(`/api/students/${editingStudent._id}`, editingStudent);
      setEditingStudent(null);
      setError("");
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
      console.error("Error updating student:", err);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  const getPaymentStatus = (feeStatus) => {
    if (!feeStatus || feeStatus.length === 0) return "No payments";

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentPayment = feeStatus.find((p) => p.month === currentMonth);

    return currentPayment ? "Paid" : "In Debt";
  };

  const getPaymentStatusColor = (feeStatus) => {
    if (!feeStatus || feeStatus.length === 0)
      return "bg-gray-100 text-gray-800";

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentPayment = feeStatus.find((p) => p.month === currentMonth);

    return currentPayment
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination controls
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Students Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={newStudent.studentId}
              onChange={(e) =>
                setNewStudent({ ...newStudent, studentId: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter student ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={newStudent.gender}
              onChange={(e) =>
                setNewStudent({ ...newStudent, gender: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={newStudent.dateOfBirth}
              onChange={(e) =>
                setNewStudent({ ...newStudent, dateOfBirth: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Contact
            </label>
            <input
              type="text"
              value={newStudent.parentContact}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parentContact: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter parent contact"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={newStudent.class}
              onChange={(e) =>
                setNewStudent({ ...newStudent, class: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={addStudent}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Students List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.studentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.class?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                          student.feeStatus
                        )}`}
                      >
                        {getPaymentStatus(student.feeStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      {auth.role === "super" && (
                        <>
                          <button
                            onClick={() =>
                              setEditingStudent({
                                _id: student._id,
                                name: student.name,
                                class: student.class?._id || "",
                                studentId: student.studentId,
                                gender: student.gender,
                                dateOfBirth: student.dateOfBirth
                                  ? student.dateOfBirth.split("T")[0]
                                  : "",
                                parentContact: student.parentContact,
                              })
                            }
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStudent(student._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * studentsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * studentsPerPage, students.length)}
                </span>{" "}
                of <span className="font-medium">{students.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={editingStudent.studentId}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={editingStudent.gender}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      gender: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editingStudent.dateOfBirth}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Contact
                </label>
                <input
                  type="text"
                  value={editingStudent.parentContact}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      parentContact: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={editingStudent.class}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      class: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateStudent}
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Student Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-4">
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-medium">
                      {selectedStudent.studentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">
                      {selectedStudent.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">
                      {formatDate(selectedStudent.dateOfBirth)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent Contact:</span>
                    <span className="font-medium">
                      {selectedStudent.parentContact}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">
                      {selectedStudent.class?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-4">Payment Status</h4>
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                      selectedStudent.feeStatus
                    )}`}
                  >
                    {getPaymentStatus(selectedStudent.feeStatus)}
                  </span>
                </div>

                <h5 className="font-medium mb-2">Payment History</h5>
                {selectedStudent.feeStatus &&
                selectedStudent.feeStatus.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.feeStatus.map((payment, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between">
                          <span className="font-medium">{payment.month}</span>
                          <span className="text-green-600 font-medium">
                            ${payment.amount}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(payment.paymentDate)} •{" "}
                          {payment.paymentMethod}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payment records</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
