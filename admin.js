// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    // ... rest of your config
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminErrorP = document.getElementById('adminError');
const addBusForm = document.getElementById('addBusForm');
const formStatus = document.getElementById('formStatus');

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        document.getElementById('adminUserEmail').textContent = user.email;
    } else {
        loginView.style.display = 'block';
        dashboardView.style.display = 'none';
    }
});

// Login
adminLoginBtn.addEventListener('click', () => {
    const email = adminEmailInput.value;
    const password = adminPasswordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            adminErrorP.textContent = error.message;
        });
});

// Logout
adminLogoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Handle form submission
addBusForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = 'Adding bus...';

    const routeArray = [
        addBusForm.source.value.trim(),
        addBusForm.stop1.value.trim(),
        addBusForm.stop2.value.trim(),
        addBusForm.stop3.value.trim(),
        addBusForm.destination.value.trim()
    ];

    db.collection('buses').add({
        busType: addBusForm.newBusType.value,
        busName: addBusForm.busName.value,
        busNumber: addBusForm.busNumber.value,
        driverId: addBusForm.driverId.value,
        route: routeArray
    }).then(() => {
        formStatus.textContent = 'Bus added successfully!';
        addBusForm.reset();
        setTimeout(() => formStatus.textContent = '', 3000);
    }).catch(error => {
        formStatus.textContent = `Error: ${error.message}`;
    });
});
