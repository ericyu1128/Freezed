/**
 * Freezed — UI translation dictionary
 *
 * `Dictionary` is the single source of truth for every static UI string.
 * Both `en` and `zh` are annotated with the `Dictionary` type, so TypeScript
 * rejects either locale at compile time if a key is missing, renamed, or the
 * wrong shape — there is no runtime fallback path for these strings.
 *
 * Scope note: this dictionary covers the app's static UI chrome plus the
 * enum-driven labels that change live with user selections (activity,
 * level, style, temperature, budget tier, gear category, performance axes).
 * It does not cover the long-form narrative strings the matching engine
 * bakes into a result at compute time (the "why this matches you" reasoning,
 * bullet points, sizing-derivation notes, lens/jacket guidance) — those are
 * assembled once per submission by `lib/matcherLogic.ts` and stay in
 * English; translating that generator is a separate effort from this UI
 * localization pass.
 */

import type {
  Activity,
  BudgetTier,
  Gender,
  Level,
  RidingStyle,
  Temperature,
} from '@/lib/types';
import type { StepId } from '@/lib/stepFlow';

export type Language = 'en' | 'zh';

export const LANGUAGE_STORAGE_KEY = 'freezed:lang';

interface OptionCopy {
  label: string;
  description: string;
}

export interface Dictionary {
  htmlLang: string;

  nav: {
    matcherLink: string;
    howItWorksLink: string;
    seasonBadge: string;
    startMatching: string;
    madeBy: string;
  };

  languageSwitch: {
    ariaLabel: string;
    english: string;
    chinese: string;
  };

  hero: {
    badge: string;
    titleLead: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    statCatalogueItems: string;
    statBrands: string;
    statCategories: string;
    statBudgetTiers: string;
    matcherHint: string;
  };

  howItWorks: {
    eyebrow: string;
    heading: string;
    cards: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
    caveatTitle: string;
    caveatBody: string;
    caveatCta: string;
  };

  form: {
    stepOf: (current: number, total: number) => string;
    steps: Record<StepId, { title: string; blurb: string }>;
    sections: {
      activity: string;
      fitScale: string;
      abilityLevel: string;
      ridingStyle: string;
      typicalConditions: string;
      budgetTier: string;
    };
    activity: Record<Activity, OptionCopy>;
    gender: Record<Gender, OptionCopy>;
    level: Record<Level, OptionCopy>;
    style: Record<RidingStyle, OptionCopy>;
    temperature: Record<Temperature, OptionCopy>;
    budget: Record<BudgetTier, OptionCopy & { range: string }>;
    heightLabel: string;
    heightHint: string;
    heightUnit: string;
    weightLabel: string;
    weightHint: string;
    weightUnit: string;
    heightErrorRequired: string;
    heightErrorRange: (min: number, max: number) => string;
    weightErrorRequired: string;
    weightErrorRange: (min: number, max: number) => string;
    metricsInfo: string;
    conditionsInfo: string;
    yourProfile: string;
    back: string;
    continueBtn: string;
    matchMyGear: string;
    matching: string;
  };

  dashboard: {
    recommendationDashboard: string;
    piecesMatched: (n: number) => string;
    saveConfiguration: string;
    startOver: string;
    skiLabel: string;
    snowboardLabel: string;
    unisexFit: string;
    womensFit: string;
    mensFit: string;
    skiLength: string;
    boardLength: string;
    bootFlexTarget: string;
    goggleVltTarget: string;
    kitTotal: string;
    windowRange: (min: number, max: number) => string;
    itemsCheapest: (n: number) => string;
    howWeCalculated: (label: string) => string;
    recommendedLabel: (label: string) => string;
    poleLengthNote: (pole: number, mondo: string) => string;
    mondoOnlyNote: (mondo: string) => string;
    noGearTitle: string;
    noGearBody: string;
    adjustProfile: string;
  };

  gearCard: {
    performanceProfile: string;
    calculatedForYou: string;
    fullManufacturerSpecs: string;
    priceComparison: string;
    save: (amount: string) => string;
    best: string;
    whyThisMatches: string;
    compatibilityScore: string;
    compatibilityBreakdown: string;
    rankedMatches: (count: number) => string;
    sortedByMatch: string;
    bestPrice: string;
    at: string;
    viewDeal: string;
  };

  saveModal: {
    title: string;
    description: string;
    itemsSummary: (count: number, total: string) => string;
    cancel: string;
    save: string;
    close: string;
    suggestions: [string, string, string, string];
  };

  savedVault: {
    trigger: string;
    heading: string;
    empty: string;
    confirmRename: string;
    cancelRename: string;
    renameLabel: (name: string) => string;
    deleteLabel: (name: string) => string;
    deleteConfirm: string;
    deleteBtn: string;
    cancelBtn: string;
    reload: string;
    itemsSummary: (n: number, total: string) => string;
  };

  loading: {
    heading: string;
    srLabel: string;
    phases: [string, string, string, string, string];
  };

  stickman: {
    title: string;
    hoverHint: string;
    awaitingHint: string;
    equipped: (n: number, total: number) => string;
    equippedGear: string;
    awaitingMatch: string;
    metricWaist: string;
    metricWaistWidth: string;
    metricBootFlex: string;
    metricLensVlt: string;
    ariaLabel: string;
  };

  footer: {
    madeBy: string;
    matcherHeading: string;
    matcherItems: [string, string, string];
    retailersHeading: string;
    brandsHeading: string;
    copyright: (year: number) => string;
    disclaimer: string;
  };
}

export const en: Dictionary = {
  htmlLang: 'en',

  nav: {
    matcherLink: 'Matcher',
    howItWorksLink: 'How it works',
    seasonBadge: '2025/26 season data',
    startMatching: 'Start matching',
    madeBy: 'Made by Eric Yu',
  },

  languageSwitch: {
    ariaLabel: 'Switch language',
    english: 'EN',
    chinese: '中文',
  },

  hero: {
    badge: 'Gear matched to your body, not a size chart',
    titleLead: 'Stop guessing your',
    titleHighlight: 'ski length, boot flex and lens tint',
    titleEnd: '.',
    subtitle:
      'Freezed takes your height, weight, ability, riding style, expected temperature and budget, then calculates a real spec sheet and matches it against a catalogue of skis, boards, boots, helmets, goggles and outerwear.',
    ctaPrimary: 'Build my loadout',
    ctaSecondary: 'See the maths',
    statCatalogueItems: 'Catalogue items',
    statBrands: 'Brands',
    statCategories: 'Gear categories',
    statBudgetTiers: 'Budget tiers',
    matcherHint:
      'Complete the questionnaire and every body zone lights up with the gear matched to it. Hover a marker to jump to its card.',
  },

  howItWorks: {
    eyebrow: 'Under the hood',
    heading: 'How the matcher thinks',
    cards: [
      {
        title: 'Sizing from your metrics',
        body: 'Height sets the base length, style shifts it 5–15 cm, ability adds or removes up to 6 cm, and body mass fine-tunes by ±5 cm.',
      },
      {
        title: 'Waist width & boot flex',
        body: 'Waist width follows your discipline — 72–84 mm carving through to 105–118 mm backcountry. Flex indexes are split by gender and ability.',
      },
      {
        title: 'Conditions drive optics & insulation',
        body: 'Freezing days pull high-VLT storm lenses and down insulation. Spring days pull low-VLT sun lenses and uninsulated shells.',
      },
      {
        title: 'Budget-aware ranking',
        body: 'Your tier is a hard filter — items more than one tier away are dropped, and exact-tier matches are weighted heavily in the score.',
      },
    ],
    caveatTitle: 'One caveat worth repeating',
    caveatBody:
      'These numbers are a well-reasoned starting point, not a fitting. Boots in particular should always be shell-fitted in person — the estimated Mondopoint size here is derived from height, and feet do not read the same chart.',
    caveatCta: 'Back to the matcher',
  },

  form: {
    stepOf: (current, total) => `Step ${current} of ${total}`,
    steps: {
      discipline: {
        title: 'Discipline',
        blurb: 'What are you riding, and which fit scale should we use?',
      },
      metrics: {
        title: 'Body metrics',
        blurb: 'Length and flex both scale off height and mass.',
      },
      ability: {
        title: 'Ability & style',
        blurb: 'This drives waist width, length and boot stiffness.',
      },
      conditions: {
        title: 'Conditions',
        blurb: 'Temperature sets lens VLT and jacket insulation.',
      },
      budget: {
        title: 'Budget',
        blurb: 'We filter the catalogue to your spend bracket.',
      },
    },
    sections: {
      activity: 'Activity',
      fitScale: 'Fit scale',
      abilityLevel: 'Ability level',
      ridingStyle: 'Riding style',
      typicalConditions: 'Typical conditions',
      budgetTier: 'Budget tier',
    },
    activity: {
      ski: {
        label: 'Ski',
        description: 'Two planks, poles, and a length calculation driven by height and style.',
      },
      snowboard: {
        label: 'Snowboard',
        description: 'One board, sized as a ratio of your height with a waist-width check.',
      },
    },
    gender: {
      male: { label: "Men's", description: "Men's construction and flex indices." },
      female: {
        label: "Women's",
        description: 'Lighter layups, lower cuff heights, softer flex scale.',
      },
      unisex: { label: 'Unisex', description: 'No gendered filtering — score on fit alone.' },
    },
    level: {
      beginner: {
        label: 'Beginner',
        description: 'Green runs, still working on linked turns. Shorter and softer is easier.',
      },
      intermediate: {
        label: 'Intermediate',
        description: 'Confident on blues, starting to carve and explore off the groomers.',
      },
      advanced: {
        label: 'Advanced',
        description: 'Comfortable on blacks, bumps and variable snow at speed.',
      },
      expert: {
        label: 'Expert',
        description: 'Anything, anywhere. You want stability and edge hold over forgiveness.',
      },
    },
    style: {
      piste: {
        label: 'Piste / Carving',
        description: 'Groomers and hardpack. Narrow waist, quick edge-to-edge.',
      },
      'all-mountain': {
        label: 'All-Mountain',
        description: 'A bit of everything — the 85–98 mm sweet spot.',
      },
      freestyle: {
        label: 'Freestyle / Park',
        description: 'Jumps, rails and switch riding. Twin tips, shorter lengths.',
      },
      backcountry: {
        label: 'Backcountry / Powder',
        description: 'Deep snow and touring. Wide waist, extra length for float.',
      },
    },
    temperature: {
      freezing: {
        label: 'Freezing',
        description: '-15 °C and below. High-insulation down and high-VLT storm lenses.',
      },
      moderate: {
        label: 'Moderate',
        description: '-5 °C to 0 °C. Mid-weight insulation, all-round 18–40% VLT lens.',
      },
      spring: {
        label: 'Spring',
        description: 'Above 0 °C. Uninsulated shells and low-VLT polarised sun lenses.',
      },
    },
    budget: {
      budget: {
        label: 'Budget',
        description: 'Entry-level / Value. Proven basics, no exotic materials.',
        range: '≈ $1,000 – $1,400 full kit',
      },
      'mid-range': {
        label: 'Mid-Range',
        description: 'Balanced performance / price. Where most riders should shop.',
        range: '≈ $1,800 – $2,400 full kit',
      },
      premium: {
        label: 'Premium',
        description: 'Top-tier / Pro construction. Titanal, GORE-TEX Pro, magnetic optics.',
        range: '≈ $2,800 – $3,600 full kit',
      },
    },
    heightLabel: 'Height',
    heightHint: 'Standing height, without boots.',
    heightUnit: 'cm',
    weightLabel: 'Weight',
    weightHint: 'Body weight — drives the length load modifier.',
    weightUnit: 'kg',
    heightErrorRequired: 'Enter your height in centimetres.',
    heightErrorRange: (min, max) => `Height must be between ${min} and ${max} cm.`,
    weightErrorRequired: 'Enter your weight in kilograms.',
    weightErrorRange: (min, max) => `Weight must be between ${min} and ${max} kg.`,
    metricsInfo:
      'Height sets the base length; weight adjusts it by up to ±5 cm. A rider who is heavy for their height flexes a ski more deeply, so a little extra length keeps the shovel from folding at speed.',
    conditionsInfo:
      'Conditions decide two things outright: goggle VLT (how much light the lens lets through) and jacket insulation. Freezing days get high-VLT storm lenses and down; spring days get low-VLT sun lenses and uninsulated shells.',
    yourProfile: 'Your profile',
    back: 'Back',
    continueBtn: 'Continue',
    matchMyGear: 'Match my gear',
    matching: 'Matching…',
  },

  dashboard: {
    recommendationDashboard: 'Recommendation dashboard',
    piecesMatched: (n) => `${n} pieces matched to your profile`,
    saveConfiguration: 'Save Configuration',
    startOver: 'Start over',
    skiLabel: 'Ski',
    snowboardLabel: 'Snowboard',
    unisexFit: 'Unisex fit',
    womensFit: "Women's fit",
    mensFit: "Men's fit",
    skiLength: 'Ski length',
    boardLength: 'Board length',
    bootFlexTarget: 'Boot flex target',
    goggleVltTarget: 'Goggle VLT target',
    kitTotal: 'Kit total (best prices)',
    windowRange: (min, max) => `Window ${min}–${max} cm`,
    itemsCheapest: (n) => `${n} items · cheapest retailer each`,
    howWeCalculated: (label) => `How we calculated your ${label.toLowerCase()}`,
    recommendedLabel: (label) => `Recommended ${label.toLowerCase()}`,
    poleLengthNote: (pole, mondo) =>
      `Pole length for your height: ${pole} cm. Estimated Mondopoint boot size: ${mondo}.`,
    mondoOnlyNote: (mondo) => `Estimated Mondopoint boot size: ${mondo}.`,
    noGearTitle: 'No gear cleared the filters',
    noGearBody:
      'Nothing in the catalogue matched that combination of discipline and budget. Widen the budget tier or change the riding style and run it again.',
    adjustProfile: 'Adjust my profile',
  },

  gearCard: {
    performanceProfile: 'Performance profile',
    calculatedForYou: 'Calculated for you',
    fullManufacturerSpecs: 'Full manufacturer specs',
    priceComparison: 'Price comparison',
    save: (amount) => `Save ${amount}`,
    best: 'Best',
    whyThisMatches: 'Why this matches you',
    compatibilityScore: 'Compatibility',
    compatibilityBreakdown: 'Score breakdown',
    rankedMatches: (count) => `Ranked matches (${count})`,
    sortedByMatch: 'Sorted by best match',
    bestPrice: 'Best price',
    at: 'at',
    viewDeal: 'View deal',
  },

  saveModal: {
    title: 'Save this configuration',
    description:
      'Name your setup so you can reload it later — e.g. "Deep Powder Rig" or "Park & Rails".',
    itemsSummary: (count, total) => `${count} items · ${total} best-price total`,
    cancel: 'Cancel',
    save: 'Save configuration',
    close: 'Close',
    suggestions: ['Deep Powder Rig', 'Park & Rails', 'Groomer Carver', 'One-Boot Quiver'],
  },

  savedVault: {
    trigger: 'Saved Vault',
    heading: 'Saved configurations',
    empty: 'Nothing saved yet. Use "Save Configuration" to bookmark this loadout.',
    confirmRename: 'Confirm rename',
    cancelRename: 'Cancel rename',
    renameLabel: (name) => `Rename ${name}`,
    deleteLabel: (name) => `Delete ${name}`,
    deleteConfirm: 'Delete this setup?',
    deleteBtn: 'Delete',
    cancelBtn: 'Cancel',
    reload: 'Reload this setup',
    itemsSummary: (n, total) => `${n} items · ${total}`,
  },

  loading: {
    heading: 'Matching your kit',
    srLabel: 'Loading recommendations',
    phases: [
      'Reading your body metrics…',
      'Calculating length, waist width and flex…',
      'Filtering the catalogue to your budget…',
      'Scoring 40+ items across 5 categories…',
      'Comparing retailer prices…',
    ],
  },

  stickman: {
    title: 'Your loadout',
    hoverHint: 'Hover a marker to highlight the matching card',
    awaitingHint: 'Markers light up once you run the matcher',
    equipped: (n, total) => `${n}/${total} equipped`,
    equippedGear: 'Equipped gear',
    awaitingMatch: 'Awaiting match',
    metricWaist: 'Waist',
    metricWaistWidth: 'Waist width',
    metricBootFlex: 'Boot flex',
    metricLensVlt: 'Lens VLT',
    ariaLabel: 'Stickman rider showing recommended gear placement',
  },

  footer: {
    madeBy: 'Made by',
    matcherHeading: 'Matcher',
    matcherItems: ['Ski & board sizing', 'Boot flex index', 'Lens VLT targeting'],
    retailersHeading: 'Retailers',
    brandsHeading: 'Brands',
    copyright: (year) =>
      `© ${year} Freezed. Built by Eric Yu. Prices are illustrative demo data; retailer links run a live search on each store.`,
    disclaimer: 'Sizing output is guidance, not a fitting. Always shell-fit boots with a qualified bootfitter.',
  },
};

export const zh: Dictionary = {
  htmlLang: 'zh-CN',

  nav: {
    matcherLink: '装备匹配',
    howItWorksLink: '工作原理',
    seasonBadge: '2025/26 雪季数据',
    startMatching: '开始匹配',
    madeBy: '由 Eric Yu 制作',
  },

  languageSwitch: {
    ariaLabel: '切换语言',
    english: 'EN',
    chinese: '中文',
  },

  hero: {
    badge: '根据你的身体数据匹配装备,而非尺码表',
    titleLead: '不再猜测你的',
    titleHighlight: '滑雪板长度、靴子硬度与镜片色调',
    titleEnd: '。',
    subtitle:
      'Freezed 会根据你的身高、体重、能力等级、骑行风格、预期气温和预算,计算出一份真实的规格清单,并从雪板、雪靴、头盔、护目镜和外套的完整目录中为你匹配装备。',
    ctaPrimary: '开始搭配装备',
    ctaSecondary: '查看计算逻辑',
    statCatalogueItems: '商品数量',
    statBrands: '品牌数量',
    statCategories: '装备类别',
    statBudgetTiers: '预算档位',
    matcherHint: '填写完问卷后,每个身体部位都会点亮对应匹配的装备。将鼠标悬停在标记上可跳转到对应卡片。',
  },

  howItWorks: {
    eyebrow: '幕后原理',
    heading: '匹配器如何计算',
    cards: [
      {
        title: '根据身体数据计算尺寸',
        body: '身高决定基础长度,骑行风格上下浮动 5–15 厘米,能力等级增减最多 6 厘米,体重再微调 ±5 厘米。',
      },
      {
        title: '腰宽与靴子硬度',
        body: '腰宽根据你的骑行方向确定——刻滑 72–84 毫米,直到野雪穿越 105–118 毫米。硬度指数按性别和能力等级区分。',
      },
      {
        title: '天气条件决定镜片与保暖层',
        body: '严寒天气会匹配高 VLT 的暴风雪镜片和羽绒保暖层。春季天气则匹配低 VLT 的防眩光镜片和无保暖外壳。',
      },
      {
        title: '预算感知排序',
        body: '你的预算档位是硬性筛选条件——超出一档以上的商品会被剔除,精确匹配档位的商品在评分中权重更高。',
      },
    ],
    caveatTitle: '一个值得重复提醒的注意事项',
    caveatBody:
      '这些数字是经过推算的合理起点,并非最终试穿结果。雪靴尤其应当亲自到店试穿——这里的预估 Mondopoint 尺码是根据身高推算的,而每个人的脚型并不完全符合同一张表。',
    caveatCta: '返回匹配器',
  },

  form: {
    stepOf: (current, total) => `第 ${current} 步 / 共 ${total} 步`,
    steps: {
      discipline: {
        title: '运动类型',
        blurb: '你打算玩什么装备?我们应该使用哪种尺码标准?',
      },
      metrics: {
        title: '身体数据',
        blurb: '长度和硬度都基于身高与体重进行缩放。',
      },
      ability: {
        title: '能力与风格',
        blurb: '这决定了腰宽、长度和雪靴硬度。',
      },
      conditions: {
        title: '天气条件',
        blurb: '气温决定镜片 VLT 和外套保暖等级。',
      },
      budget: {
        title: '预算',
        blurb: '我们会根据你的消费档位筛选商品目录。',
      },
    },
    sections: {
      activity: '运动类型',
      fitScale: '尺码标准',
      abilityLevel: '能力等级',
      ridingStyle: '骑行风格',
      typicalConditions: '常见天气条件',
      budgetTier: '预算档位',
    },
    activity: {
      ski: {
        label: '双板滑雪',
        description: '两块雪板加雪杖,长度根据身高与风格计算。',
      },
      snowboard: {
        label: '单板滑雪',
        description: '一块雪板,尺寸按身高比例计算,并核对腰宽。',
      },
    },
    gender: {
      male: { label: '男款', description: '男款结构与硬度指数。' },
      female: {
        label: '女款',
        description: '更轻的板身结构、更低的靴筒高度、更软的硬度标准。',
      },
      unisex: { label: '中性', description: '不做性别筛选——仅按合身度评分。' },
    },
    level: {
      beginner: {
        label: '初学者',
        description: '绿道为主,仍在练习连续转弯。更短更软的装备更容易上手。',
      },
      intermediate: {
        label: '中级',
        description: '蓝道游刃有余,开始尝试刻滑并探索非压雪区域。',
      },
      advanced: {
        label: '高级',
        description: '黑道、包状雪和多变雪况都能高速应对。',
      },
      expert: {
        label: '专家级',
        description: '任何地形都能驾驭。相比容错性,你更看重稳定性与抓地力。',
      },
    },
    style: {
      piste: {
        label: '压雪道 / 刻滑',
        description: '压雪道与硬雪地形。腰宽较窄,换刃迅速。',
      },
      'all-mountain': {
        label: '全地形',
        description: '什么都想玩一点——85–98 毫米的甜蜜点。',
      },
      freestyle: {
        label: '自由式 / 公园',
        description: '跳台、道具与反脚骑行。双翘板头,长度更短。',
      },
      backcountry: {
        label: '野雪 / 后山穿越',
        description: '深雪与登山穿越。腰宽更宽,长度更长以增加浮力。',
      },
    },
    temperature: {
      freezing: {
        label: '严寒',
        description: '零下 15°C 及以下。高保暖羽绒与高 VLT 暴风雪镜片。',
      },
      moderate: {
        label: '适中',
        description: '零下 5°C 到 0°C。中等保暖,全能型 18–40% VLT 镜片。',
      },
      spring: {
        label: '春季',
        description: '0°C 以上。无保暖外壳与低 VLT 偏光墨镜片。',
      },
    },
    budget: {
      budget: {
        label: '经济型',
        description: '入门 / 高性价比。成熟基础款,不含特殊材质。',
        range: '≈ 全套 $1,000 – $1,400',
      },
      'mid-range': {
        label: '中端',
        description: '性能与价格均衡。大多数玩家的最佳选择。',
        range: '≈ 全套 $1,800 – $2,400',
      },
      premium: {
        label: '高端',
        description: '顶级 / 专业级结构。钛合金、GORE-TEX Pro、磁吸镜片。',
        range: '≈ 全套 $2,800 – $3,600',
      },
    },
    heightLabel: '身高',
    heightHint: '站立身高,不含雪靴。',
    heightUnit: '厘米',
    weightLabel: '体重',
    weightHint: '体重——决定长度的负重修正值。',
    weightUnit: '公斤',
    heightErrorRequired: '请输入以厘米为单位的身高。',
    heightErrorRange: (min, max) => `身高必须介于 ${min} 到 ${max} 厘米之间。`,
    weightErrorRequired: '请输入以公斤为单位的体重。',
    weightErrorRange: (min, max) => `体重必须介于 ${min} 到 ${max} 公斤之间。`,
    metricsInfo:
      '身高决定基础长度;体重会调整最多 ±5 厘米。相对身高偏重的骑行者会让雪板弯曲更深,因此稍长的长度能防止板头在高速时过度弯折。',
    conditionsInfo:
      '天气条件直接决定两件事:护目镜 VLT(镜片透光率)和外套保暖等级。严寒天气搭配高 VLT 暴风雪镜片与羽绒;春季天气搭配低 VLT 墨镜片与无保暖外壳。',
    yourProfile: '你的档案',
    back: '上一步',
    continueBtn: '下一步',
    matchMyGear: '匹配我的装备',
    matching: '匹配中…',
  },

  dashboard: {
    recommendationDashboard: '推荐仪表盘',
    piecesMatched: (n) => `已为你的档案匹配 ${n} 件装备`,
    saveConfiguration: '保存配置',
    startOver: '重新开始',
    skiLabel: '双板滑雪',
    snowboardLabel: '单板滑雪',
    unisexFit: '中性版型',
    womensFit: '女款版型',
    mensFit: '男款版型',
    skiLength: '滑雪板长度',
    boardLength: '单板长度',
    bootFlexTarget: '雪靴硬度目标',
    goggleVltTarget: '护目镜 VLT 目标',
    kitTotal: '全套总价(最低价)',
    windowRange: (min, max) => `区间 ${min}–${max} 厘米`,
    itemsCheapest: (n) => `${n} 件商品 · 各取最低价商家`,
    howWeCalculated: (label) => `我们如何计算你的${label}`,
    recommendedLabel: (label) => `推荐${label}`,
    poleLengthNote: (pole, mondo) =>
      `根据你的身高推荐的雪杖长度:${pole} 厘米。预估 Mondopoint 雪靴尺码:${mondo}。`,
    mondoOnlyNote: (mondo) => `预估 Mondopoint 雪靴尺码:${mondo}。`,
    noGearTitle: '没有装备通过筛选',
    noGearBody: '目录中没有符合该运动类型与预算组合的商品。请放宽预算档位或更改骑行风格后重试。',
    adjustProfile: '调整我的档案',
  },

  gearCard: {
    performanceProfile: '性能表现',
    calculatedForYou: '为你计算',
    fullManufacturerSpecs: '完整厂商规格',
    priceComparison: '比价',
    save: (amount) => `省 ${amount}`,
    best: '最优',
    whyThisMatches: '为什么它适合你',
    compatibilityScore: '匹配度',
    compatibilityBreakdown: '评分细分',
    rankedMatches: (count) => `匹配排名 (${count})`,
    sortedByMatch: '按匹配度排序',
    bestPrice: '最优价格',
    at: '来自',
    viewDeal: '查看优惠',
  },

  saveModal: {
    title: '保存这份配置',
    description: '为你的配置命名,方便以后重新加载——例如「深雪座驾」或「公园与道具」。',
    itemsSummary: (count, total) => `${count} 件商品 · 最低总价 ${total}`,
    cancel: '取消',
    save: '保存配置',
    close: '关闭',
    suggestions: ['深雪座驾', '公园与道具', '压雪刻滑', '一靴走天下'],
  },

  savedVault: {
    trigger: '已存配置',
    heading: '已保存的配置',
    empty: '暂无保存内容。使用「保存配置」来收藏当前搭配。',
    confirmRename: '确认重命名',
    cancelRename: '取消重命名',
    renameLabel: (name) => `重命名 ${name}`,
    deleteLabel: (name) => `删除 ${name}`,
    deleteConfirm: '删除这份配置?',
    deleteBtn: '删除',
    cancelBtn: '取消',
    reload: '重新加载此配置',
    itemsSummary: (n, total) => `${n} 件商品 · ${total}`,
  },

  loading: {
    heading: '正在匹配你的装备',
    srLabel: '正在加载推荐结果',
    phases: [
      '正在读取你的身体数据…',
      '正在计算长度、腰宽与硬度…',
      '正在按预算筛选商品目录…',
      '正在为 5 个类别的 40 多件商品评分…',
      '正在比较各商家价格…',
    ],
  },

  stickman: {
    title: '你的装备搭配',
    hoverHint: '将鼠标悬停在标记上可高亮对应卡片',
    awaitingHint: '运行匹配器后标记会点亮',
    equipped: (n, total) => `已装备 ${n}/${total}`,
    equippedGear: '已装备的装备',
    awaitingMatch: '等待匹配',
    metricWaist: '腰宽',
    metricWaistWidth: '腰宽',
    metricBootFlex: '雪靴硬度',
    metricLensVlt: '镜片 VLT',
    ariaLabel: '展示推荐装备位置的人形示意图',
  },

  footer: {
    madeBy: '制作者',
    matcherHeading: '匹配器',
    matcherItems: ['雪板与单板尺寸', '雪靴硬度指数', '镜片 VLT 定向'],
    retailersHeading: '商家',
    brandsHeading: '品牌',
    copyright: (year) =>
      `© ${year} Freezed。由 Eric Yu 制作。价格为示例数据;商家链接会在各商店进行实时搜索。`,
    disclaimer: '尺寸结果仅供参考,并非最终试穿结论。请务必请专业雪靴技师为你进行内壳试穿。',
  },
};

export const dictionaries: Record<Language, Dictionary> = { en, zh };
