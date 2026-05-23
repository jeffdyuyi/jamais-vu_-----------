/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Character, SKILLS, SkillCategory } from "../types";
import { Trash2, MessageSquare, AlertCircle, Quote } from "lucide-react";

interface InterjectionBoardProps {
  char: Character;
  onUpdate: (updatedChar: Character) => void;
}

export default function InterjectionBoard({ char, onUpdate }: InterjectionBoardProps) {
  const [interjections, setInterjections] = useState<Array<{
    id: string;
    skillId: string;
    text: string;
    type: "handed" | "self";
    timestamp: string;
  }>>([]);

  const [selectedInterjectionSkill, setSelectedInterjectionSkill] = useState<string>("volition");
  const [interjectionText, setInterjectionText] = useState("");
  const [interjectionType, setInterjectionType] = useState<"handed" | "self">("handed");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Load and save interjections per character
  useEffect(() => {
    const saved = localStorage.getItem("jamais_vu_interjections_" + char.id);
    setInterjections(saved ? JSON.parse(saved) : []);
  }, [char.id]);

  useEffect(() => {
    if (char.id) {
      localStorage.setItem("jamais_vu_interjections_" + char.id, JSON.stringify(interjections));
    }
  }, [interjections, char.id]);

  const handleAddInterjection = () => {
    if (!interjectionText.trim()) {
      showNotification("⚠️ 无法记录空空如也的思维声浪。请先胡言乱语或指点迷津两句。");
      return;
    }

    // Rules logic: If triggered by "handed", consume 1 token if player has tokens, OR if they are receiving,
    // "任何在场玩家都可以递给你指示物并提议: '....'，从而触发插叙。"
    // This adds 1 token to this character.
    if (interjectionType === "handed" && char.tokens >= 3) {
      showNotification("❌ 无法从玩家处接收指示物！你当前持有的插叙指示物已达 3 个上限，已过载。");
      return;
    }

    let updatedChar = { ...char };
    if (interjectionType === "handed") {
      // Receive token
      updatedChar.tokens = Math.min(3, char.tokens + 1);
    }

    const newInter = {
      id: `inter_${Date.now()}_${Math.random()}`,
      skillId: selectedInterjectionSkill,
      text: interjectionText.trim(),
      type: interjectionType,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    setInterjections([newInter, ...interjections]);
    setInterjectionText("");
    onUpdate(updatedChar);

    if (interjectionType === "handed") {
      showNotification("🪙 在场玩家递来 1 枚指示物，提议听你内化之音！指示物增加 1 且已为你刻印该插叙对话。");
    } else {
      showNotification("🧠 你自主发起了理性的惊叹！已为你刻印该插叙对话。");
    }
  };

  const handleRemoveInterjection = (id: string) => {
    setInterjections(interjections.filter(i => i.id !== id));
    showNotification("💨 该声浪已消散于脑脑海的迷雾。");
  };

  const selectedSkillInfo = SKILLS.find(s => s.id === selectedInterjectionSkill);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 border-l border-slate-200 flex flex-col relative scroll-smooth p-6 md:p-10 space-y-8 select-none">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed top-20 right-8 z-[200] max-w-sm bg-amber-50 border-2 border-amber-500 p-3.5 shadow-md text-amber-950 text-xs font-sans flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      {/* Main Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-slate-200 pb-6 shrink-0">
        <div className="space-y-1.5Packed font-sans">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              戏剧叙事系统
            </span>
            <span className="text-slate-400 font-mono text-xs">◆ 案件记录</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 font-sans">
            插叙
          </h1>
        </div>
        <div className="bg-amber-500 text-slate-950 px-4 py-2 font-black text-xs uppercase tracking-widest font-mono">
          旧事如新 1.2
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Instructions and Token tracking */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rules and Tokens Card */}
          <div className="border-2 border-amber-500 bg-amber-50/50 p-5 shadow-[4px_4px_0px_#d97706] rounded-none space-y-5">
            <div className="flex justify-between items-center border-b border-amber-200 pb-2.5">
              <span className="text-xs font-black uppercase text-amber-950 tracking-widest">
                当前插叙指示物
              </span>
              <span className="text-slate-500 font-mono text-xs font-bold leading-none">
                容量: 3
              </span>
            </div>

            <div className="space-y-4">
              {/* Circular Dots */}
              <div className="flex justify-center gap-3 py-3 bg-white border border-amber-200 rounded">
                {Array.from({ length: 3 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const targetValue = i + 1;
                      const delta = targetValue - char.tokens;
                      let updatedVal = Math.min(3, Math.max(0, char.tokens + delta));
                      onUpdate({
                        ...char,
                        tokens: updatedVal
                      });
                    }}
                    className={`w-11 h-11 rounded-full border-2 cursor-pointer flex flex-col items-center justify-center font-black transition-all ${
                      i < char.tokens 
                        ? "bg-amber-500 border-amber-600 text-slate-950 shadow-md hover:scale-110" 
                        : "bg-white border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 text-sm"
                    }`}
                    title={`插叙指示物 Slot ${i + 1}`}
                  >
                    {i < char.tokens ? (
                      <>
                        <span className="text-sm select-none leading-none">★</span>
                        <span className="text-[7px] leading-none font-sans font-bold mt-0.5">已满</span>
                      </>
                    ) : (
                      <span className="text-xs font-mono font-bold leading-none">{i + 1}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Adjust text manual buttons */}
              <div className="flex justify-between items-center px-1">
                <button
                  type="button"
                  onClick={() => {
                    let updatedVal = Math.max(0, char.tokens - 1);
                    onUpdate({ ...char, tokens: updatedVal });
                    showNotification("🪙 已消耗或手动减少 1 枚插叙指示物。");
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 text-xs border border-slate-300 transition-colors uppercase cursor-pointer"
                >
                  - 减少 1 枚
                </button>
                <div className="text-center">
                  <span className="text-2xl font-black font-mono text-amber-600 block leading-tight">
                    {char.tokens} / 3
                  </span>
                  <span className="text-[8px] tracking-tight font-black text-slate-500 uppercase font-mono">
                    当前数量
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (char.tokens >= 3) {
                      showNotification("⚠️ 已经达到上限 3 枚。已持有 3 枚此指示物的调查员不可再被递交。");
                    } else {
                      let updatedVal = Math.min(3, char.tokens + 1);
                      onUpdate({ ...char, tokens: updatedVal });
                      showNotification("🪙 手动增加 1 枚外部玩家插叙指示物。");
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 border-2 border-amber-600 text-white font-black px-3 py-1 text-xs transition-all uppercase cursor-pointer"
                >
                  + 增加 1 枚
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Create Interjection and History (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Create Interjection Statement */}
          <div className="border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-sans border-b border-slate-200 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-550" />
              <span>录入新心灵插叙</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Skill Selector */}
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                  选择发声的 24 技能之一:
                </label>
                <select 
                  value={selectedInterjectionSkill}
                  onChange={(e) => setSelectedInterjectionSkill(e.target.value)}
                  className="w-full text-xs font-black p-2.5 bg-slate-50 border border-slate-200 text-slate-850 outline-none focus:border-amber-500 cursor-pointer"
                >
                  {SKILLS.map(s => (
                    <option key={s.id} value={s.id}>
                      【{s.category}】{s.name} ({s.id.toUpperCase()})
                    </option>
                  ))}
                </select>

                {/* Selected Skill small description */}
                {selectedSkillInfo && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-[11px] leading-relaxed text-slate-600 mt-2 font-sans">
                    <span className="font-bold text-amber-900 font-sans">【{selectedSkillInfo.name}】: </span>
                    {selectedSkillInfo.description}
                  </div>
                )}
              </div>

              {/* Radio triggers */}
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  触发起因及指示物流通:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <label className={`flex items-start gap-3 p-3 rounded-none border cursor-pointer transition-colors ${
                    interjectionType === "handed" 
                      ? "bg-amber-100/40 border-amber-500 text-slate-900 font-medium" 
                      : "bg-slate-50 border-slate-200 text-slate-550 hover:border-slate-350"
                  }`}>
                    <input 
                      type="radio" 
                      name="inter_type_radio" 
                      checked={interjectionType === "handed"}
                      onChange={() => setInterjectionType("handed")}
                      className="accent-amber-500 mt-0.5"
                    />
                    <div className="text-[11px] font-sans flex flex-col leading-tight">
                      <span className="font-black text-slate-900">🪙 他人向你递交 1 枚插叙指示物</span>
                      <span className="text-[10px] text-slate-500 leading-normal mt-1 font-semibold">
                        在场其他玩家想要看某项见解。将自动为你添加该见识对话并且你当前的指示物 +1 (最大 3 枚)。
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-none border cursor-pointer transition-colors ${
                    interjectionType === "self" 
                      ? "bg-amber-100/40 border-amber-500 text-slate-900 font-medium" 
                      : "bg-slate-50 border-slate-200 text-slate-550 hover:border-slate-350"
                  }`}>
                    <input 
                      type="radio" 
                      name="inter_type_radio" 
                      checked={interjectionType === "self"}
                      onChange={() => setInterjectionType("self")}
                      className="accent-amber-500 mt-0.5"
                    />
                    <div className="text-[11px] font-sans flex flex-col leading-tight">
                      <span className="font-black text-slate-900">🧠 自主发起思维插叙 (无需消耗也不产生指示物)</span>
                      <span className="text-[10px] text-slate-505 leading-normal mt-1 font-semibold">
                        适用于即兴表达。仅仅作叙事记录，不需要他人递交，指示物数不变。
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Input narrative text area */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between font-sans">
                <span>呢喃与指点内容:</span>
                <span className="text-amber-600 font-mono text-[9px] uppercase font-bold">建议使用极乐迪斯科戏剧体</span>
              </label>
              <textarea
                className="w-full h-28 p-3 bg-slate-50 border-2 border-slate-200 text-slate-800 outline-none focus:border-amber-500 focus:bg-white text-xs italic leading-relaxed resize-none font-mono"
                placeholder={`【${SKILLS.find(s => s.id === selectedInterjectionSkill)?.name}】：“别太快感到难过，侦探。他们不过是一群在时间的缝隙中徒劳打转的小丑，而你也是其中之一...”`}
                value={interjectionText}
                onChange={(e) => setInterjectionText(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddInterjection}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase font-sans tracking-widest shadow-[3px_3px_0px_#020617] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                📝 记录此思维碎语入该调查员脑内
              </button>
            </div>
          </div>

          {/* History Scroll Area */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black tracking-wider text-slate-500 uppercase border-b border-slate-200 pb-2 flex justify-between items-center font-sans">
              <span>💡 历史记录 ({interjections.length})</span>
              <span className="text-[10px] opacity-40 font-normal">点击垃圾箱按钮可抹消</span>
            </h4>

            {interjections.length > 0 ? (
              <div className="space-y-3 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar font-serif">
                {interjections.map((inter) => {
                  const sInfo = SKILLS.find(s => s.id === inter.skillId);
                  if (!sInfo) return null;

                  // Dynamic style selectors depending on categories
                  let colorClass = "border-blue-200 text-blue-700 bg-blue-50/50";
                  if (sInfo.category === SkillCategory.Psyche) {
                    colorClass = "border-purple-200 text-purple-700 bg-purple-50/50";
                  } else if (sInfo.category === SkillCategory.Physique) {
                    colorClass = "border-red-200 text-red-700 bg-red-50/50";
                  } else if (sInfo.category === SkillCategory.Motorics) {
                    colorClass = "border-amber-200 text-amber-700 bg-amber-50/50";
                  }

                  return (
                    <div 
                      key={inter.id}
                      className="p-4 border border-slate-150 hover:bg-slate-55 bg-white flex items-start gap-4 justify-between group/line transition-colors shadow-sm"
                    >
                      <div className="space-y-2 flex-1 select-text">
                        <div className="flex items-center gap-2 text-[10px] font-sans">
                          <span className={`px-2 py-0.5 rounded-sm font-black uppercase text-[9px] border ${colorClass}`}>
                            {sInfo.category} · {sInfo.name}
                          </span>
                          <span className="text-slate-455 font-mono font-bold">{inter.timestamp}</span>
                          {inter.type === "handed" ? (
                            <span className="text-amber-800 bg-amber-100 border border-amber-200 font-bold font-sans text-[9px] flex items-center gap-1 px-1 rounded-sm">
                              🪙 对方递指物触发
                            </span>
                          ) : (
                            <span className="text-blue-800 bg-blue-100 border border-blue-200 font-bold font-sans text-[9px] flex items-center gap-1 px-1 rounded-sm">
                              🧠 自主思维声浪
                            </span>
                          )}
                        </div>
                        
                        <div className="relative pl-3 border-l-2 border-slate-200 font-serif">
                          <Quote className="absolute top-0 -left-1.5 w-3 h-3 text-slate-350 opacity-25 -translate-x-1" />
                          <p className="text-sm text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                            “{inter.text}”
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveInterjection(inter.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded bg-slate-50 hover:bg-slate-100 opacity-40 group-hover/line:opacity-100 transition-opacity cursor-pointer text-xs"
                        title="抹消这一思维残响"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 border border-dashed border-slate-200 text-center rounded text-xs text-slate-500 italic bg-slate-50 font-serif">
                “思维内阁中一片死寂。没有任何不速之音愿意在此时撕开你平静的表象。”
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
