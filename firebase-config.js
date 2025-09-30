// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHJmlx4IExUiiDRm8J9CtHsSC3M9IIQqg",
    authDomain: "my-portfolio-eea6e.firebaseapp.com",
    projectId: "my-portfolio-eea6e",
    storageBucket: "my-portfolio-eea6e.firebasestorage.app",
    messagingSenderId: "460606503031",
    appId: "1:460606503031:web:391687ff156e1c24bcae72"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore and Auth services
const db = firebase.firestore();
const auth = firebase.auth();