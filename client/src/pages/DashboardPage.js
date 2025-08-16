import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totals: { students: 0, teachers: 0, classes: 0 },
    charts: {
      feePaymentsByMonth: [],
      studentsByClass: [],
      incomeVsExpense: [],
    },
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/api/dashboard/stats");
      setDashboardData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Fee Payments",
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Students Distribution by Class",
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Income vs Expenses",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Chart data
  const feePaymentsChartData = {
    labels: dashboardData.charts.feePaymentsByMonth.map((d) => d.month),
    datasets: [
      {
        label: "Fee Payments ($)",
        data: dashboardData.charts.feePaymentsByMonth.map((d) => d.amount),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const studentsByClassChartData = {
    labels: dashboardData.charts.studentsByClass.map((d) => d.className),
    datasets: [
      {
        label: "Number of Students",
        data: dashboardData.charts.studentsByClass.map((d) => d.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const incomeVsExpenseChartData = {
    labels: dashboardData.charts.incomeVsExpense.map((d) => d.month),
    datasets: [
      {
        label: "Income ($)",
        data: dashboardData.charts.incomeVsExpense.map((d) => d.income),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
      {
        label: "Expenses ($)",
        data: dashboardData.charts.incomeVsExpense.map((d) => d.expense),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">School Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {auth.role === "super" ? "Super Admin" : "Sub Admin"}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Students</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totals.students}
              </p>
            </div>
            <div className="p-3 bg-blue-400 rounded-full">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Teachers</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totals.teachers}
              </p>
            </div>
            <div className="p-3 bg-green-400 rounded-full">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Classes</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totals.classes}
              </p>
            </div>
            <div className="p-3 bg-purple-400 rounded-full">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fee Payments Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-80">
            {" "}
            {/* Fixed height for chart */}
            <Bar options={barChartOptions} data={feePaymentsChartData} />
          </div>
        </div>

        {/* Students by Class Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-80">
            {" "}
            {/* Fixed height for chart */}
            <Pie options={pieChartOptions} data={studentsByClassChartData} />
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="h-80">
          {" "}
          {/* Fixed height for chart */}
          <Line options={lineChartOptions} data={incomeVsExpenseChartData} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activities
        </h3>
        <div className="space-y-4">
          {dashboardData.recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={`p-2 rounded-full mr-4 ${
                  activity.type === "student"
                    ? "bg-blue-100 text-blue-600"
                    : activity.type === "fee"
                    ? "bg-green-100 text-green-600"
                    : activity.type === "class"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {activity.type === "student" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                )}
                {activity.type === "fee" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                )}
                {activity.type === "class" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                )}
                {activity.type === "salary" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
