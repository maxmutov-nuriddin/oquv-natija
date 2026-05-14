import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
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
  const uidRef = useRef(null);

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
      .then(async (user) => {
        if (!mounted) return;
        uidRef.current = user.uid;
        const base = `users/${user.uid}`;

        if (!mounted) return;
        unsubscribers = [
          onSnapshot(
            collection(db, base, "students"),
            (snapshot) => {
              setData((current) => ({ ...current, students: mapDocs(snapshot) }));
              markReady("students");
            },
            (error) => handleSnapshotError("students", error)
          ),
          onSnapshot(
            collection(db, base, "groups"),
            (snapshot) => {
              setData((current) => ({ ...current, groups: mapDocs(snapshot) }));
              markReady("groups");
            },
            (error) => handleSnapshotError("groups", error)
          ),
          onSnapshot(
            collection(db, base, "records"),
            (snapshot) => {
              setData((current) => ({ ...current, records: mapDocs(snapshot) }));
              markReady("records");
            },
            (error) => handleSnapshotError("records", error)
          ),
          onSnapshot(
            doc(db, base, "settings", "reward-system"),
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
    function base() {
      return `users/${uidRef.current}`;
    }
    function userCol(name) {
      return collection(db, base(), name);
    }
    function userDoc(...segments) {
      return doc(db, base(), ...segments);
    }

    return {
      async addGroup(group) {
        const nextGroup = {
          name: group.name.trim(),
          weekdays: group.weekdays || [],
          lessonStart: group.lessonStart || "",
          lessonEnd: group.lessonEnd || "",
          telegramChatId: group.telegramChatId || "",
          studentsCount: 0,
          createdAt: new Date().toISOString()
        };
        if (!nextGroup.name) return;

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await addDoc(userCol("groups"), { ...nextGroup, createdAt: serverTimestamp() });
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
          await addDoc(userCol("students"), { ...nextStudent, createdAt: serverTimestamp() });
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
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          const groupRef = userDoc("groups", groupId);
          const groupSnap = await getDoc(groupRef);
          const oldName = groupSnap.data()?.name;
          const newName = values.name;

          const batch = writeBatch(db);
          batch.update(groupRef, values);

          if (newName && oldName && newName !== oldName) {
            const q = query(userCol("students"), where("group", "==", oldName));
            const snapshot = await getDocs(q);
            snapshot.forEach((studentDoc) => {
              batch.update(studentDoc.ref, { group: newName });
            });
          }

          await batch.commit();
        } else {
          setData((current) => {
            const group = current.groups.find(g => g.id === groupId);
            const oldName = group?.name;
            const newName = values.name;
            return {
              ...current,
              groups: current.groups.map((g) => (g.id === groupId ? { ...g, ...values } : g)),
              students: current.students.map((s) => {
                if (newName && oldName && s.group === oldName) return { ...s, group: newName };
                return s;
              })
            };
          });
        }
      },
      async deleteGroup(groupId) {
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();

          const groupRef = userDoc("groups", groupId);
          const groupSnap = await getDoc(groupRef);
          const groupName = groupSnap.data()?.name;
          if (!groupName) return;

          const studentsSnap = await getDocs(
            query(userCol("students"), where("group", "==", groupName))
          );
          const studentIds = studentsSnap.docs.map(d => d.id);

          const recordRefs = [];
          for (let i = 0; i < studentIds.length; i += 10) {
            const chunk = studentIds.slice(i, i + 10);
            const recordsSnap = await getDocs(
              query(userCol("records"), where("studentId", "in", chunk))
            );
            recordsSnap.docs.forEach(d => recordRefs.push(d.ref));
          }

          const allRefs = [groupRef, ...studentsSnap.docs.map(d => d.ref), ...recordRefs];
          for (let i = 0; i < allRefs.length; i += 500) {
            const batch = writeBatch(db);
            allRefs.slice(i, i + 500).forEach(ref => batch.delete(ref));
            await batch.commit();
          }
          return;
        }

        setData((current) => {
          const groupToDelete = current.groups.find((g) => g.id === groupId);
          const deletedStudentIds = new Set(
            current.students.filter(s => s.group === groupToDelete?.name).map(s => s.id)
          );
          return {
            ...current,
            groups: current.groups.filter((g) => g.id !== groupId),
            students: current.students.filter((s) => !deletedStudentIds.has(s.id)),
            records: current.records.filter((r) => !deletedStudentIds.has(r.studentId))
          };
        });
      },
      async saveLessonRecords({ date, students, settings }) {
        const rows = [];
        const recordsToDelete = [];

        students.forEach((student) => {
          const hw = Number(student.homeworkScore || 0);
          const att = Number(student.attendanceScore || 0);
          const act = Number(student.activityScore || 0);
          const dailyBonus = student.dailyBonus;
          const hasBonus = dailyBonus !== undefined && dailyBonus !== null;

          if (hw === 0 && att === 0 && act === 0 && !hasBonus) {
            recordsToDelete.push({ studentId: student.id, date });
          } else {
            const record = { studentId: student.id, date, homework: hw, attendance: att, activity: act };
            const baseCoins = calculateCoins(record, settings);
            let coinsEarned;
            if (dailyBonus === "penalty") {
              coinsEarned = Math.round(baseCoins / 2);
            } else if (hasBonus) {
              coinsEarned = baseCoins + Number(dailyBonus);
            } else {
              coinsEarned = baseCoins;
            }
            rows.push({
              student,
              record: { ...record, coinsEarned, ...(hasBonus ? { dailyBonus } : {}) }
            });
          }
        });

        setData((current) => {
          let nextRecords = [...current.records];

          recordsToDelete.forEach(({ studentId, date }) => {
            const recordId = `${studentId}-${date}`;
            nextRecords = nextRecords.filter((item) => item.id !== recordId);
          });

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
              const rowToSave = rows.find((item) => item.student.id === student.id);
              if (rowToSave) {
                return {
                  ...student,
                  homeworkScore: rowToSave.record.homework,
                  attendanceScore: rowToSave.record.attendance,
                  activityScore: rowToSave.record.activity,
                };
              }
              return student;
            })
          };
        });

        if (hasFirebaseConfig && db) {
          await ensureAdminSession();

          const savePromises = rows.flatMap(({ student, record }) => [
            setDoc(userDoc("records", `${student.id}-${date}`), record, { merge: true }),
            updateDoc(userDoc("students", student.id), {
              homeworkScore: record.homework,
              attendanceScore: record.attendance,
              activityScore: record.activity
            })
          ]);

          const deletePromises = recordsToDelete.map(({ studentId, date }) =>
            deleteDoc(userDoc("records", `${studentId}-${date}`))
          );

          await Promise.all([...savePromises, ...deletePromises]);
        }
      },
      async saveSettings(nextSettings) {
        setData((current) => ({ ...current, settings: nextSettings }));
        if (hasFirebaseConfig && db) {
          await ensureAdminSession();
          await setDoc(userDoc("settings", "reward-system"), nextSettings, { merge: true });
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
          await Promise.all([
            deleteDoc(userDoc("students", studentId)),
            ...recordIds.map((recordId) => deleteDoc(userDoc("records", recordId)))
          ]);
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
          await updateDoc(userDoc("students", studentId), values);
        }
      }
    };
  }, []);

  return { ...data, ...actions };
}
