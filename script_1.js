// script_1.js
document.addEventListener('DOMContentLoaded', function () {
    // State management
    let currentUser = null;
    let currentView = 'default';
    let listings = [];
    let map = null;
    let markers = [];

    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const createListingModal = document.getElementById('createListingModal');

    // View elements
    const defaultView = document.getElementById('defaultView');
    const businessDashboard = document.getElementById('businessDashboard');
    const listView = document.getElementById('listView');
    const mapView = document.getElementById('mapView');

    // Buttons
    const mapViewBtn = document.getElementById('mapViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const applyFiltersBtn = document.getElementById('applyFilters');

    // Sections
    const videoSection = document.getElementById('videoSections');
    const donationSection = document.getElementById('donationSection');

    // Hide sections helper
    function hideVideoAndDonation() {
        if (videoSection) videoSection.style.display = 'none';
        if (donationSection) donationSection.style.display = 'none';
    }
    function showVideoAndDonation() {
        if (videoSection) videoSection.style.display = 'block';
        if (donationSection) donationSection.style.display = 'block';
    }

    // Initialize event listeners
    initializeEventListeners();

    // Restore current user from localStorage
    try {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            currentUser = JSON.parse(saved);
            populateAccountUI(currentUser);
        }
    } catch (e) { }

    // Initialize sample listings and render
    initializeSampleData();
    loadVideoSections();
    loadListings();

    // ------------------- Event Listeners -------------------
    function initializeEventListeners() {
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => showModal(loginModal));
        document.getElementById('registerBtn').addEventListener('click', () => showModal(registerModal));
        document.getElementById('cancelLogin').addEventListener('click', () => hideModal(loginModal));
        document.getElementById('cancelRegister').addEventListener('click', () => hideModal(registerModal));

        // Account dropdowns
        setupAccountDropdown('Right');
        setupAccountDropdown('Left');

        // User type selection
        document.getElementById('businessBtn').addEventListener('click', () => handleUserTypeSelection('business'));
        document.getElementById('recipientBtn').addEventListener('click', () => handleUserTypeSelection('recipient'));

        // View toggle + video section handling
        listViewBtn.addEventListener('click', () => {
            toggleView('list');
            showVideoAndDonation();
        });
        mapViewBtn.addEventListener('click', () => {
            toggleView('map');
            hideVideoAndDonation();
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
        document.getElementById('createListingForm').addEventListener('submit', handleCreateListing);
        document.getElementById('cancelCreateListing').addEventListener('click', () => hideModal(createListingModal));

        // Business dashboard
        document.getElementById('createListingBtn').addEventListener('click', () => showModal(createListingModal));

        // Filters
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // ------------------- Account Helpers -------------------
    function setupAccountDropdown(side) {
        const btn = document.getElementById(`accountBtn${side}`);
        const dropdown = document.getElementById(`accountDropdown${side}`);
        const logoutBtn = document.getElementById(`logoutBtn${side}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                if (dropdown) dropdown.classList.toggle('hidden');
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                currentUser = null;
                if (side === 'Right') {
                    const accountRight = document.getElementById('accountRight');
                    const registerBtn = document.getElementById('registerBtn');
                    if (accountRight) accountRight.classList.add('hidden');
                    if (dropdown) dropdown.classList.add('hidden');
                    if (registerBtn) registerBtn.classList.remove('hidden');
                } else {
                    const accountLeft = document.getElementById('accountTopLeft');
                    if (accountLeft) accountLeft.classList.add('hidden');
                    if (dropdown) dropdown.classList.add('hidden');
                }
                showDefaultView();
                showNotification('Logged out', 'success');
            });
        }
    }

    function populateAccountUI(user) {
        const accountRight = document.getElementById('accountRight');
        if (accountRight) accountRight.classList.remove('hidden');
        ['Name', 'NameFull', 'Email', 'Type', 'Address', 'District', 'State', 'Phone'].forEach(field => {
            const el = document.getElementById(`accountRight${field}`);
            if (el) el.textContent = user[field.toLowerCase()] || '';
        });
        const accountLeft = document.getElementById('accountTopLeft');
        if (accountLeft) accountLeft.classList.add('hidden');
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) registerBtn.classList.add('hidden');
    }

    // ------------------- Modals -------------------
    function showModal(modal) { modal.classList.remove('hidden'); }
    function hideModal(modal) { modal.classList.add('hidden'); }

    // ------------------- Sample Data -------------------
    function initializeSampleData() {
        listings = [
            { id: 1, businessName: "Green Cafe", foodItem: "Fresh Sandwiches", category: "prepared-meals", quantity: "15 portions", description: "Assorted fresh sandwiches made today.", pickupTime: "2024-01-15T18:00", address: "123 Main St, Cityville", coordinates: [40.7128, -74.0060], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", claimed: false },
            { id: 2, businessName: "Bakery Delight", foodItem: "Assorted Pastries", category: "baked-goods", quantity: "25 pieces", description: "Croissants, muffins & puffs.", pickupTime: "2024-01-15T19:00", address: "456 Oak Ave, Townsville", coordinates: [40.7282, -73.9942], image: "https://theobroma.in/cdn/shop/files/EgglessRichChocolatePastry.jpg?v=1750341628w=400", claimed: false },
            { id: 3, businessName: "Fresh Market", foodItem: "Organic Vegetables", category: "fresh-produce", quantity: "10kg", description: "Fresh organic veggies available.", pickupTime: "2024-01-16T17:00", address: "789 Pine Rd, Villagetown", coordinates: [40.7505, -73.9934], image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400", claimed: false },
            { id: 4, businessName: "Dairy House", foodItem: "Fresh Milk Packs", category: "dairy", quantity: "20 packs", description: "Fresh milk, collected today morning.", pickupTime: "2024-01-16T16:00", address: "104 Maple Street", coordinates: [40.7410, -74.0048], image: "https://5.imimg.com/data5/SP/JB/KZ/SELLER-108598973/fresh-milk1-jpg-500x500.jpg?v=1750341628w=400", claimed: false },
            { id: 5, businessName: "SuperMart", foodItem: "Fruit Basket (Mixed)", category: "fresh-produce", quantity: "6 baskets", description: "Apples, bananas & oranges.", pickupTime: "2024-01-17T14:00", address: "308 River Road", coordinates: [40.7011, -74.0123], image: "https://assets.oyegifts.com/flowers-n-gifts/vendordata/product/refreshing-three-kg-fruits-basket.jpg?", claimed: false },
            { id: 6, businessName: "Healthy Bite", foodItem: "Fresh Salad Bowls", category: "prepared-meals", quantity: "12 bowls", description: "Green salad bowls from today's lunch.", pickupTime: "2024-01-17T15:30", address: "901 Hill Street", coordinates: [40.7217, -74.0011], image: "https://cdn.prod.website-files.com/5cb303852da2ad609e57122e/66fdc0db2c918aa3c1a5d533_Green%20Vegan%20Bowl.png", claimed: false },
            { id: 8, businessName: "Fruit Palace", foodItem: "Overripe Mango Crates", category: "fresh-produce", quantity: "4 crates", description: "Perfect for juices & smoothies.", pickupTime: "2024-01-18T11:00", address: "551 Orchard Road", coordinates: [40.7321, -73.9788], image: "https://thumbs.dreamstime.com/b/crate-yellow-mangoes-isolated-transparent-background-361979200.jpg", claimed: false },
            { id: 10, businessName: "MilkLand", foodItem: "Curd & Yogurt Cups", category: "dairy", quantity: "30 cups", description: "Short expiry but good quality.", pickupTime: "2024-01-19T10:00", address: "78 Snow Avenue", coordinates: [40.7531, -73.9819], image: "https://s.alicdn.com/@sc04/kf/H555e170bbd9d4af291f676ee19ed1b92G/200ml-200g-Disposable-Plastic-Yogurt-Cup-with-Aluminum-Seal-folding-Spoon-and-Plastic-Lid.jpg_300x300.jpg", claimed: false },
            { id: 11, businessName: "Food Haven", foodItem: "Rice Meals (Veg)", category: "prepared-meals", quantity: "20 plates", description: "Packed today afternoon.", pickupTime: "2024-01-19T18:00", address: "410 Liberty Road", coordinates: [40.7461, -74.0080], image: "https://s.lightorangebean.com/media/20240914154201/Mixed-Veg-Rice-Delight_-done.png", claimed: false }
        ];
    }

    // ------------------- Video Sections -------------------
    function loadVideoSections() {
        if (!videoSection) return;
        videoSection.innerHTML = `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">How Food Waste Impacts the World</h2>
                    <p class="text-gray-600 text-lg">This video explains how food waste affects the environment, climate change, and global hunger. Understanding the problem helps us build better solutions.</p>
                </div>
                <div class="w-full h-64 md:h-80">
                    <iframe class="w-full h-full rounded-lg shadow-lg" src="https://www.youtube.com/embed/ishA6kry8nc?start=43" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </section>
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div class="w-full h-64 md:h-80">
                    <iframe class="w-full h-full rounded-lg shadow-lg" src="https://www.youtube.com/embed/sWB53jPQVIQ" frameborder="0" allowfullscreen></iframe>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">How Donations Change Lives</h2>
                    <p class="text-gray-600 text-lg">See how donated food reaches shelters, families, and individuals in need. Every contribution reduces hunger and strengthens communities.</p>
                </div>
            </div>
        </section>
        `;
    }

    // ------------------- Views -------------------
    function showBusinessDashboard() {
        defaultView.classList.add('hidden');
        businessDashboard.classList.remove('hidden');
        currentView = 'business';
        renderBusinessListings();
    }
    function showDefaultView() {
        businessDashboard.classList.add('hidden');
        defaultView.classList.remove('hidden');
        currentView = 'default';
        renderListings();
    }
    function toggleView(viewType) {
        if (viewType === 'map') {
            listView.classList.add('hidden');
            mapView.classList.remove('hidden');
            listViewBtn.classList.replace('bg-green-600', 'bg-gray-200');
            listViewBtn.classList.replace('text-white', 'text-gray-700');
            mapViewBtn.classList.replace('bg-gray-200', 'bg-green-600');
            mapViewBtn.classList.replace('text-gray-700', 'text-white');
            setTimeout(initializeMapOnce, 200);
        } else {
            mapView.classList.add('hidden');
            listView.classList.remove('hidden');
            mapViewBtn.classList.replace('bg-green-600', 'bg-gray-200');
            mapViewBtn.classList.replace('text-white', 'text-gray-700');
            listViewBtn.classList.replace('bg-gray-200', 'bg-green-600');
            listViewBtn.classList.replace('text-gray-700', 'text-white');
        }
    }

    // ------------------- Map -------------------
    function initializeMapOnce() {
        if (map) return;
        map = L.map('leafletMap').setView([40.7128, -74.0060], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const accuracy = pos.coords.accuracy || 0;
                window.__userLastPosition = [lat, lng];

                L.circle([lat, lng], { radius: Math.max(accuracy, 10), color: '#3182CE', fillColor: '#3182CE', fillOpacity: 0.08 }).addTo(map);
                L.circleMarker([lat, lng], { radius: 7, color: '#2B6CB0', fillColor: '#2B6CB0', fillOpacity: 1 }).addTo(map).bindPopup('You are here');
                map.setView([lat, lng], 13);
            }, err => showNotification('Unable to get your location', 'error'), { enableHighAccuracy: true });
        }

        addLocateControl();
        updateMapMarkers();
    }
    function addLocateControl() {
        const locateControl = L.control({ position: 'topright' });
        locateControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar');
            div.style.background = 'white'; div.style.padding = '2px'; div.style.borderRadius = '4px';
            div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
            div.innerHTML = '<a href="#" title="Locate me" id="locateBtn" style="display:block;padding:6px 8px;color:#2B6CB0;text-decoration:none;">📍</a>';
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.on(div, 'click', function (e) {
                L.DomEvent.stopPropagation(e); L.DomEvent.preventDefault(e);
                if (window.__userLastPosition) map.setView(window.__userLastPosition, 13);
                else if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => {
                    window.__userLastPosition = [pos.coords.latitude, pos.coords.longitude]; map.setView(window.__userLastPosition, 13);
                });
                else showNotification('Geolocation not supported', 'error');
            });
            return div;
        };
        locateControl.addTo(map);
    }
    function updateMapMarkers() {
        markers.forEach(m => m.remove());
        markers = [];
        const filteredListings = getFilteredListings();
        filteredListings.forEach(listing => {
            const marker = L.marker(listing.coordinates)
                .addTo(map)
                .bindPopup(`
                    <div class="p-2">
                        <h3 class="font-semibold">${listing.foodItem}</h3>
                        <p class="text-sm">${listing.businessName}</p>
                        <p class="text-sm">${listing.quantity}</p>
                        ${window.__userLastPosition ? `<p class="text-sm">Distance: ${formatDistance(computeDistance(window.__userLastPosition, listing.coordinates))}</p>` : ''}
                        <button onclick="claimFood(${listing.id})" class="mt-2 w-full bg-green-600 text-white text-sm py-1 rounded hover:bg-green-700 ${listing.claimed ? 'bg-gray-400 cursor-not-allowed' : ''}" ${listing.claimed ? 'disabled' : ''}>${listing.claimed ? 'Claimed' : 'Claim Food'}</button>
                    </div>
                `);
            markers.push(marker);
        });
    }

    // ------------------- Listings -------------------
    async function loadListings() {
        // API fetch fallback
        if (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) {
            try {
                const res = await fetch(`${API_BASE_URL}/listings`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) listings = data;
                    else if (Array.isArray(data.results)) listings = data.results;
                }
            } catch (err) { console.warn('Using local data due to fetch error', err); }
        }
        if (currentView === 'business') renderBusinessListings(); else renderListings();
    }
    function renderListings() {
        listView.innerHTML = '';
        getFilteredListings().forEach(listing => listView.appendChild(createListingCard(listing)));
        if (!mapView.classList.contains('hidden')) updateMapMarkers();
    }
    function renderBusinessListings() {
        businessDashboard.innerHTML = '';
        listings.filter(l => l.businessId === currentUser?.id).forEach(listing => businessDashboard.appendChild(createListingCard(listing)));
    }
    function createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'bg-white shadow rounded-lg p-4 mb-4 flex flex-col md:flex-row';
        card.innerHTML = `
            <div class="md:w-1/3"><img src="${listing.image}" alt="${listing.foodItem}" class="w-full h-32 object-cover rounded"></div>
            <div class="md:w-2/3 md:pl-4">
                <h3 class="text-lg font-semibold">${listing.foodItem}</h3>
                <p class="text-sm text-gray-600">${listing.businessName}</p>
                <p class="text-sm">${listing.quantity}</p>
                <p class="text-sm">${listing.description}</p>
                <p class="text-sm text-gray-500">Pickup: ${formatDateTime(listing.pickupTime)}</p>
                <button onclick="claimFood(${listing.id})" class="mt-2 px-3 py-1 bg-green-600 text-white rounded ${listing.claimed ? 'bg-gray-400 cursor-not-allowed' : ''}" ${listing.claimed ? 'disabled' : ''}>${listing.claimed ? 'Claimed' : 'Claim Food'}</button>
                <button onclick="editListing(${listing.id})" class="mt-2 px-3 py-1 bg-gray-600 text-white rounded">Edit</button>
            </div>
        `;
        return card;
    }

    window.claimFood = function (listingId) {
        const listing = listings.find(l => l.id === listingId);
        if (!listing || listing.claimed) return;
        listing.claimed = true;
        showNotification('Food claimed! Contact the business for pickup details.', 'success');
        renderListings();
        if (!mapView.classList.contains('hidden')) updateMapMarkers();
    };

    window.editListing = function (listingId) {
        showNotification('Edit functionality coming soon!', 'success');
    };

    function handleCreateListing(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const newListing = {
            id: listings.length ? Math.max(...listings.map(l => l.id)) + 1 : 1,
            businessName: formData.get('businessName'),
            foodItem: formData.get('foodItem'),
            category: formData.get('category'),
            quantity: formData.get('quantity'),
            description: formData.get('description'),
            pickupTime: formData.get('pickupTime'),
            address: formData.get('address'),
            coordinates: [parseFloat(formData.get('latitude')), parseFloat(formData.get('longitude'))],
            image: formData.get('image'),
            claimed: false
        };
        listings.push(newListing);
        hideModal(createListingModal);
        renderBusinessListings();
        if (!mapView.classList.contains('hidden')) updateMapMarkers();
    }

    // ------------------- Filters -------------------
    function applyFilters() {
        renderListings();
    }
    function getFilteredListings() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const distanceFilter = document.getElementById('distanceFilter')?.value || '';
        return listings.filter(l => {
            let pass = true;
            if (categoryFilter) pass = pass && l.category === categoryFilter;
            if (distanceFilter && window.__userLastPosition) {
                const dist = computeDistance(window.__userLastPosition, l.coordinates);
                pass = pass && dist <= Number(distanceFilter);
            }
            return pass;
        });
    }

    // ------------------- Utilities -------------------
    function handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const email = (formData.get('email') || '').toString().trim().toLowerCase();
        const password = formData.get('password') || '';

        const users = getStoredUsers();
        const matched = users.find(u => (u.email || '').toString().toLowerCase() === email);
        if (!matched) {
            showNotification('No account found for that email', 'error');
            return;
        }

        if (matched.password !== password) {
            showNotification('Incorrect password', 'error');
            return;
        }

        // Successful login: populate currentUser from stored user (exclude password)
        currentUser = {
            name: matched.name,
            email: matched.email,
            address: matched.address || '',
            district: matched.district || '',
            state: matched.state || '',
            phone: matched.phone || '',
            type: matched.type || ''
        };

        try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch (err) { /* ignore */ }

        // Populate right-side account UI
        const accountRight = document.getElementById('accountRight');
        const accountRightName = document.getElementById('accountRightName');
        const accountRightNameFull = document.getElementById('accountRightNameFull');
        const accountRightEmail = document.getElementById('accountRightEmail');
        const accountRightType = document.getElementById('accountRightType');
        const accountRightAddress = document.getElementById('accountRightAddress');
        if (accountRight) accountRight.classList.remove('hidden');
        if (accountRightName) accountRightName.textContent = currentUser.name;
        if (accountRightNameFull) accountRightNameFull.textContent = currentUser.name;
        if (accountRightEmail) accountRightEmail.textContent = currentUser.email;
        if (accountRightType) accountRightType.textContent = currentUser.type || '';
        if (accountRightAddress) accountRightAddress.textContent = currentUser.address || '';
        const accountRightDistrict = document.getElementById('accountRightDistrict');
        const accountRightState = document.getElementById('accountRightState');
        const accountRightPhone = document.getElementById('accountRightPhone');
        if (accountRightDistrict) accountRightDistrict.textContent = currentUser.district || '';
        if (accountRightState) accountRightState.textContent = currentUser.state || '';
        if (accountRightPhone) accountRightPhone.textContent = currentUser.phone || '';

        hideModal(loginModal);
        if (currentUser.type === 'business') showBusinessDashboard(); else showDefaultView();
        showNotification('Successfully logged in!', 'success');
    }
    function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userType = (formData.get('userType') || e.target.querySelector('select')?.value || '').toString();
        const name = (formData.get('name') || '').toString();
        const email = (formData.get('email') || '').toString().trim().toLowerCase();
        const password = (formData.get('password') || '').toString();
        const address = (formData.get('address') || '').toString();
        const district = (formData.get('district') || '').toString();
        const state = (formData.get('state') || '').toString();
        const phone = (formData.get('phone') || '').toString();

        // Build the current user object including new fields
        currentUser = {
            type: userType,
            name: name || 'New User',
            email: email || 'user@example.com',
            address: address || '',
            district: district || '',
            state: state || '',
            phone: phone || ''
        };

        // Persist locally for quick restore
        try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch (err) { /* ignore */ }

        // Save full user record (including password) to local users store (demo only)
        try {
            const users = getStoredUsers();
            // replace existing by email if present
            const existingIndex = users.findIndex(u => (u.email || '').toString().toLowerCase() === (email || '').toString().toLowerCase());
            const userRecord = {
                name: currentUser.name,
                email: email,
                address: currentUser.address || '',
                district: currentUser.district || '',
                state: currentUser.state || '',
                phone: currentUser.phone || '',
                type: currentUser.type || '',
                password: password
            };
            if (existingIndex >= 0) users[existingIndex] = Object.assign(users[existingIndex], userRecord); else users.push(userRecord);
            saveStoredUsers(users);
        } catch (err) { /* ignore */ }


        // Hide register button immediately after successful registration
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) registerBtn.classList.add('hidden');

        hideModal(registerModal);

        // Show right-side account UI and populate it
        const accountRight = document.getElementById('accountRight');
        const accountRightName = document.getElementById('accountRightName');
        const accountRightNameFull = document.getElementById('accountRightNameFull');
        const accountRightEmail = document.getElementById('accountRightEmail');
        const accountRightType = document.getElementById('accountRightType');
        const accountRightAddress = document.getElementById('accountRightAddress');
        if (accountRight) accountRight.classList.remove('hidden');
        if (accountRightName) accountRightName.textContent = currentUser.name;
        if (accountRightNameFull) accountRightNameFull.textContent = currentUser.name;
        if (accountRightEmail) accountRightEmail.textContent = currentUser.email;
        if (accountRightType) accountRightType.textContent = currentUser.type || '';
        if (accountRightAddress) accountRightAddress.textContent = currentUser.address || '';
        // hide top-left account if present
        const accountLeft = document.getElementById('accountTopLeft');
        if (accountLeft) accountLeft.classList.add('hidden');

        if (userType === 'business') showBusinessDashboard(); else showDefaultView();
        showNotification('Account created successfully!', 'success');
    }
    function handleUserTypeSelection(type) {
        if (type === 'business') {
            showModal(registerModal);
        } else {
            // For recipients, show the default view with listings
            renderListings();
        }
    }


    function formatDateTime(dt) { return new Date(dt).toLocaleDateString() + ' ' + new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    function computeDistance([lat1, lon1], [lat2, lon2]) {
        function toRad(deg) { return deg * Math.PI / 180; }
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    function formatDistance(km) { return km < 1 ? (km * 1000).toFixed(0) + ' m' : km.toFixed(1) + ' km'; }

    function showNotification(msg, type) { alert(msg); } // Placeholder
});
