import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, ensureAdminSession, hasFirebaseConfig } from "../firebase";
import { defaultSettings } from "../data/demoData";

const initialData = {
  students: [],
  groups: [],
  records: [],
  settings: defaultSettings,
  isDemo: !hasFirebaseConfig,
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
              settings: snapshot.exists() ? { ...defaultSettings, ...snapshot.data() } : defaultSettings,
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
      async addGroup(group) {
        const nextGroup = {
          name: group.name.trim(),
          weekdays: group.weekdays || [],
          lessonStart: group.lessonStart || "",
          lessonEnd: group.lessonEnd || "",
          studentsCount: 0,
          createdAt: new Date().toISOString()
        };
        if (!nextGroup.name) return;

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await addDoc(collection(db, "groups"), { ...nextGroup, createdAt: serverTimestamp() });
          return;
        }

        setData((current) => ({
          ...current,
          groups: [...current.groups, { id: crypto.randomUUID(), ...nextGroup }]
        }));
      },
      async addStudent(student) {
        const nextStudent = {
          name: student.name.trim(),
          group: student.group,
          homeworkScore: Number(student.homeworkScore || 0),
          attendanceScore: Number(student.attendanceScore || 0),
          activityScore: Number(student.activityScore || 0),
          coins: 0,
          createdAt: new Date().toISOString()
        };
        if (!nextStudent.name || !nextStudent.group) return;

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await addDoc(collection(db, "students"), { ...nextStudent, createdAt: serverTimestamp() });
          return;
        }

        setData((current) => ({
          ...current,
          students: [...current.students, { id: crypto.randomUUID(), ...nextStudent }],
          groups: current.groups.map((group) =>
            group.name === nextStudent.group ? { ...group, studentsCount: Number(group.studentsCount || 0) + 1 } : group
          )
        }));
      },
      async saveSettings(nextSettings) {
        setData((current) => ({ ...current, settings: nextSettings }));
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await setDoc(doc(db, "settings", "reward-system"), nextSettings, { merge: true });
        }
      },
      async updateStudent(studentId, values) {
        setData((current) => ({
          ...current,
          students: current.students.map((student) => (student.id === studentId ? { ...student, ...values } : student))
        }));
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await updateDoc(doc(db, "students", studentId), values);
        }
      }
    };
  }, []);

  return { ...data, ...actions };
}
