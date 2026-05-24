const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/InvestigationBoard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find sections
const topStart = content.indexOf('      {/* TOP SECTION: Atmospheric Direction & Scene control */}');
const midStart = content.indexOf('      {/* MID SECTION: CLUE SYSTEM (Record and Deck) */}');
const lowerStart = content.indexOf('      {/* LOWER SECTION: INTUITION CONSOLIDATOR (Workspace & Logs) */}');

if (topStart !== -1 && midStart !== -1 && lowerStart !== -1) {
  const beforeTop = content.substring(0, topStart);
  const topSection = content.substring(topStart, midStart);
  const midSection = content.substring(midStart, lowerStart);
  const lowerSection = content.substring(lowerStart);

  // New order: beforeTop + midSection + topSection + lowerSection
  let newContent = beforeTop + midSection + topSection + lowerSection;

  // Now fix the dropdown in lowerSection
  // Replace the <div className="space-y-1 font-sans"> ... 将刻印哪个进度条 ... </div>
  const dropdownRegex = /<div className="space-y-1 font-sans">\s*<label[^>]*>\s*将刻印哪个进度条 :\s*<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g;
  
  newContent = newContent.replace(dropdownRegex, `
                <div className="space-y-1 font-sans flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={advanceProgress}
                      onChange={(e) => setAdvanceProgress(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-amber-700 transition-colors">
                      刻印此直觉并推进当前标签页的进度 (+1)
                    </span>
                  </label>
                  <p className="text-[9px] text-slate-400 pl-6 mt-0.5 font-sans">
                    如果不勾选，则仅作为纯叙事记录。
                  </p>
                </div>
  `);

  // Now fix the Intuition Log filtering
  newContent = newContent.replace(
    /\{data\.intuitions\.length > 0 \? \(/g, 
    `{(() => {
            const filteredIntuitions = data.intuitions.filter(i => i.trackerAdvanced === activeProgressTab || i.trackerAdvanced === "none");
            return filteredIntuitions.length > 0 ? (`
  );
  
  newContent = newContent.replace(
    /\{data\.intuitions\.map\(\(intuition\) => \{/g,
    `{filteredIntuitions.map((intuition) => {`
  );
  
  newContent = newContent.replace(
    /“脑腔内寂静无声。尚未孕育出任何将零碎线索引证而合的警探本能假设。”\s*<\/div>\s*\)\}/g,
    `“脑腔内寂静无声。尚未孕育出任何将零碎线索引证而合的警探本能假设。”
            </div>
          );
          })()}`
  );

  // Enhance the delete button
  newContent = newContent.replace(
    /className="text-slate-400 hover:text-red-500 opacity-20 hover:opacity-100 transition-opacity p-1 cursor-pointer text-xs font-sans"/g,
    `className="text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all px-2 py-1 cursor-pointer text-[10px] font-black font-sans uppercase rounded-sm flex items-center gap-1"`
  );

  newContent = newContent.replace(
    /<Trash2 className="w-3\.5 h-3\.5" \/>/g,
    `<Trash2 className="w-3 h-3" /><span>删除猜想</span>`
  );

  // Update Intuition count label
  newContent = newContent.replace(
    /直觉数量: \{data\.intuitions\.length\}/g,
    `直觉数量: {data.intuitions.filter(i => i.trackerAdvanced === activeProgressTab || i.trackerAdvanced === "none").length}`
  );

  fs.writeFileSync(file, newContent);
  console.log("Success");
} else {
  console.log("Failed to find sections");
}
