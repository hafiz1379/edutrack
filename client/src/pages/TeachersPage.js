import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subject: "",
    contact: "",
    email: "",
    gender: "",
    hireDate: "",
    degree: "",
    experience: "",
    address: "",
    baseSalary: "",
  });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, [searchTerm, subjectFilter]);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/teachers", {
        params: {
          search: searchTerm,
          subject: subjectFilter,
        },
      });
      setTeachers(res.data);
      setFilteredTeachers(res.data);

      // Extract unique subjects for filter
      const subjects = [...new Set(res.data.map((t) => t.subject))];
      setUniqueSubjects(subjects);
    } catch (err) {
      console.error("Error fetching teachers:", err);
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

  const addTeacher = async () => {
    try {
      if (
        !newTeacher.name ||
        !newTeacher.subject ||
        !newTeacher.email ||
        !newTeacher.gender ||
        !newTeacher.hireDate ||
        !newTeacher.degree ||
        newTeacher.experience === ""
      ) {
        setError("Please fill all required fields");
        return;
      }

      await axios.post("/api/teachers", newTeacher);
      setNewTeacher({
        name: "",
        subject: "",
        contact: "",
        email: "",
        gender: "",
        hireDate: "",
        degree: "",
        experience: "",
        address: "",
        baseSalary: "",
      });
      setError("");
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add teacher");
      console.error("Error adding teacher:", err);
    }
  };

  const updateTeacher = async () => {
    try {
      if (
        !editingTeacher.name ||
        !editingTeacher.subject ||
        !editingTeacher.email ||
        !editingTeacher.gender ||
        !editingTeacher.hireDate ||
        !editingTeacher.degree ||
        editingTeacher.experience === ""
      ) {
        setError("Please fill all required fields");
        return;
      }

      await axios.put(`/api/teachers/${editingTeacher._id}`, editingTeacher);
      setEditingTeacher(null);
      setError("");
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher");
      console.error("Error updating teacher:", err);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`/api/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  const updateTeacherClasses = async (teacherId, classIds) => {
    try {
      await axios.put(`/api/teachers/${teacherId}/classes`, { classIds });
      fetchTeachers();
    } catch (err) {
      console.error("Error updating teacher classes:", err);
    }
  };

  const getSalaryStatus = (salaryPayments) => {
    if (!salaryPayments || salaryPayments.length === 0) return "Pending";

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentPayment = salaryPayments.find((p) => p.month === currentMonth);

    return currentPayment ? "Paid" : "Pending";
  };

  const getSalaryStatusColor = (salaryPayments) => {
    if (!salaryPayments || salaryPayments.length === 0)
      return "bg-yellow-100 text-yellow-800";

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentPayment = salaryPayments.find((p) => p.month === currentMonth);

    return currentPayment
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Teachers Management</h2>

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
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Teacher Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={newTeacher.subject}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, subject: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, email: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              value={newTeacher.gender}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, gender: e.target.value })
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
              Hire Date *
            </label>
            <input
              type="date"
              value={newTeacher.hireDate}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, hireDate: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree *
            </label>
            <input
              type="text"
              value={newTeacher.degree}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, degree: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Master's, PhD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years) *
            </label>
            <input
              type="number"
              value={newTeacher.experience}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, experience: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Years of experience"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              type="text"
              value={newTeacher.contact}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, contact: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary
            </label>
            <input
              type="number"
              value={newTeacher.baseSalary}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, baseSalary: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Monthly salary"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={newTeacher.address}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, address: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
              placeholder="Enter address"
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

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Teachers List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-800 font-medium">
                            {teacher.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher.experience} years exp.
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSalaryStatusColor(
                        teacher.salaryPayments
                      )}`}
                    >
                      {getSalaryStatus(teacher.salaryPayments)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {teacher.classes && teacher.classes.length > 0
                        ? teacher.classes.map((cls) => cls.name).join(", ")
                        : "No classes assigned"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Details"
                    >
                      👁️
                    </button>
                    {auth.role === "super" && (
                      <>
                        <button
                          onClick={() =>
                            setEditingTeacher({
                              _id: teacher._id,
                              name: teacher.name,
                              subject: teacher.subject,
                              contact: teacher.contact,
                              email: teacher.email,
                              gender: teacher.gender,
                              hireDate: teacher.hireDate
                                ? teacher.hireDate.split("T")[0]
                                : "",
                              degree: teacher.degree,
                              experience: teacher.experience,
                              address: teacher.address,
                              baseSalary: teacher.baseSalary,
                            })
                          }
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTeacher(teacher._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Teacher</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={editingTeacher.subject}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      subject: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      email: e.target.value,
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
                  value={editingTeacher.gender}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
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
                  Hire Date
                </label>
                <input
                  type="date"
                  value={editingTeacher.hireDate}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      hireDate: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  value={editingTeacher.degree}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      degree: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={editingTeacher.experience}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      experience: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={editingTeacher.contact}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      contact: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary
                </label>
                <input
                  type="number"
                  value={editingTeacher.baseSalary}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      baseSalary: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={editingTeacher.address}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="2"
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

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Teacher Details</h3>
              <button
                onClick={() => setSelectedTeacher(null)}
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
                    <span className="font-medium">{selectedTeacher.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">
                      {selectedTeacher.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedTeacher.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">
                      {selectedTeacher.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="font-medium">
                      {formatDate(selectedTeacher.hireDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Degree:</span>
                    <span className="font-medium">
                      {selectedTeacher.degree}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">
                      {selectedTeacher.experience} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">
                      {selectedTeacher.contact || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">
                      {selectedTeacher.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Salary:</span>
                    <span className="font-medium">
                      ${selectedTeacher.baseSalary || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Classes Assignment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-4">Assigned Classes</h4>
                {selectedTeacher.classes &&
                selectedTeacher.classes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeacher.classes.map((cls) => (
                      <div
                        key={cls._id}
                        className="bg-white p-3 rounded border"
                      >
                        <span className="font-medium">{cls.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No classes assigned</p>
                )}

                {auth.role === "super" && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Assign Classes</h5>
                    <select
                      multiple
                      value={selectedTeacher.classes?.map((c) => c._id) || []}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        updateTeacherClasses(
                          selectedTeacher._id,
                          selectedOptions
                        );
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      size={Math.min(5, classes.length)}
                    >
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple
                    </p>
                  </div>
                )}
              </div>

              {/* Salary Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-4">
                  Salary Information
                </h4>
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSalaryStatusColor(
                      selectedTeacher.salaryPayments
                    )}`}
                  >
                    {getSalaryStatus(selectedTeacher.salaryPayments)}
                  </span>
                </div>

                <h5 className="font-medium mb-2">Payment History</h5>
                {selectedTeacher.salaryPayments &&
                selectedTeacher.salaryPayments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeacher.salaryPayments.map((payment, index) => (
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

                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    navigate("/dashboard/salaries");
                  }}
                  className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                >
                  Manage Salaries
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
