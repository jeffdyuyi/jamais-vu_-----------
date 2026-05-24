const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const handleConfirmInternalizeOptionCode = `
  const handleConfirmInternalizeOption = (thoughtId: string, option: any) => {
    if (char.xp < 5) {
      showNotification("⚠️ 经验值不足：内化一项思维需要 5 XP。");
      return;
    }
    
    const updatedThoughts = char.thoughts.map(t => {
      if (t.id === thoughtId) {
        return {
          ...t,
          internalized: true,
          conclusion: option.text,
          modifiers: option.modifiers,
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

    showNotification(\`🌟 顿悟！已消耗 5 XP 将思维结论完美内化，调整值已正式生效。\`);
    setInternalizingThoughtId(null);
  };
`;

content = content.replace(
  'setInternalizeConclusion("");\n  };',
  'setInternalizeConclusion("");\n  };\n' + handleConfirmInternalizeOptionCode
);

const customThoughtUI = `                    {/* Custom Thought Input Fields */}
                    {selectedThoughtPreset === "custom" && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500">执念名称</label>
                          <input
                            type="text"
                            placeholder="如：末日警探"
                            value={customThoughtName}
                            onChange={(e) => setCustomThoughtName(e.target.value)}
                            className="w-full text-xs font-bold py-1.5 px-2 bg-slate-50 text-slate-900 border border-slate-300 outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500">触发条件 (选填)</label>
                          <input
                            type="text"
                            placeholder="如：目睹天空中的奇异云迹"
                            value={customThoughtTrigger}
                            onChange={(e) => setCustomThoughtTrigger(e.target.value)}
                            className="w-full text-[10px] italic py-1.5 px-2 bg-slate-50 text-slate-900 border border-slate-300 outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500">心智难题</label>
                          <textarea
                            placeholder="叙述角色内心反复咀嚼的主题..."
                            value={customThoughtProblem}
                            onChange={(e) => setCustomThoughtProblem(e.target.value)}
                            className="w-full h-16 text-[10px] py-1 px-2 bg-slate-50 text-slate-900 border border-slate-300 outline-none resize-none focus:border-amber-400"
                          />
                        </div>
                        
                        {/* 结论1 */}
                        <div className="space-y-1 bg-amber-50/50 p-2 border border-amber-100">
                          <label className="text-[10px] font-black uppercase text-amber-800">结论 1</label>
                          <textarea
                            placeholder="自然源于经历的推论..."
                            value={customThoughtConclusion1}
                            onChange={(e) => setCustomThoughtConclusion1(e.target.value)}
                            className="w-full h-12 text-[10px] py-1 px-2 bg-white text-slate-900 border border-amber-200 outline-none resize-none focus:border-amber-400"
                          />
                          <div className="grid grid-cols-2 gap-2 text-[9px] mt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-700 font-bold">+2</span>
                              <select value={customThoughtModifier1Plus} onChange={(e) => setCustomThoughtModifier1Plus(e.target.value)} className="w-full text-[9px] py-0.5 bg-white border border-slate-200">
                                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-rose-700 font-bold">-1</span>
                              <select value={customThoughtModifier1Minus} onChange={(e) => setCustomThoughtModifier1Minus(e.target.value)} className="w-full text-[9px] py-0.5 bg-white border border-slate-200">
                                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* 结论2 */}
                        <div className="space-y-1 bg-blue-50/50 p-2 border border-blue-100">
                          <label className="text-[10px] font-black uppercase text-blue-800">结论 2</label>
                          <textarea
                            placeholder="另一种导向意想不到方向的推论..."
                            value={customThoughtConclusion2}
                            onChange={(e) => setCustomThoughtConclusion2(e.target.value)}
                            className="w-full h-12 text-[10px] py-1 px-2 bg-white text-slate-900 border border-blue-200 outline-none resize-none focus:border-blue-400"
                          />
                          <div className="grid grid-cols-2 gap-2 text-[9px] mt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-700 font-bold">+2</span>
                              <select value={customThoughtModifier2Plus} onChange={(e) => setCustomThoughtModifier2Plus(e.target.value)} className="w-full text-[9px] py-0.5 bg-white border border-slate-200">
                                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-rose-700 font-bold">-1</span>
                              <select value={customThoughtModifier2Minus} onChange={(e) => setCustomThoughtModifier2Minus(e.target.value)} className="w-full text-[9px] py-0.5 bg-white border border-slate-200">
                                {SKILLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    )}`;

const oldCustomThoughtUIStart = '{/* Custom Thought Input Fields */}';
const oldCustomThoughtUIEnd = '                  <div className="flex gap-3 pt-2 mt-4">';
const customUIStartIndex = content.indexOf(oldCustomThoughtUIStart);
const customUIEndIndex = content.indexOf(oldCustomThoughtUIEnd);

if (customUIStartIndex !== -1 && customUIEndIndex !== -1) {
  content = content.slice(0, customUIStartIndex) + customThoughtUI + '\n' + content.slice(customUIEndIndex);
}

const internalizationUI = `                                  internalizingThoughtId === thought.id ? (
                                    <div className="mt-3 bg-white p-3 border border-amber-300 shadow-sm space-y-3">
                                      <div className="text-[10px] font-black text-amber-800 uppercase border-b border-amber-200 pb-1 flex justify-between items-center">
                                        <span>顿悟：确定思维结论</span>
                                        <button 
                                          onClick={() => {
                                            const options = thought.options || [];
                                            if (options.length === 0) return;
                                            const randomOpt = options[Math.floor(Math.random() * options.length)];
                                            if (window.confirm(\`神谕判定：命运将你引向了【结论 \${options.indexOf(randomOpt) + 1}】。是否接受？\`)) {
                                              handleConfirmInternalizeOption(thought.id, randomOpt);
                                            }
                                          }}
                                          className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[8px] transition-colors"
                                          title="使用神谕表随机决定"
                                        >
                                          🎲 投掷神谕决定
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 gap-2">
                                        {(thought.options || []).map((opt, idx) => (
                                          <div 
                                            key={idx} 
                                            className="p-2 border border-slate-200 bg-slate-50 hover:border-amber-400 cursor-pointer transition-colors" 
                                            onClick={() => {
                                              if (window.confirm(\`确定要消耗 5 XP 将此结论内化吗？\`)) {
                                                handleConfirmInternalizeOption(thought.id, opt);
                                              }
                                            }}
                                          >
                                            <div className="text-[10px] font-bold text-slate-800 mb-1">结论 {idx + 1}</div>
                                            <p className="text-[9px] text-slate-600 italic leading-relaxed mb-1">“{opt.text}”</p>
                                            <div className="flex flex-wrap gap-1 mt-1 font-mono">
                                              {opt.modifiers.map(m => (
                                                <span key={m.skillId} className={\`text-[8px] px-1 border \${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}\`}>
                                                  {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? \`+\${m.amount}\` : m.amount}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <button onClick={() => setInternalizingThoughtId(null)} className="w-full py-1.5 text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors mt-2">取消</button>
                                    </div>
                                  )`;

const oldInternalizationStart = '                                  internalizingThoughtId === thought.id ? (';
const oldInternalizationEnd = '                                    thought.progress >= 3 ? (';
const intStartIndex = content.indexOf(oldInternalizationStart);
const intEndIndex = content.indexOf(oldInternalizationEnd, intStartIndex);

if (intStartIndex !== -1 && intEndIndex !== -1) {
  content = content.slice(0, intStartIndex) + internalizationUI + '\n                                  : (\n' + content.slice(intEndIndex);
}

fs.writeFileSync(file, content);
console.log('Replaced Dashboard UI logic');
