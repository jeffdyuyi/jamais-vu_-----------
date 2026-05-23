/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Character, SKILLS, SkillCategory, INITIAL_GEAR, Skill, State, TagItem, INITIAL_DRUGS } from "../types";
import { 
  Heart, 
  Zap, 
  Wind, 
  Award, 
  Database, 
  Tag, 
  AlertCircle, 
  Plus, 
  Minus,
  Briefcase,
  Brain,
  Search,
  Book,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import InterjectionBoard from "./InterjectionBoard";
import InvestigationBoard from "./InvestigationBoard";
import DiamondTracker from "./DiamondTracker";

interface DashboardProps {
  char: Character;
  onUpdate: (char: Character) => void;
  openRulebook: () => void;
  activeSubTab?: "attributes" | "gear" | "thoughts" | "clues" | "appearance";
  setActiveSubTab?: (tab: "attributes" | "gear" | "thoughts" | "clues" | "appearance") => void;
  characters?: Character[];
}

const STATE_PRESETS = [
  { name: "恐惧", category: "mental" as const, desc: "面对危险或不确定性时" },
  { name: "愤怒", category: "mental" as const, desc: "考量他人情绪时" },
  { name: "困惑", category: "mental" as const, desc: "需要清晰思考与计算时" },
  { name: "天真", category: "mental" as const, desc: "察觉可疑事物与行为时" },
  { name: "鲁莽", category: "mental" as const, desc: "感知危险与衡量发力程度时" },
  { name: "悲伤", category: "mental" as const, desc: "展现自信与人格力量时" },
  { name: "手臂受伤", category: "physical" as const, desc: "发力与快速摆臂时" },
  { name: "背痛", category: "physical" as const, desc: "负重与扭转躯干时" },
  { name: "精疲力竭", category: "physical" as const, desc: "持续消耗体力时" },
  { name: "饥饿", category: "physical" as const, desc: "专注与感知周遭环境时" },
  { name: "患病", category: "physical" as const, desc: "保持自控与使用器械时" },
  { name: "脚踝扭伤", category: "physical" as const, desc: "奔跑或跳跃时" },
];

const PRESET_THOUGHTS = [
  {
    id: "apocalypse_cop",
    name: "末日警探",
    problem: "如果你无法拯救这个世界，至少你可以预测它的终结。你觉得街角的水泥正在加速腐烂，世界的末日即将来临。",
    conclusion: "你承认了末日，不再为此无端焦虑。你竖起了耳朵，开始捕捉世界细微的颤动。",
    modifiers: [
      { skillId: "shivers", amount: 2 },
      { skillId: "halfLight", amount: 1 },
      { skillId: "logic", amount: -1 }
    ]
  },
  {
    id: "chem_theory",
    name: "先进的化学理论",
    problem: "物质通过微观分子的流转互相侵占，你的肺部似乎能过滤并闻出空气中所有潜在的游离酒精分子。",
    conclusion: "你发现肉体只是纯粹的能量发生器。在彻底透支前，你对痛苦和化学物质的耐受性获得了颠覆性加强。",
    modifiers: [
      { skillId: "electrochemistry", amount: 2 },
      { skillId: "painThreshold", amount: 1 },
      { skillId: "composure", amount: -1 }
    ]
  },
  {
    id: "esprit_de_corps_whisper",
    name: "同舟共济的低语",
    problem: "你开始听到远方同僚巡逻车上的闲聊和无线电破喇叭里传来的风声，仿佛有一根无形的蓝色长线连系着你们。",
    conclusion: "警队的幽灵与誓言在此刻时刻与你同在。你不需要强充威严，同僚沉甸甸的肩膀给了你最可靠的支撑。",
    modifiers: [
      { skillId: "espritDeCorps", amount: 2 },
      { skillId: "authority", amount: -1 }
    ]
  },
  {
    id: "art_cop_thought",
    name: "艺术自负",
    problem: "世界不仅仅是一个案发现场，它更是一幅尚未完成的宏伟坦培拉。一切污垢皆在展现某种非凡而隐秘的美学结构。",
    conclusion: "你用夸张而荒唐的后现代艺术品味武装了自己。从此你一眼就能看破庸俗之辈那粗鲁而平庸的欺骗行为。",
    modifiers: [
      { skillId: "conceptualization", amount: 2 },
      { skillId: "perception", amount: 1 },
      { skillId: "logic", amount: -1 }
    ]
  },
  {
    id: "rectify_fate",
    name: "重构宿命",
    problem: "当你盯着地上的几道轮胎痕迹和破碎玻璃，时间的指针开始狂暴地倒退。你渴望重写他们离去的那一刻。",
    conclusion: "世间绝无不可理喻的巧合，只有尚未被你计算出来的引力轨迹。你成了在脑海中重构物理与罪案轨迹的高手。",
    modifiers: [
      { skillId: "visualCalculus", amount: 2 },
      { skillId: "inlandEmpire", amount: 1 }
    ]
  },
  {
    id: "boring_cop_thought",
    name: "无聊警探",
    problem: "把一切疯狂而充满超凡气息的怪异假设抛开。只去登记指纹，测量鞋印。甘当一台平庸、安全而守序的办案机器。",
    conclusion: "枯燥是抵抗城市重力最伟大的伪装。任何波澜起伏与精神潮汐都无法撼动一块纯粹、无趣的水泥钢筋。",
    modifiers: [
      { skillId: "composure", amount: 2 },
      { skillId: "suggestion", amount: -1 }
    ]
  },
  {
    id: "peoples_protector",
    name: "平民保护者",
    problem: "那些在城市底角挣扎谋生的工人们，他们的无力叹息不该只被官僚冷冰冰的皮包遮掩。你想为他们发出微弱的呜咽。",
    conclusion: "你站在被遗忘的大多数人之中。你那滚烫的同理心让你能理解一切不洁与怯懦，并坚韧地忍受这世界的敌意。",
    modifiers: [
      { skillId: "empathy", amount: 2 },
      { skillId: "painThreshold", amount: 1 },
      { skillId: "authority", amount: -1 }
    ]
  }
];

export default function Dashboard({ 
  char, 
  onUpdate, 
  openRulebook, 
  activeSubTab, 
  setActiveSubTab,
  characters
}: DashboardProps) {
  const [localActiveSubTab, setLocalActiveSubTab] = useState<"attributes" | "gear" | "thoughts" | "clues" | "appearance">("attributes");
  const currentTab = activeSubTab || localActiveSubTab;
  const setCurrentTab = setActiveSubTab || setLocalActiveSubTab;

  // Add State Editor states
  const [showAddState, setShowAddState] = useState(false);
  const [selectedStatePreset, setSelectedStatePreset] = useState<string>("custom");
  const [customStateName, setCustomStateName] = useState("");
  const [customStateDesc, setCustomStateDesc] = useState("");
  const [stateCategory, setStateCategory] = useState<"mental" | "physical">("mental");
  const [stateSeverity, setStateSeverity] = useState<number>(1);

  // Add Tag Editor states
  const [showAddTag, setShowAddTag] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagEffect, setTagEffect] = useState<number>(1);
  const [tagDesc, setTagDesc] = useState("");

  // Thought Cabinet Manager state
  const [showAddThought, setShowAddThought] = useState(false);
  const [selectedThoughtPreset, setSelectedThoughtPreset] = useState<string>("custom");
  const [customThoughtName, setCustomThoughtName] = useState("");
  const [customThoughtTrigger, setCustomThoughtTrigger] = useState("");
  const [customThoughtProblem, setCustomThoughtProblem] = useState("");
  
  const [internalizingThoughtId, setInternalizingThoughtId] = useState<string | null>(null);
  const [internalizeConclusion, setInternalizeConclusion] = useState("");
  const [internalizePlusSkill, setInternalizePlusSkill] = useState("logic");
  const [internalizeMinusSkill, setInternalizeMinusSkill] = useState("authority");

  // --- CUSTOM GEAR AND DRUG ADD/EDIT STATES ---
  const [showGearModal, setShowGearModal] = useState(false);
  const [editingGear, setEditingGear] = useState<any | null>(null); // Gear if editing, null if adding
  const [gearName, setGearName] = useState("");
  const [gearType, setGearType] = useState<"衣物" | "工具" | "武器">("衣物");
  const [gearDesc, setGearDesc] = useState("");
  const [gearModifiers, setGearModifiers] = useState<{ skillId: string; amount: number }[]>([]);

  const [showDrugModal, setShowDrugModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState<any | null>(null); // Drug if editing, null if adding
  const [drugName, setDrugName] = useState("");
  const [drugDesc, setDrugDesc] = useState("");
  const [drugDuration, setDrugDuration] = useState("一整个场景");
  const [drugTempModifiers, setDrugTempModifiers] = useState<{ skillId: string; amount: number }[]>([]);
  const [drugPermStat, setDrugPermStat] = useState<"health" | "morale">("health");
  const [drugPermAmount, setDrugPermAmount] = useState<number>(1);

  // Added library retrieval states
  const [showLibraryAddSection, setShowLibraryAddSection] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [libraryTab, setLibraryTab] = useState<"standard" | "custom">("standard");

  // Collect all custom gears and drugs across ALL finished character cards
  const allSavedCustomGears: { gear: any; creatorName: string }[] = [];
  const allSavedCustomDrugs: { drug: any; creatorName: string }[] = [];

  const listToUse = characters || (() => {
    try {
      const raw = localStorage.getItem("jamais_vu_characters");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  listToUse.forEach((c: any) => {
    if (c.customGears) {
      c.customGears.forEach((g: any) => {
        if (!allSavedCustomGears.some(saved => saved.gear.id === g.id || saved.gear.name === g.name)) {
          allSavedCustomGears.push({ gear: g, creatorName: c.name });
        }
      });
    }
    if (c.customDrugs) {
      c.customDrugs.forEach((d: any) => {
        if (!allSavedCustomDrugs.some(saved => saved.drug.id === d.id || saved.drug.name === d.name)) {
          allSavedCustomDrugs.push({ drug: d, creatorName: c.name });
        }
      });
    }
  });

  const handleCopyCustomGearToInventory = (gear: any) => {
    if (char.gearIds.includes(gear.id)) {
      showNotification(`⚠️ 你已经拥有极具个人特色的 ${gear.name}！`);
      return;
    }
    const currentCustomGears = char.customGears || [];
    const alreadyHasDef = currentCustomGears.some(g => g.id === gear.id || g.name === gear.name);
    const newGearDef = { ...gear, id: gear.id.startsWith("custom_gear_") ? gear.id : `custom_gear_${Date.now()}` };
    
    onUpdate({
      ...char,
      customGears: alreadyHasDef ? currentCustomGears : [...currentCustomGears, newGearDef],
      gearIds: [...char.gearIds, newGearDef.id],
      activeGearIds: [...char.activeGearIds, newGearDef.id]
    });
    showNotification(`🎒 成功调用并穿戴了自定义装备 ${gear.name}！`);
  };

  const handleCopyCustomDrugToInventory = (drug: any) => {
    const list = char.drugIds || [];
    if (list.includes(drug.id) || char.activeDrugId === drug.id) {
      showNotification(`⚠️ 你已经携带或有该生化药效在身 ${drug.name}！`);
      return;
    }
    const currentCustomDrugs = char.customDrugs || [];
    const alreadyHasDef = currentCustomDrugs.some(d => d.id === drug.id || d.name === drug.name);
    const newDrugDef = { ...drug, id: drug.id.startsWith("custom_drug_") ? drug.id : `custom_drug_${Date.now()}` };

    onUpdate({
      ...char,
      customDrugs: alreadyHasDef ? currentCustomDrugs : [...currentCustomDrugs, newDrugDef],
      drugIds: [...list, newDrugDef.id]
    });
    showNotification(`🧪 成功从药剂库中调用并携带了自定义药剂 ${drug.name}！`);
  };

  const handleRemoveGearFromInventory = (id: string, name: string) => {
    onUpdate({
      ...char,
      gearIds: char.gearIds.filter(gid => gid !== id),
      activeGearIds: char.activeGearIds.filter(gid => gid !== id)
    });
    showNotification(`🎒 已将装备 ${name} 移出行囊`);
  };

  const handleRemoveDrugFromInventory = (id: string, name: string) => {
    onUpdate({
      ...char,
      drugIds: (char.drugIds || []).filter(did => did !== id),
      activeDrugId: char.activeDrugId === id ? null : char.activeDrugId
    });
    showNotification(`🧪 已将药剂 ${name} 移出行囊`);
  };

  const handleAddGearFromLibrary = (gearId: string) => {
    if (char.gearIds.includes(gearId)) return;
    onUpdate({
      ...char,
      gearIds: [...char.gearIds, gearId],
      activeGearIds: [...char.activeGearIds, gearId] // Auto equip on grab
    });
    const item = INITIAL_GEAR.find(g => g.id === gearId);
    showNotification(`🎒 成功将 ${item?.name || "装备"} 收入随载行囊，并已自动穿戴`);
  };

  const handleAddDrugFromLibrary = (drugId: string) => {
    const list = char.drugIds || [];
    if (list.includes(drugId)) return;
    onUpdate({
      ...char,
      drugIds: [...list, drugId]
    });
    const item = INITIAL_DRUGS.find(d => d.id === drugId);
    showNotification(`🧪 成功将 ${item?.name || "制剂"} 添加到携带试剂库`);
  };

  // Simple modifier addition helper sub-states
  const [currentModSkill, setCurrentModSkill] = useState(SKILLS[0].id);
  const [currentModAmount, setCurrentModAmount] = useState<number>(1);

  // Gear CRUD Helpers
  const openAddGear = () => {
    setEditingGear(null);
    setGearName("");
    setGearType("衣物");
    setGearDesc("");
    setGearModifiers([]);
    setCurrentModSkill(SKILLS[0].id);
    setCurrentModAmount(1);
    setShowGearModal(true);
  };

  const openEditGear = (gear: any) => {
    setEditingGear(gear);
    setGearName(gear.name);
    setGearType(gear.type);
    setGearDesc(gear.description);
    setGearModifiers(gear.modifiers || []);
    setCurrentModSkill(SKILLS[0].id);
    setCurrentModAmount(1);
    setShowGearModal(true);
  };

  const handleSaveGear = () => {
    if (!gearName.trim()) {
      showNotification("⚠️ 装备名称不能为空！");
      return;
    }
    const currentCustomGears = char.customGears || [];
    
    if (editingGear) {
      // Editing existing custom gear
      const updatedCustomGears = currentCustomGears.map(g => 
        g.id === editingGear.id 
          ? { ...g, name: gearName, type: gearType, description: gearDesc, modifiers: gearModifiers }
          : g
      );
      onUpdate({
        ...char,
        customGears: updatedCustomGears
      });
      showNotification(`🛠️ 成功修改自定义装备 ${gearName}。`);
    } else {
      // Create new custom gear
      const newId = `custom_gear_${Date.now()}`;
      const newGear = {
        id: newId,
        name: gearName,
        type: gearType,
        description: gearDesc || "这件物品尚未被详细调查...",
        modifiers: gearModifiers
      };
      onUpdate({
        ...char,
        customGears: [...currentCustomGears, newGear],
        gearIds: [...char.gearIds, newId],
        activeGearIds: [...char.activeGearIds, newId] // Auto EQUIP
      });
      showNotification(`🎒 成功添加并穿戴自定义装备 ${gearName}！`);
    }
    setShowGearModal(false);
  };

  const handleDeleteGear = (gearId: string, name: string) => {
    const updatedCustomGears = (char.customGears || []).filter(g => g.id !== gearId);
    onUpdate({
      ...char,
      customGears: updatedCustomGears,
      gearIds: char.gearIds.filter(id => id !== gearId),
      activeGearIds: char.activeGearIds.filter(id => id !== gearId)
    });
    showNotification(`🗑️ 已成功删除自定义装备 ${name}。`);
  };

  // Drug CRUD Helpers
  const openAddDrug = () => {
    setEditingDrug(null);
    setDrugName("");
    setDrugDesc("");
    setDrugDuration("一整个场景");
    setDrugTempModifiers([]);
    setDrugPermStat("health");
    setDrugPermAmount(1);
    setCurrentModSkill(SKILLS[0].id);
    setCurrentModAmount(1);
    setShowDrugModal(true);
  };

  const openEditDrug = (drug: any) => {
    setEditingDrug(drug);
    setDrugName(drug.name);
    setDrugDesc(drug.description);
    setDrugDuration(drug.duration || "一整个场景");
    setDrugTempModifiers(drug.tempModifiers || []);
    setDrugPermStat(drug.permStat || "health");
    setDrugPermAmount(drug.permAmount || 1);
    setCurrentModSkill(SKILLS[0].id);
    setCurrentModAmount(1);
    setShowDrugModal(true);
  };

  const handleSaveDrug = () => {
    if (!drugName.trim()) {
      showNotification("⚠️ 药剂名称不能为空！");
      return;
    }
    const currentCustomDrugs = char.customDrugs || [];
    
    if (editingDrug) {
      // Editing existing
      const updatedCustomDrugs = currentCustomDrugs.map(d => 
        d.id === editingDrug.id 
          ? { 
              ...d, 
              name: drugName, 
              description: drugDesc, 
              duration: drugDuration, 
              tempModifiers: drugTempModifiers,
              permStat: drugPermStat,
              permAmount: drugPermAmount
            }
          : d
      );
      onUpdate({
        ...char,
        customDrugs: updatedCustomDrugs
      });
      showNotification(`🔬 成功修改自定义药剂 ${drugName}。`);
    } else {
      // Create new
      const newId = `custom_drug_${Date.now()}`;
      const newDrug = {
        id: newId,
        name: drugName,
        description: drugDesc || "一种散发着强烈化学或迷幻气息的试剂...",
        duration: drugDuration,
        tempModifiers: drugTempModifiers,
        permStat: drugPermStat,
        permAmount: drugPermAmount
      };
      onUpdate({
        ...char,
        customDrugs: [...currentCustomDrugs, newDrug],
        drugIds: [...(char.drugIds || []), newId] // Add to carried inventory
      });
      showNotification(`🧪 成功调制并携带自定义药剂 ${drugName}！`);
    }
    setShowDrugModal(false);
  };

  const handleDeleteDrug = (drugId: string, name: string) => {
    const updatedCustomDrugs = (char.customDrugs || []).filter(d => d.id !== drugId);
    onUpdate({
      ...char,
      customDrugs: updatedCustomDrugs,
      drugIds: (char.drugIds || []).filter(id => id !== drugId),
      activeDrugId: char.activeDrugId === drugId ? null : char.activeDrugId
    });
    showNotification(`🗑️ 已成功销毁并删除自定义药剂 ${name}。`);
  };

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // States for narrative ending in Dashboard when health or morale hits 0
  const [activeEndingType, setActiveEndingType] = useState<"health" | "morale" | null>(null);
  const [endingInput, setEndingInput] = useState("");

  const updateStat = (stat: "health" | "morale" | "xp" | "tokens", delta: number) => {
    let updatedStates = char.states ? [...char.states] : [];
    let clearedMsg = "";

    const originalVal = char[stat] || 0;
    const maxVal = stat === "xp" ? Infinity : (stat === "tokens" ? 3 : 5);
    const newVal = Math.min(maxVal, Math.max(0, originalVal + delta));

    if (delta > 0) {
      if (stat === "health") {
        // Clear oldest physical state
        const pIdx = updatedStates.findIndex(s => s.category === "physical");
        if (pIdx !== -1) {
          clearedMsg = `由于健康恢复，清除了身体状态：【${updatedStates[pIdx].name}】`;
          updatedStates.splice(pIdx, 1);
        }
      } else if (stat === "morale") {
        // Clear oldest mental state
        const mIdx = updatedStates.findIndex(s => s.category === "mental");
        if (mIdx !== -1) {
          clearedMsg = `由于士气提升，清除了心理状态：【${updatedStates[mIdx].name}】`;
          updatedStates.splice(mIdx, 1);
        }
      }
    } else if (delta < 0) {
      // Prompt user to add states if health or morale was reduced (as per screenshots)
      if (stat === "health") {
        clearedMsg = `扣除健康！物理抵抗削减，已为你展开身体负面状态（伤势/伤痛）栏目以作登记。`;
        setShowAddState(true);
        setStateCategory("physical");
      } else if (stat === "morale") {
        clearedMsg = `扣除士气！理智防线受挫，已为你展开心理负面状态（心魔/焦虑）栏目以作登记。`;
        setShowAddState(true);
        setStateCategory("mental");
      }
    }

    // Check if stat reached 0 and was formerly positive
    if ((stat === "health" || stat === "morale") && newVal === 0 && originalVal > 0) {
      setActiveEndingType(stat);
      setEndingInput("");
    }

    // Clean up endingStatement if they revive/re-increase health/morale above 0
    let updatedEndingStatement = char.endingStatement;
    if ((stat === "health" || stat === "morale") && newVal > 0 && originalVal === 0) {
      updatedEndingStatement = undefined;
    }

    onUpdate({
      ...char,
      [stat]: newVal,
      states: updatedStates,
      endingStatement: updatedEndingStatement,
    });

    if (clearedMsg) {
      showNotification(clearedMsg);
    }
  };

  const handleSaveEnding = () => {
    if (!activeEndingType) return;
    
    const statement = endingInput.trim() || (activeEndingType === "health" 
      ? "在沉重的物理创伤下，生命体征宣告归零，永远退出了这场无尽的理性交锋。" 
      : "心智迷失于无底的虚无，他默默卸下领带，去往没有压力与喧嚣的远方。");

    onUpdate({
      ...char,
      endingStatement: statement
    });
    
    setActiveEndingType(null);
    setEndingInput("");
    showNotification("落幕陈述签署成功，已安全写入离场档案。");
  };

  const getSkillTotal = (skillId: string) => {
    const natural = char.skills[skillId] || 0;
    const allGears = [...INITIAL_GEAR, ...(char.customGears || [])];
    const gearMod = char.activeGearIds
      .flatMap(id => allGears.find(g => g.id === id)?.modifiers || [])
      .filter(m => m.skillId === skillId)
      .reduce((acc, m) => acc + m.amount, 0);
    
    const thoughtMod = (char.thoughts || [])
      .filter(t => t.internalized)
      .flatMap(t => t.modifiers || [])
      .filter(m => m.skillId === skillId)
      .reduce((acc, m) => acc + m.amount, 0);

    const allDrugs = [...INITIAL_DRUGS, ...(char.customDrugs || [])];
    const activeDrug = char.activeDrugId ? allDrugs.find(d => d.id === char.activeDrugId) : null;
    const drugMod = activeDrug 
      ? (activeDrug.tempModifiers || []).filter(m => m.skillId === skillId).reduce((acc, m) => acc + m.amount, 0)
      : 0;
    
    return natural + gearMod + thoughtMod + drugMod;
  };

  const handleUpgradeSkill = (skillId: string) => {
    if (char.xp < 3) {
      showNotification("⚠️ 经验值不足：提升技能 1 点需要消耗 3 XP。可以通过完成场景或主动引入劣势标签获得。");
      return;
    }

    const currentLevel = char.skills[skillId] || 0;
    const updatedSkills = {
      ...char.skills,
      [skillId]: currentLevel + 1
    };

    onUpdate({
      ...char,
      xp: char.xp - 3,
      skills: updatedSkills
    });

    const skillObj = SKILLS.find(s => s.id === skillId);
    showNotification(`⚡ 经验值消耗成功！消耗了 3 XP，已将【${skillObj?.name || skillId}】的基础等级提升为 ${currentLevel + 1} 点。`);
  };

  const handleAddThought = () => {
    let name = "";
    let trigger = "";
    let problem = "";
    let conclusion = "";
    let modifiers: { skillId: string; amount: number }[] = [];

    if (selectedThoughtPreset !== "custom") {
      const preset = PRESET_THOUGHTS.find(p => p.id === selectedThoughtPreset);
      if (preset) {
        name = preset.name;
        problem = preset.problem;
        conclusion = preset.conclusion;
        modifiers = preset.modifiers;
      }
    } else {
      name = customThoughtName.trim();
      trigger = customThoughtTrigger.trim();
      problem = customThoughtProblem.trim();
    }

    if (!name || (!problem && selectedThoughtPreset === "custom")) {
      showNotification("⚠️ 脑瓜震荡：请输入具有实际意义的思维名称和心智难题。");
      return;
    }

    if ((char.thoughts || []).some(t => t.name.toLowerCase() === name.toLowerCase())) {
      showNotification("⚠️ 思维过载：你的脑海里已经有这个新奇的执念轮廓了。");
      return;
    }

    const newThought = {
      id: `thought_${Date.now()}_${Math.random()}`,
      name,
      trigger,
      problem,
      conclusion,
      progress: 0, // 0 indicates researching
      internalized: false,
      modifiers
    };

    onUpdate({
      ...char,
      thoughts: [...(char.thoughts || []), newThought]
    });

    showNotification(`💡 执念入脑！【${name}】开始在你的潜意识中酝酿。`);
    
    // reset form inputs
    setShowAddThought(false);
    setCustomThoughtName("");
    setCustomThoughtTrigger("");
    setCustomThoughtProblem("");
  };

  const handleDirectInternalize = (thoughtId: string) => {
    const target = (char.thoughts || []).find(t => t.id === thoughtId);
    if (!target) return;
    if (char.xp < 5) {
      showNotification("⚠️ 经验值不足：内化一项思维，将其化为坚不可摧的信息本能需要消耗 5 XP。");
      return;
    }
    const updatedThoughts = char.thoughts.map(t => 
      t.id === thoughtId ? { ...t, internalized: true, progress: 3 } : t
    );
    onUpdate({ ...char, xp: char.xp - 5, thoughts: updatedThoughts });
    showNotification(`🌟 顿悟！已消耗 5 XP 将思维【${target.name}】完美内化，它的调整值已正式生效。`);
  };

  const handleInternalizeThoughtSubmit = () => {
    if (!internalizingThoughtId) return;
    const target = (char.thoughts || []).find(t => t.id === internalizingThoughtId);
    if (!target) return;

    if (char.xp < 5) {
      showNotification("⚠️ 经验值不足：内化一项思维，将其化为坚不可摧的信息本能需要消耗 5 XP。");
      return;
    }

    let finalConclusion = target.conclusion || "";
    let finalModifiers = target.modifiers || [];

    // Custom thought without predefined conclusions -> set from form
    if (!target.conclusion && (!target.modifiers || target.modifiers.length === 0)) {
      finalConclusion = internalizeConclusion.trim();
      finalModifiers = [
        { skillId: internalizePlusSkill, amount: 2 },
        { skillId: internalizeMinusSkill, amount: -1 }
      ];
      if (!finalConclusion) {
        showNotification("⚠️ 顿悟失败：你需要得出一个具体的本能结论。");
        return;
      }
    }

    const updatedThoughts = char.thoughts.map(t => {
      if (t.id === internalizingThoughtId) {
        return {
          ...t,
          internalized: true,
          conclusion: finalConclusion,
          modifiers: finalModifiers,
          progress: 3
        };
      }
      return t;
    });

    onUpdate({
      ...char,
      xp: char.xp - 5,
      thoughts: updatedThoughts
    });

    showNotification(`🌟 顿悟！已消耗 5 XP 将思维【${target.name}】完美内化，现在它的调整值已正式生效。`);
    
    setInternalizingThoughtId(null);
    setInternalizeConclusion("");
  };

  const handleProgressThought = (thoughtId: string) => {
    const updatedThoughts = (char.thoughts || []).map(t => {
      if (t.id === thoughtId && !t.internalized && t.progress < 3) {
        return { ...t, progress: t.progress + 1 };
      }
      return t;
    });
    onUpdate({
      ...char,
      thoughts: updatedThoughts
    });
  };

  const handleForgetThought = (thoughtId: string) => {
    const target = (char.thoughts || []).find(t => t.id === thoughtId);
    if (!target) return;

    if (window.confirm(`【思维遗忘警报】\n你确定要将思维【${target.name}】从你疲惫的大脑皮层中彻底格式化吗？这会清除其所有属性加成，且不会退还任何曾用于内化的 XP 经验。`)) {
      onUpdate({
        ...char,
        thoughts: (char.thoughts || []).filter(t => t.id !== thoughtId)
      });
      showNotification(`🧹 格式化完成！遗忘了思维【${target.name}】，你又腾出了少许虚无的心智空间。`);
    }
  };

  const handleAddState = () => {
    let name = customStateName;
    let desc = customStateDesc;
    let category = stateCategory;

    if (selectedStatePreset !== "custom") {
      const preset = STATE_PRESETS.find(p => p.name === selectedStatePreset);
      if (preset) {
        name = preset.name;
        desc = preset.desc;
        category = preset.category;
      }
    }

    if (!name.trim()) return;

    const newState: State = {
      id: `state_${Date.now()}_${Math.random()}`,
      name,
      category,
      severity: stateSeverity,
      description: desc,
    };

    onUpdate({
      ...char,
      states: [...(char.states || []), newState]
    });

    // Reset Form
    setCustomStateName("");
    setCustomStateDesc("");
    setSelectedStatePreset("custom");
    setShowAddState(false);
    showNotification(`已添加负面状态：【${name}】`);
  };

  const handleAddTag = () => {
    if (!tagName.trim()) return;

    const newTag: TagItem = {
      id: `tag_${Date.now()}_${Math.random()}`,
      name: tagName,
      effect: tagEffect,
      description: tagDesc,
      invokedForXp: false,
    };

    onUpdate({
      ...char,
      tags: [...(char.tags || []), newTag]
    });

    setTagName("");
    setTagDesc("");
    setTagEffect(1);
    setShowAddTag(false);
    showNotification(`已添加标签：【${tagName}】`);
  };

  const handleRemoveState = (stateId: string) => {
    const target = char.states?.find(s => s.id === stateId);
    onUpdate({
      ...char,
      states: (char.states || []).filter(s => s.id !== stateId)
    });
    if (target) showNotification(`清除了状态：【${target.name}】`);
  };

  const handleRemoveTag = (tagId: string) => {
    const target = char.tags?.find(t => t.id === tagId);
    onUpdate({
      ...char,
      tags: (char.tags || []).filter(t => t.id !== tagId)
    });
    if (target) showNotification(`移除了标签：【${target.name}】`);
  };

  const invokeTagForXp = (tagId: string) => {
    const target = char.tags?.find(t => t.id === tagId);
    if (!target) return;

    const updatedTags = char.tags.map(t => {
      if (t.id === tagId) {
        return { ...t, invokedForXp: true };
      }
      return t;
    });

    onUpdate({
      ...char,
      xp: char.xp + 1,
      tags: updatedTags
    });

    showNotification(`主动援引负面因素【${target.name}】，获得 1 点 XP！`);
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Sidebar: Core Stats */}
      <aside className="w-80 border-r-2 border-geo-border bg-slate-50 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 space-y-8 flex-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">当前状态</p>
            <div className="disco-card rounded-none p-6 bg-white space-y-6">
              <h2 className="text-2xl font-black italic text-geo-dark">{char.name}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-bold uppercase text-slate-800">健康值 (HEALTH)</div>
                    <DiamondTracker 
                      value={char.health} 
                      max={5} 
                      onChange={(newVal) => updateStat("health", newVal - char.health)} 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-bold uppercase text-slate-800">士气值 (MORALE)</div>
                    <DiamondTracker 
                      value={char.morale} 
                      max={5} 
                      onChange={(newVal) => updateStat("morale", newVal - char.morale)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* XP Section */}
            <div className="border-2 border-geo-border bg-white p-4 text-center flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">经验 XP 系统</div>
                <div className="flex justify-center mt-2">
                  <DiamondTracker 
                    value={char.xp % 10} // Display up to 10 for visual representation, or 5? Original design has 5 diamonds per row.
                    max={5} 
                    onChange={(newVal) => {
                      // Adjust to nearest multiple of 5
                      const base = Math.floor(char.xp / 5) * 5;
                      const target = base + newVal;
                      updateStat("xp", target - char.xp);
                    }} 
                  />
                </div>
                <div className="text-xl font-black text-slate-900 font-mono mt-3">总计: {char.xp}</div>
              </div>
              <div className="flex justify-center gap-2 mt-3 border-t border-slate-100 pt-2">
                <button 
                  onClick={() => updateStat("xp", -1)} 
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-black rounded flex items-center justify-center cursor-pointer text-xs"
                  title="减少 1点 XP"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => updateStat("xp", 1)} 
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-black rounded flex items-center justify-center cursor-pointer text-xs"
                  title="获得 1点 XP"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Interjection Tokens (插叙指示物) */}
            <div className="border-2 border-geo-border bg-white p-4 text-center flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-1 py-0.5 bg-slate-200 text-slate-600 font-mono font-bold text-[7px] leading-none uppercase tracking-tighter">
                MAX 3
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">
                  插叙指示物
                </div>
                <div className="flex justify-center mt-2" title={`插叙指示物: ${char.tokens}/3\n持有3枚指示物的玩家不可再被递交插叙。`}>
                  <DiamondTracker 
                    value={char.tokens} 
                    max={3} 
                    onChange={(newVal) => updateStat("tokens", newVal - char.tokens)} 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => updateStat("tokens", -1)} 
                  className="w-7 h-5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded text-[10px] font-black flex items-center justify-center cursor-pointer"
                  title="减少1枚插叙指示物"
                >
                  -
                </button>
                <span className="text-xs font-black text-slate-900 font-mono tracking-tight">
                  {char.tokens}/3
                </span>
                <button 
                  onClick={() => {
                    if (char.tokens >= 3) {
                      showNotification("⚠️ 警告：当前插叙指示物已达上限 3 枚，根据规则你不可再被插叙。");
                    } else {
                      updateStat("tokens", 1);
                    }
                  }} 
                  className="w-7 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-black flex items-center justify-center cursor-pointer"
                  title="增加1枚插叙指示物"
                >
                  +
                </button>
              </div>
            </div>
          </div>



          {/* 负面状态管理 (States) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
              <span>负面状态 (伤害/状态机)</span>
              <button 
                onClick={() => {
                  setShowAddState(!showAddState);
                  setShowAddTag(false);
                }} 
                className="text-red-500 hover:rotate-90 transition-transform p-1 hover:bg-red-50"
                title="添加负面状态"
                id="btn-add-state"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddState && (
              <div className="bg-red-50/80 border-2 border-red-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200" id="state-editor-panel">
                <div className="text-xs font-black text-red-800 uppercase tracking-wider">新增伤痛 / 精神状态</div>
                
                {/* Preset selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">选择伤势/状态预设</label>
                  <select 
                    value={selectedStatePreset} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedStatePreset(val);
                      if (val !== "custom") {
                        const preset = STATE_PRESETS.find(p => p.name === val);
                        if (preset) {
                          setCustomStateName(preset.name);
                          setCustomStateDesc(preset.desc);
                          setStateCategory(preset.category);
                        }
                      } else {
                        setCustomStateName("");
                        setCustomStateDesc("");
                      }
                    }}
                    className="w-full text-xs font-bold py-1.5 px-2 border-2 border-slate-300 bg-white"
                  >
                    <option value="custom">-- 自定义状态 (手动输入) --</option>
                    <optgroup label="精神/心理状态 预设">
                      {STATE_PRESETS.filter(p => p.category === "mental").map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="身体/健康状态 预设">
                      {STATE_PRESETS.filter(p => p.category === "physical").map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedStatePreset === "custom" && (
                  <>
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="状态名称 (如：缺乏安全感/眼花缭乱)"
                        value={customStateName}
                        onChange={(e) => setCustomStateName(e.target.value)}
                        className="w-full text-xs font-bold py-1.5 px-2 bg-white border border-slate-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="触发条件/受影响场景 (如：展现勇气时/使用器械时)"
                        value={customStateDesc}
                        onChange={(e) => setCustomStateDesc(e.target.value)}
                        className="w-full text-xs font-medium py-1.5 px-2 bg-white border border-slate-300"
                      />
                    </div>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                        <input 
                          type="radio" 
                          name="custom-state-cat"
                          checked={stateCategory === "mental"} 
                          onChange={() => setStateCategory("mental")} 
                        />
                        精神状态 (士气损伤)
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                        <input 
                          type="radio" 
                          name="custom-state-cat"
                          checked={stateCategory === "physical"} 
                          onChange={() => setStateCategory("physical")} 
                        />
                        身体状态 (健康损伤)
                      </label>
                    </div>
                  </>
                )}

                {selectedStatePreset !== "custom" && (
                  <div className="text-[10px] text-slate-600 font-medium bg-white/40 p-2 border border-dashed border-red-200">
                    <span className="font-bold text-red-700">
                      【{stateCategory === "mental" ? "精神状态" : "身体状态"}】
                    </span>{" "}
                    影响范围：{customStateDesc}
                  </div>
                )}

                {/* Severity Dropdown */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-600">减值程度 (与行动关联度)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setStateSeverity(sev)}
                        className={`w-8 h-7 text-xs font-black border-2 flex items-center justify-center transition-all ${
                          stateSeverity === sev 
                            ? "bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_#7f1d1d]" 
                            : "bg-white text-slate-600 border-slate-300 hover:border-red-400"
                        }`}
                      >
                        -{sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleAddState} 
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#991b1b] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    生成以此状态
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddState(false);
                      setSelectedStatePreset("custom");
                      setCustomStateName("");
                      setCustomStateDesc("");
                    }} 
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* List of active states */}
            <div className="bg-white border-2 border-geo-border p-4 min-h-[90px] space-y-3" id="active-states-box">
              {char.states && char.states.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {char.states.map((s) => (
                    <div 
                      key={s.id} 
                      className={`group/item flex items-start justify-between p-2.5 border-2 transition-all hover:translate-x-0.5 ${
                        s.category === "mental" 
                          ? "border-purple-300 bg-purple-50/20" 
                          : "border-red-300 bg-red-50/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black px-1.5 py-[1px] ${
                            s.category === "mental" ? "bg-purple-600 text-white" : "bg-red-600 text-white"
                          }`}>
                            {s.category === "mental" ? "精神" : "身体"}
                          </span>
                          <span className="text-sm font-black text-slate-800">{s.name}</span>
                          <span className="text-xs font-black text-red-600">-{s.severity}</span>
                        </div>
                        {s.description && (
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-mono">
                            ※ 受阻场景：{s.description}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleRemoveState(s.id)}
                        className="text-slate-300 hover:text-red-600 p-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity"
                        title="清除状态"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="text-[9px] text-slate-400 font-mono text-center pt-1 leading-snug">
                    * 恢复健康或士气时，最符合的负面状态将被自动清除
                  </div>
                </div>
              ) : (
                <div className="text-[10px] italic text-slate-400 py-6 text-center leading-relaxed">
                  暂无负面心智或身体伤痛...<br/>
                  处于极佳的自洽中。
                </div>
              )}
            </div>
          </div>

          {/* 标签与线索管理 (Tags) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
              <span>环境标签与行动线索</span>
              <button 
                onClick={() => {
                  setShowAddTag(!showAddTag);
                  setShowAddState(false);
                }} 
                className="text-geo-accent hover:rotate-90 transition-transform p-1 hover:bg-slate-100"
                title="添加环境标签或线索"
                id="btn-add-tag"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddTag && (
              <div className="bg-blue-50/80 border-2 border-blue-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200" id="tag-editor-panel">
                <div className="text-xs font-black text-blue-800 uppercase tracking-wider">记录环境 / 事态标签</div>
                
                <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="标签名称 (如：深夜浓雾弥漫/暴跳如雷的证人)"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full text-xs font-bold py-1.5 px-2 bg-white border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="备注/具体效用说明 (可选)"
                    value={tagDesc}
                    onChange={(e) => setTagDesc(e.target.value)}
                    className="w-full text-xs font-medium py-1.5 px-2 bg-white border border-slate-300"
                  />
                </div>

                {/* Effect button group */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-600">效果强度</span>
                  <div className="flex gap-1 flex-wrap">
                    {[-3, -2, -1, 1, 2, 3].map((eff) => (
                      <button
                        key={eff}
                        type="button"
                        onClick={() => setTagEffect(eff)}
                        className={`w-8 h-7 text-xs font-black border-2 flex items-center justify-center transition-all ${
                          tagEffect === eff 
                            ? "bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_#475569]" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {eff > 0 ? `+${eff}` : eff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleAddTag} 
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#475569] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    记录此标签效果
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddTag(false);
                      setTagName("");
                      setTagDesc("");
                      setTagEffect(1);
                    }} 
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* List of active tags */}
            <div className="bg-white border-2 border-geo-border p-4 min-h-[120px] space-y-4" id="active-tags-box">
              {char.tags && char.tags.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {char.tags.map((t) => (
                    <div 
                      key={t.id} 
                      className={`group/item flex items-start justify-between p-2.5 border-2 transition-all hover:translate-x-0.5 ${
                        t.effect < 0 
                          ? "border-amber-300 bg-amber-50/20" 
                          : "border-green-300 bg-green-50/20"
                      }`}
                    >
                      <div className="space-y-1 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black px-1.5 py-[1.5px] rounded-sm ${
                            t.effect < 0 ? "bg-amber-600 text-white" : "bg-green-600 text-white"
                          }`}>
                            {t.effect > 0 ? `+${t.effect}` : t.effect}
                          </span>
                          <span className="text-xs font-black text-slate-800">{t.name}</span>
                        </div>
                        {t.description && (
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-mono">
                            {t.description}
                          </p>
                        )}
                        
                        {/* Invoked for XP mechanism */}
                        {t.effect < 0 && (
                          <div className="pt-1.5">
                            {t.invokedForXp ? (
                              <span className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                 ★ 已主动陷入此劣势 (+1 XP)
                              </span>
                            ) : (
                              <button
                                onClick={() => invokeTagForXp(t.id)}
                                className="text-[9px] font-bold text-geo-accent border border-geo-accent bg-orange-50/50 hover:bg-geo-accent hover:text-white px-2 py-0.5 transition-colors cursor-pointer"
                                title="在当前掷骰时主动声明受此不利标签阻碍，以此换取 1 点经验值奖励。"
                              >
                                ⚡ 主动陷入此劣势 (+1 XP)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleRemoveTag(t.id)}
                        className="text-slate-300 hover:text-red-600 p-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                        title="删除标签"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] italic text-slate-400 py-8 text-center leading-relaxed">
                  暂无环境标签或事态影响...<br/>
                  四周如死水般寂静。
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action toast system at bottom */}
        {notification && (
          <div className="fixed bottom-6 left-6 z-50 bg-white text-geo-dark text-xs font-bold font-mono px-4 py-3 shadow-[4px_4px_0px_#94a3b8] border-2 border-slate-200 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            {notification}
          </div>
        )}

      </aside>

      {/* Main Panel: Skills Grid */}
      <main className="flex-1 overflow-y-auto bg-white p-10 space-y-10 scroll-smooth">
        {char.endingStatement && (
          <div className="bg-red-50 border-4 border-red-700 p-6 font-serif relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-[6px_6px_0px_#7f1d1d] shrink-0 mb-6">
            <div className="absolute top-0 right-0 p-2 bg-red-700 text-white font-sans font-black text-[9px] uppercase tracking-widest leading-none">
              档案完结
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-red-700 tracking-widest font-sans uppercase block">
                ◆ 该调查档案已结案 ◆
              </span>
              <p className="text-sm text-red-950 italic whitespace-pre-line leading-relaxed pl-4 border-l-2 border-red-600 font-mono">
                “{char.endingStatement}”
              </p>
              <div className="pt-2 flex justify-between items-center flex-wrap gap-2 text-xs">
                <span className="text-red-500 text-[10px] font-mono font-bold">
                  ※ 生命或士气归零，不能进行正常检定。
                </span>
                <button 
                  onClick={() => {
                    if (window.confirm("确认撤销终局并恢复至 1 点生命与士气吗？")) {
                      onUpdate({
                        ...char,
                        health: 1,
                        morale: 1,
                        endingStatement: undefined
                      });
                    }
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white font-black font-sans text-[10px] uppercase tracking-wider py-1.5 px-3 block transition-colors cursor-pointer"
                >
                  推翻该终局记录，重返现世
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unified Dynamic Sub-Tab Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-geo-border pb-6 shrink-0 font-sans">
           <div className="space-y-1">
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900">
               {currentTab === "attributes" && "角色属性与技能"}
               {currentTab === "gear" && "装备与随行药剂"}
               {currentTab === "thoughts" && "思维内阁"}
               {currentTab === "clues" && "案情黑板"}
               {currentTab === "appearance" && "外观与印象"}
             </h1>
             <p className="text-slate-500 font-mono text-sm italic">
               {currentTab === "attributes" && "“在你失忆的废墟上，二十四个细小声音正在窃窃私语。”"}
               {currentTab === "gear" && "“物品弥补肉体的有限。通过化学反应，你与虚空的关联被临时放大或阻扼。”"}
               {currentTab === "thoughts" && "“内化一个新念头是一项极其耗费心灵能量的工程。而那些心智的执念在时刻回荡。”"}
               {currentTab === "clues" && "“每一枚碎片，都是一个未死星辰的引力源。串联它们，让事实重见天日。”"}
               {currentTab === "appearance" && "“外在是内心的折射。你凝视深渊，深渊也同样报以回望。”"}
             </p>
           </div>
           <div className="bg-geo-accent text-white px-4 py-2 font-black text-xs uppercase tracking-widest">
             既视感与认知回路 // {currentTab === "attributes" ? "属性与技能" : currentTab === "gear" ? "行囊配备" : currentTab === "thoughts" ? "思维内阁" : currentTab === "clues" ? "案情拼图" : "外观印象"}
           </div>
        </div>

        {/* Tab Controls inside Dashboard */}
        <div className="flex border-2 border-slate-200 bg-slate-50 p-1 flex-wrap sm:flex-nowrap gap-1 shrink-0 font-sans">
          <button
            onClick={() => setCurrentTab("attributes")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all select-none border-t border-b cursor-pointer text-center ${
              currentTab === "attributes"
                ? "bg-geo-dark text-white border-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            👤 角色属性
          </button>
          <button
            onClick={() => setCurrentTab("gear")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all select-none border-t border-b cursor-pointer text-center ${
              currentTab === "gear"
                ? "bg-geo-dark text-white border-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            🎒 装备与药剂
          </button>
          <button
            onClick={() => setCurrentTab("thoughts")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all select-none border-t border-b cursor-pointer text-center ${
              currentTab === "thoughts"
                ? "bg-geo-dark text-white border-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            🧠 思维内阁
          </button>
          <button
            onClick={() => setCurrentTab("clues")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all select-none border-t border-b cursor-pointer text-center ${
              currentTab === "clues"
                ? "bg-geo-dark text-white border-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            🔎 线索拼图
          </button>
          <button
            onClick={() => setCurrentTab("appearance")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all select-none border-t border-b cursor-pointer text-center ${
              currentTab === "appearance"
                ? "bg-geo-dark text-white border-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            👁️ 外观印象
          </button>
        </div>



        {/* Screen Swappers */}
        <div className="flex-1 w-full relative">

          {/* TAB 1: ATTRIBUTES */}
          {currentTab === "attributes" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 animate-in fade-in duration-200">
          {Object.values(SkillCategory).map(cat => (
            <div key={cat} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">{cat}技能系</h3>
                <div className="h-1 flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {SKILLS.filter(s => s.category === cat).map(skill => {
                  const total = getSkillTotal(skill.id);
                  const natural = char.skills[skill.id] || 0;
                  const mod = total - natural;
                  
                  return (
                    <div key={skill.id} className="flex justify-between items-end border-b-2 border-slate-800 pb-1.5 relative group transition-all hover:bg-slate-50" title={skill.description}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black tracking-tight">{skill.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-slate-500 font-mono">基:{natural}</span>
                          {mod !== 0 && (
                            <span className={`text-[10px] font-black ${mod > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mod > 0 ? `+${mod}` : mod}
                            </span>
                          )}
                        </div>
                        <div className="text-3xl font-black w-8 text-right font-mono text-slate-900">{total}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeSkill(skill.id);
                          }}
                          className={`px-1.5 py-0.5 font-bold text-[9px] tracking-tight uppercase transition-all flex items-center gap-1 cursor-pointer border shadow-sm ${
                            char.xp >= 3 
                              ? "bg-slate-900 hover:bg-slate-700 text-white border-slate-900"
                              : "bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200"
                          }`}
                          title="消耗 3 XP，提升此技能的基础等级 1 点"
                        >
                          升级
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
            </div>
          )}

          {/* TAB 2: INVENTORY & GEARS & DRUGS */}
          {currentTab === "gear" && (
            <div className="space-y-12 pb-20 animate-in fade-in duration-200">
              {/* Active drug state reminder */}
              {char.activeDrugId && (
                <div className="bg-amber-50 border-2 border-amber-300 p-4 mb-6 flex justify-between items-center text-sm font-bold text-amber-800">
                  <div className="flex items-center gap-3">
                    <span className="animate-pulse">🧪</span>
                    <span>当前已经服用 <strong>{[...INITIAL_DRUGS, ...(char.customDrugs || [])].find(d => d.id === char.activeDrugId)?.name}</strong> 且正在生效中。增益效果会在场景结束时消散。</span>
                  </div>
                  <button 
                    onClick={() => {
                      onUpdate({
                        ...char,
                        activeDrugId: null
                      });
                      showNotification("药效已在新场景消散，临时加成结束。");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-black uppercase tracking-tight transition-all rounded animate-bounce shadow-md"
                  >
                    结束场景：清除药效
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <h3 className="text-xl font-black uppercase">随身配备与行囊</h3>
                  <div className="h-0.5 w-16 bg-slate-100 hidden sm:block" />
                </div>
              </div>

              {/* Gears Item Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">
                    —— 随身穿戴装备与工具 (可随时穿戴或卸下生效)
                  </div>
                  <button
                    onClick={openAddGear}
                    className="px-2 py-1 text-[10px] bg-geo-dark hover:bg-slate-700 text-white font-black tracking-tight uppercase flex items-center gap-1 transition-colors rounded-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加自定义装备</span>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {char.gearIds.map(id => {
                    const g = INITIAL_GEAR.find(gear => gear.id === id) || (char.customGears || []).find(gear => gear.id === id);
                    const isActive = char.activeGearIds.includes(id);
                    if (!g) return null;
                    const isCustom = (char.customGears || []).some(cg => cg.id === id);
                    return (
                      <div key={id} className={`flex items-start gap-4 border-b-2 border-slate-200 pb-2 transition-all relative ${isActive ? '' : 'opacity-60 grayscale'}`}>
                        {/* Diamond Checkbox */}
                        <button
                          onClick={() => {
                            const isCurrentlyActive = char.activeGearIds.includes(id);
                            let newActiveGears = [];
                            if (isCurrentlyActive) {
                              newActiveGears = char.activeGearIds.filter(gid => gid !== id);
                            } else {
                              newActiveGears = [...char.activeGearIds, id];
                            }
                            onUpdate({
                              ...char,
                              activeGearIds: newActiveGears
                            });
                            showNotification(isCurrentlyActive ? `🎒 顺利卸下 ${g.name}` : `🥋 成功穿戴/装备 ${g.name}`);
                          }}
                          className={`mt-1.5 shrink-0 w-3.5 h-3.5 border-[1.5px] flex items-center justify-center rotate-45 transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-slate-900 border-slate-900 shadow-[2px_2px_0px_#475569]' 
                              : 'bg-slate-50 border-slate-300 hover:border-slate-500'
                          }`}
                          title={isActive ? "点击卸下" : "点击穿戴"}
                        >
                           {isActive && <div className="w-1.5 h-1.5 bg-white" />}
                        </button>

                        <div className="flex-1 min-w-0 font-sans">
                          <div className="flex items-baseline gap-2">
                            <span className={`font-black text-lg uppercase tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-500 line-through decoration-slate-300'}`}>{g.name}</span>
                            {isCustom && <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 border border-slate-200">自定义</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 italic mt-0.5 leading-relaxed">“{g.description}”</p>
                          <div className="flex flex-wrap gap-2 mt-1.5 font-mono">
                            {(g.modifiers || []).map(m => (
                              <span key={m.skillId} className={`text-[9px] font-bold ${m.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                                {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pt-1.5">
                          {isCustom ? (
                            <>
                              <button onClick={() => openEditGear(g)} className="text-[9px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-tight transition-all">修改</button>
                              <button onClick={() => handleDeleteGear(g.id, g.name)} className="text-[9px] font-bold text-red-300 hover:text-red-600 uppercase tracking-tight transition-all">删除</button>
                            </>
                          ) : (
                            <button onClick={() => handleRemoveGearFromInventory(g.id, g.name)} className="text-[9px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-tight transition-all">弃置</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {char.gearIds.length === 0 && <div className="border-b border-dashed border-slate-200 pb-4 text-slate-400 text-xs italic">行囊中暂无穿戴装备...</div>}
                </div>
              </div>

              {/* Drugs / Medications Grid */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">
                    —— 随身化学药效制剂与精神制剂 (服用后扣减属性并获得限时加成)
                  </div>
                  <button
                    onClick={openAddDrug}
                    className="px-2 py-1 text-[10px] bg-geo-dark hover:bg-slate-700 text-white font-black tracking-tight uppercase flex items-center gap-1 transition-colors rounded-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加自定义药剂</span>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {(char.drugIds || []).map(id => {
                    const drug = INITIAL_DRUGS.find(d => d.id === id) || (char.customDrugs || []).find(d => d.id === id);
                    if (!drug) return null;
                    const isBusyWithOtherDrug = char.activeDrugId !== null;
                    const isCustom = (char.customDrugs || []).some(cd => cd.id === id);
                    
                    return (
                      <div key={id} className="flex items-start gap-4 border-b-2 border-slate-200 pb-2 transition-all relative">
                        <div className="flex-1 min-w-0 font-sans">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-lg uppercase tracking-tight text-slate-900">{drug.name}</span>
                            {isCustom && <span className="text-[8px] bg-purple-50 text-purple-700 px-1 py-0.5 border border-purple-200">自定义</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 italic mt-0.5 leading-relaxed truncate">“{drug.description}”</p>
                          <div className="flex flex-wrap gap-3 mt-1.5 font-mono">
                            <span className="text-[9px] font-bold text-red-600">
                               代: -1 {drug.permStat === "health" ? "HP" : "MO"}
                            </span>
                            {(drug.tempModifiers || []).map(m => (
                              <span key={m.skillId} className={`text-[9px] font-bold ${m.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                                {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pt-1.5">
                          {isCustom ? (
                            <>
                              <button onClick={() => openEditDrug(drug)} className="text-[9px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-tight transition-all">修改</button>
                              <button onClick={() => handleDeleteDrug(drug.id, drug.name)} className="text-[9px] font-bold text-red-300 hover:text-red-600 uppercase tracking-tight transition-all">删除</button>
                            </>
                          ) : (
                            <button onClick={() => handleRemoveDrugFromInventory(drug.id, drug.name)} className="text-[9px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-tight transition-all">弃置</button>
                          )}
                          <button
                            onClick={() => {
                              if (isBusyWithOtherDrug) {
                                showNotification("⚠️ 已有其他药物处于起效状态，必须先结束当前场景、解除前置药效！");
                                return;
                              }
                              
                              // Deduct stats
                              const penalty = drug.permAmount || 1;
                              const nextVal = drug.permStat === "health" ? char.health - penalty : char.morale - penalty;
                              if (nextVal < 0) {
                                showNotification("❌ 你的身体或心理状态已经摇摇欲坠！服用此药物会导致死亡或彻底疯狂，请慎重！");
                                return;
                              }
                              
                              // Update character state
                              const updatedChar = {
                                ...char,
                                health: drug.permStat === "health" ? char.health - penalty : char.health,
                                morale: drug.permStat === "morale" ? char.morale - penalty : char.morale,
                                activeDrugId: drug.id,
                                drugIds: (char.drugIds || []).filter(did => did !== id)
                              };
                              
                              // Check if character dies
                              if (updatedChar.health <= 0 || updatedChar.morale <= 0) {
                                updatedChar.endingStatement = drug.permStat === "health"
                                  ? `在服用“${drug.name}”所带来的化学排毒或致颤效应中，脆弱的身体器官终于宣告衰竭失重...`
                                  : `在服用“${drug.name}”的精神迷幻诱导中，脆弱的理性回路爆发出刺目的极光，心智终堕入不可复原的深渊。`;
                              }
                              
                              onUpdate(updatedChar);
                              showNotification(`🧪 成功服用药物 ${drug.name}！扣减 ${penalty} ${drug.permStat === 'health' ? '健康值' : '士气值'}，信号加成生效。`);
                            }}
                            className="px-2 py-0.5 text-[9px] font-black uppercase tracking-tight transition-all bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm border border-amber-600"
                          >
                            服用
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(char.drugIds || []).length === 0 && (
                    <div className="border-b border-dashed border-slate-200 pb-4 text-slate-400 text-xs italic">
                      行囊中暂无随身储存试剂...
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible System Register Library adding Panel */}
              <div className="border border-slate-200 bg-slate-50/50 p-6 rounded-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">📦 装备与药剂</h4>
                    <p className="text-[10px] text-slate-500 font-sans">调阅并复制系统标准档案或各调查员独立创制的物理装备与生化药剂进入行囊</p>
                  </div>
                  <button 
                    onClick={() => setShowLibraryAddSection(!showLibraryAddSection)}
                    className="px-3 py-1 text-xs border border-slate-350 bg-white hover:bg-slate-100 font-black tracking-tight uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {showLibraryAddSection ? "收起公用库 ▲" : "浏览公用库 ▼"}
                  </button>
                </div>

                {showLibraryAddSection && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Navigation Sub-Tabs */}
                    <div className="flex border-b border-slate-200 gap-2">
                      <button
                        onClick={() => setLibraryTab("standard")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-t-2 pb-1.5 transition-all cursor-pointer ${
                          libraryTab === "standard"
                            ? "border-t-slate-800 border-x border-b-white bg-white text-slate-900 font-black"
                            : "border-t-transparent text-slate-400 hover:text-slate-700 bg-transparent"
                        }`}
                      >
                        📖 系统内置规范库
                      </button>
                      <button
                        onClick={() => setLibraryTab("custom")}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-t-2 pb-1.5 transition-all cursor-pointer ${
                          libraryTab === "custom"
                            ? "border-t-slate-800 border-x border-b-white bg-white text-slate-900 font-black"
                            : "border-t-transparent text-slate-400 hover:text-slate-700 bg-transparent"
                        }`}
                      >
                        🧬 调查员自定义仓库
                      </button>
                    </div>

                    <div className="flex gap-2 max-w-sm">
                      <input 
                        type="text" 
                        placeholder="搜索物品名称/描述/技能修正值..." 
                        value={librarySearchQuery}
                        onChange={(e) => setLibrarySearchQuery(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 focus:outline-none focus:border-slate-800 font-sans bg-white"
                      />
                      {librarySearchQuery && (
                        <button 
                          onClick={() => setLibrarySearchQuery("")} 
                          className="px-2 text-xs border border-transparent text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          清除
                        </button>
                      )}
                    </div>

                    {libraryTab === "standard" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Standard Gears lists */}
                        <div className="space-y-3">
                          <div className="text-xs font-black text-slate-900 border-l-4 border-slate-900 pl-2 uppercase tracking-wider flex items-center justify-between">
                            <span>标准物理装备与随行工具</span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">行囊外存留</span>
                          </div>
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-xs bg-white border border-slate-150 p-3">
                            {INITIAL_GEAR.filter(g => {
                              if (char.gearIds.includes(g.id)) return false;
                              if (!librarySearchQuery) return true;
                              const query = librarySearchQuery.toLowerCase();
                              return g.name.toLowerCase().includes(query) || 
                                     g.description.toLowerCase().includes(query) ||
                                     g.type.toLowerCase().includes(query) ||
                                     g.modifiers.some(m => (SKILLS.find(s => s.id === m.skillId)?.name || "").toLowerCase().includes(query));
                            }).map(g => (
                              <div key={g.id} className="p-2.5 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white flex justify-between items-start gap-4 transition-colors">
                                <div className="flex-1 min-w-0 font-sans">
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <span className="font-black text-slate-850 font-sans">{g.name}</span>
                                    <span className="text-[7px] px-1 py-0.2 border border-slate-200 font-mono text-slate-400 font-bold tracking-tight uppercase">{g.type}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5">“{g.description}”</p>
                                  <div className="flex flex-wrap gap-1 mt-1 font-mono">
                                    {(g.modifiers || []).map(m => (
                                      <span key={m.skillId} className={`text-[8px] px-1 border leading-normal ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                                        {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddGearFromLibrary(g.id)}
                                  className="shrink-0 px-2 py-1 bg-geo-dark hover:bg-slate-700 text-white font-black text-[9px] tracking-tight uppercase cursor-pointer rounded-xs"
                                >
                                  + 放入背包
                                </button>
                              </div>
                            ))}
                            {INITIAL_GEAR.filter(g => !char.gearIds.includes(g.id)).length === 0 && (
                              <div className="text-center text-slate-400 py-6 text-2xs italic">所有系统标准装备已随身携带</div>
                            )}
                          </div>
                        </div>

                        {/* Standard Drugs lists */}
                        <div className="space-y-3">
                          <div className="text-xs font-black text-slate-900 border-l-4 border-amber-600 pl-2 uppercase tracking-wider flex items-center justify-between">
                            <span>标本药剂与生理激奋试剂</span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">行囊外存留</span>
                          </div>
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-xs bg-white border border-slate-150 p-3">
                            {INITIAL_DRUGS.filter(d => {
                              if ((char.drugIds || []).includes(d.id)) return false;
                              if (char.activeDrugId === d.id) return false;
                              if (!librarySearchQuery) return true;
                              const query = librarySearchQuery.toLowerCase();
                              return d.name.toLowerCase().includes(query) || 
                                     d.description.toLowerCase().includes(query) ||
                                     d.tempModifiers.some(m => (SKILLS.find(s => s.id === m.skillId)?.name || "").toLowerCase().includes(query));
                            }).map(d => (
                              <div key={d.id} className="p-2.5 border border-amber-100/50 hover:border-amber-250 bg-amber-50/10 hover:bg-white flex justify-between items-start gap-4 transition-colors">
                                <div className="flex-1 min-w-0 font-sans">
                                  <span className="font-black text-amber-950 font-sans">{d.name}</span>
                                  <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5">“{d.description}”</p>
                                  <div className="text-[8px] text-red-650 font-bold mt-1 font-mono">
                                    ◆ 代价: 扣 1 点 {d.permStat === "health" ? "生命值" : "士气值"}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-0.5 font-mono">
                                    {(d.tempModifiers || []).map(m => (
                                      <span key={m.skillId} className={`text-[8px] px-1 border leading-normal ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                                        {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddDrugFromLibrary(d.id)}
                                  className="shrink-0 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] tracking-tight uppercase cursor-pointer rounded-xs"
                                >
                                  + 供入备包
                                </button>
                              </div>
                            ))}
                            {INITIAL_DRUGS.filter(d => !(char.drugIds || []).includes(d.id) && char.activeDrugId !== d.id).length === 0 && (
                              <div className="text-center text-slate-400 py-6 text-2xs italic">所有系统药剂已被取出或携带完毕</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Custom Gears lists */}
                        <div className="space-y-3">
                          <div className="text-xs font-black text-slate-900 border-l-4 border-slate-900 pl-2 uppercase tracking-wider flex items-center justify-between">
                            <span>调查员自创物理装备</span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">行囊外存留</span>
                          </div>
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-xs bg-white border border-slate-150 p-3">
                            {allSavedCustomGears.filter(item => {
                              const g = item.gear;
                              if (char.gearIds.includes(g.id)) return false;
                              if (!librarySearchQuery) return true;
                              const query = librarySearchQuery.toLowerCase();
                              return g.name.toLowerCase().includes(query) || 
                                     g.description.toLowerCase().includes(query) ||
                                     g.type.toLowerCase().includes(query) ||
                                     g.modifiers.some((m: any) => (SKILLS.find(s => s.id === m.skillId)?.name || "").toLowerCase().includes(query));
                            }).map(item => {
                              const g = item.gear;
                              return (
                                <div key={g.id} className="p-2.5 border border-slate-100 hover:border-slate-200 bg-slate-50/55 hover:bg-white flex justify-between items-start gap-4 transition-colors">
                                  <div className="flex-1 min-w-0 font-sans">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-black text-slate-850 font-sans">{g.name}</span>
                                      <span className="text-[7px] px-1 py-0.2 border border-slate-200 font-mono text-slate-400 font-bold tracking-tight uppercase">{g.type}</span>
                                      <span className="text-[8px] text-purple-700 bg-purple-50 border border-purple-150 px-1 font-semibold rounded-xs font-sans">由 {item.creatorName} 创制</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic leading-snug mt-1">“{g.description}”</p>
                                    <div className="flex flex-wrap gap-1 mt-1 font-mono">
                                      {(g.modifiers || []).map((m: any) => (
                                        <span key={m.skillId} className={`text-[8px] px-1 border leading-normal ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                                          {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCopyCustomGearToInventory(g)}
                                    className="shrink-0 px-2 py-1 bg-geo-dark hover:bg-slate-700 text-white font-black text-[9px] tracking-tight uppercase cursor-pointer rounded-xs whitespace-nowrap"
                                  >
                                    + 调用穿戴
                                  </button>
                                </div>
                              );
                            })}
                            {allSavedCustomGears.filter(item => !char.gearIds.includes(item.gear.id)).length === 0 && (
                              <div className="text-center text-slate-400 py-6 text-2xs italic">无未调用的自定义物理装备</div>
                            )}
                          </div>
                        </div>

                        {/* Custom Drugs lists */}
                        <div className="space-y-3">
                          <div className="text-xs font-black text-slate-900 border-l-4 border-amber-600 pl-2 uppercase tracking-wider flex items-center justify-between">
                            <span>调查员自制化学药剂</span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">行囊外存留</span>
                          </div>
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-xs bg-white border border-slate-150 p-3">
                            {allSavedCustomDrugs.filter(item => {
                              const d = item.drug;
                              if ((char.drugIds || []).includes(d.id)) return false;
                              if (char.activeDrugId === d.id) return false;
                              if (!librarySearchQuery) return true;
                              const query = librarySearchQuery.toLowerCase();
                              return d.name.toLowerCase().includes(query) || 
                                     d.description.toLowerCase().includes(query) ||
                                     d.tempModifiers.some((m: any) => (SKILLS.find(s => s.id === m.skillId)?.name || "").toLowerCase().includes(query));
                            }).map(item => {
                              const d = item.drug;
                              return (
                                <div key={d.id} className="p-2.5 border border-amber-100/50 hover:border-amber-250 bg-amber-50/10 hover:bg-white flex justify-between items-start gap-4 transition-colors">
                                  <div className="flex-1 min-w-0 font-sans">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-black text-amber-950 font-sans">{d.name}</span>
                                      <span className="text-[8px] text-purple-700 bg-purple-50 border border-purple-150 px-1 font-semibold rounded-xs font-sans">由 {item.creatorName} 研制</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic leading-snug mt-1">“{d.description}”</p>
                                    <div className="text-[8px] text-red-650 font-bold mt-1 font-mono">
                                      ◆ 服用代价: 扣 {d.permAmount || 1} 点 {d.permStat === "health" ? "生命值" : "士气值"}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-0.5 font-mono">
                                      {(d.tempModifiers || []).map((m: any) => (
                                        <span key={m.skillId} className={`text-[8px] px-1 border leading-normal ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                                          {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCopyCustomDrugToInventory(d)}
                                    className="shrink-0 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] tracking-tight uppercase cursor-pointer rounded-xs whitespace-nowrap"
                                  >
                                    + 调用携带
                                  </button>
                                </div>
                              );
                            })}
                            {allSavedCustomDrugs.filter(item => !(char.drugIds || []).includes(item.drug.id) && char.activeDrugId !== item.drug.id).length === 0 && (
                              <div className="text-center text-slate-400 py-6 text-2xs italic">无未调用的自定义化学制剂</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THOUGHT CABINET AND INTERJECTIONS monologues */}
          {currentTab === "thoughts" && (
            <div className="space-y-12 pb-20 animate-in fade-in duration-200 font-sans relative overflow-hidden min-h-[600px]">
              {/* WATERMARK */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -rotate-12 opacity-[0.03] z-0 select-none">
                <span className="text-[15rem] font-black uppercase tracking-tighter whitespace-nowrap text-slate-900">INTERNALIZED</span>
              </div>
              
              {/* Row 1: 思维内阁 Thought Cabinet */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                   <h3 className="text-xl font-black uppercase">思维内阁</h3>
                   <div className="h-0.5 flex-1 bg-slate-200" />
                 </div>
               
                 <div className="bg-white border-2 border-slate-200 text-slate-800 p-6 space-y-6 shadow-sm">
                    {/* Thoughts Container rendered in a beautiful grid of cards instead of being vertical and squished */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-1">
                      {(!char.thoughts || char.thoughts.length === 0) ? (
                        <div className="text-[10px] text-slate-400 text-center py-12 border border-slate-200 border-dashed col-span-full">
                           此处本该存放那些<br />令你夜不能寐的新奇念头。<br/>
                           <span className="text-[9px] text-slate-400/70 italic mt-2 block">点击下方按钮注入执念...</span>
                        </div>
                      ) : (
                        char.thoughts.map((thought) => {
                          const isInternalized = thought.internalized;
                          return (
                            <div 
                              key={thought.id} 
                              className={`p-4 border transition-all flex flex-col justify-between ${
                                isInternalized 
                                  ? "bg-amber-50/40 border-amber-400/60 text-slate-850 shadow-[0_2px_8px_rgba(245,158,11,0.08)]" 
                                  : "bg-slate-50/50 border-slate-200 text-slate-800"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isInternalized ? (
                                        <span className="bg-amber-500 text-amber-950 font-black text-[9px] px-1.5 py-[1px] tracking-tight uppercase shadow-sm">
                                          ★ 已内化
                                        </span>
                                      ) : (
                                        <div className="flex items-center gap-1 border border-slate-300 bg-slate-100 px-1.5 py-[1px]">
                                          <span className="text-slate-600 font-bold text-[9px] tracking-tight uppercase">🌀 研究中</span>
                                          <div className="flex items-center gap-0.5 ml-1">
                                            {[1, 2, 3].map(step => (
                                              <button 
                                                key={step}
                                                onClick={() => {
                                                  if (thought.progress < step) handleProgressThought(thought.id);
                                                }}
                                                title="在扮演中推进该思维"
                                                className={`w-2 h-2 rounded-full border border-slate-400 ${thought.progress >= step ? 'bg-amber-400 border-amber-600' : 'bg-transparent hover:bg-slate-300'}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      <span className="text-sm font-black text-slate-900">{thought.name}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleForgetThought(thought.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                    title={isInternalized ? "用新思维取代它" : "抛弃此未内化思维"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-[10px] text-slate-600 font-mono space-y-1 bg-slate-100/65 p-2.5 border border-slate-200 mb-3 w-full">
                                  {thought.trigger && (
                                    <div className="mb-2 pb-1 border-b border-slate-200/60">
                                      <div className="text-slate-800 font-bold mb-0.5">【触发条件】</div>
                                      <p className="italic leading-relaxed text-slate-550 text-[10px]">“{thought.trigger}”</p>
                                    </div>
                                  )}
                                  <div className="text-slate-800 font-bold mb-0.5">【心智难题】</div>
                                  <p className="italic leading-relaxed text-slate-550 text-[10px]">“{thought.problem}”</p>
                                  {isInternalized && thought.conclusion && (
                                    <div className="pt-2 border-t border-slate-150 mt-2 space-y-1 border-dashed">
                                      <div className="text-amber-750 font-bold mb-0.5">【本能结论】</div>
                                      <p className="italic leading-relaxed text-slate-555 text-[10px]">“{thought.conclusion}”</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                {/* Modifiers List */}
                                {(!isInternalized && internalizingThoughtId === thought.id) ? null : (
                                  <div className="flex flex-wrap gap-2 text-[9px] font-bold mb-3">
                                    {thought.modifiers && thought.modifiers.map(m => {
                                      const skillName = SKILLS.find(s => s.id === m.skillId)?.name || m.skillId;
                                      const isPositive = m.amount > 0;
                                      return (
                                        <span 
                                          key={m.skillId} 
                                          className={`px-2 py-0.5 border ${
                                            isInternalized
                                              ? (isPositive ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700")
                                              : "bg-slate-100 border-slate-200 text-slate-400 line-through"
                                          }`}
                                          title={isInternalized ? "修正已激活" : "内化后生效"}
                                        >
                                          {skillName}{isPositive ? `+${m.amount}` : m.amount}
                                        </span>
                                      );
                                    })}
                                    {!isInternalized && (!thought.modifiers || thought.modifiers.length === 0) && (
                                      <span className="text-slate-400 font-mono self-center">(孵化中...结论未定)</span>
                                    )}
                                  </div>
                                )}

                                {/* Actions */}
                                {!isInternalized && (
                                  internalizingThoughtId === thought.id ? (
                                    <div className="mt-3 bg-white p-3 border border-amber-300 shadow-sm space-y-3">
                                      <div className="text-[10px] font-black text-amber-800 uppercase border-b border-amber-200 pb-1">
                                        顿悟：记录神谕结论
                                      </div>
                                      <textarea
                                        placeholder="【本能结论】(一旦想通，你达成了什么顿悟？)"
                                        value={internalizeConclusion}
                                        onChange={(e) => setInternalizeConclusion(e.target.value)}
                                        className="w-full h-16 text-[10px] py-1 px-2 bg-slate-50 text-slate-900 border border-slate-300 outline-none resize-none font-sans focus:border-amber-400"
                                      />
                                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="space-y-1">
                                          <label className="text-emerald-700 uppercase font-black block">加成技能 (+2)</label>
                                          <select value={internalizePlusSkill} onChange={(e) => setInternalizePlusSkill(e.target.value)} className="w-full text-[10px] py-1 bg-white text-slate-900 border border-slate-300 outline-none cursor-pointer focus:border-amber-400">
                                            {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category.slice(0, 2)})</option>)}
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-rose-700 uppercase font-black block">副作用 (-1)</label>
                                          <select value={internalizeMinusSkill} onChange={(e) => setInternalizeMinusSkill(e.target.value)} className="w-full text-[10px] py-1 bg-white text-slate-900 border border-slate-300 outline-none cursor-pointer focus:border-amber-400">
                                            {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category.slice(0, 2)})</option>)}
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                        <button onClick={() => setInternalizingThoughtId(null)} className="flex-1 py-1.5 text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">取消</button>
                                        <button onClick={() => handleInternalizeThoughtSubmit()} className="flex-1 py-1.5 text-[9px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm">消耗 5 XP 确认内化</button>
                                      </div>
                                    </div>
                                  ) : (
                                    thought.progress >= 3 ? (
                                      <button
                                        onClick={() => {
                                          if (!thought.conclusion && (!thought.modifiers || thought.modifiers.length === 0)) {
                                            setInternalizingThoughtId(thought.id);
                                            setInternalizeConclusion("");
                                          } else {
                                            handleDirectInternalize(thought.id);
                                          }
                                        }}
                                        className="w-full py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border bg-amber-500 border-amber-600 hover:bg-amber-400 text-amber-950 shadow-[2px_2px_0px_#78350f]"
                                      >
                                        <Zap className="w-3 h-3" />
                                        <span>执行内化顿悟 (5 XP)</span>
                                      </button>
                                    ) : (
                                      <div className="text-[9px] text-center text-slate-400 py-1.5 border border-dashed border-slate-200 bg-slate-50">
                                        扮演进度尚未达成 ({thought.progress}/3)
                                      </div>
                                    )
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Inject New Thought Form Section */}
                    {showAddThought ? (
                      <div className="max-w-2xl bg-slate-50 border-2 border-slate-200 p-4 space-y-4 animate-in fade-in duration-200 text-slate-800">
                        <div className="text-xs font-black text-amber-700 uppercase tracking-widest border-b border-slate-200 pb-2">
                          思维注入：构建思维执念
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">选择执念思维</label>
                          <select 
                            value={selectedThoughtPreset} 
                            onChange={(e) => setSelectedThoughtPreset(e.target.value)}
                            className="w-full text-xs font-bold py-1.5 px-2 border border-slate-300 bg-white text-slate-900 outline-none cursor-pointer"
                          >
                            {PRESET_THOUGHTS.map(t => (
                              <option key={t.id} value={t.id}>{t.name} (预设)</option>
                            ))}
                            <option value="custom">-- 自定义执念思维 --</option>
                          </select>
                        </div>

                        {selectedThoughtPreset !== "custom" ? (
                          (() => {
                            const preset = PRESET_THOUGHTS.find(t => t.id === selectedThoughtPreset);
                            if (!preset) return null;
                            return (
                              <div className="text-[10px] text-slate-605 font-mono space-y-2 bg-white p-2.5 border border-slate-200">
                                <div><span className="text-slate-800 font-semibold">【疑难题】</span> {preset.problem}</div>
                                <div>
                                  <span className="text-amber-700 font-bold">【影响加成】</span>{" "}
                                  {preset.modifiers.map(m => {
                                    const skillName = SKILLS.find(s => s.id === m.skillId)?.name || m.skillId;
                                    return `${skillName} ${m.amount > 0 ? `+${m.amount}` : m.amount}`;
                                  }).join(", ")}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <input 
                                type="text" 
                                placeholder="思维名称 (如：末日崇愿/孤狼意志)"
                                value={customThoughtName}
                                onChange={(e) => setCustomThoughtName(e.target.value)}
                                className="w-full text-xs font-bold py-1.5 px-2 bg-white text-slate-900 border border-slate-300 outline-none focus:border-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <textarea
                                placeholder="【触发条件】(你是如何遭遇到这个思维的？)"
                                value={customThoughtTrigger}
                                onChange={(e) => setCustomThoughtTrigger(e.target.value)}
                                className="w-full h-12 text-[10px] py-1 px-2 bg-white text-slate-900 border border-slate-300 outline-none resize-none font-sans focus:border-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <textarea
                                placeholder="【思维难题】描述 (你正为什么而苦苦纠结不安)"
                                value={customThoughtProblem}
                                onChange={(e) => setCustomThoughtProblem(e.target.value)}
                                className="w-full h-16 text-[10px] py-1 px-2 bg-white text-slate-900 border border-slate-300 outline-none resize-none font-sans focus:border-slate-800"
                              />
                            </div>
                            <div className="text-[9px] text-slate-400 italic">
                              * 结论与加成项将在该思维研究进度满后，由你在“顿悟”时进行结算。
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleAddThought}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_#78350f]"
                          >
                            筑起此思维之茧
                          </button>
                          <button
                            onClick={() => {
                              setShowAddThought(false);
                            }}
                            className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black cursor-pointer"
                          >
                            放弃
                          </button>
                        </div>
                      </div>
                    ) : (
                      char.thoughts && char.thoughts.length >= 5 ? (
                        <div className="text-center text-rose-600 text-[10px] font-bold border border-rose-200 bg-rose-50 p-3 mt-4">
                          大脑容量已满（5/5）。请先用新思维取代已内化思维，或抛弃未内化的心智纠结。
                        </div>
                      ) : (
                        <button 
                        onClick={() => {
                          setShowAddThought(true);
                          setShowAddState(false);
                        }}
                        className="max-w-xs w-full py-3.5 border-2 border-slate-200 border-dashed hover:border-amber-500 hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>注入新念头...</span>
                      </button>
                      )
                    )}
                 </div>
              </div>

              {/* Row 2: 思维插叙 Mental Monologue log */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                   <h3 className="text-xl font-black uppercase">脑内对话与认知碰撞</h3>
                   <div className="h-0.5 flex-1 bg-slate-200" />
                 </div>
                 
                 <div className="border border-slate-200 bg-white p-1 shadow-sm font-serif">
                    <InterjectionBoard char={char} onUpdate={onUpdate} />
                 </div>
              </div>
            </div>
          )}

          {/* TAB 4: CASE BLACKBOARD & INVESTIGATION CLUES */}
          {currentTab === "clues" && (
            <div className="w-full animate-in fade-in duration-200 relative overflow-hidden min-h-[600px]">
              {/* WATERMARK */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -rotate-12 opacity-[0.03] z-0 select-none">
                <span className="text-[15rem] font-black uppercase tracking-tighter whitespace-nowrap text-slate-900">CLASSIFIED</span>
              </div>
              
               <div className="border border-slate-200 bg-white/95 backdrop-blur-sm p-1 relative z-10">
                 <InvestigationBoard char={char} onUpdate={onUpdate} />
               </div>
            </div>
          )}
          {/* TAB 5: APPEARANCE */}
          {currentTab === "appearance" && (
            <div className="w-full animate-in fade-in duration-200 relative overflow-hidden min-h-[600px] space-y-8">
              {/* WATERMARK */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -rotate-12 opacity-[0.03] z-0 select-none">
                <span className="text-[15rem] font-black uppercase tracking-tighter whitespace-nowrap text-slate-900">IDENTITY</span>
              </div>
              
               <div className="flex items-center gap-4 relative z-10">
                 <h3 className="text-xl font-black uppercase">外观印象</h3>
                 <div className="h-0.5 flex-1 bg-slate-200" />
               </div>

               <div className="border-2 border-slate-200 bg-white p-8 relative z-10 shadow-sm space-y-10">
                 
                 {/* 身份与性格 */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                      <span className="text-sm font-black text-slate-800 tracking-widest uppercase">👤 基础身份与内在</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold text-slate-800">
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">身份/背景</span>
                          <span className="text-lg">{char.appearance?.identity || "未知"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">性别</span>
                          <span className="text-lg">{char.appearance?.gender || "未知"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">主导性格</span>
                          <span className="text-lg">{char.appearance?.personality || "未知"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">标志性特质</span>
                          <span className="text-lg">{char.appearance?.trait1 || "无"} / {char.appearance?.trait2 || "无"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">私人兴趣</span>
                          <span className="text-lg">{char.appearance?.interest || "无"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">怪癖/习惯</span>
                          <span className="text-lg">{char.appearance?.quirk || "无"}</span>
                      </div>
                    </div>
                 </div>

                 {/* 形体与面容 */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                      <span className="text-sm font-black text-slate-800 tracking-widest uppercase">👁️ 形体与面容</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold text-slate-800">
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">体型/轮廓</span>
                          <span className="text-lg">{char.appearance?.bodyType || "未知"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">发型与发色</span>
                          <span className="text-lg">{char.appearance?.hairStyle || "未知"} ({char.appearance?.hairColor || "未知"})</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">瞳色与肤色</span>
                          <span className="text-lg">{char.appearance?.eyeColor || "未知"} / {char.appearance?.skinTone || "未知肤色"}</span>
                      </div>
                      <div className="flex flex-col space-y-2 md:col-span-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">显著身体特征 (伤疤/胎记等)</span>
                          <span className="text-lg">{char.appearance?.feature || "无"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">散发的气场/氛围</span>
                          <span className="text-lg">{char.appearance?.vibe || "难以捉摸"}</span>
                      </div>
                    </div>
                 </div>

                 {/* 着装与配饰 */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                      <span className="text-sm font-black text-slate-800 tracking-widest uppercase">🧥 穿着与配饰</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-bold text-slate-800">
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">着装风格</span>
                          <span className="text-lg">{char.appearance?.clothingStyle || "未知"}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                          <span className="text-slate-400 uppercase text-xs tracking-widest font-black">惯用配饰/标志物</span>
                          <span className="text-lg">{char.appearance?.accessories || "无"}</span>
                      </div>
                    </div>
                 </div>

               </div>
            </div>
          )}
        </div>

        {/* Quick Rules Reference Footer */}
        <div className="mt-16 pt-6 border-t-2 border-slate-900 border-dashed text-slate-500 font-mono text-[10px] leading-relaxed pb-8 shrink-0 animate-in fade-in duration-500">
           <h4 className="font-black text-slate-900 text-xs uppercase mb-3 flex items-center gap-2 tracking-widest">
             <Book className="w-3.5 h-3.5" />
             核心裁定速查 (CORE RULES QUICK REFERENCE)
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div>
               <strong className="text-slate-800 tracking-wider">◆ 技能检定 (CHECKS)</strong><br />
               投掷 2d6 + 技能总值 + 各种修正(装备/药剂/环境等)。<br/>
               若总和 ≥ 难度系数 (通常普通难度为10)，则该动作宣告成功。<br/>
               掷出双6为<span className="text-green-600 font-bold">极致成功</span>，掷出双1为<span className="text-red-600 font-bold">灾难性失败</span>。
             </div>
             <div>
               <strong className="text-slate-800 tracking-wider">◆ 经验与成长 (XP & GROWTH)</strong><br />
               当你主动因“环境标签/线索”的负面效应受阻时，可获得 1点 XP。<br/>
               消耗 3 XP 可在属性面板将任意单项技能的基础等级提升 1 点。<br/>
               消耗 5 XP 可在思维阁执行一次内化顿悟，获得新的人格加成。
             </div>
             <div>
               <strong className="text-slate-800 tracking-wider">◆ 承受损伤 (DAMAGE)</strong><br />
               每当遭遇物理重创或精神摧残，健康/士气减1，并获得一个负面状态。<br/>
               任一维度的状态值归零时，调查员当场倒毙或彻底陷入疯狂。<br/>
               服用特效试剂会强行榨取潜能，永久扣除 1 点机体状态。
             </div>
           </div>
        </div>
      </main>

      {/* Interactive Tragedy / Ending Narrative statement Overlay */}
      <AnimatePresence>
        {activeEndingType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md animate-fade-in" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-950 border-4 border-red-750 p-8 max-w-xl w-full text-slate-100 font-serif space-y-6 shadow-[10px_10px_0px_#7f1d1d] z-[110]"
            >
              <div className="space-y-2 text-center">
                <span className="text-[10px] font-black tracking-widest text-red-500 font-sans block animate-pulse">
                  ☠ 调查宣告落幕 · 系统已重载 ☠
                </span>
                <h4 className="text-3xl font-black text-white italic tracking-tight font-serif text-center">
                  {activeEndingType === "health" ? "物理体征陷入死寂" : "心智防线彻底破灭"}
                </h4>
                <div className="h-0.5 bg-red-900 w-1/3 mx-auto mt-2" />
              </div>

               <div className="text-sm text-slate-300 space-y-3 font-sans leading-relaxed">
                {activeEndingType === "health" ? (
                  <p>
                    调查员 <strong>{char.name}</strong> 的生命值已归零。根据规则，该角色失去行动能力，移出游戏。
                  </p>
                ) : (
                  <p>
                    调查员 <strong>{char.name}</strong> 的士气值已归零。根据规则，该角色精神崩溃，移出游戏。
                  </p>
                )}
                <p className="text-xs text-red-400 font-medium italic animate-pulse">
                  ※ 请记录这一幕发生了什么。
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black font-sans uppercase text-slate-400 tracking-wider">
                  落幕描述与终局叙述:
                </label>
                <textarea
                  className="w-full h-32 p-3 bg-slate-900 border-2 border-red-900/60 text-slate-200 focus:border-red-600 outline-none text-xs font-serif italic leading-relaxed resize-none font-mono"
                  placeholder={
                    activeEndingType === "health" 
                      ? "他倒在了案发现场冰冷的水泥地板上，口袋里还塞着那张写有地址的旧糖纸...（键入或脑补发挥）" 
                      : "他紧攥着那条撕裂的领带，默默推开大门，步入了倾盆暴雨中的茫茫迷雾。他决定去找一份不需要看表、没有高压的工作...（键入或脑补发挥）"
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
                  签署落幕陈述 并封存调查档案
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Gear Modal Dialog */}
        {showGearModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in" onClick={() => setShowGearModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border-4 border-slate-900 p-8 max-w-lg w-full text-slate-800 font-sans space-y-6 shadow-[8px_8px_0px_#1e293b] z-[110] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
                <h4 className="text-xl font-black uppercase tracking-tight">
                  {editingGear ? "🛠️ 修改自定义装备" : "🎒 调制全新自定义装备"}
                </h4>
                <button onClick={() => setShowGearModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">装备或工具名称:</label>
                  <input
                    type="text"
                    value={gearName}
                    onChange={(e) => setGearName(e.target.value)}
                    placeholder="例：沾血的法医解剖刀 / 经典黄色朋克墨镜"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-slate-800 outline-none font-bold"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">装备分类:</label>
                  <div className="flex gap-2">
                    {(["衣物", "工具", "武器"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setGearType(type)}
                        className={`flex-1 py-1.5 font-bold uppercase transition-all border-2 text-center cursor-pointer ${
                          gearType === type
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">外观描述或感官直觉描述 (可选):</label>
                  <textarea
                    value={gearDesc}
                    onChange={(e) => setGearDesc(e.target.value)}
                    placeholder="它冰冷无情地卧在手心，折射着验尸房幽暗的灯光..."
                    className="w-full h-20 p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-slate-800 outline-none resize-none"
                  />
                </div>

                {/* Modifiers List */}
                <div className="space-y-2 border-t border-slate-150 pt-3">
                  <label className="font-bold uppercase text-slate-900 block tracking-wider">🛠️ 修正属性加成或损耗:</label>
                  
                  {/* Current Active Modifiers */}
                  <div className="space-y-1.5">
                    {gearModifiers.map((m) => {
                      const skill = SKILLS.find((s) => s.id === m.skillId);
                      return (
                        <div key={m.skillId} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-xs">
                          <span className="font-bold text-slate-700">
                            {skill?.name || m.skillId} {m.amount > 0 ? `+${m.amount}` : m.amount} 点
                          </span>
                          <button
                            type="button"
                            onClick={() => setGearModifiers(gearModifiers.filter((x) => x.skillId !== m.skillId))}
                            className="text-red-650 hover:text-red-800 font-extrabold uppercase text-[10px] tracking-tight cursor-pointer"
                          >
                            移除
                          </button>
                        </div>
                      );
                    })}
                    {gearModifiers.length === 0 && (
                      <p className="text-2xs italic text-slate-400">目前暂未赋予任何属性加减成，成为普通的白板道具</p>
                    )}
                  </div>

                  {/* Add modifier tool */}
                  <div className="bg-slate-50/70 p-3 border border-dashed border-slate-300 space-y-2 rounded-xs">
                    <span className="block text-[10px] font-black text-slate-500 uppercase">新增修正属性</span>
                    <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                      <select
                        value={currentModSkill}
                        onChange={(e) => setCurrentModSkill(e.target.value)}
                        className="flex-1 p-1.5 border-2 border-slate-200 bg-white focus:outline-none focus:border-slate-800 font-sans cursor-pointer"
                      >
                        {SKILLS.map((sk) => (
                          <option key={sk.id} value={sk.id}>
                            [{sk.category}] {sk.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">幅值:</span>
                        <input
                          type="number"
                          value={currentModAmount}
                          min="-5"
                          max="5"
                          onChange={(e) => setCurrentModAmount(parseInt(e.target.value) || 0)}
                          className="w-14 p-1 border-2 border-slate-200 bg-white text-center font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (gearModifiers.some((gm) => gm.skillId === currentModSkill)) {
                            showNotification("⚠️ 该特定技能已拥有修正值，请先移后再加");
                            return;
                          }
                          setGearModifiers([...gearModifiers, { skillId: currentModSkill, amount: currentModAmount }]);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-700 text-white font-black text-[9px] uppercase tracking-wider cursor-pointer"
                      >
                        + 追加属性
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Save & Close */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGearModal(false)}
                  className="flex-1 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveGear}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-black text-xs uppercase shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 cursor-pointer"
                >
                  确认保存并穿戴
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Drug Modal Dialog */}
        {showDrugModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in" onClick={() => setShowDrugModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border-4 border-slate-900 p-8 max-w-lg w-full text-slate-800 font-sans space-y-6 shadow-[8px_8px_0px_#1e293b] z-[110] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
                <h4 className="text-xl font-black uppercase tracking-tight">
                  {editingDrug ? "🔬 修改自定义药剂及精神试剂" : "🧪 调制或记录全新试剂/药剂"}
                </h4>
                <button onClick={() => setShowDrugModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Drug Name */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">药剂或活性成分名称:</label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="例：极乐狂飙纯度X / 特级香草浓缩安眠酊"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-slate-800 outline-none font-bold text-slate-800"
                  />
                </div>

                {/* Drug duration */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">药效持续时间:</label>
                  <input
                    type="text"
                    value={drugDuration}
                    onChange={(e) => setDrugDuration(e.target.value)}
                    placeholder="例如：当前场景 / 整个调查阶段 / 3轮判定"
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-slate-800 outline-none shadow-xs"
                  />
                </div>

                {/* Drug Description */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-500 block">视觉、嗅觉与心跳反馈描述:</label>
                  <textarea
                    value={drugDesc}
                    onChange={(e) => setDrugDesc(e.target.value)}
                    placeholder="一种淡蓝色的自制吸入剂。吸入瞬间，神经细胞好似在开香槟，但也带来短暂的干呕与耳鸣..."
                    className="w-full h-20 p-2.5 bg-slate-50 border-2 border-slate-300 focus:border-slate-800 outline-none resize-none"
                  />
                </div>

                {/* Active Temporary Modifiers */}
                <div className="space-y-2 border-t border-slate-150 pt-3">
                  <label className="font-bold uppercase text-slate-900 block tracking-wider">🔬 起效期间临时技能加成 (本场景限时生效):</label>
                  
                  <div className="space-y-1.5">
                    {drugTempModifiers.map((m) => {
                      const skill = SKILLS.find((s) => s.id === m.skillId);
                      return (
                        <div key={m.skillId} className="flex items-center justify-between bg-white border border-slate-150 p-2 rounded-xs">
                          <span className="font-bold text-slate-700">
                            {skill?.name || m.skillId} {m.amount > 0 ? `+${m.amount}` : m.amount} 点
                          </span>
                          <button
                            type="button"
                            onClick={() => setDrugTempModifiers(drugTempModifiers.filter((x) => x.skillId !== m.skillId))}
                            className="text-red-650 hover:text-red-800 font-extrabold uppercase text-[10px] tracking-tight cursor-pointer"
                          >
                            移除
                          </button>
                        </div>
                      );
                    })}
                    {drugTempModifiers.length === 0 && (
                      <p className="text-2xs italic text-slate-400">目前暂未添加任何服用后的限时技能增益/损耗</p>
                    )}
                  </div>

                  {/* Add temporary modifier helper */}
                  <div className="bg-slate-50 p-3 border border-dashed border-slate-300 space-y-2 rounded-xs">
                    <span className="block text-[10px] font-black text-slate-500 uppercase">追加服用加成属性</span>
                    <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                      <select
                        value={currentModSkill}
                        onChange={(e) => setCurrentModSkill(e.target.value)}
                        className="flex-1 p-1.5 border-2 border-slate-200 bg-white focus:outline-none focus:border-slate-800 font-sans cursor-pointer"
                      >
                        {SKILLS.map((sk) => (
                          <option key={sk.id} value={sk.id}>
                            [{sk.category}] {sk.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">幅值:</span>
                        <input
                          type="number"
                          value={currentModAmount}
                          min="-5"
                          max="5"
                          onChange={(e) => setCurrentModAmount(parseInt(e.target.value) || 0)}
                          className="w-14 p-1 border-2 border-slate-200 bg-white text-center font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (drugTempModifiers.some((dm) => dm.skillId === currentModSkill)) {
                            showNotification("⚠️ 该技能本就已经存在于药效加成列表中");
                            return;
                          }
                          setDrugTempModifiers([...drugTempModifiers, { skillId: currentModSkill, amount: currentModAmount }]);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-700 text-white font-black text-[9px] uppercase tracking-wider cursor-pointer"
                      >
                        + 增加加成
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permanent drawback setup */}
                <div className="space-y-2 border-t border-slate-150 pt-3">
                  <label className="font-bold uppercase text-red-700 block tracking-wider">☠ 服用代价 (扣减永久体征):</label>
                  <p className="text-[10px] text-slate-500">根据游戏核心设定，所有强力化学或认知药剂在生效瞬间，都会造成不可逆的身体、灵魂或精神承载力损伤。</p>
                  
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 space-y-1">
                      <span className="font-bold text-slate-500 block uppercase font-sans">损伤类型 (Deducted Stat):</span>
                      <select
                        value={drugPermStat}
                        onChange={(e) => setDrugPermStat(e.target.value as any)}
                        className="w-full p-2 border-2 border-slate-200 bg-white focus:outline-none focus:border-slate-800 font-sans cursor-pointer"
                      >
                        <option value="health">生命值 (物理机体衰竭)</option>
                        <option value="morale">士气值 (神经理智崩溃)</option>
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <span className="font-bold text-slate-500 block uppercase font-sans">降低值:</span>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={drugPermAmount}
                        onChange={(e) => setDrugPermAmount(parseInt(e.target.value) || 1)}
                        className="w-full p-1.5 border-2 border-slate-200 bg-white text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save & Close Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDrugModal(false)}
                  className="flex-1 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrug}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-black text-xs uppercase shadow-[3px_3px_0px_#1e293b] active:translate-y-0.5 cursor-pointer"
                >
                  确认调制并携带
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
