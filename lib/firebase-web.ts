import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

// Firebase web config — values extracted from GoogleService-Info.plist / google-services.json
const firebaseConfig = {
    apiKey: 'AIzaSyBZoipJ2w_kqlQqyW69MsHSvHJrip9nyXM',
    authDomain: 'onenmove.firebaseapp.com',
    projectId: 'onenmove',
    storageBucket: 'onenmove.firebasestorage.app',
    messagingSenderId: '490635093435',
    appId: '1:490635093435:ios:ce408a5cf717182aba109e',
};

const app = initializeApp(firebaseConfig);
const webAuth = getAuth(app);

export { webAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult };
