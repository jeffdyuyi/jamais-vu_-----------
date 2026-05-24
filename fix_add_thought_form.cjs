const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const newUI = `                        {selectedThoughtPreset !== "custom" ? (
                          (() => {
                            const preset = PRESET_THOUGHTS.find(t => t.id === selectedThoughtPreset);
                            if (!preset) return null;
                            return (
                              <div className="text-[10px] text-slate-605 font-mono space-y-2 bg-white p-2.5 border border-slate-200">
                                <div><span className="text-slate-800 font-semibold">【疑难题】</span> {preset.problem}</div>
                                {preset.options && preset.options.map((opt, idx) => (
                                  <div key={idx} className="pt-2 border-t border-slate-100">
                                    <span className="text-amber-700 font-bold">【结论 \${idx + 1}】</span> {opt.text}
                                    <div className="mt-1">
                                      <span className="text-slate-500 font-bold">【效果 \${idx + 1}】</span>{" "}
                                      {opt.modifiers.map(m => {
                                        const skillName = SKILLS.find(s => s.id === m.skillId)?.name || m.skillId;
                                        return \`\${skillName} \${m.amount > 0 ? \`+\${m.amount}\` : m.amount}\`;
                                      }).join(", ")}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-3 pt-3 border-t border-slate-200">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-500">名称</label>
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
                              <label className="text-[10px] font-black uppercase text-slate-500">问题</label>
                              <textarea
                                placeholder="叙述角色内心反复咀嚼的主题..."
                                value={customThoughtProblem}
                                onChange={(e) => setCustomThoughtProblem(e.target.value)}
                                className="w-full h-16 text-[10px] py-1 px-2 bg-slate-50 text-slate-900 border border-slate-300 outline-none resize-none focus:border-amber-400"
                              />
                            </div>
                            
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

const startSearch = '{selectedThoughtPreset !== "custom" ? (';
const endSearch = '<div className="flex gap-2 pt-2">';

const startIndex = content.indexOf(startSearch);
const endIndex = content.indexOf(endSearch, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newUI + '\n                        ' + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log("Successfully replaced the add thought form and preset preview.");
} else {
  console.log("Could not find boundaries.");
}
