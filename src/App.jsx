import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Reference />} />
        <Route path="*" element={<>Error!!!</>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;