/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Character, INITIAL_CHARACTER } from "./types";
import Creator from "./components/Creator";
import Dashboard from "./components/Dashboard";
import Library from "./components/Library";
import Rulebook from "./components/Rulebook";
import InterjectionBoard from "./components/InterjectionBoard";
import InvestigationBoard from "./components/InvestigationBoard";
import { motion, AnimatePresence } from "motion/react";
import { X, Book, Plus, ChevronDown, Palette } from "lucide-react";

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "attributes" | "gear" | "thoughts" | "clues" | "rulebook" | "appearance">("library");
  const [isCreating, setIsCreating] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [theme, setTheme] = useState<"default" | "sunset">("default");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Derived active character from registry
  const char = characters.find(c => c.id === activeCharId) || null;

  // Retrieve character library and active character ID on mount
  useEffect(() => {
    const savedCharsJson = localStorage.getItem("jamais_vu_characters");
    const savedActiveId = localStorage.getItem("jamais_vu_active_char_id");
    
    let loadedChars: Character[] = [];
    
    if (savedCharsJson) {
      try {
        loadedChars = JSON.parse(savedCharsJson);
      } catch (e) {
        console.error("Failed to parse characters library", e);
      }
    } else {
      // Fallback/Migration: Retrieve legacy single character sheet
      const legacyCharJson = localStorage.getItem("jamais_vu_char");
      if (legacyCharJson) {
        try {
          const parsed = JSON.parse(legacyCharJson);
          
          const migratedTags = (parsed.tags || []).map((t: any, idx: number) => {
            if (typeof t === "string") {
              return { id: `tag_${Date.now()}_${idx}_${Math.random()}`, name: t, effect: 1, description: "" };
            }
            return t;
          });

          const migratedStates = (parsed.states || []).map((s: any, idx: number) => {
            if (typeof s === "string") {
              return { id: `state_${Date.now()}_${idx}_${Math.random()}`, name: s, category: "mental" as const, severity: 1, description: "" };
            }
            return s;
          });

          const legacyChar: Character = {
            ...INITIAL_CHARACTER,
            ...parsed,
            id: parsed.id || `char_legacy_${Date.now()}`,
            tags: migratedTags,
            states: migratedStates,
            appearance: {
              ...INITIAL_CHARACTER.appearance,
              ...(parsed.appearance || {})
            },
            skills: { ...INITIAL_CHARACTER.skills, ...(parsed.skills || {}) }
          };
          
          loadedChars = [legacyChar];
          localStorage.setItem("jamais_vu_characters", JSON.stringify(loadedChars));
        } catch (e) {
          console.error("Failed to migrate legacy character", e);
        }
      }
    }
    
    setCharacters(loadedChars);
    
    if (savedActiveId && loadedChars.some(c => c.id === savedActiveId)) {
      setActiveCharId(savedActiveId);
      setActiveTab("attributes");
    } else if (loadedChars.length > 0) {
      setActiveCharId(loadedChars[0].id);
      setActiveTab("attributes");
    } else {
      setActiveTab("library");
    }
  }, []);

  const handleUpdateActiveCharacter = (updatedChar: Character) => {
    const updatedChars = characters.map(c => c.id === updatedChar.id ? updatedChar : c);
    setCharacters(updatedChars);
    localStorage.setItem("jamais_vu_characters", JSON.stringify(updatedChars));
  };

  const handleSelectCharacter = (id: string) => {
    setActiveCharId(id);
    localStorage.setItem("jamais_vu_active_char_id", id);
    setActiveTab("attributes");
  };

  const handleDeleteCharacter = (id: string) => {
    if (window.confirm("你确定要永久撕毁并销毁此页调查员档案吗？此操作无法撤销。")) {
      const filtered = characters.filter(c => c.id !== id);
      setCharacters(filtered);
      localStorage.setItem("jamais_vu_characters", JSON.stringify(filtered));
      
      if (activeCharId === id) {
        const pivotId = filtered.length > 0 ? filtered[0].id : null;
        setActiveCharId(pivotId);
        if (pivotId) {
          localStorage.setItem("jamais_vu_active_char_id", pivotId);
          setActiveTab("attributes");
        } else {
          localStorage.removeItem("jamais_vu_active_char_id");
          setActiveTab("library");
        }
      }
    }
  };

  const handleDuplicateCharacter = (id: string) => {
    const target = characters.find(c => c.id === id);
    if (!target) return;
    
    const duplicated: Character = {
      ...target,
      id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `${target.name} (副本)`,
      gearIds: [...target.gearIds],
      activeGearIds: [...target.activeGearIds],
      thoughts: target.thoughts.map(t => ({ ...t, modifiers: t.modifiers ? [...t.modifiers] : undefined })),
      tags: target.tags.map(t => ({ ...t })),
      states: target.states.map(st => ({ ...st }))
    };
    
    const newList = [...characters, duplicated];
    setCharacters(newList);
    localStorage.setItem("jamais_vu_characters", JSON.stringify(newList));
  };

  const handleImportCharacter = (jsonStr: string): string | null => {
    try {
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.name || typeof parsed.skills !== 'object') {
        return "错误的 JSON 格式。必须包含姓名 (name) 与子技能分布 (skills)。";
      }
      
      const imported: Character = {
        ...INITIAL_CHARACTER,
        ...parsed,
        id: parsed.id && !characters.some(c => c.id === parsed.id) 
          ? parsed.id 
          : `char_imported_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        appearance: {
          ...INITIAL_CHARACTER.appearance,
          ...(parsed.appearance || {})
        },
        skills: { ...INITIAL_CHARACTER.skills, ...(parsed.skills || {}) },
        tags: (parsed.tags || []).map((t: any, idx: number) => {
          if (typeof t === "string") {
            return { id: `tag_${Date.now()}_${idx}_${Math.random()}`, name: t, effect: 1, description: "" };
          }
          return t;
        }),
        states: (parsed.states || []).map((s: any, idx: number) => {
          if (typeof s === "string") {
            return { id: `state_${Date.now()}_${idx}_${Math.random()}`, name: s, category: "mental" as const, severity: 1, description: "" };
          }
          return s;
        })
      };
      
      const newList = [...characters, imported];
      setCharacters(newList);
      localStorage.setItem("jamais_vu_characters", JSON.stringify(newList));
      
      setActiveCharId(imported.id);
      localStorage.setItem("jamais_vu_active_char_id", imported.id);
      setActiveTab("attributes");
      return null;
    } catch (e: any) {
      return `解析 JSON 崩溃：${e?.message || e}`;
    }
  };

  const handleUpdateCharacter = (updated: Character) => {
    const newList = characters.map(c => c.id === updated.id ? updated : c);
    setCharacters(newList);
    localStorage.setItem("jamais_vu_characters", JSON.stringify(newList));
  };

  const handleCompleteCreation = (newChar: Character) => {
    const newList = [...characters, newChar];
    setCharacters(newList);
    localStorage.setItem("jamais_vu_characters", JSON.stringify(newList));
    
    setActiveCharId(newChar.id);
    localStorage.setItem("jamais_vu_active_char_id", newChar.id);
    
    setIsCreating(false);
    setActiveTab("attributes");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Header from Design */}
      <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 z-10 shrink-0 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setShowAbout(true)}
            className="w-8 h-8 md:w-10 md:h-10 bg-geo-dark flex items-center justify-center text-white font-bold text-lg md:text-xl leading-none cursor-pointer hover:bg-slate-800 transition-colors"
            title="关于与版权信息"
          >
            档案
          </button>
        </div>
        <div className="flex items-center space-x-2 md:space-x-12">
          <div className="hidden md:flex space-x-6 text-sm font-bold uppercase tracking-wider">
            {characters.length > 0 && (
              <button 
                onClick={() => { setIsCreating(false); setActiveTab("library"); }} 
                className={`transition-all py-1.5 cursor-pointer ${
                  !isCreating && activeTab === "library" ? "border-b-2 border-geo-accent font-black text-slate-900" : "opacity-40 hover:opacity-100"
                }`}
              >
                角色卡库
              </button>
            )}
            
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)} 
                className="opacity-40 hover:opacity-100 py-1.5 text-blue-600 flex items-center gap-1 cursor-pointer font-black"
                id="btn-nav-create"
              >
                <Plus className="w-3.5 h-3.5" /> 创制新角色
              </button>
            )}

            <button 
              onClick={() => { setIsCreating(false); setActiveTab("rulebook"); }} 
              className={`transition-all py-1.5 cursor-pointer ${
                !isCreating && activeTab === "rulebook" ? "border-b-2 border-geo-accent font-black text-slate-900" : "opacity-40 hover:opacity-100"
              }`}
            >
              规则手册
            </button>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setTheme(t => t === "default" ? "sunset" : "default")}
              className="p-1.5 md:p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="切换主题风格"
            >
              <Palette className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>

          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {isCreating ? (
          <Creator onComplete={handleCompleteCreation} />
        ) : activeTab === "rulebook" ? (
          <Rulebook />
        ) : characters.length === 0 ? (
          <div className="flex-1 h-full w-full flex flex-col items-center justify-center p-4 md:p-8 text-center bg-white overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 max-w-2xl my-auto"
            >
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-2 text-slate-900">
                JAMAIS <span className="text-blue-600 block md:inline">VU</span>
              </h1>
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-slate-500 font-medium py-2 md:py-4 cursor-pointer hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
                onClick={() => setShowAbout(true)}
              >
                旧事如新
                <span className="text-xs font-sans not-italic bg-slate-100 text-slate-400 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">关于</span>
              </h2>

              <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                <button 
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-600 text-white font-medium rounded-full py-3.5 px-8 text-base hover:bg-blue-700 hover:shadow-md transition-all cursor-pointer"
                >
                  启动新调查档案
                </button>
                <button 
                  onClick={() => { setIsCreating(false); setActiveTab("rulebook"); }}
                  className="bg-white text-slate-700 font-medium rounded-full py-3.5 px-8 text-base border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
                >
                  规则手册
                </button>
              </div>
            </motion.div>
          </div>
        ) : activeTab === "library" ? (
          <Library 
            characters={characters}
            activeCharId={activeCharId}
            onSelect={handleSelectCharacter}
            onDelete={handleDeleteCharacter}
            onDuplicate={handleDuplicateCharacter}
            onImport={handleImportCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onCreateNew={() => setIsCreating(true)}
          />
        ) : activeTab === "attributes" || activeTab === "gear" || activeTab === "thoughts" || activeTab === "clues" || activeTab === "appearance" ? (
          <Dashboard 
            char={char!} 
            onUpdate={handleUpdateActiveCharacter} 
            openRulebook={() => { setIsCreating(false); setActiveTab("rulebook"); }}
            activeSubTab={activeTab === "thoughts" ? "thoughts" : activeTab === "clues" ? "clues" : activeTab === "gear" ? "gear" : activeTab === "appearance" ? "appearance" : "attributes"}
            setActiveSubTab={(tab) => setActiveTab(tab)}
            characters={characters}
          />
        ) : (
          <Rulebook />
        )}
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden h-14 border-t border-slate-200 bg-white flex items-center justify-around shrink-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
            {characters.length > 0 && (
              <button onClick={() => { setIsCreating(false); setActiveTab("library"); }} className={`flex-1 h-full text-[11px] font-black uppercase flex flex-col items-center justify-center ${!isCreating && activeTab === "library" ? "text-geo-accent bg-slate-50 border-t-2 border-t-geo-accent -mt-[2px]" : "text-slate-500"}`}>卡库</button>
            )}
            {char && (
              <button onClick={() => { setIsCreating(false); setActiveTab("attributes"); }} className={`flex-1 h-full text-[11px] font-black uppercase flex flex-col items-center justify-center border-l-2 border-slate-100 ${!isCreating && (activeTab === "attributes" || activeTab === "gear" || activeTab === "thoughts" || activeTab === "clues") ? "text-geo-accent bg-slate-50 border-t-2 border-t-geo-accent -mt-[2px]" : "text-slate-500"}`}>主卡</button>
            )}
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className={`flex-1 h-full text-[11px] font-black uppercase flex flex-col items-center justify-center border-l-2 border-slate-100 ${isCreating ? "text-blue-600 bg-blue-50 border-t-2 border-t-blue-600 -mt-[2px]" : "text-blue-500"}`}>新建</button>
            )}
            <button onClick={() => { setIsCreating(false); setActiveTab("rulebook"); }} className={`flex-1 h-full text-[11px] font-black uppercase flex flex-col items-center justify-center border-l-2 border-slate-100 ${!isCreating && activeTab === "rulebook" ? "text-geo-accent bg-slate-50 border-t-2 border-t-geo-accent -mt-[2px]" : "text-slate-500"}`}>规则</button>
      </div>

      {/* Footer from Design */}
      <footer className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 pb-[env(safe-area-inset-bottom)] z-20 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-6 text-[10px] font-bold uppercase">
          <span className="text-geo-accent flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 bg-geo-accent rounded-full"></div>
            系统状态：自洽中
          </span>
          <span className="opacity-50">
            当前档案: {char ? char.name : "未加载"}
          </span>
        </div>
        <div className="text-[10px] font-bold opacity-30">
          极乐迪斯科同人桌游辅助工具
        </div>
      </footer>


      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Book className="w-4 h-4 text-blue-500" /> 关于《旧事如新》
                </h3>
                <button onClick={() => setShowAbout(false)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
                <div className="text-slate-600 font-sans text-sm leading-relaxed space-y-3">
                  <p>《旧事如新》是一款关于惨烈失败的心理叙事类角色扮演游戏。你将扮演一位平庸的调查员，在严重失忆的状态下处理此生最重要的案件。你甚至不记得自己是谁、住在何处。</p>
                  <p>按照周围人似乎期待的方式推进案件，收集关于自己身份的信息，或是伪造全新身份。</p>
                  <p>但无论做什么，你都不会孤单：颅内噪音会试图将你拉向不同的方向。</p>
                  <p>本游戏是对 ZA/UM 工作室电子游戏《极乐迪斯科》的非官方桌面改编版本，并非对原版内容的复刻，而是为在桌面环境中有机创造类似体验的工具。正如《极乐迪斯科》是对桌面角色扮演游戏的致敬，《旧事如新》亦是对《极乐迪斯科》的致敬。</p>
                </div>
                
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">原案信息</div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><span className="text-slate-400">原作者：</span>Kevin M. Rodrigo</li>
                      <li><span className="text-slate-400">Discord 社群：</span><a href="https://discord.gg/vHWz6j5Umf" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">vHWz6j5Umf</a></li>
                      <li><span className="text-slate-400">中文翻译：</span>三局两胜工作室</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">工具与协助</div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><span className="text-slate-400">本工具作者：</span>不咕鸟（基德）</li>
                      <li><span className="text-slate-400">辅助：</span>Antigravity Gemini</li>
                      <li><span className="text-slate-400">不咕鸟TRPG创想俱乐部：</span>261751459</li>
                      <li><span className="text-slate-400">成都秘密基地：</span><a href="https://nogubird.top/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">nogubird.top</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
