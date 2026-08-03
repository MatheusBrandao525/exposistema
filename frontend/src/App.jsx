import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'

// Pages (Lazy loaded for performance)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdSpaces = lazy(() => import('./pages/AdSpaces'))
const Sales = lazy(() => import('./pages/Sales'))
const Customers = lazy(() => import('./pages/Customers'))
const Financial = lazy(() => import('./pages/Financial'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Sellers = lazy(() => import('./pages/Sellers'))
const SellerForm = lazy(() => import('./pages/SellerForm'))
const SellerSales = lazy(() => import('./pages/SellerSales'))

const useAuth = () => {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  let user = null
  try {
    user = userJson ? JSON.parse(userJson) : null
  } catch (e) {
    console.error('Error parsing user from localStorage', e)
  }
  
  return { user, isAuthenticated: !!token && !!user }
}

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  const userRole = user?.role
  if (roles && !roles.includes(userRole)) {
    // Redirect based on role if unauthorized for this specific route
    if (userRole === 'seller') return <Navigate to="/seller/terminal" replace />
    return <Navigate to="/login" replace />
  }
  return children
}

const App = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading-screen">Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/seller/terminal" element={
            <ProtectedRoute roles={['seller']}>
              <SellerSales />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute roles={['admin', 'treasurer']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="financial" element={<Financial />} />

            {/* Admin Only Routes */}
            <Route path="spaces" element={
              <ProtectedRoute roles={['admin']}>
                <AdSpaces />
              </ProtectedRoute>
            } />
            <Route path="sellers" element={
              <ProtectedRoute roles={['admin']}>
                <Sellers />
              </ProtectedRoute>
            } />
            <Route path="sellers/new" element={
              <ProtectedRoute roles={['admin']}>
                <SellerForm />
              </ProtectedRoute>
            } />
            <Route path="sellers/edit/:id" element={
              <ProtectedRoute roles={['admin']}>
                <SellerForm />
              </ProtectedRoute>
            } />
            <Route path="customers" element={
              <ProtectedRoute roles={['admin', 'treasurer']}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute roles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}


export default App
