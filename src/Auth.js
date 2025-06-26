import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from './firebase';

const auth = getAuth(app);

//회원가입
export const register = async (EmailAuthCredential, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, EmailAuthCredential, password);
        console.log("회원가입 성공:", userCredential.user);
    } catch (error) {
        console.error("회원가입 오류:", error.message);
    }
}