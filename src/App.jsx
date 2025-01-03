import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Reference from "./routes/Reference.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<>Working!!!</>} />
        <Route path="/help" element={<Reference />} />
        <Route path="*" element={<>Error!!!</>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;