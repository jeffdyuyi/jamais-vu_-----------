const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/components/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const newPresets = `const PRESET_THOUGHTS = [
  {
    id: "apocalypse_cop",
    name: "末日警探",
    problem: "你觉得街角的水泥正在加速腐烂，世界的末日即将来临。",
    options: [
      {
        text: "末日不可避免。不再焦虑，静静捕捉世界的颤动。",
        modifiers: [ { skillId: "shivers", amount: 2 }, { skillId: "halfLight", amount: 1 }, { skillId: "logic", amount: -1 } ]
      },
      {
        text: "世界不会毁灭，毁灭的只是人心。我必须更加警惕。",
        modifiers: [ { skillId: "perception", amount: 2 }, { skillId: "logic", amount: 1 }, { skillId: "empathy", amount: -1 } ]
      }
    ]
  },
  {
    id: "chem_theory",
    name: "先进化学理论",
    problem: "你的肺部似乎能过滤并闻出空气中潜在的游离酒精与化学分子。",
    options: [
      {
        text: "肉体是能量发生器。对痛苦和化学物质耐受性颠覆性加强。",
        modifiers: [ { skillId: "electrochemistry", amount: 2 }, { skillId: "painThreshold", amount: 1 }, { skillId: "composure", amount: -1 } ]
      },
      {
        text: "这是一种毒药。我必须拒绝一切化学诱惑，保持绝对清醒。",
        modifiers: [ { skillId: "volition", amount: 2 }, { skillId: "endurance", amount: 1 }, { skillId: "electrochemistry", amount: -1 } ]
      }
    ]
  },
  {
    id: "chemtrail_defender",
    name: "化学尾迹辩护者",
    problem: "晴空万里的日子里，可疑的白色尾迹划破碧空。仿佛政府正在往空气中投放化学品。谁知道呢；或许他们有充分的理由这样做。",
    options: [
      {
        text: "政府拥有专家军团。如果他们通过化学品优化人口素质，我又有什么资格质疑？为了大局着想。",
        modifiers: [ { skillId: "composure", amount: 2 }, { skillId: "endurance", amount: 2 }, { skillId: "drama", amount: -1 } ]
      },
      {
        text: "那究竟是什么药物？想必是顶级货。真希望能吸入这些云朵。云层会散发何种气息？",
        modifiers: [ { skillId: "electrochemistry", amount: 4 } ]
      }
    ]
  }
];`;

content = content.replace(/const PRESET_THOUGHTS = \[[\s\S]*?(?=export\s+default\s+function\s+Dashboard|const\s+Dashboard\s*=)/, newPresets + '\n\n');

// Also update state variables for "Add Custom Thought"
content = content.replace(
  `  const [customThoughtProblem, setCustomThoughtProblem] = useState("");`,
  `  const [customThoughtProblem, setCustomThoughtProblem] = useState("");
  const [customThoughtConclusion1, setCustomThoughtConclusion1] = useState("");
  const [customThoughtModifier1Plus, setCustomThoughtModifier1Plus] = useState("logic");
  const [customThoughtModifier1Minus, setCustomThoughtModifier1Minus] = useState("logic");
  const [customThoughtConclusion2, setCustomThoughtConclusion2] = useState("");
  const [customThoughtModifier2Plus, setCustomThoughtModifier2Plus] = useState("logic");
  const [customThoughtModifier2Minus, setCustomThoughtModifier2Minus] = useState("logic");
  const [showOracleOracleForThoughtId, setShowOracleOracleForThoughtId] = useState<string | null>(null);`
);

fs.writeFileSync(file, content);
console.log("Updated PRESET_THOUGHTS and state variables.");
