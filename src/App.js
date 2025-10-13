import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./mainPage/MainPage";
import Header from "./Header/Header";
import { SearchProvider } from "./contexts/SearchContext";

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="container-lg mt-4">
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
