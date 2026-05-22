import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signupUser, clearError } from '../store/slices/authSlice'

export default function SignupPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { loading, error, session } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (session) navigate('/')
    return () => dispatch(clearError())
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(signupUser(form))
    if (signupUser.fulfilled.match(result)) navigate('/')
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Create an account</h2>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required minLength={6} className="input" placeholder="min. 6 characters" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
