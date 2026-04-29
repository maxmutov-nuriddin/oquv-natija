import { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, hasFirebaseConfig } from "../firebase";

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
        }
      } catch {
        profile = null;
      }

      setTeacher({
        uid: user.uid,
        phone: profile?.phone || user.email?.split("@")[0] || "",
        name: profile?.name || "O'qituvchi"
      });
      setLoading(false);
    });
  }, []);

  const actions = useMemo(
    () => ({
      normalizePhone,
      async register({ name, phone, password }) {
        if (!hasFirebaseConfig || !auth || !db) throw new Error("Firebase config topilmadi.");
        const cleanPhone = normalizePhone(phone);
        if (!name.trim()) throw new Error("O'qituvchi ismini kiriting.");
        if (!uzPhoneIsValid(cleanPhone)) throw new Error("Raqam 9 ta raqam bo'lishi kerak. Masalan: 901234567");

        try {
          const result = await createUserWithEmailAndPassword(auth, phoneToEmail(cleanPhone), password);
          await setDoc(doc(db, "teachers", result.user.uid), {
            name: name.trim(),
            phone: cleanPhone,
            createdAt: serverTimestamp()
          });
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
      }
    }),
    []
  );

  return { teacher, loading, ...actions };
}
