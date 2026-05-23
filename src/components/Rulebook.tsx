import { useState } from "react";
import { SKILLS, SkillCategory, INITIAL_GEAR, INITIAL_DRUGS } from "../types";
import { Search, Info, Book, User, Hammer, Brain, Zap, Briefcase, Tag, FlaskConical } from "lucide-react";

export default function Rulebook() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "全部" | "规则">("全部");

  const filteredSkills = SKILLS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = (activeCategory === "全部" || activeCategory === "规则") || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-100">
      <div className="p-4 md:p-8 border-b-2 border-geo-border bg-white space-y-4 md:space-y-6 shrink-0">
        <div>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1">
            调查员指南 <span className="text-geo-accent italic text-xs md:text-base font-bold ml-1 md:ml-2">精炼参考规范</span>
          </h2>
          <p className="text-slate-400 font-mono text-[8px] md:text-[10px] uppercase tracking-widest leading-none">失忆理智回路、精神执念碎片与案件证据黑板重构导论</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="正在检索规则库/技能描述..." 
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-geo-border focus:ring-4 focus:ring-blue-100 outline-none font-sans font-bold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["全部", "规则", ...Object.values(SkillCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-4 py-1 text-[10px] font-black uppercase border-2 transition-all ${
                activeCategory === cat 
                  ? "bg-geo-dark text-white border-geo-dark" 
                  : "bg-white text-slate-400 border-slate-200 hover:border-geo-dark hover:text-geo-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-16">
        {/* Core Rules Section */}
        {(activeCategory === "全部" || activeCategory === "规则") && (
          <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">核心检定规则</h3>
              <div className="h-px flex-1 bg-slate-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mechanics */}
              <div className="bg-geo-dark text-white p-4 md:p-8 space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden">
                <Hammer className="absolute -right-8 -bottom-8 w-24 h-24 md:w-32 md:h-32 text-white/5 rotate-12" />
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3 border-b border-white/10 pb-2 md:pb-4">
                   判定机制
                </h4>
                <div className="space-y-4">
                  <div className="p-3 md:p-4 bg-white/5 border border-white/10 font-mono text-xs md:text-sm leading-relaxed">
                    <span className="text-geo-accent font-black block md:inline mb-1 md:mb-0">2D6 + 技能值 + 修正</span>
                    <br className="hidden md:block" />
                    掷出两个六面骰，加上你的技能等级和任何环境/装备修正。若总值大于等于难度值，则行动成功。
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border-2 border-blue-500/30 bg-blue-500/5">
                      <div className="text-[10px] font-black text-blue-400 uppercase mb-1">极致成功</div>
                      <div className="text-sm font-bold">6 + 6</div>
                      <p className="text-[9px] text-slate-400 leading-tight mt-1">不论数值高低，该行动获得传奇般的超限成功。</p>
                    </div>
                    <div className="p-3 border-2 border-red-500/30 bg-red-500/5">
                      <div className="text-[10px] font-black text-red-400 uppercase mb-1">大检定失败</div>
                      <div className="text-sm font-bold">1 + 1</div>
                      <p className="text-[9px] text-slate-400 leading-tight mt-1">不论数值高低，必然遭遇灾难性的彻底失败。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white border-4 border-geo-border p-4 md:p-8 space-y-4 md:space-y-6">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3 border-b border-slate-100 pb-2 md:pb-4">
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
              <div className="bg-white border-2 border-geo-border p-4 md:p-8 space-y-4 md:space-y-6 lg:col-span-2">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3 border-b border-slate-100 pb-2 md:pb-4">
                  <Brain className="w-5 h-5 text-geo-accent shrink-0" /> 思维内阁与体验消耗顿悟
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
              <div className="bg-white border-2 border-geo-border p-4 md:p-8 space-y-4 md:space-y-6 lg:col-span-2">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3 border-b border-slate-100 pb-2 md:pb-4">
                  <Tag className="w-5 h-5 text-geo-accent shrink-0" /> 状态伤痛与情节标签规范
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
              <div className="p-4 md:p-8 border-2 border-geo-border bg-slate-50 space-y-4 md:space-y-6 lg:col-span-2">
                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3 border-b border-slate-200 pb-2 md:pb-4">
                  健康、士气与令牌
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
                  <div className="flex gap-4 p-4 bg-amber-50 border border-amber-500 shadow-[4px_4px_0px_0px_#d97706]">
                    <div className="w-12 h-12 bg-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                      <span className="text-white font-black text-xl select-none">★</span>
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

              {/* Gear & Medications Registry */}
              <div className="bg-white border-2 border-geo-border p-4 md:p-8 space-y-4 md:space-y-6 lg:col-span-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 md:pb-4">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Briefcase className="w-5 h-5 text-geo-accent shrink-0" /> 装备、随行箱包与生理制剂目录
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">第四节：行囊辅助配备</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  {/* Gears Section */}
                  <div className="space-y-4">
                    <div className="text-xs font-black text-slate-900 border-l-4 border-slate-900 pl-2 uppercase tracking-wider flex items-center justify-between">
                      <span>随行物理装备与常备工具</span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">数量: {INITIAL_GEAR.length}</span>
                    </div>
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar font-sans">
                      {INITIAL_GEAR.map(g => (
                        <div key={g.id} className="p-3 border border-slate-150 hover:border-slate-300 bg-slate-50/50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black uppercase text-slate-800">{g.name}</span>
                            <span className="text-[8px] px-1 border border-slate-200 text-slate-400 font-black uppercase tracking-tight">{g.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic leading-snug">“{g.description}”</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {g.modifiers.map(m => (
                              <span key={m.skillId} className="text-[9px] font-black bg-slate-100 text-slate-700 px-1 border border-slate-200">
                                 {SKILLS.find(s => s.id === m.skillId)?.name} {m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drugs Section */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-dashed border-slate-200 md:pl-6">
                    <div className="text-xs font-black text-slate-900 border-l-4 border-amber-500 pl-2 uppercase tracking-wider flex items-center justify-between">
                      <span>生理与特殊脑化学制剂</span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">数量: {INITIAL_DRUGS.length}</span>
                    </div>
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar font-sans">
                      {INITIAL_DRUGS.map(d => (
                        <div key={d.id} className="p-3 border border-amber-100 hover:border-amber-300 bg-amber-50/20 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black uppercase text-amber-950">{d.name}</span>
                            <span className="text-[8px] px-1 bg-amber-50 border border-amber-200 text-amber-700 font-black uppercase tracking-widest">制剂</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic leading-snug">“{d.description}”</p>
                          <p className="text-[9px] font-bold text-red-600 mt-2 font-mono">
                             ◆ 副作用: 永久性扣减 1 点 {d.permStat === "health" ? "生命值" : "士气值"}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5 font-mono">
                            <span className="text-[9px] font-black text-amber-700 my-auto">临时效果 (场景级):</span>
                            {d.tempModifiers.map(m => (
                              <span key={m.skillId} className={`text-[8px] font-black px-1 border ${m.amount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                 {SKILLS.find(s => s.id === m.skillId)?.name}{m.amount > 0 ? `+${m.amount}` : m.amount}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {activeCategory !== "规则" && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">二十四项心智潜机能详述</h3>
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSkills.map(skill => (
                <div key={skill.id} className="bg-white p-6 md:p-8 border-2 border-slate-200 hover:border-geo-accent transition-all relative overflow-hidden group shadow-sm hover:shadow-xl">
                  <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                    <div>
                      <div className="text-[10px] font-black text-geo-accent uppercase mb-1 tracking-widest">{skill.id}</div>
                      <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{skill.name}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 border border-slate-200 text-slate-500">
                      {skill.category}技能系
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-bold relative z-10 pr-12 italic">
                    “{skill.description}”
                  </p>
                  <div className="absolute right-0 bottom-0 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity translate-x-4 translate-y-4">
                     <User className="w-32 h-32 stroke-[6]" />
                  </div>
                  <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-geo-accent transition-all duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="p-12 border-4 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-4 bg-white/50 italic text-center">
           <Book className="w-12 h-12 text-slate-200" />
           <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] max-w-md leading-relaxed">
             在此终结你的疑虑。这是你仅存的真实。<br />
             <span className="text-[10px] opacity-60">记忆为谎言的面具。理化数据与证据方为唯一的庇护所。</span>
           </p>
        </div>
      </div>
    </div>
  );
}
