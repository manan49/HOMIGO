const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['room', 'rent_home', 'cafe'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  city: {
    type: String,
    required: true,
  },
  address: String,
  pricePerNight: {
    type: Number,
    required: function requiredForStayTypes() {
      return this.type === 'room' || this.type === 'rent_home';
    },
  },
  maxGuests: Number,
  amenities: [String],
  images: [String],
  location: {
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model('Listing', ListingSchema);

module.exports = Listing;

