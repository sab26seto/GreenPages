// App.jsx
import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import Papa from "papaparse";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const App = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("/books.csv")
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setBooks(results.data);
          },
        });
      });
  }, []);

  const booksByYear = {};
  const authorsCount = {};
  const publishersCount = {};
  const ratingsCount = [];
  const pageCounts = [];

  books.forEach((book) => {
    const year = book.publication_date?.split("/").pop();
    if (year) booksByYear[year] = (booksByYear[year] || 0) + 1;

    const authors = book.authors?.split("/") || [];
    authors.forEach((author) => {
      if (author) authorsCount[author.trim()] = (authorsCount[author.trim()] || 0) + 1;
    });

    if (book.publisher)
      publishersCount[book.publisher.trim()] =
        (publishersCount[book.publisher.trim()] || 0) + 1;

    if (book.title && book.ratings_count) {
      ratingsCount.push({
        title: book.title,
        count: parseInt(book.ratings_count, 10) || 0,
      });
    }

    if (book.title && book.num_pages) {
      pageCounts.push({
        title: book.title,
        pages: parseInt(book.num_pages, 10) || 0,
      });
    }
  });

  const yearChart = {
    labels: Object.keys(booksByYear),
    datasets: [
      {
        label: "Books Published",
        data: Object.values(booksByYear),
        backgroundColor: "rgba(34,197,94,0.5)",
        fill: true,
      },
    ],
  };

  const authorChart = {
    labels: Object.keys(authorsCount).slice(0, 10),
    datasets: [
      {
        label: "Books by Author",
        data: Object.values(authorsCount).slice(0, 10),
        backgroundColor: "#6ee7b7",
      },
    ],
  };

  const publisherChart = {
    labels: Object.keys(publishersCount).slice(0, 10),
    datasets: [
      {
        label: "Books by Publisher",
        data: Object.values(publishersCount).slice(0, 10),
        backgroundColor: "#86efac",
      },
    ],
  };

  const ratingsChart = {
    labels: ratingsCount.slice(0, 10).map((b) => b.title),
    datasets: [
      {
        label: "Rating Count",
        data: ratingsCount.slice(0, 10).map((b) => b.count),
        backgroundColor: "#4ade80",
      },
    ],
  };

  const pageChart = {
    labels: pageCounts.slice(0, 10).map((b) => b.title),
    datasets: [
      {
        label: "Page Count",
        data: pageCounts.slice(0, 10).map((b) => b.count),
        backgroundColor: "#34d399",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ fontFamily: "Arial", backgroundColor: "#f0fdf4", minHeight: "100vh", margin: 0 }}>
      <header style={{ backgroundColor: "#a7f3d0", padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#065f46" }}>
        My Dashboard
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", padding: "2rem" }}>
        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>Books by Publication Year</h3>
          <Line data={yearChart} options={options} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>Top Authors by Number of Books</h3>
          <Bar data={authorChart} options={options} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>Top Publishers</h3>
          <Doughnut data={publisherChart} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>Top Rated Books</h3>
          <Bar data={ratingsChart} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>Books by Page Count</h3>
          <Bar data={pageChart} options={options} />
        </div>
      </div>
    </div>
  );
};

export default App;
