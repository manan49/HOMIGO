import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

function HostListingNew() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <h2>Add Listing</h2>
      <ListingForm onSuccess={() => navigate('/host/listings')} />
    </div>
  );
}

export default HostListingNew;

