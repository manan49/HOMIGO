const express = require('express');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const { authRequired } = require('../middleware/authMiddleware');
const { getDistanceInKm } = require('../utils/distance');

const router = express.Router();

function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/listings (protected – hosts only)
router.post('/', authRequired, async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      city,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
      location,
      openingTime,
      closingTime,
    } = req.body;

    if (!type || !title || !city) {
      return res.status(400).json({ message: 'type, title, and city are required' });
    }

    const stayTypes = ['room', 'rent_home'];
    if (stayTypes.includes(type) && (pricePerNight === undefined || pricePerNight === null)) {
      return res.status(400).json({ message: 'pricePerNight is required for room or rent_home' });
    }

    if (type === 'cafe') {
      if (!openingTime || !closingTime) {
        return res.status(400).json({ message: 'openingTime and closingTime are required for cafe' });
      }
    }

    const listing = await Listing.create({
      ownerId: req.user.userId,
      type,
      title,
      description,
      city,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
      openingTime,
      closingTime,
      location: location
        ? {
            lat: location.lat,
            lng: location.lng,
          }
        : undefined,
    });

    return res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/listings/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { lat, lng, city } = req.query;
    const hasCoords = lat !== undefined && lng !== undefined;

    const grouped = {
      room: [],
      rent_home: [],
      cafe: [],
    };

    if (hasCoords) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      if (Number.isNaN(userLat) || Number.isNaN(userLng)) {
        return res.status(400).json({ message: 'lat and lng must be numbers' });
      }

      const listings = await Listing.find({
        'location.lat': { $exists: true, $ne: null },
        'location.lng': { $exists: true, $ne: null },
      });

      listings.forEach((listing) => {
        const { location } = listing;
        if (!location || location.lat === undefined || location.lng === undefined) {
          return;
        }
        const distanceKm = getDistanceInKm(userLat, userLng, location.lat, location.lng);
        grouped[listing.type]?.push({
          _id: listing._id,
          title: listing.title,
          city: listing.city,
          pricePerNight: listing.pricePerNight,
          type: listing.type,
          distanceKm,
        });
      });

      const sortAndTake = (arr) => arr.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5);

      return res.json({
        rooms: sortAndTake(grouped.room),
        rentHomes: sortAndTake(grouped.rent_home),
        cafes: sortAndTake(grouped.cafe),
      });
    }

    if (city) {
      const listings = await Listing.find({ city }).sort({ createdAt: -1 });

      listings.forEach((listing) => {
        grouped[listing.type]?.push({
          _id: listing._id,
          title: listing.title,
          city: listing.city,
          pricePerNight: listing.pricePerNight,
          type: listing.type,
        });
      });

      const takeFive = (arr) => arr.slice(0, 5);

      return res.json({
        rooms: takeFive(grouped.room),
        rentHomes: takeFive(grouped.rent_home),
        cafes: takeFive(grouped.cafe),
      });
    }

    return res.status(400).json({ message: 'lat and lng query parameters are required unless city is provided' });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/listings/cities (public – unique city list)
router.get('/cities', async (req, res) => {
  try {
    const cities = await Listing.distinct('city');
    const sorted = (cities || []).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return res.json(sorted);
  } catch (error) {
    console.error('List cities error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/listings (public – list all)
router.get('/', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, guests } = req.query;

    const filter = {};

    // City search handled after query to support case-insensitive partial matches

    if (type) {
      filter.type = type;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) {
        const value = Number(minPrice);
        if (Number.isNaN(value)) {
          return res.status(400).json({ message: 'minPrice must be a number' });
        }
        filter.pricePerNight.$gte = value;
      }
      if (maxPrice !== undefined) {
        const value = Number(maxPrice);
        if (Number.isNaN(value)) {
          return res.status(400).json({ message: 'maxPrice must be a number' });
        }
        filter.pricePerNight.$lte = value;
      }
    }

    if (guests !== undefined) {
      const value = Number(guests);
      if (Number.isNaN(value)) {
        return res.status(400).json({ message: 'guests must be a number' });
      }
      filter.maxGuests = { $gte: value };
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    const cityTerm = city ? String(city).toLowerCase() : '';
    const result = cityTerm
      ? listings.filter((l) => String(l.city || '').toLowerCase().includes(cityTerm))
      : listings;
    return res.json(result);
  } catch (error) {
    console.error('List listings error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/listings/:id (public – single listing)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/listings/:id (protected – host only)
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: you do not own this listing' });
    }

    const updatableFields = [
      'title',
      'description',
      'city',
      'address',
      'pricePerNight',
      'maxGuests',
      'amenities',
      'images',
      'location',
      'openingTime',
      'closingTime',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    const updated = await listing.save();
    return res.json(updated);
  } catch (error) {
    console.error('Update listing error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/listings/:id (protected – host only)
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: you do not own this listing' });
    }

    await listing.deleteOne();
    return res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

