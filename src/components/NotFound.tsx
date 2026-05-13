import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold text-slate-800">404</h1>
        <p className="mt-4 text-lg text-slate-600">Page not found.</p>
        <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Go to Home</Link>
          <button onClick={() => navigate(-1)} className="inline-block px-4 py-2 border border-slate-300 rounded hover:bg-slate-100">Go Back</button>
        </div>
      </div>
    </div>
  )
}
