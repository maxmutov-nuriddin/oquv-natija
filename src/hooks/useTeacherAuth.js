import { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, hasFirebaseConfig, secondaryAuth, secondaryDb } from "../firebase";

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(0, 9);
}

function phoneToEmail(phone) {
  return `${normalizePhone(phone)}@oquv-natija.local`;
}

function uzPhoneIsValid(phone) {
  return normalizePhone(phone).length === 9;
}

function messageForError(error) {
  if (error?.code === "auth/email-already-in-use") return "Bu raqam oldin ro'yxatdan o'tgan.";
  if (error?.code === "auth/invalid-credential") return "Raqam yoki parol noto'g'ri.";
  if (error?.code === "auth/weak-password") return "Parol kamida 6 ta belgidan iborat bo'lishi kerak.";
  if (error?.code === "permission-denied") return "Firestore ruxsat bermadi. Rules sozlamasini tekshiring.";
  return error?.message || "Noma'lum xato yuz berdi.";
}

export function useTeacherAuth() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasFirebaseConfig && auth));

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setTeacher(null);
        setLoading(false);
        return;
      }

      let profile = null;
      try {
        if (db) {
          const snapshot = await getDoc(doc(db, "teachers", user.uid));
          profile = snapshot.exists() ? snapshot.data() : null;
          if (profile && !profile.role) {
            await setDoc(doc(db, "teachers", user.uid), { role: "teacher" }, { merge: true });
            profile = { ...profile, role: "teacher" };
          }
        }
      } catch {
        profile = null;
      }

      setTeacher({
        uid: user.uid,
        phone: profile?.phone || user.email?.split("@")[0] || "",
        name: profile?.name || "O'qituvchi",
        role: profile?.role || "teacher"
      });
      setLoading(false);
    });
  }, []);

  const actions = useMemo(
    () => ({
      normalizePhone,
      async register({ name, phone, password }) {
        if (!hasFirebaseConfig || !secondaryAuth || !db) throw new Error("Firebase config topilmadi.");
        const cleanPhone = normalizePhone(phone);
        if (!name.trim()) throw new Error("O'qituvchi ismini kiriting.");
        if (!uzPhoneIsValid(cleanPhone)) throw new Error("Raqam 9 ta raqam bo'lishi kerak. Masalan: 901234567");

        try {
          const result = await createUserWithEmailAndPassword(secondaryAuth, phoneToEmail(cleanPhone), password);
          await setDoc(doc(secondaryDb, "teachers", result.user.uid), {
            name: name.trim(),
            phone: cleanPhone,
            role: "teacher",
            createdAt: serverTimestamp()
          });
          await signOut(secondaryAuth);
          return result.user;
        } catch (error) {
          throw new Error(messageForError(error));
        }
      },
      async login({ phone, password }) {
        if (!hasFirebaseConfig || !auth) throw new Error("Firebase config topilmadi.");
        const cleanPhone = normalizePhone(phone);
        if (!uzPhoneIsValid(cleanPhone)) throw new Error("Raqam 9 ta raqam bo'lishi kerak. Masalan: 901234567");

        try {
          const result = await signInWithEmailAndPassword(auth, phoneToEmail(cleanPhone), password);
          return result.user;
        } catch (error) {
          throw new Error(messageForError(error));
        }
      },
      async resetPassword({ phone }) {
        if (!hasFirebaseConfig || !auth) throw new Error("Firebase config topilmadi.");
        const cleanPhone = normalizePhone(phone);
        if (!uzPhoneIsValid(cleanPhone)) throw new Error("Raqam 9 ta raqam bo'lishi kerak. Masalan: 901234567");
        
        throw new Error("Parolni tiklash uchun tizim administratori bilan bog'laning.");
      },
      async logout() {
        if (auth) await signOut(auth);
      },
      async updateProfile({ name, phone }) {
        if (!auth?.currentUser || !db) throw new Error("Tizimga kirmagansiz.");
        if (!name?.trim()) throw new Error("Ismni kiriting.");
        const updates = { name: name.trim() };
        if (phone !== undefined) {
          const cleanPhone = normalizePhone(phone);
          if (!uzPhoneIsValid(cleanPhone)) throw new Error("Raqam 9 ta raqam bo'lishi kerak. Masalan: 901234567");
          updates.phone = cleanPhone;
        }
        try {
          await setDoc(doc(db, "teachers", auth.currentUser.uid), updates, { merge: true });
        } catch (error) {
          throw new Error(messageForError(error));
        }
      },
      async changePassword({ oldPassword, newPassword }) {
        if (!hasFirebaseConfig || !auth) throw new Error("Demo rejimida parolni o'zgartirib bo'lmaydi.");
        if (!auth.currentUser) throw new Error("Tizimga kirmagansiz.");
        if (!oldPassword) throw new Error("Eski parolni kiriting.");
        if (newPassword.length < 6) throw new Error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.");
        try {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await updatePassword(auth.currentUser, newPassword);
        } catch (error) {
          if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            throw new Error("Eski parol noto'g'ri.");
          }
          if (error.code === "auth/requires-recent-login") {
            throw new Error("Xavfsizlik yuzasidan qaytadan tizimga kiring.");
          }
          throw new Error(messageForError(error));
        }
      }
    }),
    []
  );

  return { teacher, loading, ...actions };
}
