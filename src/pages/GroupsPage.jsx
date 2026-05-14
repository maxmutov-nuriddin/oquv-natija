import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Award, CalendarDays, Plus, Settings, Star, Trash2, Trophy, UserPlus, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { availableGifts, vipData, weekDays, allPrivileges } from "../constants";
import { getPeriodLeader, getPreviousMonthRange, getPreviousWeekRange, groupAvgScore, rankStudents } from "../lib/scoring";
import { sendIntroMessage } from "../lib/telegram";
import { useT } from "../i18n/index.jsx";
import { cx, getLevel, initials, medalLabel } from "../lib/utils";
import { BlockFriendModal } from "../components/forms/BlockFriendModal";
import { GiftCoinModal } from "../components/forms/GiftCoinModal";
import { GroupForm } from "../components/forms/GroupForm";
import { BuyGiftModal } from "../components/forms/BuyGiftModal";
import { StudentForm } from "../components/forms/StudentForm";
import { MysteryBoxModal } from "../components/games/MysteryBoxModal";
import { StudentCard } from "../components/student/StudentCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ExportButton } from "../components/ui/ExportButton";
import { FunModal } from "../components/ui/FunModal";
import { Modal } from "../components/ui/Modal";
import { PanelHeader } from "../components/ui/PanelHeader";

function getGroupActivityStatus(score) {
  if (score >= 80) return { key: "active",  color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" };
  if (score >= 50) return { key: "average", color: "#d97706", bg: "#fef9c3", border: "#fde68a" };
  return             { key: "weak",    color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" };
}

export function GroupsPage({ groups, students, records, settings, date, addGroup, updateGroup, deleteGroup, addStudent, updateStudent, deleteStudent, selectedGroup, setDate }) {
  const { t } = useT();
  const [activeGroup, setActiveGroup] = useState(groups[0]?.name || "");
  const activeGroupStudents = useMemo(() => students.filter(s => s.group === activeGroup), [students, activeGroup]);

  const groupActivityMap = useMemo(() => {
    const map = {};
    groups.forEach(group => {
      const gs = students.filter(s => s.group === group.name);
      map[group.name] = groupAvgScore(gs, records, settings, 30, date);
    });
    return map;
  }, [groups, students, records, settings, date]);
  const monthlyWinner = useMemo(() => getPeriodLeader(activeGroupStudents, records, settings, getPreviousMonthRange(date)), [activeGroupStudents, records, settings, date]);
  const weeklyWinner = useMemo(() => {
    const candidates = activeGroupStudents.filter(s => s.id !== monthlyWinner?.id);
    return getPeriodLeader(candidates, records, settings, getPreviousWeekRange(date));
  }, [activeGroupStudents, records, settings, date, monthlyWinner]);
  const weekPeriodKey = useMemo(() => getPreviousWeekRange(date).start.format("YYYY-MM-DD"), [date]);
  const monthPeriodKey = useMemo(() => getPreviousMonthRange(date).start.format("YYYY-MM"), [date]);
  function getPeriodKeyForSource(source) {
    return source === "weekly" ? weekPeriodKey : monthPeriodKey;
  }
  const [modal, setModal] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [activeMystery, setActiveMystery] = useState(null);
  const [activeGiftCoin, setActiveGiftCoin] = useState(null);
  const [activeBlockFriend, setActiveBlockFriend] = useState(null);

  useEffect(() => {
    if (!activeGroup && (selectedGroup || groups[0]?.name)) {
      setActiveGroup(selectedGroup || groups[0]?.name || "");
    }
    if (activeGroup && groups.length && !groups.some((group) => group.name === activeGroup)) {
      setActiveGroup(groups[0]?.name || "");
    }
  }, [activeGroup, groups, selectedGroup]);

  const activeGroupObject = useMemo(() => groups.find((group) => group.name === activeGroup), [groups, activeGroup]);
  const activeLessonTime =
    activeGroupObject?.lessonStart && activeGroupObject?.lessonEnd ? `${activeGroupObject.lessonStart} - ${activeGroupObject.lessonEnd}` : t.groups_no_time;
  const activeLessonDays =
    activeGroupObject?.weekdays?.length
      ? weekDays.filter((day) => activeGroupObject.weekdays.includes(day.value)).map((day) => t.weekday_short[day.value] || day.label).join(", ")
      : t.groups_no_days;

  const ranked = useMemo(() => rankStudents(
    students.filter((student) => student.group === activeGroup),
    records, settings, date
  ), [students, activeGroup, records, settings, date]);

  const monthly = ranked.map((student) => ({ name: student.name.split(" ")[0], monthly: student.monthlyCoins }));

  const historyDates = useMemo(() => {
    const groupStudentIds = new Set(activeGroupStudents.map(s => s.id));
    const datesMap = new Map();
    records.forEach(r => {
      if (groupStudentIds.has(r.studentId)) {
        if (!datesMap.has(r.date)) datesMap.set(r.date, { count: 0, coins: 0, records: [] });
        const stats = datesMap.get(r.date);
        stats.count++;
        stats.coins += Number(r.coinsEarned || 0);
        stats.records.push({
          ...r,
          studentName: activeGroupStudents.find(s => s.id === r.studentId)?.name || t.groups_unknown
        });
      }
    });
    return Array.from(datesMap.entries())
      .map(([d, stats]) => ({ date: d, ...stats }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activeGroupStudents, records]);

  return (
    <div className="groups-layout">
      <section className="panel group-list-panel">
        <div className="groups-side-head">
          <div className="panel-title">
            <span><Users size={18} /></span>
            <div>
              <h3>{t.groups_title}</h3>
              <p>{groups.length ? t.groups_count(groups.length) : t.groups_create_first}</p>
            </div>
          </div>
        </div>
        <div className="group-actions">
          <button className="secondary-button" type="button" onClick={() => setModal("group")}>
            <Plus size={16} />
            {t.groups_add_group}
          </button>
          <button className="secondary-button" type="button" onClick={() => setModal("student")} disabled={!groups.length}>
            <UserPlus size={16} />
            {t.groups_add_student}
          </button>
          <button className="primary-button" type="button" onClick={() => setModal("buy-gift")} disabled={!groups.length} style={{ gridColumn: "1 / -1" }}>
            <Award size={16} />
            {t.groups_buy_gift}
          </button>
        </div>
        {!groups.length && <EmptyState title={t.groups_empty_title} text={t.groups_empty_text} />}
        {!!groups.length && (
          <div className="group-list">
            {groups.map((group) => {
              const count = students.filter((student) => student.group === group.name).length;
              const avgScore = groupActivityMap[group.name];
              const actSt = avgScore != null ? getGroupActivityStatus(avgScore) : null;
              return (
                <button key={group.id} className={cx("group-card", activeGroup === group.name && "group-card-active")} onClick={() => setActiveGroup(group.name)}>
                  <div>
                    <strong>{group.name}</strong>
                    <span>{t.groups_students(count)}</span>
                    <span>{group.lessonStart && group.lessonEnd ? `${group.lessonStart} - ${group.lessonEnd}` : t.groups_no_time}</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {actSt && (
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: actSt.bg, color: actSt.color, border: `1px solid ${actSt.border}` }}>
                          {t[`group_${actSt.key}`]} · {avgScore}%
                        </span>
                      )}
                      {group.telegramChatId && (
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
                          ✈️ {t.tg_connected}
                        </span>
                      )}
                    </div>
                  </div>
                  <Users size={18} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="group-workspace">
        {activeGroupObject && (
          <>
            <section className="panel group-overview">
              <div>
                <span className="eyebrow">{t.groups_selected_label}</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>{activeGroupObject.name}</h3>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => setModal("edit-group")}>
                      {t.groups_edit}
                    </button>
                    <button className="danger-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => { if (window.confirm(t.groups_delete_confirm())) deleteGroup(activeGroupObject.id); }}>
                      {t.groups_delete}
                    </button>
                  </div>
                </div>
              </div>
              <div className="group-metrics">
                <div>
                  <strong>{activeGroupStudents.length}</strong>
                  <span>{t.groups_metric_students}</span>
                </div>
                <div>
                  <strong>{activeLessonDays}</strong>
                  <span>{t.groups_metric_days}</span>
                </div>
                <div>
                  <strong>{activeLessonTime}</strong>
                  <span>{t.groups_metric_time}</span>
                </div>
              </div>
            </section>

            <section className="panel">
              <PanelHeader icon={CalendarDays} title={t.groups_history_title} subtitle={t.groups_history_sub} />
              {!historyDates.length && <EmptyState title={t.groups_no_history_title} text={t.groups_no_history_text} />}
              {!!historyDates.length && (
                <div className="history-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {historyDates.map(h => (
                    <div key={h.date} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        className={cx("secondary-button", date === h.date && "nav-button-active")}
                        style={{ justifyContent: "space-between", padding: "12px", width: "100%", background: date === h.date ? "#eff6ff" : "#f8fafc", border: `1px solid ${date === h.date ? "#bfdbfe" : "#e2e8f0"}`, textAlign: "left" }}
                        onClick={() => { setDate(h.date); setExpandedDate(expandedDate === h.date ? null : h.date); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CalendarDays size={18} color={date === h.date ? "#2563eb" : "#64748b"} />
                          <strong style={{ color: date === h.date ? "#1e40af" : "#0f172a" }}>{dayjs(h.date).format("DD MMMM YYYY")}</strong>
                        </div>
                        <div style={{ display: "flex", gap: "16px", color: date === h.date ? "#1e40af" : "#64748b", fontSize: "13px" }}>
                          <span>{h.count} {t.groups_metric_students}</span>
                          <span>{h.coins} coin</span>
                        </div>
                      </button>
                      {expandedDate === h.date && (
                        <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "4px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", fontSize: "12px", color: "#64748b", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                            <span>{t.groups_col_student}</span>
                            <span>{t.groups_col_hw}</span>
                            <span>{t.groups_col_att}</span>
                            <span>{t.groups_col_act}</span>
                            <span>{t.groups_col_coin}</span>
                          </div>
                          {h.records.sort((a, b) => b.coinsEarned - a.coinsEarned).map(r => (
                            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", fontSize: "13px", alignItems: "center", padding: "6px 0" }}>
                              <strong>{r.studentName}</strong>
                              <span>{r.homework}%</span>
                              <span>{r.attendance}%</span>
                              <span>{r.activity}%</span>
                              <strong style={{ color: "#16a34a" }}>+{r.coinsEarned}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel">
              <PanelHeader
                icon={Trophy}
                title={`${activeGroup} ranking`}
                subtitle={t.groups_ranking_sub}
                action={<ExportButton rows={ranked} groupName={activeGroup} records={records} settings={settings} />}
              />
              {!activeGroup && <EmptyState title={t.groups_ranking_empty} text={t.groups_ranking_add_hint} />}
              {activeGroup && !ranked.length && <EmptyState title={t.groups_ranking_no_students} text={t.groups_ranking_students_hint} />}
              {!!ranked.length && (
                <>
                  <div className="chart-box chart-box-small">
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe3ef", borderRadius: 8, color: "#0f172a" }} />
                        <Area type="monotone" dataKey="monthly" stroke="#16a34a" fill="#16a34a" fillOpacity={0.14} animationDuration={280} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="leaderboard">
                    {ranked.map((student, index) => (
                      <div key={student.id} className={cx("leader-row", index < 3 && "leader-row-top")}>
                        <div className="leader-main">
                          <span className="leader-rank">{medalLabel(index)}</span>
                          <div className="avatar avatar-small">
                            {initials(student.name)}
                            {(student.gifts?.some(g => g.type === "vip") || student.id === weeklyWinner?.id || student.id === monthlyWinner?.id) && (
                              <div className="vip-badge-icon" style={{ width: "14px", height: "14px", border: "1px solid white", bottom: "-1px", right: "-1px" }}>
                                <Star size={8} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <strong style={{ margin: 0 }}>{student.name}</strong>
                              {(() => { const lv = getLevel(student.monthlyCoins || 0); return <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "999px", background: lv.bg, color: lv.color, border: `1px solid ${lv.color}40` }}>{lv.emoji} {t[`level_${lv.key}`] || lv.name}</span>; })()}
                              {student.id === weeklyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>{t.card_week_winner}</span>}
                              {student.id === monthlyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>{t.card_month_winner}</span>}
                              {student.gifts?.some(g => g.type === "vip") && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px" }}>{t.profile_vip}</span>}
                            </div>
                            <p>{t.groups_weekly_coin(student.weeklyCoins)} · {t.groups_monthly_coin(student.monthlyCoins)}</p>
                          </div>
                        </div>
                        <div className="leader-score">
                          <strong>{student.coins}</strong>
                          <span>{t.groups_total_coin}</span>
                        </div>
                        <div className="leader-actions" style={{ display: "flex", gap: "4px" }}>
                          <button className="secondary-icon-button" type="button" onClick={() => { setEditingStudent(student); setModal("edit-student"); }}>
                            <Settings size={16} />
                          </button>
                          <button className="danger-icon-button" type="button" onClick={() => deleteStudent(student)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="panel">
              <PanelHeader icon={Award} title={t.groups_gifts_title} subtitle={t.groups_gifts_sub} />
              {activeGroupStudents.filter(s => s.gifts?.length > 0 || s.id === weeklyWinner?.id || s.id === monthlyWinner?.id).length === 0 ? (
                <EmptyState title={t.groups_no_gifts_title} text={t.groups_no_gifts_text} />
              ) : (
                <div className="group-gifts-summary">
                  {activeGroupStudents.filter(s => s.gifts?.length > 0 || s.id === weeklyWinner?.id || s.id === monthlyWinner?.id).map(s => {
                    const isSenior = s.group.toLowerCase().includes("senior");
                    const tier = isSenior ? "senior" : "junior";
                    const vipPerks = [];
                    if (s.id === monthlyWinner?.id) {
                      vipPerks.push(...vipData[tier].monthly.map(p => ({ ...p, source: "monthly" })));
                    }
                    if (s.id === weeklyWinner?.id) {
                      vipPerks.push(...vipData[tier].weekly.map(p => ({ ...p, source: "weekly" })));
                    }
                    const sIgnoredDates = s.ignoredZeroDates || [];
                    const sZeroCount = records.filter(r => r.studentId === s.id && r.homework === 0 && !sIgnoredDates.includes(r.date)).length;
                    const sIsPenalized = sZeroCount >= 2;
                    const sIsPrivilegeBlocked = s.privilegeBlockedDate === date;
                    const sIsBlocked = sIsPenalized || sIsPrivilegeBlocked;

                    return (
                      <div key={s.id} className="summary-gift-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <div className="avatar avatar-small">{initials(s.name)}</div>
                          <strong>{s.name}</strong>
                          {s.id === weeklyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>{t.card_week_winner}</span>}
                          {s.id === monthlyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>{t.card_month_winner}</span>}
                          {s.gifts?.some(g => g.type === "vip") && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px" }}>{t.profile_vip}</span>}
                          {sIsPrivilegeBlocked && (
                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "999px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: "3px" }}>
                              🛡️ Bloklangan
                            </span>
                          )}
                        </div>
                        <div className="student-gifts" style={{ marginTop: 0 }}>
                          {(s.gifts || []).map((g, idx) => {
                            const giftMeta = availableGifts.find(ag => ag.id === g.id) || { icon: Award, color: g.type === "vip" ? "var(--rose)" : "var(--blue)" };
                            const GiftIcon = giftMeta.icon;
                            const isBlockGift = g.id === "block_friend";
                            const btnDisabled = isBlockGift ? sIsPenalized : sIsBlocked;
                            return (
                              <button key={idx} type="button" className="gift-tag" style={{ "--gift-color": giftMeta.color, opacity: btnDisabled ? 0.45 : 1, cursor: btnDisabled ? "not-allowed" : "pointer" }} title={sIsPrivilegeBlocked && !isBlockGift ? "Bloklangan" : sIsPenalized ? t.card_blocked : g.id === "mystery_box" ? t.card_open : t.card_use} disabled={btnDisabled} onClick={(e) => {
                                e.stopPropagation();
                                if (btnDisabled) return;
                                if (g.id === "block_friend") {
                                  setActiveBlockFriend({ studentId: s.id, giftItem: g });
                                  setModal("block-friend");
                                  return;
                                }
                                if (g.id === "mystery_box" || g.id === "mistiriy_box") {
                                  setActiveMystery({ studentId: s.id, type: "shop", mysteryType: `shop_${tier}`, giftItem: g });
                                  setModal("mystery-box");
                                  return;
                                }
                                if (g.id === "gift_coin") {
                                  setActiveGiftCoin({ studentId: s.id, type: "shop", giftItem: g });
                                  setModal("gift-coin");
                                  return;
                                }
                                const currentGifts = s.gifts || [];
                                const nextGifts = currentGifts.map(item => {
                                  const currentCount = Number(item.count || 0);
                                  if (item.id === g.id) return { ...item, count: Math.max(0, currentCount - 1) };
                                  return item;
                                }).filter(item => item.count > 0);
                                updateStudent(s.id, { gifts: nextGifts });
                              }}>
                                <GiftIcon size={12} />
                                <span>{g.name} x{g.count}</span>
                              </button>
                            );
                          })}
                          {vipPerks.map((vp, idx) => {
                            const usedCount = s.usedVipPerks?.[`${vp.source}_${getPeriodKeyForSource(vp.source)}_${vp.id}`] || 0;
                            const maxUses = vp.count !== undefined ? vp.count : (vp.uses || 1);
                            const remaining = maxUses - usedCount;
                            if (remaining <= 0) return null;
                            return (
                              <button key={`vip-${idx}`} type="button" className="gift-tag" style={{ "--gift-color": "var(--rose)", cursor: sIsBlocked ? "not-allowed" : "pointer", opacity: sIsBlocked ? 0.45 : 1 }} title={sIsPrivilegeBlocked ? "Bloklangan" : sIsPenalized ? t.card_blocked : t.card_use} disabled={sIsBlocked} onClick={(e) => {
                                e.stopPropagation();
                                if (sIsBlocked) return;
                                if (vp.id === "mystery_box") {
                                  setActiveMystery({ studentId: s.id, type: vp.source, mysteryType: `${tier}_${vp.source}`, vipPerk: vp });
                                  setModal("mystery-box");
                                } else if (vp.id === "gift_coin") {
                                  setActiveGiftCoin({ studentId: s.id, type: vp.source, vipPerk: vp });
                                  setModal("gift-coin");
                                } else {
                                  const perkKey = `${vp.source}_${getPeriodKeyForSource(vp.source)}_${vp.id}`;
                                  const usedVipPerks = { ...(s.usedVipPerks || {}) };
                                  usedVipPerks[perkKey] = (usedVipPerks[perkKey] || 0) + 1;
                                  updateStudent(s.id, { usedVipPerks });
                                }
                              }}>
                                <Star size={12} />
                                <span>{vp.name} {remaining > 1 ? `x${remaining}` : ""}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {modal === "group" && (
        <Modal title={t.gform_add} onClose={() => setModal("")}>
          <GroupForm
            onSubmit={async (values) => {
              await addGroup(values);
              if (values.telegramChatId && settings?.telegramBotToken) {
                sendIntroMessage({ group: values, settings }).catch(() => {});
              }
            }}
            onSaved={() => setModal("")}
          />
        </Modal>
      )}

      {modal === "edit-group" && activeGroupObject && (
        <Modal title={t.gform_edit} onClose={() => setModal("")}>
          <GroupForm
            initialData={activeGroupObject}
            onSubmit={(values) => {
              const oldChatId = activeGroupObject.telegramChatId || "";
              const newChatId = values.telegramChatId || "";
              updateGroup(activeGroupObject.id, values);
              if (values.name) setActiveGroup(values.name);
              if (newChatId && newChatId !== oldChatId && settings?.telegramBotToken) {
                sendIntroMessage({ group: { ...activeGroupObject, ...values }, settings }).catch(() => {});
              }
            }}
            onSaved={() => setModal("")}
          />
        </Modal>
      )}

      {modal === "student" && (
        <Modal title={t.sform_add} onClose={() => setModal("")}>
          <StudentForm groups={groups} selectedGroup={activeGroup} onSubmit={addStudent} onSaved={() => setModal("")} />
        </Modal>
      )}

      {modal === "edit-student" && editingStudent && (
        <Modal title={t.sform_edit} onClose={() => { setModal(""); setEditingStudent(null); }}>
          <StudentForm groups={groups} initialData={editingStudent} onSubmit={(values) => updateStudent(editingStudent.id, values)} onSaved={() => { setModal(""); setEditingStudent(null); }} />
        </Modal>
      )}

      {modal === "buy-gift" && (
        <Modal title={t.app_modal_buy_gift} onClose={() => setModal("")}>
          <BuyGiftModal
            groups={groups}
            students={students}
            initialGroup={activeGroup}
            onBuy={(form) => {
              const student = students.find(s => s.id === form.studentId);
              if (!student) return;
              const currentGifts = student.gifts || [];
              const selectedPrivilege = allPrivileges.find(p => p.name === form.giftName) || availableGifts.find(g => g.name === form.giftName);
              const giftId = selectedPrivilege ? selectedPrivilege.id : form.giftName.toLowerCase().replace(/\s+/g, "_");
              const existingGift = currentGifts.find(g => g.id === giftId);
              const isVip = form.giftName.toUpperCase().includes("VIP");
              let nextGifts;
              if (existingGift) {
                nextGifts = currentGifts.map(g => g.name.toLowerCase() === form.giftName.toLowerCase() ? { ...g, count: Number(g.count || 0) + Number(form.count) } : g);
              } else {
                nextGifts = [...currentGifts, { id: giftId, name: form.giftName, count: Number(form.count), type: isVip ? "vip" : "gift" }];
              }
              updateStudent(student.id, { gifts: nextGifts });
              setModal("");
            }}
          />
        </Modal>
      )}

      {modal === "mystery-box" && activeMystery && (
        <FunModal onClose={() => setModal("")}>
          <MysteryBoxModal
            activeMystery={activeMystery}
            onClose={() => setModal("")}
            onReward={(rewardItem, mystery) => {
              const student = students.find(s => s.id === mystery.studentId);
              if (!student) { setModal(""); return; }
              const currentGifts = student.gifts || [];
              const existingGift = currentGifts.find(g => g.id === rewardItem.id);
              let nextGifts;
              if (existingGift) {
                nextGifts = currentGifts.map(g => g.id === rewardItem.id ? { ...g, count: Number(g.count || 0) + 1 } : g);
              } else {
                nextGifts = [...currentGifts, { id: rewardItem.id, name: rewardItem.name, count: 1, type: "gift" }];
              }
              if (mystery.type === "shop") {
                nextGifts = nextGifts.map(item => {
                  if (item.id === mystery.giftItem.id) return { ...item, count: Math.max(0, Number(item.count || 0) - 1) };
                  return item;
                }).filter(item => item.count > 0);
                updateStudent(student.id, { gifts: nextGifts });
              } else {
                const perkKey = `${mystery.vipPerk.source}_${getPeriodKeyForSource(mystery.vipPerk.source)}_${mystery.vipPerk.id}`;
                const usedVipPerks = { ...(student.usedVipPerks || {}) };
                usedVipPerks[perkKey] = (usedVipPerks[perkKey] || 0) + 1;
                updateStudent(student.id, { gifts: nextGifts, usedVipPerks });
              }
              setModal("");
            }}
          />
        </FunModal>
      )}

      {modal === "gift-coin" && activeGiftCoin && (
        <Modal title={t.app_modal_gift_coin} onClose={() => setModal("")}>
          <GiftCoinModal
            activeGroupStudents={activeGroupStudents}
            activeGiftCoin={activeGiftCoin}
            onClose={() => setModal("")}
            onConfirm={(targetStudentId, giftData) => {
              const targetStudent = students.find(s => s.id === targetStudentId);
              if (targetStudent) {
                const existingGifts = targetStudent.gifts || [];
                const existingBoost = existingGifts.find(g => g.id === "coin_boost_2x");
                let newGifts;
                if (existingBoost) {
                  newGifts = existingGifts.map(g => g.id === "coin_boost_2x" ? { ...g, count: (g.count || 0) + 1 } : g);
                } else {
                  newGifts = [...existingGifts, { id: "coin_boost_2x", name: "2x coin boost", count: 1, type: "gift" }];
                }
                updateStudent(targetStudent.id, { gifts: newGifts });
              }
              const givingStudent = students.find(s => s.id === giftData.studentId);
              if (givingStudent) {
                if (giftData.type === "shop") {
                  const newGifts = givingStudent.gifts.map(item => {
                    if (item.id === "gift_coin") return { ...item, count: Math.max(0, (item.count || 0) - 1) };
                    return item;
                  }).filter(item => item.count > 0);
                  updateStudent(givingStudent.id, { gifts: newGifts });
                } else {
                  const perkKey = `${giftData.type}_${getPeriodKeyForSource(giftData.type)}_${giftData.vipPerk.id}`;
                  const usedVipPerks = { ...(givingStudent.usedVipPerks || {}) };
                  usedVipPerks[perkKey] = (usedVipPerks[perkKey] || 0) + 1;
                  updateStudent(givingStudent.id, { usedVipPerks });
                }
              }
              setModal("");
              setActiveGiftCoin(null);
            }}
          />
        </Modal>
      )}

      {modal === "block-friend" && activeBlockFriend && (
        <Modal title="Do'stni bloklash" onClose={() => { setModal(""); setActiveBlockFriend(null); }}>
          <BlockFriendModal
            groupStudents={activeGroupStudents}
            blockingStudentId={activeBlockFriend.studentId}
            date={date}
            onBlock={(targetId) => {
              const blockingStudent = students.find(s => s.id === activeBlockFriend.studentId);
              if (blockingStudent) {
                const newGifts = (blockingStudent.gifts || []).map(item =>
                  item.id === "block_friend" ? { ...item, count: Math.max(0, (item.count || 0) - 1) } : item
                ).filter(item => item.count > 0);
                updateStudent(blockingStudent.id, { gifts: newGifts });
              }
              updateStudent(targetId, { privilegeBlockedDate: date });
              setModal("");
              setActiveBlockFriend(null);
            }}
            onClose={() => { setModal(""); setActiveBlockFriend(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
