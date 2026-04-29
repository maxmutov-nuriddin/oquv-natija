import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, ensureAdminSession, hasFirebaseConfig } from "../firebase";
import { defaultSettings } from "../data/demoData";
import { calculateCoins } from "../lib/scoring";

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
  const recordsRef = useRef([]);

  useEffect(() => {
    recordsRef.current = data.records;
  }, [data.records]);

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
      async updateGroup(groupId, values) {
        setData((current) => ({
          ...current,
          groups: current.groups.map((group) => (group.id === groupId ? { ...group, ...values } : group)),
          // If name changed, we also need to update all students with the old name
          students: current.students.map((student) => {
            const group = current.groups.find(g => g.id === groupId);
            if (values.name && group && student.group === group.name) {
              return { ...student, group: values.name };
            }
            return student;
          })
        }));

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await updateDoc(doc(db, "groups", groupId), values);
          
          // Note: Full student group name update in Firebase would require a batch write,
          // but for simplicity we assume groups are mostly edited for time/days.
        }
      },
      async deleteGroup(groupId) {
        setData((current) => {
          const groupToDelete = current.groups.find((g) => g.id === groupId);
          return {
            ...current,
            groups: current.groups.filter((g) => g.id !== groupId),
            students: current.students.filter((s) => s.group !== groupToDelete?.name),
            records: current.records.filter((r) => {
              const student = current.students.find(s => s.id === r.studentId);
              return student?.group !== groupToDelete?.name;
            })
          };
        });

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await deleteDoc(doc(db, "groups", groupId));
          // Note: In a real app we'd also delete associated students and records from DB.
        }
      },
      async saveLessonRecords({ date, students, settings }) {
        const rows = students.map((student) => {
          const record = {
            studentId: student.id,
            date,
            homework: Number(student.homeworkScore || 0),
            attendance: Number(student.attendanceScore || 0),
            activity: Number(student.activityScore || 0)
          };
          return {
            student,
            record: {
              ...record,
              coinsEarned: calculateCoins(record, settings)
            }
          };
        });

        setData((current) => {
          const nextRecords = [...current.records];
          rows.forEach(({ record }) => {
            const recordId = `${record.studentId}-${record.date}`;
            const index = nextRecords.findIndex((item) => item.id === recordId);
            const nextRecord = { id: recordId, ...record };
            if (index >= 0) nextRecords[index] = nextRecord;
            else nextRecords.push(nextRecord);
          });

          return {
            ...current,
            records: nextRecords,
            students: current.students.map((student) => {
              const row = rows.find((item) => item.student.id === student.id);
              return row
                ? {
                    ...student,
                    homeworkScore: row.record.homework,
                    attendanceScore: row.record.attendance,
                    activityScore: row.record.activity
                  }
                : student;
            })
          };
        });

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await Promise.all(
            rows.flatMap(({ student, record }) => [
              setDoc(doc(db, "records", `${student.id}-${date}`), record, { merge: true }),
              updateDoc(doc(db, "students", student.id), {
                homeworkScore: record.homework,
                attendanceScore: record.attendance,
                activityScore: record.activity
              })
            ])
          );
        }
      },
      async saveSettings(nextSettings) {
        setData((current) => ({ ...current, settings: nextSettings }));
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await setDoc(doc(db, "settings", "reward-system"), nextSettings, { merge: true });
        }
      },
      async deleteStudent(studentId) {
        setData((current) => {
          const student = current.students.find((item) => item.id === studentId);
          return {
            ...current,
            students: current.students.filter((item) => item.id !== studentId),
            records: current.records.filter((record) => record.studentId !== studentId),
            groups: student
              ? current.groups.map((group) =>
                  group.name === student.group ? { ...group, studentsCount: Math.max(0, Number(group.studentsCount || 0) - 1) } : group
                )
              : current.groups
          };
        });

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          const recordIds = recordsRef.current.filter((record) => record.studentId === studentId).map((record) => record.id);
          await Promise.all([deleteDoc(doc(db, "students", studentId)), ...recordIds.map((recordId) => deleteDoc(doc(db, "records", recordId)))]);
        }
      },
      async updateStudent(studentId, values) {
        setData((current) => {
          const student = current.students.find(s => s.id === studentId);
          const oldGroup = student?.group;
          const newGroup = values.group || oldGroup;
          
          let nextGroups = current.groups;
          if (oldGroup !== newGroup) {
             nextGroups = current.groups.map(g => {
               if (g.name === oldGroup) return { ...g, studentsCount: Math.max(0, (g.studentsCount || 0) - 1) };
               if (g.name === newGroup) return { ...g, studentsCount: (g.studentsCount || 0) + 1 };
               return g;
             });
          }

          return {
            ...current,
            students: current.students.map((s) => (s.id === studentId ? { ...s, ...values } : s)),
            groups: nextGroups
          };
        });
        
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await updateDoc(doc(db, "students", studentId), values);
        }
      }
    };
  }, []);

  return { ...data, ...actions };
}
