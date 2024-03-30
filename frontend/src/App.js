import React from "react";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Tweet from "./components/Tweet";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tweets" element={<Tweet />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;
