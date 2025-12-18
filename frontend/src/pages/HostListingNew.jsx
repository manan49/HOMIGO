import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

function HostListingNew() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <h2>Create New Listing</h2>
      <div className="card">
        <ListingForm onSuccess={() => navigate('/host/listings')} />
      </div>
    </div>
  );
}

export default HostListingNew;
