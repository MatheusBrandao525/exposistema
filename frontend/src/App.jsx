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

// Mock Auth Hook (to be replaced with real Sanctum auth)
const useAuth = () => {
  const [user, setUser] = React.useState({ role: 'admin' }) // Default for dev
  return { user, isAuthenticated: !!user }
}

const App = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading-screen">Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/seller/terminal" element={<SellerSales />} />
          
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="spaces" element={<AdSpaces />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sellers" element={<Sellers />} />
            <Route path="sellers/new" element={<SellerForm />} />
            <Route path="sellers/edit/:id" element={<SellerForm />} />
            <Route path="customers" element={<Customers />} />
            <Route path="financial" element={<Navigate to="/sales" />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
