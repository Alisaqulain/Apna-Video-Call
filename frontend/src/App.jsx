import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';  // Import AuthProvider
import VideoMeetComponent from "./pages/videoMeet"
import HomeComponent from './pages/home';
import History from './pages/history';
function App() {
  return (
    <Router> {}
      <AuthProvider> {}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Auth" element={<Authentication />} />
          <Route path="/Home" element={<HomeComponent />} />
          <Route path="/history" element={<History />} />
          <Route path="/:url" element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
