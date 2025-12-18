const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');

dotenv.config();

// Sample listings data for major Indian cities
const sampleListings = [
  // MUMBAI
  {
    type: 'room',
    title: 'Cozy Studio Apartment in Bandra',
    description: 'Beautiful studio apartment in the heart of Bandra, close to restaurants and shopping.',
    city: 'Mumbai',
    address: 'Bandra West, Mumbai 400050',
    pricePerNight: 2500,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
    ],
    location: { lat: 19.0596, lng: 72.8295 }
  },
  {
    type: 'rent_home',
    title: 'Luxury 3BHK Apartment in Powai',
    description: 'Spacious 3 bedroom apartment with modern amenities, great views, and premium location.',
    city: 'Mumbai',
    address: 'Powai, Mumbai 400076',
    pricePerNight: 8000,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop'
    ],
    location: { lat: 19.1197, lng: 72.9050 }
  },
  {
    type: 'cafe',
    title: 'Cafe Mocha - Bandra',
    description: 'Trendy coffee shop with great ambiance, perfect for work or relaxation.',
    city: 'Mumbai',
    address: 'Hill Road, Bandra West, Mumbai 400050',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop'
    ],
    location: { lat: 19.0596, lng: 72.8295 }
  },

  // DELHI
  {
    type: 'room',
    title: 'Modern Room in Connaught Place',
    description: 'Centrally located room in CP, walking distance to metro and shopping.',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi 110001',
    pricePerNight: 2000,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop'
    ],
    location: { lat: 28.6304, lng: 77.2177 }
  },
  {
    type: 'rent_home',
    title: 'Elegant 2BHK in South Delhi',
    description: 'Beautifully furnished 2 bedroom home in upscale South Delhi neighborhood.',
    city: 'Delhi',
    address: 'Greater Kailash, New Delhi 110048',
    pricePerNight: 6000,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    location: { lat: 28.5355, lng: 77.2430 }
  },
  {
    type: 'cafe',
    title: 'The Coffee Bean - Connaught Place',
    description: 'Popular cafe chain with excellent coffee and snacks, great for meetings.',
    city: 'Delhi',
    address: 'Block E, Connaught Place, New Delhi 110001',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop'
    ],
    location: { lat: 28.6304, lng: 77.2177 }
  },

  // BANGALORE
  {
    type: 'room',
    title: 'Comfortable Room in Koramangala',
    description: 'Well-furnished room in vibrant Koramangala, close to tech parks and nightlife.',
    city: 'Bangalore',
    address: 'Koramangala 5th Block, Bangalore 560095',
    pricePerNight: 1800,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    location: { lat: 12.9352, lng: 77.6245 }
  },
  {
    type: 'rent_home',
    title: 'Spacious 4BHK Villa in Whitefield',
    description: 'Luxury villa with garden, perfect for families, in IT hub Whitefield.',
    city: 'Bangalore',
    address: 'Whitefield, Bangalore 560066',
    pricePerNight: 10000,
    maxGuests: 8,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    location: { lat: 12.9698, lng: 77.7499 }
  },
  {
    type: 'cafe',
    title: 'Third Wave Coffee - Indiranagar',
    description: 'Specialty coffee roaster with artisanal brews and cozy atmosphere.',
    city: 'Bangalore',
    address: '100 Feet Road, Indiranagar, Bangalore 560038',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'
    ],
    location: { lat: 12.9784, lng: 77.6408 }
  },

  // HYDERABAD
  {
    type: 'room',
    title: 'Budget-Friendly Room in Hitech City',
    description: 'Affordable room near Hitech City, perfect for professionals.',
    city: 'Hyderabad',
    address: 'Hitech City, Hyderabad 500081',
    pricePerNight: 1500,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    location: { lat: 17.4486, lng: 78.3908 }
  },
  {
    type: 'rent_home',
    title: 'Modern 3BHK in Gachibowli',
    description: 'Contemporary 3 bedroom apartment with premium amenities in Gachibowli.',
    city: 'Hyderabad',
    address: 'Gachibowli, Hyderabad 500032',
    pricePerNight: 7000,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop'
    ],
    location: { lat: 17.4229, lng: 78.3465 }
  },
  {
    type: 'cafe',
    title: 'Chai Point - Jubilee Hills',
    description: 'Popular chai and snacks chain, perfect for quick bites and meetings.',
    city: 'Hyderabad',
    address: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'
    ],
    location: { lat: 17.4332, lng: 78.4011 }
  },

  // CHENNAI
  {
    type: 'room',
    title: 'Sea View Room in Besant Nagar',
    description: 'Charming room with partial sea view, close to beach and cafes.',
    city: 'Chennai',
    address: 'Besant Nagar, Chennai 600090',
    pricePerNight: 2200,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    location: { lat: 13.0027, lng: 80.2634 }
  },
  {
    type: 'rent_home',
    title: 'Heritage Home in Mylapore',
    description: 'Traditional 2BHK home in cultural Mylapore, close to temples and markets.',
    city: 'Chennai',
    address: 'Mylapore, Chennai 600004',
    pricePerNight: 5500,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    location: { lat: 13.0339, lng: 80.2621 }
  },
  {
    type: 'cafe',
    title: 'Amethyst Cafe - Royapettah',
    description: 'Beautiful colonial bungalow converted to cafe, known for brunch and desserts.',
    city: 'Chennai',
    address: 'Whitefield Road, Royapettah, Chennai 600014',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop'
    ],
    location: { lat: 13.0500, lng: 80.2625 }
  },

  // KOLKATA
  {
    type: 'room',
    title: 'Heritage Room in Park Street',
    description: 'Charming room in historic Park Street area, close to restaurants and nightlife.',
    city: 'Kolkata',
    address: 'Park Street, Kolkata 700016',
    pricePerNight: 1800,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop'
    ],
    location: { lat: 22.5515, lng: 88.3530 }
  },
  {
    type: 'rent_home',
    title: 'Colonial 3BHK in Ballygunge',
    description: 'Spacious colonial-era home with high ceilings and period architecture.',
    city: 'Kolkata',
    address: 'Ballygunge, Kolkata 700019',
    pricePerNight: 6500,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    ],
    location: { lat: 22.5308, lng: 88.3659 }
  },
  {
    type: 'cafe',
    title: 'Flurys - Park Street',
    description: 'Iconic 100-year-old confectionery and cafe, famous for pastries and tea.',
    city: 'Kolkata',
    address: '18, Park Street, Kolkata 700016',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop'
    ],
    location: { lat: 22.5515, lng: 88.3530 }
  },

  // PUNE
  {
    type: 'room',
    title: 'Student-Friendly Room in Koregaon Park',
    description: 'Affordable room in trendy KP area, popular with students and young professionals.',
    city: 'Pune',
    address: 'Koregaon Park, Pune 411001',
    pricePerNight: 1600,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    location: { lat: 18.5366, lng: 73.8903 }
  },
  {
    type: 'rent_home',
    title: 'Modern 2BHK in Baner',
    description: 'Newly constructed 2 bedroom apartment with modern amenities in Baner.',
    city: 'Pune',
    address: 'Baner, Pune 411045',
    pricePerNight: 5000,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    location: { lat: 18.5596, lng: 73.7864 }
  },
  {
    type: 'cafe',
    title: 'German Bakery - Koregaon Park',
    description: 'Legendary cafe known for continental breakfast, great ambiance and history.',
    city: 'Pune',
    address: 'Koregaon Park, Pune 411001',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'
    ],
    location: { lat: 18.5366, lng: 73.8903 }
  },

  // AHMEDABAD
  {
    type: 'room',
    title: 'Comfortable Room in Navrangpura',
    description: 'Well-maintained room in central Ahmedabad, close to business district.',
    city: 'Ahmedabad',
    address: 'Navrangpura, Ahmedabad 380009',
    pricePerNight: 1400,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    location: { lat: 23.0396, lng: 72.5660 }
  },
  {
    type: 'rent_home',
    title: 'Spacious 3BHK in Satellite',
    description: 'Large 3 bedroom home in upscale Satellite area with all modern facilities.',
    city: 'Ahmedabad',
    address: 'Satellite, Ahmedabad 380015',
    pricePerNight: 6000,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop'
    ],
    location: { lat: 23.0225, lng: 72.5714 }
  },
  {
    type: 'cafe',
    title: 'Mocha - C.G. Road',
    description: 'Popular cafe chain with great coffee, food, and vibrant atmosphere.',
    city: 'Ahmedabad',
    address: 'C.G. Road, Ahmedabad 380009',
    pricePerNight: null,
    maxGuests: null,
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop'
    ],
    location: { lat: 23.0396, lng: 72.5660 }
  }
];

async function seedListings() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Create or get a host user
    let hostUser = await User.findOne({ email: 'host@homigo.com' });
    
    if (!hostUser) {
      const passwordHash = await bcrypt.hash('host123', 10);
      hostUser = await User.create({
        name: 'HomiGo Host',
        email: 'host@homigo.com',
        passwordHash,
        role: 'host'
      });
      console.log('Created host user:', hostUser.email);
    } else {
      console.log('Using existing host user:', hostUser.email);
    }

    // Clear existing listings (optional - comment out if you want to keep existing)
    // await Listing.deleteMany({});
    // console.log('Cleared existing listings');

    // Create listings
    let created = 0;
    let skipped = 0;

    for (const listingData of sampleListings) {
      // Check if listing already exists
      const existing = await Listing.findOne({
        title: listingData.title,
        city: listingData.city
      });

      if (existing) {
        console.log(`Skipped: ${listingData.title} in ${listingData.city} (already exists)`);
        skipped++;
        continue;
      }

      await Listing.create({
        ownerId: hostUser._id,
        ...listingData
      });
      created++;
      console.log(`Created: ${listingData.title} in ${listingData.city}`);
    }

    console.log('\n✅ Seeding completed!');
    console.log(`Created: ${created} listings`);
    console.log(`Skipped: ${skipped} listings (already exist)`);
    console.log(`Total: ${sampleListings.length} listings processed`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedListings();

