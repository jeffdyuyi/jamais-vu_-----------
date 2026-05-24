const fs = require('fs');
const file = 'e:/YJF/jamais-vu_-旧事如新-调查员档案/src/types.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'type: "衣物" | "工具" | "武器";',
  'type: "衣物" | "工具" | "武器";\n  slot?: "眼镜" | "手部" | "头部" | "外套" | "下装" | "颈饰" | "上衣" | "鞋履" | string;'
);

const replacements = [
  { regex: /name: "艺术评论家眼镜", type: "衣物",/g, replace: 'name: "艺术评论家眼镜", type: "衣物", slot: "眼镜",' },
  { regex: /name: "机车党墨镜", type: "衣物",/g, replace: 'name: "机车党墨镜", type: "衣物", slot: "眼镜",' },
  { regex: /name: "黑超", type: "衣物",/g, replace: 'name: "黑超", type: "衣物", slot: "眼镜",' },
  { regex: /name: "资产阶级单片镜", type: "衣物",/g, replace: 'name: "资产阶级单片镜", type: "衣物", slot: "眼镜",' },
  { regex: /name: "怪咖记者眼镜", type: "衣物",/g, replace: 'name: "怪咖记者眼镜", type: "衣物", slot: "眼镜",' },
  { regex: /name: "图书管理员眼镜", type: "衣物",/g, replace: 'name: "图书管理员眼镜", type: "衣物", slot: "眼镜",' },
  { regex: /name: "海盗眼罩", type: "衣物",/g, replace: 'name: "海盗眼罩", type: "衣物", slot: "眼镜",' },
  
  { regex: /name: "大红宝石戒指", type: "衣物",/g, replace: 'name: "大红宝石戒指", type: "衣物", slot: "手部",' },
  { regex: /name: "清洁手套", type: "衣物",/g, replace: 'name: "清洁手套", type: "衣物", slot: "手部",' },
  { regex: /name: "翡翠戒指", type: "衣物",/g, replace: 'name: "翡翠戒指", type: "衣物", slot: "手部",' },
  { regex: /name: "花饰手镯", type: "衣物",/g, replace: 'name: "花饰手镯", type: "衣物", slot: "手部",' },
  { regex: /name: "乳胶手套", type: "衣物",/g, replace: 'name: "乳胶手套", type: "衣物", slot: "手部",' },
  { regex: /name: "皮革手链", type: "衣物",/g, replace: 'name: "皮革手链", type: "衣物", slot: "手部",' },
  { regex: /name: "北方连指手套", type: "衣物",/g, replace: 'name: "北方连指手套", type: "衣物", slot: "手部",' },

  { regex: /name: "单身派对羞耻帽", type: "衣物",/g, replace: 'name: "单身派对羞耻帽", type: "衣物", slot: "头部",' },
  { regex: /name: "香蕉头带", type: "衣物",/g, replace: 'name: "香蕉头带", type: "衣物", slot: "头部",' },
  { regex: /name: "赌场荷官帽", type: "衣物",/g, replace: 'name: "赌场荷官帽", type: "衣物", slot: "头部",' },
  { regex: /name: "侦探软呢帽", type: "衣物",/g, replace: 'name: "侦探软呢帽", type: "衣物", slot: "头部",' },
  { regex: /name: "针织帽", type: "衣物",/g, replace: 'name: "针织帽", type: "衣物", slot: "头部",' },
  { regex: /name: "公主头冠", type: "衣物",/g, replace: 'name: "公主头冠", type: "衣物", slot: "头部",' },
  { regex: /name: "草编遮阳帽", type: "衣物",/g, replace: 'name: "草编遮阳帽", type: "衣物", slot: "头部",' },
  { regex: /name: "旧棒球帽", type: "衣物",/g, replace: 'name: "旧棒球帽", type: "衣物", slot: "头部",' },

  { regex: /name: "御寒派克大衣", type: "衣物",/g, replace: 'name: "御寒派克大衣", type: "衣物", slot: "外套",' },
  { regex: /name: "商务西装外套", type: "衣物",/g, replace: 'name: "商务西装外套", type: "衣物", slot: "外套",' },
  { regex: /name: "皮夹克", type: "衣物",/g, replace: 'name: "皮夹克", type: "衣物", slot: "外套",' },
  { regex: /name: "风衣", type: "衣物",/g, replace: 'name: "风衣", type: "衣物", slot: "外套",' },

  { regex: /name: "俏皮瑜伽裤", type: "衣物",/g, replace: 'name: "俏皮瑜伽裤", type: "衣物", slot: "下装",' },
  { regex: /name: "铆钉破洞牛仔裤", type: "衣物",/g, replace: 'name: "铆钉破洞牛仔裤", type: "衣物", slot: "下装",' },
  { regex: /name: "格子呢短裙", type: "衣物",/g, replace: 'name: "格子呢短裙", type: "衣物", slot: "下装",' },
  { regex: /name: "工装水靴", type: "衣物",/g, replace: 'name: "工装水靴", type: "衣物", slot: "鞋履",' },

  { regex: /name: "表现主义领带", type: "衣物",/g, replace: 'name: "表现主义领带", type: "衣物", slot: "颈饰",' },
  { regex: /name: "共济会护符", type: "衣物",/g, replace: 'name: "共济会护符", type: "衣物", slot: "颈饰",' },
  { regex: /name: "牧师领", type: "衣物",/g, replace: 'name: "牧师领", type: "衣物", slot: "颈饰",' },
  { regex: /name: "尖刺项圈", type: "衣物",/g, replace: 'name: "尖刺项圈", type: "衣物", slot: "颈饰",' },

  { regex: /name: "渔网背心", type: "衣物",/g, replace: 'name: "渔网背心", type: "衣物", slot: "上衣",' },
  { regex: /name: "高尔夫POLO衫", type: "衣物",/g, replace: 'name: "高尔夫POLO衫", type: "衣物", slot: "上衣",' },
  { regex: /name: "金属乐队T恤", type: "衣物",/g, replace: 'name: "金属乐队T恤", type: "衣物", slot: "上衣",' },
  { regex: /name: "半透视衬衫", type: "衣物",/g, replace: 'name: "半透视衬衫", type: "衣物", slot: "上衣",' },
  { regex: /name: "汗渍背心", type: "衣物",/g, replace: 'name: "汗渍背心", type: "衣物", slot: "上衣",' },
  { regex: /name: "白衬衫", type: "衣物",/g, replace: 'name: "白衬衫", type: "衣物", slot: "上衣",' },

  { regex: /name: "战术靴", type: "衣物",/g, replace: 'name: "战术靴", type: "衣物", slot: "鞋履",' },
  { regex: /name: "足球钉鞋", type: "衣物",/g, replace: 'name: "足球钉鞋", type: "衣物", slot: "鞋履",' },
  { regex: /name: "爷爷的睡鞋", type: "衣物",/g, replace: 'name: "爷爷的睡鞋", type: "衣物", slot: "鞋履",' },
  { regex: /name: "游客凉鞋", type: "衣物",/g, replace: 'name: "游客凉鞋", type: "衣物", slot: "鞋履",' }
];

replacements.forEach(r => {
  content = content.replace(r.regex, r.replace);
});

fs.writeFileSync(file, content);
console.log("Updated types.ts");
