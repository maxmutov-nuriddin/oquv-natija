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
  loading: false,
  error: ""
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
    const pending = new Set(["students", "groups", "records", "settings"]);
    const markReady = (key) => {
      pending.delete(key);
      if (pending.size === 0 && mounted) {
        setData((current) => ({ ...current, loading: false }));
      }
    };
    const handleSnapshotError = (key, error) => {
      markReady(key);
      setData((current) => ({
        ...current,
        loading: false,
        error:
          error?.code === "permission-denied"
            ? "Firestore ruxsat bermadi. Rules sozlamasida students/groups/records/settings o'qishga ruxsat kerak."
            : `Firebase ma'lumotlarini o'qishda xato: ${error?.message || "noma'lum xato"}`
      }));
    };
    const timeout = window.setTimeout(() => {
      if (mounted && pending.size > 0) {
        setData((current) => ({
          ...current,
          loading: false,
          error: "Firebase javobi uzoq keldi. Internet yoki Firestore rules/index sozlamasini tekshiring."
        }));
      }
    }, 7000);

    setData((current) => ({ ...current, loading: true, error: "", isDemo: false }));

    ensureAdminSession()
      .then(() => {
        if (!mounted) return;
        unsubscribers = [
          onSnapshot(
            collection(db, "students"),
            (snapshot) => {
              setData((current) => ({ ...current, students: mapDocs(snapshot) }));
              markReady("students");
            },
            (error) => handleSnapshotError("students", error)
          ),
          onSnapshot(
            collection(db, "groups"),
            (snapshot) => {
              setData((current) => ({ ...current, groups: mapDocs(snapshot) }));
              markReady("groups");
            },
            (error) => handleSnapshotError("groups", error)
          ),
          onSnapshot(
            collection(db, "records"),
            (snapshot) => {
              setData((current) => ({ ...current, records: mapDocs(snapshot) }));
              markReady("records");
            },
            (error) => handleSnapshotError("records", error)
          ),
          onSnapshot(
            doc(db, "settings", "reward-system"),
            (snapshot) => {
              setData((current) => ({
                ...current,
                settings: snapshot.exists() ? { ...defaultSettings, ...snapshot.data() } : defaultSettings
              }));
              markReady("settings");
            },
            (error) => handleSnapshotError("settings", error)
          )
        ];
      })
      .catch((error) =>
        setData((current) => ({
          ...current,
          loading: false,
          error: error?.message || "Firebase login holatini tekshirishda xato."
        }))
      );

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
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
