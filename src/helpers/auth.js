import { authService, createUserEmail, signInEmail, googleProvider, signInGooglePopup } from "../services/firebase";

export function signUp(email, password) {
  return createUserEmail(authService, email, password);
}

export function signIn(email, password) {
  return signInEmail(authService, email, password);
}

export function signInWithGoogle() {
  return signInGooglePopup(authService, googleProvider);
}

export function logout() {
  return authService.signOut();
}
