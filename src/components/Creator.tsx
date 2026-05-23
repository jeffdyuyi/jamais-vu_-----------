/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Character, INITIAL_CHARACTER, SKILLS, SkillCategory, INITIAL_GEAR, Skill, INITIAL_DRUGS, Drug } from "../types";
import { ArrowRight, ArrowLeft, Check, Sparkles, Wand2, Package, EyeOff, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CreatorProps {
  onComplete: (char: Character) => void;
}

const POINTS_TO_ALLOCATE = [7, 6, 5, 4, 3, 2, 1];

const APPEARANCE_PRESETS = {
  hairStyle: ["寸头", "凌乱长发", "莫霍克", "背头", "秃头", "朋克短发"],
  hairColor: ["黑色", "浅棕", "银白", "亮红", "墨绿", "深灰"],
  eyeColor: ["深邃黑", "琥珀色", "冰蓝色", "鲜红色", "异色瞳", "灰暗色"],
  skinTone: ["苍白", "自然", "古铜", "黝黑", "灰白", "冷色调"],
  clothingStyle: ["经典调查员", "朋克皮甲", "复古西装", "极简运动", "仪式长袍", "病号服"],
  accessories: ["破领带", "电子义眼", "烟灰缸", "黑色手套", "怀表", "身份奖章"]
};

export default function Creator({ onComplete }: CreatorProps) {
  const [step, setStep] = useState(1);
  const [char, setChar] = useState<Character>(INITIAL_CHARACTER);
  const [allocatedPoints, setAllocatedPoints] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<"衣物" | "工具" | "武器" | "药剂">("衣物");

  // Appearance update helper
  const updateAppearance = (field: keyof Character["appearance"], value: string) => {
    setChar(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }));
  };

  // Step logic...
  const setSkillPoint = (skillId: string, value: number) => {
    setChar(prev => {
      const newSkills = { ...prev.skills };
      newSkills[skillId] = value;
      return { ...prev, skills: newSkills };
    });
  };

  const usedPoints = Object.values(char.skills).filter(v => (v as number) > 0);
  const availablePoints = POINTS_TO_ALLOCATE.filter(p => {
    const countInUsed = usedPoints.filter(u => u === p).length;
    return countInUsed === 0;
  });

  const toggleGear = (gearId: string) => {
    setChar(prev => {
      const isSelected = prev.gearIds.includes(gearId);
      if (!isSelected && prev.gearIds.length >= 3) return prev;
      
      const newGear = isSelected 
         ? prev.gearIds.filter(id => id !== gearId)
         : [...prev.gearIds, gearId];
      
      return { ...prev, gearIds: newGear, activeGearIds: newGear };
    });
  };

  const toggleDrug = (drugId: string) => {
    setChar(prev => {
      const prevDrugIds = prev.drugIds || [];
      const isSelected = prevDrugIds.includes(drugId);
      let newDrugs = [];
      if (isSelected) {
        newDrugs = [];
      } else {
        newDrugs = [drugId]; // Max 1 starting drug
      }
      return { ...prev, drugIds: newDrugs };
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Left Sidebar: Steps from Design */}
      <aside className="w-64 border-r-2 border-geo-border bg-slate-50 flex flex-col shrink-0">
        <div className="p-6 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">创建流程</p>
          <div className="space-y-6">
            {[
              { id: 1, title: "核心特质", desc: "技能点分配" },
              { id: 2, title: "初始装备", desc: "物品与加成" },
              { id: 3, title: "身份重构", desc: "外观与姓名" },
              { id: 4, title: "档案确认", desc: "预览与启动" }
            ].map(s => (
              <div key={s.id} className={`flex items-start space-x-3 transition-opacity ${step < s.id ? "opacity-30" : ""}`}>
                <div className={`w-8 h-8 border-2 border-geo-border flex items-center justify-center text-sm font-black shrink-0 ${
                  step === s.id ? "bg-geo-accent text-white" : step > s.id ? "bg-green-200" : "bg-white"
                }`}>
                  {step > s.id ? "✓" : s.id}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">{s.id}. {s.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-slate-200">
          <div className="bg-blue-50 p-4 border-2 border-blue-200">
            <p className="text-[10px] text-blue-800 font-black mb-1 uppercase">当前进度 {Math.round((step / 4) * 100)}%</p>
            <div className="w-full bg-blue-200 h-2 border border-blue-300">
              <motion.div 
                className="bg-geo-accent h-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                animate={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <section className="flex-1 bg-white p-12 flex flex-col overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">核心特质分布</h2>
                <p className="text-slate-500 font-mono text-sm">将 7,6,5,4,3,2,1 点分配到对应的子技能。技能决定了你的感知边界。</p>
              </div>

              <div className="disco-card bg-geo-dark text-white flex justify-between items-center py-6 px-8 mb-10 shadow-2xl">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
                  <Wand2 className="w-5 h-5 text-geo-accent" /> 待固化点数:
                </div>
                <div className="flex gap-3">
                  {POINTS_TO_ALLOCATE.map(p => (
                    <div key={p} className={`w-10 h-10 border-2 flex items-center justify-center font-black transition-all ${
                      usedPoints.includes(p) ? "opacity-20 border-white/20 line-through scale-90" : "border-geo-accent text-white bg-slate-800"
                    }`}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {Object.values(SkillCategory).map(cat => (
                  <div key={cat} className="space-y-6">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.3em] border-b-2 border-slate-100 pb-2">{cat}系</h3>
                    <div className="grid gap-4">
                      {SKILLS.filter(s => s.category === cat).map(skill => (
                        <div key={skill.id} className="flex items-center justify-between group bg-slate-50 border border-slate-200 p-4 hover:bg-white hover:border-geo-dark transition-all cursor-help" title={skill.description}>
                          <span className="font-black text-lg uppercase">{skill.name}</span>
                          <div className="flex gap-1.5 items-center">
                            {char.skills[skill.id] > 0 ? (
                              <button 
                                onClick={() => setSkillPoint(skill.id, 0)}
                                className="w-10 h-10 flex items-center justify-center bg-geo-accent text-white font-black text-lg shadow-lg hover:rotate-90 transition-transform active:scale-90"
                              >
                                {char.skills[skill.id]}
                              </button>
                            ) : (
                              <div className="flex gap-1">
                                {availablePoints.map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setSkillPoint(skill.id, p)}
                                    className="w-7 h-7 text-[10px] font-black flex items-center justify-center border-2 border-slate-300 text-slate-400 hover:border-geo-dark hover:text-geo-dark transition-all"
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-geo-border pb-6">
                <div>
                  <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">初始装备与试剂固化</h2>
                  <p className="text-slate-500 font-mono text-sm uppercase">选择最多三件辅助装备（衣物、工具、武器），以及一剂初始随身药剂。</p>
                </div>
                <div className="flex gap-4 text-xs font-black uppercase text-right shrink-0">
                  <div className="bg-slate-100 p-2 border border-slate-300">
                    装备选择: <span className="text-geo-accent">{char.gearIds.length}/3</span>
                  </div>
                  <div className="bg-slate-100 p-2 border border-slate-300">
                    药剂选择: <span className="text-geo-accent">{(char.drugIds || []).length}/1</span>
                  </div>
                </div>
              </div>

              {/* Categorization Tabs */}
              <div className="flex border-b-2 border-slate-200">
                {(["衣物", "工具", "武器", "药剂"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 font-black uppercase tracking-wider text-sm border-b-4 transition-all -mb-[2px] ${
                      activeCategory === cat
                        ? "border-geo-accent text-geo-accent bg-blue-50/10"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid content based on tab selection */}
              {activeCategory === "药剂" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {INITIAL_DRUGS.map(drug => {
                    const isSelected = (char.drugIds || []).includes(drug.id);
                    return (
                      <button
                        key={drug.id}
                        onClick={() => toggleDrug(drug.id)}
                        className={`text-left p-6 border-2 transition-all group relative flex flex-col justify-between min-h-[220px] ${
                          isSelected ? "border-geo-accent bg-blue-50/50 shadow-lg" : "border-slate-200 hover:border-geo-dark bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-black text-xl leading-tight uppercase tracking-tight text-slate-800">{drug.name}</span>
                            <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-geo-accent border-geo-accent" : "border-slate-300"}`}>
                               {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 overflow-hidden line-clamp-3">{drug.description}</p>
                        </div>
                        <div className="w-full">
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 text-[10px] font-bold">
                            <span className="text-[10px] font-black uppercase text-amber-600 mr-1">加成:</span>
                            {drug.tempModifiers.map(m => (
                              <span key={m.skillId} className={`px-1.5 py-0.2 rounded border ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
                            ))}
                          </div>
                          <div className="text-[9px] font-bold text-red-600 mt-2 flex items-center gap-1.5">
                            <span className="uppercase text-[8px] bg-red-100 px-1 py-0.2 text-red-700">副作用</span>
                            <span>永久扣减 1 点 {drug.permStat === "health" ? "生命值" : "士气值"} (服用时结算)</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {INITIAL_GEAR.filter(g => g.type === activeCategory).map(gear => {
                    const isSelected = char.gearIds.includes(gear.id);
                    return (
                      <button
                        key={gear.id}
                        onClick={() => toggleGear(gear.id)}
                        className={`text-left p-6 border-2 transition-all group relative flex flex-col justify-between min-h-[225px] ${
                          isSelected ? "border-geo-accent bg-blue-50/50 shadow-lg" : "border-slate-200 hover:border-geo-dark bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-black text-xl leading-tight uppercase tracking-tight text-slate-800">{gear.name}</span>
                            <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-geo-accent border-geo-accent" : "border-slate-300"}`}>
                               {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 overflow-hidden line-clamp-3">{gear.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 w-full">
                          {gear.modifiers.map(m => (
                            <span key={m.skillId} className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {SKILLS.find(s => s.id === m.skillId)?.name} {m.amount > 0 ? `+${m.amount}` : m.amount}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="appearance_step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12 max-w-5xl"
            >
              <div className="flex justify-between items-end border-b-4 border-geo-border pb-4">
                <div>
                  <h2 className="text-4xl font-black mb-1 uppercase tracking-tighter">身份与外观重构</h2>
                  <p className="text-slate-500 font-mono text-sm uppercase tracking-widest opacity-60">定义你在镜子中看到的那个幻象。</p>
                </div>
                <div className="text-[10px] font-bold text-geo-accent text-right">
                  IDENTITY RECONSTRUCTION<br />PHASE 03
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Basic Info (Merged Step 1) */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Plus className="w-3 h-3" /> 你的姓名 / 代号
                    </label>
                    <input 
                      type="text"
                      className="disco-input w-full text-2xl py-4 bg-slate-50 focus:bg-white"
                      placeholder="哈里·杜布阿..."
                      value={char.name}
                      onChange={e => setChar({ ...char, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Plus className="w-3 h-3" /> 破碎的记忆自述 (背景)
                    </label>
                    <textarea 
                      className="disco-card w-full h-64 outline-none font-mono text-sm leading-relaxed resize-none border-dashed bg-slate-50 focus:bg-white transition-all"
                      placeholder="我模糊地记得一些关于..."
                      value={char.description}
                      onChange={e => setChar({ ...char, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Appearance Customization */}
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Hair Style */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">发型</label>
                      <select 
                        className="w-full bg-white border-2 border-geo-border p-2 font-bold text-sm outline-none focus:border-geo-accent"
                        value={char.appearance.hairStyle}
                        onChange={(e) => updateAppearance("hairStyle", e.target.value)}
                      >
                        {APPEARANCE_PRESETS.hairStyle.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input 
                        className="disco-input w-full p-2 text-xs" 
                        placeholder="自定义描述..." 
                        value={char.appearance.hairStyle}
                        onChange={(e) => updateAppearance("hairStyle", e.target.value)}
                      />
                    </div>

                    {/* Hair Color */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">发色</label>
                      <select 
                        className="w-full bg-white border-2 border-geo-border p-2 font-bold text-sm outline-none focus:border-geo-accent"
                        value={char.appearance.hairColor}
                        onChange={(e) => updateAppearance("hairColor", e.target.value)}
                      >
                        {APPEARANCE_PRESETS.hairColor.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input className="disco-input w-full p-2 text-xs" placeholder="自定义颜色..." 
                        value={char.appearance.hairColor}
                        onChange={(e) => updateAppearance("hairColor", e.target.value)}
                      />
                    </div>

                    {/* Eye Color */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">瞳色</label>
                      <div className="flex flex-wrap gap-1">
                        {APPEARANCE_PRESETS.eyeColor.map(p => (
                          <button 
                            key={p} 
                            onClick={() => updateAppearance("eyeColor", p)}
                            className={`px-2 py-1 border text-[10px] transition-all font-bold ${char.appearance.eyeColor === p ? "bg-geo-dark text-white border-geo-dark" : "border-slate-200 hover:border-geo-muted"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <input className="disco-input w-full p-2 text-xs" placeholder="自定义眼睛描述..." 
                        value={char.appearance.eyeColor}
                        onChange={(e) => updateAppearance("eyeColor", e.target.value)}
                      />
                    </div>

                    {/* Skin Tone */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">肤色</label>
                      <div className="flex flex-wrap gap-1">
                        {APPEARANCE_PRESETS.skinTone.map(p => (
                          <button 
                            key={p} 
                            onClick={() => updateAppearance("skinTone", p)}
                            className={`px-2 py-1 border text-[10px] transition-all font-bold ${char.appearance.skinTone === p ? "bg-geo-dark text-white border-geo-dark" : "border-slate-200 hover:border-geo-muted"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <input className="disco-input w-full p-2 text-xs font-normal" placeholder="更多肤色细节..." 
                        value={char.appearance.skinTone}
                        onChange={(e) => updateAppearance("skinTone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">服装风格</label>
                    <div className="flex flex-wrap gap-2">
                      {APPEARANCE_PRESETS.clothingStyle.map(p => (
                        <button 
                          key={p} 
                          onClick={() => updateAppearance("clothingStyle", p)}
                          className={`px-4 py-2 border-2 text-xs transition-all font-black uppercase ${char.appearance.clothingStyle === p ? "bg-geo-accent text-white border-geo-accent shadow-lg" : "border-slate-200 hover:bg-slate-50"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <input className="disco-input w-full p-3 text-sm" placeholder="详述你的着装..." 
                      value={char.appearance.clothingStyle}
                      onChange={(e) => updateAppearance("clothingStyle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">特色配饰</label>
                    <div className="flex flex-wrap gap-2">
                       {APPEARANCE_PRESETS.accessories.map(p => (
                         <button 
                           key={p} 
                           onClick={() => updateAppearance("accessories", p)}
                           className={`px-3 py-1 border-2 text-[10px] font-bold ${char.appearance.accessories.includes(p) ? "bg-geo-dark text-white border-geo-dark" : "bg-white text-slate-400 hover:text-geo-dark transition-all"}`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                    <input className="disco-input w-full p-3 text-sm" placeholder="其他引人注目的特征..." 
                      value={char.appearance.accessories}
                      onChange={(e) => updateAppearance("accessories", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="border-4 border-geo-dark p-10 bg-slate-50 relative overflow-hidden">
                <Sparkles className="absolute -right-10 -top-10 w-48 h-48 text-geo-accent/5 rotate-12" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-geo-dark text-white flex items-center justify-center font-black text-4xl leading-none shadow-2xl">
                      {char.name[0] || "?"}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black uppercase tracking-tighter">{char.name || "无名调查员"}</h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-geo-accent text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] inline-block">
                          档案待激活
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {char.appearance?.hairColor} / {char.appearance?.clothingStyle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8 border-y border-dashed border-slate-300">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">主要特质倾向</p>
                        <div className="text-2xl font-black text-geo-dark uppercase flex flex-col">
                          <span>{SKILLS.find(s => s.id === Object.entries(char.skills).sort((a,b) => (b[1] as number) - (a[1] as number))[0][0])?.name || "尚未觉醒"}</span>
                          <span className="text-[10px] text-geo-accent mt-1">CORE PSYCHOLOGY</span>
                        </div>
                      </div>
                      <div className="space-y-4 md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">外观概览</p>
                        <div className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                          {char.appearance?.hairStyle} ({char.appearance?.hairColor}) <br />
                          {char.appearance?.eyeColor} 眼眸 / {char.appearance?.skinTone} 肤色 <br />
                          {char.appearance?.accessories}
                        </div>
                      </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">自我叙述</p>
                     <p className="text-slate-500 font-mono text-sm leading-relaxed italic max-w-2xl">
                        “{char.description || "一片空白。这就是你留给这个世界的全部残余。"}”
                     </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex justify-between items-center border-t-2 border-geo-border pt-8 bg-white z-10 sticky bottom-0">
          {step > 1 ? (
            <button onClick={prevStep} className="px-8 py-3 border-2 border-geo-border font-black uppercase transition-colors hover:bg-slate-50 tracking-tight">
              上一步 / PREV
            </button>
          ) : <div />}
          
          {step < 4 ? (
            <button 
              onClick={nextStep} 
              disabled={step === 1 && availablePoints.length > 0}
              className="px-8 py-3 bg-geo-dark text-white font-black uppercase disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors tracking-tight"
            >
              下一步 / NEXT
            </button>
          ) : (
            <button onClick={() => onComplete({ ...char, id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}` })} className="px-12 py-3 bg-geo-accent text-white font-black uppercase shadow-xl hover:shadow-blue-500/20 active:translate-y-1 transition-all tracking-tight text-lg">
              激活并开启调查 / ACTIVATE
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
