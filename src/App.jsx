import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Reference from "./routes/Reference.jsx";
import Homepage from "./routes/Homepage.jsx";
import Camera from "./routes/Camera.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/help" element={<Reference />} />
        <Route path="*" element={<>Error!!!</>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;