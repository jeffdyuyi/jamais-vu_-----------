/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Character, INITIAL_CHARACTER, SKILLS, SkillCategory, INITIAL_GEAR, Skill, INITIAL_DRUGS, Drug } from "../types";
import { ArrowRight, ArrowLeft, Check, Sparkles, Wand2, Package, EyeOff, Plus, Dices } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CreatorProps {
  onComplete: (char: Character) => void;
}

const POINTS_TO_ALLOCATE = [7, 6, 5, 4, 3, 2, 1];

const APPEARANCE_PRESETS = {
  hairStyle: ["寸头", "长发", "短发", "莫霍克", "背头", "秃头", "朋克短发", "大背头", "脏辫"],
  hairColor: ["黑色", "浅棕", "红发", "金发", "棕发", "褐发", "银白", "墨绿", "深灰"],
  eyeColor: ["深邃黑", "琥珀色", "冰蓝色", "鲜红色", "异色瞳", "灰暗色", "翠绿", "死鱼眼"],
  skinTone: ["苍白", "自然", "古铜", "黝黑", "灰白", "冷色调", "病态白"],
  clothingStyle: ["经典调查员", "朋克皮甲", "复古西装", "极简运动", "仪式长袍", "病号服", "休闲", "优雅", "现代", "狂野", "邋遢"],
  accessories: ["破领带", "电子义眼", "烟灰缸", "黑色手套", "怀表", "身份奖章", "粗金链"]
};

const RANDOM_TABLES = {
  gender: ["女性", "性别模糊", "男性", "刻意隐藏", "雌雄同体"],
  identity: ["警探", "记者", "业余侦探", "前科犯", "自由雇佣兵", "神秘学者", "线人"],
  personality: ["敌对", "谨慎", "中立", "友善", "友好", "孤僻", "狂躁", "冷漠", "迷人"],
  trait1: ["愤世嫉俗", "尖酸刻薄", "顺从", "怯懦", "忠诚", "无私", "冷漠", "迷人", "乐天", "悲观", "偏执", "敏锐", "洞察", "耐心", "狡诈", "野蛮", "谦卑", "虚荣"],
  trait2: ["内敛", "精于算计", "健谈", "狂野", "易怒", "健忘", "理想主义", "偏执", "轻信", "难以捉摸", "隐晦", "冷静", "坚忍", "善妒", "愤懑", "残酷", "高深莫测"],
  interest: ["社交活动", "派对", "音乐", "电影", "游戏", "文学", "食物", "酒精", "药物", "历史", "动物", "体育", "阿马斯", "超自然", "宗教", "社会主义", "自由主义", "无政府主义"],
  quirk: ["临终关怀", "病态", "精神崩溃", "悲伤", "悲惨过往", "精通之道", "恶名昭彰", "不忠", "戴绿帽", "激进思想", "前科犯", "罪犯", "传统", "知名人士", "负债累累", "人脉广泛", "迷信", "家族"],
  bodyType: ["高挑", "矮小", "瘦削", "圆润", "健壮", "发福", "佝偻"],
  vibe: ["成熟", "年轻", "魅惑", "丑陋", "普通", "性感", "沧桑", "憔悴"],
  feature: ["佩戴眼镜", "大面积纹身", "显眼的疤痕", "身体残疾", "浓密蓄须", "体毛旺盛", "面部穿孔", "机械义肢"],
  names: [
    "弗恩", "阿施塔特", "西比尔", "阿里阿德涅", "布兰温", "戈黛娃", "克莱尔", "露比",
    "黄蜂", "化身", "新星", "密码", "乔丹", "艾弗里", "奎因", "洛克",
    "浮士德", "塞拉斯", "巴兹尔", "拉斐尔", "安德烈", "金", "班克罗夫特", "邓肯"
  ]
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const PresetField = ({ 
  label, 
  value, 
  options, 
  onChange,
  onRandom
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  onRandom?: () => void
}) => {
  return (
    <div className="space-y-3 w-full">
      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
        {label}
        <button onClick={onRandom || (() => onChange(getRandom(options)))} className="text-geo-accent hover:text-slate-900 transition-colors">
          <Dices className="w-4 h-4" />
        </button>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(p => {
          const isActive = value === p || (value && value.includes(p));
          return (
            <button 
              key={p} 
              onClick={() => onChange(p)}
              className={`px-3 py-1.5 border text-xs transition-all font-bold shadow-sm ${isActive ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:border-slate-400 text-slate-700 bg-white"}`}
            >
              {p}
            </button>
          );
        })}
      </div>
      <input 
        className="disco-input w-full p-3 text-sm font-bold text-slate-800 focus:border-geo-accent transition-colors" 
        placeholder={`自定义或补充...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
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
      <section className="flex-1 bg-white flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-12 pb-8">
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

              <div className="disco-card bg-white flex justify-between items-center py-6 px-8 mb-10 shadow-sm border border-slate-200">
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
                              <span key={m.skillId} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 shadow-sm">
                                <span className={`w-1.5 h-1.5 rounded-full ${m.amount > 0 ? "bg-blue-500" : "bg-red-500"}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
                                  {SKILLS.find(s => s.id === m.skillId)?.name}
                                </span>
                                <span className="text-[10px] font-black text-white">
                                  {m.amount > 0 ? `+${m.amount}` : m.amount}
                                </span>
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
                            <span key={m.skillId} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 shadow-sm">
                              <span className={`w-1.5 h-1.5 rounded-full ${m.amount > 0 ? "bg-blue-500" : "bg-red-500"}`} />
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
                                {SKILLS.find(s => s.id === m.skillId)?.name}
                              </span>
                              <span className="text-[10px] font-black text-white">
                                {m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
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
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      setChar(prev => ({
                        ...prev,
                        name: getRandom(RANDOM_TABLES.names),
                        description: `我似乎记得一些关于${getRandom(["一桩谋杀案", "失落的宝藏", "一场大火", "背叛", "童年阴影", "一个神秘符号"])}的碎片。`,
                        appearance: {
                          ...prev.appearance,
                          gender: getRandom(RANDOM_TABLES.gender),
                          identity: getRandom(RANDOM_TABLES.identity),
                          personality: getRandom(RANDOM_TABLES.personality),
                          trait1: getRandom(RANDOM_TABLES.trait1),
                          trait2: getRandom(RANDOM_TABLES.trait2),
                          interest: getRandom(RANDOM_TABLES.interest),
                          quirk: getRandom(RANDOM_TABLES.quirk),
                          bodyType: getRandom(RANDOM_TABLES.bodyType),
                          vibe: getRandom(RANDOM_TABLES.vibe),
                          feature: getRandom(RANDOM_TABLES.feature),
                          hairStyle: getRandom(APPEARANCE_PRESETS.hairStyle),
                          hairColor: getRandom(APPEARANCE_PRESETS.hairColor),
                          eyeColor: getRandom(APPEARANCE_PRESETS.eyeColor),
                          skinTone: getRandom(APPEARANCE_PRESETS.skinTone),
                          clothingStyle: getRandom(APPEARANCE_PRESETS.clothingStyle),
                          accessories: getRandom(APPEARANCE_PRESETS.accessories)
                        }
                      }));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Dices className="w-4 h-4" /> 快速生成全套档案
                  </button>
                  <div className="text-[10px] font-bold text-geo-accent text-right">
                    IDENTITY RECONSTRUCTION<br />PHASE 03
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Basic Info (Merged Step 1) */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                       <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> 你的姓名 / 代号</span>
                       <button onClick={() => setChar(prev => ({...prev, name: getRandom(RANDOM_TABLES.names)}))} className="text-geo-accent hover:text-slate-900 transition-colors" title="随机姓名"><Dices className="w-4 h-4" /></button>
                    </label>
                    <input 
                      type="text"
                      className="disco-input w-full text-2xl py-4 bg-slate-50 focus:bg-white"
                      placeholder="哈里·杜布阿..."
                      value={char.name}
                      onChange={e => setChar({ ...char, name: e.target.value })}
                    />
                  </div>

                  {/* Gender & Identity & Personality */}
                  <PresetField 
                    label="性别" 
                    value={char.appearance.gender} 
                    options={RANDOM_TABLES.gender} 
                    onChange={(val) => updateAppearance("gender", val)} 
                  />
                  
                  <PresetField 
                    label="身份" 
                    value={char.appearance.identity} 
                    options={RANDOM_TABLES.identity} 
                    onChange={(val) => updateAppearance("identity", val)} 
                  />

                  <PresetField 
                    label="性格" 
                    value={char.appearance.personality} 
                    options={RANDOM_TABLES.personality} 
                    onChange={(val) => updateAppearance("personality", val)} 
                  />

                  <PresetField 
                    label="特质 1" 
                    value={char.appearance.trait1} 
                    options={RANDOM_TABLES.trait1} 
                    onChange={(val) => updateAppearance("trait1", val)} 
                  />

                  <PresetField 
                    label="特质 2" 
                    value={char.appearance.trait2} 
                    options={RANDOM_TABLES.trait2} 
                    onChange={(val) => updateAppearance("trait2", val)} 
                  />

                  <PresetField 
                    label="兴趣" 
                    value={char.appearance.interest} 
                    options={RANDOM_TABLES.interest} 
                    onChange={(val) => updateAppearance("interest", val)} 
                  />

                  <PresetField 
                    label="怪癖" 
                    value={char.appearance.quirk} 
                    options={RANDOM_TABLES.quirk} 
                    onChange={(val) => updateAppearance("quirk", val)} 
                  />

                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Plus className="w-3 h-3" /> 破碎的记忆自述 (背景)
                    </label>
                    <textarea 
                      className="disco-card w-full h-32 outline-none font-mono text-sm leading-relaxed resize-none border-dashed bg-slate-50 focus:bg-white transition-all"
                      placeholder="我模糊地记得一些关于..."
                      value={char.description}
                      onChange={e => setChar({ ...char, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Appearance Customization */}
                <div className="space-y-8">
                  {/* BodyType, Vibe, Feature */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
                    <PresetField 
                      label="体型" 
                      value={char.appearance.bodyType} 
                      options={RANDOM_TABLES.bodyType} 
                      onChange={(val) => updateAppearance("bodyType", val)} 
                    />
                    <PresetField 
                      label="气场" 
                      value={char.appearance.vibe} 
                      options={RANDOM_TABLES.vibe} 
                      onChange={(val) => updateAppearance("vibe", val)} 
                    />
                    <PresetField 
                      label="特征" 
                      value={char.appearance.feature} 
                      options={RANDOM_TABLES.feature} 
                      onChange={(val) => updateAppearance("feature", val)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Hair Style */}
                    <PresetField 
                      label="发型" 
                      value={char.appearance.hairStyle} 
                      options={APPEARANCE_PRESETS.hairStyle} 
                      onChange={(val) => updateAppearance("hairStyle", val)} 
                    />

                    {/* Hair Color */}
                    <PresetField 
                      label="发色" 
                      value={char.appearance.hairColor} 
                      options={APPEARANCE_PRESETS.hairColor} 
                      onChange={(val) => updateAppearance("hairColor", val)} 
                    />

                    {/* Eye Color */}
                    <PresetField 
                      label="瞳色" 
                      value={char.appearance.eyeColor} 
                      options={APPEARANCE_PRESETS.eyeColor} 
                      onChange={(val) => updateAppearance("eyeColor", val)} 
                    />

                    {/* Skin Tone */}
                    <PresetField 
                      label="肤色" 
                      value={char.appearance.skinTone} 
                      options={APPEARANCE_PRESETS.skinTone} 
                      onChange={(val) => updateAppearance("skinTone", val)} 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <PresetField 
                      label="服装风格" 
                      value={char.appearance.clothingStyle} 
                      options={APPEARANCE_PRESETS.clothingStyle} 
                      onChange={(val) => updateAppearance("clothingStyle", val)} 
                    />
                  </div>

                  <div>
                    <PresetField 
                      label="特色配饰" 
                      value={char.appearance.accessories} 
                      options={APPEARANCE_PRESETS.accessories} 
                      onChange={(val) => updateAppearance("accessories", val)} 
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
                    <div className="w-24 h-24 bg-white text-geo-dark border-2 border-slate-200 flex items-center justify-center font-black text-4xl leading-none shadow-sm">
                      {char.name[0] || "?"}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black uppercase tracking-tighter">{char.name || "无名调查员"}</h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-geo-accent text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] inline-block">
                          档案待激活
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {char.appearance?.identity || "神秘调查员"} / {char.appearance?.vibe || "普通"}
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
                        <div className="mt-4 pt-4 border-t border-slate-200">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">背景档案</p>
                           <p className="text-xs font-bold text-slate-600">
                              性别/身份: {char.appearance?.gender || "未知"} {char.appearance?.identity || "调查员"} <br />
                              性格倾向: {char.appearance?.personality || "未定义"} <br />
                              特质: {char.appearance?.trait1 || "无"} / {char.appearance?.trait2 || "无"} <br />
                              兴趣怪癖: {char.appearance?.interest || "无"} / {char.appearance?.quirk || "无"}
                           </p>
                        </div>
                      </div>
                      <div className="space-y-4 md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">外观与特征</p>
                        <div className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                          {char.appearance?.vibe || ""}的{char.appearance?.bodyType || ""} <br/>
                          {char.appearance?.hairStyle} ({char.appearance?.hairColor}) <br />
                          {char.appearance?.eyeColor} 眼眸 / {char.appearance?.skinTone} 肤色 <br />
                          穿着: {char.appearance?.clothingStyle} <br />
                          特征: {char.appearance?.feature} / 随身: {char.appearance?.accessories}
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

        </div>

        <div className="shrink-0 bg-white px-12 py-6 border-t-2 border-geo-border z-10 relative">
          <div className="flex justify-between items-center">
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
        </div>
      </section>
    </div>
  );
}
