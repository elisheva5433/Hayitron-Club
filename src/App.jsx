import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import BenefitsPage from './pages/BenefitsPage';
import BenefitPartnerPage from './pages/BenefitPartnerPage';
import CommunityPage from './pages/CommunityPage';
import PersonalPage from './pages/PersonalPage';
import AdminPage from './pages/AdminPage';
import BeitNaamanPage from './pages/BeitNaamanPage';
import BenBaitPage from './pages/BenBaitPage';
import CardBenefitsPage from './pages/CardBenefitsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/cards/:cardId/benefits" element={<CardBenefitsPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/benefits/:businessId" element={<BenefitPartnerPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/beit-naaman" element={<BeitNaamanPage />} />
            <Route path="/ben-bait" element={<BenBaitPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
