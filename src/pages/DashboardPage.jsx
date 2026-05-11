import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, Coins, Medal, Pencil, Star, Trophy, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { availableGifts, vipData, allPrivileges } from "../constants";
import { calculateCoins, getPeriodLeader, getPreviousMonthRange, getPreviousWeekRange, isDeclineTrend, rankStudents } from "../lib/scoring";
import { initials } from "../lib/utils";
import { useT } from "../i18n/index.jsx";
import { BonusDrumModal } from "../components/games/BonusDrumModal";
import { MysteryBoxModal } from "../components/games/MysteryBoxModal";
import { BlockFriendModal } from "../components/forms/BlockFriendModal";
import { BuyGiftModal } from "../components/forms/BuyGiftModal";
import { GiftCoinModal } from "../components/forms/GiftCoinModal";
import { Modal } from "../components/ui/Modal";
import { StudentCard } from "../components/student/StudentCard";
import { StudentProfileModal } from "../components/student/StudentProfileModal";
import { TimerPanel } from "../components/ui/TimerPanel";
import { ComicEntryModal } from "../components/ui/ComicEntryModal";
import { WeeklyComicPanel } from "../components/ui/WeeklyComicPanel";
import { CurrentLessonBanner } from "../components/ui/CurrentLessonBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { FunModal } from "../components/ui/FunModal";
import { PanelHeader } from "../components/ui/PanelHeader";
import { StatCard } from "../components/ui/StatCard";

export function DashboardPage({ groups, students, records, settings, selectedGroup, currentGroup, currentTime, date, query, onEditStudent, onDeleteStudent, saveLessonRecords, updateStudent, isLessonLocked = false, onUnlock }) {
  const monthlyWinner = useMemo(() => getPeriodLeader(students.filter(s => s.group === selectedGroup), records, settings, getPreviousMonthRange(date)), [students, selectedGroup, records, settings, date]);
  const weeklyWinner = useMemo(() => {
    const candidates = students.filter(s => s.group === selectedGroup && s.id !== monthlyWinner?.id);
    return getPeriodLeader(candidates, records, settings, getPreviousWeekRange(date));
  }, [students, selectedGroup, records, settings, date, monthlyWinner]);

  const isLessonDay = useMemo(() => {
    const groupObj = groups?.find(g => g.name === selectedGroup);
    return groupObj ? groupObj.weekdays?.includes(dayjs(date).day()) : false;
  }, [groups, selectedGroup, date]);

  const isLessonActive = useMemo(() => {
    const groupObj = groups?.find(g => g.name === selectedGroup);
    if (!groupObj?.lessonStart || !groupObj?.lessonEnd || !currentTime || !isLessonDay) return false;
    return currentTime >= groupObj.lessonStart && currentTime < groupObj.lessonEnd;
  }, [groups, selectedGroup, currentTime, isLessonDay]);

  const groupStudents = useMemo(() => students.filter((student) => student.group === selectedGroup), [students, selectedGroup]);
  const ranked = useMemo(() => {
    const filtered = groupStudents.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));
    return rankStudents(filtered, records, settings, date);
  }, [groupStudents, query, records, settings, date]);

  const chartData = ranked.map((student) => ({
    name: student.name.split(" ")[0],
    coin: student.coins,
    score: student.finalScore
  }));
  const totalCoins = ranked.reduce((sum, student) => sum + student.coins, 0);
  const averageScore = ranked.length ? Math.round(ranked.reduce((sum, student) => sum + student.finalScore, 0) / ranked.length) : 0;
  const previousMonthLeader = useMemo(
    () => getPeriodLeader(groupStudents, records, settings, getPreviousMonthRange(date)),
    [groupStudents, records, settings, date]
  );
  const previousWeekLeader = useMemo(
    () => getPeriodLeader(groupStudents.filter(s => s.id !== previousMonthLeader?.id), records, settings, getPreviousWeekRange(date)),
    [groupStudents, records, settings, date, previousMonthLeader]
  );

  const decliningStudents = useMemo(
    () => ranked.filter(s => isDeclineTrend(s.id, records, settings)),
    [ranked, records, settings]
  );

  const weekPeriodKey = useMemo(() => getPreviousWeekRange(date).start.format("YYYY-MM-DD"), [date]);
  const monthPeriodKey = useMemo(() => getPreviousMonthRange(date).start.format("YYYY-MM"), [date]);
  function getPeriodKeyForSource(source) {
    return source === "weekly" ? weekPeriodKey : monthPeriodKey;
  }

  const todayGroupRecords = useMemo(() => records.filter(r => r.date === date && groupStudents.some(s => s.id === r.studentId)), [records, date, groupStudents]);
  const alreadySpun = todayGroupRecords.some(r => r.dailyBonus !== undefined && r.dailyBonus !== null);
  const { t } = useT();
  const [showBonusDrum, setShowBonusDrum] = useState(false);
  const [profileStudent, setProfileStudent] = useState(null);
  const [showComic, setShowComic] = useState(false);
  const [comicVersion, setComicVersion] = useState(0);
  const [giftModal, setGiftModal] = useState("");
  const [activeMystery, setActiveMystery] = useState(null);
  const [activeGiftCoin, setActiveGiftCoin] = useState(null);
  const [activeBlockFriend, setActiveBlockFriend] = useState(null);


  const showComicButton = useMemo(() => {
    if (!currentGroup?.lessonEnd || !currentTime) return false;
    const [eh, em] = currentGroup.lessonEnd.split(":").map(Number);
    const [ch, cm] = currentTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (ch * 60 + cm);
    return diff > 0 && diff <= 30;
  }, [currentGroup, currentTime]);

  async function handleBonusReward(coins) {
    setShowBonusDrum(false);
    const isPenalty = coins === "minus_half";
    const updatedStudents = groupStudents.map(student => {
      const existingRecord = todayGroupRecords.find(r => r.studentId === student.id) || {};
      const attended = (existingRecord.homework || 0) > 0 || (existingRecord.attendance || 0) > 0 || (existingRecord.activity || 0) > 0;
      const currentCoins = Number(existingRecord.coinsEarned) || calculateCoins({
        homework: existingRecord.homework || 0,
        attendance: existingRecord.attendance || 0,
        activity: existingRecord.activity || 0
      }, settings);
      return {
        ...student,
        homeworkScore: existingRecord.homework || 0,
        attendanceScore: existingRecord.attendance || 0,
        activityScore: existingRecord.activity || 0,
        coinsEarned: currentCoins,
        ...(attended ? { dailyBonus: isPenalty ? "penalty" : coins } : {})
      };
    });
    await saveLessonRecords({ date, settings, students: updatedStudents });
  }

  return (
    <div className="page-stack">
      <CurrentLessonBanner group={currentGroup} date={date} time={currentTime} />

      {selectedGroup && isLessonDay && !alreadySpun && (
        <section className="panel" style={{ padding: "16px" }}>
          <button
            className="primary-button"
            style={{ width: "100%", justifyContent: "center", padding: "16px", background: "linear-gradient(135deg, #eab308, #d97706)", fontSize: "16px", boxShadow: "0 4px 15px rgba(234, 179, 8, 0.4)", border: "none" }}
            onClick={() => setShowBonusDrum(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🎰</span>
              <span>{t.dash_bonus_btn}</span>
            </div>
          </button>
        </section>
      )}

      <section className="stats-grid">
        <StatCard icon={Users} label={t.dash_students} value={ranked.length} hint={selectedGroup} />
        <StatCard icon={Coins} label={t.dash_total_coins} value={totalCoins} hint={t.dash_group_hint} tone="gold" />
        <StatCard icon={BarChart3} label={t.dash_avg_score} value={`${averageScore}%`} hint={t.dash_formula_hint} tone="cyan" />
        <StatCard icon={Medal} label={t.dash_week_leader} value={previousWeekLeader?.name.split(" ")[0] || "-"} hint={`${previousWeekLeader?.periodCoins || 0} ${t.dash_coin_unit}`} tone="mint" />
        <StatCard icon={Trophy} label={t.dash_month_leader} value={previousMonthLeader?.name.split(" ")[0] || "-"} hint={`${previousMonthLeader?.periodCoins || 0} ${t.dash_coin_unit}`} tone="rose" />
      </section>

      <TimerPanel />

      {showComicButton && (
        <section className="panel" style={{ padding: "16px" }}>
          <button
            className="primary-button"
            style={{ width: "100%", justifyContent: "center", padding: "14px", background: "linear-gradient(135deg, #f59e0b, #d97706)", fontSize: "15px", border: "none", boxShadow: "0 4px 15px rgba(245,158,11,0.35)" }}
            onClick={() => setShowComic(true)}
          >
            <span style={{ fontSize: "18px" }}>📖</span>
            <span>{t.dash_comic_btn}</span>
          </button>
        </section>
      )}

      <WeeklyComicPanel key={comicVersion} group={selectedGroup} date={date} />

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <PanelHeader icon={BarChart3} title={t.dash_group_stats} subtitle={t.dash_group_stats_sub} />
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe3ef", borderRadius: 8, color: "#0f172a" }} />
                <Bar dataKey="coin" fill="#16a34a" radius={[6, 6, 0, 0]} animationDuration={280} />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={280} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="winner-panel">
          <div className="winner-icon">
            <Medal size={28} />
          </div>
          <span>{t.dash_winners}</span>
          <div className="winner-list">
            <div>
              <p>{t.dash_prev_week}</p>
              <h3>{previousWeekLeader?.name || t.dash_no_data}</h3>
              <strong>{previousWeekLeader?.periodCoins || 0} {t.dash_coin_unit}</strong>
            </div>
            <div>
              <p>{t.dash_prev_month}</p>
              <h3>{previousMonthLeader?.name || t.dash_no_data}</h3>
              <strong>{previousMonthLeader?.periodCoins || 0} {t.dash_coin_unit}</strong>
            </div>
          </div>
        </aside>
      </section>

      {decliningStudents.length > 0 && (
        <section style={{
          background: "#fff7ed",
          border: "2px solid #fed7aa",
          borderBottom: "4px solid #fb923c",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <strong style={{ fontSize: "16px", fontWeight: 800, color: "#c2410c", display: "block" }}>
                {t.decline_alert_title}
              </strong>
              <span style={{ fontSize: "13px", color: "#ea580c", fontWeight: 600 }}>
                {t.decline_alert_sub(decliningStudents.length)} · {t.decline_alert_hint}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {decliningStudents.map(s => (
              <span key={s.id} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#ffedd5", color: "#c2410c",
                border: "2px solid #fed7aa", borderRadius: "9999px",
                padding: "4px 14px", fontSize: "13px", fontWeight: 800
              }}>
                📉 {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <PanelHeader icon={Users} title={t.dash_students_section} subtitle={t.dash_students_hint} />
          {isLessonLocked && (
            <button
              type="button"
              className="secondary-button"
              style={{ padding: "6px 14px", fontSize: "13px", flexShrink: 0 }}
              onClick={onUnlock}
            >
              <Pencil size={14} />
              Tahrirlash
            </button>
          )}
        </div>
        {!selectedGroup && <EmptyState title={t.dash_no_group_title} text={t.dash_no_group_text} />}
        {selectedGroup && !ranked.length && <EmptyState title={t.dash_no_students_title} text={t.dash_no_students_text} />}
        {!!ranked.length && (
          <div className="student-grid">
            {ranked.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                index={index}
                onEdit={onEditStudent}
                onDelete={onDeleteStudent}
                date={date}
                records={records}
                settings={settings}
                saveLessonRecords={saveLessonRecords}
                onProfile={setProfileStudent}
                isLessonDay={isLessonDay}
                isRecordSaved={isLessonLocked}
                onWarningReset={(studentId, newIgnoredDates) => updateStudent(studentId, { ignoredZeroDates: newIgnoredDates })}
                onUpdateStudent={updateStudent}
                weeklyWinner={weeklyWinner}
                monthlyWinner={monthlyWinner}
                hideGifts={true}
                isLowPerformer={index >= Math.ceil(ranked.length / 2)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedGroup && (
        <section className="panel">
          <PanelHeader
            icon={Award}
            title={t.groups_gifts_title}
            subtitle={t.groups_gifts_sub}
            action={
              <button
                className="primary-button" type="button"
                onClick={() => setGiftModal("buy-gift")}
                disabled={!isLessonActive}
                style={{ padding: "6px 14px", fontSize: "13px", opacity: isLessonActive ? 1 : 0.45, cursor: isLessonActive ? "pointer" : "not-allowed" }}
                title={!isLessonActive ? t.dash_lesson_only : undefined}
              >
                <Award size={14} />
                {t.groups_buy_gift}
              </button>
            }
          />
          {!isLessonActive && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f1f5f9", borderRadius: "8px", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
              <span>🔒</span>
              <span>{t.dash_gifts_lesson_only}</span>
            </div>
          )}
          {groupStudents.filter(s => s.gifts?.length > 0 || s.id === weeklyWinner?.id || s.id === monthlyWinner?.id).length === 0 ? (
            <EmptyState title={t.groups_no_gifts_title} text={t.groups_no_gifts_text} />
          ) : (
            <div className="group-gifts-summary">
              {groupStudents.filter(s => s.gifts?.length > 0 || s.id === weeklyWinner?.id || s.id === monthlyWinner?.id).map(s => {
                const tier = s.group.toLowerCase().includes("senior") ? "senior" : "junior";
                const vipPerks = [];
                if (s.id === monthlyWinner?.id) vipPerks.push(...vipData[tier].monthly.map(p => ({ ...p, source: "monthly" })));
                if (s.id === weeklyWinner?.id)  vipPerks.push(...vipData[tier].weekly.map(p => ({ ...p, source: "weekly" })));
                const sIgnoredDates = s.ignoredZeroDates || [];
                const sZeroCount = records.filter(r => r.studentId === s.id && r.homework === 0 && (r.attendance > 0 || r.activity > 0) && !sIgnoredDates.includes(r.date)).length;
                const sIsBlocked = sZeroCount >= 2 || s.privilegeBlockedDate === date;
                const sIsPrivilegeBlocked = s.privilegeBlockedDate === date;
                return (
                  <div key={s.id} className="summary-gift-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <div className="avatar avatar-small">{initials(s.name)}</div>
                      <strong>{s.name}</strong>
                      {s.id === weeklyWinner?.id  && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #60a5fa, #2563eb)", color: "white" }}>{t.card_week_winner}</span>}
                      {s.id === monthlyWinner?.id && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px", background: "linear-gradient(135deg, #f472b6, #db2777)", color: "white" }}>{t.card_month_winner}</span>}
                      {s.gifts?.some(g => g.type === "vip") && <span className="vip-text-badge" style={{ fontSize: "10px", padding: "1px 4px" }}>{t.profile_vip}</span>}
                      {sIsPrivilegeBlocked && <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "999px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>{t.dash_blocked_label}</span>}
                    </div>
                    <div className="student-gifts" style={{ marginTop: 0 }}>
                      {(s.gifts || []).map((g, idx) => {
                        const giftMeta = availableGifts.find(ag => ag.id === g.id) || { icon: Award, color: g.type === "vip" ? "var(--rose)" : "var(--blue)" };
                        const GiftIcon = giftMeta.icon;
                        const isBlockGift = g.id === "block_friend";
                        const btnDisabled = !isLessonActive || (isBlockGift ? sZeroCount >= 2 : sIsBlocked);
                        return (
                          <button key={idx} type="button" className="gift-tag"
                            style={{ "--gift-color": giftMeta.color, opacity: btnDisabled ? 0.45 : 1, cursor: btnDisabled ? "not-allowed" : "pointer" }}
                            disabled={btnDisabled}
                            title={!isLessonActive ? t.dash_lesson_only : sIsPrivilegeBlocked && !isBlockGift ? t.dash_blocked_label : sZeroCount >= 2 ? t.card_blocked : g.id === "mystery_box" ? t.card_open : t.card_use}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (btnDisabled) return;
                              if (g.id === "block_friend") { setActiveBlockFriend({ studentId: s.id, giftItem: g }); setGiftModal("block-friend"); return; }
                              if (g.id === "mystery_box" || g.id === "mistiriy_box") { setActiveMystery({ studentId: s.id, type: "shop", mysteryType: `shop_${tier}`, giftItem: g }); setGiftModal("mystery-box"); return; }
                              if (g.id === "gift_coin") { setActiveGiftCoin({ studentId: s.id, type: "shop", giftItem: g }); setGiftModal("gift-coin"); return; }
                              const nextGifts = (s.gifts || []).map(item => item.id === g.id ? { ...item, count: Math.max(0, Number(item.count || 0) - 1) } : item).filter(item => item.count > 0);
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
                          <button key={`vip-${idx}`} type="button" className="gift-tag"
                            style={{ "--gift-color": "var(--rose)", cursor: (!isLessonActive || sIsBlocked) ? "not-allowed" : "pointer", opacity: (!isLessonActive || sIsBlocked) ? 0.45 : 1 }}
                            disabled={!isLessonActive || sIsBlocked}
                            title={!isLessonActive ? t.dash_lesson_only : sIsPrivilegeBlocked ? t.dash_blocked_label : sZeroCount >= 2 ? t.card_blocked : t.card_use}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLessonActive || sIsBlocked) return;
                              if (vp.id === "mystery_box") { setActiveMystery({ studentId: s.id, type: vp.source, mysteryType: `${tier}_${vp.source}`, vipPerk: vp }); setGiftModal("mystery-box"); }
                              else if (vp.id === "gift_coin") { setActiveGiftCoin({ studentId: s.id, type: vp.source, vipPerk: vp }); setGiftModal("gift-coin"); }
                              else {
                                const perkKey = `${vp.source}_${getPeriodKeyForSource(vp.source)}_${vp.id}`;
                                updateStudent(s.id, { usedVipPerks: { ...(s.usedVipPerks || {}), [perkKey]: (s.usedVipPerks?.[perkKey] || 0) + 1 } });
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
      )}

      {showBonusDrum && (
        <FunModal onClose={() => setShowBonusDrum(false)}>
          <BonusDrumModal onReward={handleBonusReward} onClose={() => setShowBonusDrum(false)} />
        </FunModal>
      )}

      {showComic && (
        <ComicEntryModal
          group={selectedGroup}
          date={date}
          onClose={() => setShowComic(false)}
          onSaved={() => setComicVersion(v => v + 1)}
        />
      )}

      {giftModal === "buy-gift" && (
        <Modal title={t.app_modal_buy_gift} onClose={() => setGiftModal("")}>
          <BuyGiftModal
            groups={groups}
            students={students}
            initialGroup={selectedGroup}
            onBuy={(form) => {
              const student = students.find(s => s.id === form.studentId);
              if (!student) return;
              const currentGifts = student.gifts || [];
              const selectedPrivilege = allPrivileges.find(p => p.name === form.giftName) || availableGifts.find(g => g.name === form.giftName);
              const giftId = selectedPrivilege ? selectedPrivilege.id : form.giftName.toLowerCase().replace(/\s+/g, "_");
              const isVip = form.giftName.toUpperCase().includes("VIP");
              const existingGift = currentGifts.find(g => g.id === giftId);
              const nextGifts = existingGift
                ? currentGifts.map(g => g.name.toLowerCase() === form.giftName.toLowerCase() ? { ...g, count: Number(g.count || 0) + Number(form.count) } : g)
                : [...currentGifts, { id: giftId, name: form.giftName, count: Number(form.count), type: isVip ? "vip" : "gift" }];
              updateStudent(student.id, { gifts: nextGifts });
              setGiftModal("");
            }}
          />
        </Modal>
      )}

      {giftModal === "mystery-box" && activeMystery && (
        <FunModal onClose={() => setGiftModal("")}>
          <MysteryBoxModal
            activeMystery={activeMystery}
            onClose={() => setGiftModal("")}
            onReward={(rewardItem, mystery) => {
              const student = students.find(s => s.id === mystery.studentId);
              if (!student) { setGiftModal(""); return; }
              const currentGifts = student.gifts || [];
              const existingGift = currentGifts.find(g => g.id === rewardItem.id);
              let nextGifts = existingGift
                ? currentGifts.map(g => g.id === rewardItem.id ? { ...g, count: Number(g.count || 0) + 1 } : g)
                : [...currentGifts, { id: rewardItem.id, name: rewardItem.name, count: 1, type: "gift" }];
              if (mystery.type === "shop") {
                nextGifts = nextGifts.map(item => item.id === mystery.giftItem.id ? { ...item, count: Math.max(0, Number(item.count || 0) - 1) } : item).filter(item => item.count > 0);
                updateStudent(student.id, { gifts: nextGifts });
              } else {
                const perkKey = `${mystery.vipPerk.source}_${getPeriodKeyForSource(mystery.vipPerk.source)}_${mystery.vipPerk.id}`;
                updateStudent(student.id, { gifts: nextGifts, usedVipPerks: { ...(student.usedVipPerks || {}), [perkKey]: (student.usedVipPerks?.[perkKey] || 0) + 1 } });
              }
              setGiftModal("");
            }}
          />
        </FunModal>
      )}

      {giftModal === "gift-coin" && activeGiftCoin && (
        <Modal title={t.app_modal_gift_coin} onClose={() => setGiftModal("")}>
          <GiftCoinModal
            activeGroupStudents={groupStudents}
            activeGiftCoin={activeGiftCoin}
            onClose={() => setGiftModal("")}
            onConfirm={(targetStudentId, giftData) => {
              const target = students.find(s => s.id === targetStudentId);
              if (target) {
                const existingBoost = (target.gifts || []).find(g => g.id === "coin_boost_2x");
                const newGifts = existingBoost
                  ? (target.gifts || []).map(g => g.id === "coin_boost_2x" ? { ...g, count: (g.count || 0) + 1 } : g)
                  : [...(target.gifts || []), { id: "coin_boost_2x", name: "2x coin boost", count: 1, type: "gift" }];
                updateStudent(target.id, { gifts: newGifts });
              }
              const giver = students.find(s => s.id === giftData.studentId);
              if (giver) {
                if (giftData.type === "shop") {
                  updateStudent(giver.id, { gifts: giver.gifts.map(item => item.id === "gift_coin" ? { ...item, count: Math.max(0, (item.count || 0) - 1) } : item).filter(item => item.count > 0) });
                } else {
                  const perkKey = `${giftData.type}_${getPeriodKeyForSource(giftData.type)}_${giftData.vipPerk.id}`;
                  updateStudent(giver.id, { usedVipPerks: { ...(giver.usedVipPerks || {}), [perkKey]: (giver.usedVipPerks?.[perkKey] || 0) + 1 } });
                }
              }
              setGiftModal("");
              setActiveGiftCoin(null);
            }}
          />
        </Modal>
      )}

      {giftModal === "block-friend" && activeBlockFriend && (
        <Modal title="Do'stni bloklash" onClose={() => { setGiftModal(""); setActiveBlockFriend(null); }}>
          <BlockFriendModal
            groupStudents={groupStudents}
            blockingStudentId={activeBlockFriend.studentId}
            date={date}
            onBlock={(targetId) => {
              const blocker = students.find(s => s.id === activeBlockFriend.studentId);
              if (blocker) {
                updateStudent(blocker.id, { gifts: (blocker.gifts || []).map(item => item.id === "block_friend" ? { ...item, count: Math.max(0, (item.count || 0) - 1) } : item).filter(item => item.count > 0) });
              }
              updateStudent(targetId, { privilegeBlockedDate: date });
              setGiftModal("");
              setActiveBlockFriend(null);
            }}
            onClose={() => { setGiftModal(""); setActiveBlockFriend(null); }}
          />
        </Modal>
      )}

      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          records={records}
          settings={settings}
          groups={groups}
          onClose={() => setProfileStudent(null)}
        />
      )}
    </div>
  );
}
