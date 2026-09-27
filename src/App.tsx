import { Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { Footer, Header } from '@/components/layout/Header'
import { PageTransition, RouteProgress } from '@/components/layout/PageTransition'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { AuthProvider } from '@/store/auth'
import { FavoritesProvider, WalletProvider } from '@/store/prefs'
import { ToastProvider } from '@/store/toast'

import Landing from '@/pages/Landing'
import Marketplace from '@/pages/Marketplace'
import ProductPage from '@/pages/Product'
import { Login, Register, ForgotPassword } from '@/pages/Auth'
import { About, Pricing } from '@/pages/Static'
import { NotFound } from '@/pages/NotFound'
import { Admin } from '@/pages/Admin'
import {
  BuyerDashboard,
  ChatPage,
  Favorites,
  OrdersPage,
  Payouts,
  SellerDashboard,
  SellerListings,
  WalletPage,
} from '@/pages/cabinet/Dashboards'

/* ─────────────────────────────────────────────
   Прокрутка к верху при смене маршрута
   ───────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brand-500" />
        <p className="text-xs uppercase tracking-widest text-white/30">Загрузка</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <Header />
      <RouteProgress />
      <PageTransition>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Рекламная платформа */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />

            {/* Маркетплейс */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Авторизация */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />

            {/* Кабинеты */}
            <Route path="/cabinet/buyer" element={<BuyerDashboard />} />
            <Route path="/cabinet/orders" element={<OrdersPage />} />
            <Route path="/cabinet/favorites" element={<Favorites />} />
            <Route path="/cabinet/wallet" element={<WalletPage />} />
            <Route path="/cabinet/chat" element={<ChatPage />} />
            <Route path="/cabinet/seller" element={<SellerDashboard />} />
            <Route path="/cabinet/seller/listings" element={<SellerListings />} />
            <Route path="/cabinet/payouts" element={<Payouts />} />

            {/* Админка */}
            <Route path="/admin" element={<Admin />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
      <Footer />
      <ChatWidget />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WalletProvider>
          <FavoritesProvider>
            <ScrollToTop />
            <AnimatePresence>
              <AppRoutes />
            </AnimatePresence>
          </FavoritesProvider>
        </WalletProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
