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
import { X, Book, Plus } from "lucide-react";

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "attributes" | "gear" | "thoughts" | "clues" | "rulebook">("library");
  const [isCreating, setIsCreating] = useState(false);

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
          <div className="w-8 h-8 md:w-10 md:h-10 bg-geo-dark flex items-center justify-center text-white font-bold text-lg md:text-xl leading-none">档案</div>
          <h1 className="text-sm md:text-xl font-black tracking-tight uppercase truncate max-w-[200px] md:max-w-none">调查员档案管理系统 <span className="font-normal opacity-50 text-[10px] md:text-xs">v1.2</span></h1>
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
            
            {char && (
              <button 
                onClick={() => { setIsCreating(false); setActiveTab("attributes"); }} 
                className={`transition-all py-1.5 cursor-pointer ${
                  !isCreating && (activeTab === "attributes" || activeTab === "gear" || activeTab === "thoughts" || activeTab === "clues") ? "border-b-2 border-geo-accent font-black text-slate-900" : "opacity-40 hover:opacity-100"
                }`}
              >
                调查员主卡
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
          <div className="flex items-center space-x-2 md:space-x-3 bg-slate-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter">本地存储：同步中</span>
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
              <div className="inline-block px-4 py-1 bg-geo-dark text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-2 md:mb-4">
                思维叙事辅助系统
              </div>
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-2 text-slate-900">
                JAMAIS <span className="text-blue-600 block md:inline">VU</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-slate-500 font-medium py-2 md:py-4">
                旧事如新
              </h2>
              <div className="p-6 bg-slate-100 rounded-2xl mt-8 shadow-inner">
                <p className="text-slate-600 font-sans text-sm leading-relaxed">
                  你对自己是谁或住在哪里毫无记忆。你只能按照周围人的期望处理你的案件。
                  此工具旨在帮助你在极度失忆的状态下管理你的思维、技能与痛苦。
                </p>
              </div>

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
                  参阅调查手册
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
        ) : activeTab === "attributes" || activeTab === "gear" || activeTab === "thoughts" || activeTab === "clues" ? (
          <Dashboard 
            char={char!} 
            onUpdate={handleUpdateActiveCharacter} 
            openRulebook={() => { setIsCreating(false); setActiveTab("rulebook"); }}
            activeSubTab={activeTab === "thoughts" ? "thoughts" : activeTab === "clues" ? "clues" : activeTab === "gear" ? "gear" : "attributes"}
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

      {/* Persistence Note */}
      {char && (
        <div className="fixed top-4 right-4 z-40">
           <div className="flex items-center gap-2 text-[8px] font-mono uppercase bg-disco-dark text-disco-paper px-2 py-1 rotate-1 hover:rotate-0 transition-transform cursor-context-menu">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              本地存储已激活
           </div>
        </div>
      )}
    </div>
  );
}
