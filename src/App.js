// App.jsx
import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import Papa from "papaparse";
import goodreadsLogo from "./goodreads.png"; 
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
  const [yearFilter, setYearFilter] = useState("all");
  const [ratingAuthorFilter, setRatingAuthorFilter] = useState("all");
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      dashboardTitle: "Green Pages Book Dashboard",
      dashboardIntroTitle: "Welcome to Green Pages Book Dashboard!",
      dashboardIntro: "Explore real data about the books, publishers and authors from online website GoodReads. This data was last updated December 8th, 2020.",

      dashboardSections: [
        {
          title: "All Book Titles",
          description: "displays a list of all the book titles that can be found on GoodReads."
        },
        {
          title: "Books by Publication Year",
          description: "presents a line chart depicting the number of books published throughout the years."
        },
        {
          title: "Top Authors by Number of Books",
          description: "presents a bar chart showing the number of books published by the top ten most published authors."
        },
        {
          title: "Top Publishers",
          description: "presents a doughnut chart depicting the number of books published by the top ten most published publishers."
        }
       ],
      yearChartTitle: "Books by Publication Year",
      allYears: "All Years",
      before1990: "Before 1990",
      after1986: "After 1986",
      bookTitles: "All Book Titles",
      topAuthors: "Top Authors by Number of Books",
      topPublishers: "Top Publishers",
      topRated: "Top Rated Books",
      allBooks: "All Books",
      languageToggle: "Français"
    },
    fr: {
      dashboardTitle: "Tableau de Bord pour des livres Green Pages",
      dashboardIntroTitle: "Bienvenue sur le Tableau de Bord des Livres Green Pages!",
      dashboardIntro: "Explorez des données réelles sur les livres, éditeurs et auteurs du site GoodReads. Ces données ont été mises à jour pour la dernière fois le 8 décembre 2020.",
      dashboardSections: [
        {
          title: "Tous les Titres de Livres",
          description: "affiche une liste de tous les titres de livres que l'on peut trouver sur GoodReads."
        },
        {
          title: "Livres par Année de Publication",
          description: "présente un graphique linéaire décrivant le nombre de livres publiés au fil des ans."
        },
        {
          title: "Auteurs les Plus Prolifiques",
          description: "présente un graphique à barres montrant le nombre de livres publiés par les dix auteurs les plus prolifiques."
        },
        {
          title: "Meilleurs Éditeurs",
          description: "présente un graphique en doughnut décrivant le nombre de livres publiés par les dix éditeurs les plus prolifiques."
        }
       ],
       yearChartTitle: "Livres par Année de Publication",
      allYears: "Toutes les Années",
      before1990: "Avant 1990",
      after1986: "Après 1986",
      bookTitles: "Tous les Titres de Livres",
      topAuthors: "Auteurs les Plus Prolifiques",
      topPublishers: "Meilleurs Éditeurs",
      topRated: "Livres les Mieux Notés",
      allBooks: "Tous les Livres",
      languageToggle: "English"
    }
  };

  const t = translations[language];

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
  const ratingsByAuthor = [];
  const bookTitles =[];

  books.forEach((book) => {
    const year = book.publication_date?.split("/").pop();
     if (year && !isNaN(year)) {
      booksByYear[year] = (booksByYear[year] || 0) + 1;
    }

     const authors = book.authors?.split("/") || [];
    authors.forEach((author) => {
      const name = author.trim();
      if (name) {
        authorsCount[name] = (authorsCount[name] || 0) + 1;
        if (!ratingsByAuthor[name]) ratingsByAuthor[name] = [];
        if (book.title && book.average_rating) {
          ratingsByAuthor[name].push({
            title: book.title,
            count: parseFloat(book.average_rating) || 0,
          });
        }
      }
    });

    if (book.publisher)
      publishersCount[book.publisher.trim()] =
        (publishersCount[book.publisher.trim()] || 0) + 1;
    
    if (book.title)
      bookTitles.push(book.title.trim());

  });

  const topAuthors = Object.keys(authorsCount)
    .sort((a, b) => authorsCount[b] - authorsCount[a])
    .slice(0, 5);
  
  const generateColorPalette = (count) => {
    const baseColors = ["#6ee7b7", "#86efac", "#4ade80", "#34d399", "#22c55e", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"];
    baseColors.reverse();
    return baseColors.slice(0, count);
  };

  const filteredYears = Object.keys(booksByYear)
    .filter((year) => {
      const y = parseInt(year);
      if (yearFilter === "before1990") return y < 1990;
      if (yearFilter === "after1986") return y > 1986;
      return true;
    })
    .sort((a, b) => parseInt(a) - parseInt(b));

  const titlesSet = bookTitles.sort((a, b) => b.count - a.count).slice(0, 10);

  const yearChart = {
    labels: filteredYears,
    datasets: [
      {
        label: "Books Published",
        data: filteredYears.map((x) => booksByYear[x]),
        backgroundColor: "rgba(34,197,94,0.5)",
        fill: true,
      },
    ],
  };

  const authorChart = {
     labels: Object.keys(authorsCount)
      .sort((a, b) => authorsCount[b] - authorsCount[a])
      .slice(0, 10),
     datasets: [
      {
        label: "Books by Author",
        data: Object.values(authorsCount)
          .sort((a, b) => b - a)
          .slice(0, 10),
        backgroundColor: generateColorPalette(10),
      },
    ],
  };

  const publisherChart = {
    labels: Object.keys(publishersCount)
      .sort((a, b) => publishersCount[b] - publishersCount[a])
      .slice(0, 10),
    datasets: [
      {
        label: "Books by Publisher",
        data: Object.values(publishersCount)
          .sort((a, b) => b - a)
          .slice(0, 10),
        backgroundColor: generateColorPalette(10),
      },
    ],
  };

 const getRatingChartData = () => {
    let ratings = [];
    if (ratingAuthorFilter === "all") {
      Object.values(ratingsByAuthor).forEach((books) => ratings.push(...books));
    } else {
      ratings = ratingsByAuthor[ratingAuthorFilter] || [];
    }
    const sorted = ratings.sort((a, b) => b.count - a.count).slice(0, 10);
    return {
      labels: sorted.map((b) => b.title),
      datasets: [
        {
          label: "Average Rating",
          data: sorted.map((b) => b.count),
          backgroundColor: generateColorPalette(10),
        },
      ],
    };
  };

  const ratingsChart = getRatingChartData();


  const options = {
    responsive: true,
    indexAxis: 'x',
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ fontFamily: "Arial", backgroundColor: "#f0fdf4", minHeight: "100vh", margin: 0 }}>

      <header style={{ 
        backgroundColor: "#a7f3d0", 
        padding: "1rem", 
        color: "#065f46" 
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>{t.dashboardTitle}</h1>
          <button 
            onClick={() => setLanguage(language === "en" ? "fr" : "en")} 
            style={{ 
              padding: "0.5rem", 
              backgroundColor: "#065f46", 
              color: "#d1fae5", 
              border: "none", 
              borderRadius: "5px" }}
          >
            {language === "en" ? "Français" : "English"}
          </button>
        </div>
      </header> 

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", padding: "2rem" }}>
        
        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>{t.dashboardIntroTitle}</h3>
          <p>{t.dashboardIntro}</p>
          <img src={goodreadsLogo} alt="goodreads" style={{ maxWidth: "100%", borderRadius: "10px" }} />
           <ul style={{paddingLeft:0}}>
            {t.dashboardSections.map((section, index) => (
              <li key={index} style={{ marginBottom: "0.5rem", listStyleType: "none", paddingLeft:"0" }}>
                <strong>{section.title}:</strong> {section.description}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem"}}>
          <div style={{ position: "sticky", top: 0, backgroundColor: "#d1fae5", paddingBottom: "0.5rem", zIndex: 1 }}>
            <h3>{t.bookTitles}</h3>
          </div>
          <div style={{ overflowY: "scroll", maxHeight: "350px", overflowX: "hidden" }}>
            <ul style={{ paddingLeft: "1rem", listStyleType: "none", margin: 0 }}>
              {bookTitles.sort().map((title, index) => (
                <li key={index} style={{ marginBottom: "0.25rem", borderBottom: "1px solid #065f46", paddingBottom: "0.25rem" }}>{title}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>{t.yearChartTitle}</h3>
          <select onChange={(e) => setYearFilter(e.target.value)} value={yearFilter} style={{ marginBottom: "1rem" }}>
            <option value="all">{t.allYears}</option>
            <option value="before1990">{t.before1990}</option>
            <option value="after1986">{t.after1986}</option>
          </select>
          <Line data={yearChart} options={options} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>{t.topAuthors}</h3>
          <Bar data={authorChart} options={{responsive: true, scales: {y: {beginAtZero: true, max:100}}}} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>{t.topPublishers}</h3>
          <Doughnut data={publisherChart} />
        </div>

        <div style={{ backgroundColor: "#d1fae5", borderRadius: "10px", padding: "1rem" }}>
          <h3>{t.topRated}</h3>
          <select onChange={(e) => setRatingAuthorFilter(e.target.value)} value={ratingAuthorFilter} style={{ marginBottom: "1rem" }}>
            <option value="all">{t.allBooks}</option>
            {topAuthors.map((author) => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
          <Bar data={ratingsChart} options={{responsive:true, scales: { x: {beginAtZero:true,}}, indexAxis: 'y'}} />
        </div>

      </div>
    </div>
  );
};

export default App;
