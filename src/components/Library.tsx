/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Character, SKILLS, Skill } from "../types";
import { 
  User, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Play, 
  Edit, 
  AlertTriangle, 
  Heart, 
  Zap, 
  Check, 
  Sparkles, 
  X, 
  Globe,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LibraryProps {
  characters: Character[];
  activeCharId: string | null;
  onSelect: (charId: string) => void;
  onDelete: (charId: string) => void;
  onDuplicate: (charId: string) => void;
  onImport: (charJson: string) => string | null; // returns error message or null if success
  onUpdateCharacter: (char: Character) => void;
  onCreateNew: () => void;
}

export default function Library({
  characters,
  activeCharId,
  onSelect,
  onDelete,
  onDuplicate,
  onImport,
  onUpdateCharacter,
  onCreateNew
}: LibraryProps) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [exportingChar, setExportingChar] = useState<Character | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States for narrative ending input (death or retirement) when health or morale drops to 0
  const [activeEndingChar, setActiveEndingChar] = useState<{ character: Character, statType: "health" | "morale" } | null>(null);
  const [endingInput, setEndingInput] = useState("");

  const changeStat = (sc: Character, stat: "health" | "morale", delta: number) => {
    let updatedStates = sc.states ? [...sc.states] : [];
    
    if (delta > 0) {
      if (stat === "health") {
        const pIdx = updatedStates.findIndex(s => s.category === "physical");
        if (pIdx !== -1) {
          updatedStates.splice(pIdx, 1);
        }
      } else if (stat === "morale") {
        const mIdx = updatedStates.findIndex(s => s.category === "mental");
        if (mIdx !== -1) {
          updatedStates.splice(mIdx, 1);
        }
      }
    }

    const newVal = Math.min(5, Math.max(0, (sc[stat] || 0) + delta));
    
    // Check if stat reached 0 and was formerly positive
    if (newVal === 0 && sc[stat] > 0) {
      setActiveEndingChar({ character: sc, statType: stat });
      setEndingInput("");
    }

    // Clean up endingStatement if they revive/increase health/morale above 0
    let updatedEndingStatement = sc.endingStatement;
    if (newVal > 0 && sc[stat] === 0) {
      updatedEndingStatement = undefined;
    }

    onUpdateCharacter({
      ...sc,
      [stat]: newVal,
      states: updatedStates,
      endingStatement: updatedEndingStatement,
    });
  };

  const handleSaveEnding = () => {
    if (!activeEndingChar) return;
    const { character, statType } = activeEndingChar;
    
    const updated: Character = {
      ...character,
      endingStatement: endingInput.trim() || (statType === "health" ? "在沉重的物理创伤下，生命体征宣告归零，永远退出了这场无尽的理性交锋。" : "心智迷失于无底的虚无，他默默卸下领带，去往没有压力与喧嚣的远方。")
    };
    
    onUpdateCharacter(updated);
    setActiveEndingChar(null);
    setEndingInput("");
  };



  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const err = onImport(importText);
    if (err) {
      setImportError(err);
    } else {
      setImportText("");
      setImportError(null);
      setShowImport(false);
    }
  };

  const handleCopyClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to extract top skill for card visual
  const getTopSkills = (c: Character) => {
    const list = Object.entries(c.skills).map(([id, rating]) => {
      const skillName = SKILLS.find(s => s.id === id)?.name || id;
      return { name: skillName, rating };
    });
    return list.sort((a, b) => b.rating - a.rating).slice(0, 3);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#f1f5f9] overflow-hidden">
      {/* Sidebar: Library Stats Dashboard */}
      <aside 
        className={`${
          isSidebarOpen ? "w-full md:w-80 p-6" : "w-0 md:w-16 p-0 md:py-6 flex items-center"
        } border-b-2 md:border-b-0 md:border-r-2 border-slate-900 bg-white space-y-6 flex flex-col justify-between overflow-y-auto shrink-0 transition-all duration-300 relative`}
      >
        {isSidebarOpen ? (
          <>
            <div className="space-y-6">
          <div className="space-y-1">
             <div className="inline-block px-2.5 py-0.5 bg-slate-900 text-white text-[9px] font-black tracking-widest uppercase mb-1">
               ARCHIVE CONTROL
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tighter">案件档案库</h2>
             <p className="text-xs text-slate-500 font-medium font-mono">包含由于严重逆行性失忆症而遗漏的总计 {characters.length} 宗调查员记录。</p>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-4">
            <button 
              onClick={onCreateNew}
              className="disco-button w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#2563eb] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Plus className="w-4 h-4" /> 创制新调查员
            </button>

            <button 
              onClick={() => {
                setShowImport(!showImport);
                setImportError(null);
              }}
              className="w-full py-2.5 px-4 border-2 border-slate-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Upload className="w-4 h-4" /> 导入JSON档案卡
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 space-y-2">
             <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">存档提示</div>
             <div className="text-[11px] text-slate-600 font-mono space-y-1.5 leading-relaxed">
               <p>※ <strong>负面状态</strong>与<strong>现场线索</strong>为临时情景数据，需加载角色后进行动态管理。</p>
               <p>※ 在此处可直接微调角色的外观、属性和健康，不影响已学技能或已有装备。</p>
             </div>
          </div>
        </div>


          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-start h-full gap-8">
            <div className="text-slate-400 tracking-widest font-black uppercase text-xs rotate-180 flex-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
              Archive Control
            </div>
          </div>
        )}
      </aside>

      {/* Sidebar Toggle Button - Fixed to edge */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10 items-center justify-center w-6 h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-r-md shadow-md transition-all border border-l-0 border-slate-900"
        style={{ left: isSidebarOpen ? '20rem' : '4rem' }}
        title={isSidebarOpen ? "收起控制台" : "展开控制台"}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Grid Workspace */}
      <section className="flex-1 p-8 overflow-y-auto space-y-8 flex flex-col">
        {/* Dynamic header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-black text-slate-800">角色档案</h3>
          </div>
          <span className="text-xs font-mono font-semibold bg-white border border-slate-300 rounded-full px-3 py-1">
            当前激活：{activeCharId ? characters.find(c => c.id === activeCharId)?.name || "无名氏" : "未加载"}
          </span>
        </div>

        {/* Import Overlay form panel if requested */}
        {showImport && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-4 border-slate-950 bg-white space-y-4 shadow-[4px_4px_0px_#000]"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-blue-600 tracking-widest">导入已有的 JSON 角色数据</span>
              <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
            </div>
            <textarea
              className="w-full h-32 p-3 font-mono text-xs border-2 border-slate-300 focus:border-slate-800 focus:outline-none"
              placeholder="将你以前导出的 JSON 角色代码粘贴到此处..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            {importError && (
              <p className="text-xs font-mono font-bold text-red-600">{importError}</p>
            )}
            <div className="flex gap-2">
              <button 
                onClick={handleImportSubmit}
                className="px-5 py-2 bg-slate-900 text-white font-black text-xs uppercase hover:bg-slate-800"
              >
                解码并追加到库
              </button>
              <button 
                onClick={() => { setShowImport(false); setImportText(""); }}
                className="px-4 py-2 bg-slate-100 border text-slate-600 font-bold text-xs"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}

        {/* Cards Grid */}
        {characters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-300 min-h-[300px] text-center bg-white space-y-4">
            <span className="w-12 h-12 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 font-mono text-xl font-bold">?</span>
            <div className="space-y-1">
              <h4 className="text-lg font-black uppercase tracking-tight text-slate-700">档案库空无一人</h4>
              <p className="text-xs text-slate-500 max-w-md font-mono">你还没有保留任何记忆档案。点击左侧的【创制新调查员】按钮来塑造你的人格并固化你的生理属性。</p>
            </div>
            <button 
              onClick={onCreateNew} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider"
            >
              立刻塑造第一个角色
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {characters.map((sc) => {
              const isActive = sc.id === activeCharId;
              const topSkills = getTopSkills(sc);
              const totalStates = sc.states?.length || 0;
              const totalTags = sc.tags?.length || 0;
              
              return (
                <div 
                  key={sc.id}
                  className={`relative flex flex-col border-4 transition-all duration-200 bg-white ${
                    isActive 
                      ? "border-blue-600 shadow-[8px_8px_0px_rgba(37,99,235,0.25)]" 
                      : "border-slate-900 hover:scale-[1.01] hover:shadow-[5px_5px_0px_rgba(15,23,42,0.15)]"
                  }`}
                >
                  {/* Active Indicator overlay tag */}
                  {isActive && (
                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest border-2 border-white">
                      ★ 活跃中使用 ACTIVE
                    </div>
                  )}

                  {/* Header metadata row */}
                  <div className="p-6 border-b-2 border-slate-900 flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar initial */}
                      <div className={`w-14 h-14 border-4 border-slate-900 flex items-center justify-center text-2xl font-black shrink-0 ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                      }`}>
                        {sc.name ? sc.name[0] : "无"}
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                          {sc.name || "失忆侦探"}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                          样貌外饰: {sc.appearance?.hairColor || "灰色"}发色 / {sc.appearance?.clothingStyle || "西装"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Character Stats Badges */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      {/* Interactive Health */}
                      <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-1.5 rounded-sm">
                        <span className="text-[8px] font-black text-slate-400 tracking-tighter uppercase font-mono leading-none mb-1">健康 HP ({sc.health}/5)</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); changeStat(sc, "health", -1); }}
                            className="w-6 h-6 rounded-sm bg-red-100 hover:bg-red-200 border-2 border-red-600 text-red-800 text-xs font-black flex items-center justify-center cursor-pointer transition-all"
                            title="减少1点健康值 (HP)"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5" title={`健康值: ${sc.health}/5`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Heart 
                                key={i} 
                                className={`w-3 h-3 transition-all hover:scale-120 cursor-pointer ${
                                  i < sc.health ? "text-red-600 fill-red-600 animate-pulse" : "text-slate-300 hover:text-red-400"
                                }`} 
                                onClick={(e) => { e.stopPropagation(); changeStat(sc, "health", i + 1 - sc.health); }}
                              />
                            ))}
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); changeStat(sc, "health", 1); }}
                            className="w-6 h-6 rounded-sm bg-red-600 hover:bg-red-500 border-2 border-red-700 text-white text-xs font-black flex items-center justify-center shadow-sm cursor-pointer transition-all"
                            title="增加1点健康值 (HP)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Interactive Morale */}
                      <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-1.5 rounded-sm">
                        <span className="text-[8px] font-black text-slate-400 tracking-tighter uppercase font-mono leading-none mb-1">士气 MOR ({sc.morale}/5)</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); changeStat(sc, "morale", -1); }}
                            className="w-6 h-6 rounded-sm bg-purple-100 hover:bg-purple-200 border-2 border-purple-600 text-purple-800 text-xs font-black flex items-center justify-center cursor-pointer transition-all"
                            title="减少1点士气值 (MOR)"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-0.5" title={`士气值: ${sc.morale}/5`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Zap 
                                key={i} 
                                className={`w-3 h-3 transition-all hover:scale-120 cursor-pointer ${
                                  i < sc.morale ? "text-purple-600 fill-purple-600" : "text-slate-300 hover:text-purple-400"
                                }`} 
                                onClick={(e) => { e.stopPropagation(); changeStat(sc, "morale", i + 1 - sc.morale); }}
                              />
                            ))}
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); changeStat(sc, "morale", 1); }}
                            className="w-6 h-6 rounded-sm bg-purple-600 hover:bg-purple-500 border-2 border-purple-700 text-white text-xs font-black flex items-center justify-center shadow-sm cursor-pointer transition-all"
                            title="增加1点士气值 (MOR)"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body description & attributes preview */}
                  <div className="p-6 space-y-4 flex-1">
                    <p className="text-xs text-slate-500 font-mono italic leading-relaxed line-clamp-2">
                      “{sc.description || "一个脑海被完全洗劫的落魄者。他试图回忆自己的过去，却只能找到令人窒息的静默。"}”
                    </p>

                    {sc.endingStatement && (
                      <div className="bg-red-50 border-2 border-red-200 p-4 font-serif space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                        <div className="flex justify-between items-center text-[9px] font-black text-red-700 tracking-wider font-sans uppercase">
                          <span>☠ 档案命运绝响 / ENDING FILED</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("你确定要推翻该调查员的悲剧落幕，并让其复活重回现世世界吗？\n（这会清除终局记载，且健康与士气均恢复至1点）")) {
                                onUpdateCharacter({
                                  ...sc,
                                  health: 1,
                                  morale: 1,
                                  endingStatement: undefined
                                });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold underline cursor-pointer hover:bg-red-100 px-1 rounded text-[8px]"
                          >
                            推翻该终局并重返调查
                          </button>
                        </div>
                        <p className="text-xs text-red-950 font-medium italic whitespace-pre-wrap leading-relaxed">
                          “{sc.endingStatement}”
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Top skills block */}
                      <div className="space-y-1.5 border-r border-slate-200 pr-4">
                        <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">核心特质强弱</span>
                        <div className="space-y-1">
                          {topSkills.map((sk) => (
                            <div key={sk.name} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">{sk.name}</span>
                              <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-1 py-0.5 font-bold">等级 {sk.rating}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* States and tags count summary */}
                      <div className="space-y-1.5 pl-2 font-mono text-[11px] text-slate-600 flex flex-col justify-center">
                        <div className="flex justify-between">
                          <span>生命代价值 / 伤痛数:</span>
                          <span className={`font-black ${totalStates > 0 ? "text-red-600" : "text-slate-500"}`}>{totalStates} 处</span>
                        </div>
                        <div className="flex justify-between">
                          <span>主动记录现场线索:</span>
                          <span className={`font-black ${totalTags > 0 ? "text-blue-600" : "text-slate-500"}`}>{totalTags} 条</span>
                        </div>
                        <div className="flex justify-between">
                          <span>当前累积经验 (XP):</span>
                          <span className="font-bold text-slate-800">{sc.xp} 点</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>插叙指示物:</span>
                          <div className="flex items-center gap-1 font-mono">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full border ${
                                  i < sc.tokens ? "bg-amber-500 border-amber-600 shadow-[0_0_4px_rgba(245,158,11,0.5)]" : "bg-slate-200 border-slate-300"
                                }`}
                                title={`持有 ${sc.tokens} 枚插叙指示物`}
                              />
                            ))}
                            <span className="font-bold text-slate-800 ml-1">({sc.tokens}/3)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick States list tags previews */}
                    {totalStates > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[8px] font-black text-rose-500 tracking-wider font-mono">活跃的负面伤痛 (STATES)：</span>
                        <div className="flex flex-wrap gap-1">
                          {sc.states.map(st => (
                            <span key={st.id} className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 uppercase font-mono">
                              {st.name} (减值{st.severity})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions footer row for Card */}
                  <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-900 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelect(sc.id)}
                        className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                          isActive 
                            ? "bg-green-600 text-white border border-green-700 cursor-default" 
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none"
                        }`}
                        title="进入角色卡进行精细管理"
                      >
                        {isActive ? <Check className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                        {isActive ? "正在使用中" : "修改细节"}
                      </button>

                      <button
                        onClick={() => onDuplicate(sc.id)}
                        className="p-1.5 bg-white border border-slate-300 hover:border-slate-800 text-slate-600 hover:text-slate-900 rounded-sm"
                        title="复制这页档案卡备份"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setExportingChar(sc)}
                        className="p-1.5 bg-white border border-slate-300 hover:border-slate-800 text-slate-600 hover:text-slate-900 rounded-sm"
                        title="导出档案为 JSON 备份"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDelete(sc.id)}
                        className="p-1.5 bg-white border border-red-200 hover:border-red-600 text-slate-400 hover:text-red-600 rounded-sm"
                        title="永久撕毁并清理此页档案"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



      {/* JSON Export Modal */}
      <AnimatePresence>
        {exportingChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setExportingChar(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border-4 border-slate-950 p-6 max-w-lg w-full space-y-4 shadow-[6px_6px_0px_#000]"
            >
              <button 
                onClick={() => setExportingChar(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[9px] font-black text-blue-600 tracking-wider font-mono">SERIALIZED DETECTIVE CARD BACKUP</span>
                <h4 className="text-xl font-bold font-serif text-slate-900">导出【{exportingChar.name}】数据</h4>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-mono">
                拷贝以下内容，可以将其发送给他人，或者在另外一个浏览器中重新输入该数据以完成角色无缝装载：
              </p>

              <textarea
                readOnly
                className="w-full h-40 p-3 font-mono text-[10px] border-2 border-slate-200 bg-slate-50 select-all focus:outline-none"
                value={JSON.stringify(exportingChar, null, 2)}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyClipboard(JSON.stringify(exportingChar, null, 2), exportingChar.id)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase"
                >
                  {copiedId === exportingChar.id ? "复制成功 ✓" : "复制代码到剪贴板"}
                </button>
                <button 
                  onClick={() => setExportingChar(null)}
                  className="px-4 py-2 border text-slate-600 font-bold text-xs"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Tragedy / Ending Narrative statement Overlay */}
      <AnimatePresence>
        {activeEndingChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md animate-fade-in" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-950 border-4 border-red-700 p-8 max-w-xl w-full text-slate-100 font-serif space-y-6 shadow-[10px_10px_0px_#7f1d1d] z-10"
            >
              <div className="space-y-2 text-center">
                <span className="text-[10px] font-black tracking-widest text-red-500 font-sans block animate-pulse">
                  ☠ 调查宣告落幕 · SYSTEM OVERRIDE ☠
                </span>
                <h4 className="text-3xl font-black text-white italic tracking-tight font-serif">
                  {activeEndingChar.statType === "health" ? "生命指征陷入死寂" : "理智壁垒彻底崩溃"}
                </h4>
                <div className="h-0.5 bg-red-900 w-1/3 mx-auto mt-2" />
              </div>

              <div className="text-sm text-slate-300 space-y-3 font-sans leading-relaxed">
                {activeEndingChar.statType === "health" ? (
                  <p>
                    调查员 <strong>{activeEndingChar.character.name}</strong> 的最后一格健康（物理抵抗力）宣告破裂。生命在重压下的几何撞击中消逝。根据调查手册规则：你的角色将被移出游戏。
                  </p>
                ) : (
                  <p>
                    调查员 <strong>{activeEndingChar.character.name}</strong> 的最后一格士气（精神抵抗力）折断成灰。虚无感涌出，意志在重负下彻底崩溃。根据调查手册规则：你的角色将被移出游戏。
                  </p>
                )}
                <p className="text-xs text-red-400 font-medium italic animate-pulse">
                  ※ “请描绘并记录下这一刻发生的事。他是如何倒在阴暗的水泥巷陌，或者是由于丧失行动能力和生命指征，而化为案卷上的一串悲剧冷墨的？”
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black font-sans uppercase text-slate-400 tracking-wider">
                  落幕描述与终局叙述 STATEMENT :
                </label>
                <textarea
                  className="w-full h-32 p-3 bg-slate-900 border-2 border-red-900/60 text-slate-200 focus:border-red-600 outline-none text-xs font-serif italic leading-relaxed resize-none font-mono"
                  placeholder={
                    activeEndingChar.statType === "health" 
                      ? "他倒在了迷雾笼罩的铁轨一侧，紧攥着未拆封的化验报告以及未寄出的匿名信...（键入或发挥你的叙事脑补）" 
                      : "他默默拆解下污迹斑斑的绿领带，留在了这间恶臭四溢的旅馆套房中，彻底弃案而去，寻求没有压力的一生...（键入或发挥你的叙事脑补）"
                  }
                  value={endingInput}
                  onChange={(e) => setEndingInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveEnding}
                  className="flex-1 py-3 bg-red-700 hover:bg-red-650 text-white font-black text-xs uppercase font-sans tracking-widest shadow-[3px_3px_0px_#450a0a] active:translate-y-0.5 cursor-pointer"
                >
                  签署落幕陈述，封存调查档案 CARD DISMISSED
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
