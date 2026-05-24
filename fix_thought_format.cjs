const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const thoughtBodyRenderer = `
                                <div className="text-[10px] text-slate-600 font-mono space-y-1 bg-slate-100/65 p-2.5 border border-slate-200 mb-3 w-full">
                                  {thought.trigger && (
                                    <div className="mb-2 pb-1 border-b border-slate-200/60">
                                      <div className="text-slate-800 font-bold mb-0.5">触发条件</div>
                                      <p className="italic leading-relaxed text-slate-550 text-[10px]">“{thought.trigger}”</p>
                                    </div>
                                  )}
                                  <div className="mb-2 pb-1 border-b border-slate-200/60">
                                    <div className="text-slate-800 font-bold mb-0.5">问题</div>
                                    <p className="italic leading-relaxed text-slate-550 text-[10px]">“{thought.problem}”</p>
                                  </div>
                                  
                                  {(thought.options || []).map((opt, idx) => {
                                    const isSelected = isInternalized && thought.conclusion === opt.text;
                                    const isDiscarded = isInternalized && thought.conclusion !== opt.text;
                                    
                                    return (
                                      <div key={idx} className={\`pt-1 mt-1 space-y-1 \${isDiscarded ? 'opacity-40 grayscale' : ''}\`}>
                                        <div className={\`font-bold mb-0.5 flex items-center gap-1 \${isSelected ? 'text-amber-750' : 'text-slate-800'}\`}>
                                          结论 {idx + 1}
                                          {isSelected && <span className="text-[8px] bg-amber-200 text-amber-800 px-1 rounded-sm">已确立</span>}
                                        </div>
                                        <p className="italic leading-relaxed text-slate-555 text-[10px]">“{opt.text}”</p>
                                        <div className="flex flex-wrap gap-1 mt-1 font-mono">
                                          <span className="font-bold text-slate-800 mr-1">效果 {idx + 1}:</span>
                                          {(opt.modifiers || []).map(m => {
                                            const skillName = SKILLS.find(s => s.id === m.skillId)?.name || m.skillId;
                                            return (
                                              <span key={m.skillId} className={\`text-[8px] px-1 border \${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}\`}>
                                                {skillName}{m.amount > 0 ? \`+\${m.amount}\` : m.amount}
                                              </span>
                                            );
                                          })}
                                          {(!opt.modifiers || opt.modifiers.length === 0) && <span className="text-[8px] text-slate-400">无明显机制变动</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {(!thought.options || thought.options.length === 0) && thought.conclusion && (
                                    <div className="pt-2 border-t border-slate-150 mt-2 space-y-1 border-dashed">
                                      <div className="text-amber-750 font-bold mb-0.5">结论 1</div>
                                      <p className="italic leading-relaxed text-slate-555 text-[10px]">“{thought.conclusion}”</p>
                                      <div className="flex flex-wrap gap-1 mt-1 font-mono">
                                        <span className="font-bold text-slate-800 mr-1">效果 1:</span>
                                        {(thought.modifiers || []).map(m => {
                                          const skillName = SKILLS.find(s => s.id === m.skillId)?.name || m.skillId;
                                          return (
                                            <span key={m.skillId} className={\`text-[8px] px-1 border \${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}\`}>
                                              {skillName}{m.amount > 0 ? \`+\${m.amount}\` : m.amount}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
`;

const oldThoughtBodyStart = '<div className="text-[10px] text-slate-600 font-mono space-y-1 bg-slate-100/65 p-2.5 border border-slate-200 mb-3 w-full">';
const oldThoughtBodyEnd = '</div>\n                              </div>\n\n                              <div>\n                                {/* Modifiers List */}';

const startIndex = content.indexOf(oldThoughtBodyStart);
const endIndex = content.indexOf(oldThoughtBodyEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + thoughtBodyRenderer + '\n                              </div>\n\n                              <div>\n                                {/* Modifiers List */}' + content.slice(endIndex + oldThoughtBodyEnd.length);
  fs.writeFileSync(file, content);
  console.log("Updated thought format and fixed bugs.");
} else {
  console.log("Could not find start/end bounds for thought body replacement.");
}

// I should also ensure that the internalization confirmation box has safe .map calls!
content = content.replace(/\{opt\.modifiers\.map/g, '{(opt.modifiers || []).map');
fs.writeFileSync(file, content);
console.log("Fixed potential map of undefined in opt.modifiers.");
