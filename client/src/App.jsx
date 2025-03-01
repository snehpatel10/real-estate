import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Signin from './pages/SignIn'
import SignUp from './pages/SignUp'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import CreateListing from './pages/CreateListing'
import UpdateListing from './pages/UpdateListing'
import Listing from './pages/Listing'
import Search from './pages/Search'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/about" element = {<About />} />
        <Route path = "/sign-up" element = {<SignUp />} />  
        <Route path = "/sign-in" element = {<Signin />} />
        <Route path = '/forgot-password' element = {<ForgotPassword/>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path = "/search" element = {<Search />} />
        <Route path = "/listing/:listingId" element = {<Listing />} />
        <Route element = {<PrivateRoute />} >
        <Route path = "/profile" element = {<Profile />} />
        <Route path = "/create-listing" element = {<CreateListing />} />
        <Route path = "/update-listing/:listingId" element = {<UpdateListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
