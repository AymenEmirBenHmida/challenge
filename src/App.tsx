import "./App.css";
// Router imports for navigation
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// Page components
import TimeTable from "./pages/timeTable";
import GetFolderDocuments from "./pages/materialsNotesPage";
import MaterialsPage from "./pages/materialsPage";

function App() {
  return (
    <div>
      <Router>
        {/* Main Navigation Bar */}
        <nav className="bg-[#333] p-4">
          <ul className="flex justify-center gap-8 m-0 p-0 list-none">
            {/* Materials Link */}
            <li>
              {/* Navigation link */}
              <Link 
                to="/" 
                className="text-white no-underline text-lg px-4 py-2 hover:bg-[#555] hover:rounded transition-colors duration-300"
              >
                Materials
              </Link>
            </li>
            {/* TimeTable Link */}
            <li>
              <Link 
                to="/timeTable" 
                className="text-white no-underline text-lg px-4 py-2 hover:bg-[#555] hover:rounded transition-colors duration-300"
              >
                TimeTable
              </Link>
            </li>
          </ul>
        </nav>
        {/* Main Content Area */}
        <div className="p-5 flex justify-center">
          {/* Route Configuration */}
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
