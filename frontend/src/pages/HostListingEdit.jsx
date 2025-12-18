import { useNavigate, useParams } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

function HostListingEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="page">
      <h2>Edit Listing</h2>
      <div className="card">
        <ListingForm listingId={id} onSuccess={() => navigate('/host/listings')} />
      </div>
    </div>
  );
}

export default HostListingEdit;
