import React from 'react'
import { Link } from 'react-router-dom'

function Signup() {
  return (
    <div className='p-3 max-w-lg mx-auto'> 
      <h1 className='text-3xl text-center font-semibold my-7'>Create an account</h1>
      <form className='flex flex-col gap-4'>
        <input type="text" placeholder='Enter username' className='border p-3 rounded-lg' id='username' />
        <input type="text" placeholder='Enter username' className='border p-3 rounded-lg' id='email' />
        <input type="password" placeholder='Enter username' className='border p-3 rounded-lg' id='password' />
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50'>
          Sign up
        </button>
      </form>
      <div className='flex gap-1 mt-5'>
        <p>Have an account?{' '}</p>
        <Link to='/sign-in'>
        <span className='text-blue-700 hover:text-blue-900 transition-all duration-150'>Sign in</span>
        </Link>
      </div>
    </div>
  )
}
export default Signup
