// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    // ... rest of your config
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const busTypeSelect = document.getElementById('busType');
const sourceSelect = document.getElementById('sourceStop');
const destinationSelect = document.getElementById('destinationStop');
const findBusBtn = document.getElementById('findBusBtn');
const busListDiv = document.getElementById('busList');

// Populate stops dropdowns
async function populateStops() {
    const busesSnapshot = await db.collection('buses').get();
    const allStops = new Set();
    busesSnapshot.forEach(doc => {
        doc.data().route.forEach(stop => allStops.add(stop));
    });

    sourceSelect.innerHTML = '<option value="">Select Source</option>';
    destinationSelect.innerHTML = '<option value="">Select Destination</option>';
    
    allStops.forEach(stop => {
        sourceSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
        destinationSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
    });
}

// Find buses based on user selection
findBusBtn.addEventListener('click', async () => {
    const type = busTypeSelect.value;
    const source = sourceSelect.value;
    const destination = destinationSelect.value;

    if (!type || !source || !destination) {
        alert('Please select all fields.');
        return;
    }
    
    busListDiv.innerHTML = '<p>Searching...</p>';
    
    const querySnapshot = await db.collection('buses').where('busType', '==', type).get();
    
    let resultsHtml = '';
    
    querySnapshot.forEach(doc => {
        const bus = doc.data();
        const route = bus.route;

        const sourceIndex = route.indexOf(source);
        const destIndex = route.indexOf(destination);

        // Check if both stops exist and are in the correct order
        if (sourceIndex > -1 && destIndex > -1 && destIndex > sourceIndex) {
            resultsHtml += `
                <div class="bus-item">
                    <div>
                        <strong>${bus.busName}</strong>
                        <p>${bus.busNumber}</p>
                    </div>
                    <a href="tracker.html?busId=${doc.id}&stop=${source}" class="track-link" target="_blank">Track Live</a>
                </div>
            `;
        }
    });

    busListDiv.innerHTML = resultsHtml || '<p>No buses found for this route.</p>';
});

// Initial population of stops
populateStops();
