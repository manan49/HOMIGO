import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Listings from './pages/Listings.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyBookings from './pages/MyBookings.jsx';
import HostListings from './pages/HostListings.jsx';
import HostListingNew from './pages/HostListingNew.jsx';
import HostListingEdit from './pages/HostListingEdit.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostListingNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostListingEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

