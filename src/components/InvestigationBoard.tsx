/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Character, SKILLS, SkillCategory } from "../types";
import { 
  FileText, 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  BookOpen, 
  Eye, 
  TrendingUp, 
  Compass, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Award,
  Sparkles,
  Link2
} from "lucide-react";

interface Clue {
  id: string;
  title: string;
  category: "coincidence" | "critical" | "memento" | "anomaly" | "testimony" | "trace";
  description: string;
  timestamp: string;
  usedInIntuitionId?: string; // If set, this clue is locked and cannot be reused
}

interface Intuition {
  id: string;
  title: string; // Speculation category
  category: "past_clues" | "location" | "method" | "motive" | "timing" | "suspect" | "witness";
  clueIds: string[];
  logicalConnection: string;
  skillId: string;
  roleplayDesc: string;
  timestamp: string;
  trackerAdvanced: "case" | "identity" | "none";
}

interface InvestigationData {
  caseProgress: number; // 0 to 10
  identityProgress: number; // 0 to 10
  caseMarkedInActiveScene: boolean;
  identityMarkedInActiveScene: boolean;
  clues: Clue[];
  intuitions: Intuition[];
}

interface InvestigationBoardProps {
  char: Character;
  onUpdate: (updatedChar: Character) => void;
}

const CLUE_CATEGORIES = {
  coincidence: { label: "巧合", bg: "bg-teal-50 border-teal-200 text-teal-800", countBg: "bg-teal-500", dot: "bg-teal-500" },
  critical: { label: "关键", bg: "bg-rose-50 border-rose-200 text-rose-800", countBg: "bg-rose-500", dot: "bg-rose-500" },
  memento: { label: "纪念物", bg: "bg-purple-50 border-purple-200 text-purple-800", countBg: "bg-purple-500", dot: "bg-purple-500" },
  anomaly: { label: "异象", bg: "bg-indigo-50 border-indigo-200 text-indigo-800", countBg: "bg-indigo-500", dot: "bg-indigo-500" },
  testimony: { label: "证言", bg: "bg-blue-50 border-blue-200 text-blue-800", countBg: "bg-blue-500", dot: "bg-[rgb(59,130,246)]" },
  trace: { label: "痕迹", bg: "bg-amber-50 border-amber-200 text-amber-800", countBg: "bg-amber-500", dot: "bg-amber-500" },
} as const;

const INTUITION_CATEGORIES = {
  past_clues: "既往线索",
  location: "地点",
  method: "手段",
  motive: "动机",
  timing: "时机",
  suspect: "嫌疑人",
  witness: "目击者",
} as const;

export default function InvestigationBoard({ char, onUpdate }: InvestigationBoardProps) {
  // Page level notification
  const [notification, setNotification] = useState<string | null>(null);

  // Tabs for progress
  const [activeProgressTab, setActiveProgressTab] = useState<"case" | "identity">("case");

  // Core structured database state
  const [data, setData] = useState<InvestigationData>({
    caseProgress: 1,
    identityProgress: 1,
    caseMarkedInActiveScene: false,
    identityMarkedInActiveScene: false,
    clues: [],
    intuitions: []
  });

  // Modal / Inputs state for adding a clue
  const [clueTitle, setClueTitle] = useState("");
  const [clueCategory, setClueCategory] = useState<keyof typeof CLUE_CATEGORIES>("critical");
  const [clueDesc, setClueDesc] = useState("");

  // Intuition workspaces selectors & forms
  const [selectedClueIds, setSelectedClueIds] = useState<string[]>([]);
  const [intuitionCategory, setIntuitionCategory] = useState<keyof typeof INTUITION_CATEGORIES>("suspect");
  const [logicalConnection, setLogicalConnection] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("logic");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [trackerToAdvance, setTrackerToAdvance] = useState<"case" | "identity" | "none">("case");

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("jamais_vu_investigation_" + char.id);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          caseProgress: parsed.caseProgress ?? 0,
          identityProgress: parsed.identityProgress ?? 0,
          caseMarkedInActiveScene: !!parsed.caseMarkedInActiveScene,
          identityMarkedInActiveScene: !!parsed.identityMarkedInActiveScene,
          clues: parsed.clues ?? [],
          intuitions: parsed.intuitions ?? []
        });
      } catch (e) {
        console.error("Failed to parse investigation sheet data", e);
      }
    } else {
      // Default initial state
      setData({
        caseProgress: 0,
        identityProgress: 0,
        caseMarkedInActiveScene: false,
        identityMarkedInActiveScene: false,
        clues: [],
        intuitions: []
      });
    }
  }, [char.id]);

  // Save changes
  const saveState = (updated: InvestigationData) => {
    setData(updated);
    localStorage.setItem("jamais_vu_investigation_" + char.id, JSON.stringify(updated));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Create clue
  const handleAddClue = () => {
    if (!clueTitle.trim() || !clueDesc.trim()) {
      showNotification("⚠️ 证据和线索必须具备核心内容与题名。");
      return;
    }

    const newClue: Clue = {
      id: `clue_${Date.now()}_${Math.random()}`,
      title: clueTitle.trim(),
      category: clueCategory,
      description: clueDesc.trim(),
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    };

    const updated = {
      ...data,
      clues: [newClue, ...data.clues]
    };

    saveState(updated);
    setClueTitle("");
    setClueDesc("");
    showNotification(`📝 已搜集并锚定线索：【${newClue.title}】到你的调查黑板。`);
  };

  // Remove clue
  const handleRemoveClue = (id: string) => {
    const clueObj = data.clues.find(c => c.id === id);
    if (clueObj?.usedInIntuitionId) {
      showNotification("❌ 无法删除！该线索已与其他线索交织，构成了一个已固化的直觉推理。");
      return;
    }

    const updated = {
      ...data,
      clues: data.clues.filter(c => c.id !== id)
    };
    saveState(updated);
    setSelectedClueIds(selectedClueIds.filter(cl => cl !== id));
    showNotification("💨 该线索已被抹消。");
  };

  // Select / Unselect clue to workspace
  const handleToggleClueSelection = (id: string, used: boolean) => {
    if (used) {
      showNotification("⚠️ 该线索已被用在一个已完成的直觉推测中，无法重复拼凑。");
      return;
    }

    if (selectedClueIds.includes(id)) {
      setSelectedClueIds(selectedClueIds.filter(cid => cid !== id));
    } else {
      setSelectedClueIds([...selectedClueIds, id]);
    }
  };

  // Clean / Reset Workspace selections
  const handleClearWorkspace = () => {
    setSelectedClueIds([]);
    setLogicalConnection("");
    setRoleplayDesc("");
    showNotification("🧹 拼凑黑板已清空。");
  };

  // Start New Scene manually
  const handleStartNewScene = () => {
    const updated = {
      ...data,
      caseMarkedInActiveScene: false,
      identityMarkedInActiveScene: false
    };
    saveState(updated);
    showNotification("🎬 咔！思维内阁进入新场景。单场景的案件/身份直觉进度条刻印次数已重置。");
  };

  // Manual adjustment trackers
  const handleAdjustTracker = (type: "case" | "identity", delta: number) => {
    const currentVal = type === "case" ? data.caseProgress : data.identityProgress;
    const newVal = Math.min(10, Math.max(0, currentVal + delta));

    const updated = {
      ...data,
      [type === "case" ? "caseProgress" : "identityProgress"]: newVal
    };
    saveState(updated);
  };

  // Consolidate intuition core action
  const handleConsolidateIntuition = () => {
    if (selectedClueIds.length < 3) {
      showNotification("❌ 推断失败：直觉形成需要至少 3 条线索拼凑起因。");
      return;
    }

    // Get selected clue objects
    const cluesChosen = data.clues.filter(c => selectedClueIds.includes(c.id));
    
    // Check distinct categories
    const categories = new Set(cluesChosen.map(c => c.category));
    if (categories.size < 2) {
      showNotification("❌ 推断失败：组合必须跨越至少 2 个不同的线索类别，以证明你的多向发散思考。");
      return;
    }

    if (!logicalConnection.trim()) {
      showNotification("⚠️ 请阐述这些线索之间的逻辑关联假设。");
      return;
    }

    if (!roleplayDesc.trim()) {
      showNotification("⚠️ 请选择并写下你扮演的某项心灵声音如何通过灵光一闪串联它们。");
      return;
    }

    // Single scene rules checks
    if (trackerToAdvance === "case" && data.caseMarkedInActiveScene) {
      showNotification("🚨 当前场景内你已标记过一个【案件进度】！你可以选择「不标记进度」来单纯存储该直觉。");
      return;
    }
    if (trackerToAdvance === "identity" && data.identityMarkedInActiveScene) {
      showNotification("🚨 当前场景内你已标记过一个【身份进度】！你可以选择「不标记进度」来单纯存储该直觉。");
      return;
    }

    // Ready to consolidate
    const newIntuitionId = `intuition_${Date.now()}_${Math.random()}`;
    const newIntuition: Intuition = {
      id: newIntuitionId,
      title: INTUITION_CATEGORIES[intuitionCategory],
      category: intuitionCategory,
      clueIds: selectedClueIds,
      logicalConnection: logicalConnection.trim(),
      skillId: selectedSkillId,
      roleplayDesc: roleplayDesc.trim(),
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      trackerAdvanced: trackerToAdvance
    };

    // Update clues to refer to this intuition to lock them
    const updatedClues = data.clues.map(c => {
      if (selectedClueIds.includes(c.id)) {
        return { ...c, usedInIntuitionId: newIntuitionId };
      }
      return c;
    });

    // Advance progress if selected
    let nextCaseProg = data.caseProgress;
    let nextIdentProg = data.identityProgress;
    let markedCase = data.caseMarkedInActiveScene;
    let markedIdent = data.identityMarkedInActiveScene;

    if (trackerToAdvance === "case") {
      nextCaseProg = Math.min(10, data.caseProgress + 1);
      markedCase = true;
    } else if (trackerToAdvance === "identity") {
      nextIdentProg = Math.min(10, data.identityProgress + 1);
      markedIdent = true;
    }

    const updated = {
      ...data,
      clues: updatedClues,
      intuitions: [newIntuition, ...data.intuitions],
      caseProgress: nextCaseProg,
      identityProgress: nextIdentProg,
      caseMarkedInActiveScene: markedCase,
      identityMarkedInActiveScene: markedIdent
    };

    // Apply 2 XP reward to the interactive Character sheet!
    const charUpdate = {
      ...char,
      xp: char.xp + 2
    };

    saveState(updated);
    onUpdate(charUpdate);

    // Reset workspace
    setSelectedClueIds([]);
    setLogicalConnection("");
    setRoleplayDesc("");
    
    showNotification(`🌟 直觉结晶：【${newIntuition.title}】凝聚成功！调查进度推进，你收获了 2 点经验 (XP)！`);
  };

  // Back-out selection if clicked in workspace
  const handleRemoveClueFromWorkspace = (id: string) => {
    setSelectedClueIds(selectedClueIds.filter(cid => cid !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 border-l border-slate-200 flex flex-col relative scroll-smooth p-6 md:p-10 space-y-8 select-none">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed top-20 right-8 z-[200] max-w-sm bg-white border-2 border-geo-accent p-3.5 shadow-md text-slate-800 text-xs font-sans flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-geo-accent shrink-0 mt-0.5 animate-pulse" />
          <span className="font-medium leading-relaxed font-mono">{notification}</span>
        </div>
      )}

      {/* Main Title Banner was here, removed text */}

      {/* TOP SECTION: Atmospheric Direction & Scene control */}
      <div className="w-full">
        
        {/* Progress & Scene Board */}
        <div className="w-full space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-sans">
                <TrendingUp className="w-5 h-5 text-geo-accent" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  调查进度
                </span>
              </div>
              <button
                onClick={handleStartNewScene}
                className="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-400 text-slate-700 font-mono text-[10px] rounded uppercase cursor-pointer flex items-center gap-1.5 transition-colors"
                title="重置当前场景标记 of 直觉上限，开始新阶段"
              >
                <RefreshCw className="w-3 h-3 text-geo-accent" />
                <span>声明开始新场景</span>
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 gap-4 mt-2">
              <button 
                onClick={() => setActiveProgressTab("case")}
                className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors ${activeProgressTab === "case" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                案件侦破进度
              </button>
              <button 
                onClick={() => setActiveProgressTab("identity")}
                className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors ${activeProgressTab === "identity" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                身份记忆重构
              </button>
            </div>

            {/* Progress Bars */}
            <div className="pt-2">
              {activeProgressTab === "case" ? (
                <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-150 rounded-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      🔎 案件侦破进度条
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleAdjustTracker("case", -1)} className="w-5 h-5 bg-white text-slate-500 text-xs hover:text-slate-800 flex items-center justify-center border border-slate-200 rounded cursor-pointer">-</button>
                      <button onClick={() => handleAdjustTracker("case", 1)} className="w-5 h-5 bg-white text-slate-500 text-xs hover:text-slate-800 flex items-center justify-center border border-slate-200 rounded cursor-pointer">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-5 rounded-none border border-slate-300 transition-all cursor-pointer flex items-center justify-center ${
                            idx < data.caseProgress 
                              ? "bg-blue-600 border-blue-750 shadow-sm" 
                              : "bg-white border-dashed border-slate-300 hover:border-slate-500"
                          }`}
                          onClick={() => saveState({ ...data, caseProgress: idx + 1 })}
                        >
                          {idx < data.caseProgress && <span className="text-white text-[8px] font-bold font-mono">OK</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold px-0.5 pt-0.5">
                      <span>迷糊真相 (0/10)</span>
                      <span className="text-blue-600">目前: {data.caseProgress}/10</span>
                      <span>大白于天下</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[10px] text-slate-600 font-serif">
                    <div className={`w-2.5 h-2.5 rounded-full border ${data.caseMarkedInActiveScene ? "bg-amber-500 border-amber-600" : "bg-slate-200 border-slate-300"}`} />
                    <span>{data.caseMarkedInActiveScene ? "⚠️ 本场景已标记过一次案件直觉，处于锁定状态。" : "✓ 当前场景可继续追加一次案件直觉进度。"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-150 rounded-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      🧠 身份记忆重构进度
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleAdjustTracker("identity", -1)} className="w-5 h-5 bg-white text-slate-500 text-xs hover:text-slate-800 flex items-center justify-center border border-slate-200 rounded cursor-pointer">-</button>
                      <button onClick={() => handleAdjustTracker("identity", 1)} className="w-5 h-5 bg-white text-slate-500 text-xs hover:text-slate-800 flex items-center justify-center border border-slate-200 rounded cursor-pointer">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-5 rounded-none border border-slate-300 transition-all cursor-pointer flex items-center justify-center ${
                            idx < data.identityProgress 
                              ? "bg-purple-600 border-purple-750 shadow-sm" 
                              : "bg-white border-dashed border-slate-300 hover:border-slate-500"
                          }`}
                          onClick={() => saveState({ ...data, identityProgress: idx + 1 })}
                        >
                          {idx < data.identityProgress && <span className="text-white text-[8px] font-bold font-mono">OK</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold px-0.5 pt-0.5">
                      <span>完全遗忘 (0/10)</span>
                      <span className="text-purple-600">目前: {data.identityProgress}/10</span>
                      <span>宿命苏醒</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[10px] text-slate-600 font-serif">
                    <div className={`w-2.5 h-2.5 rounded-full border ${data.identityMarkedInActiveScene ? "bg-amber-500 border-amber-600" : "bg-slate-200 border-slate-300"}`} />
                    <span>{data.identityMarkedInActiveScene ? "⚠️ 本场景已标记过一次身份直觉，处于锁定状态。" : "✓ 当前场景可继续追加一次身份直觉进度。"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MID SECTION: CLUE SYSTEM (Record and Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Record New Clue Pane (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-md font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 font-sans border-b border-slate-200 pb-2.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>记事簿：收集新线索</span>
            </h3>

            {/* Input fields */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                  线索与证据名称:
                </label>
                <input
                  type="text"
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  placeholder="例：口袋里的借书卡"
                  value={clueTitle}
                  onChange={(e) => setClueTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                  线索分类:
                </label>
                <select 
                  value={clueCategory}
                  onChange={(e) => setClueCategory(e.target.value as keyof typeof CLUE_CATEGORIES)}
                  className="w-full text-xs font-black p-2.5 bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {Object.entries(CLUE_CATEGORIES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                  细节特征详细描述:
                </label>
                <textarea
                  className="w-full h-24 p-2 bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-blue-500 text-xs italic leading-relaxed font-mono resize-none font-serif"
                  placeholder="写下你脑海中联想或发掘、看穿的具体蛛丝马迹细节..."
                  value={clueDesc}
                  onChange={(e) => setClueDesc(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleAddClue}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✓ 将线索打在黑板上</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clues Board Grid (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-2 font-sans">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>证据黑板 (点击线索将其引入连线台)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase font-sans">
              已收集线索/证据: {data.clues.length} 枚
            </span>
          </div>

          {data.clues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {data.clues.map((clue) => {
                const spec = CLUE_CATEGORIES[clue.category];
                const isSelected = selectedClueIds.includes(clue.id);
                const isUsedInIntuition = !!clue.usedInIntuitionId;

                return (
                  <div
                    key={clue.id}
                    onClick={() => handleToggleClueSelection(clue.id, isUsedInIntuition)}
                    className={`border-2 p-4 cursor-pointer relative transition-all group rounded-none flex flex-col justify-between select-none ${
                      isUsedInIntuition
                        ? "opacity-60 border-slate-200 bg-slate-100/60 cursor-not-allowed"
                        : isSelected
                        ? "border-amber-500 bg-amber-50/70 shadow-[3px_3px_0px_#d97706] -translate-x-[2px] -translate-y-[2px]"
                        : "border-slate-200 bg-white hover:border-slate-350 shadow-sm"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded border font-sans uppercase tracking-[0.1em] ${spec.bg}`}>
                          {spec.label.split(" (")[0]}
                        </span>
                        
                        {isUsedInIntuition ? (
                          <span className="text-[7.5px] leading-none text-slate-500 font-sans font-bold uppercase py-0.5 border border-slate-200 px-1 bg-slate-100/80">
                            已锁定在直觉推论内
                          </span>
                        ) : isSelected ? (
                          <span className="text-[8px] leading-none text-amber-800 font-mono font-bold uppercase tracking-wider bg-amber-200/60 px-1.5 py-0.5 border border-amber-300">
                            已选中
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-sans">{clue.timestamp}</span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-800 tracking-tight font-sans">
                        {clue.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-3 italic">
                        “{clue.description}”
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-100 pt-2.5 mt-3.5">
                      {!isUsedInIntuition && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClue(clue.id);
                          }}
                          className="hover:bg-slate-100 p-1 rounded-sm text-slate-450 hover:text-red-500 transition-colors cursor-pointer opacity-30 group-hover:opacity-100 text-xs"
                          title="销毁该条线索纸片"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-200 text-center rounded text-xs text-slate-500 bg-slate-50 italic font-serif">
              “黑板前空荡荡的，蛛网在昏暗处摇曳。看来目前还没有任何能够被记录的迹象。通过左侧书写面板去搜集点什么吧。”
            </div>
          )}
        </div>
      </div>

      {/* LOWER SECTION: INTUITION CONSOLIDATOR (Workspace & Logs) */}
      <div className="border-t-2 border-slate-200 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Workspace (Left 6 cols) */}
        <div id="intuition-workspace" className="lg:col-span-6 space-y-4">
          <div className="border-2 border-amber-500 bg-amber-50/50 p-6 shadow-[4px_4px_0px_#d97706] space-y-5 rounded-none">
            <h4 className="text-sm font-black text-amber-900 tracking-wider flex items-center justify-between font-sans border-b border-amber-200 pb-3">
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-600" />
                <span>开始推理 ({selectedClueIds.length}/3)</span>
              </span>
              {selectedClueIds.length > 0 && (
                <button 
                  onClick={handleClearWorkspace} 
                  className="text-[9px] uppercase border px-1.5 py-0.5 border-slate-350 hover:border-slate-400 text-slate-700 cursor-pointer bg-white"
                >
                  重置
                </button>
              )}
            </h4>

            {/* Selected Clues Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                已选中作为关联起因的线索（需包含最少两类的 3 枚线索）:
              </span>

              {selectedClueIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.clues.filter(c => selectedClueIds.includes(c.id)).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleRemoveClueFromWorkspace(c.id)}
                      className="px-2.5 py-1.5 bg-white border border-amber-500 text-slate-800 text-xs font-black cursor-pointer rounded-sm hover:border-red-505 hover:bg-red-50/40 flex items-center gap-1.5 transition-colors"
                      title="点击将其从拼凑板拿掉"
                    >
                      <span className="text-amber-650">★</span>
                      <span>{c.title}</span>
                      <span className="text-[9px] text-slate-500 font-normal">({CLUE_CATEGORIES[c.category].label.split(" (")[0]})</span>
                      <span className="text-[9px] text-red-650 font-bold ml-1">×</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 bg-white p-4 text-center rounded text-xs text-amber-800/80 italic font-serif leading-relaxed">
                  ⬇ 点击上方证据黑板上的线索纸片，将其置入此处进行连线拼凑 ⬇
                </div>
              )}
            </div>

            {/* Intuition Form */}
            <div className="space-y-4 pt-2 border-t border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Intuition speculated categories */}
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                    直觉推测类别 :
                  </label>
                  <select 
                    value={intuitionCategory}
                    onChange={(e) => setIntuitionCategory(e.target.value as keyof typeof INTUITION_CATEGORIES)}
                    className="w-full text-xs font-black p-2 bg-white border border-slate-200 text-amber-850 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {Object.entries(INTUITION_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Advancement Selector */}
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                    将刻印哪个进度条 :
                  </label>
                  <select 
                    value={trackerToAdvance}
                    onChange={(e) => setTrackerToAdvance(e.target.value as "case" | "identity" | "none")}
                    className="w-full text-xs font-black p-2 bg-white border border-slate-200 text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="case">🔎 推进案件进度条 (+1)</option>
                    <option value="identity">🧠 推进身份记忆进度条 (+1)</option>
                    <option value="none">✓ 纯作档案记录 (不推进进度)</option>
                  </select>
                </div>
              </div>

              {/* Logical Connection explanation */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                  线索间的关联推论联想:
                </label>
                <textarea
                  className="w-full h-16 p-2 bg-white border border-slate-200 text-slate-800 outline-none focus:border-amber-500 text-xs italic leading-relaxed font-mono resize-none font-serif"
                  placeholder="例：被借书卡里那家深夜咖啡馆，与现场垃圾桶中偶然遗留的冷咖啡杯完全一致。这不是巧合，而是有人提前盯上了这里..."
                  value={logicalConnection}
                  onChange={(e) => setLogicalConnection(e.target.value)}
                />
              </div>

              {/* Rollplayed connecting skill */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 space-y-1 font-sans">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                    串联此推论的心灵声音 :
                  </label>
                  <select 
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full text-xs font-black p-2 bg-white border border-slate-200 text-amber-700 outline-none focus:border-amber-500 cursor-pointer font-sans"
                  >
                    {SKILLS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-8 space-y-1 font-sans">
                  <input
                    type="text"
                    className="w-full text-xs p-2 bg-white border border-slate-200 text-slate-800 outline-none focus:border-amber-500 font-mono"
                    placeholder="角色扮演：该技能如何灵光一闪看穿真相..."
                    value={roleplayDesc}
                    onChange={(e) => setRoleplayDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-amber-100/30 p-3 text-[10px] text-slate-600 font-sans rounded border border-amber-200 leading-relaxed">
                🧑‍⚖️ <strong>主持人否决机制：</strong>你的推论须与游戏实况的案件调查氛围和逻辑相符。若推论过于荒诞或平庸，主持人（GM）可予以否决。在此你随时可清空拼凑板并重新调整关联说辞。
              </div>

              {/* Submit trigger button */}
              <button
                type="button"
                onClick={handleConsolidateIntuition}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[3px_3px_0px_#020617] active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>★ 凝聚这一直觉：推进进度并获取 2 点 XP !</span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved Speculation log history (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center justify-between font-sans border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>已经固化的直觉推理历史</span>
            </span>
            <span className="text-[10px] font-mono select-none font-bold text-slate-400 font-sans">
              直觉数量: {data.intuitions.length}
            </span>
          </h4>

          {data.intuitions.length > 0 ? (
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
              {data.intuitions.map((intuition) => {
                const associatedClues = data.clues.filter(c => intuition.clueIds.includes(c.id));
                const sName = SKILLS.find(s => s.id === intuition.skillId)?.name || intuition.skillId;

                return (
                  <div
                    key={intuition.id}
                    className="p-5 border-l-4 border-amber-500 bg-white border border-slate-200 flex flex-col gap-3 font-sans relative shadow-sm"
                  >
                    {/* Header Spec Info */}
                    <div className="flex justify-between items-start gap-2 text-[9px] font-sans">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-semibold uppercase rounded tracking-[0.15em] font-sans">
                        直觉猜测 · {intuition.title}
                      </span>
                      
                      <div className="flex items-center gap-1.5 font-sans">
                        {intuition.trackerAdvanced === "case" ? (
                          <span className="text-[9px] text-blue-750 font-bold bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                            ✓ 刻印：案件进度
                          </span>
                        ) : intuition.trackerAdvanced === "identity" ? (
                          <span className="text-[9px] text-purple-750 font-bold bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                            ✓ 刻印：身份记忆
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                            纯叙事记录
                          </span>
                        )}
                        <span className="text-slate-400 font-mono font-bold font-sans">{intuition.timestamp}</span>
                      </div>
                    </div>

                    {/* Associated Clues Deck Summary */}
                    <div className="flex flex-wrap gap-1.5 py-1.5 border-y border-slate-100 font-sans">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block w-full font-sans">
                        织入证据 :
                      </span>
                      {associatedClues.map(ac => (
                        <span key={ac.id} className="text-[9px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-slate-750 font-medium font-sans">
                          ★ {ac.title}
                        </span>
                      ))}
                    </div>

                    {/* connection explanation description */}
                    <div className="space-y-1 select-text font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                        阐述假设 :
                      </span>
                      <p className="text-xs text-slate-650 font-serif leading-relaxed italic pl-3 border-l-2 border-slate-200">
                        “{intuition.logicalConnection}”
                      </p>
                    </div>

                    {/* Skill logic connection */}
                    <div className="p-3 bg-slate-50/80 rounded border border-slate-150 select-text">
                      <div className="flex items-center gap-1 text-[9px] text-amber-850 font-black uppercase mb-1.5 font-sans">
                        <span>🧠 心灵声音提拔 【{sName}】</span>
                      </div>
                      <p className="text-xs text-slate-600 font-serif leading-relaxed italic">
                        {intuition.roleplayDesc}
                      </p>
                    </div>

                    {/* Quick clear list intuition button */}
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={() => {
                          // Un-index clue locks
                          const clearedClues = data.clues.map(c => {
                            if (intuition.clueIds.includes(c.id)) {
                              return { ...c, usedInIntuitionId: undefined };
                            }
                            return c;
                          });

                          // Deduce progress marker added if possible (manual change)
                          let nextCaseProg = data.caseProgress;
                          let nextIdentProg = data.identityProgress;
                          if (intuition.trackerAdvanced === "case") {
                            nextCaseProg = Math.max(0, data.caseProgress - 1);
                          } else if (intuition.trackerAdvanced === "identity") {
                            nextIdentProg = Math.max(0, data.identityProgress - 1);
                          }

                          const updated = {
                            ...data,
                            clues: clearedClues,
                            intuitions: data.intuitions.filter(i => i.id !== intuition.id),
                            caseProgress: nextCaseProg,
                            identityProgress: nextIdentProg
                          };

                          saveState(updated);
                          showNotification("💨 已解固该直觉关联，锁定的线索卡已恢复自由流通。");
                        }}
                        className="text-slate-400 hover:text-red-500 opacity-20 hover:opacity-100 transition-opacity p-1 cursor-pointer text-xs font-sans"
                        title="解固直觉：释放被锁定的线索卡"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-200 text-center rounded text-xs text-slate-500 bg-slate-50/50 italic font-serif">
              “脑腔内寂静无声。尚未孕育出任何将零碎线索引证而合的警探本能假设。”
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
