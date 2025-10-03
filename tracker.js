// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ... rest of your config
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables for Leaflet
let map;
let busMarker;
let routingControl;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const busId = urlParams.get('busId');
const userStop = urlParams.get('stop'); // This is a string like "Chalakudy"

// DOM Elements
const busNameSpan = document.getElementById('busName');
const busNumberSpan = document.getElementById('busNumber');
const userStopSpan = document.getElementById('userStop');
const etaSpan = document.getElementById('eta');

// --- Main Functionality ---

// 1. Initialize the map
function initMap() {
    // Initial map centered on Thrissur, Kerala
    map = L.map('map').setView([10.5276, 76.2144], 13);

    // Add a tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (busId && userStop) {
        userStopSpan.textContent = userStop;
        startTracking();
    } else {
        etaSpan.textContent = "Error: Bus ID or stop not provided.";
    }
}

// 2. Start tracking the bus
async function startTracking() {
    // Get static bus details first
    const busRef = db.collection('buses').doc(busId);
    const busDoc = await busRef.get();
    if (busDoc.exists) {
        const busData = busDoc.data();
        busNameSpan.textContent = busData.busName;
        busNumberSpan.textContent = busData.busNumber;
    }

    // Listen for real-time location updates from Firestore
    db.collection('live_locations').doc(busId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const busPosition = [data.location.latitude, data.location.longitude];

                // Update marker position
                if (!busMarker) {
                    // Create marker if it doesn't exist
                    const busIcon = L.icon({
                        iconUrl: 'https://img.icons8.com/plasticine/100/000000/bus.png',
                        iconSize: [40, 40],
                    });
                    busMarker = L.marker(busPosition, { icon: busIcon }).addTo(map)
                        .bindPopup(`<b>${busNameSpan.textContent}</b>`)
                        .openPopup();
                } else {
                    busMarker.setLatLng(busPosition);
                }
                
                // Center map on the bus
                map.panTo(busPosition);

                // Update route and calculate ETA
                updateRoute(busPosition);

            } else {
                etaSpan.textContent = "Bus is not currently sharing its location.";
            }
        });
}

// 3. Update the route and ETA
function updateRoute(busPosition) {
    const waypoints = [
        L.latLng(busPosition),
        // Leaflet Routing Machine can geocode the destination string for us!
        // We add ", Kerala, India" for better accuracy.
        L.Routing.waypoint(null, `${userStop}, Kerala, India`)
    ];

    if (!routingControl) {
        // Create the routing control if it doesn't exist
        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            addWaypoints: false, // Don't allow users to add more points
            createMarker: () => { return null; }, // Don't create start/end markers
            lineOptions: {
                styles: [{ color: '#007bff', opacity: 0.8, weight: 5 }]
            }
        }).addTo(map);

        // Listen for when a route is found
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            // Display ETA: summary.totalTime is in seconds
            const etaMinutes = Math.round(summary.totalTime / 60);
            etaSpan.textContent = `${etaMinutes} minutes`;
        });

    } else {
        // Just update the waypoints of the existing control
        routingControl.setWaypoints(waypoints);
    }
}

// Start the process
initMap();
