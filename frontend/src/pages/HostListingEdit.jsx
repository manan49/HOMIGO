import { useNavigate, useParams } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

function HostListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="page">
      <h2>Edit Listing</h2>
      <ListingForm listingId={id} onSuccess={() => navigate('/host/listings')} />
    </div>
  );
}

export default HostListingEdit;

