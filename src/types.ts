export enum SkillCategory {
  Intellect = "智力",
  Psyche = "精神",
  Physique = "体格",
  Motorics = "身手",
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
}

export const SKILLS: Skill[] = [
  // Intellect
  { id: "logic", name: "逻辑思维", category: SkillCategory.Intellect, description: "热衷于构建理论、演绎推理。它认为世间万物皆可解，且存在最优解。它能识破谎言与叙事漏洞，甚至帮你打点税务。但逻辑也是个爱显摆的家伙，热衷于在公众面前展示神探般的过人本领，执着于证明自己正确且要让全场皆知。此外它能揪出剧情漏洞，毁掉你看的每一部电影。" },
  { id: "encyclopedia", name: "博学多闻", category: SkillCategory.Intellect, description: "博学多闻能喷涌关于万物的知识与奇闻。它有着极为惊人且具选择性的记忆力，还能赋予你惊人的极为清晰的记忆。只要你读过其中的内容，就能记住。但关键在于，它没有分寸感。这个永远好奇的个性会用无尽琐事将你淹没，而破案的关键线索却被忽视。此外，它热衷于让你重温人生最尴尬的瞬间。" },
  { id: "rhetoric", name: "能说会道", category: SkillCategory.Intellect, description: "能说会道是永无止境的诡辩大师，政客与脱口秀的看家本领。它能替不可辩护之事铸造护盾，通过消耗战策略赢得辩论——让对手耗尽论点或耐心。但归根结底，能说会道不会为你赢得新朋友。它或许能赢争端，却赢不了人心，更常使你陷入困境。最终人们同意你的观点，可能只是为了让你闭嘴。" },
  { id: "drama", name: "故弄玄虚", category: SkillCategory.Intellect, description: "故弄玄虚擅长粉饰现实——这是“说谎”的委婉说法。除了欺骗他人，它还精于表演、佯攻，以及识破他人对你耍的花招。唯有骗子能识破骗子。故弄玄虚沉迷夸张与引人注目，会抓住任何机会成为焦点。同时，它还是卡拉 OK 的麦霸。" },
  { id: "conceptualization", name: "标新立异", category: SkillCategory.Intellect, description: "标新立异催生新思想。正是这创造力的火花将人类与野兽区分开来。它会在你淋浴时为企业构思名称，命令你撰写那本小说。它懂得欣赏爵士乐，甚至坚持要理解抽象雕塑。可惜标新立异也是个势利眼的评论家，刻薄的完美主义者。它对拙劣的押韵和时下青少年音乐怒不可遏，每次看到 Comic Sans 字体（译注：一种被广泛认为不专业的卡通字体）都会抓狂。" },
  { id: "visualCalculus", name: "见微知著", category: SkillCategory.Intellect, description: "见微知著让物理变得简单。它热衷重建罪案现场，像电视剧般解读血迹飞溅与子弹弹道轨迹。它还能充当你植入大脑的 GPS 系统，并处理你在台球方面遇到的所有突发状况。但见微知著易迷失于细节——当你的视野中全是用红点线条模拟出的房间回音图示时，要进行一场调查性访谈可就变得困难了。" },

  // Psyche
  { id: "volition", name: "平心静气", category: SkillCategory.Psyche, description: "平心静气是你内心的教练。它督促你完成目标，成为更好的自己。让你清晨起床、戒除毒瘾、吃藜麦沙拉、做俯卧撑。更重要的是，平心静气决定你的士气。不过这位“完美先生”实在过于热情，总怂恿你挑战远超能力范围的伟业。它对你的盲目信心可能招致更多失败，还是个十足的扫兴专家。" },
  { id: "inlandEmpire", name: "内陆帝国", category: SkillCategory.Psyche, description: "这是一种罕见的天赋。内陆帝国是永不枯竭的情感与预感之流。它让你透过超现实主义的棱镜体验世界，突破时空限制，获取灵界漫游的深邃智慧。当然，内陆帝国会将梦境与现实搅成浑然一体的浆糊，把你的生活变成大卫·林奇式的电影——下一刻，你可能会对着领带寻求法律建议。" },
  { id: "empathy", name: "通情达理", category: SkillCategory.Psyche, description: "通情达理解读人心。它能帮助你共鸣他人的人生境遇，理解他人的处境与苦难，使你察觉表象之下隐藏的真相。这项技能能深挖与你互动者埋藏的情感。但过度的通情达理会使你脆弱不堪——你既能感受他人的喜悦与希望，也会承受他们的痛苦、焦虑、悲伤与愤怒。这不仅会损耗你的士气，还可能触发与他人感受相关的思维。" },
  { id: "authority", name: "争强好胜", category: SkillCategory.Psyche, description: "争强好胜关乎尊重——既是对你个人的尊重，也是对你所代表机构的尊重。它能助你坚定立场，对他人施加支配力。但过度的尊重会扭曲世界观，让你对自身自大的一面视而不见。争强好胜还迫使你做出荒诞的妄自尊大般表演，比如对超市插队的老妇人咆哮怒吼。" },
  { id: "espritDeCorps", name: "同舟共济", category: SkillCategory.Psyche, description: "这是你的团队协作技能，将你与同事紧密联结。它能闪现同事的灵光片段，助你理解自身在机构中的微小角色。它也使你能与调查员同僚建立伙伴关系，开展卓有成效的合作。同舟共济的风险在于，它容易将自我稀释于机构的无面浓汤中，犹如蚂蚁为群体利益放弃个体性。" },
  { id: "suggestion", name: "循循善诱", category: SkillCategory.Psyche, description: "啊，这是门让他人相信彼此利益同频的精妙艺术。骗子和幕僚的拿手好戏。既然能用三寸不烂之舌铺路，何必正面冲突？既然能溜须拍马，何必拳脚相加？此技能亦可识破他人对你的操纵企图。但谗言蛊惑是把双刃剑，它倾向于相信自己的谎言，扭曲你的认知与记忆。这种脱离现实的方式会让你产生妄想，在旁人眼中化作虚伪的谄媚者。" },

  // Physique
  { id: "endurance", name: "钢筋铁骨", category: SkillCategory.Physique, description: "这位负责让你的血液流动，确保内脏待在皮肤包裹的正确位置。实战中，钢筋铁骨能防止你在受伤时失血，并以“放马过来！”的态度鼓励你全力以赴。它也是你的原始直觉 ... 而这种直觉可能会说出些政治不正确的话。听说这家伙偶尔会有点，呃，法西斯倾向。" },
  { id: "painThreshold", name: "坚忍不拔", category: SkillCategory.Physique, description: "没人喜欢疼痛——除了「坚忍不拔」。它让你在受伤时仍能保持机能运转，无视鲜血洒落大地。它是孤军奋斗者最可靠的盟友。它让你冷酷无情，却也渴求更多折磨——不仅是肉体痛楚，还有精神创伤。痛苦的回忆？没错，再多来些吧，最好再淋上一层悲伤酱汁。" },
  { id: "physicalInstrument", name: "强身健体", category: SkillCategory.Physique, description: "这是硬汉专属的属性，让你能一拳砸烂敌人的脸。这位肾上腺素成瘾的健身教练统御着你所有的身体机能，也会如实反映你的整体健康状态。但强身健体奉行铁血原则——没空理会情绪波动、倾听诉求或是「我们谈谈」的场面。它只想让你用拳头轰出一条生路。" },
  { id: "electrochemistry", name: "食髓知味", category: SkillCategory.Physique, description: "这是个有趣的家伙——至少按照它自己对“有趣”的定义，即那种不计后果的毒品洪流式狂欢。完美的享乐主义者，通晓地球上所有药物的知识，甚至包括神经化学细节。食髓知味渴望多巴胺的飙升，无论是性爱还是嗑药。它会怂恿你从街边捡烟头，舔酒吧凳上的朗姆酒渍，毫不顾及卫生与体面，还会对惊恐的女招待说些性骚扰的话。食髓知味没有道德红线，只有血清素受体。" },
  { id: "shivers", name: "天人感应", category: SkillCategory.Physique, description: "啊，又一项林奇式的技能。天人感应让你起鸡皮疙瘩，带来难以名状的预感。这家伙想告诉你什么…如果你能听懂的话。它能让你感知不可见亦不可解之物，如同一位永远说着谜语的超自然导师。别试图理解，去感受便是。" },
  { id: "halfLight", name: "疑神疑鬼", category: SkillCategory.Physique, description: "警觉、戒备、歇斯底里。疑神疑鬼是你“战或逃”的本能，它爱你爱到害怕任何可能伤害你的东西——包括你自己的想法。疑神疑鬼能在第一眼就警告你事情不对劲，但多数时候只是攻击性的偏执，这可能会打击你的士气。若与强身健体联手，它会让你先开枪，永远不提问。" },

  // Motorics
  { id: "handEyeCoordination", name: "眼明手巧", category: SkillCategory.Motorics, description: "这是你投掷与凌空接球所需的能力，是让你勉强像样地瞄准射击的关键。事实上它对枪械过于熟稔，初见任何武器便能解析：口径重量、最佳射程、特定型号的卡弹频率 ... 眼明手巧简直迷恋清晨的火药味。" },
  { id: "perception", name: "五感发达", category: SkillCategory.Motorics, description: "敏锐双眼、灵敏双耳、对周遭环境的深度觉知。五感发达是线索发现器，是让你注意到他人遗漏细节的放大镜。它涵盖所有感官，但以冰冷的方式运作，与人性的温度绝缘——因此无法助你洞察他人肢体语言或行为。五感发达没有关闭按钮，有时会因信息过载而适得其反，甚至产生误导。你可能会陷入“只见线索之树，不见解决之林”的困境。" },
  { id: "reactionSpeed", name: "反应速度", category: SkillCategory.Motorics, description: "这项能力主宰你的反射神经。能让你以子弹时间般的动态视力闪避拳击，对突发事件做出即时反应。同时包含思维敏锐度、街头智慧，以及在真空光速下组织完美回击的能力。但反应速度极易演变为“过度反应速度”，导致你变得神经质，未经深思便脱口而出。" },
  { id: "savoirFaire", name: "鬼祟玲珑", category: SkillCategory.Motorics, description: "掌控平衡感、杂技技巧与潜行能力。让你能在屋顶追逐战中优雅腾跃，或轻松完成跑酷动作。这是终极的炫技技能，讲究戏剧性入场与华而不实的空翻——越是多余复杂，越是完美契合。" },
  { id: "interfacing", name: "能工巧匠", category: SkillCategory.Motorics, description: "涵盖所有指尖技艺，让你熟练使用电子设备、平稳驾驶并修理汽车、撬开安全锁，并在使用工具时占据优势。它还涉及肌肉记忆甚至能改善笔迹。但能工巧匠对活物毫无兴趣——它会被商店橱窗的电视魅惑，并不断催促你查看手机。" },
  { id: "composure", name: "从容自若", category: SkillCategory.Motorics, description: "如同覆盖内心恶魔的毛毯，从容自若让你维持表面的平静。这是压力下的从容，是阻止他人窥探你思维与情感的扑克脸。它亦能解读他人肢体语言。但从容自若常将冷漠发挥过头，成为吹毛求疵的服装评论家——执着于人们的外表（包括你自己），绝不会原谅那些被它视为公然挑战审美的穿搭犯罪。" },
];

export interface Gear {
  id: string;
  name: string;
  type: "衣物" | "工具" | "武器";
  modifiers: { skillId: string; amount: number }[];
  description: string;
}

export const INITIAL_GEAR: Gear[] = [
  // 眼镜
  { id: "art_critic_glasses", name: "艺术评论家眼镜", type: "衣物", modifiers: [{ skillId: "conceptualization", amount: 2 }, { skillId: "rhetoric", amount: 1 }, { skillId: "interfacing", amount: -2 }], description: "谨防先锋派舞台布景中那种看似天真实则迷惑人眼的视错觉效果。" },
  { id: "biker_shades", name: "机车党墨镜", type: "衣物", modifiers: [{ skillId: "endurance", amount: 2 }], description: "保护太阳免受你的光辉所扰。" },
  { id: "black_shades", name: "黑超", type: "衣物", modifiers: [{ skillId: "savoirFaire", amount: 1 }, { skillId: "authority", amount: 1 }], description: "烂片导演与摇滚巨星的秘密武器。" },
  { id: "bourgeois_monocle", name: "资产阶级单片镜", type: "衣物", modifiers: [{ skillId: "rhetoric", amount: 2 }, { skillId: "empathy", amount: -2 }], description: "赋予你俯瞰世界与凡人的特权视角。" },
  { id: "weird_reporter_glasses", name: "怪咖记者眼镜", type: "衣物", modifiers: [{ skillId: "electrochemistry", amount: 1 }, { skillId: "visualCalculus", amount: 1 }, { skillId: "savoirFaire", amount: -1 }], description: "红圆镜片配绿方镜片，镶嵌在铜框里。俗不可耐。" },
  { id: "librarian_glasses", name: "图书管理员眼镜", type: "衣物", modifiers: [{ skillId: "encyclopedia", amount: 1 }, { skillId: "perception", amount: 1 }], description: "戴上它，一英里内任何放错位置的书都无所遁形。" },
  { id: "pirate_eyepatch", name: "海盗眼罩", type: "衣物", modifiers: [{ skillId: "authority", amount: 1 }, { skillId: "drama", amount: 1 }], description: "一眼望未来，一眼窥往昔。那往昔是深不见底的虚空。" },

  // 手部饰品
  { id: "ruby_ring", name: "大红宝石戒指", type: "衣物", modifiers: [{ skillId: "drama", amount: 3 }, { skillId: "handEyeCoordination", amount: -1 }], description: "拥抱内心的天后。" },
  { id: "cleaning_gloves", name: "清洁手套", type: "衣物", modifiers: [{ skillId: "endurance", amount: 2 }], description: "橡胶覆层为最肮脏的任务提供防护。" },
  { id: "emerald_ring", name: "翡翠戒指", type: "衣物", modifiers: [{ skillId: "composure", amount: 1 }, { skillId: "savoirFaire", amount: 1 }], description: "低调而精致，某位贵妇的传世之物。" },
  { id: "floral_bracelet", name: "花饰手镯", type: "衣物", modifiers: [{ skillId: "shivers", amount: 2 }, { skillId: "volition", amount: 1 }], description: "花朵铭刻着自然之美与不可逆转的衰败。" },
  { id: "latex_gloves", name: "乳胶手套", type: "衣物", modifiers: [{ skillId: "interfacing", amount: 2 }], description: "防护性与触感的最佳平衡。" },
  { id: "leather_wristband", name: "皮革手链", type: "衣物", modifiers: [{ skillId: "physicalInstrument", amount: 1 }, { skillId: "painThreshold", amount: 1 }], description: "让你的手腕真正嘶吼出“究极硬核”。" },
  { id: "northern_mittens", name: "北方连指手套", type: "衣物", modifiers: [{ skillId: "composure", amount: 2 }, { skillId: "endurance", amount: 2 }, { skillId: "interfacing", amount: -3 }], description: "可爱但笨重。让你的手指像木偶嘴巴般僵硬。" },

  // 头部饰品
  { id: "bachelor_party_shame_hat", name: "单身派对羞耻帽", type: "衣物", modifiers: [{ skillId: "electrochemistry", amount: 2 }, { skillId: "composure", amount: -1 }], description: "有人在同个周末失去了单身身份与自尊。" },
  { id: "banana_headband", name: "香蕉头带", type: "衣物", modifiers: [{ skillId: "painThreshold", amount: 2 }, { skillId: "endurance", amount: 1 }], description: "嘭的一声劈开砖块！" },
  { id: "dealer_hat", name: "赌场荷官帽", type: "衣物", modifiers: [{ skillId: "composure", amount: 2 }, { skillId: "reactionSpeed", amount: 1 }, { skillId: "empathy", amount: -1 }], description: "赋予你对他人迅速破产的绝对冷漠。" },
  { id: "detective_fedora", name: "侦探软呢帽", type: "衣物", modifiers: [{ skillId: "reactionSpeed", amount: 1 }, { skillId: "encyclopedia", amount: 1 }], description: "若不像个调查员，当侦探的意义何在？" },
  { id: "beanie_hat", name: "针织帽", type: "衣物", modifiers: [{ skillId: "inlandEmpire", amount: 2 }], description: "某人的祖母倾注了无尽爱意编织。复古魅力。" },
  { id: "princess_crown", name: "公主头冠", type: "衣物", modifiers: [{ skillId: "inlandEmpire", amount: 2 }, { skillId: "authority", amount: -1 }], description: "独角兽！我的王国需要独角兽！" },
  { id: "straw_visor", name: "草编遮阳帽", type: "衣物", modifiers: [{ skillId: "shivers", amount: 1 }], description: "放松。闭眼。深呼吸。真相终将显现。" },
  { id: "old_baseball_cap", name: "旧棒球帽", type: "衣物", modifiers: [{ skillId: "handEyeCoordination", amount: 1 }, { skillId: "visualCalculus", amount: 1 }, { skillId: "rhetoric", amount: -1 }], description: "啊，这顶浸透了无数荣耀午后与阁楼尘埃的振奋气息。" },

  // 外套
  { id: "parka_coat", name: "御寒派克大衣", type: "衣物", modifiers: [{ skillId: "composure", amount: 1 }, { skillId: "physicalInstrument", amount: -1 }], description: "穿上它，你仿佛化身企鹅——一只温暖又幸福的企鹅。" },
  { id: "business_suit_jacket", name: "商务西装外套", type: "衣物", modifiers: [{ skillId: "electrochemistry", amount: 1 }, { skillId: "empathy", amount: -1 }], description: "曝光度。投资回报率。头脑风暴。客户旅程。" },
  { id: "leather_jacket", name: "皮夹克", type: "衣物", modifiers: [{ skillId: "savoirFaire", amount: 2 }], description: "硬核风范。" },
  { id: "trench_coat", name: "风衣", type: "衣物", modifiers: [{ skillId: "halfLight", amount: 1 }, { skillId: "rhetoric", amount: 1 }], description: "足以藏匿任何秘密。" },

  // 下装
  { id: "yoga_pants", name: "俏皮瑜伽裤", type: "衣物", modifiers: [{ skillId: "composure", amount: 1 }], description: "仿若无物。无物。" },
  { id: "punk_jeans", name: "铆钉破洞牛仔裤", type: "衣物", modifiers: [{ skillId: "electrochemistry", amount: 1 }, { skillId: "suggestion", amount: 1 }], description: "青春叛逆气息以最刺鼻的形式呈现。" },
  { id: "tartan_skirt", name: "格子呢短裙", type: "衣物", modifiers: [{ skillId: "shivers", amount: 1 }], description: "你能感受到变革之风。" },
  { id: "work_boots", name: "工装水靴", type: "衣物", modifiers: [{ skillId: "espritDeCorps", amount: 2 }], description: "埋头苦干时无暇顾及时尚。" },

  // 颈饰
  { id: "expressionist_tie", name: "表现主义领带", type: "衣物", modifiers: [{ skillId: "conceptualization", amount: 1 }, { skillId: "inlandEmpire", amount: 1 }], description: "鲜艳色彩与扭曲形态仿佛在向你低语。" },
  { id: "masonic_talisman", name: "共济会护符", type: "衣物", modifiers: [{ skillId: "inlandEmpire", amount: 3 }, { skillId: "logic", amount: -1 }], description: "凝聚百年智慧的抛光金属。" },
  { id: "clerical_collar", name: "牧师领", type: "衣物", modifiers: [{ skillId: "authority", amount: 1 }, { skillId: "suggestion", amount: -1 }], description: "这枚神圣徽章令你在人群中卓尔不群。" },
  { id: "spiked_collar", name: "尖刺项圈", type: "衣物", modifiers: [{ skillId: "halfLight", amount: 2 }], description: "向政府狂吠！撕咬喂养你的手！" },

  // 上衣
  { id: "fishnet_tank_top", name: "渔网背心", type: "衣物", modifiers: [{ skillId: "painThreshold", amount: 2 }, { skillId: "halfLight", amount: -1 }], description: "安全词需另购。" },
  { id: "golf_polo", name: "高尔夫POLO衫", type: "衣物", modifiers: [{ skillId: "composure", amount: 2 }], description: "将夏日假期视为一种生活方式。" },
  { id: "metal_band_t_shirt", name: "金属乐队T恤", type: "衣物", modifiers: [{ skillId: "shivers", amount: 2 }], description: "硬核到连乐队名字都看不清。" },
  { id: "sheer_shirt", name: "半透视衬衫", type: "衣物", modifiers: [{ skillId: "suggestion", amount: 2 }], description: "在不得体与正式感间游刃有余。" },
  { id: "stained_undershirt", name: "汗渍背心", type: "衣物", modifiers: [{ skillId: "drama", amount: 2 }, { skillId: "volition", amount: -1 }], description: "那是芥末污渍？就当它是芥末酱吧。" },
  { id: "white_shirt", name: "白衬衫", type: "衣物", modifiers: [{ skillId: "logic", amount: 1 }, { skillId: "composure", amount: 1 }, { skillId: "drama", amount: -2 }], description: "正式。办公室风。乏味。" },

  // 鞋履
  { id: "tactical_boots", name: "战术靴", type: "衣物", modifiers: [{ skillId: "endurance", amount: 1 }], description: "经战场考验的踢屁股装备。" },
  { id: "cleats", name: "足球钉鞋", type: "衣物", modifiers: [{ skillId: "physicalInstrument", amount: 1 }, { skillId: "reactionSpeed", amount: 1 }], description: "像超级巨星般横扫赛场。" },
  { id: "grandpa_slippers", name: "爷爷的睡鞋", type: "衣物", modifiers: [{ skillId: "composure", amount: 1 }, { skillId: "reactionSpeed", amount: -1 }], description: "这双舒适的睡鞋曾有过辉煌岁月。" },
  { id: "tourist_sandals", name: "游客凉鞋", type: "衣物", modifiers: [{ skillId: "shivers", amount: 1 }], description: "内含白袜。" },

  // 工具
  { id: "crowbar", name: "撬棍", type: "工具", modifiers: [{ skillId: "physicalInstrument", amount: 2 }], description: "杠杆原理的真实力量。" },
  { id: "flashlight", name: "手电筒", type: "工具", modifiers: [{ skillId: "perception", amount: 2 }], description: "为案件投射光明。" },
  { id: "lockpick_set", name: "开锁工具", type: "工具", modifiers: [{ skillId: "interfacing", amount: 3 }], description: "它开启门锁，而非禁锢自由。" },
  { id: "multitool", name: "多功能工具", type: "工具", modifiers: [{ skillId: "interfacing", amount: 2 }], description: "这款重型工具可切割、弯曲及开启罐装容器。" },
  { id: "grid_sketchbook", name: "网格速写本", type: "工具", modifiers: [{ skillId: "visualCalculus", amount: 2 }], description: "秘密藏于坐标之中。" },

  // 武器
  { id: "spiked_bat", name: "带钉球棒", type: "武器", modifiers: [{ skillId: "painThreshold", amount: 1 }, { skillId: "physicalInstrument", amount: 1 }], description: "你永远不知丧尸末日何时降临。" },
  { id: "broken_bottle", name: "碎酒瓶", type: "武器", modifiers: [{ skillId: "reactionSpeed", amount: 2 }], description: "瓶中已空，是时候用鲜血填满。" },
  { id: "pistol", name: "枪械", type: "武器", modifiers: [{ skillId: "authority", amount: 2 }], description: "死神之指。所指之处，生机断绝。" },
  { id: "larp_sword", name: "实景角色扮演的泡沫剑", type: "武器", modifiers: [{ skillId: "drama", amount: 2 }], description: "虽非真刃，但足以铸就传奇圣骑士。" },
  { id: "pepper_grinder", name: "胡椒研磨器", type: "武器", modifiers: [{ skillId: "halfLight", amount: 2 }], description: "战备之道与沙拉调味同样需要警醒与周全。" },
];

export interface Drug {
  id: string;
  name: string;
  description: string;
  duration: string;
  tempModifiers: { skillId: string; amount: number }[];
  permStat: "health" | "morale";
  permAmount: number;
}

export const INITIAL_DRUGS: Drug[] = [
  {
    id: "alcohol",
    name: "酒精",
    description: "家庭主妇和校车司机的挚友，这种促进外向的万能魔药随处可见，拥有缤纷色泽、多样风味与瓶身造型。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "physicalInstrument", amount: 2 },
      { skillId: "halfLight", amount: 2 },
      { skillId: "endurance", amount: 2 },
      { skillId: "volition", amount: -2 },
    ],
    permStat: "morale",
    permAmount: -1
  },
  {
    id: "amphetamine",
    name: "安非他命",
    description: "这种非法药物能刺激中枢神经系统，让你的 CPU 超频运转。速度就是王道。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "encyclopedia", amount: 2 },
      { skillId: "handEyeCoordination", amount: 2 },
      { skillId: "interfacing", amount: 2 },
      { skillId: "logic", amount: -2 }
    ],
    permStat: "morale",
    permAmount: -1
  },
  {
    id: "marijuana",
    name: "大麻",
    description: "这种广受欢迎的镇静药物通常禁种禁售却不禁吸食。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "inlandEmpire", amount: 2 },
      { skillId: "painThreshold", amount: 2 },
      { skillId: "espritDeCorps", amount: 2 },
      { skillId: "encyclopedia", amount: -2 }
    ],
    permStat: "morale",
    permAmount: -1
  },
  {
    id: "cocaine",
    name: "可卡因",
    description: "这种易吸入的白色粉末能带来狂喜浪潮，刺激神经系统与警觉性。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "perception", amount: 2 },
      { skillId: "authority", amount: 2 },
      { skillId: "reactionSpeed", amount: 2 },
      { skillId: "inlandEmpire", amount: -2 }
    ],
    permStat: "health",
    permAmount: -1
  },
  {
    id: "nicotine",
    name: "尼古丁",
    description: "香烟是合法且易获取的药剂。吸烟时，你会产生比实际形象更酷的错觉。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "logic", amount: 2 },
      { skillId: "drama", amount: 2 },
      { skillId: "suggestion", amount: 2 },
      { skillId: "endurance", amount: -2 }
    ],
    permStat: "health",
    permAmount: -1
  },
  {
    id: "mushrooms",
    name: "致幻菇",
    description: "稀有的裸盖菇能为你开启超感官世界。准备好来一场迷幻之旅吧。",
    duration: "当前场景",
    tempModifiers: [
      { skillId: "empathy", amount: 2 },
      { skillId: "shivers", amount: 2 },
      { skillId: "conceptualization", amount: 2 },
      { skillId: "rhetoric", amount: -2 }
    ],
    permStat: "health",
    permAmount: -1
  }
];

export interface Thought {
  id: string;
  name: string;
  problem: string;
  progress: number; // 0-3
  internalized: boolean;
  conclusion?: string;
  modifiers?: { skillId: string; amount: number }[];
  trigger?: string;
}

export interface Appearance {
  gender: string;
  identity: string;
  personality: string;
  trait1: string;
  trait2: string;
  interest: string;
  quirk: string;
  bodyType: string;
  vibe: string;
  feature: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  clothingStyle: string;
  accessories: string;
}

export interface State {
  id: string;
  name: string;
  category: "mental" | "physical";
  severity: number; // 1 to 3 (will be applied as penalty)
  description: string;
}

export interface TagItem {
  id: string;
  name: string;
  effect: number; // -3 to +3
  description?: string;
  invokedForXp?: boolean; // When checked/invoked, grants 1 XP
}

export interface Character {
  id: string;
  name: string;
  description: string;
  morale: number; // 0-5
  health: number; // 0-5
  xp: number;
  skills: Record<string, number>; // Natural scores
  modifiers: Record<string, number>; // Temporary from items/thoughts
  activeGearIds: string[];
  gearIds: string[];
  drugIds?: string[];
  activeDrugId?: string | null;
  thoughts: Thought[];
  tags: TagItem[];
  states: State[]; // Negative tags representing damage / conditions
  tokens: number; // Overrides and narrative opportunities
  appearance: Appearance;
  avatar?: string; // Data URL for uploaded avatar
  endingStatement?: string; // Narrative explanation of retirement or death when health or morale is 0
  customGears?: Gear[];
  customDrugs?: Drug[];
}

export const INITIAL_CHARACTER: Character = {
  id: "detective_init",
  name: "无名氏",
  description: "一个失忆的调查员。",
  morale: 5,
  health: 5,
  xp: 0,
  skills: Object.fromEntries(SKILLS.map(s => [s.id, 0])),
  modifiers: Object.fromEntries(SKILLS.map(s => [s.id, 0])),
  activeGearIds: [],
  gearIds: [],
  drugIds: [],
  activeDrugId: null,
  thoughts: [],
  tags: [],
  states: [],
  tokens: 1,
  appearance: {
    gender: "",
    identity: "调查员",
    personality: "",
    trait1: "",
    trait2: "",
    interest: "",
    quirk: "",
    bodyType: "",
    vibe: "",
    feature: "",
    hairStyle: "尚未重构",
    hairColor: "深灰色",
    eyeColor: "浅褐色",
    skinTone: "自然色",
    clothingStyle: "调查员西装",
    accessories: "破损的领带",
  },
  customGears: [],
  customDrugs: []
};
