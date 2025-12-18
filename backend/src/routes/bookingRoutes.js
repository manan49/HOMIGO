const express = require('express');
const mongoose = require('mongoose');
const { authRequired } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

const router = express.Router();

// POST /api/bookings → create booking (guest)
router.post('/', authRequired, async (req, res) => {
  try {
    const { listingId, checkInDate, checkOutDate, guestsCount } = req.body;

    if (!listingId || !checkInDate || !checkOutDate || guestsCount === undefined) {
      return res.status(400).json({ message: 'listingId, checkInDate, checkOutDate, guestsCount are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: 'Invalid listingId' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.type === 'cafe') {
      return res.status(400).json({ message: 'Cafes cannot be booked' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today || checkOut < today) {
      return res.status(400).json({ message: 'Dates must be today or later' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'checkOutDate must be after checkInDate' });
    }

    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      return res.status(400).json({ message: 'Stay must be at least one night' });
    }

    if (listing.pricePerNight === undefined || listing.pricePerNight === null) {
      return res.status(400).json({ message: 'Listing is missing pricePerNight' });
    }

    const PENDING_EXPIRES_MINUTES = 30;
    const pendingCutoff = new Date(Date.now() - PENDING_EXPIRES_MINUTES * 60 * 1000);

    const overlappingBookings = await Booking.find({
      listingId,
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    const hasActiveOverlap = overlappingBookings.some((b) => {
      if (b.status === 'CONFIRMED') return true;
      if (b.status === 'PENDING' && b.createdAt >= pendingCutoff) return true;
      return false;
    });

    if (hasActiveOverlap) {
      return res.status(400).json({ message: 'Listing is not available for the selected dates' });
    }

    // Optional: clean up stale pending overlaps (auto-cancel)
    const stalePendingIds = overlappingBookings
      .filter((b) => b.status === 'PENDING' && b.createdAt < pendingCutoff)
      .map((b) => b._id);
    if (stalePendingIds.length) {
      await Booking.updateMany(
        { _id: { $in: stalePendingIds } },
        { $set: { status: 'CANCELLED' } }
      );
    }

    const totalAmount = nights * listing.pricePerNight;

    const booking = await Booking.create({
      userId: req.user.userId,
      listingId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestsCount,
      totalAmount,
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/my → logged-in guest’s bookings
router.get('/my', authRequired, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('listingId', 'title city type pricePerNight')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/listing/:listingId → bookings for one listing (host only)
router.get('/listing/:listingId', authRequired, async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: 'Invalid listingId' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not allowed to view bookings for this listing' });
    }

    const bookings = await Booking.find({ listingId })
      .populate('userId', 'name email')
      .sort({ checkInDate: 1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Get listing bookings error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/bookings/:id/cancel → cancel booking (guest)
router.put('/:id/cancel', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not allowed to cancel this booking' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn <= today) {
      return res.status(400).json({ message: 'Cannot cancel on or after check-in date' });
    }

    booking.status = 'CANCELLED';
    const updated = await booking.save();

    return res.json(updated);
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

