import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Signin from './pages/SignIn'
import Signup from './pages/Signup'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/about" element = {<About />} />
        <Route path = "/sign-up" element = {<Signup />} />
        <Route path = "/sign-in" element = {<Signin />} />
        <Route element = {<PrivateRoute />} >
        <Route path = "/profile" element = {<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
