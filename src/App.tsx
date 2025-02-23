import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TimeTable from "./pages/timeTable";
import GetFolderDocuments from "./pages/materialsNotesPage";
import MaterialsPage from "./pages/materialsPage";

function App() {
  return (
    <div>
      <Router>
        <nav>
          <ul className="navbar">
            <li>
              <Link to="/">Materials</Link>
            </li>
            <li>
              <Link to="/timeTable">TimeTable</Link>
            </li>
          </ul>
        </nav>
        <div
          style={{ padding: "20px", display: "flex", justifyContent: "center" }}
        >
          <Routes>
            <Route path="/" element={<MaterialsPage />} />
            <Route path="/timeTable" element={<TimeTable />} />
            <Route path="/folder/:folderId" element={<GetFolderDocuments />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
