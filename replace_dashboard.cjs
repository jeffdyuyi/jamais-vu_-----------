const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update the skill upgrade button
content = content.replace(
  `<button\n                          onClick={() => handleUpgradeSkill(s.id)}\n                          className="ml-2 text-[9px] px-1.5 py-0.5 bg-slate-800 text-white hover:bg-slate-700 font-bold uppercase rounded transition-colors"\n                        >\n                          升级\n                        </button>`,
  `<button
                          onClick={() => handleUpgradeSkill(s.id)}
                          disabled={char.xp < 3}
                          className={\`ml-2 text-[9px] px-1.5 py-0.5 rounded transition-colors \${char.xp < 3 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 font-bold uppercase'}\`}
                          title={char.xp < 3 ? "经验值不足(需要3点)" : "花费 3 XP 提升基础等级"}
                        >
                          升级 (-3XP)
                        </button>`
);

// 2. Update the internalize button
content = content.replace(
  `                                      <button\n                                        onClick={() => {\n                                          if (!thought.conclusion && (!thought.modifiers || thought.modifiers.length === 0)) {\n                                            setInternalizingThoughtId(thought.id);\n                                            setInternalizeConclusion("");\n                                          } else {\n                                            handleDirectInternalize(thought.id);\n                                          }\n                                        }}\n                                        className="w-full py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border bg-amber-500 border-amber-600 hover:bg-amber-400 text-amber-950 shadow-[2px_2px_0px_#78350f]"\n                                      >\n                                        <Zap className="w-3 h-3" />\n                                        <span>执行内化 (5 XP)</span>\n                                      </button>`,
  `                                      <button
                                        onClick={() => {
                                          if (char.xp < 5) {
                                            showNotification("⚠️ 经验值不足：内化一项思维需要 5 XP。");
                                            return;
                                          }
                                          if (!thought.conclusion && (!thought.modifiers || thought.modifiers.length === 0)) {
                                            setInternalizingThoughtId(thought.id);
                                            setInternalizeConclusion("");
                                          } else {
                                            handleDirectInternalize(thought.id);
                                          }
                                        }}
                                        disabled={char.xp < 5}
                                        className={\`w-full py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border \${char.xp < 5 ? 'bg-amber-100 border-amber-200 text-amber-700/50 cursor-not-allowed' : 'bg-amber-500 border-amber-600 hover:bg-amber-400 text-amber-950 shadow-[2px_2px_0px_#78350f]'}\`}
                                      >
                                        <Zap className="w-3 h-3" />
                                        <span>执行内化 (5 XP)</span>
                                      </button>`
);

// 3. Update the gear activation logic
content = content.replace(
  `                        <button\n                          onClick={() => {\n                            const isCurrentlyActive = char.activeGearIds.includes(id);\n                            let newActiveGears = [];\n                            if (isCurrentlyActive) {\n                              newActiveGears = char.activeGearIds.filter(gid => gid !== id);\n                            } else {\n                              newActiveGears = [...char.activeGearIds, id];\n                            }\n                            onUpdate({\n                              ...char,\n                              activeGearIds: newActiveGears\n                            });\n                            showNotification(isCurrentlyActive ? \`🎒 顺利卸下 \${g.name}\` : \`🥋 成功穿戴/装备 \${g.name}\`);\n                          }}\n                          className={\`mt-1.5 shrink-0 w-3.5 h-3.5 border-[1.5px] flex items-center justify-center rotate-45 transition-all cursor-pointer \${\n                            isActive \n                              ? 'bg-slate-900 border-slate-900 shadow-[2px_2px_0px_#475569]' \n                              : 'bg-slate-50 border-slate-300 hover:border-slate-500'\n                          }\`}\n                          title={isActive ? "点击卸下" : "点击穿戴"}\n                        >`,
  `                        <button
                          onClick={() => {
                            const isCurrentlyActive = char.activeGearIds.includes(id);
                            let newActiveGears = [];
                            if (isCurrentlyActive) {
                              newActiveGears = char.activeGearIds.filter(gid => gid !== id);
                              onUpdate({
                                ...char,
                                activeGearIds: newActiveGears
                              });
                              showNotification(\`🎒 顺利卸下 \${g.name}\`);
                            } else {
                              if (char.activeGearIds.length >= 3) {
                                showNotification("⚠️ 装备槽位已满：最多只能同时激活 3 件装备。");
                                return;
                              }
                              
                              // Check for slot conflict
                              const allGears = [...INITIAL_GEAR, ...(char.customGears || [])];
                              const targetGear = allGears.find(gear => gear.id === id);
                              
                              if (targetGear?.slot) {
                                const conflictGearId = char.activeGearIds.find(activeId => {
                                  const ag = allGears.find(gear => gear.id === activeId);
                                  return ag?.slot === targetGear.slot;
                                });
                                
                                if (conflictGearId) {
                                  const conflictGear = allGears.find(gear => gear.id === conflictGearId);
                                  showNotification(\`⚠️ 装备冲突：无法同时穿戴两件【\${targetGear.slot}】。需先卸下 \${conflictGear?.name}。\`);
                                  return;
                                }
                              }

                              newActiveGears = [...char.activeGearIds, id];
                              onUpdate({
                                ...char,
                                activeGearIds: newActiveGears
                              });
                              showNotification(\`🥋 成功穿戴/装备 \${g.name}\`);
                            }
                          }}
                          className={\`mt-1.5 shrink-0 w-3.5 h-3.5 border-[1.5px] flex items-center justify-center rotate-45 transition-all cursor-pointer \${
                            isActive 
                              ? 'bg-slate-900 border-slate-900 shadow-[2px_2px_0px_#475569]' 
                              : 'bg-slate-50 border-slate-300 hover:border-slate-500'
                          }\`}
                          title={isActive ? "点击卸下" : "点击穿戴"}
                        >`
);

fs.writeFileSync(file, content);
console.log("Updated Dashboard.tsx");
