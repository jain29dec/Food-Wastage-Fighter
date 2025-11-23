// server.js
const open = require('openurl').open;

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// In-memory stores
let listings = [
    {
        id: 1,
        businessName: "Green Cafe",
        foodItem: "Fresh Sandwiches",
        category: "prepared-meals",
        quantity: "15 portions",
        description: "Assorted fresh sandwiches from today's lunch service",
        pickupTime: "2024-01-15T18:00",
        address: "123 Main St, Cityville",
        coordinates: [40.7128, -74.0060],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        claimed: false
    },
    {
        id: 2,
        businessName: "Bakery Delight",
        foodItem: "Assorted Pastries",
        category: "baked-goods",
        quantity: "25 pieces",
        description: "Day-old pastries including croissants and muffins",
        pickupTime: "2024-01-15T19:00",
        address: "456 Oak Ave, Townsville",
        coordinates: [40.7282, -73.9942],
        image: "https://images.unsplash.com/photo-1555507036-ab794f27d2e9?w=400",
        claimed: false
    },
    {
        id: 3,
        businessName: "Fresh Market",
        foodItem: "Organic Vegetables",
        category: "fresh-produce",
        quantity: "10kg",
        description: "Mixed organic vegetables from today's delivery",
        pickupTime: "2024-01-16T17:00",
        address: "789 Pine Rd, Villagetown",
        coordinates: [40.7505, -73.9934],
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
        claimed: false
    }
];

let users = []; // { id, name, email, password, type, token }
let claims = []; // { id, listing_id, userId, message, createdAt }
let nextListingId = listings.length + 1;
let nextClaimId = 1;
let nextUserId = 1;

function createToken(email) {
    return Buffer.from(`${email}:${Date.now()}`).toString('base64');
}

function authMiddleware(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ message: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(400).json({ message: 'Invalid Authorization format' });
    const token = parts[1];
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
}

// Auth endpoints
app.post('/auth/register', (req, res) => {
    const { name, email, password, type, district, state, phone, address } = req.body;
    if (!email || !type) return res.status(400).json({ message: 'Missing email or type' });
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
    const token = createToken(email);
    const user = {
        id: nextUserId++,
        name: name || email.split('@')[0],
        email,
        password: password || 'nopass',
        type,
        district: district || '',
        state: state || '',
        phone: phone || '',
        address: address || '',
        token
    };
    users.push(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, type: user.type, district: user.district, state: user.state, phone: user.phone, address: user.address } });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body; // Added password to destructuring
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' }); // Check for password

    let user = users.find(u => u.email === email);

    // Check if user exists
    if (!user) {
        return res.status(404).json({ message: 'No account found for that email' });
    }

    // Check password
    if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    // return existing token or create a new one
    if (!user.token) user.token = createToken(email);

    // Respond with success
    res.json({
        token: user.token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type,
            district: user.district || '',
            state: user.state || '',
            phone: user.phone || '',
            address: user.address || ''
        }
    });
});

// Listings
app.get('/listings', (req, res) => {
    // API client expects listings directly (not nested)
    res.json(listings);

    // If the client needed a "results" array (as implied by some client-side code), 
    // the response would be: res.json({ results: listings });
    // I will keep it simple as originally coded: res.json(listings);
});

app.post('/listings', authMiddleware, (req, res) => {
    const user = req.user;
    if (user.type !== 'business') return res.status(403).json({ message: 'Only businesses may create listings' });
    const { foodItem, category, quantity, description, pickupTime, address, coordinates, image } = req.body;
    const newListing = {
        id: nextListingId++,
        businessName: user.name,
        foodItem: foodItem || 'Food Item',
        category: category || 'prepared-meals',
        quantity: quantity || '1 portion',
        description: description || '',
        pickupTime: pickupTime || new Date().toISOString(),
        address: address || 'Business Address',
        coordinates: coordinates || [40.7128, -74.0060],
        image: image || '',
        claimed: false
    };
    listings.unshift(newListing);
    res.status(201).json(newListing);
});

app.delete('/listings/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Listing not found' });
    // Optionally check that the user owns the listing (by businessName)
    const listing = listings[idx];
    if (req.user.type === 'business' && req.user.name !== listing.businessName) {
        return res.status(403).json({ message: 'You may only delete your own listings' });
    }
    listings.splice(idx, 1);
    res.json({ message: 'Deleted' });
});

// Claims
app.post('/claims', authMiddleware, (req, res) => {
    const { listing_id, message } = req.body;
    const listingId = parseInt(listing_id, 10);
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.claimed) return res.status(400).json({ message: 'Listing already claimed' });

    const claim = {
        id: nextClaimId++,
        listing_id: listingId,
        userId: req.user.id,
        message: message || '',
        createdAt: new Date().toISOString()
    };
    claims.push(claim);

    listing.claimed = true;
    listing.claimedBy = req.user.name; // ← add this line

    res.status(201).json({ message: 'Claim created', claim });
});


// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_1.html'));
});



app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
});
