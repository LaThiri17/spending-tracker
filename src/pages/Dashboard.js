import React, { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("Monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load records from localStorage on mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("spendingData")) || [];
    setRecords(savedData);
  }, []);

  // Filter records by selected filter and date
  const filterRecords = () => {
    if (!selectedDate) return [];

    return records.filter((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);

      if (filter === "Daily") {
        return recordDate.toDateString() === selectedDate.toDateString();
      }

      if (filter === "Weekly") {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      }

      if (filter === "Monthly") {
        return (
          recordDate.getFullYear() === selectedDate.getFullYear() &&
          recordDate.getMonth() === selectedDate.getMonth()
        );
      }

      return true;
    });
  };

  // Group records by category
  const groupByCategory = (recs) => {
    return recs.reduce((group, r) => {
      group[r.category] = (group[r.category] || 0) + r.amount;
      return group;
    }, {});
  };

  // Prepare data for line chart
  const lineChartData = () => {
    const filtered = filterRecords();

    const sumsByDate = filtered.reduce((acc, r) => {
      const dateObj = new Date(r.date);
      const dayKey = dateObj.toISOString().slice(0, 10);
      acc[dayKey] = (acc[dayKey] || 0) + r.amount;
      return acc;
    }, {});

    let sortedDates;

    if (filter === "Weekly") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      sortedDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        sortedDates.push(d.toISOString().slice(0, 10));
      }
    } else if (filter === "Daily") {
      sortedDates = [selectedDate.toISOString().slice(0, 10)];
    } else {
      sortedDates = Object.keys(sumsByDate).sort();
    }

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Spending",
          data: sortedDates.map((d) => sumsByDate[d] || 0),
          borderColor: "rgb(75,192,192)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    };
  };

  // Prepare data for pie chart
  const pieChartData = () => {
    const filtered = filterRecords();
    const grouped = groupByCategory(filtered);
    const categories = Object.keys(grouped);
    const amounts = Object.values(grouped);

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#66FF66",
      "#FF6666",
      "#6699FF",
      "#FFCC99",
    ];

    return {
      labels: categories,
      datasets: [
        {
          label: "Spending by Category",
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
        },
      ],
    };
  };

  // Totals
  const totalAllTime = records.reduce((sum, r) => sum + r.amount, 0);
  const filteredRecords = filterRecords();
  const totalFiltered = filteredRecords.reduce((sum, r) => sum + r.amount, 0);

  // Chart options
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
  };

  // Format selectedDate string for display
  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    if (filter === "Daily") {
      return selectedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (filter === "Weekly") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return (
        startOfWeek.toLocaleDateString() + " - " + endOfWeek.toLocaleDateString()
      );
    }
    if (filter === "Monthly") {
      return selectedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    }
    return "";
  };

  return (
    <div className="mt-4">
      <h2 className="mb-4">Analytics Dashboard</h2>

      <p>
        <strong>Total Spending (All Time):</strong> ${totalAllTime.toFixed(2)}
      </p>

      <p>
        <strong>Total Spending ({filter} - {formatSelectedDate()}):</strong>{" "}
        ${totalFiltered.toFixed(2)}
      </p>

      <div className="mb-3">
        <label className="form-label me-2"><strong>Filter:</strong></label>
        {["Daily", "Weekly", "Monthly"].map((type) => (
          <button
            key={type}
            className={`btn me-2 ${filter === type ? "btn-info" : "btn-outline-secondary"}`}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mb-4">
        {filter === "Daily" && (
          <>
            <label className="form-label"><strong>Select Date:</strong></label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="form-control"
            />
          </>
        )}

        {filter === "Weekly" && (
          <>
            <label className="form-label"><strong>Select Week (any date within the week):</strong></label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select any date in the week"
              className="form-control"
            />
          </>
        )}

        {filter === "Monthly" && (
          <>
            <label className="form-label"><strong>Select Month:</strong></label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className="form-control"
            />
          </>
        )}
      </div>

      <h3>Spending by Category</h3>
      <ul className="list-group mb-4">
        {Object.entries(groupByCategory(filteredRecords)).map(([cat, amt]) => (
          <li key={cat} className="list-group-item d-flex justify-content-between align-items-center">
            {cat}
            <span className="badge bg-info text-white">${amt.toFixed(2)}</span>
          </li>
        ))}
        {filteredRecords.length === 0 && (
          <li className="list-group-item text-muted">No spending records for this period.</li>
        )}
      </ul>

      <h3>Spending Over Time (Line Chart)</h3>
      <div style={{ height: 300 }} className="mb-5">
        {filteredRecords.length > 0 ? (
          <Line data={lineChartData()} options={chartOptions} />
        ) : (
          <p className="text-muted">No data to display.</p>
        )}
      </div>

      <h3>Spending by Category (Pie Chart)</h3>
      <div style={{ height: 400, maxWidth: 500 }}>
        {filteredRecords.length > 0 ? (
          <Pie data={pieChartData()} options={chartOptions} />
        ) : (
          <p className="text-muted">No data to display.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
