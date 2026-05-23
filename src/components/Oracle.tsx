import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dice5, BookOpen, User, Map, Search, 
  HelpCircle, Shuffle, ChevronDown
} from "lucide-react";
import * as OracleData from "../data/oracleData";

type Section = "yesno" | "action" | "character" | "location" | "investigation";

// Helper Dice Functions
const roll1d6 = () => Math.floor(Math.random() * 6) + 1;
const roll2d6 = () => roll1d6() + roll1d6();
const rollD66 = () => roll1d6() * 10 + roll1d6();

export default function Oracle() {
  const [activeSection, setActiveSection] = useState<Section>("yesno");
  
  // Section States
  const [yesNoProb, setYesNoProb] = useState(2); // index in YES_NO_RATES
  const [yesNoResult, setYesNoResult] = useState<{ text: string, type: "yes"|"no"|"absYes"|"absNo", value: number } | null>(null);
  
  const [actionResult, setActionResult] = useState<{ action1: string, action2: string, obj1: string, obj2: string, value: number } | null>(null);
  const [twistResult, setTwistResult] = useState<{ value: number, text: string }[] | null>(null);

  const [charResult, setCharResult] = useState<any>(null);
  const [gearResult, setGearResult] = useState<{ value: number, texts: string[] } | null>(null);

  const [envResult, setEnvResult] = useState<any>(null);
  const [invResult, setInvResult] = useState<any>(null);

  const [isRolling, setIsRolling] = useState(false);

  // Play a brief rolling effect
  const handleRollEffect = (callback: () => void) => {
    setIsRolling(true);
    setTimeout(() => {
      callback();
      setIsRolling(false);
    }, 300);
  };

  // --- Handlers ---
  const rollYesNo = () => {
    handleRollEffect(() => {
      const val = roll2d6();
      const rate = OracleData.YES_NO_RATES[yesNoProb];
      let type: "yes"|"no"|"absYes"|"absNo" = "no";
      let text = "";
      
      if (val >= rate.absNegative[0] && val <= rate.absNegative[1]) { type = "absNo"; text = "绝对否定"; }
      else if (val >= rate.negative[0] && val <= rate.negative[1]) { type = "no"; text = "否"; }
      else if (val >= rate.min[0] && val <= rate.min[1]) { type = "yes"; text = "是"; }
      else if (val >= rate.max[0] && val <= rate.max[1]) { type = "absYes"; text = "绝对肯定"; }
      else { text = "否"; } // Fallback, shouldn't happen based on table

      setYesNoResult({ text, type, value: val });
    });
  };

  const rollAction = () => {
    handleRollEffect(() => {
      const val = rollD66();
      const row = OracleData.ACTION_MATRIX[val];
      if (row) {
        setActionResult({ value: val, action1: row[0], action2: row[1], obj1: row[2], obj2: row[3] });
      }
    });
  };

  const rollTwist = () => {
    handleRollEffect(() => {
      let results: { value: number, text: string }[] = [];
      const d1 = rollD66();
      
      // Handle the reroll twice twist
      if (d1 === 65 || d1 === 66) {
        let r1 = rollD66(); while(r1 >= 65) r1 = rollD66();
        let r2 = rollD66(); while(r2 >= 65) r2 = rollD66();
        
        const k1 = Object.keys(OracleData.TWIST_TABLE).find(k => {
          const [min, max] = k.split("-").map(Number);
          return r1 >= min && r1 <= max;
        });
        const k2 = Object.keys(OracleData.TWIST_TABLE).find(k => {
          const [min, max] = k.split("-").map(Number);
          return r2 >= min && r2 <= max;
        });
        
        results.push({ value: d1, text: "触发连环转折！" });
        if (k1) results.push({ value: r1, text: OracleData.TWIST_TABLE[k1] });
        if (k2) results.push({ value: r2, text: OracleData.TWIST_TABLE[k2] });
      } else {
        const key = Object.keys(OracleData.TWIST_TABLE).find(k => {
          const [min, max] = k.split("-").map(Number);
          return d1 >= min && d1 <= max;
        });
        if (key) results.push({ value: d1, text: OracleData.TWIST_TABLE[key] });
      }
      setTwistResult(results);
    });
  };

  const rollCharacter = () => {
    handleRollEffect(() => {
      const genderIdx = roll1d6() - 1;
      const idIdx = roll1d6() - 1;
      
      const persVal = roll2d6();
      let pers = "中立";
      if (persVal <= 4) pers = "敌对";
      else if (persVal <= 6) pers = "谨慎";
      else if (persVal <= 8) pers = "中立";
      else if (persVal <= 10) pers = "友善";
      else pers = "友好";

      const appVal = rollD66();
      const appRow = Math.floor(appVal / 10) - 1;
      const appCol = (appVal % 10) - 1;
      const appearanceStr = OracleData.CHAR_APPEARANCE_GRID[appRow] && OracleData.CHAR_APPEARANCE_GRID[appRow][appCol] ? OracleData.CHAR_APPEARANCE_GRID[appRow][appCol] : "";

      const traitsVal = rollD66();
      const traitKey = Object.keys(OracleData.CHAR_TRAITS).find(k => {
        const min = parseInt(k);
        return traitsVal === min || traitsVal === min + 1;
      });
      const traits = traitKey ? OracleData.CHAR_TRAITS[parseInt(traitKey)] : ["未知", "未知", "未知", "未知"];

      const attRow = roll1d6() - 1;
      const attCol = roll1d6() - 1;
      const focusRow = roll1d6() - 1;
      const voiceRow = roll1d6() - 1;
      const nameVal = rollD66();
      const nameRow = roll1d6() - 1;

      let nameSource = OracleData.NAMES_NEUTRAL;
      if (genderIdx < 2) nameSource = OracleData.NAMES_FEMALE;
      if (genderIdx > 3) nameSource = OracleData.NAMES_MALE;

      setCharResult({
        gender: OracleData.CHAR_GENDER[genderIdx],
        identity: OracleData.CHAR_IDENTITY[idIdx],
        personality: pers,
        appearance: appearanceStr,
        traits,
        attitude: OracleData.DIALOG_ATTITUDE[attRow][attCol],
        focus: OracleData.DIALOG_FOCUS[focusRow][attCol],
        voice: OracleData.VOICE_STYLE[voiceRow][attCol],
        nameList: nameSource[nameRow],
        rawVal: { gender: genderIdx+1, identity: idIdx+1, personality: persVal, appearance: appVal, traits: traitsVal, name: nameRow+1 }
      });
    });
  };

  const rollGear = () => {
    handleRollEffect(() => {
      const val = rollD66();
      const key = Object.keys(OracleData.GEAR_TABLE).find(k => {
        const min = parseInt(k);
        return val === min || val === min + 1;
      });
      if (key) {
        setGearResult({ value: val, texts: OracleData.GEAR_TABLE[parseInt(key)] });
      }
    });
  };

  const rollEnvironment = () => {
    handleRollEffect(() => {
      const rCity = roll1d6() - 1;
      const rDist1 = roll1d6() - 1; const rDist2 = roll1d6() - 1;
      const rStreet = roll1d6() - 1;
      const rBldg1 = Math.floor((roll1d6() - 1) / 2); // 3 rows
      const rBldg2 = roll1d6() - 1; // 6 cols
      const rMat = roll1d6() - 1;
      const rEnt = roll1d6() - 1;
      const rInt = roll1d6() - 1;

      setEnvResult({
        city: OracleData.ENV_CITY_PROB[rCity],
        district: OracleData.ENV_DISTRICT[rDist1][rDist2],
        street: OracleData.ENV_STREET[rStreet],
        building: OracleData.ENV_BUILDING_USE[rBldg1][rBldg2],
        material: OracleData.ENV_BUILDING_MAT[rMat],
        entrance: OracleData.ENV_BUILDING_ENTRANCE[rEnt],
        interior: OracleData.ENV_INTERIOR[rInt],
        vals: { city: rCity+1, dist1: rDist1+1, dist2: rDist2+1, street: rStreet+1, bldg1: rBldg1+1, bldg2: rBldg2+1, mat: rMat+1, ent: rEnt+1, int: rInt+1 }
      });
    });
  };

  const rollInvestigation = () => {
    handleRollEffect(() => {
      const r1 = roll1d6() - 1; const r2 = roll1d6() - 1;
      
      setInvResult({
        caseType: OracleData.INV_CASE[r1 % 3][r2], // 3 rows, 6 cols
        victim: OracleData.INV_VICTIM[r1 % 2][r2],
        key: OracleData.INV_CLUE_KEY[r1 % 2][r2],
        memo: OracleData.INV_CLUE_MEMO[r1 % 2][r2],
        anomaly: OracleData.INV_CLUE_ANOMALY[r1 % 2][r2],
        motive: OracleData.INV_CLUE_MOTIVE[r1 % 2][r2],
        trace: OracleData.INV_CLUE_TRACE[r1 % 2][r2],
        intuitMemo: OracleData.INV_INTUIT_MEMO[r1 % 2][r2],
        intuitLoc: OracleData.INV_INTUIT_LOC[r1 % 2][r2],
        intuitMethod: OracleData.INV_INTUIT_METHOD[r1 % 2][r2],
        intuitMotive: OracleData.INV_INTUIT_MOTIVE[r1 % 2][r2],
        intuitOpp: OracleData.INV_INTUIT_OPPORTUNITY[r1 % 2][r2],
        intuitSuspect: OracleData.INV_INTUIT_SUSPECT[r1 % 2][r2],
        intuitWitness: OracleData.INV_INTUIT_WITNESS[r1 % 2][r2],
        vals: { r1: r1+1, r2: r2+1 }
      });
    });
  };

  const NavButton = ({ id, icon: Icon, label }: { id: Section, icon: any, label: string }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-black tracking-widest uppercase transition-all whitespace-nowrap border-r border-slate-200 cursor-pointer ${
        activeSection === id ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col font-sans select-none">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
              GM 工具台
            </span>
            <span className="text-slate-500 font-mono text-xs">◆ 神谕表交互系统</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
            旧事如新 / 神谕
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-serif italic max-w-sm text-right leading-relaxed">
          “神谕表本质上是激发想象力的工具，在卡壳时为你提供灵感的火花。”
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto border-b-2 border-slate-900 bg-white shrink-0 custom-scrollbar">
        <NavButton id="yesno" icon={HelpCircle} label="是/否问题判定" />
        <NavButton id="action" icon={Shuffle} label="灵感与转折" />
        <NavButton id="character" icon={User} label="角色NPC生成器" />
        <NavButton id="location" icon={Map} label="地点环境发生器" />
        <NavButton id="investigation" icon={Search} label="案件与线索池" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* SECTION 1: YES/NO */}
            {activeSection === "yesno" && (
              <motion.div
                key="yesno"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-2 border-slate-900 bg-white p-6 md:p-10 shadow-[8px_8px_0px_#0f172a]">
                  <h3 className="text-xl font-black uppercase mb-2 border-b-2 border-slate-100 pb-4">是/否问题判定 (2d6)</h3>
                  <p className="text-sm text-slate-500 font-serif mb-6 leading-relaxed">
                    当你产生某个灵感却不确定它是否会在故事中发生，或在两个选项间举棋不定时，选择一个概率并投掷。绝对肯定或绝对否定意味着事件朝着极端方向发展。
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">事件发生概率设定：</label>
                    <select 
                      value={yesNoProb}
                      onChange={(e) => setYesNoProb(Number(e.target.value))}
                      className="w-full sm:w-auto text-sm font-bold p-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 outline-none cursor-pointer font-sans"
                    >
                      {OracleData.YES_NO_RATES.map((rate, idx) => (
                        <option key={idx} value={idx}>{rate.label}</option>
                      ))}
                    </select>
                    <button 
                      onClick={rollYesNo}
                      className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Dice5 className="w-5 h-5" />
                      掷骰判定
                    </button>
                  </div>

                  {yesNoResult && (
                    <div className={`p-8 border-4 text-center transition-all duration-300 ${isRolling ? "opacity-30 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"} ${
                      yesNoResult.type === "yes" ? "border-emerald-500 bg-emerald-50 text-emerald-800" :
                      yesNoResult.type === "no" ? "border-rose-500 bg-rose-50 text-rose-800" :
                      yesNoResult.type === "absYes" ? "border-emerald-700 bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]" :
                      "border-rose-800 bg-rose-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                    }`}>
                      <div className="text-xs font-mono font-bold mb-2 opacity-80 uppercase tracking-widest">
                        2d6 Result: [{yesNoResult.value}]
                      </div>
                      <div className="text-4xl md:text-6xl font-black tracking-tighter">
                        {yesNoResult.text}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION 2: ACTION & TWISTS */}
            {activeSection === "action" && (
              <motion.div
                key="action"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Actions */}
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a] flex flex-col">
                  <h3 className="text-lg font-black uppercase mb-2 border-b-2 border-slate-100 pb-4">行动与对象 (D66)</h3>
                  <p className="text-xs text-slate-500 font-serif mb-6 leading-relaxed">
                    提供两个行动和两个对象词汇，用于快速拼凑出一个事件的动机或行为描述。
                  </p>
                  
                  <button 
                    onClick={rollAction}
                    className="w-full mb-6 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Dice5 className="w-5 h-5" />
                    获取行动灵感
                  </button>

                  {actionResult && (
                    <div className={`flex-1 p-6 border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col justify-center transition-all duration-300 ${isRolling ? "opacity-30 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}>
                      <div className="text-[10px] font-mono text-slate-400 font-bold mb-4 text-center uppercase tracking-widest">D66: {actionResult.value}</div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-[10px] uppercase font-black text-slate-500 mb-1">行动 I</div>
                          <div className="text-xl font-bold text-slate-800">{actionResult.action1}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-black text-slate-500 mb-1">对象 I</div>
                          <div className="text-xl font-bold text-slate-800">{actionResult.obj1}</div>
                        </div>
                        <div className="col-span-2 my-2 border-b border-slate-200"></div>
                        <div>
                          <div className="text-[10px] uppercase font-black text-slate-500 mb-1">行动 II</div>
                          <div className="text-xl font-bold text-slate-800">{actionResult.action2}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-black text-slate-500 mb-1">对象 II</div>
                          <div className="text-xl font-bold text-slate-800">{actionResult.obj2}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Twists */}
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a] flex flex-col">
                  <h3 className="text-lg font-black uppercase mb-2 border-b-2 border-slate-100 pb-4">转折 (D66)</h3>
                  <p className="text-xs text-slate-500 font-serif mb-6 leading-relaxed">
                    当剧情需要一点出人意料的惊喜或惊吓时，掷骰决定接下来的剧情转折。
                  </p>
                  
                  <button 
                    onClick={rollTwist}
                    className="w-full mb-6 px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Dice5 className="w-5 h-5" />
                    引发剧情转折
                  </button>

                  {twistResult && (
                    <div className={`flex-1 p-6 border-2 border-red-200 bg-red-50 flex flex-col justify-center transition-all duration-300 ${isRolling ? "opacity-30 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}>
                      {twistResult.map((res, i) => (
                        <div key={i} className="mb-4 last:mb-0 text-center">
                          <div className="text-[10px] font-mono text-red-400 font-bold mb-1 uppercase tracking-widest">D66: {res.value}</div>
                          <div className={`text-lg font-black ${i === 0 && res.value >= 65 ? "text-red-700 underline underline-offset-4" : "text-slate-800"}`}>
                            {res.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION 3: CHARACTER & GEAR */}
            {activeSection === "character" && (
              <motion.div
                key="character"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black uppercase mb-1">NPC / 角色瞬间生成器</h3>
                      <p className="text-xs text-slate-500 font-serif">一键生成外貌、性格、特质与对话态度。</p>
                    </div>
                    <button 
                      onClick={rollCharacter}
                      className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Dice5 className="w-5 h-5" />
                      生成全套设定
                    </button>
                  </div>

                  {charResult && (
                    <div className={`transition-all duration-300 ${isRolling ? "opacity-30 blur-sm" : "opacity-100 blur-0"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Basic Info */}
                        <div className="bg-slate-50 p-4 border border-slate-200">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">身份标签</div>
                           <div className="space-y-2">
                             <div className="flex justify-between border-b border-slate-200 pb-1">
                               <span className="text-xs font-bold text-slate-500">称呼 (1d6)</span>
                               <span className="text-sm font-black text-slate-800 text-right">{charResult.nameList}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-200 pb-1">
                               <span className="text-xs font-bold text-slate-500">性别 (1d6:{charResult.rawVal.gender})</span>
                               <span className="text-sm font-black text-slate-800">{charResult.gender}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-200 pb-1">
                               <span className="text-xs font-bold text-slate-500">身份 (1d6:{charResult.rawVal.identity})</span>
                               <span className="text-sm font-black text-slate-800">{charResult.identity}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-200 pb-1">
                               <span className="text-xs font-bold text-slate-500">基础性格 (2d6:{charResult.rawVal.personality})</span>
                               <span className="text-sm font-black text-slate-800">{charResult.personality}</span>
                             </div>
                           </div>
                        </div>

                        {/* Traits */}
                        <div className="bg-slate-50 p-4 border border-slate-200">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">特质与兴趣 (D66: {charResult.rawVal.traits})</div>
                           <div className="grid grid-cols-2 gap-2 text-center">
                             <div className="bg-white p-2 border border-slate-200">
                               <div className="text-[9px] text-slate-400 mb-1">特质 I</div>
                               <div className="text-sm font-bold text-slate-800">{charResult.traits[0]}</div>
                             </div>
                             <div className="bg-white p-2 border border-slate-200">
                               <div className="text-[9px] text-slate-400 mb-1">特质 II</div>
                               <div className="text-sm font-bold text-slate-800">{charResult.traits[1]}</div>
                             </div>
                             <div className="bg-white p-2 border border-slate-200">
                               <div className="text-[9px] text-slate-400 mb-1">私人兴趣</div>
                               <div className="text-sm font-bold text-slate-800">{charResult.traits[2]}</div>
                             </div>
                             <div className="bg-white p-2 border border-slate-200">
                               <div className="text-[9px] text-slate-400 mb-1">怪癖</div>
                               <div className="text-sm font-bold text-slate-800">{charResult.traits[3]}</div>
                             </div>
                           </div>
                        </div>

                        {/* Dialog & Style */}
                        <div className="bg-slate-50 p-4 border border-slate-200">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">交涉表现 (矩阵投影)</div>
                           <div className="space-y-3">
                             <div>
                               <div className="text-xs font-bold text-slate-500 mb-0.5">对话态度</div>
                               <div className="text-sm font-black text-slate-800 bg-white p-1.5 border border-slate-200">{charResult.attitude}</div>
                             </div>
                             <div>
                               <div className="text-xs font-bold text-slate-500 mb-0.5">对话焦点</div>
                               <div className="text-sm font-black text-slate-800 bg-white p-1.5 border border-slate-200">{charResult.focus}</div>
                             </div>
                             <div className="flex justify-between items-center bg-white p-2 border border-slate-200 mt-2">
                               <span className="text-xs font-bold text-slate-500">外貌词条 (D66:{charResult.rawVal.appearance})</span>
                               <span className="text-sm font-black text-slate-800">{charResult.appearance}</span>
                             </div>
                           </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Gear Table */}
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black uppercase mb-1">装备与掉落物 (D66)</h3>
                      <p className="text-xs text-slate-500 font-serif">快速生成目标的穿着、配饰与随身工具。</p>
                    </div>
                    <button 
                      onClick={rollGear}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Dice5 className="w-5 h-5" />
                      搜身 / 掉落
                    </button>
                  </div>

                  {gearResult && (
                    <div className={`transition-all duration-300 ${isRolling ? "opacity-30 blur-sm" : "opacity-100 blur-0"}`}>
                      <div className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50">
                        <div className="text-xs font-mono font-bold text-amber-700 border-r border-amber-200 pr-4 uppercase tracking-widest">
                          D66:<br/><span className="text-xl">{gearResult.value}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-[10px] text-amber-600 uppercase font-black tracking-widest mb-1">服装</div>
                            <div className="text-base font-bold text-amber-950">{gearResult.texts[0]}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-amber-600 uppercase font-black tracking-widest mb-1">配饰</div>
                            <div className="text-base font-bold text-amber-950">{gearResult.texts[1]}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-amber-600 uppercase font-black tracking-widest mb-1">工具/武器</div>
                            <div className="text-base font-bold text-amber-950">{gearResult.texts[2]}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION 4: LOCATION */}
            {activeSection === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black uppercase mb-1">地点与环境渲染器</h3>
                      <p className="text-xs text-slate-500 font-serif">快速构建充满黑色电影氛围的调查现场环境细节。</p>
                    </div>
                    <button 
                      onClick={rollEnvironment}
                      className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Dice5 className="w-5 h-5" />
                      构建场景环境
                    </button>
                  </div>

                  {envResult && (
                    <div className={`transition-all duration-300 ${isRolling ? "opacity-30 blur-sm" : "opacity-100 blur-0"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 border border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">宏观环境</span>
                            <div className="text-sm font-bold text-slate-700 mb-1">
                              【城市暗流】 <span className="text-slate-900">{envResult.city}</span> <span className="text-[10px] text-slate-400 font-normal">(1d6: {envResult.vals.city})</span>
                            </div>
                            <div className="text-sm font-bold text-slate-700">
                              【所处街区】 <span className="text-slate-900">{envResult.district}</span> <span className="text-[10px] text-slate-400 font-normal">(2d6)</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 border border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">街道氛围感 (1d6: {envResult.vals.street})</span>
                            <div className="text-sm font-bold text-slate-900 leading-relaxed font-serif">
                              “{envResult.street}”
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 border border-slate-200 h-full">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">建筑内景实体</span>
                            <ul className="space-y-3">
                              <li className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-xs font-bold text-slate-500">建筑类型</span>
                                <span className="text-sm font-black text-slate-800">{envResult.building}</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-xs font-bold text-slate-500">主体材质</span>
                                <span className="text-sm font-black text-slate-800">{envResult.material}</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-xs font-bold text-slate-500">出入管制</span>
                                <span className="text-sm font-black text-slate-800">{envResult.entrance}</span>
                              </li>
                              <li className="pt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">内部直观印象</span>
                                <span className="text-sm font-bold text-slate-900 font-serif leading-relaxed block">“{envResult.interior}”</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION 5: INVESTIGATION */}
            {activeSection === "investigation" && (
              <motion.div
                key="investigation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_#0f172a]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black uppercase mb-1">案件与线索池 (全部 2d6)</h3>
                      <p className="text-xs text-slate-500 font-serif">一次性从庞大的案件库中抽取所有必需的案情元素与潜意识直觉。</p>
                    </div>
                    <button 
                      onClick={rollInvestigation}
                      className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-black uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Dice5 className="w-5 h-5" />
                      洞悉案情全貌
                    </button>
                  </div>

                  {invResult && (
                    <div className={`transition-all duration-300 ${isRolling ? "opacity-30 blur-sm" : "opacity-100 blur-0"}`}>
                      
                      <div className="mb-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                        本轮查表坐标骰值 (2d6): 行 {invResult.vals.r1}, 列 {invResult.vals.r2}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* 左侧：实体线索 */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-900 pb-2">现场与实体线索</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">案件基调</div>
                               <div className="text-base font-black text-slate-800">{invResult.caseType}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">受害者类型</div>
                               <div className="text-base font-black text-slate-800">{invResult.victim}</div>
                             </div>
                             <div className="bg-purple-50 p-3 border border-purple-200 col-span-2">
                               <div className="text-[10px] text-purple-600 font-black tracking-widest uppercase mb-1">关键线索: 钥匙</div>
                               <div className="text-base font-bold text-purple-900">{invResult.key}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">遗留痕迹</div>
                               <div className="text-sm font-bold text-slate-800">{invResult.trace}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">诡异异常</div>
                               <div className="text-sm font-bold text-slate-800">{invResult.anomaly}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">表面动机</div>
                               <div className="text-sm font-bold text-slate-800">{invResult.motive}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">回忆残片</div>
                               <div className="text-sm font-bold text-slate-800">{invResult.memo}</div>
                             </div>
                          </div>
                        </div>

                        {/* 右侧：思维直觉 */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-black text-slate-800 uppercase border-b-2 border-slate-900 pb-2">潜意识与直觉猜测</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-amber-50 p-3 border border-amber-200 col-span-2">
                               <div className="text-[10px] text-amber-700 font-black tracking-widest uppercase mb-1">潜意识记忆追溯</div>
                               <div className="text-base font-bold text-amber-900">{invResult.intuitMemo}</div>
                             </div>
                             
                             <div className="bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">涉案地点猜测</div>
                               <div className="text-sm font-bold text-slate-800 text-right">{invResult.intuitLoc}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">作案手段猜测</div>
                               <div className="text-sm font-bold text-slate-800 text-right">{invResult.intuitMethod}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">深层动机猜测</div>
                               <div className="text-sm font-bold text-slate-800 text-right">{invResult.intuitMotive}</div>
                             </div>
                             <div className="bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
                               <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">作案时机猜测</div>
                               <div className="text-sm font-bold text-slate-800 text-right">{invResult.intuitOpp}</div>
                             </div>
                             <div className="bg-rose-50 p-3 border border-rose-200 flex flex-col justify-between">
                               <div className="text-[10px] text-rose-500 font-bold uppercase mb-1">嫌疑人画像</div>
                               <div className="text-sm font-bold text-rose-900 text-right">{invResult.intuitSuspect}</div>
                             </div>
                             <div className="bg-blue-50 p-3 border border-blue-200 flex flex-col justify-between">
                               <div className="text-[10px] text-blue-500 font-bold uppercase mb-1">目击者特质</div>
                               <div className="text-sm font-bold text-blue-900 text-right">{invResult.intuitWitness}</div>
                             </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
