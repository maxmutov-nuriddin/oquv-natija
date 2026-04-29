import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db, ensureAdminSession, hasFirebaseConfig } from "../firebase";
import { demoGroups, demoRecords, demoSettings, demoStudents } from "../data/demoData";

const initialData = {
  students: demoStudents,
  groups: demoGroups,
  records: demoRecords,
  settings: demoSettings,
  isDemo: true,
  loading: false
};

function mapDocs(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function useDashboardData() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!hasFirebaseConfig || !db) return undefined;

    let unsubscribers = [];
    let mounted = true;
    setData((current) => ({ ...current, loading: true, isDemo: false }));

    ensureAdminSession()
      .then(() => {
        if (!mounted) return;
        unsubscribers = [
          onSnapshot(collection(db, "students"), (snapshot) => {
            setData((current) => ({ ...current, students: mapDocs(snapshot), loading: false }));
          }),
          onSnapshot(collection(db, "groups"), (snapshot) => {
            setData((current) => ({ ...current, groups: mapDocs(snapshot), loading: false }));
          }),
          onSnapshot(collection(db, "records"), (snapshot) => {
            setData((current) => ({ ...current, records: mapDocs(snapshot), loading: false }));
          }),
          onSnapshot(doc(db, "settings", "reward-system"), (snapshot) => {
            setData((current) => ({
              ...current,
              settings: snapshot.exists() ? { ...demoSettings, ...snapshot.data() } : demoSettings,
              loading: false
            }));
          })
        ];
      })
      .catch(() => setData(initialData));

    return () => {
      mounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const actions = useMemo(() => {
    return {
      async saveSettings(nextSettings) {
        setData((current) => ({ ...current, settings: nextSettings }));
        if (hasFirebaseConfig && db) {
          await setDoc(doc(db, "settings", "reward-system"), nextSettings, { merge: true });
        }
      },
      async updateStudent(studentId, values) {
        setData((current) => ({
          ...current,
          students: current.students.map((student) => (student.id === studentId ? { ...student, ...values } : student))
        }));
        if (hasFirebaseConfig && db) {
          await updateDoc(doc(db, "students", studentId), values);
        }
      }
    };
  }, []);

  return { ...data, ...actions };
}
