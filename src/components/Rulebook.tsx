import { useState } from "react";
import { SKILLS, SkillCategory, INITIAL_GEAR, INITIAL_DRUGS } from "../types";
import { Search, Info, Book, User, Hammer, Brain, Zap, Briefcase, Tag, FlaskConical } from "lucide-react";

export default function Rulebook() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rules" | "skills" | "gears">("rules");
  const [activeSkillCategory, setActiveSkillCategory] = useState<SkillCategory | "全部">("全部");
  const [activeGearCategory, setActiveGearCategory] = useState<"全部" | "衣物" | "工具" | "武器" | "制剂">("全部");

  const filteredSkills = SKILLS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeSkillCategory === "全部" || s.category === activeSkillCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100">
      <div className="w-full border-b border-slate-200 bg-white shrink-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-4">
          <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-6 py-2 text-xs font-black uppercase rounded-full transition-all ${
              activeTab === "rules" ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            核心规则
          </button>
          <button
            onClick={() => setActiveTab("gears")}
            className={`px-6 py-2 text-xs font-black uppercase rounded-full transition-all ${
              activeTab === "gears" ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            装备与制剂
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-6 py-2 text-xs font-black uppercase rounded-full transition-all ${
              activeTab === "skills" ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            技能库
          </button>
        </div>

        {activeTab === "skills" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="正在检索技能名称或描述..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-sans font-medium text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["全部", ...Object.values(SkillCategory)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveSkillCategory(cat as any)}
                  className={`px-4 py-1.5 text-[11px] font-bold uppercase rounded-full transition-all ${
                    activeSkillCategory === cat 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 md:space-y-16">
          {/* Core Rules Section */}
        {activeTab === "rules" && (
          <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">核心检定规则</h3>
              <div className="h-px flex-1 bg-slate-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mechanics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6 shadow-sm relative overflow-hidden">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight border-b border-slate-100 pb-2 md:pb-4 text-geo-dark">
                   判定机制
                </h4>
                <div className="space-y-4">
                  <div className="p-3 md:p-4 bg-slate-50 border border-slate-200 font-mono text-xs md:text-sm leading-relaxed text-slate-600">
                    <span className="text-geo-accent font-black block md:inline mb-1 md:mb-0">2D6 + 技能值 + 修正</span>
                    <br className="hidden md:block" />
                    掷出两个六面骰，加上你的技能等级和任何环境/装备修正。若总值大于等于难度值，则行动成功。
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border-2 border-blue-200 bg-blue-50/50">
                      <div className="text-[10px] font-black text-blue-600 uppercase mb-1">极致成功</div>
                      <div className="text-sm font-bold text-blue-900">6 + 6</div>
                      <p className="text-[9px] text-slate-500 leading-tight mt-1">不论数值高低，该行动获得传奇般的超限成功。</p>
                    </div>
                    <div className="p-3 border-2 border-red-200 bg-red-50/50">
                      <div className="text-[10px] font-black text-red-600 uppercase mb-1">大检定失败</div>
                      <div className="text-sm font-bold text-red-900">1 + 1</div>
                      <p className="text-[9px] text-slate-500 leading-tight mt-1">不论数值高低，必然遭遇灾难性的彻底失败。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6 shadow-sm">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight border-b border-slate-100 pb-2 md:pb-4">
                   难度阶梯
                </h4>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-3 font-mono">
                  {[
                    { label: "极易", val: 6 }, { label: "困难", val: 14 },
                    { label: "容易", val: 8 }, { label: "极难", val: 16 },
                    { label: "中等", val: 10 }, { label: "噩梦", val: 18 },
                    { label: "挑战", val: 12 }, { label: "炼狱", val: 20 }
                  ].map(d => (
                    <div key={d.label} className="flex justify-between items-center border-b border-slate-50 pb-1">
                      <span className="text-[11px] font-bold text-slate-400">{d.label}</span>
                      <span className="text-sm font-black text-geo-dark">{d.val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">“这个世界的重力对每个人都是公平的，直到你开始思考。”</p>
              </div>

              {/* Thought Cabinet */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6 lg:col-span-2 shadow-sm">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight border-b border-slate-100 pb-2 md:pb-4">
                  思维内阁
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-sm">
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-geo-accent uppercase">1. 存储或自定义念头</div>
                    <p className="text-slate-600 leading-relaxed font-semibold">你从世事探索或离奇对话中吸纳念头或疑议。它们将先暂存于大脑思维仓库，作为其“执念研究状态”（modifiers 暂未生效）。</p>
                  </div>
                  <div className="space-y-3 border-x border-dashed border-slate-200 px-4">
                    <div className="text-[10px] font-black text-geo-accent uppercase">2. 顿悟内化 (消耗 5 XP)</div>
                    <p className="text-slate-600 leading-relaxed font-semibold">当积攒了 5 点经验值时，你可以点击该念头的【内化顿悟】。这将彻底消耗 5 XP，将其内化为永久本能结论，调整项（加成与副作用）实时生效。</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-geo-accent uppercase">3. 技能升级 (消耗 3 XP)</div>
                    <p className="text-slate-600 leading-relaxed font-semibold">当遇到艰难检定时，你可以消耗 3 点经验值升级你所需要的核心技能。你可以直接点击相应技能卡片右下角的【升级】按钮，直接消耗 3 XP 将其等级永久提升 1 点。</p>
                  </div>
                </div>
              </div>

              {/* States & Tags core rules */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6 lg:col-span-2 shadow-sm">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight border-b border-slate-100 pb-2 md:pb-4">
                  状态与标签
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-sm">
                  <div className="space-y-3 p-4 bg-red-50/50 border border-red-200">
                    <div className="text-xs font-black text-red-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      1. 伤痛/负面状态机 (States)
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed font-semibold">
                      状态是一种特殊的负面标签，当你损失士气或生命值时便会获得，用量化与具象化伤害对你造成的影响。
                    </p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-mono">
                      <li><strong>精神状态 (Mental)：</strong>因士气损失产生。内置标准预设如恐惧、愤怒、困惑、天真、鲁莽、悲伤。对展现自信与自信判定、以及考量他人情绪时施加关联减值。</li>
                      <li><strong>身体状态 (Physical)：</strong>因生命损失产生。内置标准预设如手臂受伤、背痛、精疲力竭、饥饿、患病、脚踝扭伤。对奔跑跳跃、负重扭转、自控器械施加阻碍。</li>
                      <li><strong>行动影响：</strong>施加 <strong>-1 至 -3 关联判定减值</strong>，根据当前情景与行动判定意图的实际相关程度而定。</li>
                      <li><strong>自动清除机制：</strong>当你通过消耗或剧情恢复 1 点士气或 1 点健康时，系统会<strong>立刻清除你积压的最早/最相符的一枚负面状态</strong>。</li>
                    </ul>
                  </div>

                  <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-200">
                    <div className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      2. 环境/情节标签 (Tags)
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed font-semibold">
                      代表世界上值得被记录的历史瞬间或实时情势（如“街角酒馆正在斗殴”、“在午夜浓雾中行凶”、“偏袒某人的偏见”），对检定施加限制或加成。
                    </p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-mono">
                      <li><strong>判定修正：</strong>提供 <strong>±1 到 ±3 的加值或减值</strong>，通常轻微相关获 ±1，剧情及机制绝对关联获 ±3。可多次叠加或彼此抵消。</li>
                      <li><strong>先期铺垫：</strong>玩家能利用技能检定或前期剧情探索积蓄正面标签（例如刺探地形以获得“备用逃生密道”/“了解哨卫路线”标签），从而降低大检定的基础难度。</li>
                      <li><strong>自陷死局 (+1 XP)：</strong>当掷骰受到某负面标签阻碍时，玩家可选择主动声称受此不利因素困扰（增加难度），此时代表内心失控或屈从形势，将<strong>实时获得 1 点经验值 (XP) 作为自我惩处的补偿！</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tokens & Health/Morale */}
              <div className="p-6 md:p-8 border border-slate-200 rounded-2xl bg-slate-50 space-y-4 md:space-y-6 lg:col-span-2">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight border-b border-slate-200 pb-2 md:pb-4">
                  健康、士气、插叙指示物
                </h4>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-red-600">健康值</span>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">肉体的承受极限。降至 0 时将引发物理性猝死或永久伤残。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                      <Search className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-blue-600">士气值</span>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">精神的稳固程度。降至 0 时将导致彻底的崩溃、放弃或辞职。</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 md:p-6 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-full flex items-center justify-center shrink-0 text-white font-black text-lg md:text-xl shadow-inner">
                      ★
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-amber-800">插叙提示指示物</span>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        技能从不沉默。它们总会在最不合时宜的时刻突然浮现，向你示警，提出要求，或是随意抛洒未经邀请的智慧箴言。
                      </p>
                      <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 font-mono">
                        <li><strong>初始状态：</strong>每位玩家在游戏开始时都持有 1 枚插叙指示物。</li>
                        <li><strong>他人递交触发：</strong>当你的角色处于特定情景时，任何在场玩家都可以递给你 1 枚指示物，并提议：<em>“我想看看【平心静气】对此有何见解”</em>，从而由你对应技能的声音触发一段插叙陈述。</li>
                        <li><strong>自主发起：</strong>你也可以不消耗指示物自主向主持人/在场玩家发起主动的技能插叙。</li>
                        <li><strong>饱和上限 (3枚)：</strong>已持有 3 枚指示物的玩家进入过载饱和状态，<strong>不可再被递交指示物或被强行插叙</strong>。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Gear & Medications Section */}
        {activeTab === "gears" && (
          <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 md:pb-4">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tight">
                    装备列表
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">行囊辅助配备</span>
                </div>

                {/* Gear filter tabs */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(["全部", "衣物", "工具", "武器", "制剂"] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveGearCategory(cat)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        activeGearCategory === cat 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800"
                      }`}
                    >
                      {cat === "全部" ? "所有目录" : cat === "制剂" ? "生理制剂" : `${cat}装备`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-10 text-sm mt-4">
                  {/* Gears Section */}
                  {(activeGearCategory === "全部" || activeGearCategory !== "制剂") && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-900 border-l-4 border-slate-900 pl-3 uppercase tracking-wider flex items-center justify-between">
                        <span>{activeGearCategory === "全部" ? "随行物理装备与常备工具" : `${activeGearCategory}分类清单`}</span>
                        <span className="text-xs font-mono text-slate-400 font-bold">数量: {INITIAL_GEAR.filter(g => activeGearCategory === "全部" || g.type === activeGearCategory).length}</span>
                      </div>
                      <div className="flex flex-col space-y-3 font-sans">
                        {INITIAL_GEAR.filter(g => activeGearCategory === "全部" || g.type === activeGearCategory).map(g => (
                          <div key={g.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 border border-slate-200 rounded-lg hover:border-slate-300 bg-slate-50 transition-colors shadow-sm">
                            <div className="md:w-[22%] shrink-0 flex items-center justify-between md:justify-start gap-3">
                              <span className="text-sm md:text-base font-black uppercase text-slate-800">{g.name}</span>
                              <span className="text-[9px] px-1.5 border border-slate-200 text-slate-400 font-black uppercase tracking-tight">{g.type}</span>
                            </div>
                            <div className="md:w-[45%] shrink-0">
                               <p className="text-xs text-slate-500 italic leading-relaxed">“{g.description}”</p>
                            </div>
                            <div className="md:flex-1 flex flex-wrap md:justify-end gap-2 mt-2 md:mt-0 font-mono">
                              {g.modifiers.map(m => (
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drugs Section */}
                  {(activeGearCategory === "全部" || activeGearCategory === "制剂") && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-900 border-l-4 border-amber-500 pl-3 uppercase tracking-wider flex items-center justify-between">
                        <span>生理与特殊脑化学制剂</span>
                        <span className="text-xs font-mono text-slate-400 font-bold">数量: {INITIAL_DRUGS.length}</span>
                      </div>
                      <div className="flex flex-col space-y-3 font-sans">
                        {INITIAL_DRUGS.map(d => (
                          <div key={d.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 border border-amber-200 rounded-lg hover:border-amber-300 bg-slate-50 transition-colors shadow-sm">
                            <div className="md:w-[22%] shrink-0 flex items-center justify-between md:justify-start gap-3">
                              <span className="text-sm md:text-base font-black uppercase text-amber-950">{d.name}</span>
                              <span className="text-[9px] px-1.5 bg-amber-50 border border-amber-200 text-amber-700 font-black uppercase tracking-widest">制剂</span>
                            </div>
                            <div className="md:w-[45%] shrink-0 space-y-1.5">
                               <p className="text-xs text-slate-500 italic leading-relaxed">“{d.description}”</p>
                               <p className="text-[10px] font-bold text-red-600 font-mono">
                                 ◆ 副作用: 永久性扣减 1 点 {d.permStat === "health" ? "生命值" : "士气值"}
                               </p>
                            </div>
                            <div className="md:flex-1 flex flex-wrap md:justify-end items-center gap-2 mt-2 md:mt-0 font-mono">
                              <span className="text-[10px] font-black text-amber-700 hidden lg:inline-block mr-1">临时效果:</span>
                              {d.tempModifiers.map(m => (
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </section>
        )}

        {/* Skills Section */}
        {activeTab === "skills" && (
          <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSkills.map(skill => (
                <div key={skill.id} className="bg-white p-6 md:p-8 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all relative overflow-hidden group shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                    <div>
                      <div className="text-[10px] font-black text-geo-accent uppercase mb-1 tracking-widest">{skill.id}</div>
                      <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{skill.name}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 border border-slate-200 text-slate-500">
                      {skill.category}技能系
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-bold relative z-10 italic">
                    “{skill.description}”
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="p-8 md:p-12 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-white shadow-sm italic text-center">
           <p className="text-sm font-medium text-slate-400 tracking-widest max-w-md leading-relaxed">
             在此终结你的疑虑。这是你仅存的真实。<br />
             <span className="text-[10px] opacity-60">记忆为谎言的面具。理化数据与证据方为唯一的庇护所。</span>
           </p>
        </div>
      </div>
      </div>
    </div>
  );
}
