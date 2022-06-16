import { auth, createUserEmail, signInEmail, googleProvider, signInGooglePopup } from "../services/firebase";

export function _authSignUp(email, password) {
  return createUserEmail(auth, email, password);
}

export function _authSignIn(email, password) {
  return signInEmail(auth, email, password);
}

export function _authSignInWithGoogle() {
  return signInGooglePopup(auth, googleProvider);
}

export function _authLogout() {
  return auth.signOut();
}

export function _authGetCurrentUser() {
  return auth.currentUser;
}

export function _authStateChagned(callback) {
  auth.onAuthStateChanged((user) => {
    callback(user)
  });
}
