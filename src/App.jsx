import './App.css'
import { Route, Routes } from "react-router-dom";
import Login from './Pages/Login';
import Home from './Pages/Home';


const App = () => {

  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>

  );
};

export default App
