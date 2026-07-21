// Firebase config — projeto emporio-coisas-de-minas
// Usado via Firebase Compat SDK (CDN), sem build tool
const firebaseConfig = {
  apiKey: "AIzaSyA6ll77eLqckEbbyiQoJVZuYQ6VI470kIY",
  authDomain: "emporio-coisas-de-minas.firebaseapp.com",
  projectId: "emporio-coisas-de-minas",
  storageBucket: "emporio-coisas-de-minas.firebasestorage.app",
  messagingSenderId: "623158539642",
  appId: "1:623158539642:web:94977507f34e77cdbd12c3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inicializa os serviços Firebase usados pelo painel
firebase.firestore();
