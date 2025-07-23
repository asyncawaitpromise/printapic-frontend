import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute, OptionalRoute } from './components/AuthWrapper.jsx';
import Reference from "./routes/Reference.jsx";
import Homepage from "./routes/Homepage.jsx";
import Camera from "./routes/Camera.jsx";
import Gallery from "./routes/Gallery.jsx";
import SignIn from "./routes/SignIn.jsx";
import SignUp from "./routes/SignUp.jsx";
import Settings from "./routes/Settings.jsx";
import Pricing from "./routes/Pricing.jsx";
import Contact from "./routes/Contact.jsx";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OptionalRoute><Homepage /></OptionalRoute>} />
          <Route path="/camera" element={<ProtectedRoute><Camera /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/signin" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/pricing" element={<OptionalRoute><Pricing /></OptionalRoute>} />
          <Route path="/contact" element={<OptionalRoute><Contact /></OptionalRoute>} />
          <Route path="/help" element={<OptionalRoute><Reference /></OptionalRoute>} />
          <Route path="*" element={<>Error!!!</>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;