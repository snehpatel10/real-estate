import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Signin from './pages/SignIn'
import Signup from './pages/Signup'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/about" element = {<About />} />
        <Route path = "/sign-up" element = {<Signup />} />
        <Route path = "/sign-in" element = {<Signin />} />
        <Route path = "/profile" element = {<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
