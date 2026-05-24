const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const newCode = `    let options: any[] = [];

    if (selectedThoughtPreset !== "custom") {
      const preset = PRESET_THOUGHTS.find(p => p.id === selectedThoughtPreset);
      if (preset) {
        name = preset.name;
        problem = preset.problem;
        options = preset.options || [];
      }
    } else {
      name = customThoughtName.trim();
      trigger = customThoughtTrigger.trim();
      problem = customThoughtProblem.trim();
      
      const opt1 = {
        text: customThoughtConclusion1.trim(),
        modifiers: [
          { skillId: customThoughtModifier1Plus, amount: 2 },
          { skillId: customThoughtModifier1Minus, amount: -1 }
        ]
      };
      
      const opt2 = {
        text: customThoughtConclusion2.trim(),
        modifiers: [
          { skillId: customThoughtModifier2Plus, amount: 2 },
          { skillId: customThoughtModifier2Minus, amount: -1 }
        ]
      };
      options = [opt1, opt2];
    }

    if (!name || (!problem && selectedThoughtPreset === "custom")) {
      showNotification("⚠️ 脑瓜震荡：请输入具有实际意义的思维名称和心智难题。");
      return;
    }

    if (selectedThoughtPreset === "custom" && (!customThoughtConclusion1 || !customThoughtConclusion2)) {
      showNotification("⚠️ 脑瓜震荡：自定义思维必须完整填写两个可能的结论。");
      return;
    }

    if ((char.thoughts || []).some(t => t.name.toLowerCase() === name.toLowerCase())) {
      showNotification("⚠️ 思维过载：你的脑海里已经有这个新奇的执念轮廓了。");
      return;
    }

    const newThought = {
      id: \`thought_\${Date.now()}_\${Math.random()}\`,
      name,
      trigger,
      problem,
      options,
      progress: 0, // 0 indicates researching
      internalized: false
    };

    onUpdate({
      ...char,
      thoughts: [...(char.thoughts || []), newThought]
    });

    showNotification(\`💡 执念入脑！【\${name}】开始在你的潜意识中酝酿。\`);
    
    // reset form inputs
    setShowAddThought(false);
    setCustomThoughtName("");
    setCustomThoughtTrigger("");
    setCustomThoughtProblem("");
    setCustomThoughtConclusion1("");
    setCustomThoughtConclusion2("");`;

const startStr = 'let conclusion = "";';
const endStr = 'setCustomThoughtProblem("");';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newCode + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log('Replaced handleAddThought');
} else {
  console.log('Could not find start or end strings');
}
