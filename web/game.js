(() => {
  'use strict';

  window.__lmgErrors = [];
  function showRuntimeError(error) {
    const text = String(error?.stack || error?.message || error || 'unknown error');
    window.__lmgErrors.push(text);
    const box = document.getElementById('runtime-error');
    if (box) {
      box.textContent = text;
      box.classList.remove('hidden');
    }
  }
  window.addEventListener('error', (event) => {
    const message = String(event.error?.message || event.message || '');
    if (message.includes('ResizeObserver loop')) return;
    showRuntimeError(event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => showRuntimeError(event.reason));

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerpPoint = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const choice = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  function hashSeed(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    const random = function random() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    random.getState = () => a >>> 0;
    random.setState = (value) => { a = value >>> 0; };
    return random;
  }

  const SOURCES = {
    dswZunyi: {
      id: 'SRC-DSW-ZY', name: '中共中央党史和文献研究院',
      title: '遵义会议：实现伟大的历史转折', date: '2026-06-08',
      url: 'http://www.dswxyjy.org.cn/n1/2026/0608/c244516-40735961.html'
    },
    dswChishui: {
      id: 'SRC-DSW-CS', name: '中共中央党史和文献研究院',
      title: '四渡赤水：110天的“得意之笔”', date: '2026-05-12',
      url: 'http://www.dswxyjy.org.cn/n1/2026/0512/c423724-40718269.html'
    },
    dswHuining: {
      id: 'SRC-DSW-HN', name: '中共中央党史和文献研究院',
      title: '长征胜利，是中国革命转危为安的关键', date: '2026-10-21',
      url: 'http://www.dswxyjy.org.cn/n1/2026/1021/c462665-40819066.html'
    },
    cpcMarch: {
      id: 'SRC-12371-MARCH', name: '共产党员网',
      title: '“图步”长征路，纪念长征胜利85周年', date: '2021-10-21',
      url: 'https://www.12371.cn/2021/10/21/ARTI1634810104798403.shtml'
    },
    cpcSpirit: {
      id: 'SRC-12371-SPIRIT', name: '共产党员网',
      title: '党史百问：长征的伟大意义和长征精神的丰富内涵是什么？', date: '2022-04-13',
      url: 'https://www.12371.cn/2022/04/13/ARTI1649850555301885.shtml'
    },
    museum90: {
      id: 'SRC-JB-90', name: '中国人民革命军事博物馆',
      title: '“伟大的远征——纪念中国工农红军长征胜利90周年主题展览”', date: '2026-10-10',
      url: 'http://www.jb.mil.cn/zxdt/202610/t20261010_60509.html'
    },
    qstheory90: {
      id: 'SRC-QST-90', name: '求是网',
      title: '纪念红军长征胜利90周年专题', date: '2026-10-22',
      url: 'https://www.qstheory.cn/zt2026/cz/index.htm'
    }
  };

  const CHAPTERS = [
    {
      id: 'breakout', act: '第一章', name: '突围转兵',
      subtitle: '封锁线前，先活下来。', terrain: 'zunyi',
      palette: { skyTop: '#24160f', skyBottom: '#6d3024', far: '#3b2118', near: '#1b100c', ground: '#120b08', sun: '#d6513b', fog: 'rgba(190,91,55,.13)' },
      enemies: ['blocker', 'skirmisher', 'gunner'],
      history: {
        title: '遵义会议', date: '1935年1月15日至17日', place: '贵州遵义',
        summary: '中共中央召开政治局扩大会议，集中解决当时具有决定意义的军事和组织问题，增选毛泽东为中央政治局常委。',
        significance: '会议在极端危急的历史关头挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。',
        sources: ['dswZunyi', 'cpcMarch']
      }
    },
    {
      id: 'maneuver', act: '第二章', name: '赤水机动',
      subtitle: '在敌人缝隙里寻找主动。', terrain: 'chishui',
      palette: { skyTop: '#10191a', skyBottom: '#27413e', far: '#26302a', near: '#101714', ground: '#090f0d', sun: '#b64c37', fog: 'rgba(79,126,112,.11)' },
      enemies: ['skirmisher', 'cavalry', 'blocker'],
      history: {
        title: '四渡赤水', date: '1935年1月至3月', place: '川黔滇交界赤水河流域',
        summary: '中央红军在敌军重兵围追堵截中四次渡过赤水河，穿插调动敌人，随后南渡乌江、进入云南。',
        significance: '四渡赤水是中央红军争取战略主动的关键行动，体现了从实际出发、灵活机动的军事指挥。',
        sources: ['dswChishui', 'cpcMarch']
      }
    },
    {
      id: 'jinsha', act: '第三章', name: '金沙江畔',
      subtitle: '船少，水急，时间更急。', terrain: 'jinsha',
      palette: { skyTop: '#0d171c', skyBottom: '#27414b', far: '#24333b', near: '#0d171c', ground: '#080f12', sun: '#a53c32', fog: 'rgba(94,143,157,.1)' },
      enemies: ['gunner', 'skirmisher', 'blocker'],
      history: {
        title: '巧渡金沙江', date: '1935年5月', place: '云南皎平渡等金沙江渡口',
        summary: '中央红军夺取皎平渡等渡口，在有限船只和紧迫时间中分批渡过金沙江，跳出敌军围追堵截。',
        significance: '巧渡金沙江为中央红军继续北上创造了条件，也显出抓紧时机、维持渡江秩序和依靠群众支持的重要。',
        sources: ['cpcMarch', 'dswChishui']
      }
    },
    {
      id: 'dadu', act: '第四章', name: '大渡河险境',
      subtitle: '前有大河，后有追兵。', terrain: 'dadu',
      palette: { skyTop: '#151317', skyBottom: '#3a2b29', far: '#322726', near: '#171112', ground: '#0c090a', sun: '#9d342e', fog: 'rgba(121,82,82,.1)' },
      enemies: ['gunner', 'blocker', 'cavalry'],
      history: {
        title: '强渡大渡河与飞夺泸定桥', date: '1935年5月', place: '四川安顺场、泸定桥',
        summary: '中央红军先头部队在安顺场强渡大渡河；因渡河工具不足，红四团沿河北上急行军并夺取泸定桥，打开北上通道。',
        significance: '强渡大渡河与飞夺泸定桥是相关但不同的行动，既靠先遣突击与协同配合，也是在争分夺秒中打开北上通道。',
        sources: ['cpcMarch']
      }
    },
    {
      id: 'snow', act: '第五章', name: '雪山高寒',
      subtitle: '每向前一步，都要和风雪争夺体力。', terrain: 'jiajin',
      palette: { skyTop: '#101821', skyBottom: '#324555', far: '#a7b4bb', near: '#2c3b45', ground: '#d5d9d7', sun: '#d6c6a6', fog: 'rgba(220,230,235,.16)' },
      enemies: ['cold', 'gunner', 'blocker'],
      history: {
        title: '翻越夹金山', date: '1935年6月', place: '四川宝兴县夹金山',
        summary: '中央红军翻越海拔4000多米的夹金山。严寒、缺氧、装备单薄和补给困难给队伍造成严重考验。',
        significance: '翻越夹金山表现了红军在极端自然条件下的互助、纪律和坚韧，也提醒我们胜利来自具体而沉重的代价。',
        sources: ['cpcMarch', 'cpcSpirit']
      }
    },
    {
      id: 'grassland', act: '第六章', name: '草地沼泽',
      subtitle: '真正的敌人，是看不到尽头的消耗。', terrain: 'grassland',
      palette: { skyTop: '#141610', skyBottom: '#3f412f', far: '#293124', near: '#151b14', ground: '#11150f', sun: '#b65a3d', fog: 'rgba(120,138,91,.12)' },
      enemies: ['swamp', 'skirmisher', 'cold'],
      history: {
        title: '穿越松潘草地', date: '1935年8月', place: '四川松潘草地',
        summary: '中央红军穿越沼泽遍布、荒无人烟、补给困难的松潘草地，缺粮、疾病、御寒和宿营构成持续考验。',
        significance: '草地行军考验组织、互助、纪律和信念。',
        sources: ['cpcMarch', 'cpcSpirit']
      }
    }
  ];

  const GAME_MODES = [
    {
      id: 'roguelike', mode: 'roguelike', pace: 'normal', icon: '火', name: '三幕远征', badge: '经典肉鸽',
      subtitle: '事件、精英与首领连成三幕', tags: ['肉鸽模式', '三幕', '事件密集'],
      desc: '3 幕 · 事件密集 · 每幕 1 名首领'
    },
    {
      id: 'single-normal', mode: 'single', pace: 'normal', icon: '路', name: '普通模式', featured: true, badge: '主线远征 · 推荐',
      subtitle: '多命长线，多地首领，营火接力', tags: ['主线推荐', '五片区域', '多条命'],
      desc: '5 片区域 · 3 条命 · 5 名首领 · 四种难度'
    },
    {
      id: 'single-quick', mode: 'single', pace: 'quick', icon: '捷', name: '快速模式', compact: true,
      subtitle: '一命走完四层山河图', tags: ['一条命', '紧凑完整', '标准强度'],
      desc: '3 片区域 · 1 条命 · 最终首领'
    }
  ];

  const DIFFICULTY_LEVELS = [
    { id: 'spark', name: '星火初燃', rank: '简单', icon: '一', enemyHp: .92, enemyAtk: .86, enemyPosture: .9, merit: .9, desc: '敌军较弱，适合第一次走进山河图。' },
    { id: 'march', name: '征途鏖战', rank: '普通', icon: '二', enemyHp: 1.18, enemyAtk: 1.12, enemyPosture: 1.16, merit: 1, desc: '敌军更耐打、出手更重，资源要算着用。' },
    { id: 'iron', name: '铁血突围', rank: '困难', icon: '三', enemyHp: 1.42, enemyAtk: 1.3, enemyPosture: 1.38, merit: 1.12, desc: '精英和首领更凶，失误的代价明显增加。' },
    { id: 'final', name: '绝地会师', rank: '极难', icon: '四', enemyHp: 1.75, enemyAtk: 1.55, enemyPosture: 1.65, merit: 1.25, desc: '高压连招与强韧架势，留给熟悉战斗的人。' }
  ];
  const ROGUELIKE_ACTS = [
    {
      name: '第一幕 · 突围转兵', chapter: 0,
      bossPool: [
        { id: 'act1-bridge', typeId: 'bridgebreaker', title: '铁索断桥手', scale: .72, trait: '重刀与后撤横劈', counter: '不要追进重刀正前方；看清后撤步后的回身横劈，再压架势。', pattern: ['heavy', 'backstepCleave', 'siege', 'whirlwind', 'advanceCombo'], rage: ['backstepCleave', 'whirlwind', 'siege', 'advanceCombo'] },
        { id: 'act1-lance', typeId: 'daduLancer', title: '黔北回马枪', scale: .70, trait: '回马突刺与快慢连击', counter: '枪尖闪光时闪避或识破；拉开距离反而会给它回马突刺的机会。', pattern: ['thrust', 'retreatThrust', 'advanceCombo', 'slowFast', 'feintDash'], rage: ['retreatThrust', 'advanceCombo', 'slowFast', 'thrust'] }
      ]
    },
    {
      name: '第二幕 · 赤水金沙', chapter: 2,
      bossPool: [
        { id: 'act2-gunner', typeId: 'gunner', title: '乌江火力督战官', scale: .92, trait: '后撤射击与枪托反打', counter: '枪线锁定时横移；枪响前弹开子弹，逼近后提防枪托震击。', pattern: ['backstepShot', 'shot', 'slowFast', 'retreatThrust', 'guard'], rage: ['backstepShot', 'shot', 'slowFast', 'advanceCombo'] },
        { id: 'act2-cavalry', typeId: 'cavalry', title: '金沙铁骑都尉', scale: .95, trait: '远距冲锋与旋风追斩', counter: '先用闪避让过冲锋，再趁收马时反击；不要站在直线枪路上。', pattern: ['retreatThrust', 'advanceCombo', 'whirlwind', 'blinkSlash', 'siege'], rage: ['advanceCombo', 'whirlwind', 'blinkSlash', 'siege'] }
      ]
    },
    {
      name: '第三幕 · 雪山草地', chapter: 5,
      bossPool: [
        { id: 'act3-rifle', typeId: 'frostmarksman', title: '雪岭锁魂铳', scale: 1.04, trait: '远枪近刃切换', counter: '远距先躲枪线，近身不要连续贪刀；闪身追刀比硬拼更稳。', pattern: ['backstepShot', 'blinkSlash', 'shot', 'slowFast', 'backstepCleave'], rage: ['backstepShot', 'blinkSlash', 'slowFast', 'backstepCleave'] },
        { id: 'act3-reaper', typeId: 'bogReaper', title: '草地索命客', scale: 1.06, trait: '贴身多段快刀', counter: '稳住架势，等连段真正收尾再出刀；普通格挡不要按到底。', pattern: ['advanceCombo', 'whirlwind', 'feintDash', 'slowFast', 'siege'], rage: ['advanceCombo', 'whirlwind', 'slowFast', 'siege'] },
        { id: 'act3-final', typeId: 'boss', title: '最后的封锁线', scale: 1.30, trait: '远近混合与狂暴连段', counter: '半血后会混合远射、瞬步与强攻；先保架势，再抓收招。', pattern: ['backstepCleave', 'retreatThrust', 'slowFast', 'whirlwind', 'advanceCombo', 'shot', 'blinkSlash'], rage: ['backstepShot', 'whirlwind', 'advanceCombo', 'backstepCleave', 'slowFast', 'retreatThrust', 'blinkSlash'] }
      ]
    }
  ];

  const ROGUELIKE_STEPS = ['event', 'battle', 'event', 'elite', 'camp', 'elite', 'boss'];

  const BINDING_ACTIONS = [
    { id: 'moveUp', label: '向前移动' },
    { id: 'moveDown', label: '向后移动' },
    { id: 'moveLeft', label: '向左移动' },
    { id: 'moveRight', label: '向右移动' },
    { id: 'attack', label: '攻击 / 长按突刺' },
    { id: 'guard', label: '格挡 / 弹反' },
    { id: 'jump', label: '跳跃' },
    { id: 'dodge', label: '闪避 / 识破' },
    { id: 'sprint', label: '地图疾跑' },
    { id: 'shoot', label: '射击' },
    { id: 'interact', label: '互动' },
    { id: 'execute', label: '扫荡 / 处决' },
    { id: 'heal', label: '急救' },
    { id: 'item', label: '使用小道具' },
    { id: 'buffs', label: '行军所得' },
    { id: 'confirm', label: '确认' },
    { id: 'cancel', label: '取消 / 返回' },
    { id: 'pause', label: '暂停' }
  ];
  const DEFAULT_KEY_BINDINGS = {
    moveUp: 'KeyW', moveDown: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
    attack: 'KeyJ', guard: 'KeyF', jump: 'Space', dodge: 'ShiftLeft', sprint: 'ShiftLeft',
    shoot: 'KeyR', interact: 'KeyE', execute: 'KeyX', heal: 'KeyQ', item: 'KeyG', buffs: 'KeyB',
    confirm: 'Enter', cancel: 'Escape', pause: 'Escape'
  };
  const DEFAULT_GAMEPAD_BINDINGS = {
    moveUp: -1, moveDown: -1, moveLeft: -1, moveRight: -1,
    attack: 5, guard: 4, jump: 0, dodge: 1, sprint: 1, shoot: 3, interact: 2,
    execute: 2, heal: 13, item: 12, buffs: 8, confirm: 0, cancel: 1, pause: 9
  };
  const INPUT_BINDINGS_STORAGE_KEY = 'longMarchInputBindingsV1';

  const RELICS = [
    { id: 'red_star', name: '红星章', icon: '星', rarity: '稀有', tags: ['信念', '守阵'], desc: '完美弹反额外削去敌将架势。', effect: '完美弹反额外削架势', apply: (p) => { p.relicParryPosture = (p.relicParryPosture || 0) + .55; } },
    { id: 'straw_shoes', name: '草鞋', icon: '履', rarity: '普通', tags: ['行军', '闪避'], desc: '行军与战斗中的脚步更快。', effect: '移动速度 +12%', apply: (p) => { p.moveSpeedBonus = (p.moveSpeedBonus || 0) + .12; } },
    { id: 'brass_horn', name: '黄铜号角', icon: '号', rarity: '普通', tags: ['鼓舞', '士气'], desc: '每场交锋开始时鼓舞士气。', effect: '开战士气 +10', apply: (p) => { p.openingMoraleBonus = (p.openingMoraleBonus || 0) + 10; } },
    { id: 'herb_bag', name: '药草囊', icon: '药', rarity: '普通', tags: ['救护', '续航'], desc: '多带一份急救药，治疗也更充分。', effect: '每场急救 +1，治疗 +6', apply: (p) => { p.emergencyBonus += 1; p.healBonus += 6; } },
    { id: 'whetstone', name: '磨刀石', icon: '砺', rarity: '普通', tags: ['刀法', '连锋'], desc: '让每一式普通连锋更加锋利。', effect: '连锋威力 +3', apply: (p) => { p.basicBonus += 3; } },
    { id: 'river_bamboo', name: '渡江竹片', icon: '渡', rarity: '普通', tags: ['闪避', '追击'], desc: '闪开敌刃后，追刀更稳也更重。', effect: '闪避反击威力与时机提升', apply: (p) => { p.dodgeCounterBonus += .12; p.dodgeCounterWindowBonus += 80; } },
    { id: 'oil_map', name: '油纸地图', icon: '图', rarity: '普通', tags: ['探查', '地图'], desc: '在地图上搜到的物资更加丰厚。', effect: '地图收集收益提升', apply: (p) => { p.relicMapBonus = (p.relicMapBonus || 0) + .35; } },
    { id: 'red_banner', name: '红旗角', icon: '旗', rarity: '稀有', tags: ['信念', '守阵'], desc: '旗帜的一角，能让队伍在受压时站得更稳。', effect: '架势上限 +10，守反威力 +8%', apply: (p) => { p.maxPosture += 10; p.guardCounterBonus += .08; } },
    { id: 'scout_compass', name: '侦察罗盘', icon: '盘', rarity: '普通', tags: ['探查', '地图'], desc: '罗盘会指出附近可调查的位置。', effect: '发现范围与地图收益提升', apply: (p) => { p.relicMapReveal += 90; p.relicMapBonus += .1; } },
    { id: 'marshal_whistle', name: '行军哨', icon: '哨', rarity: '普通', tags: ['鼓舞', '闪避'], desc: '哨声让闪身与回到刀锋的节奏更快。', effect: '闪避恢复更快，变招架势更强', apply: (p) => { p.dodgeCooldownReduction += .12; p.techniquePostureBonus += .05; } },
    { id: 'iron_hook', name: '铁索钩', icon: '钩', rarity: '普通', tags: ['探查', '机关'], desc: '旧工兵留下的铁钩，能拨开松动的石缝。', effect: '暗道感知提升，守反略增强', apply: (p) => { p.relicSecretSense += 70; p.guardCounterBonus += .05; } },
    { id: 'blade_manual', name: '回锋刀谱', icon: '谱', rarity: '稀有', tags: ['刀法', '变招'], desc: '将变招的起手、换步与回锋写得极细。', effect: '变招威力与架势伤害提升', apply: (p) => { p.techniqueDamageBonus += .18; p.techniquePostureBonus += .12; } },
    { id: 'field_tourniquet', name: '战地绷带', icon: '绷', rarity: '普通', tags: ['救护', '耐力'], desc: '一卷洗得发白的绷带，仍能在关键时刻派上用场。', effect: '治疗 +4，兵力上限 +10', apply: (p) => { p.healBonus += 4; p.maxHp += 10; } },
    { id: 'ammo_mold', name: '弹壳模具', icon: '模', rarity: '普通', tags: ['枪械', '军需'], desc: '兵工员用旧模具复装弹药，也懂得如何节省材料。', effect: '步枪伤害提升，立即获得军功', apply: (p) => { p.rangedBonus += .12; p.merit += 20; } },
    { id: 'victory_flag', name: '会师旗角', icon: '会', rarity: '稀有', tags: ['处决', '信念'], desc: '旗角虽小，却提醒队伍每一次果断终结都会换来继续前进的机会。', effect: '处决额外军功，士气更有效', apply: (p) => { p.executionMeritBonus += .4; p.moralePower += .08; } },
    { id: 'hemp_stretcher', name: '担架麻绳', icon: '绳', rarity: '普通', tags: ['救护', '守阵'], desc: '抬过伤员，也绑过临时护甲。低兵力时更能扛住冲击。', effect: '低兵力时减伤', apply: (p) => { p.lowHpDefenseBonus += .08; } },
    { id: 'pine_torch', name: '松明火把', icon: '火', rarity: '普通', tags: ['探查', '暗道'], desc: '火光能照见墙缝里的暗门，也会惊动藏在角落的东西。', effect: '发现范围大幅提升', apply: (p) => { p.relicMapReveal += 70; p.relicSecretSense += 100; } },
    { id: 'red_ribbon', name: '赤绸条', icon: '绸', rarity: '普通', tags: ['刀法', '变招'], desc: '系在刀柄上的赤绸，让换招时的重心更容易找回来。', effect: '连锋窗口与变招威力提升', apply: (p) => { p.comboWindowBonus += 80; p.techniqueDamageBonus += .06; } },
    { id: 'iron_bell', name: '行军铁铃', icon: '铃', rarity: '稀有', tags: ['弹反', '架势'], desc: '铃声与刀鸣同时震开敌刃。', effect: '完美弹反削架势 +25%，架势上限 +8', apply: (p) => { p.relicParryPosture += .25; p.maxPosture += 8; } },
    { id: 'cloth_wrap', name: '缠布护腕', icon: '缠', rarity: '普通', tags: ['守势', '闪避'], desc: '旧布缠紧手腕，挡刀与翻滚都更稳。', effect: '防御 +1，闪避恢复 +8%', apply: (p) => { p.defense += 1; p.dodgeCooldownReduction += .08; } },
    { id: 'march_canteen', name: '行军水壶', icon: '壶', rarity: '普通', tags: ['补给', '救护'], desc: '水壶里总留着一口给伤员的水。', effect: '治疗 +5，补给上限 +8', apply: (p) => { p.healBonus += 5; p.maxSupplies += 8; } },
    { id: 'signal_mirror', name: '联络镜片', icon: '镜', rarity: '普通', tags: ['探查', '信号'], desc: '反光镜片能在山谷里传递简短信号。', effect: '发现范围 +110，地图收益 +8%', apply: (p) => { p.relicMapReveal += 110; p.relicMapBonus += .08; } },
    { id: 'red_sash', name: '突击红带', icon: '带', rarity: '稀有', tags: ['连锋', '士气'], desc: '冲阵时系在腰间，提醒队伍一鼓作气。', effect: '连锋窗口 +70，士气威力 +6%', apply: (p) => { p.comboWindowBonus += 70; p.moralePower += .06; } },
    { id: 'ink_stone', name: '磨墨砚台', icon: '砚', rarity: '普通', tags: ['变招', '刀法'], desc: '刀谱上的招式被一次次描得更清楚。', effect: '变招威力 +10%，架势伤害 +5%', apply: (p) => { p.techniqueDamageBonus += .1; p.techniquePostureBonus += .05; } },
    { id: 'bamboo_flute', name: '竹笛', icon: '笛', rarity: '普通', tags: ['鼓舞', '闪避'], desc: '短促笛声让队伍重新找回脚步。', effect: '开战士气 +6，闪避恢复 +6%', apply: (p) => { p.openingMoraleBonus += 6; p.dodgeCooldownReduction += .06; } },
    { id: 'brass_buckle', name: '黄铜腰带扣', icon: '扣', rarity: '普通', tags: ['守阵', '耐力'], desc: '扣紧腰带，站桩接刀时更能沉住气。', effect: '架势上限 +12，低兵力减伤 +3%', apply: (p) => { p.maxPosture += 12; p.lowHpDefenseBonus += .03; } },
    { id: 'field_manual', name: '野战刀札', icon: '札', rarity: '稀有', tags: ['刀法', '变招'], desc: '几页在战壕里写下的换招心得。', effect: '变招威力 +9%，连锋威力 +2', apply: (p) => { p.techniqueDamageBonus += .09; p.basicBonus += 2; } },
    { id: 'paper_horse', name: '纸马地图', icon: '马', rarity: '普通', tags: ['行军', '地图'], desc: '折起的纸马上标着几条不起眼的近路。', effect: '移动速度 +5%，发现范围 +90', apply: (p) => { p.moveSpeedBonus += .05; p.relicMapReveal += 90; } },
    { id: 'salt_pouch', name: '盐巴布袋', icon: '盐', rarity: '普通', tags: ['补给', '救护'], desc: '一小袋盐，能让水、饭和伤口都好过一点。', effect: '治疗 +3，立即补足补给 +12', apply: (p) => { p.healBonus += 3; p.supplies = Math.min(p.maxSupplies, p.supplies + 12); } },
    { id: 'victory_medal', name: '会师纪念章', icon: '章', rarity: '稀有', tags: ['处决', '士气'], desc: '旧纪念章背后刻着两支队伍会合的日期。', effect: '处决军功 +15%，士气威力 +6%', apply: (p) => { p.executionMeritBonus += .15; p.moralePower += .06; } }
  ];

  const RELIC_SYNERGIES = [
    { id: 'red_guard', name: '赤心守阵', relics: ['red_star', 'red_banner'], desc: '完美弹反与守反彼此增势。', effect: '完美弹反架势 +35%，守反 +12%，架势上限 +8', apply: (p) => { p.relicParryPosture += .35; p.guardCounterBonus += .12; p.maxPosture += 8; } },
    { id: 'wind_step', name: '踏浪追风', relics: ['straw_shoes', 'river_bamboo'], desc: '移动、闪避和追击连成一条线。', effect: '移动 +8%，闪避追刀时机 +100，闪避恢复更快', apply: (p) => { p.moveSpeedBonus += .08; p.dodgeCounterWindowBonus += 100; p.dodgeCooldownReduction += .08; } },
    { id: 'tempered_edge', name: '百炼锋', relics: ['whetstone', 'blade_manual'], desc: '普攻与变招共享同一套磨炼。', effect: '连锋 +2，变招威力 +15%，变招架势 +15%', apply: (p) => { p.basicBonus += 2; p.techniqueDamageBonus += .15; p.techniquePostureBonus += .15; } },
    { id: 'trail_blaze', name: '踏勘山河', relics: ['oil_map', 'scout_compass'], desc: '地图与罗盘互为印证，发现更多隐藏点。', effect: '地图收益 +25%，发现范围 +80', apply: (p) => { p.relicMapBonus += .25; p.relicMapReveal += 80; } },
    { id: 'field_mercy', name: '随军救护', relics: ['herb_bag', 'hemp_stretcher'], desc: '药品和担架让队伍在险境中多撑一程。', effect: '治疗 +6，兵力上限 +8，低兵力减伤 +5%', apply: (p) => { p.healBonus += 6; p.maxHp += 8; p.lowHpDefenseBonus += .05; } },
    { id: 'underground_guide', name: '穴行先锋', relics: ['pine_torch', 'iron_hook'], desc: '火光照缝，铁钩探路，暗道不再难找。', effect: '暗道感知 +80，地图收益 +15%', apply: (p) => { p.relicSecretSense += 80; p.relicMapBonus += .15; } },
    { id: 'last_round', name: '最后一发', relics: ['ammo_mold', 'victory_flag'], desc: '枪声、旗帜与果断终结互相呼应。', effect: '步枪 +12%，处决军功 +20%', apply: (p) => { p.rangedBonus += .12; p.executionMeritBonus += .2; } },
    { id: 'march_anthem', name: '行军合奏', relics: ['brass_horn', 'marshal_whistle'], desc: '号角定调，哨声催步，开场便能抢住节奏。', effect: '开战士气 +8，士气威力 +10%', apply: (p) => { p.openingMoraleBonus += 8; p.moralePower += .1; } },
    { id: 'iron_chorus', name: '铁铃守阵', relics: ['iron_bell', 'red_banner'], desc: '铃声压低刀势，旗角稳住阵脚。', effect: '守反 +12%，完美弹反架势 +20%，架势上限 +10', apply: (p) => { p.guardCounterBonus += .12; p.relicParryPosture += .2; p.maxPosture += 10; } },
    { id: 'field_kit', name: '随军药箱', relics: ['march_canteen', 'herb_bag'], desc: '水、药和绷带被收进同一只药箱。', effect: '治疗 +8，兵力上限 +10', apply: (p) => { p.healBonus += 8; p.maxHp += 10; } },
    { id: 'signal_route', name: '镜火联络', relics: ['signal_mirror', 'pine_torch'], desc: '镜光与火光接力，把隐藏路线照出来。', effect: '发现范围 +100，暗道感知 +60', apply: (p) => { p.relicMapReveal += 100; p.relicSecretSense += 60; } },
    { id: 'red_assault', name: '红带连锋', relics: ['red_sash', 'red_ribbon'], desc: '红带压住重心，赤绸标出回锋。', effect: '连锋窗口 +90，变招威力 +10%', apply: (p) => { p.comboWindowBonus += 90; p.techniqueDamageBonus += .1; } },
    { id: 'buckle_guard', name: '束甲沉气', relics: ['brass_buckle', 'cloth_wrap'], desc: '腰带与护腕把整口气压进架势里。', effect: '防御 +1，架势上限 +10，低兵力减伤 +4%', apply: (p) => { p.defense += 1; p.maxPosture += 10; p.lowHpDefenseBonus += .04; } }
  ];

  const STORY_CLUES = [
    { id: 'clue_ruijin_order', region: 0, title: '瑞金出发前的命令', source: '行军旧件', text: '命令纸只剩半页，落款处的红星仍清晰。出发的队伍没有等到所有伤员归队。' },
    { id: 'clue_xiangjiang_bridge', region: 0, title: '湘江浮桥木牌', source: '地图拾取', text: '木牌上记着一句“桥在，队伍就还能过”。背面刻着七个已经看不清的姓名。' },
    { id: 'clue_zunyi_meeting', region: 1, title: '会议桌角的铅笔痕', source: '行军遗迹', text: '铅笔痕反复圈住“机动”两个字。有人在这里否定了继续硬撞封锁线的走法。' },
    { id: 'clue_chishui_ferry', region: 1, title: '船工留下的渡口水路', source: 'NPC对话', text: '船工把四处浅滩画成折返路线，让追兵看不清真正的渡口。' },
    { id: 'clue_jinsha_boat', region: 2, title: '皎平渡的船桨刻记', source: '行军旧件', text: '船桨上刻着“七日七夜”。有限的木船把主力一船一船送过大江。' },
    { id: 'clue_dadu_chain', region: 3, title: '泸定桥铁索铭文', source: '地图拾取', text: '铁索冰冷，桥板却只剩零星几块。先头队伍在枪火中向对岸爬去。' },
    { id: 'clue_snow_binding', region: 3, title: '夹金山互助绑带', source: 'NPC对话', text: '两条旧绑带打成一个结。翻山时，前面的人把后面的人一点点拉过雪坡。' },
    { id: 'clue_grass_ration', region: 4, title: '草地里的半袋炒面', source: '行军遗迹', text: '袋口写着“留给后队”。饥饿与疲惫藏在草地的每一步里。' },
    { id: 'clue_rally_signal', region: 4, title: '会师前的联络暗号', source: '地图拾取', text: '暗号写着“星火”“征途”。不同方向的队伍约好用这两个词确认彼此身份。' },
    { id: 'clue_boss_confession', region: 4, title: '封锁线军令残页', source: '首领初见', text: '敌军军令要求死守会师道路。纸页背面，却有人写下“不要再追了”。' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_stand', name: '星火初燃', desc: '取得第一次战斗胜利。', check: (p, stats) => (stats.victories || 0) >= 1 },
    { id: 'parry_ten', name: '十响金鸣', desc: '完成 10 次完美格挡。', check: (p, stats) => (stats.parries || 0) >= 10 },
    { id: 'counter_ten', name: '借势还刀', desc: '完成 10 次反击。', check: (p, stats) => (stats.counters || 0) >= 10 },
    { id: 'execution_five', name: '败势终结者', desc: '完成 5 次处决。', check: (p, stats) => (stats.executions || 0) >= 5 },
    { id: 'hidden_way', name: '暗渠寻踪', desc: '发现一处地下暗渠。', check: (p) => (p.storyClues || []).length >= 2 },
    { id: 'camp_three', name: '星火相连', desc: '点亮 3 处星火营火。', check: (p) => (p.bonfiresLit || 0) >= 3 },
    { id: 'sword_path', name: '刀锋不折', desc: '学会 3 种以上变招。', check: (p) => (p.techniques || []).length >= 3 },
    { id: 'story_chain', name: '征途成篇', desc: '收集 8 条行军线索。', check: (p) => (p.storyClues || []).length >= 8 }
  ];
  const EQUIPMENT_RARITIES = {
    common: { name: '制式', order: 1, color: '#b9a27f' },
    rare: { name: '精制', order: 2, color: '#e2bb6c' },
    epic: { name: '缴获', order: 3, color: '#de7658' }
  };

  const CONSUMABLES = [
    { id: 'bandage', name: '急救绷带', icon: '绷', category: '恢复', cost: 32, desc: '立即恢复 24% 兵力，并卸去少量架势。', effect: '恢复兵力 · 清理架势' },
    { id: 'fried_dough', name: '炒面干粮', icon: '粮', category: '恢复', cost: 26, desc: '恢复 12% 兵力与 10 点补给。', effect: '恢复兵力 · 补给 +10' },
    { id: 'smoke_pellet', name: '烟雾丸', icon: '烟', category: '控制', cost: 34, desc: '遮住敌军视线，使当前目标短暂迟滞。', effect: '目标迟滞 · 打断普通起手' },
    { id: 'fire_pot', name: '火油罐', icon: '火', category: '攻击', cost: 38, desc: '对当前目标造成固定伤害并大量削减架势。', effect: '即时伤害 · 架势伤害' },
    { id: 'caltrops', name: '铁蒺藜', icon: '蒺', category: '控制', cost: 30, desc: '撒在敌军脚下，使其脚步停顿。', effect: '目标迟滞 · 额外架势伤害' },
    { id: 'salt_water', name: '盐水壶', icon: '水', category: '恢复', cost: 28, desc: '恢复部分兵力与士气，适合长线战斗。', effect: '恢复兵力 · 士气 +12' },
    { id: 'rice_wine', name: '药酒', icon: '酒', category: '恢复', cost: 36, desc: '恢复兵力并大幅清理我方架势。', effect: '恢复兵力 · 架势大幅降低' },
    { id: 'gun_oil', name: '枪油', icon: '油', category: '军需', cost: 24, desc: '立即补充 3 发弹药并稍微恢复架势。', effect: '弹药 +3' },
    { id: 'signal_flare', name: '信号焰火', icon: '焰', category: '控制', cost: 40, desc: '照亮战场，使所有敌将短暂迟滞。', effect: '全体敌军迟滞' },
    { id: 'iron_ration', name: '铁盒口粮', icon: '盒', category: '恢复', cost: 30, desc: '恢复较多兵力；兵力越低时恢复越多。', effect: '恢复兵力 · 低兵力时更强' }
  ];

  const MATERIALS = {
    tempered_steel: { id: 'tempered_steel', name: '精炼钢料', icon: '钢', desc: '适合重锻刀身与护具的稀有钢料。' },
    machined_parts: { id: 'machined_parts', name: '精密机件', icon: '机', desc: '枪机、背带和军需装具升级所需的细件。' }
  };

  const EQUIPMENT_ITEMS = [
    { id: 'reinforced_saber', name: '加钢刀身', icon: '刀', category: '刀剑', rarity: 'rare', cost: 54, desc: '刀背加钢，劈砍更有分量。', effects: [{ label: '攻势', value: '+3' }, { label: '连锋威力', value: '+2' }], apply: (p, s = 1) => { p.atk += 3 * s; p.basicBonus += 2 * s; } },
    { id: 'narrow_longblade', name: '窄锋长刀', icon: '锋', category: '刀剑', rarity: 'common', cost: 38, desc: '刀身更窄，换步变招更顺。', effects: [{ label: '变招威力', value: '+8%' }], apply: (p, s = 1) => { p.techniqueDamageBonus += .08 * s; } },
    { id: 'bayonet_lug', name: '刺刀卡座', icon: '刺', category: '刀剑', rarity: 'common', cost: 36, desc: '固定刺刀重心，突刺更稳。', effects: [{ label: '突刺威力', value: '+14%' }], apply: (p, s = 1) => { p.chargeBonus += .14 * s; } },
    { id: 'red_tassel_ring', name: '红缨刀环', icon: '缨', category: '刀剑', rarity: 'common', cost: 34, desc: '刀柄重心更顺，收刀与换招更稳。', effects: [{ label: '攻势', value: '+1' }, { label: '连锋衔接', value: '+45' }], apply: (p, s = 1) => { p.atk += s; p.comboWindowBonus += 45 * s; } },
    { id: 'wide_spine_saber', name: '宽脊斩刀', icon: '斩', category: '刀剑', rarity: 'rare', cost: 56, desc: '宽厚刀脊让劈砍更沉，刀势更稳。', effects: [{ label: '攻势', value: '+3' }, { label: '连锋威力', value: '+3' }], apply: (p, s = 1) => { p.atk += 3 * s; p.basicBonus += 3 * s; } },
    { id: 'tempered_narrowblade', name: '精钢窄刃', icon: '刃', category: '刀剑', rarity: 'rare', cost: 60, desc: '细窄刃身让方向变招更容易切入。', effects: [{ label: '变招威力', value: '+14%' }, { label: '变招架势', value: '+8%' }], apply: (p, s = 1) => { p.techniqueDamageBonus += .14 * s; p.techniquePostureBonus += .08 * s; } },
    { id: 'bamboo_guard', name: '竹编护手', icon: '护', category: '刀剑', rarity: 'common', cost: 30, desc: '轻便护手不妨碍出刀，还能卸去一点震力。', effects: [{ label: '防御', value: '+1' }, { label: '闪避恢复', value: '+5%' }], apply: (p, s = 1) => { p.defense += s; p.dodgeCooldownReduction += .05 * s; } },
    { id: 'rally_blade', name: '会师战刀', icon: '会', category: '刀剑', rarity: 'epic', cost: 98, desc: '一路修补到会师的长刀，刀背刻着队伍走过的地名。', effects: [{ label: '攻势', value: '+4' }, { label: '连锋威力', value: '+5' }], apply: (p, s = 1) => { p.atk += 4 * s; p.basicBonus += 5 * s; } },
    { id: 'steel_bracer', name: '钢制护腕', icon: '腕', category: '护具', rarity: 'common', cost: 35, desc: '护住手腕和刀架，格挡更稳。', effects: [{ label: '防御', value: '+1' }, { label: '架势上限', value: '+8' }], apply: (p, s = 1) => { p.defense += s; p.maxPosture += 8 * s; p.posture = clamp(p.posture, 0, p.maxPosture); } },
    { id: 'padded_coat', name: '厚棉军衣', icon: '衣', category: '护具', rarity: 'common', cost: 42, desc: '挡不住刀锋，却能撑住长途损耗。', effects: [{ label: '兵力上限', value: '+18' }, { label: '防御', value: '+1' }], apply: (p, s = 1) => { p.maxHp += 18 * s; p.defense += s; if (s > 0) p.hp = Math.min(p.maxHp, p.hp + 18); else p.hp = Math.min(p.hp, p.maxHp); } },
    { id: 'iron_helmet', name: '缴获铁盔', icon: '盔', category: '护具', rarity: 'rare', cost: 58, desc: '重是重了些，挨刀时却更清醒。', effects: [{ label: '架势上限', value: '+12' }, { label: '低兵力减伤', value: '+3%' }], apply: (p, s = 1) => { p.maxPosture += 12 * s; p.lowHpDefenseBonus += .03 * s; p.posture = clamp(p.posture, 0, p.maxPosture); } },
    { id: 'light_greaves', name: '轻便绑腿', icon: '履', category: '机动', rarity: 'common', cost: 40, desc: '收紧绑腿，追击与闪身更快。', effects: [{ label: '移动速度', value: '+7%' }, { label: '闪避恢复', value: '+8%' }], apply: (p, s = 1) => { p.moveSpeedBonus += .07 * s; p.dodgeCooldownReduction += .08 * s; } },
    { id: 'rifle_sling', name: '皮质枪背带', icon: '带', category: '枪械', rarity: 'common', cost: 38, desc: '出枪更稳，移动射击也更顺。', effects: [{ label: '步枪威力', value: '+12%' }], apply: (p, s = 1) => { p.rangedBonus += .12 * s; } },
    { id: 'match_trigger', name: '精修枪机', icon: '机', category: '枪械', rarity: 'rare', cost: 68, desc: '扳机行程更短，射击更容易打中要害。', effects: [{ label: '步枪威力', value: '+20%' }, { label: '暴击', value: '+3%' }], apply: (p, s = 1) => { p.rangedBonus += .2 * s; p.crit += .03 * s; } },
    { id: 'medical_satchel', name: '随军药箱', icon: '药', category: '军需', rarity: 'rare', cost: 62, desc: '多备一份外伤药和绷带。', effects: [{ label: '每场急救', value: '+1' }, { label: '治疗', value: '+3' }], apply: (p, s = 1) => { p.emergencyBonus += s; p.healBonus += 3 * s; } },
    { id: 'ammo_pouch', name: '加厚弹袋', icon: '弹', category: '军需', rarity: 'common', cost: 36, desc: '弹药摆放更顺，容易抓住射击机会。', effects: [{ label: '步枪威力', value: '+8%' }, { label: '暴击', value: '+2%' }], apply: (p, s = 1) => { p.rangedBonus += .08 * s; p.crit += .02 * s; } },
    { id: 'command_whistle', name: '铜制指挥哨', icon: '哨', category: '军需', rarity: 'rare', cost: 60, desc: '一开场便用哨声稳住队伍节奏。', effects: [{ label: '开战士气', value: '+8' }, { label: '士气威力', value: '+8%' }], apply: (p, s = 1) => { p.openingMoraleBonus += 8 * s; p.moralePower += .08 * s; } },
    { id: 'quartermaster_roll', name: '辎重卷包', icon: '包', category: '军需', rarity: 'common', cost: 34, desc: '多带一卷口粮和备用零件。', effects: [{ label: '补给上限', value: '+16' }], apply: (p, s = 1) => { p.maxSupplies += 16 * s; p.supplies = Math.min(p.supplies, p.maxSupplies); } },
    { id: 'blacksteel_guard', name: '淬火护心镜', icon: '镜', category: '护具', rarity: 'epic', cost: 92, desc: '从缴获装备上拆下的整块护心镜，硬接重刀也不易乱息。', effects: [{ label: '防御', value: '+2' }, { label: '架势上限', value: '+16' }], apply: (p, s = 1) => { p.defense += 2 * s; p.maxPosture += 16 * s; p.posture = clamp(p.posture, 0, p.maxPosture); } },
    { id: 'victory_saber', name: '百战卷刃刀', icon: '战', category: '刀剑', rarity: 'epic', cost: 94, desc: '刀锋卷过许多缺口，却仍能把变招的力道送进敌阵。', effects: [{ label: '攻势', value: '+5' }, { label: '变招威力', value: '+12%' }], apply: (p, s = 1) => { p.atk += 5 * s; p.techniqueDamageBonus += .12 * s; } },
    { id: 'scoped_carbine', name: '缴获瞄准镜', icon: '镜', category: '枪械', rarity: 'epic', cost: 96, desc: '镜片没有裂纹，远距离抓住枪线的机会更多。', effects: [{ label: '步枪威力', value: '+28%' }, { label: '暴击', value: '+4%' }], apply: (p, s = 1) => { p.rangedBonus += .28 * s; p.crit += .04 * s; } },
    { id: 'command_mapcase', name: '缴获指挥图匣', icon: '匣', category: '军需', rarity: 'epic', cost: 88, desc: '图匣里还留着敌军标过的粮道与弹药点。', effects: [{ label: '补给上限', value: '+28' }, { label: '每场急救', value: '+1' }], apply: (p, s = 1) => { p.maxSupplies += 28 * s; p.emergencyBonus += s; } }
  ];

  const KEYS = {
    iron_key: { id: 'iron_key', name: '铁门钥匙', icon: '钥', desc: '能打开山区旧工事的一道铁门。' },
    river_key: { id: 'river_key', name: '渡口钥匙', icon: '渡', desc: '能打开河谷暗仓和铁索闸门。' },
    snow_key: { id: 'snow_key', name: '雪线钥匙', icon: '雪', desc: '能打开高原封锁区内的暗门。' },
    master_key: { id: 'master_key', name: '交通员钥片', icon: '通', desc: '交通员留下的钥片，可打开一处高级暗门。' },
    grass_key: { id: 'grass_key', name: '草地路签', icon: '草', desc: '草地旧驿道留下的木制路签，可开启深草地暗门。' },
    final_key: { id: 'final_key', name: '会师通行证', icon: '会', desc: '接近会师地时使用的旧通行证，可打开最后一处封锁门。' }
  };

  const NPC_CLUE_IDS = {
    hunter: 'clue_xiangjiang_bridge', boatman: 'clue_chishui_ferry', signal_keeper: 'clue_jinsha_boat',
    herbalist: 'clue_snow_binding', quartermaster: 'clue_ruijin_order', smuggler: 'clue_zunyi_meeting',
    scout: 'clue_ruijin_order', guide: 'clue_rally_signal', courier: 'clue_grass_ration', ferryman: 'clue_chishui_ferry'
  };  const REGION_KEY_IDS = ['iron_key', 'river_key', 'snow_key', 'grass_key', 'final_key'];

  const TALENT_TREE = [
    { id: 'blade_flow', branch: '刀法', tier: 1, name: '顺势收刀', icon: '流', cost: 1, requires: [], desc: '收刀更快，下一式更容易接上。', effect: '连锋衔接窗口 +60', apply: (p) => { p.comboWindowBonus += 60; } },
    { id: 'variation_basic', branch: '刀法', tier: 2, name: '回旋破阵', icon: '旋', cost: 1, requires: ['blade_flow'], desc: '学会横向换步后两刀横扫。', effect: '解锁变招：回旋破阵；已会时变招威力 +8%', techniqueId: 'whirlwind', apply: (p) => { if (!p.techniques.includes('whirlwind')) p.techniques.push('whirlwind'); else p.techniqueDamageBonus += .08; } },
    { id: 'variation_advanced', branch: '刀法', tier: 3, name: '破锋进斩', icon: '破', cost: 2, requires: ['variation_basic'], desc: '学会大跨步压入敌阵的重斩。', effect: '解锁变招：破锋进斩；已会时变招威力 +10%', techniqueId: 'breach', apply: (p) => { if (!p.techniques.includes('breach')) p.techniques.push('breach'); else p.techniqueDamageBonus += .1; } },
    { id: 'variation_master', branch: '刀法', tier: 4, name: '交刃连斩', icon: '交', cost: 2, requires: ['variation_advanced', 'technique_edge'], desc: '学会斜向切入的两刀压制。', effect: '解锁变招：交刃连斩；已会时变招架势 +12%', techniqueId: 'crosscut', apply: (p) => { if (!p.techniques.includes('crosscut')) p.techniques.push('crosscut'); else p.techniquePostureBonus += .12; } },
    { id: 'technique_edge', branch: '刀法', tier: 3, name: '换步发力', icon: '劲', cost: 1, requires: ['variation_basic'], desc: '变招换步时把腰腿力量送进刀锋。', effect: '变招威力 +12%', apply: (p) => { p.techniqueDamageBonus += .12; } },
    { id: 'guard_breath', branch: '守势', tier: 1, name: '沉气守中', icon: '守', cost: 1, requires: [], desc: '稳住重心，阵脚更耐压。', effect: '架势上限 +12', apply: (p) => { p.maxPosture += 12; } },
    { id: 'steady_guard', branch: '守势', tier: 2, name: '稳手护刃', icon: '稳', cost: 1, requires: ['guard_breath'], desc: '守反时脚步和刀架更稳。', effect: '防御 +1，守反时机 +60', apply: (p) => { p.defense += 1; p.guardCounterWindowBonus += 60; } },
    { id: 'dodge_form', branch: '机动', tier: 1, name: '低身换步', icon: '闪', cost: 1, requires: [], desc: '闪身后的重心恢复更快。', effect: '闪避恢复 +8%', apply: (p) => { p.dodgeCooldownReduction += .08; } },
    { id: 'light_step', branch: '机动', tier: 2, name: '轻装疾行', icon: '行', cost: 1, requires: ['dodge_form'], desc: '行军和战斗中的脚步更轻。', effect: '移动速度 +6%', apply: (p) => { p.moveSpeedBonus += .06; } },
    { id: 'field_kit', branch: '军需', tier: 1, name: '随身整备', icon: '整', cost: 1, requires: [], desc: '修补装备，也顺手扩大行囊。', effect: '补给上限 +16', apply: (p) => { p.maxSupplies += 16; p.supplies = Math.min(p.supplies, p.maxSupplies); } },
    { id: 'equipment_harness', branch: '军需', tier: 2, name: '军备挂架', icon: '架', cost: 2, requires: ['field_kit'], desc: '在背包和腰间增加一组可靠的军备挂点。', effect: '军备槽 +1（总上限 4）', apply: (p) => { p.bonusEquipmentSlots += 1; } },
    { id: 'trail_read', branch: '探查', tier: 1, name: '读路辨迹', icon: '迹', cost: 1, requires: [], desc: '更早发现岔路、暗门和藏在角落的物资。', effect: '地图发现范围 +80', apply: (p) => { p.relicMapReveal += 80; } },
    { id: 'chest_luck', branch: '探查', tier: 2, name: '搜箱有方', icon: '箱', cost: 1, requires: ['trail_read'], desc: '更懂得从旧箱和缴获中挑出好东西。', effect: '宝箱稀有度提升', apply: (p) => { p.chestLuck += 15; } },
    { id: 'counter_edge', branch: '刀法', tier: 3, name: '回锋截击', icon: '截', cost: 2, requires: ['blade_flow'], desc: '在敌人收招的缝隙里把刀锋送回去。', effect: '闪反与守反威力 +12%，反击窗口 +80', apply: (p) => { p.dodgeCounterBonus += .12; p.guardCounterBonus += .12; p.dodgeCounterWindowBonus += 80; p.guardCounterWindowBonus += 80; } },
    { id: 'blade_mastery', branch: '刀法', tier: 4, name: '刀势贯通', icon: '贯', cost: 3, requires: ['variation_master', 'technique_edge'], desc: '把五式连锋和变招合成一口气，刀势不再散。', effect: '连锋威力 +8，变招威力 +14%', apply: (p) => { p.basicBonus += 8; p.techniqueDamageBonus += .14; } },
    { id: 'blade_tempest', branch: '刀法', tier: 5, name: '百战刀魂', icon: '魂', cost: 4, requires: ['blade_mastery'], desc: '久战之后，收刀、换步与回锋都变成本能。', effect: '连锋威力 +12，变招威力/架势 +20%', apply: (p) => { p.basicBonus += 12; p.techniqueDamageBonus += .2; p.techniquePostureBonus += .2; } },
    { id: 'iron_wall', branch: '守势', tier: 3, name: '铁壁护阵', icon: '壁', cost: 2, requires: ['steady_guard'], desc: '把肩、腰和刀架连成一道稳固的防线。', effect: '防御 +2，架势上限 +18', apply: (p) => { p.defense += 2; p.maxPosture += 18; } },
    { id: 'perfect_echo', branch: '守势', tier: 4, name: '弹刃回响', icon: '响', cost: 3, requires: ['steady_guard'], desc: '完美架开敌刃后，反击的窗口和刀势都更长。', effect: '完美弹反削架势 +35%，守反窗口 +120', apply: (p) => { p.relicParryPosture += .35; p.guardCounterWindowBonus += 120; } },
    { id: 'last_stand', branch: '守势', tier: 5, name: '绝境不倒', icon: '屹', cost: 4, requires: ['iron_wall', 'perfect_echo'], desc: '兵力将尽时仍能把阵脚钉在地上。', effect: '兵力上限 +30，低兵力减伤 +10%', apply: (p) => { p.maxHp += 30; p.lowHpDefenseBonus += .1; } },
    { id: 'shadow_step', branch: '机动', tier: 3, name: '影步回身', icon: '影', cost: 2, requires: ['light_step'], desc: '闪身落地时已经找好下一次出刀的角度。', effect: '闪避恢复 +10%，闪反威力 +10%', apply: (p) => { p.dodgeCooldownReduction += .1; p.dodgeCounterBonus += .1; } },
    { id: 'mountain_stride', branch: '机动', tier: 4, name: '翻山越岭', icon: '越', cost: 3, requires: ['light_step'], desc: '长距离行军与战斗换位都更从容。', effect: '移动速度 +12%，架势上限 +12', apply: (p) => { p.moveSpeedBonus += .12; p.maxPosture += 12; } },
    { id: 'untouchable', branch: '机动', tier: 5, name: '踏雪无痕', icon: '雪', cost: 4, requires: ['shadow_step'], desc: '连续的侧身与追刀让敌人很难抓住队伍。', effect: '闪反窗口 +180，闪避恢复 +16%', apply: (p) => { p.dodgeCounterWindowBonus += 180; p.dodgeCooldownReduction += .16; } },
    { id: 'field_medic', branch: '军需', tier: 3, name: '战地救护所', icon: '护', cost: 2, requires: ['field_kit'], desc: '把急救和补给整理成一套可持续的战地流程。', effect: '治疗 +10，兵力上限 +12', apply: (p) => { p.healBonus += 10; p.maxHp += 12; } },
    { id: 'supply_column', branch: '军需', tier: 4, name: '辎重长列', icon: '列', cost: 3, requires: ['field_kit'], desc: '把补给线拉长，让队伍能连续作战。', effect: '补给上限 +30，补给消耗 -2', apply: (p) => { p.maxSupplies += 30; p.supplyCostReduction = Math.min(8, p.supplyCostReduction + 2); } },
    { id: 'merit_ledger', branch: '军需', tier: 5, name: '军功簿', icon: '簿', cost: 4, requires: ['supply_column'], desc: '每一次缴获都被记在册上，换来更长的军需线。', effect: '军功收益 +12%，军需价格 -8%', apply: (p) => { p.meritGainBonus += .12; p.shopDiscount = Math.min(.3, (p.shopDiscount || 0) + .08); } },
    { id: 'pathfinder', branch: '探查', tier: 3, name: '山路向导', icon: '向', cost: 2, requires: ['trail_read'], desc: '提前读到山势和旧路，少走许多冤枉路。', effect: '发现范围 +120，暗道感知 +100', apply: (p) => { p.relicMapReveal += 120; p.relicSecretSense += 100; } },
    { id: 'veteran_cache', branch: '探查', tier: 4, name: '老练搜整', icon: '整', cost: 3, requires: ['chest_luck'], desc: '看一眼箱扣就知道里面值不值得打开。', effect: '宝箱幸运 +25，地图收益 +20%', apply: (p) => { p.chestLuck += 25; p.relicMapBonus += .2; } },
    { id: 'hidden_marrow', branch: '探查', tier: 5, name: '暗线通脉', icon: '脉', cost: 4, requires: ['pathfinder', 'veteran_cache'], desc: '把散落在地图边缘的暗线和军资连成一张网。', effect: '发现范围 +180，暗道感知 +160，架势上限 +10', apply: (p) => { p.relicMapReveal += 180; p.relicSecretSense += 160; p.maxPosture += 10; } }
  ];

  const NPC_DEFINITIONS = [
    {
      id: 'hunter', name: '老猎人', icon: '猎', regions: [0], role: '山中委托',
      greeting: '山里那队守军踩坏了我布下的套索。替我拔掉他们，我把珍藏的护具给你。',
      quest: { id: 'hunter_elite', title: '林间猎踪', objective: '击败云岭山道的精英敌军', reward: { keyId: 'iron_key', equipmentRarity: 'rare', materialId: 'tempered_steel', materialAmount: 1 }, hint: '云岭山道深处的精英倒下后回来。' }
    },
    {
      id: 'boatman', name: '渡口船工', icon: '渡', regions: [1], role: '河岸委托', family: 'ferry_quest',
      greeting: '河谷里的旧箱被水冲散了一只。替我找回来，我匀出一组军备挂点。',
      quest: { id: 'ferry_boat_chest', title: '河岸失物', objective: '在赤水河谷开启一处宝箱', reward: { keyId: 'river_key', equipmentRarity: 'rare', equipmentSlot: true, materialId: 'machined_parts', materialAmount: 1 }, hint: '开启河谷任意宝箱后回来。' }
    },
    {
      id: 'signal_keeper', name: '护线员', icon: '闸', regions: [2], role: '信号委托',
      greeting: '两座信号闸都灭了。接通风雪高原的两座闸，我把藏在机房里的钥片和缴获品交给你。',
      quest: { id: 'guide_relays', title: '信号归位', objective: '接通风雪高原的两座信号闸', reward: { keyId: 'master_key', equipmentRarity: 'epic', materialId: 'tempered_steel', materialAmount: 2 }, hint: '两座信号闸都亮起后回来。' }
    },
    {
      id: 'herbalist', name: '随军郎中', icon: '医', regions: [0, 1, 2], role: '伤情处理',
      greeting: '伤口拖久了会坏事。我只替队伍处理一次伤情，剩下的路还得你们自己走。',
      heal: { cost: 18, ratio: .24, text: '处理伤口并重新包扎' }
    },
    {
      id: 'quartermaster', name: '军需货郎', icon: '货', regions: [0, 1, 2], role: '军备交易',
      greeting: '我只卖一件军备，合适就拿走。别问我路，也别指望我替你打仗。',
      trade: { rarity: 'rare', costByRegion: [42, 52, 64] }
    },
    {
      id: 'smuggler', name: '旧路掮客', icon: '钥', regions: [0, 1, 2], role: '钥匙交易',
      greeting: '旧门锁得住路，锁不住做买卖的人。这里有把对应当地暗门的钥匙。',
      keyTrade: { keyByRegion: ['iron_key', 'river_key', 'snow_key', 'grass_key', 'final_key'], cost: 32 }
    },
    {
      id: 'scout', name: '侦察员', icon: '侦', regions: [1, 2], role: '地形情报',
      greeting: '前面的地势我摸过一遍。只把这一片的路、宝箱和暗门位置卖你一次。',
      intel: { revealChests: true }
    },
    {
      id: 'ferryman', name: '渡口老船工', icon: '船', regions: [1], role: '钥匙与委托', family: 'ferry_quest',
      greeting: '渡口钥匙在我手里。你若能找到河岸丢失的旧箱，我再额外给你一套挂具。',
      keyTrade: { keyByRegion: ['iron_key', 'river_key', 'snow_key', 'grass_key', 'final_key'], cost: 28 },
      quest: { id: 'ferryman_chest', title: '河岸失物', objective: '在赤水河谷开启一处宝箱', reward: { equipmentSlot: true, equipmentRarity: 'rare', materialId: 'machined_parts', materialAmount: 1 }, hint: '开启河谷任意宝箱后回来。' }
    },
    {
      id: 'guide', name: '交通员', icon: '通', regions: [2], role: '隐藏路线',
      greeting: '有一条运粮旧线不在普通地图上。把信号静下来，我可以把入口位置交给你。',
      hiddenRoute: { text: '交通员在地图背面画出一条通往地下暗渠的旧运输线。' }
    },
    {
      id: 'courier', name: '送信少年', icon: '信', regions: [0, 2], role: '隐藏路线',
      greeting: '我替人送过一封进暗渠的信。那入口很隐蔽，但我记得石缝和旧门的位置。',
      hiddenRoute: { text: '少年把暗渠入口、旧门与一条能绕回主路的竖井标在地图上。' }
    }
  ];

  const SINGLE_REGIONS = [
    { name: '云岭山道', color: '#6f4e31', exits: '沿山道向河谷推进' },
    { name: '赤水河谷', color: '#355c58', exits: '穿过渡口进入雪线' },
    { name: '风雪高原', color: '#53606b', exits: '越过最后一道封锁线' },
    { name: '草地沼泽', color: '#4b5638', exits: '沿旧驿道穿过草地' },
    { name: '会师通道', color: '#6b4934', exits: '突破通往会师的最后封锁' }
  ];
  const SINGLE_ROOM_INFO = {
    entry: { glyph: '入', name: '区域入口', desc: '山河图边缘的入口，向前便是新的探索区域。' },
    exit: { glyph: '出', name: '山口', desc: '通往下一片山河的狭窄山口。' },
    event: { glyph: '迹', name: '行军遗迹', desc: '附近的旧迹需要靠近调查，才能知道留下了什么。' },
    battle: { glyph: '敌', name: '敌军游哨', desc: '敌军正在附近巡守。主动靠近后可以发起挑战。' },
    elite: { glyph: '将', name: '精英营帐', desc: '一名强敌直接扼守山河图深处，正面挑战会得到更厚回报。' },
    camp: { glyph: '营', name: '废弃营地', desc: '残火还未熄，可以短暂休整，也可能留下补给。' },
    bonfire: { glyph: '✦', name: '星火营火', desc: '在这里点亮星火，恢复全队并记住归来的路。' },
    cache: { glyph: '藏', name: '隐蔽军资', desc: '暗渠深处还留着没有被敌人搜走的军需箱。' },
    boss: { glyph: '首', name: '区域封锁', desc: '最后的封锁线守在此处。看清首领特性后再挑战。' }
  };

  const SINGLE_PICKUP_INFO = {
    ration: { glyph: '粮', name: '散落粮袋', desc: '补充队伍口粮。' },
    herb: { glyph: '药', name: '山草药包', desc: '为队伍处理伤口。' },
    cartridge: { glyph: '弹', name: '遗留弹壳', desc: '回收后换取军功。' },
    star: { glyph: '星', name: '红星纸片', desc: '鼓舞队伍士气。' },
    chart: { glyph: '图', name: '残缺区域图', desc: '补全一片山河图的小地图。' },
    relic: { glyph: '匣', name: '星火残匣', desc: '机关后的旧木匣，只有解开双信号闸才会显现。' },
    equipment: { glyph: '备', name: '遗落军备', desc: '散落在山野角落的制式或精制军备。' },
    story: { glyph: '卷', name: '行军线索', desc: '旧纸、刻记或口述留下的长征故事片段。' }
  };

  const SINGLE_INTERACTION_INFO = {
    secret_wall: { glyph: '缝', action: '拨开石缝', name: '松动石缝', desc: '石缝后有一条通向地下暗渠的旧运粮道。' },
    winch: { glyph: '绞', action: '扳动绞盘', name: '旧渡口绞盘', desc: '铁索会放下通往隐藏渡槽的吊桥。' },
    ice_lock: { glyph: '锁', action: '砸开冰锁', name: '冰封暗门', desc: '冻死的门闩后是通往地下暖渠的另一块区域。' },
    relay: { glyph: '闸', action: '接通信号闸', name: '旧信号闸', desc: '同一区域的两座信号闸同时接通后，暗格才会打开。' }
  };

  const TRAP_INFO = {
    tripwire: { name: '绊发线', glyph: '╳', action: '剪断绊线' },
    rockfall: { name: '落石索', glyph: '▲', action: '卸下落石索' },
    icecrack: { name: '冰裂缝', glyph: '◇', action: '架木板通过' },
    spikepit: { name: '陷坑木刺', glyph: '▽', action: '填平陷坑' }
  };
  const ENEMY_TYPES = {
    blocker: { name: '封锁守备队', glyph: '守', hp: 64, atk: 12, defense: 3, scale: 1.0, color: '#5a3a31', role: '稳守反击' },
    skirmisher: { name: '追兵尖兵', glyph: '疾', hp: 54, atk: 14, defense: 1, scale: .95, color: '#6f352c', role: '快速突击' },
    gunner: { name: '火力封锁组', glyph: '火', hp: 72, atk: 13, defense: 2, scale: 1.06, color: '#4d3430', role: '远程压制' },
    cavalry: { name: '骑兵侦察队', glyph: '骑', hp: 58, atk: 16, defense: 1, scale: 1.02, color: '#5d3028', role: '高攻', crit: .12 },
    cold: { name: '雪线堵截队', glyph: '寒', hp: 68, atk: 13, defense: 3, scale: 1.03, color: '#45505a', role: '耐寒', guard: .15 },
    swamp: { name: '沼泽伏击队', glyph: '伏', hp: 66, atk: 14, defense: 2, scale: 1.0, color: '#3d4934', role: '伏击', firstStunChance: .25 },
    bridgebreaker: { name: '铁索断桥手', glyph: '断', hp: 92, atk: 19, defense: 6, scale: 1.24, color: '#553029', role: '三叠重斩' },
    daduLancer: { name: '川军回马枪', glyph: '回', hp: 82, atk: 21, defense: 3, scale: 1.16, color: '#6b342c', role: '回马贯刺', crit: .16 },
    frostmarksman: { name: '雪岭冷枪手', glyph: '狙', hp: 84, atk: 20, defense: 3, scale: 1.13, color: '#3e4b55', role: '远近夹击' },
    bogReaper: { name: '草地索命客', glyph: '绞', hp: 88, atk: 21, defense: 3, scale: 1.18, color: '#3c4934', role: '泥沼乱刃', crit: .15 },
    boss: { name: '最后的封锁线', glyph: '围', hp: 520, atk: 29, defense: 6, scale: 1.78, color: '#4b1717', role: '最终 Boss', boss: true }
  };
  const ENEMY_PATTERNS = {
    blocker: ['slash', 'guard', 'thrust'],
    skirmisher: ['quick', 'slash', 'thrust'],
    gunner: ['shot', 'guard', 'shot'],
    cavalry: ['thrust', 'slash', 'combo'],
    cold: ['guard', 'slash', 'thrust'],
    swamp: ['quick', 'guard', 'slash'],
    bridgebreaker: ['heavy', 'guard', 'thrust'],
    daduLancer: ['thrust', 'quick', 'combo'],
    frostmarksman: ['shot', 'guard', 'thrust'],
    bogReaper: ['quick', 'slash', 'thrust'],
    boss: ['backstepCleave', 'retreatThrust', 'slowFast', 'whirlwind', 'advanceCombo', 'shot', 'blinkSlash', 'combo'],
    bossRage: ['backstepShot', 'whirlwind', 'advanceCombo', 'backstepCleave', 'slowFast', 'retreatThrust', 'blinkSlash']
  };

  const HIGH_THREAT_INTENTS = new Set(['whirlwind', 'blinkSlash', 'slowFast', 'siege', 'eliteMove', 'advanceCombo', 'backstepCleave', 'retreatThrust', 'backstepShot']);

  const ELITE_PATTERNS = {
    blocker: ['backstepCleave', 'guard', 'eliteMove', 'advanceCombo', 'thrust'],
    skirmisher: ['feintDash', 'quick', 'blinkSlash', 'advanceCombo', 'eliteMove'],
    gunner: ['backstepShot', 'eliteMove', 'retreatThrust', 'shot', 'guard'],
    cavalry: ['retreatThrust', 'advanceCombo', 'eliteMove', 'thrust', 'combo'],
    cold: ['backstepCleave', 'slowFast', 'eliteMove', 'advanceCombo', 'siege'],
    swamp: ['feintDash', 'blinkSlash', 'eliteMove', 'backstepCleave', 'quick'],
    bridgebreaker: ['backstepCleave', 'eliteMove', 'advanceCombo', 'siege', 'guard'],
    daduLancer: ['retreatThrust', 'feintDash', 'eliteMove', 'advanceCombo', 'thrust'],
    frostmarksman: ['backstepShot', 'eliteMove', 'shot', 'retreatThrust', 'guard'],
    bogReaper: ['feintDash', 'eliteMove', 'blinkSlash', 'advanceCombo', 'quick']
  };

  const ELITE_SIGNATURES = {
    blocker: 'whirlwind',
    skirmisher: 'blinkSlash',
    gunner: 'slowFast',
    cavalry: 'whirlwind',
    cold: 'slowFast',
    swamp: 'blinkSlash',
    bridgebreaker: 'eliteMove',
    daduLancer: 'eliteMove',
    frostmarksman: 'eliteMove',
    bogReaper: 'eliteMove'
  };

  const ELITE_VARIANTS = {
    blocker: { name: '铁壁营官', glyph: '壁', color: '#765035', style: 'shield', weapon: 'saber', scale: 1.18, role: '重盾压阵', xp: 1.5 },
    skirmisher: { name: '疾影斥候', glyph: '影', color: '#8f3b2c', style: 'dual', weapon: 'saber', scale: 1.08, role: '双刃抢攻', xp: 1.5 },
    gunner: { name: '压枪督战官', glyph: '铳', color: '#5f4133', style: 'rifle', weapon: 'rifle', scale: 1.13, role: '枪托与火线', xp: 1.6 },
    cavalry: { name: '黑骑掌旗官', glyph: '骑', color: '#672b25', style: 'cavalry', weapon: 'spear', scale: 1.2, role: '长枪冲阵', xp: 1.8 },
    cold: { name: '雪线斩首官', glyph: '霜', color: '#596875', style: 'heavy', weapon: 'saber', scale: 1.16, role: '重斩封路', xp: 1.6 },
    swamp: { name: '沼地伏击首', glyph: '沼', color: '#45563a', style: 'ambush', weapon: 'dagger', scale: 1.1, role: '潜行短刃', xp: 1.8 },
    bridgebreaker: { name: '铁索断桥手', glyph: '断', color: '#62332a', style: 'heavy', weapon: 'saber', scale: 1.26, role: '三叠断岳斩', xp: 1.9, hpMultiplier: 1.28, damageMultiplier: 1.1, posture: 470, habitat: '大渡河险境' },
    daduLancer: { name: '川军回马枪', glyph: '回', color: '#76392e', style: 'cavalry', weapon: 'spear', scale: 1.18, role: '回马三贯刺', xp: 1.9, hpMultiplier: 1.16, damageMultiplier: 1.12, posture: 435, habitat: '大渡河险境' },
    frostmarksman: { name: '雪岭冷枪手', glyph: '狙', color: '#526370', style: 'rifle', weapon: 'rifle', scale: 1.15, role: '枪刃交替绞杀', xp: 1.85, hpMultiplier: 1.12, damageMultiplier: 1.14, posture: 410, habitat: '雪山高寒' },
    bogReaper: { name: '草地索命客', glyph: '绞', color: '#46563b', style: 'dual', weapon: 'saber', scale: 1.2, role: '泥沼五连乱刃', xp: 1.95, hpMultiplier: 1.18, damageMultiplier: 1.15, posture: 450, habitat: '草地沼泽' }
  };

  const ELITE_SPECIALS = {
    blocker: { label: '铁壁崩山撞' },
    skirmisher: { label: '疾影回锋' },
    gunner: { label: '枪托震击' },
    cavalry: { label: '骑枪贯阵' },
    cold: { label: '雪线封杀' },
    swamp: { label: '泥沼伏击' },
    bridgebreaker: { label: '断桥三叠斩' },
    daduLancer: { label: '回马贯日枪' },
    frostmarksman: { label: '雪岭锁魂铳' },
    bogReaper: { label: '沼泽绞杀阵' }
  };

  const LATE_ELITE_POOLS = {
    3: ['bridgebreaker', 'daduLancer'],
    4: ['frostmarksman'],
    5: ['bogReaper']
  };

  const INTENT_LABELS = {
    attack: '横斩', slash: '横斩', heavy: '重斩', quick: '快斩', thrust: '突刺', shot: '射击',
    guard: '戒备', combo: '双连斩', advanceCombo: '三段追斩', retreatThrust: '回马突刺',
    backstepShot: '后撤射击', backstepCleave: '后撤横劈', feintDash: '虚晃快斩',
    whirlwind: '旋风五连', blinkSlash: '瞬步一闪', slowFast: '快慢双刀', siege: '合围强攻',
    eliteMove: '专属绝技'
  };

  const ENEMY_CODEX_ENTRIES = (() => {
    const standardIds = ['blocker', 'skirmisher', 'gunner', 'cavalry', 'cold', 'swamp'];
    const lateIds = ['bridgebreaker', 'daduLancer', 'frostmarksman', 'bogReaper'];
    const entries = [];
    standardIds.forEach((typeId) => {
      const base = ENEMY_TYPES[typeId];
      entries.push({
        key: `normal:${typeId}`, typeId, name: base.name, glyph: base.glyph, color: base.color,
        role: base.role, rank: '普通敌军', habitat: '长征沿线', elite: false, boss: false,
        moves: ENEMY_PATTERNS[typeId] || [], signature: ''
      });
      const variant = ELITE_VARIANTS[typeId];
      entries.push({
        key: `elite:${typeId}`, typeId, name: `精英·${variant.name}`, glyph: variant.glyph, color: variant.color,
        role: variant.role, rank: '精英敌将', habitat: '长征沿线', elite: true, boss: false,
        moves: [...new Set([...(ELITE_PATTERNS[typeId] || []), ELITE_SIGNATURES[typeId] || 'eliteMove'])],
        signature: ELITE_SPECIALS[typeId]?.label || ''
      });
    });
    lateIds.forEach((typeId) => {
      const variant = ELITE_VARIANTS[typeId];
      entries.push({
        key: `elite:${typeId}`, typeId, name: `精英·${variant.name}`, glyph: variant.glyph, color: variant.color,
        role: variant.role, rank: '劲敌', habitat: variant.habitat || '长征后期', elite: true, boss: false,
        moves: [...new Set([...(ELITE_PATTERNS[typeId] || []), 'eliteMove'])],
        signature: ELITE_SPECIALS[typeId]?.label || ''
      });
    });
    entries.push({
      key: 'boss:boss', typeId: 'boss', name: ENEMY_TYPES.boss.name, glyph: ENEMY_TYPES.boss.glyph,
      color: ENEMY_TYPES.boss.color, role: ENEMY_TYPES.boss.role, rank: '最终 Boss', habitat: '会宁会师前',
      elite: false, boss: true, moves: ENEMY_PATTERNS.boss, signature: ''
    });
    return entries;
  })();

  const SQUADS = {
    scout: {
      id: 'scout', name: '侦察连', icon: '侦', maxHp: 82, atk: 13, defense: 3,
      crit: .2, supplies: 56, morale: 74,
      passive: '首击暴击更高，擅长主动抢节奏。',
      tags: ['爆发', '先手'], detail: '侦察连出手快，首击更容易暴击，适合主动抢招和追击；生命与防御偏低。'
    },
    engineer: {
      id: 'engineer', name: '工兵连', icon: '工', maxHp: 98, atk: 12, defense: 6,
      crit: .1, supplies: 62, morale: 68, guardCounterWindowBonus: 100,
      passive: '受击减伤，格挡后的守反更强。',
      tags: ['防御', '守反'], detail: '工兵连最擅长守势，能把伤害压低，挡刀后的守反也更重。看准时机架刀，再把敌刃推回去。'
    },
    medic: {
      id: 'medic', name: '卫生队', icon: '医', maxHp: 88, atk: 11, defense: 4,
      crit: .13, supplies: 84, morale: 78,
      passive: '每场第一次挡下敌刃，可替队伍回一点兵力。',
      tags: ['续航', '补给'], detail: '卫生队补给充足，每次交锋第一次挡住敌刃都能救回一点兵力；正面劈砍不算凶狠。'
    },
    sharpshooter: {
      id: 'sharpshooter', name: '神枪排', icon: '枪', maxHp: 78, atk: 12, defense: 2,
      crit: .18, supplies: 54, morale: 70, rangedBonus: .22,
      passive: '步枪伤害提升，远距离压制更强。',
      tags: ['远程', '暴击'], detail: '神枪排的步枪伤害更高，适合在枪线外消耗敌将；近身承压能力较弱。'
    },
    vanguard: {
      id: 'vanguard', name: '突击排', icon: '锋', maxHp: 90, atk: 14, defense: 3,
      crit: .12, supplies: 50, morale: 78, chargeBonus: .24,
      passive: '突刺伤害更高，适合正面破阵。',
      tags: ['突刺', '强攻'], detail: '突击排攻势高，长按左键的突刺伤害更强，但补给偏少，需要控制进攻节奏。'
    },
    quartermaster: {
      id: 'quartermaster', name: '辎重队', icon: '粮', maxHp: 94, atk: 10, defense: 5,
      crit: .1, supplies: 96, morale: 74, supplyCostReduction: 3, healBonus: 6,
      passive: '补给充足，紧急补给消耗更低。',
      tags: ['补给', '耐久'], detail: '辎重队携带更多补给，紧急补给消耗更低且恢复更多，适合长线周旋；爆发较弱。'
    }
  };


  const UPGRADES = [
    { id: 'bayonet', name: '刺刀见红', icon: '刃', desc: '五式刀势更重', detail: '接下来每一式普通连锋都会多几分劲力，越敢把刀势走完，收获越大。', effects: [{ label: '连锋威力', value: '+6', tone: 'gain' }], notes: ['五式连锋都会变强。', '突刺、射击和处决不受影响。'], apply: (p) => { p.basicBonus += 6; } },
    { id: 'ironfoot', name: '铁脚板', icon: '行', desc: '带得动更多伤亡', detail: '队伍能承受更多损失，换编时也会立刻补回一点兵力。', effects: [{ label: '兵力上限', value: '+24', tone: 'gain' }, { label: '立即补回', value: '+10', tone: 'gain' }], notes: ['上限提高后，恢复空间更大。', '不会直接把兵力补满。'], apply: (p) => { p.maxHp += 24; p.hp = Math.min(p.maxHp, p.hp + 10); } },
    { id: 'breath', name: '静气凝神', icon: '息', desc: '阵脚更稳', detail: '全队更能扛住连续压迫，喘息时还会卸去一点已经积起的架势。', effects: [{ label: '架势上限', value: '+18', tone: 'gain' }, { label: '立即卸力', value: '-8', tone: 'gain' }], notes: ['架势更耐压，不容易被连招打崩。', '收刀换气时，累积的架势也会减轻。'], apply: (p) => { p.maxPosture += 18; p.posture = Math.max(0, p.posture - 8); } },
    { id: 'marksman', name: '神枪手', icon: '准', desc: '刀枪更易命中要害', detail: '全队更容易在交锋中抓住敌将破绽，打出格外沉重的一击。', effects: [{ label: '暴击', value: '+9%', tone: 'gain' }], notes: ['连锋、突刺、射击和反击都可能打出暴击。', '暴击会让这一击格外沉重。'], apply: (p) => { p.crit += .09; } },
    { id: 'logistics', name: '群众支前', icon: '粮', desc: '队伍走得更远', detail: '乡亲们送来更多粮食和弹药，队伍能多撑几次急行军与苦战。', effects: [{ label: '补给上限', value: '+24', tone: 'gain' }, { label: '立即补足', value: '+22', tone: 'gain' }], notes: ['突刺与紧急补给都要靠补给。', '军需补足后，长线行军会更从容。'], apply: (p) => { p.maxSupplies += 24; p.supplies = Math.min(p.maxSupplies, p.supplies + 22); } },
    { id: 'charge', name: '突刺训练', icon: '锋', desc: '长枪般的突刺更狠', detail: '长按左键的突刺更加凌厉，最适合刺穿敌将收招后的大空档。', effects: [{ label: '突刺威力', value: '+28%', tone: 'gain' }], notes: ['专门磨砺长按左键的突刺。', '离敌将太远会刺空。'], apply: (p) => { p.chargeBonus += .28; } },
    { id: 'blood', name: '血战到底', icon: '血', desc: '兵力越少，刀越狠', detail: '兵力不足四成时，全队攻击都会变得更凶。这是一条险中求胜的路。', effects: [{ label: '兵力不足四成时伤害', value: '+30%', tone: 'gain' }], notes: ['只有兵力低于四成时才会变强。', '与士气、暴击和其他战法叠加。'], apply: (p) => { p.lowHpBonus += .3; } },
    { id: 'banner', name: '红旗不倒', icon: '旗', desc: '士气越打越盛', detail: '战斗中士气回升更快，高涨的士气也会让刀势更盛。', effects: [{ label: '士气回升', value: '+3', tone: 'gain' }, { label: '士气带来的威力', value: '+16%', tone: 'gain' }], notes: ['士气高涨时，刀势更盛；士气低落时，伤害也会下降。', '战斗中士气会逐渐回升。'], apply: (p) => { p.moraleRegen += 3; p.moralePower += .16; } },
    { id: 'ration', name: '炒面袋', icon: '袋', desc: '一口炒面，多撑一程', detail: '紧急补给更省粮，战地急救与临时补给也能恢复更多兵力。', effects: [{ label: '补给消耗', value: '-3', tone: 'gain' }, { label: '恢复兵力', value: '+8', tone: 'gain' }], notes: ['再省也要留下一点补给。', '战地急救与紧急补给都会恢复更多兵力。'], apply: (p) => { p.supplyCostReduction = Math.min(5, p.supplyCostReduction + 3); p.healBonus += 8; } },
    { id: 'vanguard', name: '先遣突击', icon: '锋', desc: '第一刀直取要害', detail: '每场交锋的第一刀都格外凶狠，最适合一照面便压住敌将。', effects: [{ label: '首刀', value: '必定暴击', tone: 'gain' }], notes: ['每场战斗的第一刀必定暴击。', '守反与闪避反击也会算作第一刀。'], apply: (p) => { p.firstStrikeCrit = true; } },
    { id: 'combo_flow', name: '连环刀诀', icon: '连', desc: '一式接一式更从容', detail: '五式刀势更容易接上，整套连锋也会更有劲。', effects: [{ label: '连锋威力', value: '+4', tone: 'gain' }, { label: '接续时间', value: '更从容', tone: 'gain' }], notes: ['一至五式都会受益。', '上一式收刀后继续按左键；第四式后第五式会顺势跟上。'], apply: (p) => { p.basicBonus += 4; p.comboWindowBonus += 150; } }
  ];

  const SHOP_ITEMS = [
    { id: 'field_hospital', name: '战地救护', icon: '医', cost: 120, step: 60, max: 2, desc: '每战多带一次急救', detail: '随军医箱里多备一份急救药。代价不轻，却能在最危险的时候把队伍拉回来。', effects: [{ label: '每场急救', value: '+1', tone: 'gain' }], notes: ['每场交锋开始时都会备好。', '本店只有一件，卖完即止。'], apply: (p) => { p.emergencyBonus += 1; } },
    { id: 'parry_edge', name: '弹刃淬锋', icon: '刃', cost: 64, step: 22, max: 3, desc: '挡开敌刃后反击更狠', detail: '架开敌刃后顺势劈出的守反更加凌厉。', effects: [{ label: '守反威力', value: '+18%', tone: 'gain' }], notes: ['弹反本身不伤敌，强的是紧接着的一刀。', '普通格挡与完美弹反都能接出更重的守反。'], apply: (p) => { p.guardCounterBonus += .18; } },
    { id: 'iron_body', name: '百炼体魄', icon: '体', cost: 46, step: 16, max: 4, desc: '全队更能吃苦', detail: '队伍能承受更多损失，换防时也会立刻补回一股力气。', effects: [{ label: '兵力上限', value: '+22', tone: 'gain' }, { label: '立即补回', value: '+18', tone: 'gain' }], notes: ['买下即可受用。', '本店只有一件，卖完即止。'], apply: (p) => { p.maxHp += 22; p.hp = Math.min(p.maxHp, p.hp + 18); } },
    { id: 'deep_breath', name: '吐纳心法', icon: '息', cost: 42, step: 15, max: 4, desc: '阵脚更稳，气息更长', detail: '队伍更耐连招压迫，调息时也能卸去更多架势。', effects: [{ label: '架势上限', value: '+20', tone: 'gain' }, { label: '立即卸力', value: '-10', tone: 'gain' }], notes: ['架势越稳，越不容易被连招打崩。', '本店只有一件，卖完即止。'], apply: (p) => { p.maxPosture += 20; p.posture = Math.max(0, p.posture - 10); } },
    { id: 'dodge_counter', name: '追风反击', icon: '闪', cost: 58, step: 20, max: 3, desc: '闪开后追刀更狠', detail: '侧身让过锋刃后，顺着敌将收招的空档追上去，反击更重也更好接。', effects: [{ label: '闪避反击威力', value: '+20%', tone: 'gain' }, { label: '追刀时机', value: '更从容', tone: 'gain' }], notes: ['闪身时的护身时间不会因此变长。', '只强化闪开后接出的追刀。'], apply: (p) => { p.dodgeCounterBonus += .2; p.dodgeCounterWindowBonus += 120; } },
    { id: 'guard_counter', name: '守正反击', icon: '守', cost: 54, step: 18, max: 3, desc: '挡刀之后接得更稳', detail: '架开敌刃后有更充裕的时间顺势劈回去，守反也更重。', effects: [{ label: '守反时机', value: '更从容', tone: 'gain' }, { label: '守反威力', value: '+8%', tone: 'gain' }], notes: ['挡刀本身不会伤敌。', '与弹刃淬锋一起使用时，守反会更加沉重。'], apply: (p) => { p.guardCounterBonus += .08; p.guardCounterWindowBonus += 150; } },
    { id: 'pack_mule', name: '随军辎重', icon: '粮', cost: 38, step: 12, max: 3, desc: '粮弹更充裕', detail: '辎重队多带一程粮弹，马上补足队伍行囊。', effects: [{ label: '补给上限', value: '+22', tone: 'gain' }, { label: '立即补足', value: '+20', tone: 'gain' }], notes: ['突刺与紧急补给都会更从容。', '本店只有一件，卖完即止。'], apply: (p) => { p.maxSupplies += 22; p.supplies = Math.min(p.maxSupplies, p.supplies + 20); } },
    { id: 'war_drum', name: '战鼓催锋', icon: '鼓', cost: 42, step: 14, max: 3, desc: '鼓声一响，刀势更盛', detail: '士气越旺，队伍的刀势越重；战鼓响起时也会立刻提振全队。', effects: [{ label: '士气带来的威力', value: '+12%', tone: 'gain' }, { label: '立刻提振', value: '+12', tone: 'gain' }], notes: ['士气高涨时，增势更明显。', '本店只有一件，卖完即止。'], apply: (p) => { p.moralePower += .12; p.morale = Math.min(100, p.morale + 12); } },
    { id: 'march_boots', name: '行军绑腿', icon: '绑', cost: 52, step: 18, max: 2, desc: '走得更快，闪身更顺', detail: '绑腿收住脚步，长路和战斗换位都更利落。', effects: [{ label: '移动速度', value: '+8%', tone: 'gain' }, { label: '闪避恢复', value: '+8%', tone: 'gain' }], notes: ['地图移动和战斗走位同时生效。', '不改变闪避无敌帧。'], apply: (p) => { p.moveSpeedBonus += .08; p.dodgeCooldownReduction += .08; } },
    { id: 'field_cook', name: '随军灶', icon: '灶', cost: 34, step: 12, max: 3, desc: '热饭热汤，队伍走得更远', detail: '一口热饭能把疲惫压下去，补给线也更耐用。', effects: [{ label: '补给上限', value: '+18', tone: 'gain' }, { label: '治疗', value: '+4', tone: 'gain' }], notes: ['补给与治疗都会受益。'], apply: (p) => { p.maxSupplies += 18; p.healBonus += 4; } },
    { id: 'merit_scroll', name: '军功簿页', icon: '簿', cost: 48, step: 16, max: 2, desc: '把战果记清楚，军需更好谈', detail: '缴获、处决和战果被详细记账，后续军需更容易压价。', effects: [{ label: '军功收益', value: '+10%', tone: 'gain' }, { label: '军需价格', value: '-5%', tone: 'gain' }], notes: ['军功收益只影响战斗所得。', '军需折扣在本局后续商店生效。'], apply: (p) => { p.meritGainBonus = (p.meritGainBonus || 0) + .1; p.shopDiscount = Math.min(.3, (p.shopDiscount || 0) + .05); } },
    { id: 'bayonet_drill', name: '刺刀操典', icon: '典', cost: 50, step: 16, max: 2, desc: '突刺与变招更有章法', detail: '操典把突刺、换步和追击连成一套。', effects: [{ label: '突刺威力', value: '+18%', tone: 'gain' }, { label: '变招威力', value: '+5%', tone: 'gain' }], notes: ['适合喜欢长按攻击和变招的打法。'], apply: (p) => { p.chargeBonus += .18; p.techniqueDamageBonus += .05; } }
  ];


  function relicShopOffer(relic) {
    const base = relic.rarity === '稀有' ? 125 : 95;
    return {
      id: `shop-relic-${relic.id}`, kind: 'relic', relicId: relic.id, name: relic.name, icon: relic.icon,
      cost: base, shopCost: base, stock: 1, max: 1,
      desc: relic.desc, detail: relic.desc, effects: [{ label: '信物效果', value: relic.effect, tone: 'gain' }],
      notes: ['永久收入信物栏。'], apply: (p) => grantRelic(p, relic.id, { silent: true })
    };
  }
  function consumableShopOffer(item) {
    const cost = Math.round(item.cost * 1.05);
    return {
      id: `shop-consumable-${item.id}`, kind: 'consumable', consumableId: item.id, name: item.name, icon: item.icon,
      cost, shopCost: cost, stock: 1, max: 1,
      desc: item.desc, detail: item.desc, effects: [{ label: '使用效果', value: item.effect, tone: 'gain' }],
      notes: ['进入战备栏，可在战斗中使用。'], apply: (p) => addConsumable(p, item.id, 1, { silent: true })
    };
  }
  function shopCatalog() {
    return [
      ...SHOP_ITEMS.map((item) => ({ ...item, kind: item.kind || 'effect' })),
      ...RELICS.map(relicShopOffer),
      ...CONSUMABLES.map(consumableShopOffer)
    ];
  }
  function shopItemById(id) {
    return shopCatalog().find((item) => item.id === id) || SHOP_ITEMS.find((item) => item.id === id) || null;
  }
  function buildShopOffers() {
    const p = state.player;
    const effects = shuffle(state.rng, SHOP_ITEMS.filter((item) => item.kind !== 'equipment' && (p.shopCounts?.[item.id] || 0) < (item.max || 99))).slice(0, 5).map((item) => ({ ...item, kind: 'effect', stock: 1 }));
    const equipment = shuffle(state.rng, SHOP_ITEMS.filter((item) => item.kind === 'equipment' && !(p.equipmentInventory || []).some((unit) => unit.itemId === item.equipmentId))).slice(0, 2).map((item) => ({ ...item, kind: 'equipment', stock: 1 }));
    const relics = shuffle(state.rng, RELICS.filter((relic) => !(p.relics || []).includes(relic.id))).slice(0, 4).map((relic) => ({ ...relicShopOffer(relic), stock: 1 }));
    const consumables = shuffle(state.rng, CONSUMABLES).slice(0, 3).map((item) => ({ ...consumableShopOffer(item), stock: 1 }));
    return [...effects, ...equipment, ...relics, ...consumables];
  }

  SHOP_ITEMS.push(...EQUIPMENT_ITEMS.map((item) => ({
    id: `equipment_${item.id}`, equipmentId: item.id, kind: 'equipment', name: item.name, icon: item.icon,
    cost: item.cost, shopCost: item.cost, step: 18, max: 1, desc: `${EQUIPMENT_RARITIES[item.rarity].name}军备 · ${item.category}`,
    detail: `${item.desc} 军备提供数值成长，可随时在军备栏装备或卸下。`, effects: item.effects,
    notes: ['本店只有一件，售完即止。', '购买后收入军备栏，不占用信物位置。'], apply: (p) => acquireEquipment(p, item.id, { source: '军需站', silent: true })
  })));

  const ROUTE_TYPES = [
    {
      id: 'assault', icon: '⚔', title: '正面突破', subtitle: '迎着封锁线打过去',
      desc: '敌将硬气，招法更凶；打赢后收获也更厚。',
      tags: ['劲敌', '厚赏'], supply: 0, heal: 0, xp: 1.5, count: 1, elite: true
    },
    {
      id: 'flank', icon: '↗', title: '迂回穿插', subtitle: '绕开正面，咬住薄弱点',
      desc: '战后获得补给。',
      tags: ['补给'], supply: 12, heal: 0, xp: 1.1, count: 1
    },
    {
      id: 'support', icon: '民', title: '群众带路', subtitle: '沿熟悉地形隐蔽接敌',
      desc: '战前恢复少量兵力。',
      tags: ['恢复'], supply: 8, heal: 12, xp: 1.0, count: 1
    },
    {
      id: 'night', icon: '夜', title: '夜袭接敌', subtitle: '借黑夜先打乱敌军',
      desc: '敌军短暂迟滞。',
      tags: ['迟滞'], supply: 0, heal: 0, xp: 1.12, count: 1, firstStun: true
    }
  ];

  const EVENTS = [
    {
      id: 'rain', title: '突来的山雨', desc: '前路泥泞，队伍必须决定如何保存体力。',
      choices: [
        { label: '冒雨赶路', desc: '士气上升，兵力下降。', tag: '士气', apply: (p) => { p.hp = Math.max(1, p.hp - 6); p.morale = Math.min(100, p.morale + 7); } },
        { label: '找地方避雨', desc: '消耗补给，恢复少量兵力。', tag: '恢复', apply: (p) => { p.supplies = Math.max(0, p.supplies - 7); p.hp = Math.min(p.maxHp, p.hp + 8); } }
      ]
    },
    {
      id: 'fork', title: '岔路侦察', desc: '两条山路都看不到尽头，需要决定是否分兵侦察。',
      choices: [
        { label: '派人侦察', desc: '消耗补给，提升士气。', tag: '侦察', apply: (p) => { p.supplies = Math.max(0, p.supplies - 4); p.morale = Math.min(100, p.morale + 6); } },
        { label: '直接前进', desc: '节省补给，但队伍会疲惫。', tag: '急行', apply: (p) => { p.hp = Math.max(1, p.hp - 4); p.supplies = Math.min(p.maxSupplies, p.supplies + 5); } }
      ]
    },
    {
      id: 'supply', title: '一支遗落的物资', desc: '物资有限，只能优先补充一项。',
      choices: [
        { label: '先补粮食', desc: '恢复兵力，士气略降。', tag: '粮秣', apply: (p) => { p.hp = Math.min(p.maxHp, p.hp + 11); p.morale = Math.max(0, p.morale - 3); } },
        { label: '先补弹药', desc: '补给增加，兵力略降。', tag: '补给', apply: (p) => { p.supplies = Math.min(p.maxSupplies, p.supplies + 12); p.hp = Math.max(1, p.hp - 3); } }
      ]
    },
    {
      id: 'cold', title: '夜里的寒气', desc: '队伍需要决定是否消耗补给生火。',
      choices: [
        { label: '生火休整', desc: '消耗补给，恢复兵力。', tag: '休整', apply: (p) => { p.supplies = Math.max(0, p.supplies - 8); p.hp = Math.min(p.maxHp, p.hp + 10); } },
        { label: '摸黑赶路', desc: '节省补给，士气上升，兵力下降。', tag: '夜行', apply: (p) => { p.hp = Math.max(1, p.hp - 5); p.morale = Math.min(100, p.morale + 6); } }
      ]
    },
    {
      id: 'wounded', title: '伤员的请求', desc: '继续行军和照顾伤员之间必须取舍。',
      choices: [
        { label: '轮流搀扶', desc: '士气上升，体力下降。', tag: '互助', apply: (p) => { p.hp = Math.max(1, p.hp - 7); p.morale = Math.min(100, p.morale + 8); } },
        { label: '整修担架', desc: '兵力上限小幅提高，补给下降。', tag: '整备', apply: (p) => { p.maxHp += 4; p.hp = Math.min(p.maxHp, p.hp + 3); p.supplies = Math.max(0, p.supplies - 6); } }
      ]
    },
    {
      id: 'scout', title: '远处的枪声', desc: '前方可能有敌军，也可能只是风声。',
      choices: [
        { label: '绕路隐蔽', desc: '消耗补给，敌方接敌更慢。', tag: '隐蔽', apply: (p) => { p.supplies = Math.max(0, p.supplies - 5); p.morale = Math.min(100, p.morale + 4); } },
        { label: '快速通过', desc: '保留补给，队伍会受到消耗。', tag: '冒险', apply: (p) => { p.hp = Math.max(1, p.hp - 5); p.supplies = Math.min(p.maxSupplies, p.supplies + 6); } }
      ]
    },
    {
      id: 'chishui_bridge', chapters: [1], scene: 'assets/events/chishui-river.webp', sceneCredit: 'Gujin Chishui · HighestBridges / CC BY 4.0', context: '1935年1月至3月，中央红军在川黔滇边界四次渡过赤水河，以灵活机动争取主动。',
      title: '赤水河上的浮桥', desc: '部队需要连续转移，浮桥是否稳固关系到全队能否迅速过河。',
      choices: [
        { label: '加固浮桥', desc: '消耗补给，稳住队伍并恢复少量兵力。', tag: '架桥', apply: (p) => { p.supplies = Math.max(0, p.supplies - 6); p.hp = Math.min(p.maxHp, p.hp + 4); p.morale = Math.min(100, p.morale + 6); } },
        { label: '轻装抢渡', desc: '保存物资，但队伍会更疲惫。', tag: '急渡', apply: (p) => { p.hp = Math.max(1, p.hp - 4); p.morale = Math.min(100, p.morale + 9); } }
      ]
    },
    {
      id: 'chishui_trail', chapters: [1], scene: 'assets/events/chishui-town.webp', sceneCredit: '赤水河岸 · Wahsaw / CC0', context: '四渡赤水期间，红军在敌军围追堵截中反复穿插，隐蔽行踪与快速转移同样重要。',
      title: '追兵逼近', desc: '侦察发现敌军正在靠近，队伍必须决定怎样掩护这次转移。',
      choices: [
        { label: '分散隐蔽', desc: '消耗补给，换取更安全的转移。', tag: '隐蔽', apply: (p) => { p.supplies = Math.max(0, p.supplies - 5); p.morale = Math.min(100, p.morale + 8); } },
        { label: '全队急行', desc: '节省物资，但急行军会消耗兵力。', tag: '急行', apply: (p) => { p.hp = Math.max(1, p.hp - 5); p.supplies = Math.min(p.maxSupplies, p.supplies + 5); } }
      ]
    },
    {
      id: 'jinsha_boats', chapters: [2], scene: 'assets/events/jinsha-ferry.webp', sceneCredit: '金沙江 · ogwen / CC BY-SA 3.0', context: '1935年5月，中央红军在皎平渡等渡口分批渡过金沙江，组织秩序和船工支援十分关键。',
      title: '渡口只有几条船', desc: '船少水急，所有人不可能同时渡江，必须决定渡江次序。',
      choices: [
        { label: '分批渡江', desc: '消耗补给，保持秩序并鼓舞士气。', tag: '秩序', apply: (p) => { p.supplies = Math.max(0, p.supplies - 7); p.morale = Math.min(100, p.morale + 8); } },
        { label: '先送伤员', desc: '优先照顾伤员，但会消耗更多物资。', tag: '救护', apply: (p) => { p.supplies = Math.max(0, p.supplies - 9); p.hp = Math.min(p.maxHp, p.hp + 8); p.morale = Math.min(100, p.morale + 5); } }
      ]
    },
    {
      id: 'jinsha_night', chapters: [2], scene: 'assets/events/jinsha-gorge.webp', sceneCredit: '金沙江峡谷 · Wingchi Poon / CC BY-SA 3.0', context: '金沙江水流湍急，渡船与渡口条件有限，红军必须抓紧有限时间完成渡江。',
      title: '江边的夜工', desc: '渡船需要整修，也可以派人沿岸寻找新的渡口。',
      choices: [
        { label: '抢修船只', desc: '消耗补给，保证渡江秩序。', tag: '整备', apply: (p) => { p.supplies = Math.max(0, p.supplies - 5); p.hp = Math.min(p.maxHp, p.hp + 5); } },
        { label: '沿岸寻渡', desc: '更辛苦，但有机会补充物资。', tag: '侦察', apply: (p) => { p.hp = Math.max(1, p.hp - 5); p.supplies = Math.min(p.maxSupplies, p.supplies + 7); p.morale = Math.min(100, p.morale + 4); } }
      ]
    },
    {
      id: 'luding_race', chapters: [3], scene: 'assets/events/luding-bridge.webp', sceneCredit: '泸定桥 · Huangdan2060 / CC0', context: '1935年5月，红四团沿大渡河北上急行军，争夺泸定桥这一北上通道。',
      title: '沿河争分夺秒', desc: '道路难行，队伍必须在速度和体力之间作出取舍。',
      choices: [
        { label: '轮换前出', desc: '消耗补给，保持行军速度。', tag: '急行军', apply: (p) => { p.supplies = Math.max(0, p.supplies - 6); p.morale = Math.min(100, p.morale + 9); } },
        { label: '照看伤员', desc: '队伍更慢，但能保持团结。', tag: '互助', apply: (p) => { p.hp = Math.max(1, p.hp - 4); p.morale = Math.min(100, p.morale + 7); } }
      ]
    },
    {
      id: 'dadu_vanguard', chapters: [3], scene: 'assets/events/dadu-river.webp', sceneCredit: '大渡河 · Huangdan2060 / CC0', context: '中央红军先头部队在安顺场强渡大渡河，随后继续争夺北上通道。',
      title: '先遣队的请求', desc: '需要挑选骨干前出，也需要为后续队伍保留力量。',
      choices: [
        { label: '加强先遣', desc: '短期消耗兵力，换取更高士气。', tag: '先遣', apply: (p) => { p.hp = Math.max(1, p.hp - 6); p.morale = Math.min(100, p.morale + 10); } },
        { label: '沿岸寻渡', desc: '消耗补给，寻找更稳妥的通道。', tag: '侦察', apply: (p) => { p.supplies = Math.max(0, p.supplies - 5); p.hp = Math.min(p.maxHp, p.hp + 3); } }
      ]
    },
    {
      id: 'snow_aid', chapters: [4], scene: 'assets/events/jiajin-snow.webp', sceneCredit: '夹金山 · Lau Phang / CC BY-SA 3.0', context: '1935年6月，中央红军翻越夹金山，严寒、缺氧和装备单薄给队伍造成严重考验。',
      title: '风雪中的互助', desc: '有人体力不支，队伍需要决定怎样一起翻过山口。',
      choices: [
        { label: '轮流搀扶', desc: '消耗体力，但能稳住士气。', tag: '互助', apply: (p) => { p.hp = Math.max(1, p.hp - 5); p.morale = Math.min(100, p.morale + 10); } },
        { label: '集中休整', desc: '消耗补给，让队伍恢复体力。', tag: '休整', apply: (p) => { p.supplies = Math.max(0, p.supplies - 8); p.hp = Math.min(p.maxHp, p.hp + 8); } }
      ]
    },
    {
      id: 'snow_route', chapters: [4], scene: 'assets/events/snow-terrain.webp', sceneCredit: '雪地场景 · hexg / CC BY 3.0', context: '高海拔行军需要控制节奏，也要防止队伍在风雪中失散。',
      title: '风雪中的路标', desc: '前路被雪覆盖，继续前进需要可靠的路线判断。',
      choices: [
        { label: '骨干探路', desc: '消耗补给，提升队伍信心。', tag: '探路', apply: (p) => { p.supplies = Math.max(0, p.supplies - 4); p.morale = Math.min(100, p.morale + 8); } },
        { label: '沿前队足迹', desc: '更省体力，也更节省物资。', tag: '跟进', apply: (p) => { p.hp = Math.max(1, p.hp - 4); p.supplies = Math.min(p.maxSupplies, p.supplies + 4); } }
      ]
    },
    {
      id: 'grass_ration', chapters: [5], scene: 'assets/events/grassland.webp', sceneCredit: '草地河湾 · Zhangmoon618 / Public domain', context: '1935年8月，中央红军穿越松潘草地，缺粮、疾病和沼泽构成持续考验。',
      title: '草地里的分粮', desc: '携带的粮食有限，分粮方式会影响队伍能否继续前进。',
      choices: [
        { label: '优先伤员', desc: '消耗补给，恢复兵力并鼓舞士气。', tag: '互助', apply: (p) => { p.supplies = Math.max(0, p.supplies - 6); p.hp = Math.min(p.maxHp, p.hp + 8); p.morale = Math.min(100, p.morale + 6); } },
        { label: '严格定量', desc: '保存补给，但队伍会更疲惫。', tag: '节粮', apply: (p) => { p.hp = Math.max(1, p.hp - 3); p.supplies = Math.min(p.maxSupplies, p.supplies + 5); p.morale = Math.min(100, p.morale + 3); } }
      ]
    },
    {
      id: 'grass_rope', chapters: [5], scene: 'assets/events/grassland-road.webp', sceneCredit: '草地河湾 · Zhangmoon618 / Public domain', context: '松潘草地沼泽遍布，探路、宿营和互助关系到队伍能否保持完整。',
      title: '看不见的沼泽', desc: '前方地面难以判断，队伍必须选择通过办法。',
      choices: [
        { label: '结绳互助', desc: '消耗补给，保证队伍不散。', tag: '互助', apply: (p) => { p.supplies = Math.max(0, p.supplies - 5); p.morale = Math.min(100, p.morale + 8); } },
        { label: '抢占干地', desc: '消耗体力，换取休整空间和补给。', tag: '宿营', apply: (p) => { p.hp = Math.max(1, p.hp - 4); p.supplies = Math.min(p.maxSupplies, p.supplies + 6); } }
      ]
    }
  ];

  EVENTS.push(
    { id:'relic_medicine', title:'岩洞里的旧药箱', desc:'一只被遗弃的药箱藏在岩洞里，箱内还有能用的药材。', choices:[
      { label:'用军功换药材', desc:'消耗军功，取得药草囊。', tag:'信物', cost:{merit:36}, relicId:'herb_bag' },
      { label:'只取干粮', desc:'补充补给，不动药材。', tag:'补给', apply:(p)=>{p.supplies=Math.min(p.maxSupplies,p.supplies+12);} }
    ]},
    { id:'relic_whetstone', title:'磨刀的老兵', desc:'一位退下来的老班长愿意替队伍磨刀，但要先拿出像样的口粮。', choices:[
      { label:'拿补给换磨刀', desc:'消耗补给，取得磨刀石。', tag:'信物', cost:{supplies:12}, relicId:'whetstone' },
      { label:'陪他喝碗热水', desc:'不取信物，听老兵讲路况，恢复士气。', tag:'士气', apply:(p)=>{p.morale=Math.min(100,p.morale+12);} }
    ]},
    { id:'relic_crossing', title:'渡口边的废竹筏', desc:'旧竹筏已经不能渡人，却还能拆出几段结实竹片。', choices:[
      { label:'拆竹护身', desc:'消耗补给，取得渡江竹片。', tag:'信物', cost:{supplies:10}, relicId:'river_bamboo' },
      { label:'换一张旧地图', desc:'消耗军功，取得油纸地图。', tag:'信物', cost:{merit:32}, relicId:'oil_map' }
    ]},
    { id:'relic_red_star', title:'山神庙里的红星章', desc:'供桌下压着一枚红星章，庙墙还挂着半面旧旗。', choices:[
      { label:'亲手挖出红星章', desc:'消耗少量兵力，取得红星章。', tag:'信物', cost:{hp:12}, relicId:'red_star' },
      { label:'收下红旗角', desc:'消耗军功，取得红旗角。', tag:'信物', cost:{merit:26}, relicId:'red_banner' }
    ]},
    { id:'relic_bugle', title:'雪线上的黄铜号角', desc:'风雪里传来一声旧号声，半截黄铜号角埋在雪下。', choices:[
      { label:'挖出号角', desc:'消耗兵力，取得黄铜号角。', tag:'信物', cost:{hp:9}, relicId:'brass_horn' },
      { label:'留下干粮给冻伤的人', desc:'消耗补给，恢复兵力与士气。', tag:'互助', apply:(p)=>{p.supplies=Math.max(0,p.supplies-6);p.hp=Math.min(p.maxHp,p.hp+12);p.morale=Math.min(100,p.morale+8);} }
    ]},
    { id:'relic_blade_lesson', title:'老班长的回身刀', desc:'老班长愿意把压箱底的回身刀教给队伍，但要先看队伍是否吃得下这份苦。', choices:[
      { label:'学回旋破阵', desc:'消耗军功，学会横向变招。', tag:'变招', cost:{merit:45}, techniqueId:'whirlwind' },
      { label:'换一双草鞋', desc:'消耗补给，取得草鞋。', tag:'信物', cost:{supplies:15}, relicId:'straw_shoes' }
    ]},
    { id:'relic_breach_lesson', title:'老班长的换步刀', desc:'老班长在雪地上连走三步，刀锋始终压着敌将中线。', choices:[
      { label:'学破锋进斩', desc:'消耗军功，学会向前压进的变招。', tag:'变招', cost:{merit:48}, techniqueId:'breach' },
      { label:'系上赤绸条', desc:'消耗补给，取得赤绸条。', tag:'信物', cost:{supplies:12}, relicId:'red_ribbon' }
    ]},
    { id:'relic_scout_pack', title:'侦察员的旧挎包', desc:'包里有半只罗盘、一卷油布和一截还能点着的松明。', choices:[
      { label:'留下侦察罗盘', desc:'消耗军功，取得侦察罗盘。', tag:'信物', cost:{merit:28}, relicId:'scout_compass' },
      { label:'拆出松明火把', desc:'消耗补给，取得松明火把。', tag:'信物', cost:{supplies:10}, relicId:'pine_torch' }
    ]},
    { id:'relic_engineer_shed', title:'兵工棚里的废料', desc:'废铁、弹壳和旧绳索堆在角落里，懂行的人能从中找到宝。', choices:[
      { label:'收起弹壳模具', desc:'消耗军功，取得弹壳模具。', tag:'信物', cost:{merit:30}, relicId:'ammo_mold' },
      { label:'带走铁索钩', desc:'消耗补给，取得铁索钩。', tag:'信物', cost:{supplies:12}, relicId:'iron_hook' }
    ]},
    { id:'relic_stretcher_team', title:'担架队留下的麻绳', desc:'麻绳上还沾着泥，担架队把它留给后来的人。', choices:[
      { label:'重新编成担架绳', desc:'消耗少量兵力，取得担架麻绳。', tag:'信物', cost:{hp:8}, relicId:'hemp_stretcher' },
      { label:'收好战地绷带', desc:'消耗补给，取得战地绷带。', tag:'信物', cost:{supplies:10}, relicId:'field_tourniquet' }
    ]},
    { id:'relic_signal_hill', title:'山谷里的号声', desc:'风把一个旧号声送过山脊，半截军哨和旗角落在石缝里。', choices:[
      { label:'收下行军哨', desc:'消耗士气，取得行军哨。', tag:'信物', cost:{morale:10}, relicId:'marshal_whistle' },
      { label:'收起会师旗角', desc:'消耗军功，取得会师旗角。', tag:'信物', cost:{merit:42}, relicId:'victory_flag' }
    ]},
    { id:'relic_crosscut_lesson', title:'交刃演练', desc:'两名老战士用木刀演示交刃切入，要求队伍在换步时不丢架势。', choices:[
      { label:'学交刃连斩', desc:'消耗军功，学会斜向变招。', tag:'变招', cost:{merit:58}, techniqueId:'crosscut' },
      { label:'读懂回锋刀谱', desc:'消耗军功，取得回锋刀谱。', tag:'信物', cost:{merit:46}, relicId:'blade_manual' }
    ]}
  );

    const state = {
    seed: 0, rng: Math.random, sound: true, volume: 1, musicVolume: .9, sfxVolume: 1.18, startupWindowMode: 'maximized', startFullscreen: false, performanceMode: false, resolutionMode: 'auto', gamepadLayout: 'auto', uiScale: 1.2, screen: 'title',
    squadId: null, player: null, difficulty: 'march', runMode: 'roguelike', singlePace: 'normal', act: 0, actStep: 0, actBoss: null, singleMap: null, chapter: 0, battle: 0, battleNumber: 0,
    routeOptions: [], squadOptions: [], currentRoute: null, combat: null, pendingRewards: [], currentEvent: null, usedEvents: [], eventContinue: null, shopItems: [], shopReturn: null, shopSource: null, shopResumeAction: null, lastRandomShopAt: -99,
    historyContinue: null, boss: false, finished: false, training: null, testMode: false, testModeOpen: false, testRestoreInProgress: false, acquisitionOpen: false, npcPanelOpen: false, pauseOpen: false, pauseStartedAt: 0, keyBindings: { ...DEFAULT_KEY_BINDINGS }, gamepadBindings: {}, bindingCapture: null, runElapsedMs: 0, runActiveSince: 0, runArchived: false, shopResumeAction: null, saveManagerOpen: false,
    stats: { victories: 0, damage: 0, upgrades: 0, parries: 0, counters: 0, executions: 0, shopPurchases: 0, seed: 0 }
  };

  const dom = {
    app: $('app'), screens: [...document.querySelectorAll('.screen')],
    metaChapter: $('meta-chapter'), metaSeed: $('meta-seed'), metaMerit: $('meta-merit'), meritHud: $('merit-hud'), relicHud: $('relic-hud'), gameplayAccess: document.querySelector('.gameplay-access'), globalPlayerHud: $('global-player-hud'), globalPlayerHpText: $('global-player-hp-text'), globalPlayerHpBar: $('global-player-hp-bar'), growthToggle: $('growth-toggle'), growthEntryMeta: $('growth-entry-meta'), equipmentToggle: $('equipment-toggle'), equipmentEntryMeta: $('equipment-entry-meta'), relicDetailOverlay: $('relic-detail-overlay'), relicDetailName: $('relic-detail-name'), relicDetailBody: $('relic-detail-body'), relicDetailClose: $('relic-detail-close'), relicDetailDone: $('relic-detail-done'), growthOverlay: $('growth-overlay'), growthClose: $('growth-close'), growthSummary: $('growth-summary'), growthCombos: $('growth-combos'), growthTechniques: $('growth-techniques'), talentTree: $('talent-tree'), talentDetail: $('talent-detail'), talentConfirm: $('talent-confirm'), equipmentOverlay: $('equipment-overlay'), equipmentClose: $('equipment-close'), equipmentSummary: $('equipment-summary'), equipmentSlots: $('equipment-slots'), equipmentInventory: $('equipment-inventory'), equipmentDetail: $('equipment-detail'), equipmentEquip: $('equipment-equip'), equipmentUpgrade: $('equipment-upgrade'), equipmentDone: $('equipment-done'), npcOverlay: $('npc-overlay'), npcClose: $('npc-close'), npcKicker: $('npc-kicker'), npcTitle: $('npc-title'), npcDialogue: $('npc-dialogue'), npcStatus: $('npc-status'), npcOptions: $('npc-options'), bonfireOverlay: $('bonfire-overlay'), bonfireClose: $('bonfire-close'), bonfireList: $('bonfire-list'), bonfireInputHint: $('bonfire-input-hint'), acquisitionOverlay: $('acquisition-overlay'), acquisitionKicker: $('acquisition-kicker'), acquisitionIcon: $('acquisition-icon'), acquisitionTitle: $('acquisition-title'), acquisitionMeta: $('acquisition-meta'), acquisitionDesc: $('acquisition-desc'), acquisitionEffects: $('acquisition-effects'), acquisitionNote: $('acquisition-note'), acquisitionConfirm: $('acquisition-confirm'), buffDetailBtn: $('buff-detail-btn'), buffDetailOverlay: $('buff-detail-overlay'), buffDetailBody: $('buff-detail-body'), routeBossForecast: $('route-boss-forecast'), buffDetailClose: $('buff-detail-close'), buffDetailDone: $('buff-detail-done'), gamepadIndicator: $('gamepad-indicator'),
    manualMenuOverlay: $('manual-menu-overlay'), manualMenuClose: $('manual-menu-close'), manualGuideBtn: $('manual-guide-btn'), manualPracticeBtn: $('manual-practice-btn'), tutorialBtn: $('tutorial-btn'), testModeToggle: $('test-mode-toggle'), testModeOverlay: $('test-mode-overlay'), testModeClose: $('test-mode-close'), testModeStatus: $('test-mode-status'), testStartRun: $('test-start-run'), testSkipBattle: $('test-skip-battle'), testSkipNode: $('test-skip-node'), testGrantResources: $('test-grant-resources'), testSingleMap: $('test-single-map'), testExit: $('test-exit'), testComboButtons: $('test-combo-buttons'), testRelicList: $('test-relic-list'), testEquipmentList: $('test-equipment-list'), testEnemyList: $('test-enemy-list'), saveManagerToggle: $('save-manager-toggle'), saveManagerBtn: $('save-manager-btn'), saveManagerOverlay: $('save-manager-overlay'), pauseToggle: $('pause-toggle'), pauseOverlay: $('pause-overlay'), pauseSummary: $('pause-summary'), pauseHp: $('pause-hp'), pauseProgressLabel: $('pause-progress-label'), pauseResume: $('pause-resume'), pauseSaveExit: $('pause-save-exit'), pauseAbandonRun: $('pause-abandon-run'), saveSlotList: $('save-slot-list'), saveManagerClose: $('save-manager-close'), saveManagerDone: $('save-manager-done'), saveSlotNew: $('save-slot-new'), openSaveFolder: $('open-save-folder'), saveFolderPath: $('save-folder-path'), activeSaveLabel: $('active-save-label'), settingsToggle: $('settings-toggle'), exitGameBtn: $('exit-game-btn'), settingsOverlay: $('settings-overlay'), settingsClose: $('settings-close'), settingsDone: $('settings-done'), soundToggle: $('sound-toggle'), performanceToggle: $('performance-toggle'), fullscreenToggle: $('fullscreen-toggle'), startFullscreenToggle: $('start-fullscreen-toggle'), volumeSlider: $('volume-slider'), volumeValue: $('volume-value'), musicVolumeSlider: $('music-volume-slider'), musicVolumeValue: $('music-volume-value'), sfxVolumeSlider: $('sfx-volume-slider'), sfxVolumeValue: $('sfx-volume-value'), startupWindowSelect: $('startup-window-select'), resolutionSelect: $('resolution-select'), gamepadLayout: $('gamepad-layout'), gamepadStatus: $('gamepad-status'), gamepadRefresh: $('gamepad-refresh'), settingsGamepadHint: $('settings-gamepad-hint'), settingsSelectPopover: $('settings-select-popover'), bindingList: $('key-binding-list'), bindingReset: $('binding-reset'), quickItemHud: $('quick-item-hud'), quickItemKey: $('quick-item-key'), quickItemName: $('quick-item-name'), quickItemCount: $('quick-item-count'), gamepadControlStrip: $('gamepad-control-strip'), restartBtn: $('restart-btn'),
    modeCards: $('mode-cards'), difficultyOptions: $('difficulty-options'), difficultyBack: $('difficulty-back'), singleMapBoard: $('single-map-board'), singleMapCanvas: $('single-map-canvas'), singleMapControlsHint: $('single-map-controls-hint'), singleMapTitle: $('single-map-title'), singleMapEyebrow: $('single-map-eyebrow'), singleMapRegionCount: $('single-map-region-count'), singleMapChartCount: $('single-map-chart-count'), singleMapLayerName: $('single-map-layer-name'), singleMapActionHint: $('single-map-action-hint'), singleMapTaskPanel: $('single-map-task-panel'), singleMapTaskCount: $('single-map-task-count'), singleMapTaskList: $('single-map-task-list'), singleMapCollectCount: $('single-map-collect-count'), singleMapProgressCount: $('single-map-progress-count'), singleMapRoomRegion: $('single-map-room-region'), singleMapRoomName: $('single-map-room-name'), singleMapRoomDesc: $('single-map-room-desc'), seedInput: $('seed-input'), startBtn: $('start-btn'), continueRunBtn: $('continue-run-btn'), runHistoryBtn: $('run-history-btn'), runHistoryTitle: $('run-history-title'), runHistoryOverlay: $('run-history-overlay'), runHistoryList: $('run-history-list'), runHistoryClose: $('run-history-close'), runHistoryDone: $('run-history-done'), enemyCodexBtn: $('enemy-codex-btn'), enemyCodexOverlay: $('enemy-codex-overlay'), enemyCodexTitle: $('enemy-codex-title'), enemyCodexGrid: $('enemy-codex-grid'), enemyCodexProgress: $('enemy-codex-progress'), enemyCodexLead: $('enemy-codex-lead'), enemyCodexLeadText: $('enemy-codex-lead-text'), codexCategoryRow: $('codex-category-row'), codexDetail: $('codex-detail'), enemyCodexClose: $('enemy-codex-close'), enemyCodexDone: $('enemy-codex-done'), tutorialOverlay: $('tutorial-overlay'), tutorialClose: $('tutorial-close'), tutorialPrev: $('tutorial-prev'), tutorialNext: $('tutorial-next'), tutorialSkip: $('tutorial-skip'), tutorialSlides: [...document.querySelectorAll('[data-tutorial-slide]')], tutorialDots: [...document.querySelectorAll('#tutorial-dots i')],
    squadCards: $('squad-cards'),
    routeEyebrow: $('route-eyebrow'), routeTitle: $('route-title'), routeDesc: $('route-desc'),
    routeMap: $('route-map'), routeMapProgress: $('route-map-progress'), routeCards: $('route-cards'), routeMerit: $('route-merit'), routeShopHint: $('route-shop-hint'),
    partyName: $('party-name'), partyPassive: $('party-passive'), playerHpText: $('player-hp-text'),
    playerHpBar: $('player-hp-bar'), playerPostureText: $('player-posture-text'), playerPostureBar: $('player-posture-bar'), playerAtk: $('player-atk'), playerDef: $('player-def'),
    playerMorale: $('player-morale'), playerSupply: $('player-supply'), playerMerit: $('player-merit'), playerLevel: $('player-level'),
    playerXpText: $('player-xp-text'), playerXpBar: $('player-xp-bar'), buffList: $('buff-list'),
    battleChapter: $('battle-chapter'), battleTitle: $('battle-title'), turnCount: $('turn-count'),
    enemyCards: $('enemy-cards'), intentLine: $('intent-line'), combatLog: $('combat-log'),
    bossWarning: $('boss-warning'), eliteHud: $('elite-health-hud'), eliteHudType: $('elite-hud-type'), eliteHudName: $('elite-hud-name'), eliteHudSegments: $('elite-hud-segments'), eliteHudFill: $('elite-hud-fill'), eliteHudPostureFill: $('elite-hud-posture-fill'), hudHpBar: $('hud-hp-bar'), hudPostureBar: $('hud-posture-bar'), hudPostureRow: $('hud-posture-row'), hudPostureLabel: $('hud-posture-label'), playerStateWarning: $('player-state-warning'), playerStateTitle: $('player-state-title'), playerStateDetail: $('player-state-detail'), parryOverlay: $('parry-overlay'), parryKicker: $('parry-kicker'), parryTitle: $('parry-title'), parryHint: $('parry-hint'), parryResult: $('parry-result'), parryButton: $('parry-button'), dodgeButton: $('dodge-button'), controlBar: $('control-bar'), chargeMeter: $('charge-meter'), controlHint: $('control-hint'), ammoText: $('ammo-count'), gourdText: $('gourd-count'), dodgeState: $('dodge-state'), comboReadout: $('combo-readout'), comboStageLabel: $('combo-stage-label'), comboStageCount: $('combo-stage-count'),
    selectionFooter: $('selection-footer'), selectionHint: $('selection-hint'), selectionConfirm: $('selection-confirm'), choiceDetailOverlay: $('choice-detail-overlay'), choiceDetailKicker: $('choice-detail-kicker'), choiceDetailTitle: $('choice-detail-title'), choiceDetailBody: $('choice-detail-body'), choiceDetailHighlight: $('choice-detail-highlight'), choiceDetailEffects: $('choice-detail-effects'), choiceDetailNotes: $('choice-detail-notes'), rewardCards: $('reward-cards'), rewardSummary: $('reward-summary'), shopEyebrow: $('shop-eyebrow'), shopTitle: $('shop-title'), shopDesc: $('shop-desc'), shopMerit: $('shop-merit'), shopItems: $('shop-items'), shopContinue: $('shop-continue'), eventScreen: $('screen-event'), eventTitle: $('event-title'), eventDesc: $('event-desc'), eventContext: $('event-context'), eventCards: $('event-cards'), eventSceneCredit: $('event-scene-credit'), eventDetailOverlay: $('event-detail-overlay'), eventDetailKicker: $('event-detail-kicker'), eventDetailTitle: $('event-detail-title'), eventDetailHistory: $('event-detail-history'), eventDetailOutcome: $('event-detail-outcome'), eventDetailImpact: $('event-detail-impact'), eventDetailEffects: $('event-detail-effects'), eventDetailMechanics: $('event-detail-mechanics'),
    historyTitle: $('history-title'), historyDate: $('history-date'), historyPlace: $('history-place'),
    historySummary: $('history-summary'), historySignificance: $('history-significance'),
    historySources: $('history-sources'), historyContinue: $('history-continue'),
    bossStart: $('boss-start'), endingEyebrow: $('ending-eyebrow'), endingTitle: $('ending-title'),
    endingCopy: $('ending-copy'), endingStats: $('ending-stats'), endingMark: $('ending-mark'),
    endingScreen: $('screen-ending'), endingRestart: $('ending-restart'), endingSources: $('ending-sources'),
    tutorialPractice: $('tutorial-practice'), trainingGuide: $('training-guide'), trainingStepCount: $('training-step-count'), trainingStepTitle: $('training-step-title'), trainingStepDesc: $('training-step-desc'), trainingSelect: $('training-select'), trainingExit: $('training-exit'), trainingQuickSkip: $('training-quick-skip'), trainingCue: $('training-cue'), trainingCueKey: $('training-cue-key'), trainingCueTitle: $('training-cue-title'), trainingCueText: $('training-cue-text'), trainingMenuOverlay: $('training-menu-overlay'), trainingMenuClose: $('training-menu-close'), trainingMenuSkip: $('training-menu-skip'), trainingStartFull: $('training-start-full'), trainingLessonGrid: $('training-lesson-grid'), trainingBriefOverlay: $('training-brief-overlay'), trainingBriefKicker: $('training-brief-kicker'), trainingBriefTitle: $('training-brief-title'), trainingBriefText: $('training-brief-text'), trainingBriefKey: $('training-brief-key'), trainingBriefSecondary: $('training-brief-secondary'), trainingBriefSkip: $('training-brief-skip'), trainingBriefConfirm: $('training-brief-confirm'), restartConfirmOverlay: $('restart-confirm-overlay'), restartConfirmCancel: $('restart-confirm-cancel'), restartConfirmButton: $('restart-confirm-button'), endingSourcePanel: $('ending-source-panel'), toast: $('toast'), levelToast: $('level-toast'), achievementToastStack: $('achievement-toast-stack'),
    canvas: $('battle-canvas'), sound: null
  };

  function gameplayPausedByOverlay() {
    return !!(state.pauseOpen || state.acquisitionOpen || state.npcPanelOpen ||
      (dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden')) ||
      (dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden')) ||
      (dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden')));
  }

  function syncGameplayHeader() {
    const visible = !!state.player && !['title', 'mode', 'squad'].includes(state.screen);
    dom.gameplayAccess?.classList.toggle('hidden', !visible);
    dom.globalPlayerHud?.classList.toggle('hidden', !visible);
    dom.growthToggle?.classList.toggle('hidden', !visible);
    dom.equipmentToggle?.classList.toggle('hidden', !visible);
    dom.pauseToggle?.classList.toggle('hidden', !visible || state.testMode || !['route', 'map', 'battle', 'event', 'reward', 'shop', 'history', 'boss'].includes(state.screen));
  }

  // 战斗 HUD 每 120ms 刷一次，但攻击力、等级、士气这些字段几秒才变一次。
  // 无脑 textContent = / style.width = 会让浏览器每次都做样式重算，
  // 先比一次值，只在真的变了才写，能省掉绝大部分 DOM 写入。
  function setText(node, value) {
    if (!node) return;
    const text = value == null ? '' : String(value);
    if (node.textContent !== text) node.textContent = text;
  }

  function setPct(node, pct) {
    if (!node) return;
    const width = `${Math.round(clamp(pct, 0, 100) * 100) / 100}%`;
    if (node.style.width !== width) node.style.width = width;
  }

  function setScreen(name) {
    state.screen = name;
    document.body.dataset.screen = name;
    setMusicMode(desiredMusicModeForScreen(name));
    if (name !== 'battle' && name !== 'map') {
      movementInput.left = movementInput.right = movementInput.up = movementInput.down = movementInput.sprint = false;
      controllerInput.left = controllerInput.right = controllerInput.up = controllerInput.down = controllerInput.sprint = false;
    }
    updateSelectionFooter();
    if (name !== 'route') stopRouteMapAnimation();
    dom.screens.forEach((screen) => screen.classList.toggle('active', screen.id === `screen-${name}`));
    syncGameplayHeader();
    dom.trainingGuide?.classList.toggle('hidden', name !== 'battle' || !state.training?.active);
    dom.trainingQuickSkip?.classList.toggle('hidden', name !== 'battle' || !state.training?.active);
    if (name !== 'battle') dom.trainingCue?.classList.add('hidden');
    if (name !== 'battle') {
      dom.eliteHud?.classList.add('hidden');
      dom.comboReadout?.classList.add('hidden');
      document.body.classList.remove('elite-hud-active');
    }
    if (name !== 'battle' && state.combat) {
      clearPlayerWindow();
      state.combat.holding = false;
      if (dom.chargeMeter) dom.chargeMeter.style.width = '0%';
    }
    if (name === 'title') updateContinueButton();
    if (activeGamepad && name !== 'battle') {
      setTimeout(() => focusGamepadElement(gamepadPrimaryElement()), 30);
    }
  }

  function setMeta() {
    const chapter = state.testMode
      ? '测试台 · 不记录正式行军'
      : state.screen === 'mode'
      ? '等待选择玩法'
      : state.screen === 'squad' && !state.player
        ? (state.runMode === 'single' ? '山河寻路 · 组建队伍' : '三幕远征 · 组建队伍')
      : state.training?.active
      ? '战前演练'
      : state.runMode === 'roguelike' && state.player
        ? (state.boss ? `${ROGUELIKE_ACTS[state.act]?.name || '三幕远征'} · ${state.actBoss?.title || '首领战'}` : `${ROGUELIKE_ACTS[state.act]?.name || '三幕远征'} · 第 ${state.actStep + 1} 段 · 目标 ${state.actBoss?.title || '待定'}`)
        : state.runMode === 'single' && state.player
          ? `山河寻路 · ${SINGLE_REGIONS[state.singleMap?.regionIndex || 0]?.name || '未知区域'}`
          : state.boss ? '终章 · 最后封锁线' : CHAPTERS[state.chapter] ? `${CHAPTERS[state.chapter].act} · ${CHAPTERS[state.chapter].name}` : '等待出发';
    if (dom.metaChapter) dom.metaChapter.textContent = chapter;
    if (dom.metaSeed) dom.metaSeed.textContent = `行军种子 ${state.seed || '—'}`;
    if (dom.metaMerit) dom.metaMerit.textContent = String(Math.round(state.player?.merit || 0));
    dom.meritHud?.classList.toggle('hidden', !state.player);
    dom.restartBtn.classList.toggle('hidden', !state.player || state.screen === 'title' || !!state.training?.active || state.testMode);
    dom.saveManagerToggle?.classList.toggle('hidden', !!state.training?.active || state.testMode);
    dom.relicHud?.classList.toggle('hidden', !state.player || !(state.player.relics || []).length);
    syncGameplayHeader();
    updateActiveSaveLabel();
  }

  let tutorialStep = 0;
  let abandonPromptFromPause = false;
  let continueToPracticalAfterGuide = false;
  const GAME_VERSION = '0.29.11';
  const LEGACY_TUTORIAL_KEY = 'longMarchTutorialSeenV1';
  const LEGACY_PRACTICAL_TUTORIAL_KEY = 'longMarchPracticalTutorialAutoV1';
  const LEGACY_RUN_SAVE_KEY = 'longMarchCurrentRunV2';
  const SAVE_LIBRARY_KEY = 'longMarchSaveLibraryV1';
  const SAVE_LIBRARY_VERSION = 1;
  const MAX_SAVE_SLOTS = 8;
  const SAVE_SLOT_NAMES = ['行军一', '行军二', '行军三', '行军四', '行军五', '行军六', '行军七', '行军八'];
  const RUN_HISTORY_KEY = 'longMarchRunHistoryV2';
  const RUN_HISTORY_SLOT_PREFIX = 'longMarchRunHistorySlotV1:';
  const GAME_SETTINGS_KEY = 'longMarchGameSettingsV1';
  const RUN_SAVE_VERSION = 2;
  const REMOTE_SAVE_ORIGIN = 'http://127.0.0.1:28765';
  let remoteSaveAvailable = false;
  let remoteSaveRoot = '';
  const ENEMY_CODEX_KEY = 'longMarchEnemyCodexV1';
  let discoveredEnemyCodexIds = new Set();
  let activeCodexTab = 'enemies';
  let selectedCodexKey = '';
  let saveSlots = [];
  let activeSaveSlotId = '';

  function remoteStoragePath(key) {
    if (key === SAVE_LIBRARY_KEY) return 'library';
    if (key === GAME_SETTINGS_KEY) return 'settings';
    if (key === RUN_HISTORY_KEY) return 'history';
    if (key.startsWith(RUN_HISTORY_SLOT_PREFIX)) return `history/${encodeURIComponent(key.slice(RUN_HISTORY_SLOT_PREFIX.length))}`;
    const runPrefix = 'longMarchCurrentRunSlotV1:';
    if (key.startsWith(runPrefix)) return `run/${encodeURIComponent(key.slice(runPrefix.length))}`;
    return null;
  }

  function remoteRequest(method, path, value = undefined) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${REMOTE_SAVE_ORIGIN}/api/${path}`, false);
      if (value !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(value === undefined ? null : JSON.stringify(value));
      if (xhr.status === 404) return null;
      if (xhr.status < 200 || xhr.status >= 300) return undefined;
      if (!xhr.responseText) return true;
      return JSON.parse(xhr.responseText);
    } catch (_) { return undefined; }
  }

  function probeRemoteSaveStorage() {
    remoteSaveAvailable = false;
    remoteSaveRoot = '';
    if (location.origin !== REMOTE_SAVE_ORIGIN) return false;
    const ping = remoteRequest('GET', 'ping');
    if (!ping?.ok) return false;
    remoteSaveAvailable = true;
    remoteSaveRoot = ping.saveRoot || '';
    migrateLocalSavesToRemote();
    return true;
  }

  function migrateLocalSavesToRemote() {
    if (!remoteSaveAvailable || localStorage.getItem('longMarchRemoteSaveMigratedV1') === '1') return;
    const remoteLibrary = remoteRequest('GET', 'storage/library');
    if (remoteLibrary === null) {
      try {
        const rawLibrary = localStorage.getItem(SAVE_LIBRARY_KEY);
        if (rawLibrary) remoteRequest('PUT', 'storage/library', JSON.parse(rawLibrary));
        for (let index = 0; index < localStorage.length; index++) {
          const key = localStorage.key(index);
          if (key?.startsWith('longMarchCurrentRunSlotV1:')) {
            const rawRun = localStorage.getItem(key);
            const runPath = remoteStoragePath(key);
            if (rawRun && runPath) remoteRequest('PUT', `storage/${runPath}`, JSON.parse(rawRun));
          }
        }
        const rawHistory = localStorage.getItem(RUN_HISTORY_KEY);
        if (rawHistory) remoteRequest('PUT', 'storage/history', JSON.parse(rawHistory));
      } catch (_) {}
    }
    try { localStorage.setItem('longMarchRemoteSaveMigratedV1', '1'); } catch (_) {}
  }

  function readStorageJson(key, fallback) {
    const remotePath = remoteStoragePath(key);
    if (remoteSaveAvailable && remotePath) {
      const value = remoteRequest('GET', `storage/${remotePath}`);
      if (value !== undefined && value !== null) return value;
      return fallback;
    }
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  }

  function writeStorageJson(key, value) {
    const remotePath = remoteStoragePath(key);
    if (remoteSaveAvailable && remotePath) return remoteRequest('PUT', `storage/${remotePath}`, value) !== undefined;
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }

  function removeStorageJson(key) {
    const remotePath = remoteStoragePath(key);
    if (remoteSaveAvailable && remotePath) return remoteRequest('DELETE', `storage/${remotePath}`) !== undefined;
    try { localStorage.removeItem(key); return true; }
    catch (_) { return false; }
  }

  function loadInputBindings() {
    const saved = readStorageJson(INPUT_BINDINGS_STORAGE_KEY, {});
    state.keyBindings = { ...DEFAULT_KEY_BINDINGS };
    Object.entries(saved?.keyboard || {}).forEach(([action, code]) => { if (typeof code === 'string') state.keyBindings[action] = code; });
    state.gamepadBindings = {};
    Object.entries(saved?.gamepad || {}).forEach(([action, index]) => { if (Number.isInteger(index)) state.gamepadBindings[action] = index; });
  }

  function persistInputBindings() {
    return writeStorageJson(INPUT_BINDINGS_STORAGE_KEY, { keyboard: state.keyBindings, gamepad: state.gamepadBindings });
  }

  function formatKeyCode(code) {
    if (!code) return '未绑定';
    const names = { Space: '空格', ShiftLeft: 'Shift', ShiftRight: 'Shift', Escape: 'Esc', Enter: 'Enter', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Backspace: '退格', Tab: 'Tab' };
    if (names[code]) return names[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return `小键盘 ${code.slice(6)}`;
    return code;
  }

  function gamepadButtonLabel(index, pad = activeGamepad) {
    if (index === -1) return '左摇杆';
    const nintendo = effectiveGamepadLayout(pad || { id: state.gamepadLayout === 'nintendo' ? 'nintendo' : '' }) === 'nintendo';
    const face = nintendo ? { 0: 'B', 1: 'A', 2: 'Y', 3: 'X' } : { 0: 'A', 1: 'B', 2: 'X', 3: 'Y' };
    return face[index] || ({ 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'View', 9: '菜单', 10: 'LS', 11: 'RS', 12: '十字键上', 13: '十字键下', 14: '十字键左', 15: '十字键右', 16: 'Home' })[index] || `按键 ${index}`;
  }

  function defaultGamepadBinding(action, pad = activeGamepad) {
    const nintendo = effectiveGamepadLayout(pad || { id: state.gamepadLayout === 'nintendo' ? 'nintendo' : '' }) === 'nintendo';
    if (nintendo) {
      if (['confirm', 'jump'].includes(action)) return 1;
      if (['cancel', 'dodge', 'sprint'].includes(action)) return 0;
      if (['interact', 'execute'].includes(action)) return 3;
      if (action === 'shoot') return 2;
    }
    return DEFAULT_GAMEPAD_BINDINGS[action];
  }

  function gamepadBinding(action, pad = activeGamepad) {
    const custom = state.gamepadBindings?.[action];
    return Number.isInteger(custom) ? custom : defaultGamepadBinding(action, pad);
  }

  function keyBinding(action) {
    return state.keyBindings?.[action] || DEFAULT_KEY_BINDINGS[action] || '';
  }

  function keyMatches(event, action) {
    const bound = keyBinding(action);
    if (!bound) return false;
    if (bound === 'ShiftLeft') return event.code === 'ShiftLeft' || event.code === 'ShiftRight';
    if (bound === 'ControlLeft') return event.code === 'ControlLeft' || event.code === 'ControlRight';
    if (bound === 'AltLeft') return event.code === 'AltLeft' || event.code === 'AltRight';
    return event.code === bound;
  }

  function inputBindingLabel(action) {
    return activeGamepad ? gamepadButtonLabel(gamepadBinding(action)) : formatKeyCode(keyBinding(action));
  }

  // 方向移动没有单独的绑定项：键盘按四个方向键的字母拼起来（默认 WASD），手柄统一显示左摇杆。
  function moveKeysLabel() {
    if (activeGamepad) return '左摇杆';
    return [...new Set(['moveUp', 'moveLeft', 'moveDown', 'moveRight'].map((action) => formatKeyCode(keyBinding(action))))].join('');
  }

  function renderInputBindings() {
    if (!dom.bindingList) return;
    dom.bindingList.innerHTML = BINDING_ACTIONS.map((action) => {
      const keyActive = state.bindingCapture?.kind === 'key' && state.bindingCapture.action === action.id;
      const padActive = state.bindingCapture?.kind === 'pad' && state.bindingCapture.action === action.id;
      const movement = ['moveUp', 'moveDown', 'moveLeft', 'moveRight'].includes(action.id);
      return `<div class="binding-row"><strong>${action.label}</strong><button type="button" data-bind-kind="key" data-bind-action="${action.id}" class="${keyActive ? 'capturing' : ''}">${keyActive ? '请按键盘…' : formatKeyCode(keyBinding(action.id))}</button><button type="button" data-bind-kind="pad" data-bind-action="${action.id}" class="${padActive ? 'capturing' : ''}" ${movement ? 'disabled title="方向移动使用左摇杆或十字键"' : ''}>${padActive ? '请按手柄…' : movement ? '左摇杆' : gamepadButtonLabel(gamepadBinding(action.id, activeGamepad || { id: '' }))}</button></div>`;
    }).join('');
  }

  function startBindingCapture(kind, action) {
    state.bindingCapture = { kind, action, armedAt: performance.now() + 220 };
    renderInputBindings();
    showToast(kind === 'pad' ? '现在按手柄上的新按键。' : '现在按键盘上的新按键。', 1800);
  }

  function assignInputBinding(kind, action, value) {
    if (kind === 'key' && typeof value === 'string') state.keyBindings[action] = value;
    if (kind === 'pad' && Number.isInteger(value)) state.gamepadBindings[action] = value;
    state.bindingCapture = null;
    persistInputBindings();
    renderInputBindings();
    syncBindingLabels();
    showToast(`已绑定：${BINDING_ACTIONS.find((entry) => entry.id === action)?.label || action}`, 1500);
  }

  function resetInputBindings() {
    state.keyBindings = { ...DEFAULT_KEY_BINDINGS };
    state.gamepadBindings = {};
    state.bindingCapture = null;
    persistInputBindings();
    renderInputBindings();
    syncBindingLabels();
    showToast('按键已恢复默认。');
  }

  function syncBindingLabels() {
    document.querySelectorAll('[data-binding-label]').forEach((node) => {
      node.textContent = inputBindingLabel(node.dataset.bindingLabel);
    });
    if (dom.quickItemKey) dom.quickItemKey.textContent = inputBindingLabel('item');
    if (dom.singleMapActionHint && !activeGamepad) {
      dom.singleMapActionHint.textContent = `靠近敌人、遗迹或可疑角落后按 ${inputBindingLabel('interact')} 互动`;
    }
  }

  function slotRunStorageKey(slotId) {
    return `longMarchCurrentRunSlotV1:${slotId}`;
  }

  function activeSaveSlot() {
    return saveSlots.find((slot) => slot.id === activeSaveSlotId) || null;
  }

  function saveSlotNumber(slotId) {
    return Math.max(1, saveSlots.findIndex((slot) => slot.id === slotId) + 1);
  }

  function nextSaveSlotName() {
    const used = new Set(saveSlots.map((slot) => slot.name));
    return SAVE_SLOT_NAMES.find((name) => !used.has(name)) || `行军${saveSlots.length + 1}`;
  }

  function makeSaveSlot(name) {
    const stamp = Date.now();
    return {
      id: `slot-${stamp}-${Math.floor(Math.random() * 10000)}`,
      name: name || nextSaveSlotName(),
      createdAt: stamp,
      updatedAt: stamp,
      tutorialSeen: false,
      practicalSeen: false
    };
  }

  function persistSaveLibrary() {
    return writeStorageJson(SAVE_LIBRARY_KEY, {
      version: SAVE_LIBRARY_VERSION,
      activeSlotId: activeSaveSlotId,
      slots: saveSlots
    });
  }

  function initializeSaveLibrary() {
    const library = readStorageJson(SAVE_LIBRARY_KEY, null);
    if (library?.version === SAVE_LIBRARY_VERSION && Array.isArray(library.slots) && library.slots.length) {
      saveSlots = library.slots.filter((slot) => slot?.id).map((slot) => ({
        id: slot.id,
        name: slot.name || '行军存档',
        createdAt: Number(slot.createdAt) || Date.now(),
        updatedAt: Number(slot.updatedAt) || Date.now(),
        tutorialSeen: !!slot.tutorialSeen,
        practicalSeen: !!slot.practicalSeen
      }));
      activeSaveSlotId = saveSlots.some((slot) => slot.id === library.activeSlotId) ? library.activeSlotId : saveSlots[0].id;
      persistSaveLibrary();
      updateActiveSaveLabel();
      return;
    }

    let legacyGuideSeen = false;
    let legacyPracticalSeen = false;
    try {
      legacyGuideSeen = localStorage.getItem(LEGACY_TUTORIAL_KEY) === '1';
      legacyPracticalSeen = localStorage.getItem(LEGACY_PRACTICAL_TUTORIAL_KEY) === '1';
    } catch (_) {}
    const firstSlot = makeSaveSlot('行军一');
    firstSlot.tutorialSeen = legacyGuideSeen;
    firstSlot.practicalSeen = legacyPracticalSeen;
    const legacyRun = readStorageJson(LEGACY_RUN_SAVE_KEY, null);
    if (legacyRun?.version === RUN_SAVE_VERSION && legacyRun.player && legacyRun.seed) {
      writeStorageJson(slotRunStorageKey(firstSlot.id), legacyRun);
      firstSlot.updatedAt = Number(legacyRun.savedAt) || Date.now();
    }
    saveSlots = [firstSlot];
    activeSaveSlotId = firstSlot.id;
    persistSaveLibrary();
    updateActiveSaveLabel();
    updateContinueButton();
  }

  function updateActiveSaveLabel() {
    if (!dom.activeSaveLabel) return;
    const slot = activeSaveSlot();
    dom.activeSaveLabel.innerHTML = slot ? `当前存档 · <strong>${slot.name}</strong>` : '当前存档 · 尚未选择';
  }

  function activeGuideSeen() {
    return !!activeSaveSlot()?.tutorialSeen;
  }

  function activePracticalSeen() {
    return !!activeSaveSlot()?.practicalSeen;
  }

  function markActiveTutorialFlag(key, value = true) {
    const slot = activeSaveSlot();
    if (!slot) return;
    slot[key] = !!value;
    slot.updatedAt = Date.now();
    persistSaveLibrary();
  }

  function currentRunElapsedMs(commit = false) {
    const active = state.runActiveSince ? Math.max(0, Date.now() - state.runActiveSince) : 0;
    const elapsed = Math.max(0, (state.runElapsedMs || 0) + active);
    return commit ? (state.runElapsedMs = elapsed, state.runActiveSince = Date.now(), elapsed) : elapsed;
  }

  function formatRunDuration(ms) {
    const total = Math.max(0, Math.floor((ms || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0 ? `${hours}时${String(minutes).padStart(2, '0')}分` : `${minutes}分${String(seconds).padStart(2, '0')}秒`;
  }

  function canPauseGame() {
    return !!state.player && !state.finished && !state.testMode && !state.training?.active && ['route', 'map', 'battle', 'event', 'reward', 'shop', 'history', 'boss'].includes(state.screen);
  }

  function blockingGameplayModalOpen() {
    return !!document.querySelector('#acquisition-overlay:not(.hidden), #npc-overlay:not(.hidden), #relic-detail-overlay:not(.hidden), #growth-overlay:not(.hidden), #equipment-overlay:not(.hidden), #bonfire-overlay:not(.hidden), #save-manager-overlay:not(.hidden), #settings-overlay:not(.hidden), #buff-detail-overlay:not(.hidden), #restart-confirm-overlay:not(.hidden)');
  }

  function pauseLocationLabel() {
    if (state.screen === 'battle') return state.currentRoute?.title || (state.boss ? '首领战' : '交战中');
    if (state.screen === 'map') return state.singleMap && SINGLE_REGIONS[state.singleMap.regionIndex] ? SINGLE_REGIONS[state.singleMap.regionIndex].name : '山河寻路';
    if (state.screen === 'route') return state.runMode === 'single' ? '山河路线' : `第 ${(state.act || 0) + 1} 幕 · 行军路线`;
    if (state.screen === 'event') return state.currentEvent?.title || '行军事件';
    if (state.screen === 'reward') return '战利品选择';
    if (state.screen === 'shop') return '军需站';
    if (state.screen === 'history') return '历史节点';
    if (state.screen === 'boss') return '首领战前';
    return '行军途中';
  }

  function pauseAwareDelay(callback, delay) {
    const handle = { timer: 0, cancelled: false, remaining: Math.max(0, delay), last: performance.now() };
    const tick = () => {
      if (handle.cancelled) return;
      const now = performance.now();
      if (!state.pauseOpen) handle.remaining -= Math.max(0, now - handle.last);
      handle.last = now;
      if (handle.remaining <= 0) { callback(); return; }
      handle.timer = window.setTimeout(tick, Math.min(80, Math.max(16, handle.remaining)));
    };
    handle.timer = window.setTimeout(tick, Math.min(80, Math.max(16, delay)));
    return handle;
  }

  function clearPauseAwareDelay(handle) {
    if (!handle) return;
    handle.cancelled = true;
    window.clearTimeout(handle.timer);
  }

  function settlePauseClock() {
    if (!state.pauseOpen || !state.pauseStartedAt) return 0;
    const pausedMs = Math.max(0, performance.now() - state.pauseStartedAt);
    state.pauseStartedAt = 0;
    if (state.runActiveSince) state.runActiveSince += pausedMs;
    const shift = (target, key) => { if (target && Number.isFinite(target[key])) target[key] += pausedMs; };
    if (parrySession) shift(parrySession, 'start');
    if (shotSession) shift(shotSession, 'start');
    shift(scene.duel, 'start');
    shift(scene.shotAim, 'start');
    if (state.combat) {
      ['holdStart', 'invulnerableUntil', 'counterWindowUntil', 'dodgeCounterUntil', 'counterExpiresAt', 'blockHeldAt'].forEach((key) => shift(state.combat, key));
      shift(state.combat.dodge, 'start');
      (state.combat.enemies || []).forEach((enemy) => ['hitstunUntil', 'recoveryUntil', 'postureBreakUntil', 'armorUntil', 'nextActionAt', 'decisionAt', 'lastActionAt', 'lastBlockAt', 'recentHitAt'].forEach((key) => shift(enemy, key)));
    }
    if (state.player) ['hitstunUntil', 'postureBreakUntil', 'dodgeCooldownUntil', 'lastDodgeAt', 'lastGuardAt'].forEach((key) => shift(state.player, key));
    return pausedMs;
  }

  function updatePauseOverlay() {
    if (!dom.pauseOverlay) return;
    const p = state.player;
    const hp = p ? `${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}` : '—';
    if (dom.pauseHp) dom.pauseHp.textContent = hp;
    if (dom.pauseProgressLabel) dom.pauseProgressLabel.textContent = pauseLocationLabel();
    if (dom.pauseSummary) dom.pauseSummary.textContent = `当前存档“${activeSaveSlot()?.name || '行军存档'}”会保留在这次停步的位置。`;
  }

  function openPauseMenu() {
    if (!canPauseGame() || state.pauseOpen) return;
    state.pauseOpen = true;
    state.pauseStartedAt = performance.now();
    movementInput.left = movementInput.right = movementInput.up = movementInput.down = movementInput.sprint = false;
    controllerInput.left = controllerInput.right = controllerInput.up = controllerInput.down = controllerInput.sprint = false;
    if (state.combat) state.combat.blockHeld = false;
    updatePauseOverlay();
    dom.pauseOverlay?.classList.remove('hidden');
    playSound('click');
    setTimeout(() => dom.pauseResume?.focus({ preventScroll: true }), 0);
  }

  function closePauseMenu() {
    if (!state.pauseOpen) return;
    settlePauseClock();
    state.pauseOpen = false;
    dom.pauseOverlay?.classList.add('hidden');
    playSound('click');
  }

  function saveAndExitToTitle() {
    if (!canPauseGame()) return;
    const phase = state.screen;
    settlePauseClock();
    state.pauseOpen = false;
    dom.pauseOverlay?.classList.add('hidden');
    const ok = saveCurrentRun(phase);
    if (!ok) {
      openPauseMenu();
      showToast('本次进度未能写入存档，请检查浏览器存储权限。');
      return;
    }
    playSound('save');
    resetRun({ preserveSave: true });
    updateContinueButton();
    showToast('行军进度已保存。回到主界面后可点击“继续游戏”。', 2800);
  }

  function captureCombatSnapshot() {
    const combat = state.combat;
    if (!combat?.enemies?.length) return null;
    return {
      ammo: combat.ammo,
      emergencyUses: combat.emergencyUses,
      playerX: combat.playerX,
      playerY: combat.playerY,
      targetIndex: Math.max(0, combat.enemies.findIndex((enemy) => enemy.id === combat.targetId)),
      enemies: combat.enemies.map((enemy) => ({
        hp: enemy.hp,
        maxHp: enemy.maxHp,
        posture: enemy.posture,
        maxPosture: enemy.maxPosture,
        dead: !!enemy.dead,
        phase2: !!enemy.phase2,
        hasActed: !!enemy.hasActed,
        brainDisabled: !!enemy.brainDisabled,
        sequenceIndex: enemy.sequenceIndex || 0,
        status: { ...(enemy.status || {}) },
        x: enemy.x,
        homeX: enemy.homeX
      }))
    };
  }

  function applyCombatSnapshot(combat, snapshot) {
    if (!combat || !snapshot?.enemies?.length) return;
    combat.ammo = Number.isFinite(snapshot.ammo) ? snapshot.ammo : combat.ammo;
    combat.emergencyUses = Number.isFinite(snapshot.emergencyUses) ? snapshot.emergencyUses : combat.emergencyUses;
    combat.playerX = Number.isFinite(snapshot.playerX) ? snapshot.playerX : combat.playerX;
    combat.playerRenderX = combat.playerX;
    combat.playerY = Number.isFinite(snapshot.playerY) ? snapshot.playerY : combat.playerY;
    combat.playerRenderY = combat.playerY;
    snapshot.enemies.forEach((saved, index) => {
      const enemy = combat.enemies[index];
      if (!enemy) return;
      if (Number.isFinite(saved.maxHp)) enemy.maxHp = saved.maxHp;
      if (Number.isFinite(saved.hp)) enemy.hp = clamp(saved.hp, 0, enemy.maxHp);
      if (Number.isFinite(saved.maxPosture)) enemy.maxPosture = saved.maxPosture;
      if (Number.isFinite(saved.posture)) enemy.posture = clamp(saved.posture, 0, enemy.maxPosture);
      enemy.dead = !!saved.dead || enemy.hp <= 0;
      enemy.phase2 = !!saved.phase2;
      enemy.hasActed = !!saved.hasActed;
      enemy.brainDisabled = !!saved.brainDisabled || enemy.dead;
      enemy.sequenceIndex = saved.sequenceIndex || 0;
      enemy.status = { stun: 0, armor: 0, charged: false, broken: false, ...(saved.status || {}) };
      enemy.intent = null;
      enemy.action = enemy.dead ? 'dead' : enemy.status.broken ? 'broken' : 'patrol';
      enemy.hitstunUntil = 0;
      enemy.recoveryUntil = 0;
      if (Number.isFinite(saved.x)) enemy.x = saved.x;
      if (Number.isFinite(saved.homeX)) enemy.homeX = saved.homeX;
      enemy.moveTargetX = enemy.x || enemy.homeX;
    });
    const target = combat.enemies[Math.max(0, Number(snapshot.targetIndex) || 0)];
    combat.targetId = target?.id || combat.enemies[0]?.id || null;
  }

  function saveCurrentRun(phase = state.screen) {
    if (state.testMode || state.testModeOpen || state.testRestoreInProgress || !state.player || state.training?.active || state.finished) return false;
    const elapsed = currentRunElapsedMs(true);
    const payload = {
      version: RUN_SAVE_VERSION, savedAt: Date.now(), phase, screen: state.screen,
      seed: state.seed, rngState: state.rng?.getState?.() ?? null, difficulty: state.difficulty, squadId: state.squadId, runMode: state.runMode, singlePace: state.singlePace, act: state.act, actStep: state.actStep, actBoss: state.actBoss ? JSON.parse(JSON.stringify(state.actBoss)) : null, singleMap: state.singleMap ? JSON.parse(JSON.stringify(state.singleMap)) : null,
      player: JSON.parse(JSON.stringify(state.player)), chapter: state.chapter, battle: state.battle,
      battleNumber: state.battleNumber, boss: state.boss, stats: JSON.parse(JSON.stringify(state.stats || {})),
      usedEvents: [...(state.usedEvents || [])], lastRandomShopAt: state.lastRandomShopAt, elapsedMs: elapsed,
      routeOptionIds: (state.routeOptions || []).map((route) => route.id),
      routeOptions: JSON.parse(JSON.stringify(state.routeOptions || [])),
      currentRoute: state.currentRoute ? JSON.parse(JSON.stringify(state.currentRoute)) : null,
      pendingRewardIds: (state.pendingRewards || []).map((reward) => reward.id),
      currentEventId: state.currentEvent?.id || null,
      shopItems: (state.shopItems || []).map((item) => ({ id: item.id, stock: item.stock ?? 1 })),
      shopSource: state.shopSource || null, shopResumeAction: state.shopResumeAction || null,
      combatSnapshot: phase === 'battle' ? captureCombatSnapshot() : null
    };
    const slot = activeSaveSlot();
    if (!slot) return false;
    const ok = writeStorageJson(slotRunStorageKey(slot.id), payload);
    if (ok) {
      slot.updatedAt = payload.savedAt;
      persistSaveLibrary();
    }
    updateContinueButton();
    return ok;
  }

  function loadCurrentRunSave() {
    const slot = activeSaveSlot();
    if (!slot) return null;
    const save = readStorageJson(slotRunStorageKey(slot.id), null);
    return save?.version === RUN_SAVE_VERSION && save.player && save.seed ? save : null;
  }

  function clearCurrentRunSave() {
    const slot = activeSaveSlot();
    if (!slot) return;
    removeStorageJson(slotRunStorageKey(slot.id));
    slot.updatedAt = Date.now();
    persistSaveLibrary();
    updateContinueButton();
  }

  function updateContinueButton() {
    if (!dom.continueRunBtn) return;
    const save = loadCurrentRunSave();
    dom.continueRunBtn.classList.toggle('hidden', !save);
    if (!save) return;
    const chapter = save.boss ? '首领战' : save.runMode === 'single' ? '山河寻路' : save.runMode === 'roguelike' ? `第 ${(save.act || 0) + 1} 幕` : CHAPTERS[save.chapter] ? CHAPTERS[save.chapter].name : '行军途中';
    dom.continueRunBtn.textContent = `继续游戏 · ${chapter}`;
    dom.continueRunBtn.title = `上次停步：${new Date(save.savedAt).toLocaleString('zh-CN', { hour12: false })}`;
  }

  function saveSlotRun(slot) {
    if (!slot) return null;
    const save = readStorageJson(slotRunStorageKey(slot.id), null);
    return save?.version === RUN_SAVE_VERSION && save.player && save.seed ? save : null;
  }

  function renderSaveManager() {
    if (!dom.saveSlotList) return;
    dom.saveSlotList.innerHTML = saveSlots.map((slot) => {
      const save = saveSlotRun(slot);
      const active = slot.id === activeSaveSlotId;
      const chapter = save ? (save.boss ? '最终封锁线' : CHAPTERS[save.chapter]?.name || '行军途中') : '';
      const savedDifficulty = DIFFICULTY_LEVELS.find((level) => level.id === save?.difficulty);
      const modeLabel = save?.runMode === 'single' ? (save.singlePace === 'quick' ? '山河寻路·快速' : `山河寻路·普通 · ${savedDifficulty?.rank || '普通'}`) : '三幕远征';
      const stageLabel = !save ? '' : save.phase === 'battle' ? `战斗 · ${save.currentRoute?.title || (save.boss ? '首领战' : '交战中')}` : save.phase === 'map' ? `山河图 · ${SINGLE_REGIONS[save.singleMap?.regionIndex || 0]?.name || chapter}` : save.phase === 'reward' ? '战斗所得' : save.phase === 'event' ? '行军事件' : save.phase === 'shop' ? '军需站' : save.phase === 'boss' ? '首领战前' : chapter;
      const savedHp = save?.player ? `兵力 ${Math.max(0, Math.ceil(save.player.hp))}/${save.player.maxHp}` : '';
      const progress = save ? `${modeLabel} · ${stageLabel} · ${savedHp} · ${save.battleNumber || 0} 场战斗` : '尚未开始行军';
      const updated = save?.savedAt ? `上次停步：${new Date(save.savedAt).toLocaleString('zh-CN', { hour12: false })}` : `建立于：${new Date(slot.createdAt).toLocaleString('zh-CN', { hour12: false })}`;
      const guide = slot.tutorialSeen && slot.practicalSeen ? '新手引导已完成' : '新存档 · 进入后先学玩法与演练';
      const action = save ? '继续此档' : '开始此档';
      return `<article class="save-slot-card ${active ? 'active' : ''}" data-save-slot-card="${slot.id}">
        <header><span>存档 ${saveSlotNumber(slot.id)}</span><strong>${slot.name}</strong>${active ? '<em class="save-slot-active">当前</em>' : ''}</header>
        <p>${progress}</p>
        <small>${updated}<br>${guide}</small>
        <div class="save-slot-actions">
          <button class="small-btn" type="button" data-save-slot-play="${slot.id}">${action}</button>
          <button class="small-btn save-slot-delete" type="button" data-save-slot-delete="${slot.id}" ${saveSlots.length <= 1 ? 'disabled' : ''}>${saveSlots.length <= 1 ? '至少留一档' : '删除'}</button>
        </div>
      </article>`;
    }).join('');
    if (dom.saveSlotNew) dom.saveSlotNew.disabled = saveSlots.length >= MAX_SAVE_SLOTS;
    dom.openSaveFolder?.classList.toggle('hidden', !remoteSaveAvailable);
    if (dom.saveFolderPath) { dom.saveFolderPath.classList.toggle('hidden', !remoteSaveAvailable); dom.saveFolderPath.textContent = remoteSaveAvailable ? `存档目录：${remoteSaveRoot}` : ''; }
  }

  function openSaveManager() {
    if (state.testMode) {
      showToast('测试行军不会写入正式存档；请先结束测试。');
      return;
    }
    state.saveManagerOpen = true;
    if (state.player && !state.training?.active && !state.finished) saveCurrentRun(state.screen);
    renderSaveManager();
    dom.saveManagerOverlay?.classList.remove('hidden');
    setTimeout(() => {
      if (activeGamepad && dom.saveSlotNew) focusGamepadElement(dom.saveSlotNew);
      else dom.saveSlotNew?.focus({ preventScroll: true });
    }, 0);
  }

  function closeSaveManager() {
    state.saveManagerOpen = false;
    dom.saveManagerOverlay?.classList.add('hidden');
    setTimeout(() => {
      const target = state.screen === 'title' ? dom.saveManagerBtn || dom.saveManagerToggle : dom.saveManagerToggle;
      if (activeGamepad && target) focusGamepadElement(target);
      else target?.focus({ preventScroll: true });
    }, 0);
  }

  function beginActiveSlotOnboarding() {
    const slot = activeSaveSlot();
    if (!slot) return false;
    if (saveSlotRun(slot)) {
      updateContinueButton();
      return false;
    }
    if (!slot.tutorialSeen) {
      continueToPracticalAfterGuide = !slot.practicalSeen;
      openTutorial();
      return true;
    }
    if (!slot.practicalSeen) {
      startPracticalTutorial(0, false);
      return true;
    }
    return false;
  }

  function switchToSaveSlot(slotId) {
    const slot = saveSlots.find((candidate) => candidate.id === slotId);
    if (!slot) return;
    if (slotId === activeSaveSlotId) {
      closeSaveManager();
      if (state.screen === 'title' && saveSlotRun(slot)) continueCurrentRun();
      return;
    }
    if (state.player && !state.training?.active && !state.finished) saveCurrentRun(state.screen);
    activeSaveSlotId = slotId;
    slot.updatedAt = Date.now();
    persistSaveLibrary();
    resetRun({ preserveSave: true });
    updateActiveSaveLabel();
    updateContinueButton();
    closeSaveManager();
    const startedOnboarding = beginActiveSlotOnboarding();
    if (!startedOnboarding && saveSlotRun(slot)) continueCurrentRun();
  }

  function createNewSaveSlot() {
    if (saveSlots.length >= MAX_SAVE_SLOTS) {
      showToast('存档夹已经满了，请先删除一份旧存档。');
      return;
    }
    if (state.player && !state.training?.active && !state.finished) saveCurrentRun(state.screen);
    const slot = makeSaveSlot();
    saveSlots.push(slot);
    activeSaveSlotId = slot.id;
    persistSaveLibrary();
    resetRun({ preserveSave: true });
    updateActiveSaveLabel();
    updateContinueButton();
    closeSaveManager();
    renderSaveManager();
    beginActiveSlotOnboarding();
  }

  function deleteSaveSlot(slotId) {
    if (saveSlots.length <= 1) {
      showToast('至少要留下一份存档。');
      return;
    }
    const index = saveSlots.findIndex((slot) => slot.id === slotId);
    if (index < 0) return;
    removeSaveSlotStorage(slotId);
    const wasActive = slotId === activeSaveSlotId;
    saveSlots.splice(index, 1);
    if (wasActive) {
      activeSaveSlotId = saveSlots[Math.min(index, saveSlots.length - 1)].id;
      resetRun({ preserveSave: true });
      updateActiveSaveLabel();
      updateContinueButton();
    }
    persistSaveLibrary();
    renderSaveManager();
  }

  function runHistoryStorageKey(slotId = activeSaveSlotId) {
    return `${RUN_HISTORY_SLOT_PREFIX}${slotId}`;
  }

  function removeSaveSlotStorage(slotId) {
    if (!slotId) return false;
    if (remoteSaveAvailable) return remoteRequest('DELETE', `storage/slot/${encodeURIComponent(slotId)}`) !== undefined;
    try {
      localStorage.removeItem(slotRunStorageKey(slotId));
      localStorage.removeItem(runHistoryStorageKey(slotId));
      return true;
    } catch (_) { return false; }
  }

  function migrateLegacyRunHistoryToSlots() {
    const legacy = readStorageJson(RUN_HISTORY_KEY, []);
    if (!Array.isArray(legacy) || !legacy.length) return;
    const knownSlots = new Set(saveSlots.map((slot) => slot.id));
    const grouped = new Map();
    legacy.forEach((record) => {
      const slotId = record?.slotId && knownSlots.has(record.slotId) ? record.slotId : activeSaveSlotId;
      if (!slotId) return;
      if (!grouped.has(slotId)) grouped.set(slotId, []);
      grouped.get(slotId).push(record);
    });
    grouped.forEach((records, slotId) => {
      const key = runHistoryStorageKey(slotId);
      const existing = readStorageJson(key, []);
      const merged = [...records, ...(Array.isArray(existing) ? existing : [])];
      const seen = new Set();
      const unique = merged.filter((record) => {
        const id = record?.id || `${record?.date}:${record?.seed}:${record?.runMode}:${record?.slotId}`;
        if (seen.has(id)) return false;
        seen.add(id); return true;
      }).slice(0, 100);
      writeStorageJson(key, unique);
    });
    removeStorageJson(RUN_HISTORY_KEY);
  }

  function runHistoryRecords() {
    if (!activeSaveSlotId) return [];
    const records = readStorageJson(runHistoryStorageKey(), []);
    return Array.isArray(records) ? records : [];
  }

  function archiveRun(victory) {
    if (state.testMode || state.testModeOpen || !state.player || state.runArchived) return;
    const elapsedMs = currentRunElapsedMs(true);
    const squad = SQUADS[state.squadId] || { name: state.player.name || '红军队伍' };
    const upgradeNames = (state.player.upgrades || []).map((id) => UPGRADES.find((item) => item.id === id)?.name || id);
    const activeSlot = activeSaveSlot();
    const record = {
      id: `run-${Date.now()}`, date: new Date().toISOString(), victory: !!victory, seed: state.seed,
      gameVersion: GAME_VERSION, slotId: activeSlot?.id || '', slotName: activeSlot?.name || '行军存档', difficulty: state.difficulty, runMode: state.runMode, singlePace: state.singlePace,
      squadId: state.squadId, squadName: squad.name, level: state.player.level, chapter: state.chapter,
      battleNumber: state.battleNumber, victories: state.stats.victories || 0, perfectParries: state.stats.parries || 0,
      counters: state.stats.counters || 0, executions: state.stats.executions || 0, deaths: state.stats.deaths || state.player.deaths || 0, upgrades: upgradeNames,
      damage: Math.round(state.stats.damage || 0), shopPurchases: state.stats.shopPurchases || 0, elapsedMs,
      finalPanel: {
        hp: Math.max(0, Math.ceil(state.player.hp)), maxHp: state.player.maxHp, atk: state.player.atk,
        defense: state.player.defense, posture: Math.round(state.player.posture || 0), maxPosture: state.player.maxPosture,
        morale: Math.round(state.player.morale || 0), supplies: Math.round(state.player.supplies || 0), merit: Math.round(state.player.merit || 0)
      }
    };
    const records = runHistoryRecords();
    records.unshift(record);
    writeStorageJson(runHistoryStorageKey(activeSlot?.id), records.slice(0, 100));
    state.runArchived = true;
    clearCurrentRunSave();
  }

  function renderRunHistory() {
    const records = runHistoryRecords();
    const slot = activeSaveSlot();
    if (dom.runHistoryTitle) dom.runHistoryTitle.textContent = slot ? `${slot.name} · 走过的路` : '走过的路';
    if (!dom.runHistoryList) return;
    if (!records.length) {
      dom.runHistoryList.innerHTML = '<div class="history-empty">还没有走完的远征。每一段走过的路，都会留在这里。</div>';
      return;
    }
    dom.runHistoryList.innerHTML = records.map((record, index) => {
      const panel = record.finalPanel || {};
      const upgrades = record.upgrades?.length ? record.upgrades.join(' · ') : '无';
      const recordDifficulty = DIFFICULTY_LEVELS.find((level) => level.id === record.difficulty);
      const modeText = record.runMode === 'single' ? (record.singlePace === 'quick' ? '山河寻路·快速' : `山河寻路·普通 · ${recordDifficulty?.rank || '普通'} ${recordDifficulty?.name || '征途鏖战'}`) : '三幕远征';
      return `<details class="history-entry" ${index === 0 ? 'open' : ''}>
        <summary><span class="history-result ${record.victory ? 'victory' : 'defeat'}">${record.victory ? '胜利会师' : '中途失利'}</span>
        <strong>${record.squadName || '红军队伍'} · Lv.${record.level || 1}</strong>
        <em>${record.slotName || '行军存档'} · ${modeText} · 行军种子 ${record.seed} · 游戏版本 v${record.gameVersion || '更早版本'} · ${new Date(record.date).toLocaleString('zh-CN', { hour12: false })}</em></summary>
        <div class="history-stat-grid"><span>征战 <b>${record.victories || 0}</b></span><span>死亡 <b>${record.deaths ?? 0}</b></span><span>完美格挡 <b>${record.perfectParries || 0}</b></span><span>反击得手 <b>${record.counters || 0}</b></span><span>处决 <b>${record.executions || 0}</b></span><span>军需所得 <b>${record.shopPurchases || 0}</b></span><span>行军用时 <b>${formatRunDuration(record.elapsedMs)}</b></span></div>
        <div class="history-final-panel"><span>抵达时的队伍</span><code>兵力 ${panel.hp}/${panel.maxHp} · 攻势 ${panel.atk} · 防御 ${panel.defense} · 架势 ${panel.posture}/${panel.maxPosture} · 士气 ${panel.morale} · 补给 ${panel.supplies} · 军功 ${panel.merit}</code></div>
        <p class="history-upgrades"><strong>沿途所得</strong>${upgrades}</p>
      </details>`;
    }).join('');
  }

  function openRunHistory() {
    renderRunHistory();
    dom.runHistoryOverlay?.classList.remove('hidden');
    setTimeout(() => dom.runHistoryDone?.focus({ preventScroll: true }), 0);
  }

  function closeRunHistory() {
    dom.runHistoryOverlay?.classList.add('hidden');
    setTimeout(() => dom.runHistoryBtn?.focus({ preventScroll: true }), 0);
  }

  function loadEnemyCodexState() {
    const keys = readStorageJson(ENEMY_CODEX_KEY, []);
    const valid = new Set(ENEMY_CODEX_ENTRIES.map((entry) => entry.key));
    discoveredEnemyCodexIds.clear();
    if (Array.isArray(keys)) keys.filter((key) => valid.has(key)).forEach((key) => discoveredEnemyCodexIds.add(key));
  }

  function saveEnemyCodexState() {
    writeStorageJson(ENEMY_CODEX_KEY, [...discoveredEnemyCodexIds]);
  }

  function enemyCodexKey(enemy) {
    if (!enemy) return '';
    if (enemy.boss) return 'boss:boss';
    return `${enemy.elite ? 'elite' : 'normal'}:${enemy.typeId}`;
  }

  function discoverEnemy(enemy) {
    if (state.testMode || state.testModeOpen) return false;
    const key = enemyCodexKey(enemy);
    if (!key || discoveredEnemyCodexIds.has(key)) return false;
    const entry = ENEMY_CODEX_ENTRIES.find((candidate) => candidate.key === key);
    if (!entry) return false;
    discoveredEnemyCodexIds.add(key);
    saveEnemyCodexState();
    return true;
  }

  const CODEX_TAB_META = {
    enemies: { title: '敌情图鉴', lead: '交过手的敌将会留下姓名、习性与招式；没见过的仍是谜。' },
    equipment: { title: '军备图鉴', lead: '查看全部军备的类别、稀有度与完整效果；本局持有的军备会高亮。' },
    relics: { title: '信物图鉴', lead: '查看信物效果、标签和联动；本局取得的信物会高亮。' },
    techniques: { title: '战法图鉴', lead: '查看全部刀法变招的输入方式、用途与节奏；本局学会的变招会高亮。' }
  };

  function codexEntriesForTab(tab) {
    const p = state.player;
    if (tab === 'equipment') {
      return EQUIPMENT_ITEMS.map((item) => {
        const rarity = EQUIPMENT_RARITIES[item.rarity] || EQUIPMENT_RARITIES.common;
        const owned = (p?.equipmentInventory || []).some((unit) => unit.itemId === item.id);
        const equipped = (p?.equippedEquipment || []).some((uid) => equipmentUnitById(uid)?.itemId === item.id);
        return {
          key: `equipment:${item.id}`, name: item.name, glyph: item.icon || '备', color: rarity.color,
          eyebrow: `${rarity.name} · ${item.category}`, desc: item.desc, owned, equipped,
          effects: (item.effects || []).map((effect) => `${effect.label} ${effect.value}`)
        };
      });
    }
    if (tab === 'relics') {
      return RELICS.map((relic) => {
        const owned = (p?.relics || []).includes(relic.id);
        const synergies = RELIC_SYNERGIES.filter((synergy) => synergy.relics.includes(relic.id));
        return {
          key: `relic:${relic.id}`, name: relic.name, glyph: relic.icon || '物', color: owned ? '#d8ab57' : '#70533a',
          eyebrow: `${relic.rarity || '信物'} · ${(relic.tags || []).join(' / ') || '行军所得'}`, desc: relic.desc,
          owned, effects: [relic.effect], synergies: synergies.map((synergy) => ({ name: synergy.name, effect: synergy.effect }))
        };
      });
    }
    if (tab === 'techniques') {
      return Object.values(PLAYER_TECHNIQUES).map((technique) => ({
        key: `technique:${technique.id}`, name: technique.name, glyph: technique.short?.slice(0, 1) || '式', color: '#b85a3e',
        eyebrow: technique.input || '刀法变招', desc: technique.desc,
        owned: (p?.techniques || []).includes(technique.id),
        effects: [`${technique.hits > 1 ? `${technique.hits} 段` : '单段'} · 前摇 ${Math.round(technique.windup)} · 收招 ${Math.round(technique.recovery)}`]
      }));
    }
    return ENEMY_CODEX_ENTRIES.map((entry) => ({ ...entry, owned: false, revealed: discoveredEnemyCodexIds.has(entry.key) }));
  }

  function renderCodexDetail(tab, entry) {
    if (!dom.codexDetail) return;
    if (!entry) {
      dom.codexDetail.innerHTML = '<div class="codex-detail-empty"><span>图鉴详情</span><p>选择一个条目查看完整信息。</p></div>';
      return;
    }
    const title = `<div class="codex-detail-head"><span class="codex-detail-glyph" style="--entry-color:${entry.color || '#b98d4b'}">${entry.glyph || '录'}</span><div><small>${entry.eyebrow || entry.rank || '图鉴条目'}</small><h3>${entry.name}</h3></div></div>`;
    if (tab === 'enemies') {
      const moves = (entry.moves || []).map((move) => `<span>${INTENT_LABELS[move] || move}</span>`).join('');
      dom.codexDetail.innerHTML = `${title}<p>${entry.role || ''}</p><dl class="codex-detail-facts"><dt>出没</dt><dd>${entry.habitat || '长征沿线'}</dd><dt>招式</dt><dd><div class="codex-detail-tags">${moves || '<span>常规接战</span>'}</div></dd>${entry.signature ? `<dt>专属绝技</dt><dd>${entry.signature}</dd>` : ''}</dl><p class="codex-detail-note">观察起手动作，留意刀光提示，再选择弹反、闪避或拉开距离。</p>`;
      return;
    }
    const effects = (entry.effects || []).map((effect) => `<li>${effect}</li>`).join('');
    const synergies = (entry.synergies || []).length ? `<div class="codex-detail-synergy"><strong>可触发联动</strong>${entry.synergies.map((synergy) => `<span>${synergy.name} · ${synergy.effect}</span>`).join('')}</div>` : '';
    dom.codexDetail.innerHTML = `${title}<p>${entry.desc || ''}</p><ul class="codex-detail-effects">${effects}</ul>${synergies}<p class="codex-detail-state ${entry.owned ? 'owned' : ''}">${entry.equipped ? '本局已装备' : entry.owned ? '本局已取得' : '本局尚未取得'}</p>`;
  }

  function selectCodexEntry(tab, key, scroll = false) {
    const entries = codexEntriesForTab(tab);
    const entry = entries.find((candidate) => candidate.key === key) || null;
    if (!entry || (tab === 'enemies' && !entry.revealed)) return;
    selectedCodexKey = key;
    dom.enemyCodexGrid?.querySelectorAll('[data-codex-key]').forEach((card) => card.classList.toggle('selected', card.dataset.codexKey === key));
    renderCodexDetail(tab, entry);
    if (scroll) dom.enemyCodexGrid?.querySelector(`[data-codex-key="${key}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  function renderEnemyCodex() {
    if (!dom.enemyCodexGrid) return;
    const tab = CODEX_TAB_META[activeCodexTab] ? activeCodexTab : 'enemies';
    activeCodexTab = tab;
    const meta = CODEX_TAB_META[tab];
    const entries = codexEntriesForTab(tab);
    if (dom.enemyCodexTitle) dom.enemyCodexTitle.textContent = meta.title;
    if (dom.enemyCodexLeadText) dom.enemyCodexLeadText.textContent = meta.lead;
    dom.codexCategoryRow?.querySelectorAll('[data-codex-tab]').forEach((button) => {
      const active = button.dataset.codexTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (dom.enemyCodexProgress) {
      if (tab === 'enemies') dom.enemyCodexProgress.textContent = `已识 ${entries.filter((entry) => entry.revealed).length} 名 · 共 ${entries.length} 名`;
      else if (tab === 'equipment') dom.enemyCodexProgress.textContent = `共 ${entries.length} 件 · 持有 ${entries.filter((entry) => entry.owned).length} 件`;
      else if (tab === 'relics') dom.enemyCodexProgress.textContent = `共 ${entries.length} 件 · 持有 ${entries.filter((entry) => entry.owned).length} 件`;
      else dom.enemyCodexProgress.textContent = `共 ${entries.length} 式 · 已学 ${entries.filter((entry) => entry.owned).length} 式`;
    }
    dom.enemyCodexGrid.innerHTML = entries.map((entry, index) => {
      if (tab === 'enemies' && !entry.revealed) {
        return `<article class="enemy-codex-card unknown" aria-label="未知敌人 ${index + 1}"><div class="codex-glyph">?</div><div class="codex-copy"><span>尚未交手</span><h3>未知敌将</h3><p>交过手，才会留下姓名。</p></div><div class="codex-redacted"><i></i><i></i><i></i></div></article>`;
      }
      const detailLine = (entry.effects || []).join(' · ');
      const summary = tab === 'enemies' ? `招式：${(entry.moves || []).slice(0, 5).map((move) => INTENT_LABELS[move] || move).join(' · ') || '常规接战'}` : detailLine;
      return `<button class="enemy-codex-card discovered codex-entry-card ${entry.owned ? 'codex-owned' : ''}" type="button" tabindex="0" data-gamepad-focusable="true" data-codex-key="${entry.key}" style="--enemy-codex-color:${entry.color || '#8f5b3b'}" aria-label="${entry.name}">
        <div class="codex-glyph">${entry.glyph || '录'}</div>
        <div class="codex-copy"><span>${entry.eyebrow || `${entry.rank || ''} · ${entry.habitat || ''}`}</span><h3>${entry.name}</h3><p>${entry.role || entry.desc || ''}</p><small>${summary || ''}</small>${entry.signature ? `<small class="codex-signature">绝技：${entry.signature}</small>` : ''}${entry.owned ? '<em class="codex-owned-mark">本局持有</em>' : ''}</div>
      </button>`;
    }).join('');
    const defaultEntry = entries.find((entry) => entry.key === selectedCodexKey && (tab !== 'enemies' || entry.revealed)) || entries.find((entry) => tab !== 'enemies' || entry.revealed);
    selectedCodexKey = defaultEntry?.key || '';
    if (selectedCodexKey) selectCodexEntry(tab, selectedCodexKey); else renderCodexDetail(tab, null);
  }

  function openEnemyCodex() {
    renderEnemyCodex();
    dom.enemyCodexOverlay?.classList.remove('hidden');
    setTimeout(() => {
      const first = dom.codexCategoryRow?.querySelector(`[data-codex-tab="${activeCodexTab}"]`);
      if (activeGamepad && first) focusGamepadElement(first);
      else first?.focus({ preventScroll: true });
    }, 0);
  }

  function closeEnemyCodex() {
    dom.enemyCodexOverlay?.classList.add('hidden');
    setTimeout(() => {
      if (activeGamepad && dom.enemyCodexBtn) focusGamepadElement(dom.enemyCodexBtn);
      else dom.enemyCodexBtn?.focus({ preventScroll: true });
    }, 0);
  }

  function applySavedPlayerState(save) {
    state.seed = save.seed;
    state.rng = mulberry32(save.seed);
    if (Number.isFinite(save.rngState) && state.rng.setState) state.rng.setState(save.rngState);
    state.player = {
      ...save.player, cooldowns: { ...(save.player.cooldowns || {}) }, upgrades: [...(save.player.upgrades || [])], relics: [...(save.player.relics || [])], relicSynergies: [...(save.player.relicSynergies || [])], techniques: [...(save.player.techniques || ['backcut'])], shopCounts: { ...(save.player.shopCounts || {}) },
      relicMapReveal: save.player.relicMapReveal ?? 220, relicSecretSense: save.player.relicSecretSense ?? 95, shopDiscount: save.player.shopDiscount || 0, meritGainBonus: save.player.meritGainBonus || 0, techniqueDamageBonus: save.player.techniqueDamageBonus || 0, techniquePostureBonus: save.player.techniquePostureBonus || 0, dodgeCooldownReduction: save.player.dodgeCooldownReduction || 0, executionMeritBonus: save.player.executionMeritBonus || 0, lowHpDefenseBonus: save.player.lowHpDefenseBonus || 0,
      talents: [...(save.player.talents || [])], talentSpent: save.player.talentSpent || 0, bonusEquipmentSlots: save.player.bonusEquipmentSlots || 0, chestLuck: save.player.chestLuck || 0,
      lives: save.player.lives ?? (save.runMode === 'single' && save.singlePace === 'normal' ? 3 : 1), deaths: save.player.deaths || 0, respawnId: save.player.respawnId || null, materials: { ...(save.player.materials || {}) }, storyClues: [...(save.player.storyClues || [])], achievements: [...(save.player.achievements || [])],
      equipmentInventory: JSON.parse(JSON.stringify(save.player.equipmentInventory || [])).map((unit) => ({ ...unit, level: unit.level || 1 })), equippedEquipment: [...(save.player.equippedEquipment || [])], consumables: { ...(save.player.consumables || {}) }, quickItemId: save.player.quickItemId || 'bandage', keys: { ...(save.player.keys || {}) }, npcQuests: { ...(save.player.npcQuests || {}) }, npcTrades: { ...(save.player.npcTrades || {}) }, npcRumors: { ...(save.player.npcRumors || {}) }
    };
    state.squadId = save.squadId;
    state.runMode = save.runMode || 'roguelike';
    state.singlePace = save.singlePace || 'normal';
    state.difficulty = save.difficulty || (state.runMode === 'single' && state.singlePace === 'normal' ? 'march' : 'quick');
    state.act = save.act || 0;
    state.actStep = save.actStep || 0;
    state.actBoss = save.actBoss ? JSON.parse(JSON.stringify(save.actBoss)) : null;
    state.singleMap = save.singleMap ? JSON.parse(JSON.stringify(save.singleMap)) : null;
    repairSingleMapInteractionKinds(state.singleMap);
    state.chapter = save.chapter || 0;
    state.battle = save.battle || 0;
    state.battleNumber = save.battleNumber || 0;
    state.boss = !!save.boss;
    state.finished = false;
    state.training = null;
    state.runArchived = false;
    state.stats = { victories: 0, damage: 0, upgrades: 0, parries: 0, counters: 0, executions: 0, shopPurchases: 0, seed: save.seed, ...(save.stats || {}) };
    state.usedEvents = [...(save.usedEvents || [])];
    state.lastRandomShopAt = save.lastRandomShopAt ?? -99;
    state.runElapsedMs = save.elapsedMs || 0;
    state.runActiveSince = Date.now();
    state.routeOptions = Array.isArray(save.routeOptions) ? JSON.parse(JSON.stringify(save.routeOptions)) : (save.routeOptionIds || []).map((id) => ROUTE_TYPES.find((route) => route.id === id)).filter(Boolean);
    state.currentRoute = save.currentRoute || null;
    state.pendingRewards = (save.pendingRewardIds || []).map((id) => UPGRADES.find((upgrade) => upgrade.id === id)).filter(Boolean);
    state.currentEvent = save.currentEventId ? EVENTS.find((event) => event.id === save.currentEventId) || null : null;
    state.shopItems = (save.shopItems || []).map((saved) => {
      const item = shopItemById(saved.id);
      return item ? { ...item, stock: saved.stock ?? 1 } : null;
    }).filter(Boolean);
    state.shopSource = save.shopSource || null;
    state.shopResumeAction = save.shopResumeAction || null;
    state.shopReturn = state.shopResumeAction === 'proceed-after-reward' ? proceedAfterReward : () => showRoute();
    syncRelicSynergies(state.player);
    dom.seedInput.value = String(save.seed);
    setMeta();
    return save;
  }

  function continueCurrentRun() {
    const save = loadCurrentRunSave();
    if (!save) { updateContinueButton(); showToast('没有可继续的行军存档。'); return; }
    applySavedPlayerState(save);
    if (save.phase === 'battle' && state.currentRoute) { startBattle(state.currentRoute, !!save.boss, save.combatSnapshot); return; }
    if (save.phase === 'reward' && state.pendingRewards.length) { showRewards(save.pendingRewardIds); return; }
    if (save.phase === 'event' && state.currentEvent) { showChapterEvent(() => showRoute(), save.currentEvent); return; }
    if (save.phase === 'history') {
      if (state.runMode === 'roguelike') {
        const finishedAct = Math.max(0, (state.act || 1) - 1);
        showHistory(ROGUELIKE_ACTS[finishedAct].chapter, () => showRoute());
      } else if (state.runMode === 'single') {
        renderSingleMap();
      } else {
        showHistory(state.chapter, () => finishChapterAndContinue(state.chapter));
      }
      return;
    }
    if (save.phase === 'shop' && state.shopItems.length) { selectedShopIndex = 0; renderShop(); setScreen('shop'); saveCurrentRun('shop'); return; }
    if (save.phase === 'boss') { showBossIntro(); return; }
    showRoute({ preserveOptions: true });
  }

  function renderTutorialStep() {
    dom.tutorialSlides.forEach((slide, index) => slide.classList.toggle('active', index === tutorialStep));
    dom.tutorialDots.forEach((dot, index) => dot.classList.toggle('active', index === tutorialStep));
    dom.tutorialPrev.disabled = tutorialStep === 0;
    dom.tutorialNext.textContent = tutorialStep === dom.tutorialSlides.length - 1 ? '开始行军' : '下一步';
  }

  function openManualMenu() {
    dom.manualMenuOverlay?.classList.remove('hidden');
    setTimeout(() => {
      if (activeGamepad && dom.manualGuideBtn) focusGamepadElement(dom.manualGuideBtn);
      else dom.manualGuideBtn?.focus({ preventScroll: true });
    }, 0);
  }

  function closeManualMenu(restoreFocus = true) {
    dom.manualMenuOverlay?.classList.add('hidden');
    if (!restoreFocus) return;
    setTimeout(() => {
      if (activeGamepad && dom.tutorialBtn) focusGamepadElement(dom.tutorialBtn);
      else dom.tutorialBtn?.focus({ preventScroll: true });
    }, 0);
  }

  function openManualGuide() {
    closeManualMenu(false);
    openTutorial();
  }

  function openManualPractice() {
    closeManualMenu(false);
    openTrainingMenu();
  }

  function openTutorial() {
    dom.manualMenuOverlay?.classList.add('hidden');
    tutorialStep = 0;
    renderTutorialStep();
    dom.tutorialOverlay.classList.remove('hidden');
    setTimeout(() => dom.tutorialNext.focus({ preventScroll: true }), 0);
  }

  function closeTutorial(markSeen = true) {
    dom.tutorialOverlay.classList.add('hidden');
    if (markSeen) {
      markActiveTutorialFlag('tutorialSeen', true);
    }
    const shouldStartPractical = markSeen && continueToPracticalAfterGuide;
    continueToPracticalAfterGuide = false;
    if (shouldStartPractical) {
      setTimeout(() => {
        if (state.screen === 'title' && !state.training?.active) startPracticalTutorial(0, false);
      }, 180);
      return;
    }
    setTimeout(() => dom.startBtn.focus({ preventScroll: true }), 0);
  }

  function gamepadChoiceActionText(selected) {
    if (activeGamepad) return selected ? '当前选择 · 按 Y 查看详情' : '左摇杆 / 十字键切换';
    return selected ? '已选中 · 再次点击查看详情' : '点击选择';
  }

  function refreshGamepadSelectionLabels() {
    if (state.screen === 'squad') updateSquadSelection();
    else if (state.screen === 'route') updateRouteSelection();
    else if (state.screen === 'event') updateEventChoiceSelection();
    else if (state.screen === 'reward') updateRewardSelection();
  }


  const TRAINING_LESSONS = [
    { title: '架势与走位', menu: '看清阵脚，进退有度', text: '白色是兵力，金色是架势。架势耗尽，队伍就会露出大破绽；不停移动会让架势回得更慢，拉开距离或成功反制才能缓一口气。' },
    { title: '格挡与抢招', menu: '看准收招，抢回先手', text: '敌将收招时会横刀格挡。被挡住的刀很难伤到根基，真正砍中身躯才更有效；普通起手可以抢攻打断，亮起金光的绝技不要硬拼。' },
    { title: '完美格挡与守反', menu: '金光落下，架刀震开敌刃', text: '敌刃真正落下、金光闪起时按 F / LB。完美格挡不会让队伍受伤，还会震开敌刃；趁势按左键，可接两段守反。' },
    { title: '闪避与闪避反击', menu: '看准刀锋，侧身再突进', text: 'Space / B 朝当前方向闪开，没有方向便向后撤。闪开后立刻按左键，可追上去接三段反击。' },
    { title: '识破：拉枪踏刃', menu: '枪尖闪光时闪身识破', text: '敌将突刺时，等枪尖闪光后按 Space / B。拉枪、踏刃会重创敌方架势，并让我方架势回落。' },
    { title: '子弹也能防', menu: '横移、闪避或架开枪弹', text: '枪线锁定时先横移。枪响前按 F / LB 可弹开子弹，Space / B 也能闪避；完美弹开会削去敌方架势。' },
    { title: '兵力、架势与处决', menu: '抓住败势，完成处决', text: '敌将只剩最后一口气时会死守不退。贴近按左键处决，或按 R 远程爆头，才能真正击溃这道防线。' },
    { title: '跳跃、战备与节奏', menu: '跃起踩头，空中劈落', text: '按跳跃键跃起，落向敌将头顶可踩断普通起手；在空中按下攻击键会向前下方跳劈。把握好距离，别把跳跃当成无代价闪避。' }
  ];

  const TRAINING_INTROS = {
    0: { key: 'WASD', text: '先看两条横条。白色是兵力，金色是架势。不停移动会让架势回得更慢，别一直后退，也别把架势耗空。' },
    1: { key: '左键', text: '先攻击教习，看清横刀格挡；等他摆出普通攻击起手，再抢先用左键打断。两项各完成 3 次。' },
    2: { key: 'F / LB', text: '先看两次慢速示范：敌刃将落、金光亮起时才会放慢并拉近镜头。随后再按正常速度来三次。' },
    3: { key: 'Space / B', text: '先看两次慢速示范，再按正常速度来三次。刀锋前压时闪开，落地立刻按左键追上去；砍中才算数。' },
    4: { key: 'Space / B', text: '先看两次慢速识破，再按正常速度来三次。枪尖闪光时闪开，拉枪踏刃之后准备下一回。' },
    5: { key: 'F / LB', text: '先看两次慢速示范，再按正常速度来三次。枪响前按 F / LB 弹开子弹，或按 Space / B 闪开。' },
    6: { key: '左键 / R', text: '敌将架势崩溃后，败势才会真正露出来。近身按左键会出腰斩、贯胸或斩首；离得远时按 R 爆头。' },
    7: { key: '跳跃 / 攻击', text: '先靠近教习。跳起后在空中按攻击键跳劈，或落到教习头顶踩断动作。完成三次即可。' }
  };

  let trainingBriefResolver = null;

  function showTrainingBrief({ kicker, title, text, keyText = '', primary = '确认', secondary = '选择科目' }) {
    if (!dom.trainingBriefOverlay) return Promise.resolve('cancel');
    clearTrainingCue();
    if (state.training) state.training.briefing = true;
    dom.trainingBriefKicker.textContent = kicker;
    dom.trainingBriefTitle.textContent = title;
    dom.trainingBriefText.textContent = text;
    dom.trainingBriefKey.textContent = keyText;
    dom.trainingBriefKey.classList.toggle('hidden', !keyText);
    dom.trainingBriefConfirm.textContent = primary;
    dom.trainingBriefSecondary.textContent = secondary;
    dom.trainingBriefSecondary.classList.toggle('hidden', !secondary);
    dom.trainingBriefOverlay.classList.remove('hidden');
    setTimeout(() => dom.trainingBriefConfirm.focus({ preventScroll: true }), 0);
    return new Promise((resolve) => { trainingBriefResolver = resolve; });
  }

  function resolveTrainingBrief(action) {
    const resolve = trainingBriefResolver;
    trainingBriefResolver = null;
    dom.trainingBriefOverlay?.classList.add('hidden');
    if (state.training) state.training.briefing = false;
    if (!resolve) return;
    resolve(action);
    if (action === 'menu') {
      finishPracticalTutorial(false);
      openTrainingMenu();
    } else if (action === 'skip') {
      finishPracticalTutorial('已跳过战前演练。');
    }
  }

  function renderTrainingMenu() {
    if (!dom.trainingLessonGrid) return;
    dom.trainingLessonGrid.innerHTML = TRAINING_LESSONS.map((lesson, index) => `
      <button class="training-lesson-card" type="button" data-training-step="${index}">
        <span>科目 ${String(index + 1).padStart(2, '0')}</span>
        <strong>${lesson.title}</strong>
        <small>${lesson.menu}</small>
      </button>
    `).join('');
  }

  function openTrainingMenu() {
    if (state.training?.active) finishPracticalTutorial(false);
    closeTutorial(true);
    if (!dom.trainingMenuOverlay) return;
    renderTrainingMenu();
    dom.trainingMenuOverlay.classList.remove('hidden');
    setTimeout(() => dom.trainingStartFull?.focus({ preventScroll: true }), 0);
  }

  function closeTrainingMenu() {
    dom.trainingMenuOverlay?.classList.add('hidden');
    setTimeout(() => dom.tutorialBtn?.focus({ preventScroll: true }), 0);
  }

  function skipTrainingMenu() {
    markActiveTutorialFlag('practicalSeen', true);
    closeTrainingMenu();
    showToast('已跳过战前演练，可直接开始行军。');
  }

  function openRestartConfirm(fromPause = false) {
    if (state.testMode) {
      showToast('请从测试台选择“结束测试”。');
      return;
    }
    if (!state.player || state.finished) {
      resetRun();
      return;
    }
    if (state.training?.active) {
      finishPracticalTutorial('已结束战前演练。');
      return;
    }
    abandonPromptFromPause = !!fromPause && state.pauseOpen;
    if (abandonPromptFromPause) dom.pauseOverlay?.classList.add('hidden');
    state.restartPromptOpen = true;
    dom.restartConfirmOverlay?.classList.remove('hidden');
    setTimeout(() => dom.restartConfirmCancel?.focus({ preventScroll: true }), 0);
  }

  function closeRestartConfirm() {
    state.restartPromptOpen = false;
    dom.restartConfirmOverlay?.classList.add('hidden');
    if (abandonPromptFromPause) dom.pauseOverlay?.classList.remove('hidden');
    const returnTarget = abandonPromptFromPause ? dom.pauseAbandonRun : dom.restartBtn;
    abandonPromptFromPause = false;
    setTimeout(() => returnTarget?.focus({ preventScroll: true }), 0);
  }

  function confirmRestartRun() {
    state.restartPromptOpen = false;
    dom.restartConfirmOverlay?.classList.add('hidden');
    if (state.pauseOpen) {
      settlePauseClock();
      state.pauseOpen = false;
      dom.pauseOverlay?.classList.add('hidden');
    }
    abandonPromptFromPause = false;
    archiveRun(false);
    resetRun();
    showToast('本局已放弃，并记入当前存档战史。', 3200);
  }


  function showTrainingCue(key, title, text, duration = 2400) {
    if (!dom.trainingCue) return;
    dom.trainingCueKey.textContent = key;
    dom.trainingCueTitle.textContent = title;
    dom.trainingCueText.textContent = text;
    dom.trainingCue.classList.remove('hidden');
    dom.trainingGuide?.classList.add('training-cue-active');
    clearTimeout(showTrainingCue.timer);
    showTrainingCue.timer = setTimeout(() => {
      dom.trainingCue.classList.add('hidden');
      dom.trainingGuide?.classList.remove('training-cue-active');
    }, duration);
  }

  function clearTrainingCue() {
    clearTimeout(showTrainingCue.timer);
    dom.trainingCue?.classList.add('hidden');
    dom.trainingGuide?.classList.remove('training-cue-active');
  }

  function trainingSuccessCount(step) {
    return state.training?.counts?.[step] || 0;
  }

  function trainingMetricCount(metric) {
    return state.training?.counts?.[metric] || 0;
  }

  function recordTrainingMetric(metric, label, target = 3) {
    const training = state.training;
    if (!training?.active) return;
    const value = trainingMetricCount(metric);
    if (value >= target) return;
    training.counts[metric] = value + 1;
    const next = training.counts[metric];
    renderTrainingStep();
    showTrainingCue('✓', `${label} · 已成功 ${next} 次`, next >= target ? '这项已经练成。' : '时机正好，再来一次。', 1450);
  }

  function recordTrainingSuccess(step) {
    if (!state.training?.active || state.training.step !== step) return;
    if ([2, 3, 4, 5].includes(step) && state.training.phase !== 'normal') return;
    recordTrainingMetric(step, '完成次数');
  }

  async function waitForTrainingMetric(metric, target, timeoutMs, valid) {
    const started = performance.now();
    while (valid() && performance.now() - started < timeoutMs) {
      if (trainingMetricCount(metric) >= target) return true;
      await sleep(90);
    }
    return valid() && trainingMetricCount(metric) >= target;
  }

  async function waitForTrainingSuccess(step, target, timeoutMs, valid) {
    return waitForTrainingMetric(step, target, timeoutMs, valid);
  }

  async function runPracticalTutorialSequence() {
    const training = state.training;
    if (!training?.active) return;
    const token = (training.sequenceToken || 0) + 1;
    training.sequenceToken = token;
    const valid = () => state.training === training && training.active && training.sequenceToken === token && state.screen === 'battle';
    const wait = async (ms) => { await sleep(ms); return valid(); };
    const ask = async (config) => {
      if (!valid()) return 'cancel';
      const result = await showTrainingBrief(config);
      return valid() ? result : 'cancel';
    };
    const submitLesson = async (step) => {
      const lesson = TRAINING_LESSONS[step];
      const result = await ask({
        kicker: training.singleLesson ? '本科完成' : `第 ${step + 1} 课完成`,
        title: lesson.title,
        text: training.singleLesson ? '这项动作已经练成。可以继续选下一项。' : '三次动作都完成了。准备好后进入下一课。',
        keyText: '三次已成',
        primary: training.singleLesson ? '返回选课' : (step === TRAINING_LESSONS.length - 1 ? '完成演练' : '进入下一课'),
        secondary: '选择科目'
      });
      if (result !== 'primary') return false;
      if (training.singleLesson) {
        finishPracticalTutorial(false);
        openTrainingMenu();
        return false;
      }
      return true;
    };

    for (let step = training.startStep || 0; step < TRAINING_LESSONS.length; step++) {
      if (!valid()) return;
      training.step = step;
      training.phase = [2, 3, 4, 5].includes(step) ? 'demo' : 'normal';
      const lesson = TRAINING_LESSONS[step];
      const intro = TRAINING_INTROS[step];
      const enemy = targetEnemy();
      if (!enemy) return;
      resetTrainingDummy(enemy);
      renderTrainingStep();

      const introResult = await ask({
        kicker: `第 ${step + 1} 课 · 战前演练`,
        title: lesson.title,
        text: intro.text,
        keyText: step === 0 ? moveKeysLabel() : intro.key,
        primary: '确认开始',
        secondary: '选择科目'
      });
      if (introResult !== 'primary') return;

      if (step === 0) {
        // 科目 01「架势与走位」。原版这一课没有练习逻辑（单科模式点确认就直接结算退回选课），
        // 补的版本又用"循环固定次数 + 超时也算过"，站着不动也能过，而且只比对 X 轴、手柄也照样提示 WASD。
        // 现在改成：累计实际走过的距离（任意方向都算），必须真走够才结算，不设超时通过。
        const combat = state.combat;
        const startX = combat?.playerX ?? 0;
        const startY = combat?.playerY ?? 0;
        let lastX = startX;
        let lastY = startY;
        let travelled = 0;
        const needDistance = 150;
        const moveHint = () => (activeGamepad ? '摇杆' : moveKeysLabel());
        const moveTutorialText = () => (activeGamepad
          ? '推左摇杆前后左右走动，任何方向都算。注意上方两条横杠：白色是兵力，金色是架势。'
          : `用 ${moveHint()} 前后左右走动，任何方向都算。注意上方两条横杠：白色是兵力，金色是架势。`);
        showTrainingCue(moveHint(), '先走两步', moveTutorialText(), 9000);
        let nextRemindAt = performance.now() + 9000;
        while (valid() && travelled < needDistance) {
          if (!await wait(60)) return;
          const x = combat?.playerX ?? lastX;
          const y = combat?.playerY ?? lastY;
          travelled += Math.hypot(x - lastX, y - lastY);
          lastX = x;
          lastY = y;
          if (travelled < needDistance && performance.now() >= nextRemindAt) {
            nextRemindAt = performance.now() + 9000;
            const percent = Math.min(99, Math.round(travelled / needDistance * 100));
            showTrainingCue(moveHint(), `走位 · 已走 ${percent}%`, moveTutorialText(), 6000);
          }
        }
        if (!valid()) return;
        showTrainingCue('✓', '走位完成', '走位自如了，架势会随时间自己回满。', 2200);
        if (!await wait(1800)) return;
        if (training.singleLesson) {
          finishPracticalTutorial(false);
          openTrainingMenu();
          return;
        }
        continue;
      }

      if (step === 1) {
        while (valid() && trainingMetricCount('guard') < 3) {
          resetTrainingDummy(enemy);
          const count = trainingMetricCount('guard');
          showTrainingCue('左键', `横刀格挡 ${count} / 3`, '靠近后按左键。教习会在收招空档横刀格挡，被格挡只削去极少量生命。', 5600);
          enemy.action = 'patrol';
          enemy.intent = { type: 'move', label: '收招空档 · 横刀格挡', value: 0 };
          enemy.recoveryUntil = performance.now() + 5600;
          enemy.tutorialForceGuard = true;
          setActionState();
          const learned = await waitForTrainingMetric('guard', count + 1, 5600, valid);
          if (!valid()) return;
          if (!learned) showTrainingCue('左键', '再来一次', '靠近教习，按左键攻击，看他如何横刀格挡。', 1900);
          if (!await wait(learned ? 420 : 260)) return;
        }
        const bridge = await ask({
          kicker: '格挡练习完成',
          title: '现在练抢招',
          text: '教习摆出普通攻击起手时，立刻按左键。命中躯干会把这一招打断。高威胁绝招带金光和霸体，不能这样硬抢。',
          keyText: '左键',
          primary: '开始抢招',
          secondary: '选择科目'
        });
        if (bridge !== 'primary') return;
        while (valid() && trainingMetricCount('interrupt') < 3) {
          resetTrainingDummy(enemy);
          const count = trainingMetricCount('interrupt');
          enemy.action = 'attack';
          enemy.intent = { type: 'attack', label: '普通起手 · 左键抢招', value: Math.round(intentDamage(enemy) * .5) };
          enemy.hitstunUntil = 0;
          enemy.tutorialForceGuard = false;
          showTrainingCue('左键', `抢招打断 ${count} / 3`, '教习摆出普通起手。现在按左键，在刀落下前打断他。', 4200);
          const learned = await waitForTrainingMetric('interrupt', count + 1, 4200, valid);
          if (!valid()) return;
          if (!learned) showTrainingCue('左键', '抢招未中', '看到普通起手就按左键；带金光的高威胁绝招要先用格挡或闪避。', 2100);
          if (!await wait(learned ? 420 : 260)) return;
        }
        if (!await submitLesson(1)) return;
        continue;
      }

      if (step === 6) {
        enemy.healthSegments = 4;
        enemy.maxHp = 1600;
        while (valid() && trainingSuccessCount(6) < 3) {
          resetTrainingDummy(enemy);
          const count = trainingSuccessCount(6);
          const segmentSize = enemy.maxHp / enemy.healthSegments;
          enemy.hp = (enemy.healthSegments - 1 - count) * segmentSize + 1;
          enemy.status.broken = true;
          enemy.posture = enemy.maxPosture;
          enemy.postureBreakUntil = performance.now() + 16000;
          enemy.action = 'collapse';
          enemy.intent = { type: 'broken', label: '可处决 · 远程 R / 近战左键', value: 0 };
          renderEnemyCards();
          showTrainingCue(`${inputBindingLabel('attack')} / ${inputBindingLabel('shoot')}`, `第 ${count + 1} 次处决`, `靠近后按 ${inputBindingLabel('attack')} 处决，或保持距离按 ${inputBindingLabel('shoot')} 爆头。每次处决只能击溃一道防线。`, 6500);
          setActionState();
          const learned = await waitForTrainingSuccess(6, count + 1, 6500, valid);
          if (!valid()) return;
          if (!learned) showTrainingCue('处决', '再来一次', '近身左键，或按 R 远程爆头。处决动作结束才算完成。', 2000);
          if (!await wait(1450)) return;
        }
        if (!await submitLesson(6)) return;
        continue;
      }

      if (step === 7) {
        training.phase = 'normal';
        resetTrainingDummy(enemy);
        showTrainingCue(inputBindingLabel('jump'), '跳跃 · 踩头或跳劈', '靠近教习后跳起。落向头顶可踩断动作；空中按攻击键会向前下方跳劈。三次命中即可。', 6500);
        while (valid() && trainingSuccessCount(7) < 3) {
          const count = trainingSuccessCount(7);
          const learned = await waitForTrainingSuccess(7, count + 1, 16000, valid);
          if (!valid()) return;
          if (!learned) showTrainingCue(inputBindingLabel('jump'), '再来一次', '先靠近教习，再跳起。踩头和空中跳劈都算成功。', 1800);
          if (!await wait(420)) return;
        }
        if (!await submitLesson(7)) return;
        if (training.singleLesson) return;
        finishPracticalTutorial('演练结束。整装出发。');
        return;
      }

      const demos = {
        2: { type: 'attack', key: inputBindingLabel('guard'), title: '完美格挡', text: `金光亮起后按 ${inputBindingLabel('guard')}。完美格挡后立刻按 ${inputBindingLabel('attack')} 接守反。` },
        3: { type: 'quick', key: inputBindingLabel('dodge'), title: '闪避后反击', text: `刀锋前压时按 ${inputBindingLabel('dodge')} 闪避；落地立刻按 ${inputBindingLabel('attack')}，反击命中才计数。` },
        4: { type: 'thrust', key: inputBindingLabel('dodge'), title: '识破并踏刃', text: `枪尖闪光后按 ${inputBindingLabel('dodge')} 识破。完整动作结束后再准备下一次。` },
        5: { type: 'shot', key: inputBindingLabel('guard'), title: '子弹防御', text: `枪口火光一闪时按 ${inputBindingLabel('guard')} 弹开，或按 ${inputBindingLabel('dodge')} 闪开。` }
      };
      const demo = demos[step];
      if (!demo) continue;

      training.phase = 'demo';
      for (let demoIndex = 0; demoIndex < 2; demoIndex++) {
        if (!valid()) return;
        showTrainingCue(demo.key, `${demo.title} · 第 ${demoIndex + 1} 次慢速示范`, `起手仍按正常速度进行，等金光亮起才会慢下来。${demo.text}`, 5600);
        enemy.intent = { type: demo.type, training: true, trainingSlow: true, label: `${demo.title} · 慢速示范 ${demoIndex + 1} / 2`, value: Math.round(intentDamage(enemy) * .55) };
        enemy.hasActed = false;
        await performRealtimeEnemyAction(state.combat, enemy, state.combat.enemies.indexOf(enemy));
        enemy.brainDisabled = true;
        if (!await wait(600)) return;
      }

      const normalReady = await ask({
        kicker: '慢速示范结束',
        title: `${demo.title} · 正常速度`,
        text: `先跟着看两次，不计成绩。接下来按正常速度来三次；失手就留在这项再练一次。`,
        keyText: demo.key,
        primary: '开始正常速度',
        secondary: '选择科目'
      });
      if (normalReady !== 'primary') return;

      training.phase = 'normal';
      while (valid() && trainingSuccessCount(step) < 3) {
        const count = trainingSuccessCount(step);
        showTrainingCue(demo.key, `${demo.title} · 正常速度 ${count + 1} / 3`, `这次不慢放。${demo.text}`, 5600);
        enemy.intent = { type: demo.type, training: true, trainingSlow: false, label: `${demo.title} · 正常速度 ${count + 1} / 3`, value: Math.round(intentDamage(enemy) * .55) };
        enemy.hasActed = false;
        await performRealtimeEnemyAction(state.combat, enemy, state.combat.enemies.indexOf(enemy));
        enemy.brainDisabled = true;
        const learned = await waitForTrainingSuccess(step, count + 1, step === 3 ? 2200 : 1500, valid);
        if (!valid()) return;
        if (!learned) showTrainingCue(demo.key, '再来一次', '看准武器真正落下或枪口闪光的瞬间，再输入。', 1900);
        if (!await wait(learned ? 520 : 260)) return;
      }
      if (!await submitLesson(step)) return;
    }
  }

  function renderTrainingStep() {
    const training = state.training;
    if (!training?.active) return;
    const lesson = TRAINING_LESSONS[training.step];
    const count = training.step === 1
      ? ` · 挡刀 ${trainingMetricCount('guard')} 次 · 抢招 ${trainingMetricCount('interrupt')} 次 · 各需三次`
      : [2,3,4,5].includes(training.step) && training.phase === 'demo'
        ? ' · 先看示范'
        : [2,3,4,5,6,7].includes(training.step) ? ` · 已成功 ${trainingSuccessCount(training.step)} 次 · 需三次` : '';
    dom.trainingStepCount.textContent = `战前演练 · 第 ${training.step + 1} 课 / 共 ${TRAINING_LESSONS.length} 课${count}`;
    dom.trainingStepTitle.textContent = lesson.title;
    dom.trainingStepDesc.textContent = lesson.text;
    dom.trainingGuide.classList.remove('hidden');
  }

  function resetTrainingDummy(enemy) {
    if (!enemy) return;
    enemy.brainDisabled = true;
    enemy.status.broken = false;
    enemy.status.stun = 0;
    enemy.hitstunUntil = 0;
    enemy.posture = 0;
    enemy.status.armor = 0;
    enemy.action = 'patrol';
    enemy.intent = { type: 'move', label: '稳住架势，等待口令', value: 0 };
    enemy.moveTargetX = state.combat.playerX + 225;
    enemy.x = Math.min(enemy.x, enemy.moveTargetX + 40);
    state.player.hp = state.player.maxHp;
    state.player.posture = 0;
    state.player.postureBroken = false;
    state.player.hitstunUntil = 0;
    state.combat.blockHeld = false;
    state.combat.busy = false;
    state.combat.phase = 'player';
    renderEnemyCards();
    updateMetaBars();
    setActionState();
  }

  function startPracticalTutorial(startStep = 0, singleLesson = false) {
    closeTrainingMenu();
    closeTutorial(true);
    const safeStep = clamp(Number(startStep) || 0, 0, TRAINING_LESSONS.length - 1);
    state.player = createPlayer('scout');
    state.player.maxHp = 300;
    state.player.hp = 300;
    state.player.maxPosture = 120;
    state.player.posture = 0;
    state.squadId = 'scout';
    state.chapter = 0;
    state.battle = 0;
    state.battleNumber = 0;
    state.boss = false;
    state.finished = false;
    state.training = {
      active: true,
      step: safeStep,
      startStep: safeStep,
      singleLesson,
      briefing: false,
      phase: 'normal',
      counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, guard: 0, interrupt: 0 }
    };
    const route = { id: 'training', title: '战前演武场', count: 1, xp: 0, supply: 0, heal: 0 };
    startBattle(route, false);
    const enemy = targetEnemy();
    if (enemy) {
      enemy.name = '演武教习';
      enemy.brainDisabled = true;
      enemy.elite = true;
      enemy.healthSegments = 2;
      enemy.maxHp = 1200;
      enemy.hp = 1200;
      enemy.maxPosture = 380;
      enemy.posture = 0;
      enemy.intent = { type: 'move', label: '稳住架势，等待口令', value: 0 };
      enemy.action = 'patrol';
      if (safeStep === 7) enemy.x = state.combat.playerX + 92;
    }
    state.combat.ammo = 9;
    state.combat.emergencyUses = 3;
    dom.battleChapter.textContent = '演武场';
    dom.battleTitle.textContent = singleLesson ? `战前演练 · ${TRAINING_LESSONS[safeStep].title}` : '战前演练 · 看招、拆招、再出刀';
    renderTrainingStep();
    updateMetaBars();
    renderEnemyCards();
    setActionState();
    setTimeout(() => { if (state.training?.active) runPracticalTutorialSequence(); }, 260);
  }

  function finishPracticalTutorial(message = '') {
    if (state.training) state.training.sequenceToken = -1;
    markActiveTutorialFlag('tutorialSeen', true);
    markActiveTutorialFlag('practicalSeen', true);
    if (parrySession) {
      clearPauseAwareDelay(parrySession.watchdog);
      cancelAnimationFrame(parrySession.frame);
    }
    if (shotSession) {
      clearPauseAwareDelay(shotSession.timer);
      clearPauseAwareDelay(shotSession.cueTimer);
    }
    parrySession = null;
    shotSession = null;
    trainingBriefResolver = null;
    clearTrainingCue();
    dom.trainingBriefOverlay?.classList.add('hidden');
    dom.parryOverlay?.classList.add('hidden');
    if (dom.parryOverlay) dom.parryOverlay.className = 'parry-overlay hidden';
    resetParryButton();
    scene.duel = null;
    scene.shotAim = null;
    scene.playerAttack = null;
    scene.execution = null;
    state.training = null;
    state.combat = null;
    state.player = null;
    state.squadId = null;
    state.boss = false;
    state.finished = true;
    stopRouteMapAnimation();
    setScreen('title');
    setMeta();
    if (message) showToast(message);
  }

  function showToast(text, duration = 1600) {
    dom.toast.textContent = text;
    dom.toast.classList.remove('hidden');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => dom.toast.classList.add('hidden'), duration);
  }

  function showComboStage(stage) {
    if (!dom.comboReadout) return;
    const profile = PLAYER_COMBO_PROFILES[stage];
    if (!profile) return;
    dom.comboStageLabel.textContent = profile.short;
    dom.comboStageCount.textContent = `第 ${stage} 式`;
    dom.comboReadout.classList.toggle('finisher', stage === (state.player?.comboMax || 5));
    dom.comboReadout.classList.remove('dodge-counter', 'guard-counter', 'technique', 'hidden', 'pulse');
    const label = dom.comboReadout.querySelector('b'); if (label) label.textContent = '连锋';
    void dom.comboReadout.offsetHeight;
    dom.comboReadout.classList.add('pulse');
    clearTimeout(showComboStage.timer);
    showComboStage.timer = setTimeout(() => dom.comboReadout.classList.add('hidden'), stage === (state.player?.comboMax || 5) ? 900 : 720);
  }

  function showCounterStage(kind, step, total) {
    if (!dom.comboReadout) return;
    const chain = PLAYER_COUNTER_PROFILES[kind] || [];
    const profile = chain[step - 1];
    if (!profile) return;
    dom.comboStageLabel.textContent = profile.short;
    dom.comboStageCount.textContent = `第 ${step} 刀`;
    dom.comboReadout.classList.toggle('finisher', step === total);
    dom.comboReadout.classList.remove('dodge-counter', 'guard-counter', 'technique');
    const label = dom.comboReadout.querySelector('b'); if (label) label.textContent = '反击';
    dom.comboReadout.classList.toggle('dodge-counter', kind === 'dodge');
    dom.comboReadout.classList.toggle('guard-counter', kind === 'guard');
    dom.comboReadout.classList.remove('hidden', 'pulse');
    void dom.comboReadout.offsetHeight;
    dom.comboReadout.classList.add('pulse');
    clearTimeout(showCounterStage.timer);
    showCounterStage.timer = setTimeout(() => dom.comboReadout.classList.add('hidden'), 820);
  }

  function showLevelToast(level) {
    dom.levelToast.textContent = `升级 · 技能树可加点`;
    dom.levelToast.classList.remove('hidden');
    dom.levelToast.style.animation = 'none';
    void dom.levelToast.offsetHeight;
    dom.levelToast.style.animation = '';
    setTimeout(() => dom.levelToast.classList.add('hidden'), 1250);
  }

  function sourceListHtml(ids) {
    return ids.map((key) => {
      const source = SOURCES[key];
      return `<div class="source-item"><span class="source-id">${source.id}</span><strong>${source.name}</strong>｜<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>（${source.date}）</div>`;
    }).join('');
  }

  // 顶部精英/首领血条当前锁定的敌人 id；画布里的浮空血条靠它避让，避免同屏两套
  let eliteHudTargetId = null;
  // 顶部血条高度随字号档位变化，量出来写成 --elite-hud-h，
  // 让 #boss-warning / #player-state-warning 排在它下面，不再压在那条上面。
  if (typeof ResizeObserver === 'function' && dom.eliteHud) {
    new ResizeObserver(() => {
      document.body.style.setProperty('--elite-hud-h', `${dom.eliteHud.offsetHeight}px`);
    }).observe(dom.eliteHud);
  }

  function updateEliteHealthHud() {
    const combat = state.combat;
    const target = combat
      ? (combat.enemies.find((enemy) => enemy.id === combat.targetId && !enemy.dead)
        || combat.enemies.find((enemy) => !enemy.dead && (enemy.elite || enemy.boss)))
      : null;
    const show = !!target && (target.elite || target.boss) && state.screen === 'battle';
    document.body.classList.toggle('elite-hud-active', show);
    dom.eliteHud.classList.toggle('hidden', !show);
    eliteHudTargetId = show ? target.id : null;
    if (!show) return;
    const health = enemyHealthState(target);
    setText(dom.eliteHudType, target.boss ? '首领' : '精英');
    setText(dom.eliteHudName, target.name);
    setText(dom.eliteHudSegments, `尚余 ${health.remaining} 道防线`);
    setPct(dom.eliteHudFill, health.currentPct);
    setPct(dom.eliteHudPostureFill, target.posture / target.maxPosture * 100);
    dom.eliteHud.classList.toggle('boss', !!target.boss);
    dom.eliteHud.classList.toggle('broken', !!target.status.broken);
  }

  let selectedSquadId = null;
  let selectedRouteIndex = -1;
  let selectedRewardIndex = -1;
  let selectedShopIndex = -1;

  function effectChip(label, value, tone = 'neutral') {
    return `<span class="event-effect ${tone}">${label} ${value}</span>`;
  }

  function detailHighlightHtml(highlight) {
    if (!highlight?.name) return '';
    return `<div class="detail-highlight-label">${highlight.label || '关键获得'}</div><strong>${highlight.name}</strong>${highlight.effect ? `<p>${highlight.effect}</p>` : ''}`;
  }

  function cardKeyOutcomeHtml({ label = '可获得', name = '', effect = '', cost = '' } = {}) {
    return `<div class="card-key-outcome"><span>${label}</span><strong>${name}</strong>${effect ? `<p>${effect}</p>` : ''}${cost ? `<em class="card-key-cost">${cost}</em>` : ''}</div>`;
  }

  function signedResourceList(changes, limit = 4) {
    return (changes || []).slice(0, limit).map((item) => `${item.label} ${item.value > 0 ? '+' : ''}${Math.round(item.value)}`).join(' · ');
  }

  function resourceCostText(cost = {}) {
    const labels = { hp: '兵力', supplies: '补给', morale: '士气', merit: '军功' };
    return Object.entries(cost).filter(([, value]) => value).map(([key, value]) => `${labels[key] || key} -${value}`).join(' · ');
  }

  function openChoiceDetail({ kicker, title, body, highlight = null, effects, notes }) {
    dom.choiceDetailKicker.textContent = kicker;
    dom.choiceDetailTitle.textContent = title;
    dom.choiceDetailBody.textContent = body || '';
    dom.choiceDetailBody.classList.toggle('hidden', !body);
    dom.choiceDetailHighlight.innerHTML = detailHighlightHtml(highlight);
    dom.choiceDetailHighlight.classList.toggle('hidden', !highlight?.name);
    dom.choiceDetailEffects.innerHTML = effects.map((item) => effectChip(item.label, item.value, item.tone)).join('');
    dom.choiceDetailNotes.innerHTML = notes.filter(Boolean).map((note) => `<li>${note}</li>`).join('');
    dom.choiceDetailOverlay.classList.remove('hidden');
    requestAnimationFrame(() => dom.choiceDetailOverlay.focus({ preventScroll: true }));
  }

  function closeChoiceDetail() {
    dom.choiceDetailOverlay.classList.add('hidden');
  }

  function updateSelectionFooter() {
    let ready = false;
    let hint = '先选择一个选项。';
    let label = '请选择';
    if (state.screen === 'squad') {
      const squad = SQUADS[selectedSquadId];
      ready = !!squad;
      hint = squad ? `已选择：${squad.name}` : '先选择一支队伍，再查看详情并确认。';
      label = ready ? '确认出征' : '请选择队伍';
    } else if (state.screen === 'route') {
      const route = state.routeOptions[selectedRouteIndex];
      ready = !!route;
      hint = route ? `已选择：${route.title}` : '先选择一条路线，再查看详情并确认。';
      label = ready ? '确认路线' : '请选择路线';
    } else if (state.screen === 'event') {
      const choice = state.currentEvent?.choices?.[selectedEventIndex];
      ready = !!choice;
      hint = choice ? `已选择：${choice.label}` : '先选择一个方案，再做出决定。';
      label = ready ? '做出决定' : '请选择方案';
    } else if (state.screen === 'reward') {
      const reward = state.pendingRewards[selectedRewardIndex];
      ready = !!reward;
      hint = reward ? `已选择：${reward.name}` : '先选择一个强化，再查看详情并确认。';
      label = ready ? '确认强化' : '请选择强化';
    }
    const visible = ['squad', 'route', 'event', 'reward'].includes(state.screen);
    dom.selectionFooter.classList.toggle('hidden', !visible);
    dom.selectionFooter.classList.toggle('ready', ready);
    dom.selectionConfirm.disabled = !ready;
    dom.selectionHint.textContent = activeGamepad ? `${hint} · 左摇杆/十字键切换 · Y 查看详情 · A 确认下方按钮` : hint;
    dom.selectionConfirm.textContent = label;
  }

  function updateSquadSelection() {
    const squad = SQUADS[selectedSquadId];
    dom.squadCards.querySelectorAll('[data-squad-card]').forEach((card) => {
      const selected = card.dataset.squadCard === selectedSquadId;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      const action = card.querySelector('.choice-card-action');
      if (action) action.textContent = gamepadChoiceActionText(selected);
    });
    updateSelectionFooter();
  }

  function selectSquadCard(id) {
    if (selectedSquadId === id) {
      openSquadDetail(id);
      return;
    }
    selectedSquadId = id;
    updateSquadSelection();
  }

  function openSquadDetail(id) {
    const squad = SQUADS[id];
    if (!squad) return;
    openChoiceDetail({
      kicker: '队伍详情',
      title: squad.name,
      body: squad.detail,
      highlight: { label: '队伍所长', name: squad.passive, effect: `生命 ${squad.maxHp} · 攻势 ${squad.atk} · 防御 ${squad.defense} · 补给 ${squad.supplies}` },
      effects: [
        { label: '生命', value: squad.maxHp, tone: 'gain' },
        { label: '攻势', value: squad.atk, tone: 'neutral' },
        { label: '防御', value: squad.defense, tone: 'neutral' },
        { label: '暴击', value: `${Math.round(squad.crit * 100)}%`, tone: 'gain' },
        { label: '补给', value: squad.supplies, tone: 'neutral' },
        { label: '士气', value: squad.morale, tone: 'neutral' }
      ],
      notes: []
    });
  }

  function squadOptionIds() {
    return state.squadOptions.length ? state.squadOptions : Object.keys(SQUADS);
  }

  function renderSquads() {
    dom.squadCards.innerHTML = squadOptionIds().map((id) => SQUADS[id]).filter(Boolean).map((squad) => `
      <article class="choice-card" data-squad-card="${squad.id}" role="button" tabindex="0" aria-pressed="false">
        <div class="choice-icon">${squad.icon}</div>
        <h3>${squad.name}</h3>
        ${cardKeyOutcomeHtml({ label: '队伍所长', name: squad.passive, effect: `生命 ${squad.maxHp} · 攻势 ${squad.atk} · 防御 ${squad.defense} · 补给 ${squad.supplies}` })}
        <div class="choice-tags">${squad.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <div class="choice-card-footer"><span class="choice-card-action">点击选择</span><button class="choice-detail-link" type="button" data-squad-detail="${squad.id}">查看详情</button></div>
      </article>`).join('');
    dom.squadCards.querySelectorAll('[data-squad-card]').forEach((card) => {
      const id = card.dataset.squadCard;
      card.addEventListener('click', () => selectSquadCard(id));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectSquadCard(id);
        }
      });
    });
    dom.squadCards.querySelectorAll('[data-squad-detail]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedSquadId = button.dataset.squadDetail;
        updateSquadSelection();
        openSquadDetail(selectedSquadId);
      });
    });
    updateSquadSelection();
  }

  function renderModeCards() {
    if (!dom.modeCards) return;
    dom.modeCards.innerHTML = GAME_MODES.map((mode) => `
      <article class="choice-card mode-${mode.mode === 'roguelike' ? 'roguelike' : mode.id === 'single-normal' ? 'normal' : 'quick'} ${mode.featured ? 'mode-featured' : ''}" data-mode-choice="${mode.id}" role="button" tabindex="0" aria-pressed="false">
        ${mode.badge ? `<span class="mode-featured-badge ${mode.id === 'roguelike' ? 'mode-roguelike-badge' : ''}">${mode.badge}</span>` : ''}
        <div class="choice-icon">${mode.icon}</div>
        <h3>${mode.name}</h3>
        <p>${mode.desc}</p>
        <div class="choice-tags">${mode.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <span class="mode-start">点击进入</span>
      </article>`).join('');
    dom.modeCards.querySelectorAll('[data-mode-choice]').forEach((card) => {
      const activate = () => chooseGameMode(card.dataset.modeChoice);
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function showModeSelect() {
    renderModeCards();
    setScreen('mode');
  }

  function renderDifficultyOptions() {
    if (!dom.difficultyOptions) return;
    const stars = ['★☆☆☆', '★★☆☆', '★★★☆', '★★★★'];
    dom.difficultyOptions.innerHTML = DIFFICULTY_LEVELS.map((level, index) => `
      <button class="difficulty-card difficulty-${level.id}" type="button" data-difficulty-choice="${level.id}">
        <span class="difficulty-rank">${level.rank} · ${stars[index]}</span>
        <strong>${level.icon} ${level.name}</strong>
        <p>${level.desc}</p>
        <em>敌军强度：${index === 0 ? '较低' : index === 1 ? '标准' : index === 2 ? '严酷' : '绝境'}</em>
      </button>`).join('');
    dom.difficultyOptions.querySelectorAll('[data-difficulty-choice]').forEach((card) => {
      card.addEventListener('click', () => chooseDifficulty(card.dataset.difficultyChoice));
    });
  }

  function showDifficultySelect() {
    renderDifficultyOptions();
    setScreen('difficulty');
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const screen = document.querySelector('#screen-difficulty');
      if (screen) screen.scrollTop = 0;
    });
  }

  function chooseDifficulty(difficultyId) {
    const level = DIFFICULTY_LEVELS.find((entry) => entry.id === difficultyId);
    if (!level) return;
    state.difficulty = level.id;
    state.runMode = 'single';
    state.singlePace = 'normal';
    state.act = 0;
    state.actStep = 0;
    state.singleMap = null;
    state.chapter = 0;
    state.battle = 0;
    state.battleNumber = 0;
    selectedSquadId = state.squadOptions[0] || null;
    renderSquads();
    setScreen('squad');
    setMeta();
  }

  function chooseGameMode(modeId) {
    const mode = GAME_MODES.find((candidate) => candidate.id === modeId);
    if (!mode) return;
    if (mode.id === 'single-normal') { showDifficultySelect(); return; }
    state.runMode = mode.mode;
    state.singlePace = mode.pace;
    state.difficulty = mode.id === 'single-quick' ? 'quick' : 'march';
    state.act = 0;
    state.actStep = 0;
    state.singleMap = null;
    state.chapter = 0;
    state.battle = 0;
    state.battleNumber = 0;
    selectedSquadId = state.squadOptions[0] || null;
    renderSquads();
    setScreen('squad');
    setMeta();
  }

  function chooseSquad(id) {
    state.player = createPlayer(id);
    state.squadId = id;
    state.battle = 0;
    state.battleNumber = 0;
    state.boss = false;
    state.finished = false;
    state.training = null;
    state.act = 0;
    state.actStep = 0;
    state.usedEvents = [];
    state.lastRandomShopAt = 0;
    state.routeOptions = [];
    state.pendingRewards = [];
    state.currentEvent = null;
    state.shopItems = [];
    state.stats = { victories: 0, damage: 0, upgrades: 0, parries: 0, counters: 0, executions: 0, shopPurchases: 0, seed: state.seed };
    state.runElapsedMs = 0;
    state.runActiveSince = Date.now();
    if (state.runMode === 'single') {
      state.chapter = 0;
      state.singleMap = generateSingleMap(state.singlePace);
    } else {
      state.runMode = 'roguelike';
      state.singleMap = null;
      state.chapter = ROGUELIKE_ACTS[0].chapter;
      state.player.comboMax = 5;
      state.actBoss = selectActBoss(0);
    }
    setMeta();
    showRoute();
  }

  function createPlayer(squadId) {
    const squad = SQUADS[squadId];
    return {
      squadId, name: squad.name, icon: squad.icon, passive: squad.passive,
      hp: squad.maxHp, maxHp: squad.maxHp, atk: squad.atk, defense: squad.defense,
      crit: squad.crit, supplies: squad.supplies, maxSupplies: squad.supplies,
      morale: squad.morale, level: 1, xp: 0, xpNext: 42, merit: 60,
      guard: 0, cooldowns: { charge: 0, tactic: 0 }, firstAction: true, firstGuard: true, firstSupply: true,
      posture: 0, maxPosture: 78, postureRecoverAt: 0, postureBroken: false, postureBreakUntil: 0, hitstunUntil: 0, dodgeCooldownUntil: 0,
      basicBonus: 0, chargeBonus: squad.chargeBonus || 0, tacticCooldownReduction: 0, lowHpBonus: 0,
      moraleRegen: 0, moralePower: 0, supplyCostReduction: squad.supplyCostReduction || 0, healBonus: squad.healBonus || 0, firstStrikeCrit: false,
      emergencyBonus: 0, comboWindowBonus: 0, comboMax: 5,
      dodgeCounterBonus: 0, guardCounterBonus: 0, dodgeCounterWindowBonus: 0, guardCounterWindowBonus: squad.guardCounterWindowBonus || 0,
      rangedBonus: squad.rangedBonus || 0, firstBlockHeal: true,
      moveSpeedBonus: 0, openingMoraleBonus: 0, relicParryPosture: 0, relicMapBonus: 0, relicMapReveal: 220, relicSecretSense: 95, shopDiscount: 0, meritGainBonus: 0, relics: [], relicSynergies: [],
      techniqueDamageBonus: 0, techniquePostureBonus: 0, techniques: ['backcut'], dodgeCooldownReduction: 0, executionMeritBonus: 0, lowHpDefenseBonus: 0,
      talents: [], talentSpent: 0, bonusEquipmentSlots: 0, chestLuck: 0,
      lives: state.runMode === 'single' && state.singlePace === 'normal' ? 3 : 1, deaths: 0, respawnId: null,
      equipmentInventory: [], equippedEquipment: [], materials: {}, storyClues: [], achievements: [], keys: {}, npcQuests: {}, npcTrades: {}, npcRumors: {},
      consumables: { bandage: 1 }, quickItemId: 'bandage',
      shopCounts: {},
      upgrades: []
    };
  }

  function syncRelicSynergies(player) {
    if (!player) return [];
    if (!Array.isArray(player.relics)) player.relics = [];
    if (!Array.isArray(player.relicSynergies)) player.relicSynergies = [];
    const unlocked = [];
    RELIC_SYNERGIES.forEach((synergy) => {
      if (player.relicSynergies.includes(synergy.id)) return;
      if (!synergy.relics.every((id) => player.relics.includes(id))) return;
      synergy.apply(player);
      player.relicSynergies.push(synergy.id);
      unlocked.push(synergy);
    });
    return unlocked;
  }
  function unlockTechnique(player, techniqueId, options = {}) {
    if (!player || !PLAYER_TECHNIQUES[techniqueId]) return null;
    if (!Array.isArray(player.techniques)) player.techniques = [];
    if (player.techniques.includes(techniqueId)) return { technique: PLAYER_TECHNIQUES[techniqueId], duplicate: true };
    player.techniques.push(techniqueId);
    if (!options.silent && player === state.player) queueAcquisition({ type: 'technique', kicker: options.kicker || '习得刀法变招', name: PLAYER_TECHNIQUES[techniqueId].name, icon: '式', meta: options.source || '刀法所得', desc: PLAYER_TECHNIQUES[techniqueId].desc, effects: [PLAYER_TECHNIQUES[techniqueId].input], note: '变招需要在普通连锋前两式后按住方向再出刀。' });
    return { technique: PLAYER_TECHNIQUES[techniqueId], duplicate: false };
  }
  function grantRelic(player, relicId, options = {}) {
    const relic = RELICS.find((entry) => entry.id === relicId);
    if (!player || !relic) return null;
    if (!player.relics) player.relics = [];
    if (player.relics.includes(relic.id)) {
      player.merit = (player.merit || 0) + 28;
      return { relic, duplicate: true, synergies: [] };
    }
    relic.apply(player);
    player.relics.push(relic.id);
    const synergies = syncRelicSynergies(player);
    if (!options.silent && player === state.player) queueAcquisition({ type: 'relic', kicker: options.kicker || '获得星火信物', name: relic.name, icon: relic.icon, meta: `${relic.rarity} · ${relic.tags?.join(' / ') || '信物'}`, desc: relic.desc, effects: [relic.effect], note: synergies.length ? `触发联动：${synergies.map((item) => item.name).join('、')}` : (options.source || '信物会写入行囊，可在顶栏查看详细效果。') });
    if (player === state.player) { renderTopRelics(); updateMetaBars(); }
    return { relic, duplicate: false, synergies };
  }

  function equipmentById(itemId) { return EQUIPMENT_ITEMS.find((item) => item.id === itemId) || null; }
  function equipmentUnitById(uid) { return state.player?.equipmentInventory?.find((unit) => unit.uid === uid) || null; }
  function equipmentSlotLimit(player = state.player) {
    if (!player) return 2;
    const talentSlot = player.bonusEquipmentSlots || 0;
    const levelSlot = (player.level || 1) >= 10 ? 1 : 0;
    return Math.min(4, 2 + talentSlot + levelSlot);
  }
  function acquireEquipment(player, itemId, options = {}) {
    const item = equipmentById(itemId);
    if (!player || !item) return null;
    if (!Array.isArray(player.equipmentInventory)) player.equipmentInventory = [];
    if (!Array.isArray(player.equippedEquipment)) player.equippedEquipment = [];
    const unit = { uid: `eq-${Date.now()}-${Math.floor(state.rng() * 1000000)}`, itemId, level: 1, source: options.source || '行囊', acquiredAt: Date.now() };
    player.equipmentInventory.push(unit);
    if (options.autoEquip && player.equippedEquipment.length < equipmentSlotLimit(player)) equipEquipmentUnit(unit.uid, { silent: true });
    if (!options.silent && player === state.player) queueAcquisition({ type: 'equipment', kicker: options.kicker || '获得军备', name: item.name, icon: item.icon, meta: `${EQUIPMENT_RARITIES[item.rarity].name} · ${item.category}`, desc: item.desc, effects: item.effects.map((effect) => `${effect.label} ${effect.value}`), note: options.autoEquip && player.equippedEquipment.includes(unit.uid) ? '已自动装入当前空余军备槽。' : '可在“军备”界面自由装备或卸下。' });
    if (player === state.player) updateMetaBars();
    return unit;
  }
  function applyEquipmentStats(item, sign, level = 1) { if (item?.apply) item.apply(state.player, sign * Math.max(1, level)); }
  function equipEquipmentUnit(uid, options = {}) {
    const p = state.player, unit = equipmentUnitById(uid), item = unit ? equipmentById(unit.itemId) : null;
    if (!p || !unit || !item || p.equippedEquipment.includes(uid)) return false;
    if (p.equippedEquipment.length >= equipmentSlotLimit(p)) { if (!options.silent) showToast('军备槽已满，请先卸下一件。'); return false; }
    applyEquipmentStats(item, 1, unit.level || 1); p.equippedEquipment.push(uid);
    if (!options.silent) { showToast(`已装备：${item.name}`); updateMetaBars(); }
    return true;
  }
  function unequipEquipmentUnit(uid, options = {}) {
    const p = state.player, index = p?.equippedEquipment?.indexOf(uid) ?? -1, unit = equipmentUnitById(uid), item = unit ? equipmentById(unit.itemId) : null;
    if (!p || index < 0 || !item) return false;
    applyEquipmentStats(item, -1, unit.level || 1); p.equippedEquipment.splice(index, 1); p.hp = Math.min(p.hp, p.maxHp);
    if (!options.silent) { showToast(`已卸下：${item.name}`); updateMetaBars(); }
    return true;
  }
  function equipmentUpgradeMaterial(item) {
    return item && ['枪械', '军需'].includes(item.category) ? 'machined_parts' : 'tempered_steel';
  }
  function equipmentUpgradeInfo(unit) {
    const item = unit ? equipmentById(unit.itemId) : null;
    if (!item || !unit) return null;
    const level = unit.level || 1;
    if (level >= 3) return { maxed: true, level, item, materialId: equipmentUpgradeMaterial(item), materialAmount: 0, merit: 0 };
    return { maxed: false, level, nextLevel: level + 1, item, materialId: equipmentUpgradeMaterial(item), materialAmount: level, merit: 35 + level * 30 };
  }
  function grantMaterial(player, materialId, amount = 1, options = {}) {
    const material = MATERIALS[materialId];
    if (!player || !material || amount <= 0) return false;
    player.materials = player.materials || {};
    player.materials[materialId] = (player.materials[materialId] || 0) + amount;
    if (!options.silent && player === state.player) queueAcquisition({ type: 'material', kicker: options.source || '获得强化材料', name: material.name, icon: material.icon, meta: '军备强化材料', desc: material.desc, effects: [`持有 ${player.materials[materialId]} 份`], note: '可在军备界面强化对应装备。' });
    return true;
  }
  function upgradeEquipmentUnit(uid) {
    const p = state.player, unit = equipmentUnitById(uid), info = equipmentUpgradeInfo(unit);
    if (!p || !unit || !info) return false;
    if (info.maxed) { showToast('这件军备已经强化到最高等级。'); return false; }
    const owned = p.materials?.[info.materialId] || 0;
    if (owned < info.materialAmount) { showToast(`缺少${MATERIALS[info.materialId].name}。`); return false; }
    if ((p.merit || 0) < info.merit) { showToast('军功不足，无法强化。'); return false; }
    const equipped = p.equippedEquipment.includes(uid);
    if (equipped) applyEquipmentStats(info.item, -1, info.level);
    p.materials[info.materialId] -= info.materialAmount;
    if ((p.materials[info.materialId] || 0) <= 0) delete p.materials[info.materialId];
    p.merit -= info.merit;
    unit.level = info.nextLevel;
    if (equipped) applyEquipmentStats(info.item, 1, unit.level);
    p.hp = Math.min(p.hp, p.maxHp); p.posture = Math.min(p.posture, p.maxPosture);
    queueAcquisition({ type: 'upgrade', kicker: '军备强化', name: `${info.item.name} · Lv.${unit.level}`, icon: info.item.icon, meta: `${EQUIPMENT_RARITIES[info.item.rarity].name} · ${info.item.category}`, desc: '材料已经重新打进刀身与装具，军备效果得到提升。', effects: info.item.effects.map((effect) => `${effect.label} ${effect.value} × ${unit.level}`), note: equipped ? '当前装备效果已即时更新。' : '装备后即可获得强化后的数值。' });
    playSound('level');
    updateMetaBars(); renderEquipmentPanel(); saveCurrentRun(state.screen);
    return true;
  }  function grantKey(player, keyId, options = {}) {
    const key = KEYS[keyId]; if (!player || !key) return false;
    player.keys = player.keys || {}; player.keys[keyId] = (player.keys[keyId] || 0) + 1;
    if (!options.silent && player === state.player) queueAcquisition({ type: 'key', kicker: options.kicker || '获得钥匙', name: key.name, icon: key.icon, meta: options.source || '可开启对应暗门', desc: key.desc, effects: [`当前持有 ${player.keys[keyId]} 把`], note: '靠近对应门锁后按 E/X 使用。' });
    return true;
  }
  function consumeKey(player, keyId) {
    if (!player?.keys?.[keyId]) return false;
    player.keys[keyId] -= 1; if (player.keys[keyId] <= 0) delete player.keys[keyId]; return true;
  }
  function consumableById(id) { return CONSUMABLES.find((item) => item.id === id) || null; }
  function addConsumable(player, itemId, count = 1, options = {}) {
    const item = consumableById(itemId);
    if (!player || !item) return false;
    player.consumables = player.consumables || {};
    player.consumables[itemId] = (player.consumables[itemId] || 0) + Math.max(1, count);
    if (!player.quickItemId || !(player.consumables[player.quickItemId] > 0)) player.quickItemId = itemId;
    if (!options.silent && player === state.player) queueAcquisition({ type: 'consumable', kicker: options.source || '获得小道具', name: item.name, icon: item.icon, meta: `${item.category} · 当前 ${player.consumables[itemId]} 个`, desc: item.desc, effects: [item.effect], note: `按 ${inputBindingLabel('item')} 使用` });
    return true;
  }
  function availableConsumables(player = state.player) {
    return Object.entries(player?.consumables || {}).filter(([, count]) => count > 0).map(([id, count]) => ({ item: consumableById(id), count })).filter((entry) => entry.item);
  }
  function ensureQuickItem(player = state.player) {
    if (!player) return null;
    const list = availableConsumables(player);
    if (!list.length) { player.quickItemId = null; return null; }
    if (!list.some((entry) => entry.item.id === player.quickItemId)) player.quickItemId = list[0].item.id;
    return consumableById(player.quickItemId);
  }
  function updateQuickItemHud() {
    const p = state.player, item = ensureQuickItem(p), count = item ? (p.consumables?.[item.id] || 0) : 0;
    if (dom.quickItemKey) dom.quickItemKey.textContent = inputBindingLabel('item');
    if (dom.quickItemName) dom.quickItemName.textContent = item ? item.name : '无小道具';
    if (dom.quickItemCount) dom.quickItemCount.textContent = item ? `×${count}` : '';
    dom.quickItemHud?.classList.toggle('empty', !item);
  }
  function cycleQuickItem() {
    const p = state.player, list = availableConsumables(p);
    if (!p || !list.length) { showToast('当前没有可用的小道具。'); return; }
    const index = list.findIndex((entry) => entry.item.id === p.quickItemId);
    p.quickItemId = list[(index + 1) % list.length].item.id;
    updateQuickItemHud();
    showToast(`战备品：${consumableById(p.quickItemId).name}`);
  }
  function useQuickItem() {
    const p = state.player, combat = state.combat;
    if (!p || !combat || state.screen !== 'battle' || combat.finished) { showToast('战斗中才能使用小道具。'); return false; }
    const item = ensureQuickItem(p), count = item ? (p.consumables?.[item.id] || 0) : 0;
    if (!item || count <= 0) { showToast('当前没有可用的小道具。'); updateQuickItemHud(); return false; }
    const enemy = targetEnemy();
    if (!enemy && ['smoke_pellet', 'fire_pot', 'caltrops'].includes(item.id)) { showToast('当前没有可作用的目标。'); return false; }
    if (item.id === 'bandage') { p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .24) + p.healBonus); p.posture = Math.max(0, p.posture - 18); }
    if (item.id === 'fried_dough') { p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .12) + p.healBonus); p.supplies = Math.min(p.maxSupplies, p.supplies + 10); }
    if (item.id === 'smoke_pellet' && enemy) { enemy.status.stun = Math.max(enemy.status.stun || 0, 1); enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 800); enemy.intent = { type: 'stunned', label: '烟雾遮眼 · 迟滞', value: 0 }; }
    if (item.id === 'fire_pot' && enemy) { dealDamageToEnemy(enemy, Math.round(24 + p.atk * .5 + p.lowHpBonus * 20), false, '火油罐', { postureMultiplier: 2.15 }); }
    if (item.id === 'caltrops' && enemy) { enemy.status.stun = Math.max(enemy.status.stun || 0, 1); enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 600); addEnemyPosture(enemy, 24, { source: 'caltrops' }); }
    if (item.id === 'salt_water') { p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .14) + p.healBonus); p.morale = Math.min(100, p.morale + 12); }
    if (item.id === 'rice_wine') { p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .18) + p.healBonus); p.posture = Math.max(0, p.posture - Math.round(p.maxPosture * .55)); }
    if (item.id === 'gun_oil') { combat.ammo += 3; p.posture = Math.max(0, p.posture - 8); }
    if (item.id === 'signal_flare') (combat.enemies || []).forEach((target) => { if (!target.dead) { target.status.stun = Math.max(target.status.stun || 0, 1); target.hitstunUntil = Math.max(target.hitstunUntil || 0, performance.now() + 720); target.intent = { type: 'stunned', label: '信号焰火 · 迟滞', value: 0 }; } });
    if (item.id === 'iron_ration') { const missing = 1 - p.hp / Math.max(1, p.maxHp); p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * (.18 + missing * .22)) + p.healBonus); }
    p.consumables[item.id] = count - 1;
    if (p.consumables[item.id] <= 0) delete p.consumables[item.id];
    addLog(`使用战备品：<strong>${item.name}</strong>。`, 'good');
    showToast(`${item.name} · ${item.effect}`);
    playSound(item.id === 'fire_pot' || item.id === 'signal_flare' ? 'boom' : 'heal');
    ensureQuickItem(p);
    updateMetaBars(); renderEnemyCards(); setActionState(); saveCurrentRun('battle');
    return true;
  }
  let acquisitionCurrent = null;
  function queueAcquisition(entry) {
    if (!entry) return;
    acquisitionQueue.push(entry);
    if (!acquisitionActive) showNextAcquisition();
  }
  function showNextAcquisition() {
    if (acquisitionActive) return;
    const entry = acquisitionQueue.shift();
    if (!entry) { acquisitionActive = false; acquisitionCurrent = null; state.acquisitionOpen = false; dom.acquisitionOverlay?.classList.add('hidden'); return; }
    acquisitionActive = true; acquisitionCurrent = entry; state.acquisitionOpen = true;
    dom.acquisitionKicker.textContent = entry.kicker || '获得物品';
    dom.acquisitionIcon.textContent = entry.icon || '物';
    dom.acquisitionTitle.textContent = entry.name || '物品';
    dom.acquisitionMeta.textContent = entry.meta || '';
    dom.acquisitionDesc.textContent = entry.desc || '';
    dom.acquisitionEffects.innerHTML = (entry.effects || []).map((effect) => `<span class="acquisition-effect">${effect}</span>`).join('');
    const keepNote = ['boss-intro', 'respawn'].includes(entry.type) || /联动|反击|处决|保留|恢复/.test(entry.note || '');
    dom.acquisitionNote.textContent = keepNote ? (entry.note || '') : '';
    dom.acquisitionOverlay?.classList.remove('hidden');
    playSound('level');
    setTimeout(() => dom.acquisitionConfirm?.focus({ preventScroll: true }), 0);
  }
  function confirmAcquisition() {
    if (!acquisitionActive) return;
    const finished = acquisitionCurrent;
    acquisitionCurrent = null;
    acquisitionActive = false;
    state.acquisitionOpen = false;
    dom.acquisitionOverlay?.classList.add('hidden');
    if (acquisitionQueue.length) showNextAcquisition();
    else if (typeof finished?.onConfirm === 'function') finished.onConfirm();
  }
  function grantStoryClue(clueId, options = {}) {
    const clue = STORY_CLUES.find((entry) => entry.id === clueId), p = state.player;
    if (!clue || !p) return false;
    p.storyClues = p.storyClues || [];
    if (p.storyClues.includes(clue.id)) return false;
    p.storyClues.push(clue.id);
    if (!options.silent) queueAcquisition({ type: 'story', kicker: options.source || clue.source, name: `线索 · ${clue.title}`, icon: '卷', meta: `行军线索 ${p.storyClues.length} / ${STORY_CLUES.length}`, desc: clue.text, effects: ['已记入行军线索'], note: '可在“行军所得”中重新查看。' });
    checkAchievements();
    return true;
  }
  function unlockAchievement(achievement) {
    const p = state.player;
    if (!p || !achievement || (p.achievements || []).includes(achievement.id)) return false;
    p.achievements = p.achievements || [];
    p.achievements.push(achievement.id);
    const merit = 20;
    p.merit = (p.merit || 0) + merit;
    if (dom.metaMerit) dom.metaMerit.textContent = String(Math.round(p.merit));
    showAchievementToast(achievement, merit);
    playSound('achievement');
    return true;
  }
  function showAchievementToast(achievement, merit = 20) {
    if (!dom.achievementToastStack || !achievement) return;
    while (dom.achievementToastStack.children.length >= 4) dom.achievementToastStack.firstElementChild?.remove();
    const card = document.createElement('article');
    card.className = 'achievement-toast';
    card.innerHTML = `<span class="achievement-toast-icon">勋</span><div><small>行军成就</small><strong>${achievement.name}</strong><p>${achievement.desc}</p><em>军功 +${merit}</em></div>`;
    dom.achievementToastStack.appendChild(card);
    requestAnimationFrame(() => card.classList.add('show'));
    setTimeout(() => {
      card.classList.add('leaving');
      setTimeout(() => card.remove(), 380);
    }, 4200);
  }

  function checkAchievements() {
    const p = state.player;
    if (!p) return;
    ACHIEVEMENTS.forEach((achievement) => {
      if ((p.achievements || []).includes(achievement.id)) return;
      if (achievement.check(p, state.stats || {})) unlockAchievement(achievement);
    });
  }  function talentPoints(player = state.player) { return player ? Math.max(0, (player.level || 1) - (player.talentSpent || 0)) : 0; }
  function talentCanUnlock(node, player = state.player) {
    return !!player && !!node && !(player.talents || []).includes(node.id) && talentPoints(player) >= node.cost && (node.requires || []).every((id) => (player.talents || []).includes(id));
  }
  function unlockTalent(nodeId) {
    const node = TALENT_TREE.find((entry) => entry.id === nodeId), p = state.player;
    if (!node || !p) return false;
    if ((p.talents || []).includes(node.id)) { showToast('这项天赋已经学会。'); return false; }
    if (!talentCanUnlock(node, p)) { showToast(talentPoints(p) < node.cost ? '天赋点不足，升级后才能继续。' : '前置天赋还没有点亮。'); return false; }
    p.talents = p.talents || []; p.talents.push(node.id); p.talentSpent = (p.talentSpent || 0) + node.cost; node.apply(p);
    queueAcquisition({ type: 'talent', kicker: '点亮天赋', name: node.name, icon: node.icon, meta: `${node.branch} · 消耗 ${node.cost} 点`, desc: node.desc, effects: [node.effect], note: node.techniqueId && p.techniques.includes(node.techniqueId) ? '对应变招已加入可用招式。' : '天赋效果已即时生效。' });
    updateMetaBars(); renderGrowthPanel(); return true;
  }
  function relicArtSvg(id) {
    const arts = {
      red_star: '<path d="M24 8l4.4 9.7 10.6 1-8 7.2 2.4 10.4-9.4-5.5-9.4 5.5 2.4-10.4-8-7.2 10.6-1z" fill="#d83b30"/><circle cx="24" cy="23" r="4" fill="#f2c45f"/>',
      straw_shoes: '<path d="M8 30c7-2 10-8 12-14 4 2 5 7 3 12l7 3c2-5 2-10-1-14 7 1 11 6 11 12-2 6-8 9-16 9-7 0-13-3-16-8z" fill="#ba8a4d"/><path d="M14 30l8-3m2 7l8-4" stroke="#f1cf82" stroke-width="2"/>',
      brass_horn: '<path d="M9 29c9-1 15-6 18-14l7 3c-4 11-13 18-25 20z" fill="#b98036"/><path d="M33 18l7-7 2 2-5 8zm1 8l8-2 1 3-8 2z" fill="#e0b761"/>',
      herb_bag: '<path d="M14 17c4-2 16-2 20 0l3 18c-7 5-19 5-26 0z" fill="#8f5636"/><path d="M19 16c1-6 9-6 10 0M24 21v11m-5-6h10" stroke="#e2c17c" stroke-width="2" fill="none"/>',
      whetstone: '<path d="M9 32l8-18 22 6-7 17z" fill="#777c78"/><path d="M16 18l20 6M13 26l20 5" stroke="#d7c17d" stroke-width="1.5"/>',
      river_bamboo: '<g fill="#7b9a58"><rect x="9" y="19" width="30" height="8" rx="4" transform="rotate(-18 24 23)"/><path d="M17 15l2 17m8-14l2 17m8-13l2 13" stroke="#d9bd74" stroke-width="3"/></g>',
      oil_map: '<path d="M7 14l12-4 11 4 11-4v24l-11 4-11-4-12 4z" fill="#b48d55"/><path d="M19 10v24m11-20v24M11 22c5 2 7 4 9 8m8-10c4 1 7 1 10-1" stroke="#5d412b" stroke-width="1.8" fill="none"/>',
      red_banner: '<path d="M13 7v34M14 10c9-5 16 5 24-1v18c-8 6-15-4-24 1z" fill="#b52b26"/><path d="M18 18l4 2 3-4 3 4 5-2" stroke="#edc36c" stroke-width="2" fill="none"/>',
      scout_compass: '<circle cx="24" cy="24" r="15" fill="#4f5a55" stroke="#d8b866" stroke-width="2"/><path d="M24 12l5 12-5 12-5-12z" fill="#d84a37"/><circle cx="24" cy="24" r="2.5" fill="#f4df9b"/>',
      marshal_whistle: '<path d="M10 20h23l6 5-6 6H18c-8 0-12-4-8-11z" fill="#b78a45"/><circle cx="16" cy="25" r="3" fill="#3a2a1c"/><path d="M31 19l7-5m-7 16l7 5" stroke="#e0bd73" stroke-width="2"/>',
      iron_hook: '<path d="M29 8c-7 2-10 8-10 16v5c0 6-3 9-8 9-5 0-7-4-7-8" fill="none" stroke="#9ba5a2" stroke-width="4" stroke-linecap="round"/><path d="M27 6l7 5-7 4" fill="none" stroke="#d6b568" stroke-width="3"/>',
      blade_manual: '<path d="M10 11c7-3 11-2 14 1v27c-4-4-8-5-14-2zM38 11c-7-3-11-2-14 1v27c4-4 8-5 14-2z" fill="#8d3d2d" stroke="#dfbb70" stroke-width="1.5"/><path d="M15 18l6-1m-6 5l6-1m7-3l6 1m-6 4l6 1" stroke="#d7bd83" stroke-width="1.4"/>',
      field_tourniquet: '<circle cx="24" cy="24" r="13" fill="#d7cba6"/><path d="M18 17c8-5 16 1 13 8-2 5-9 7-13 3-3-3-1-8 3-9 4-1 7 2 6 5" fill="none" stroke="#a43a31" stroke-width="3"/><path d="M24 8v7m-6-4l6 4 6-4" stroke="#8c2f28" stroke-width="2" fill="none"/>',
      ammo_mold: '<path d="M10 33h9l2-18h-7zM23 33h9l2-18h-7zM36 33h5l1-12h-4z" fill="#9a895e" stroke="#e1c173" stroke-width="1.5"/><path d="M12 20h7m7 0h7m6 0h4" stroke="#5c4d37" stroke-width="2"/>',
      victory_flag: '<path d="M12 8v34" stroke="#d6bd7c" stroke-width="3"/><path d="M14 10h25l-5 8 5 8H14z" fill="#b52c26"/><path d="M24 14l2 4 5 .5-4 3.5 1 5-4-2.5-4 2.5 1-5-4-3.5 5-.5z" fill="#f0c45e"/>',
      hemp_stretcher: '<path d="M7 10l34 28M41 10L7 38" stroke="#a8814d" stroke-width="3"/><path d="M12 17c7-4 17-4 24 0v14c-7 4-17 4-24 0z" fill="#8f6b43" stroke="#e0bf7c" stroke-width="1.5"/><path d="M17 21l14 7m-14 0l14-7" stroke="#d1b887" stroke-width="1"/>',
      pine_torch: '<path d="M20 22h9l-2 19h-5z" fill="#765035"/><path d="M24 7c8 6 9 12 4 17-1-5-5-6-7-3-3-4-2-9 3-14z" fill="#e16a31"/><path d="M24 13c3 3 3 6 1 9-1-3-3-3-4-1-1-2 0-5 3-8z" fill="#f2ce68"/>',
      red_ribbon: '<path d="M7 31c8-13 15 9 23-3 4-6 8-8 12-5-8 1-10 15-18 14-7-1-10-12-17-1z" fill="#b9312d"/><path d="M10 34c8-4 15 3 23-2" stroke="#e7b95e" stroke-width="2" fill="none"/>'
    };
    return `<svg class="relic-art" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#23160e" stroke="#ecc771" stroke-width="1.5"/>${arts[id] || '<path d="M24 10l4 10 11 1-8 7 2 11-9-5-9 5 2-11-8-7 11-1z" fill="#d2a955"/>'}</svg>`;
  }
  let topRelicSignature = '\u0000';

  function renderTopRelics() {
    const p = state.player; if (!dom.relicHud) return;
    // 每次 updateMetaBars（120ms）都会调到这里，relics 和联动没变就别重建 SVG
    const signature = (p?.relics || []).join(',') + '#' + (p?.relicSynergies || []).join(',');
    if (signature === topRelicSignature) return;
    topRelicSignature = signature;
    const relics = (p?.relics || []).map((id) => RELICS.find((relic) => relic.id === id)).filter(Boolean);
    const synergyRelics = new Set(RELIC_SYNERGIES.filter((synergy) => (p?.relicSynergies || []).includes(synergy.id)).flatMap((synergy) => synergy.relics));
    dom.relicHud.classList.toggle('hidden', !relics.length);
    dom.relicHud.innerHTML = `<span class="relic-hud-count">信物 ${relics.length}</span>` + relics.map((relic) => `<button class="relic-icon-btn ${synergyRelics.has(relic.id) ? 'synergy' : ''}" type="button" data-hud-relic="${relic.id}" title="${relic.name}" aria-label="${relic.name}：${relic.effect}">${relicArtSvg(relic.id)}</button>`).join('');
  }
  function openRelicDetail(relicId) {
    const p = state.player, relic = RELICS.find((entry) => entry.id === relicId); if (!p || !relic) return;
    const links = RELIC_SYNERGIES.filter((synergy) => synergy.relics.includes(relic.id)).map((synergy) => {
      const active = (p.relicSynergies || []).includes(synergy.id); const others = synergy.relics.filter((id) => id !== relic.id).map((id) => RELICS.find((entry) => entry.id === id)?.name || id);
      return `<div class="relic-synergy-line">${active ? '已激活' : '可联动'}「${synergy.name}」：搭配${others.join('、')}。${synergy.effect}</div>`;
    }).join('');
    dom.relicDetailName.textContent = relic.name;
    dom.relicDetailBody.innerHTML = `<div class="relic-detail-hero"><div class="relic-detail-icon">${relicArtSvg(relic.id)}</div><div><h4>${relic.rarity}信物</h4><div class="relic-effect-highlight"><span>核心效果</span><strong>${relic.effect}</strong></div><p class="relic-lore-short">${relic.desc}</p><div class="relic-tag-row">${(relic.tags || []).map((tag) => `<span class="relic-tag">${tag}</span>`).join('')}</div></div></div>${links || '<div class="relic-synergy-line">暂无组合联动</div>'}`;
    dom.relicDetailOverlay.classList.remove('hidden'); setTimeout(() => dom.relicDetailDone?.focus({ preventScroll: true }), 0);
  }
  function closeRelicDetail() { dom.relicDetailOverlay?.classList.add('hidden'); }
  function renderEquipmentPanel() {
    const p = state.player; if (!p) return;
    if (!Array.isArray(p.equipmentInventory)) p.equipmentInventory = [];
    if (!Array.isArray(p.equippedEquipment)) p.equippedEquipment = [];
    p.materials = p.materials || {};
    const limit = equipmentSlotLimit(p), equipped = p.equippedEquipment.map((uid) => equipmentUnitById(uid)).filter(Boolean);
    if (!selectedEquipmentUid || !equipmentUnitById(selectedEquipmentUid)) selectedEquipmentUid = equipped[0]?.uid || p.equipmentInventory[0]?.uid || null;
    const steel = p.materials.tempered_steel || 0, parts = p.materials.machined_parts || 0;
    dom.equipmentSummary.innerHTML = `军备槽 <strong>${equipped.length} / ${limit}</strong><br><span class="equipment-material-line">精炼钢料 <b>${steel}</b> · 精密机件 <b>${parts}</b> · 军功 <b>${Math.round(p.merit || 0)}</b></span>`;
    dom.equipmentSlots.innerHTML = Array.from({ length: limit }, (_, index) => { const unit = equipped[index], item = unit ? equipmentById(unit.itemId) : null; return `<div class="equipment-slot ${item ? 'filled' : ''}"><span>军备槽 ${index + 1}</span><strong>${item ? `${item.icon} ${item.name} <em>Lv.${unit.level || 1}</em>` : '空槽'}</strong></div>`; }).join('');
    dom.equipmentInventory.innerHTML = p.equipmentInventory.length ? p.equipmentInventory.map((unit) => { const item = equipmentById(unit.itemId); if (!item) return ''; const isEquipped = p.equippedEquipment.includes(unit.uid), level = unit.level || 1; return `<button class="equipment-item-card ${isEquipped ? 'equipped' : ''} ${selectedEquipmentUid === unit.uid ? 'selected' : ''}" type="button" data-equipment-uid="${unit.uid}"><strong>${item.icon} ${item.name} <em>Lv.${level}</em></strong><span>${EQUIPMENT_RARITIES[item.rarity].name} · ${item.category}${isEquipped ? ' · 已装备' : ''}</span><small>${item.effects.map((effect) => `${effect.label} ${effect.value}${level > 1 ? ` × ${level}` : ''}`).join(' · ')}</small></button>`; }).join('') : '<div class="buff-empty">还没有获得军备。军需站、宝箱、精英和 NPC 都可能提供。</div>';
    const selected = equipmentUnitById(selectedEquipmentUid), item = selected ? equipmentById(selected.itemId) : null;
    if (item) {
      const isEquipped = p.equippedEquipment.includes(selected.uid), level = selected.level || 1, upgrade = equipmentUpgradeInfo(selected);
      const material = MATERIALS[upgrade.materialId], owned = p.materials[upgrade.materialId] || 0;
      dom.equipmentDetail.innerHTML = `<strong>${item.name} · Lv.${level}</strong> <span class="rarity-${item.rarity}">${EQUIPMENT_RARITIES[item.rarity].name}</span><div class="equipment-effect-highlight"><span>装备效果</span><strong>${item.effects.map((effect) => `${effect.label} ${effect.value}${level > 1 ? ` × ${level}` : ''}`).join(' · ')}</strong></div><p class="equipment-lore-short">${item.desc}</p><small>${isEquipped ? '占用 1 个军备槽' : `槽位 ${equipped.length} / ${limit}`}${upgrade.maxed ? ' · 已满级' : ` · 强化：${material.name} ${upgrade.materialAmount} + 军功 ${upgrade.merit}（持有 ${owned}）`}</small>`;
      dom.equipmentEquip.disabled = false; dom.equipmentEquip.textContent = isEquipped ? '卸下军备' : '装备军备';
      dom.equipmentUpgrade.disabled = upgrade.maxed || owned < upgrade.materialAmount || (p.merit || 0) < upgrade.merit;
      dom.equipmentUpgrade.textContent = upgrade.maxed ? '已强化至上限' : `强化至 Lv.${upgrade.nextLevel}`;
    } else {
      dom.equipmentDetail.innerHTML = '选择一件军备查看效果。';
      dom.equipmentEquip.disabled = true; dom.equipmentEquip.textContent = '装备军备';
      dom.equipmentUpgrade.disabled = true; dom.equipmentUpgrade.textContent = '强化军备';
    }
    dom.growthToggle?.classList.toggle('hidden', !state.player);
    dom.equipmentToggle?.classList.toggle('hidden', !state.player);
  }  function openEquipmentPanel() { if (!state.player) return; renderEquipmentPanel(); dom.equipmentOverlay?.classList.remove('hidden'); setTimeout(() => { const target = activeGamepad ? (dom.equipmentInventory?.querySelector('.equipment-item-card.selected') || dom.equipmentInventory?.querySelector('[data-equipment-uid]') || dom.equipmentDone) : dom.equipmentEquip; if (activeGamepad && target) focusGamepadElement(target); else target?.focus({ preventScroll: true }); }, 0); }
  function closeEquipmentPanel() { dom.equipmentOverlay?.classList.add('hidden'); }
  function toggleSelectedEquipment() {
    const p = state.player, unit = equipmentUnitById(selectedEquipmentUid); if (!p || !unit) return;
    if (p.equippedEquipment.includes(unit.uid)) unequipEquipmentUnit(unit.uid); else equipEquipmentUnit(unit.uid);
    renderEquipmentPanel();
  }
  function renderGrowthPanel() {
    const p = state.player; if (!p) return;
    p.talents = p.talents || [];
    const points = talentPoints(p);
    const spent = p.talentSpent || 0;
    dom.growthSummary.textContent = `Lv.${p.level} · 可用天赋点 ${points} · 已用 ${spent}`;
    const comboGuides = [
      { icon: '锋', name: '五式连锋', input: '连续轻攻击', desc: Object.values(PLAYER_COMBO_PROFILES).map((profile) => profile.short).join(' → ') },
      { icon: '闪', name: '闪避反击', input: '闪开后攻击', desc: PLAYER_COUNTER_PROFILES.dodge.map((profile) => profile.name).join(' → ') },
      { icon: '守', name: '守势反击', input: '格挡后攻击', desc: PLAYER_COUNTER_PROFILES.guard.map((profile) => profile.name).join(' → ') },
      { icon: '刺', name: '识破', input: '敌将突刺时闪避', desc: '大幅削减敌方架势' },
      { icon: '铳', name: '射击', input: '射击键', desc: '远程补伤 · 子弹可挡可闪' }
    ];
    dom.growthCombos.innerHTML = `<h3 class="growth-section-title">基础招式与连招</h3><div class="growth-combo-grid">${comboGuides.map((combo) => `<article class="growth-combo-card"><b>${combo.icon} ${combo.name}</b><span>${combo.input}</span><p>${combo.desc}</p></article>`).join('')}</div>`;
    const learned = (p.techniques || []).map((id) => PLAYER_TECHNIQUES[id]).filter(Boolean);
    dom.growthTechniques.innerHTML = `<h3 class="growth-section-title">已学变招 <small>${learned.length} / ${Object.keys(PLAYER_TECHNIQUES).length}</small></h3>${learned.length ? `<div class="growth-technique-list">${learned.map((technique) => `<article class="growth-technique-card"><b>${technique.name}</b><span>${technique.input}</span><p>${technique.desc}</p></article>`).join('')}</div>` : '<div class="buff-empty">还没有习得额外变招，继续战斗与探索可以获得。</div>'}`;
    const branches = [...new Set(TALENT_TREE.map((node) => node.branch))];
    dom.talentTree.innerHTML = branches.map((branch) => `<section class="talent-branch"><h4>${branch}</h4>${TALENT_TREE.filter((node) => node.branch === branch).sort((a, b) => a.tier - b.tier).map((node) => { const learnedNode = p.talents.includes(node.id); const can = talentCanUnlock(node, p); return `<button type="button" data-talent-id="${node.id}" class="talent-node ${learnedNode ? 'learned' : can ? '' : 'locked'} ${selectedTalentId === node.id ? 'selected' : ''}"><strong>${node.icon} ${node.name}</strong><small>${node.effect}</small><em>${learnedNode ? '已点亮' : `${node.cost} 点${node.requires.length ? ' · 有前置' : ''}`}</em></button>`; }).join('')}</section>`).join('');
    if (!selectedTalentId) selectedTalentId = TALENT_TREE[0]?.id || null;
    const node = TALENT_TREE.find((entry) => entry.id === selectedTalentId);
    if (node) { const learnedNode = p.talents.includes(node.id), can = talentCanUnlock(node, p); dom.talentDetail.innerHTML = `<strong>${node.icon} ${node.name}</strong> · ${node.branch} ${node.tier} 层<p class="talent-description">${node.desc}</p><div class="talent-effect-highlight"><span>天赋效果</span><strong>${node.effect}</strong></div><small>${learnedNode ? '已点亮' : can ? `消耗 ${node.cost} 点` : node.requires.some((id) => !p.talents.includes(id)) ? '需要前置天赋' : `需要 ${node.cost} 点`}</small>`; dom.talentConfirm.disabled = learnedNode || !can; dom.talentConfirm.textContent = learnedNode ? '已学会' : '学习天赋'; } else { dom.talentDetail.textContent = '选择一项天赋。'; dom.talentConfirm.disabled = true; }
  }
  function openGrowthPanel() { if (!state.player) return; renderGrowthPanel(); dom.growthOverlay?.classList.remove('hidden'); setTimeout(() => { const activeTalent = dom.talentTree?.querySelector('.talent-node.selected') || dom.talentTree?.querySelector('[data-talent-id]'); if (activeGamepad && activeTalent) focusGamepadElement(activeTalent); else dom.talentConfirm?.focus({ preventScroll: true }); }, 0); }
  function closeGrowthPanel() { dom.growthOverlay?.classList.add('hidden'); }
  function npcById(id) { return NPC_DEFINITIONS.find((npc) => npc.id === id) || null; }
  function currentNpcSpawn() { return (state.singleMap?.npcs || []).find((npc) => npc.npcId === currentNpcId) || null; }
  function npcQuestState(player, npc) { return npc?.quest?.id ? (player?.npcQuests?.[npc.quest.id] || 'available') : 'none'; }
  function npcQuestObjectiveMet(npc) {
    const map = state.singleMap;
    if (!map || !npc?.quest?.id) return false;
    if (npc.quest.id === 'hunter_elite') return map.rooms.some((room) => room.region === 0 && room.type === 'elite' && map.cleared.includes(room.id));
    if (['ferry_chest', 'ferry_boat_chest', 'ferryman_chest'].includes(npc.quest.id)) return (map.chestsOpened || []).some((entry) => entry.region === 1);
    if (npc.quest.id === 'guide_relays') return !!map.puzzleSolved?.[2];
    return false;
  }
  function revealHiddenVaultForMap(map) {
    if (!map) return false;
    const path = (map.paths || []).find((entry) => entry.id === 'vault-path-master');
    const door = (map.doors || []).find((entry) => entry.id === 'door-master');
    const chest = (map.chests || []).find((entry) => entry.id === 'chest-master');
    if (!path || !door || !chest) return false;
    const newlyRevealed = !path.revealed || !door.revealed;
    path.revealed = true; door.revealed = true; chest.revealed = true;
    map.hiddenMapUnlocked = true;
    map.charts[2] = true;
    return newlyRevealed;
  }
  function unlockHiddenAreaForMap(map, region, options = {}) {
    if (!map || !Number.isInteger(region) || region < 0 || region >= (map.regionCount || map.charts?.length || 3)) return false;
    if (!Array.isArray(map.hiddenAreas) || map.hiddenAreas.length !== (map.regionCount || 3)) map.hiddenAreas = Array.from({ length: map.regionCount || 3 }, (_, index) => !!map.hiddenAreas?.[index]);
    const alreadyUnlocked = !!map.hiddenAreas[region];
    map.hiddenAreas[region] = true;
    map.charts[region] = true;
    const secret = (map.interactions || []).find((item) => item.id === `secret-${region}`);
    if (secret && options.openEntrance !== false) {
      secret.solved = true;
      const path = (map.paths || []).find((item) => item.id === (secret.targetPathId || `secret-path-${region}`));
      if (path) path.open = true;
      const transition = (map.transitions || []).find((item) => item.id === (secret.targetTransitionId || `hidden-entry-${region}`));
      if (transition) transition.discovered = true;
    }
    (map.chests || []).filter((chest) => chest.hiddenArea && chest.region === region).forEach((chest) => { chest.revealed = true; });
    (map.doors || []).filter((door) => door.secretGate && door.region === region).forEach((door) => { door.revealed = true; });
    (map.nodes || []).filter((node) => node.hiddenArea && node.region === region && node.type === 'cache').forEach((node) => { const chest = (map.chests || []).find((entry) => entry.id === node.chestId); if (chest) chest.revealed = true; });
    if (region === 2 && options.revealMaster) revealHiddenVaultForMap(map);
    return !alreadyUnlocked;
  }
  function npcQuestRewardDescription(npc) {
    const reward = npc?.quest?.reward || {}, parts = [];
    if (reward.keyId && KEYS[reward.keyId]) parts.push(KEYS[reward.keyId].name);
    if (reward.equipmentRarity) parts.push(`${EQUIPMENT_RARITIES[reward.equipmentRarity]?.name || '稀有'}军备`);
    if (reward.equipmentSlot) parts.push('额外军备槽');
    return parts.join('、') || '行军补给';
  }
  function npcUsedFlag(npc, kind) {
    const records = state.player?.npcRumors || {};
    return records[npc.id] === true || records[`${npc.id}:${kind}`] === true;
  }
  function renderNpcPanel() {
    const npc = npcById(currentNpcId), p = state.player, spawn = currentNpcSpawn();
    if (!npc || !p || !spawn) return;
    const region = spawn.region;
    dom.npcKicker.textContent = `${SINGLE_REGIONS[region].name} · ${npc.role}`;
    dom.npcTitle.textContent = `${npc.icon} ${npc.name}`;
    dom.npcDialogue.textContent = npc.greeting;
    const status = [];
    const questState = npcQuestState(p, npc);
    if (npc.quest) status.push(`委托：${questState === 'complete' ? '已完成' : questState === 'active' ? (npcQuestObjectiveMet(npc) ? '可以领取' : '进行中') : '可以接取'}`);
    if (npc.trade && spawn.stockItemId) status.push(`军备：${EQUIPMENT_ITEMS.find((item) => item.id === spawn.stockItemId)?.name || '一件旧军备'}`);
    if (npc.keyTrade) status.push(`钥匙：${KEYS[spawn.keyId || npc.keyTrade.keyId]?.name || '当地暗门钥匙'}`);
    if (npc.intel) status.push('情报：区域图与宝箱位置');
    if (npc.hiddenRoute) status.push('知道一条地图上没有的暗渠入口');
    if (npc.heal) status.push(`处理伤情：军功 ${npc.heal.cost}`);
    dom.npcStatus.innerHTML = status.map((item) => `<span>${item}</span>`).join('');
    const options = [];
    if (npc.quest) {
      const questLabel = questState === 'available' ? '接取委托' : questState === 'active' ? (npcQuestObjectiveMet(npc) ? '领取委托报酬' : '委托仍在进行') : '委托已完成';
      const questDesc = questState === 'available' ? `目标：${npc.quest.objective} · 奖励：${npcQuestRewardDescription(npc)}` : questState === 'active' ? (npcQuestObjectiveMet(npc) ? `领取：${npcQuestRewardDescription(npc)}` : `未完成：${npc.quest.objective}`) : '';
      options.push(`<button class="npc-option" type="button" data-npc-action="quest" ${questState === 'complete' || (questState === 'active' && !npcQuestObjectiveMet(npc)) ? 'disabled' : ''}><strong>${questLabel}</strong><small>${questDesc}</small></button>`);
    }
    if (npc.trade && spawn.stockItemId) {
      const item = EQUIPMENT_ITEMS.find((entry) => entry.id === spawn.stockItemId), used = !!p.npcTrades?.[npc.id]?.equipment, cost = npc.trade.costByRegion?.[region] || npc.trade.cost || 42;
      options.push(`<button class="npc-option" type="button" data-npc-action="trade" ${used ? 'disabled' : ''}><strong>${used ? '军备已售出' : `获得 ${item?.name || '军备'}`}</strong>${used ? '' : `<small>${item?.effects?.map((effect) => `${effect.label} ${effect.value}`).join(' · ') || '队伍属性提升'} · 军功 -${cost}</small>`}</button>`);
    }
    if (npc.keyTrade) {
      const keyId = spawn.keyId || npc.keyTrade.keyId, key = KEYS[keyId], used = !!p.npcTrades?.[npc.id]?.key;
      options.push(`<button class="npc-option" type="button" data-npc-action="key" ${used ? 'disabled' : ''}><strong>${used ? '钥匙已售出' : `获得 ${key?.name || '旧钥匙'}`}</strong>${used ? '' : `<small>开启对应暗门 · 军功 -${npc.keyTrade.cost || 30}</small>`}</button>`);
    }
    if (npc.intel) {
      const used = npcUsedFlag(npc, 'intel');
      options.push(`<button class="npc-option" type="button" data-npc-action="intel" ${used ? 'disabled' : ''}><strong>${used ? '情报已记下' : '获得区域图'}</strong>${used ? '' : '<small>补全本区地图 · 标出宝箱</small>'}</button>`);
    }
    if (npc.hiddenRoute) {
      const used = npcUsedFlag(npc, 'hidden'), regionLocked = !state.singleMap?.hiddenAreas?.[region];
      options.push(`<button class="npc-option" type="button" data-npc-action="hidden" ${used ? 'disabled' : ''}><strong>${used ? '藏路已标注' : '获得暗渠路线'}</strong>${used ? '' : `<small>${regionLocked ? '标出入口、军资与返回竖井' : '复核暗渠路线'}</small>`}</button>`);
    }
    if (npc.heal) {
      const used = npcUsedFlag(npc, 'heal');
      options.push(`<button class="npc-option" type="button" data-npc-action="heal" ${used ? 'disabled' : ''}><strong>${used ? '伤情已经处理' : '恢复队伍兵力'}</strong>${used ? '' : `<small>军功 -${npc.heal.cost}</small>`}</button>`);
    }
    options.push('<button class="npc-option" type="button" data-npc-action="leave"><strong>结束交谈</strong></button>');
    dom.npcOptions.innerHTML = options.join('');
  }
  function openNpcPanel(npcId) { const npc = npcById(npcId); if (!npc) return; currentNpcId = npc.id; const spawn = currentNpcSpawn(); state.npcPanelOpen = true; renderNpcPanel(); dom.npcOverlay?.classList.remove('hidden'); setTimeout(() => dom.npcOptions?.querySelector('button')?.focus({ preventScroll: true }), 0); if (spawn && !spawn.clueGiven) { spawn.talked = true; spawn.clueGiven = true; setTimeout(() => grantStoryClue(NPC_CLUE_IDS[npc.id], { source: '与老乡交谈' }), 80); } }
  function closeNpcPanel() { state.npcPanelOpen = false; currentNpcId = null; dom.npcOverlay?.classList.add('hidden'); }
  function grantNpcQuestReward(npc, p) {
    const reward = npc?.quest?.reward || {};
    if (reward.keyId) grantKey(p, reward.keyId, { source: 'NPC委托奖励' });
    if (reward.materialId) grantMaterial(p, reward.materialId, reward.materialAmount || 1, { source: 'NPC委托奖励' });
    if (reward.equipmentRarity) { const pool = EQUIPMENT_ITEMS.filter((item) => item.rarity === reward.equipmentRarity); if (pool.length) { const item = choice(state.rng, pool); acquireEquipment(p, item.id, { source: 'NPC委托奖励', autoEquip: true }); } }
    if (reward.equipmentSlot) { p.bonusEquipmentSlots = Math.min(3, (p.bonusEquipmentSlots || 0) + 1); queueAcquisition({ type: 'slot', kicker: '军备扩充', name: '军备挂点', icon: '架', meta: '委托奖励', desc: '委托带来的额外装备挂点。', effects: [`当前军备上限 ${equipmentSlotLimit(p)}（全局上限 4）`], note: '军备栏不会无上限扩张。' }); }
  }
  function handleNpcAction(action) {
    const npc = npcById(currentNpcId), spawn = currentNpcSpawn(), p = state.player;
    if (!npc || !p || !spawn) return;
    p.npcQuests = p.npcQuests || {}; p.npcTrades = p.npcTrades || {}; p.npcRumors = p.npcRumors || {};
    if (action === 'leave') { closeNpcPanel(); return; }
    if (action === 'quest' && npc.quest) {
      const stateValue = npcQuestState(p, npc);
      if (stateValue === 'available') { p.npcQuests[npc.quest.id] = 'active'; showToast(`已接取委托：${npc.quest.title}`); saveCurrentRun('map'); renderNpcPanel(); return; }
      if (stateValue === 'active' && npcQuestObjectiveMet(npc)) { p.npcQuests[npc.quest.id] = 'complete'; grantNpcQuestReward(npc, p); showToast(`委托完成：${npc.quest.title}`); updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return; }
      showToast('委托目标还没有完成。'); return;
    }
    if (action === 'trade' && npc.trade) {
      const itemId = spawn.stockItemId, cost = npc.trade.costByRegion?.[spawn.region] || npc.trade.cost || 42;
      if (p.npcTrades[npc.id]?.equipment) { showToast('这件军备已经售出。'); return; }
      if ((p.merit || 0) < cost) { showToast('军功不足，无法交易。'); return; }
      p.merit -= cost; p.npcTrades[npc.id] = { ...(p.npcTrades[npc.id] || {}), equipment: true };
      acquireEquipment(p, itemId, { source: '军需货郎', autoEquip: true });
      updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return;
    }
    if (action === 'key' && npc.keyTrade) {
      const keyId = spawn.keyId || npc.keyTrade.keyId, cost = npc.keyTrade.cost || 30;
      if (p.npcTrades[npc.id]?.key) { showToast('这把钥匙已经售出。'); return; }
      if ((p.merit || 0) < cost) { showToast('军功不足，无法交易。'); return; }
      p.merit -= cost; p.npcTrades[npc.id] = { ...(p.npcTrades[npc.id] || {}), key: true };
      grantKey(p, keyId, { source: '钥匙交易' });
      updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return;
    }
    if (action === 'intel' && npc.intel) {
      if (npcUsedFlag(npc, 'intel')) { showToast('这份情报已经记下。'); return; }
      p.npcRumors[`${npc.id}:intel`] = true;
      const map = state.singleMap, revealed = [];
      if (map) {
        (spawn.intelCharts || [spawn.region]).forEach((region) => { map.charts[region] = true; revealed.push(SINGLE_REGIONS[region].name); });
        if (spawn.revealChests) (map.chests || []).filter((chest) => chest.region === spawn.region && (!chest.hiddenArea || map.hiddenAreas?.[spawn.region])).forEach((chest) => { chest.revealed = true; });
      }
      queueAcquisition({ type: 'map', kicker: 'NPC指路 · 地图情报', name: '区域路线抄本', icon: '图', meta: '探索情报 · 单次', desc: '只标清这一片区域的路线，不附带交易或委托。', effects: [`补全${[...new Set(revealed)].join('、') || SINGLE_REGIONS[spawn.region].name}区域图`, ...(spawn.revealChests ? ['标记本区域宝箱'] : [])], note: '情报已经记入地图。' });
      updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return;
    }
    if (action === 'hidden' && npc.hiddenRoute) {
      if (npcUsedFlag(npc, 'hidden')) { showToast('藏路已经标在地图上。'); return; }
      p.npcRumors[`${npc.id}:hidden`] = true;
      const newly = unlockHiddenAreaForMap(state.singleMap, spawn.region, { revealMaster: spawn.region === 2 });
      queueAcquisition({ type: 'map', kicker: 'NPC指路 · 隐藏区域', name: '地下暗渠图', icon: '渠', meta: '隐藏地图 · 单次', desc: npc.hiddenRoute.text, effects: [`显露${SINGLE_REGIONS[spawn.region].name}地下暗渠与闸门`, '标出南下入口与返回竖井', ...(spawn.region === 2 ? ['补入高级隐藏军需线'] : [])], note: newly ? '暗渠入口已经标出；走到旧闸门后仍需对应钥匙。' : '这条藏路已经记录。' });
      updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return;
    }
    if (action === 'heal' && npc.heal) {
      if (npcUsedFlag(npc, 'heal')) { showToast('这位郎中已经替队伍处理过伤情。'); return; }
      const cost = npc.heal.cost || 18;
      if ((p.merit || 0) < cost) { showToast('军功不足，无法处理伤情。'); return; }
      p.merit -= cost; p.npcRumors[`${npc.id}:heal`] = true;
      const before = p.hp; p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * (npc.heal.ratio || .24)));
      const gain = Math.max(0, Math.round(p.hp - before));
      queueAcquisition({ type: 'service', kicker: '行军疗伤 · 已支付军功', name: npc.heal.text, icon: '医', meta: `军功 -${cost}`, desc: '郎中重新清理伤口并换好绷带。', effects: [gain ? `兵力 +${gain}` : '兵力已满'], note: '这位郎中只处理一次伤情。' });
      updateMetaBars(); saveCurrentRun('map'); renderNpcPanel(); return;
    }
  }
  let currentBonfireId = null;
  function litBonfires(map = state.singleMap) {
    if (!map) return [];
    return (map.rooms || []).filter((room) => room.type === 'bonfire' && room.lit);
  }
  function restoreAtBonfire(room, source = '星火营火') {
    const p = state.player, map = state.singleMap;
    if (!p || !map || !room) return;
    p.hp = p.maxHp;
    p.posture = 0;
    p.postureBroken = false;
    p.postureBreakUntil = 0;
    p.hitstunUntil = 0;
    p.respawnId = room.id;
    map.respawnId = room.id;
    map.respawnLit = true;
    updateMetaBars();
  }
  function renderBonfirePanel() {
    const map = state.singleMap;
    if (!map || !dom.bonfireList) return;
    const points = litBonfires(map);
    dom.bonfireList.innerHTML = points.map((room) => {
      const current = room.id === map.currentId;
      return `<button class="bonfire-card ${current ? 'current' : ''}" type="button" data-bonfire-id="${room.id}" ${current ? 'disabled' : ''}><strong>✦ ${room.name.split(' · ')[0]}</strong><span>${SINGLE_REGIONS[room.region].name} · ${SINGLE_LAYER_NAMES[room.layer]}</span><small>${current ? '当前所在' : '转移到这里'}</small></button>`;
    }).join('') || '<div class="buff-empty">还没有点亮其他星火营火。</div>';
  }
  function openBonfirePanel(room) {
    const map = state.singleMap;
    if (!map) return;
    currentBonfireId = room?.id || map.currentId;
    renderBonfirePanel();
    dom.bonfireOverlay?.classList.remove('hidden');
    setTimeout(() => {
      const target = dom.bonfireList?.querySelector('[data-bonfire-id]:not([disabled])');
      if (activeGamepad && target) focusGamepadElement(target);
      else target?.focus({ preventScroll: true });
    }, 0);
  }
  function closeBonfirePanel() {
    currentBonfireId = null;
    dom.bonfireOverlay?.classList.add('hidden');
  }
  function travelToBonfire(roomId) {
    const map = state.singleMap, room = singleMapRoom(map, roomId);
    if (!map || !room || !room.lit) return;
    map.player.x = room.x;
    map.player.y = room.y;
    map.player.layer = room.layer;
    map.currentId = room.id;
    map.regionIndex = room.region;
    if (!map.visited.includes(room.id)) map.visited.push(room.id);
    restoreAtBonfire(room, '沿星火归返');
    closeBonfirePanel();
    renderSingleMap();
    showToast(`已抵达 ${room.name.split(' · ')[0]}`);
    saveCurrentRun('map');
  }
  const metaBarsState = { buffs: '\u0000' };

  function updateMetaBars() {
    if (!state.player) return;
    const p = state.player;
    const fighterNames = { scout: '侦察连战士', engineer: '工兵连战士', medic: '卫生队战士', sharpshooter: '神枪排战士', vanguard: '突击排战士', quartermaster: '辎重队战士' };
    setText(dom.partyName, fighterNames[p.squadId] || p.name);
    setText(dom.partyPassive, p.passive);
    const globalHpPercent = clamp(p.hp / Math.max(1, p.maxHp) * 100, 0, 100);
    setText(dom.playerHpText, `${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`);
    setPct(dom.playerHpBar, globalHpPercent);
    setPct(dom.hudHpBar, globalHpPercent);
    const globalHpLabel = `${Math.max(0, Math.ceil(p.hp))}/${p.maxHp}`;
    setText(dom.globalPlayerHpText, globalHpLabel);
    setPct(dom.globalPlayerHpBar, globalHpPercent);
    dom.globalPlayerHud?.classList.toggle('critical', globalHpPercent <= 30);
    dom.globalPlayerHud?.classList.toggle('long-values', globalHpLabel.length > 7);
    const posturePct = clamp((p.posture || 0) / (p.maxPosture || 100) * 100, 0, 100);
    setText(dom.playerPostureText, `${Math.round(p.posture || 0)} / ${p.maxPosture || 100}`);
    setPct(dom.playerPostureBar, posturePct);
    setPct(dom.hudPostureBar, posturePct);
    const criticalPosture = !p.postureBroken && posturePct >= 72;
    dom.hudPostureRow.classList.toggle('broken', !!p.postureBroken);
    dom.hudPostureRow.classList.toggle('critical', criticalPosture);
    setText(dom.hudPostureLabel, p.postureBroken ? '架势崩溃 · 重整中' : criticalPosture ? '架势临界' : '架势');
    dom.playerPostureBar.closest('.posture-stat')?.classList.toggle('broken', !!p.postureBroken);
    dom.playerPostureBar.closest('.posture-stat')?.classList.toggle('critical', criticalPosture);
    if (state.combat) setText(dom.gourdText, state.combat.emergencyUses ?? 0);
    setText(dom.playerAtk, p.atk);
    setText(dom.playerDef, p.defense);
    setText(dom.playerMorale, Math.round(p.morale));
    setText(dom.playerSupply, Math.round(p.supplies));
    setText(dom.playerMerit, Math.round(p.merit || 0));
    setText(dom.routeMerit, Math.round(p.merit || 0));
    setText(dom.metaMerit, String(Math.round(p.merit || 0)));
    dom.meritHud?.classList.remove('hidden');
    setText(dom.playerLevel, p.level);
    setText(dom.playerXpText, `${p.xp} / ${p.xpNext}`);
    setPct(dom.playerXpBar, p.xp / p.xpNext * 100);
    const buffs = [];
    if (p.guard > 0) buffs.push('固守减伤');
    if (p.cooldowns.charge > 0) buffs.push('冲锋号 · 尚未就绪');
    if (p.cooldowns.tactic > 0) buffs.push('穿插 · 尚未就绪');
    // 顶栏信物条和 buff 串都是 innerHTML 整体重建，签名不变就不动
    const buffSignature = buffs.join('|');
    if (buffSignature !== metaBarsState.buffs) {
      metaBarsState.buffs = buffSignature;
      dom.buffList.innerHTML = buffs.map((buff) => `<span class="buff-chip">${buff}</span>`).join('');
    }
    renderTopRelics();
    syncGameplayHeader();
    const availableTalentPoints = talentPoints(p);
    if (dom.growthToggle) {
      dom.growthToggle.title = `可用天赋点 ${availableTalentPoints}`;
      dom.growthToggle.classList.toggle('attention', availableTalentPoints > 0);
    }
    setText(dom.growthEntryMeta, availableTalentPoints > 0 ? `${availableTalentPoints} 点可分配` : `等级 ${p.level} · 天赋树`);
    const equippedCount = p.equippedEquipment?.length || 0;
    const unequippedCount = Math.max(0, (p.equipmentInventory?.length || 0) - equippedCount);
    if (dom.equipmentToggle) {
      dom.equipmentToggle.classList.toggle('attention', unequippedCount > 0);
      dom.equipmentToggle.title = unequippedCount > 0 ? `有 ${unequippedCount} 件军备可更换` : '查看军备栏';
    }
    setText(dom.equipmentEntryMeta, unequippedCount > 0 ? `可更换 · ${unequippedCount}` : `已装备 ${equippedCount} / ${equipmentSlotLimit(p)}`);
    updateQuickItemHud();
    updateEliteHealthHud();
  }

  let singleMapTaskSignature = '';
  let singleMapActionHintSignature = '\u0000';
  let singleMapUiRefreshAt = 0;
  let singleMapFrame = 0;
  let singleMapLastTime = 0;
  let singleMapLastRenderAt = 0;
  let singleMapSaveAt = 0;
  let singleMapWasMoving = false;
  let singleMapPausedRendered = false;
  let singleMapControlsHintTimer = 0;
  const SINGLE_MAP_CONTROLS_HINT_KEY = 'longMarchMapControlsHintSeenV2';

  function maybeShowSingleMapControlsHint() {
    const hint = dom.singleMapControlsHint;
    if (!hint || singleMapControlsHintTimer) return;
    let seen = false;
    try { seen = localStorage.getItem(SINGLE_MAP_CONTROLS_HINT_KEY) === '1'; } catch (_) {}
    if (seen) { hint.classList.add('hidden'); hint.setAttribute('aria-hidden', 'true'); return; }
    hint.classList.remove('hidden', 'show');
    hint.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => hint.classList.add('show'));
    singleMapControlsHintTimer = window.setTimeout(() => {
      hint.classList.remove('show');
      hint.setAttribute('aria-hidden', 'true');
      singleMapControlsHintTimer = 0;
      try { localStorage.setItem(SINGLE_MAP_CONTROLS_HINT_KEY, '1'); } catch (_) {}
      window.setTimeout(() => hint.classList.add('hidden'), 420);
    }, 7600);
  }

  const SINGLE_MAP_LAYOUTS = {
    quick: {
      width: 1760,
      points: [[150, 520], [420, 270], [450, 760], [800, 520], [1200, 520], [520, 1110], [820, 1140], [1090, 1060]],
      mainEdges: [[0, 3], [3, 4]],
      hiddenEdges: [[5, 6], [6, 7]]
    },
    normal: {
      width: 2000,
      points: [[150, 520], [370, 260], [400, 790], [660, 520], [900, 250], [930, 800], [1250, 520], [640, 130], [700, 930], [470, 1150], [800, 1180], [1130, 1080]],
      mainEdges: [[0, 3], [3, 6], [1, 4], [2, 5], [1, 7], [4, 7], [3, 8], [5, 8]],
      hiddenEdges: [[9, 10], [10, 11]]
    }
  };
  const SINGLE_MAP_ENEMY_POOLS = [
    { normal: ['blocker', 'skirmisher', 'gunner'], elite: ['blocker', 'skirmisher', 'gunner'] },
    { normal: ['skirmisher', 'gunner', 'cavalry'], elite: ['daduLancer', 'gunner', 'cavalry'] },
    { normal: ['cold', 'swamp', 'cavalry'], elite: ['frostmarksman', 'bogReaper', 'cold'] },
    { normal: ['swamp', 'cold', 'skirmisher'], elite: ['bogReaper', 'frostmarksman', 'swamp'] },
    { normal: ['cavalry', 'blocker', 'gunner'], elite: ['daduLancer', 'bridgebreaker', 'bogReaper'] }
  ];
  const SINGLE_LAYER_NAMES = ['地表', '崖上层', '河谷下层', '地下暗渠'];
  const SINGLE_LAYER_TRANSITION_SHORT = { stairs_up: '上行', stairs_down: '下行', rope_up: '攀索', rope_down: '下索', crawler: '岩缝', underground_drop: '下渠', shaft_up: '升井', shaft_down: '下井' };
  const SINGLE_LAYER_TRANSITION_LABELS = {
    stairs_up: '沿石阶上行',
    stairs_down: '沿石阶下行',
    rope_up: '攀索上崖',
    rope_down: '顺索下到河谷',
    crawler: '钻过岩缝',
    underground_drop: '进入地下暗渠',
    shaft_up: '沿竖井升回上层',
    shaft_down: '沿竖井下到暗渠'
  };

  const SINGLE_MAP_PALETTES = [
    { ground: '#1a1b14', path: '#4b402c', edge: '#8b7046', fog: 'rgba(32,38,25,.25)', accent: '#d3a854' },
    { ground: '#14201d', path: '#344a43', edge: '#5e8173', fog: 'rgba(35,76,73,.2)', accent: '#8fc1a6' },
    { ground: '#1b2025', path: '#3e4953', edge: '#778796', fog: 'rgba(96,117,132,.16)', accent: '#b8ced8' },
    { ground: '#171318', path: '#42323b', edge: '#7b5a68', fog: 'rgba(74,46,61,.22)', accent: '#c59b76' },
    { ground: '#22251a', path: '#4c5236', edge: '#8b9161', fog: 'rgba(93,104,62,.18)', accent: '#c8c979' },
    { ground: '#281b16', path: '#5b3c2d', edge: '#9d6a4d', fog: 'rgba(135,78,49,.16)', accent: '#e3ac72' }
  ];

  function layerTransitionLabel(kind, side = 'a') {
    if (side === 'a') return SINGLE_LAYER_TRANSITION_LABELS[kind] || '切换地势';
    const reverse = { stairs_up: 'stairs_down', stairs_down: 'stairs_up', rope_up: 'rope_down', rope_down: 'rope_up', crawler: 'crawler', underground_drop: 'shaft_up', shaft_up: 'underground_drop', shaft_down: 'shaft_up' };
    return SINGLE_LAYER_TRANSITION_LABELS[reverse[kind] || kind] || '切换地势';
  }
  function mapSegmentDistance(x, y, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy || 1;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / lengthSq, 0, 1);
    return Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t));
  }
  function singleMapBlockedBy(map, edge) {
    if (!map || !edge) return null;
    if (edge.requiresRegionBoss && edge.bossRoomId && !map.cleared?.includes(edge.bossRoomId)) return edge.bossRoomId;
    if (edge.blockedByRoomId && !map.cleared?.includes(edge.blockedByRoomId)) return edge.blockedByRoomId;
    return null;
  }
  function singleMapBlockerName(map, roomId) {
    const room = singleMapRoom(map, roomId);
    if (!room) return '拦路敌军';
    if (room.enemy?.boss) return room.bossTitle || room.name.split(' · ')[0] || '首领';
    if (room.enemy?.elite) return ELITE_VARIANTS[room.enemy.typeId]?.name || ENEMY_TYPES[room.enemy.typeId]?.name || room.name.split(' · ')[0] || '精英';
    return ENEMY_TYPES[room.enemy?.typeId]?.name || room.name.split(' · ')[0] || '拦路敌军';
  }
  function organicPathPoints(a, b, bend = 0) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length, ny = dx / length;
    const cx = (a.x + b.x) / 2 + nx * bend;
    const cy = (a.y + b.y) / 2 + ny * bend;
    const points = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const it = 1 - t;
      points.push({ x: it * it * a.x + 2 * it * t * cx + t * t * b.x, y: it * it * a.y + 2 * it * t * cy + t * t * b.y });
    }
    return points;
  }
  function nodeHasEnemy(node) {
    return ['battle', 'elite', 'boss'].includes(node?.type) && node.enemy;
  }
  function mapPickupDetectRadius(pickup, player) {
    return (pickup.kind === 'chart' ? 132 : 105) + Math.min(130, (player.relicMapReveal || 220) * .22);
  }
  function mapPickupInteractRadius(pickup) {
    return pickup.kind === 'chart' ? 66 : 52;
  }
  function appendMasterVault(map) {
    if (!map) return null;
    map.paths = map.paths || []; map.doors = map.doors || []; map.chests = map.chests || [];
    if (map.paths.some((path) => path.id === 'vault-path-master')) return map;
    const anchors = (map.nodes || []).filter((node) => node.region === 2 && !node.hiddenArea && !['entry', 'exit', 'boss', 'cache'].includes(node.type));
    const anchor = choice(state.rng, anchors.length ? anchors : (map.nodes || []).filter((node) => node.region === 2 && !node.hiddenArea));
    if (!anchor) return map;
    const roomObstacles = (map.nodes || []).filter((node) => node.region === 2 && node.layer === anchor.layer && !['entry', 'exit'].includes(node.type));
    const vaultCandidates = Array.from({ length: 28 }, () => {
      const angle = state.rng() * Math.PI * 2, distance = 430 + state.rng() * 150;
      const chestPoint = { x: anchor.x + Math.cos(angle) * distance, y: anchor.y + Math.sin(angle) * distance };
      const points = organicPathPoints(anchor, chestPoint, (state.rng() - .5) * 170);
      const doorPoint = points[Math.floor(points.length * .55)];
      const doorClearance = roomObstacles.reduce((minimum, room) => Math.min(minimum, Math.hypot(doorPoint.x - room.x, doorPoint.y - room.y) - room.r * .72 - 66 - 16), Infinity);
      const routeClearance = points.slice(3, -3).reduce((minimum, point) => Math.min(minimum, roomObstacles.reduce((value, room) => Math.min(value, Math.hypot(point.x - room.x, point.y - room.y) - room.r - 32), Infinity)), Infinity);
      return { chestPoint, points, doorPoint, clearance: Math.min(doorClearance, routeClearance) };
    });
    const vaultPlan = vaultCandidates.find((candidate) => candidate.clearance >= 0) || vaultCandidates.sort((a, b) => b.clearance - a.clearance)[0];
    const chestPoint = vaultPlan.chestPoint, points = vaultPlan.points, doorPoint = vaultPlan.doorPoint;
    map.paths.push({ id: 'vault-path-master', region: 2, layer: anchor.layer, from: anchor.id, to: 'chest-master', points, width: 72, gate: false, secret: true, open: true, hidden: true, revealed: false, doorId: 'door-master' });
    map.doors.push({ id: 'door-master', region: 2, layer: anchor.layer, x: doorPoint.x, y: doorPoint.y, keyId: 'master_key', open: false, pathId: 'vault-path-master', revealed: false, hidden: true, master: true });
    map.chests.push({ id: 'chest-master', region: 2, layer: anchor.layer, x: chestPoint.x, y: chestPoint.y, tier: 4, opened: false, revealed: false, doorId: 'door-master', pathId: 'vault-path-master', hidden: true, masterVault: true });
    if (map.bounds) { map.bounds.minX = Math.min(map.bounds.minX, chestPoint.x - 190); map.bounds.maxX = Math.max(map.bounds.maxX, chestPoint.x + 190); map.bounds.minY = Math.min(map.bounds.minY, chestPoint.y - 170); map.bounds.maxY = Math.max(map.bounds.maxY, chestPoint.y + 170); }
    map.hiddenMapUnlocked = !!map.hiddenMapUnlocked;
    return map;
  }
  const SINGLE_MAP_BOSS_PLANS = [
    { typeId: 'bridgebreaker', title: '云岭断桥手', scale: .72, trait: '重刀与后撤横劈', counter: '看清后撤步后的回身横劈，再压架势。', intro: '他把断桥铁索拖在脚边。想过云岭，先从我这里踏过去。' },
    { typeId: 'daduLancer', title: '黔北回马枪', scale: .76, trait: '回马突刺与快慢连击', counter: '枪尖压低时闪避或弹反，别追进回马枪的直线。', intro: '枪尖在雨中一点。熟知这条山路的，不只你们。' },
    { typeId: 'frostmarksman', title: '雪岭封锁者', scale: .82, trait: '远程冷枪与近身枪托', counter: '枪线锁定先横移，逼近后提防枪托。', intro: '风雪里传来拉栓声。这道雪线，不允许任何人越过。' },
    { typeId: 'bogReaper', title: '草地索命客', scale: .88, trait: '泥沼多段快刀', counter: '稳住架势，等整套乱刃结束再追刀。', intro: '草叶下伸出刀锋。脚下每一步，都是我的伏击线。' },
    { typeId: 'boss', title: '会师封锁线', scale: 1.3, trait: '远近混合与狂暴连段', counter: '保住架势，抓住收招再处决。', intro: '最后一道封锁横在会师路上。红军走到这里，已经不是一支孤军。' }
  ];

  const HIDDEN_AREA_TEMPLATES = [
    { id: 'grain', title: '沉粮暗渠', names: ['断粮守兵', '沉粮军仓', '废闸火塘'], types: ['elite', 'cache', 'bonfire'], offsets: [[-210, -70], [20, 25], [230, 105]], accent: '#c99c61' },
    { id: 'relay', title: '断线地道', names: ['护线残兵', '断线军箱', '旧报务室'], types: ['battle', 'cache', 'event'], offsets: [[-235, 85], [-15, -55], [205, 70]], accent: '#8fb5b3' },
    { id: 'ferry', title: '地下渡槽', names: ['守槽伏兵', '渡槽暗仓', '旧绞盘室'], types: ['elite', 'cache', 'camp'], offsets: [[-225, -35], [0, 90], [225, -65]], accent: '#7ea3b6' },
    { id: 'ice', title: '冰裂暖渠', names: ['冰下哨兵', '暖渠物资', '融冰火点'], types: ['battle', 'cache', 'bonfire'], offsets: [[-205, -105], [35, -20], [210, 135]], accent: '#b9cbd4' },
    { id: 'mine', title: '旧矿支道', names: ['矿道残敌', '矿车军箱', '塌方岔口'], types: ['elite', 'cache', 'event'], offsets: [[-180, 120], [20, -95], [235, 20]], accent: '#b58966' }
  ];

  function generateSingleMap(pace, separationAttempt = 0) {
    const longRun = pace === 'normal';
    const quick = !longRun;
    const regionCount = longRun ? 5 : 3;
    const finalRegion = regionCount - 1;
    const layout = SINGLE_MAP_LAYOUTS.normal;
    const regionY = [0, -130, 130, -55, 70];
    const nodeTypes = longRun
      ? ['entry', 'battle', 'event', 'bonfire', 'elite', 'event', 'exit', 'battle', 'event', 'elite', 'cache', 'bonfire']
      : ['entry', 'battle', 'event', 'camp', 'elite', 'event', 'exit', 'battle', 'event', 'elite', 'cache', 'camp'];
    const nodeLayers = [0, 1, 2, 0, 1, 2, 0, 1, 2, 3, 3, 3];
    const exitIndex = 6;
    const hiddenStart = 9;
    const hiddenCacheIndex = 10;
    const hiddenEnd = 11;
    const nodes = [], paths = [], pickups = [], interactions = [], transitions = [], doors = [], chests = [], npcs = [], traps = [];
    const hiddenTemplateDeck = shuffle(state.rng, HIDDEN_AREA_TEMPLATES);
    const hiddenTemplates = Array.from({ length: regionCount }, (_, index) => hiddenTemplateDeck[index % hiddenTemplateDeck.length]);
    const randomOffset = (min = 54, max = 96) => { const angle = state.rng() * Math.PI * 2, radius = min + state.rng() * (max - min); return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }; };

    for (let region = 0; region < regionCount; region++) {
      const baseX = region * layout.width;
      layout.points.forEach(([lx, ly], local) => {
        const hiddenArea = local >= hiddenStart;
        const hiddenTemplate = hiddenTemplates[region];
        let type = nodeTypes[local];
        if (hiddenArea) { type = hiddenTemplate.types[local - hiddenStart] || 'battle'; if (quick && type === 'bonfire') type = 'camp'; }
        if (local === exitIndex && (longRun || region === finalRegion)) type = 'boss';
        const hiddenCenter = layout.points[hiddenCacheIndex];
        const hiddenOffset = hiddenArea ? (hiddenTemplate.offsets[local - hiddenStart] || [0, 0]) : [0, 0];
        const layer = nodeLayers[local], x = hiddenArea ? baseX + hiddenCenter[0] + hiddenOffset[0] : baseX + lx, y = hiddenArea ? hiddenCenter[1] + regionY[region] + hiddenOffset[1] : ly + regionY[region], info = SINGLE_ROOM_INFO[type];
        const bossPlan = SINGLE_MAP_BOSS_PLANS[Math.min(region, SINGLE_MAP_BOSS_PLANS.length - 1)];
        let enemy = null;
        if (type === 'battle') enemy = { typeId: choice(state.rng, SINGLE_MAP_ENEMY_POOLS[region].normal), elite: false, boss: false };
        if (type === 'elite') enemy = { typeId: choice(state.rng, SINGLE_MAP_ENEMY_POOLS[region].elite), elite: true, boss: false };
        if (type === 'boss') enemy = { typeId: bossPlan.typeId, elite: false, boss: true };
        const nodeName = hiddenArea ? `${hiddenTemplate.names[local - hiddenStart] || info.name} · ${hiddenTemplate.title}` : `${type === 'boss' ? bossPlan.title : info.name} · ${SINGLE_REGIONS[region].name}`;
        nodes.push({ id: `map-${region}-${local}`, region, local, layer, type, x, y, r: type === 'boss' ? 118 : type === 'cache' ? 96 : 106, name: nodeName, desc: type === 'boss' ? `${bossPlan.trait}。${bossPlan.counter}` : info.desc, enemy, hiddenArea, hiddenTheme: hiddenArea ? hiddenTemplate.id : null, hiddenAccent: hiddenArea ? hiddenTemplate.accent : null, chestId: type === 'cache' ? `hidden-chest-${region}` : null, bossTitle: type === 'boss' ? bossPlan.title : null, bossTrait: type === 'boss' ? bossPlan.trait : null, bossCounter: type === 'boss' ? bossPlan.counter : null, bossScale: type === 'boss' ? bossPlan.scale : 1, bossIntro: type === 'boss' ? bossPlan.intro : null, lit: type === 'bonfire' ? false : undefined });
      });
    }
    const node = (region, local) => nodes.find((entry) => entry.region === region && entry.local === local);

    for (let region = 0; region < regionCount; region++) {
      layout.mainEdges.forEach(([aIndex, bIndex], edgeIndex) => {
        const a = node(region, aIndex), b = node(region, bIndex);
        if (!a || !b || a.layer !== b.layer) return;
        paths.push({ id: `path-${region}-${edgeIndex}`, region, layer: a.layer, from: a.id, to: b.id, points: organicPathPoints(a, b, (state.rng() - .5) * 160), width: 108, gate: false, secret: false, open: true, hiddenArea: false });
      });
      layout.hiddenEdges.forEach(([aIndex, bIndex], edgeIndex) => {
        const a = node(region, aIndex), b = node(region, bIndex);
        paths.push({ id: `hidden-path-${region}-${edgeIndex}`, region, layer: a.layer, from: a.id, to: b.id, points: organicPathPoints(a, b, (state.rng() - .5) * 110), width: 80, gate: false, secret: false, open: true, hiddenArea: true });
      });
      if (region < regionCount - 1) {
        const a = node(region, exitIndex), b = node(region + 1, 0);
        paths.push({ id: `region-path-${region}`, region, layer: 0, from: a.id, to: b.id, points: organicPathPoints(a, b, 100), width: 90, gate: true, secret: false, open: true, hiddenArea: false, requiresRegionBoss: longRun, bossRoomId: longRun ? a.id : null });
      }
      const mainElite = node(region, 4), regionExit = node(region, exitIndex);
      if (mainElite?.type === 'elite') {
        paths.filter((path) => path.region === region && !path.hiddenArea && (path.from === regionExit.id || path.to === regionExit.id)).forEach((path) => { path.blockedByRoomId = mainElite.id; path.blockedLabel = '精英封锁'; });
      }
      const hiddenStartRoom = node(region, hiddenStart);
      if (hiddenStartRoom?.type === 'elite') {
        paths.filter((path) => path.region === region && path.hiddenArea && (path.from === hiddenStartRoom.id || path.to === hiddenStartRoom.id)).forEach((path) => { path.blockedByRoomId = hiddenStartRoom.id; path.blockedLabel = '暗渠精英封锁'; });
      }
      const transitionEdges = [[0, 1, 'stairs_up'], [0, 2, 'crawler'], [4, 6, 'rope_down'], [5, 6, 'stairs_up']];
      transitionEdges.forEach(([aIndex, bIndex, kind], index) => {
        const a = node(region, aIndex), b = node(region, bIndex);
        const angle = (index / Math.max(1, transitionEdges.length)) * Math.PI * 2 + .6;
        const reachesRegionExit = !!regionExit && (a.id === regionExit.id || b.id === regionExit.id);
        transitions.push({ id: `transition-${region}-${index}`, region, kind, aId: a.id, bId: b.id, aLayer: a.layer, bLayer: b.layer, aX: a.x + Math.cos(angle) * 58, aY: a.y + Math.sin(angle) * 42, bX: b.x + Math.cos(angle + Math.PI) * 58, bY: b.y + Math.sin(angle + Math.PI) * 42, discovered: false, hiddenArea: false, blockedByRoomId: reachesRegionExit && mainElite?.type === 'elite' ? mainElite.id : null, blockedLabel: reachesRegionExit && mainElite?.type === 'elite' ? '精英封锁' : null });
      });

      const secretCandidates = nodes.filter((entry) => entry.region === region && !entry.hiddenArea && !['entry', 'exit', 'boss', 'cache'].includes(entry.type));
      const secretSource = choice(state.rng, secretCandidates), hiddenEntry = node(region, hiddenStart), hiddenExit = node(region, hiddenEnd);
      const secretBend = (state.rng() - .5) * 170;
      const otherRooms = nodes.filter((entry) => entry.region === region && entry.layer === secretSource.layer && entry.id !== secretSource.id);
      const gateCandidates = shuffle(state.rng, Array.from({ length: 16 }, (_, index) => { const angle = (index / 16) * Math.PI * 2 + state.rng() * .12, distance = 245 + state.rng() * 80; return { x: secretSource.x + Math.cos(angle) * distance, y: secretSource.y + Math.sin(angle) * distance }; }));
      const gate = gateCandidates.find((candidate) => organicPathPoints(secretSource, candidate, secretBend).slice(3, -3).every((point) => otherRooms.every((room) => Math.hypot(point.x - room.x, point.y - room.y) > room.r + 42))) || gateCandidates[0];
      const secretPathId = `secret-path-${region}`, entryTransitionId = `hidden-entry-${region}`, returnTransitionId = `hidden-return-${region}`;
      paths.push({ id: secretPathId, region, layer: secretSource.layer, from: secretSource.id, to: `secret-gate-${region}`, points: organicPathPoints(secretSource, gate, secretBend), width: 68, gate: false, secret: true, open: false, hiddenArea: false });
      interactions.push({ id: `secret-${region}`, region, layer: secretSource.layer, nodeId: secretSource.id, kind: ['secret_wall', 'winch', 'ice_lock'][region % 3], x: secretSource.x + 66, y: secretSource.y + 42, solved: false, targetPathId: secretPathId, targetTransitionId: entryTransitionId });
      transitions.push({ id: entryTransitionId, region, kind: 'underground_drop', aId: secretSource.id, bId: hiddenEntry.id, aLayer: secretSource.layer, bLayer: hiddenEntry.layer, aX: gate.x, aY: gate.y, bX: hiddenEntry.x, bY: hiddenEntry.y - 54, discovered: false, requiresHiddenArea: true, hiddenArea: true });
      const returnTarget = node(region, 8);
      transitions.push({ id: returnTransitionId, region, kind: 'shaft_up', aId: hiddenExit.id, bId: returnTarget.id, aLayer: hiddenExit.layer, bLayer: returnTarget.layer, aX: hiddenExit.x + 52, aY: hiddenExit.y - 12, bX: returnTarget.x - 52, bY: returnTarget.y + 12, discovered: false, requiresHiddenArea: true, hiddenArea: true, reverseRequiresDiscovery: true });
      doors.push({ id: `hidden-door-${region}`, region, layer: secretSource.layer, x: gate.x, y: gate.y - 38, keyId: REGION_KEY_IDS[region], open: false, pathId: secretPathId, revealed: false, hidden: true, secretGate: true, hiddenArea: false });

      const relayCandidates = shuffle(state.rng, nodes.filter((entry) => entry.region === region && !entry.hiddenArea && !['entry', 'exit', 'boss', 'camp'].includes(entry.type))).slice(0, 2);
      relayCandidates.forEach((relayNode, relayIndex) => interactions.push({ id: `relay-${region}-${relayIndex}`, region, layer: relayNode.layer, nodeId: relayNode.id, kind: 'relay', relayIndex, x: relayNode.x - 52 + relayIndex * 28, y: relayNode.y - 48, solved: false, targetPathId: null }));      const trapPaths = shuffle(state.rng, paths.filter((path) => path.region === region && !path.hiddenArea && !path.secret));
      const trapCount = longRun ? 2 : 1;
      for (let trapIndex = 0; trapIndex < trapCount && trapIndex < trapPaths.length; trapIndex++) { const path = trapPaths[trapIndex], point = path.points[4 + Math.floor(state.rng() * Math.max(1, path.points.length - 8))] || path.points[Math.floor(path.points.length / 2)]; traps.push({ id: `trap-${region}-${trapIndex}`, region, layer: path.layer, x: point.x, y: point.y, pathId: path.id, kind: choice(state.rng, Object.keys(TRAP_INFO)), armed: true, disarmed: false, triggered: false }); }
    }

    const puzzleSolved = Array(regionCount).fill(false);
    const hiddenAreas = Array(regionCount).fill(false);
    const usedNpcIds = new Set(), usedNpcFamilies = new Set();

    for (let region = 0; region < regionCount; region++) {
      const visibleHosts = shuffle(state.rng, nodes.filter((entry) => entry.region === region && !entry.hiddenArea && !['entry', 'exit', 'boss'].includes(entry.type)));
      const visiblePaths = paths.filter((entry) => entry.region === region && !entry.hiddenArea && (!entry.secret || entry.open));
      const hiddenHosts = nodes.filter((entry) => entry.region === region && entry.hiddenArea);
      const pickupCount = 7;
      for (let slot = 0; slot < pickupCount; slot++) {
        const offset = randomOffset(52, 98), usePath = slot > 0 && slot % 2 === 1 && visiblePaths.length;
        const pathHost = usePath ? choice(state.rng, visiblePaths) : null, pathPoint = pathHost ? choice(state.rng, pathHost.points) : null;
        const host = visibleHosts[slot % visibleHosts.length], layer = pathHost ? pathHost.layer : host.layer;
        const x = (pathPoint ? pathPoint.x : host.x) + offset.x, y = (pathPoint ? pathPoint.y : host.y) + offset.y;
        let kindId;
        if (slot === 0) kindId = 'chart';
        else kindId = choice(state.rng, ['ration', 'herb', 'cartridge', 'star']);
        pickups.push({ id: `pickup-${region}-${slot}`, region, layer, x, y, kind: kindId, collected: false, revealRegion: kindId === 'chart' ? Math.min(finalRegion, region + 1) : null, requiresPuzzle: false, hiddenArea: false });
      }
      const relicHost = choice(state.rng, visibleHosts), relicOffset = randomOffset(70, 110);
      pickups.push({ id: `relic-cache-${region}`, region, layer: relicHost.layer, x: relicHost.x + relicOffset.x, y: relicHost.y + relicOffset.y, kind: 'relic', collected: false, revealRegion: null, requiresPuzzle: true, hiddenArea: false });
      const gearHost = nodes.find((entry) => entry.region === region && entry.local === hiddenCacheIndex), gearOffset = randomOffset(58, 88);
      pickups.push({ id: `equipment-cache-${region}`, region, layer: gearHost.layer, x: gearHost.x + gearOffset.x, y: gearHost.y + gearOffset.y, kind: 'equipment', equipmentRarity: region === 2 ? 'epic' : state.rng() < .48 ? 'rare' : 'common', collected: false, revealRegion: null, requiresPuzzle: false, hiddenArea: true });
      const clueCandidates = STORY_CLUES.filter((clue) => clue.region === region), clueHost = choice(state.rng, visibleHosts), clueOffset = randomOffset(64, 104);
      if (clueCandidates.length) pickups.push({ id: `story-clue-${region}`, region, layer: clueHost.layer, x: clueHost.x + clueOffset.x, y: clueHost.y + clueOffset.y, kind: 'story', clueId: choice(state.rng, clueCandidates).id, collected: false, revealRegion: null, requiresPuzzle: false, hiddenArea: false });      const hiddenSupplyHost = nodes.find((entry) => entry.region === region && entry.local === hiddenEnd), hiddenSupplyOffset = randomOffset(62, 96);
      pickups.push({ id: `hidden-supply-${region}`, region, layer: hiddenSupplyHost.layer, x: hiddenSupplyHost.x + hiddenSupplyOffset.x, y: hiddenSupplyHost.y + hiddenSupplyOffset.y, kind: choice(state.rng, ['ration', 'herb', 'cartridge', 'star']), collected: false, revealRegion: null, requiresPuzzle: false, hiddenArea: true });

      const vaultBase = choice(state.rng, visibleHosts.filter((entry) => entry.layer <= 2)), vaultAngle = state.rng() * Math.PI * 2, vaultRadius = 260 + state.rng() * 85;
      const vaultX = vaultBase.x + Math.cos(vaultAngle) * vaultRadius, vaultY = vaultBase.y + Math.sin(vaultAngle) * vaultRadius;
      const doorId = `door-${region}`, chestId = `chest-${region}`, pathId = `vault-path-${region}`;
      const vaultPoints = organicPathPoints(vaultBase, { x: vaultX, y: vaultY }, (state.rng() - .5) * 180), doorPoint = vaultPoints[Math.floor(vaultPoints.length * .5)];
      paths.push({ id: pathId, region, layer: vaultBase.layer, from: vaultBase.id, to: chestId, points: vaultPoints, width: 78, gate: false, secret: true, open: true, hiddenArea: false, doorId });
      doors.push({ id: doorId, region, layer: vaultBase.layer, x: doorPoint.x, y: doorPoint.y, keyId: REGION_KEY_IDS[region], open: false, pathId, revealed: false, hiddenArea: false });
      chests.push({ id: chestId, region, layer: vaultBase.layer, x: vaultX, y: vaultY, tier: region + 1, opened: false, revealed: false, doorId, pathId, hiddenArea: false });

      const cacheChest = nodes.find((entry) => entry.region === region && entry.local === hiddenCacheIndex);
      chests.push({ id: `hidden-chest-${region}`, region, layer: cacheChest.layer, x: cacheChest.x - 78, y: cacheChest.y + 40, tier: region + 2, opened: false, revealed: false, hidden: true, hiddenArea: true, cacheNodeId: cacheChest.id });

      let selectedNpcs = [];
      const baseRegion = region % 3;
      const routeRegion = region === finalRegion || (longRun && region === 2);
      if (routeRegion) {
        const routePool = shuffle(state.rng, NPC_DEFINITIONS.filter((npc) => npc.regions.includes(2) && npc.hiddenRoute && !usedNpcIds.has(npc.id) && (!npc.family || !usedNpcFamilies.has(npc.family))));
        const otherPool = shuffle(state.rng, NPC_DEFINITIONS.filter((npc) => npc.regions.includes(baseRegion) && !npc.hiddenRoute && !usedNpcIds.has(npc.id) && npc.id !== routePool[0]?.id && (!npc.family || !usedNpcFamilies.has(npc.family))));
        selectedNpcs = [routePool[0], otherPool[0]].filter(Boolean);
      } else {
        const pool = shuffle(state.rng, NPC_DEFINITIONS.filter((npc) => npc.regions.includes(baseRegion) && !usedNpcIds.has(npc.id) && (!npc.family || !usedNpcFamilies.has(npc.family))));
        selectedNpcs = pool.slice(0, 2);
      }
      selectedNpcs.forEach((npcDef, slot) => {
        usedNpcIds.add(npcDef.id);
        if (npcDef.family) usedNpcFamilies.add(npcDef.family);
        const hiddenArea = slot === 1;
        const hostPool = hiddenArea ? hiddenHosts : visibleHosts;
        const host = choice(state.rng, hostPool), offset = randomOffset(42, 76);
        const spawn = { id: `npc-${region}-${slot}-${npcDef.id}`, npcId: npcDef.id, region, layer: host.layer, nodeId: host.id, x: host.x + offset.x, y: host.y + offset.y, talked: false, hidden: hiddenArea, hiddenArea };
        if (npcDef.trade) { const pool = EQUIPMENT_ITEMS.filter((item) => item.rarity === npcDef.trade.rarity); spawn.stockItemId = choice(state.rng, pool).id; }
        if (npcDef.keyTrade) spawn.keyId = npcDef.keyTrade.keyByRegion?.[region] || npcDef.keyTrade.keyId;
        if (npcDef.intel) { spawn.intelCharts = [Math.min(finalRegion, region + 1)]; spawn.revealChests = !!npcDef.intel.revealChests; }
        npcs.push(spawn);
      });
    }

    const first = nodes[0];
    const finalBossPlan = SINGLE_MAP_BOSS_PLANS[Math.min(finalRegion, SINGLE_MAP_BOSS_PLANS.length - 1)];
    const map = { version: 8, pace, quick, longRun, regionCount, finalRegion, hiddenThemes: hiddenTemplates.map((template) => ({ id: template.id, title: template.title, accent: template.accent })), rooms: nodes, nodes, paths, transitions, pickups, interactions, doors, chests, npcs, traps, chestsOpened: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 }, puzzleSolved, hiddenAreas, currentId: first.id, regionIndex: 0, cleared: [first.id], visited: [first.id], collected: 0, lastSavedRoom: first.id, charts: Array.from({ length: regionCount }, (_, index) => index === 0), nearbyAction: null, triggering: false, player: { x: first.x, y: first.y, layer: 0, r: 17, facing: 'right', moving: false, sprinting: false, walkPhase: 0, sprintBurstUntil: 0, vx: 0, vy: 0, wallSlideSign: 0 }, bossType: finalBossPlan.typeId, bossTitle: finalBossPlan.title, bossScale: finalBossPlan.scale, bosses: nodes.filter((node) => node.type === 'boss').map((node) => ({ id: node.id, region: node.region, title: node.bossTitle, typeId: node.enemy.typeId })), respawnId: first.id, respawnLit: false, hiddenMapUnlocked: false };
    appendMasterVault(map);
    const allPoints = map.nodes.concat(map.paths.flatMap((path) => path.points));
    map.bounds = { minX: Math.min(...allPoints.map((point) => point.x)) - 210, maxX: Math.max(...allPoints.map((point) => point.x)) + 210, minY: Math.min(...allPoints.map((point) => point.y)) - 190, maxY: Math.max(...allPoints.map((point) => point.y)) + 190 };
    if (!separateSingleMapInteractionPoints(map)) {
      if (separationAttempt < 12) return generateSingleMap(pace, separationAttempt + 1);
      throw new Error(`无法生成互不重叠的山河图交互点 ${JSON.stringify(map.interactionSeparationFailure || {})}`);
    }
    return map;
  }
  function migrateSingleMapV7(oldMap) {
    if (!oldMap) return generateSingleMap(state.singlePace);
    const fresh = generateSingleMap(oldMap.pace || state.singlePace);
    fresh.collected = oldMap.collected || 0;
    fresh.charts = Array.isArray(oldMap.charts) ? oldMap.charts.slice(0, fresh.regionCount) : fresh.charts;
    fresh.puzzleSolved = Array.isArray(oldMap.puzzleSolved) ? oldMap.puzzleSolved.slice(0, fresh.regionCount) : fresh.puzzleSolved;
    fresh.hiddenAreas = Array.isArray(oldMap.hiddenAreas) ? oldMap.hiddenAreas.slice(0, fresh.regionCount) : fresh.hiddenAreas;
    fresh.hiddenMapUnlocked = !!oldMap.hiddenMapUnlocked;
    fresh.cleared = fresh.rooms.filter((room) => oldMap.cleared?.includes(room.id)).map((room) => room.id);
    if (!fresh.cleared.length) fresh.cleared = [fresh.rooms[0].id];
    fresh.visited = fresh.rooms.filter((room) => oldMap.visited?.includes(room.id)).map((room) => room.id);
    if (!fresh.visited.length) fresh.visited = [fresh.rooms[0].id];
    const oldPickups = new Map((oldMap.pickups || []).map((item) => [item.id, item]));
    fresh.pickups.forEach((item) => { if (oldPickups.get(item.id)?.collected) item.collected = true; });
    const oldInteractions = new Map((oldMap.interactions || []).map((item) => [item.id, item]));
    fresh.interactions.forEach((item) => { if (oldInteractions.get(item.id)?.solved) item.solved = true; });
    const oldPaths = new Map((oldMap.paths || []).map((item) => [item.id, item]));
    fresh.paths.forEach((item) => { if (oldPaths.get(item.id)?.open) item.open = true; });
    const oldDoors = new Map((oldMap.doors || []).map((item) => [item.id, item]));
    fresh.doors.forEach((item) => { if (oldDoors.get(item.id)?.open) item.open = true; });
    const oldChests = new Map((oldMap.chests || []).map((item) => [item.id, item]));
    fresh.chests.forEach((item) => { if (oldChests.get(item.id)?.opened) { item.opened = true; item.revealed = true; } });
    fresh.chestsOpened = (oldMap.chestsOpened || []).filter((item) => fresh.chests.some((chest) => chest.id === item.id));
    fresh.interactions.filter((item) => item.kind !== 'relay' && item.solved).forEach((item) => { fresh.hiddenAreas[item.region] = true; });
    if (oldMap.currentId && fresh.rooms.some((room) => room.id === oldMap.currentId)) {
      const room = fresh.rooms.find((entry) => entry.id === oldMap.currentId);
      fresh.currentId = room.id; fresh.regionIndex = room.region;
      fresh.player = { ...fresh.player, x: room.x, y: room.y, layer: room.layer };
    }
    if (fresh.hiddenMapUnlocked) revealHiddenVaultForMap(fresh);
    fresh.lastSavedRoom = fresh.currentId;
    return fresh;
  }
  function repairSingleMapInteractionKinds(map) {
    if (!map || !Array.isArray(map.interactions)) return map;
    const secretKinds = ['secret_wall', 'winch', 'ice_lock'];
    map.interactions.forEach((item, index) => {
      if (!SINGLE_INTERACTION_INFO[item.kind]) item.kind = secretKinds[(Number.isFinite(item.region) ? item.region : index) % secretKinds.length];
    });
    return map;
  }
  const SINGLE_MAP_POINT_GAP = 96;
  const SINGLE_MAP_INTERACTION_SEPARATION_VERSION = 4;
  function singleMapInteractionPoints(map) {
    const points = [];
    const add = (kind, id, layer, x, y, region, pathId, radius, apply, hiddenArea = false) => points.push({
      kind, id, layer: Number.isFinite(layer) ? layer : 0,
      x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0,
      region: Number.isFinite(region) ? region : 0,
      pathId: pathId || '', radius: Math.max(1, radius || 1), apply,
      hiddenArea: !!hiddenArea
    });
    (map.rooms || []).forEach((room) => add('room', `room:${room.id}`, room.layer, room.x, room.y, room.region, '', 1, null, room.hiddenArea));
    (map.transitions || []).forEach((transition) => {
      add('transition', `${transition.id}:a`, transition.aLayer, transition.aX, transition.aY, transition.region, '', 52, (x, y) => { transition.aX = x; transition.aY = y; }, transition.requiresHiddenArea);
      add('transition', `${transition.id}:b`, transition.bLayer, transition.bX, transition.bY, transition.region, '', 52, (x, y) => { transition.bX = x; transition.bY = y; }, transition.requiresHiddenArea);
    });
    (map.doors || []).forEach((door) => add('door', door.id, door.layer, door.x, door.y, door.region, door.pathId, 66, (x, y) => { door.x = x; door.y = y; }, door.hiddenArea));
    (map.chests || []).forEach((chest) => add('chest', chest.id, chest.layer, chest.x, chest.y, chest.region, chest.pathId, 62, (x, y) => { chest.x = x; chest.y = y; }, chest.hiddenArea));
    (map.npcs || []).forEach((npc) => add('npc', npc.id, npc.layer, npc.x, npc.y, npc.region, '', 68, (x, y) => { npc.x = x; npc.y = y; }, npc.hiddenArea));
    (map.traps || []).forEach((trap) => add('trap', trap.id, trap.layer, trap.x, trap.y, trap.region, trap.pathId, 76, (x, y) => { trap.x = x; trap.y = y; }, trap.hiddenArea));
    (map.pickups || []).forEach((pickup) => add('pickup', pickup.id, pickup.layer, pickup.x, pickup.y, pickup.region, '', mapPickupInteractRadius(pickup), (x, y) => { pickup.x = x; pickup.y = y; }, pickup.hiddenArea));
    (map.interactions || []).forEach((item) => add('interaction', item.id, item.layer, item.x, item.y, item.region, item.targetPathId, 72, (x, y) => { item.x = x; item.y = y; }, item.hiddenArea));
    return points;
  }

  function singleMapPathSamples(map, region, layer, pathId = '', includeUnavailable = false) {
    const samples = [];
    (map.paths || []).forEach((path) => {
      if (path.region !== region || path.layer !== layer || (pathId && path.id !== pathId)) return;
      if (!includeUnavailable && ((path.secret && !path.open) || (path.hidden && !path.revealed) || (path.hiddenArea && !map.hiddenAreas?.[path.region]) || singleMapBlockedBy(map, path))) return;
      const laneWidth = Math.max(0, Math.min(path.width * .34, path.width / 2 - 16));
      for (let index = 1; index < path.points.length; index++) {
        const a = path.points[index - 1], b = path.points[index];
        const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length, ny = dx / length;
        const steps = Math.max(1, Math.ceil(length / 14));
        for (let step = index === 1 ? 0 : 1; step <= steps; step++) {
          const t = step / steps, x = a.x + dx * t, y = a.y + dy * t;
          for (const offset of [0, laneWidth, -laneWidth, laneWidth * .5, -laneWidth * .5]) samples.push({ x: x + nx * offset, y: y + ny * offset });
        }
      }
    });
    return samples;
  }

  function singleMapPathAllowedForPoint(path, point) {
    if (!path || path.region !== point.region || path.layer !== point.layer) return false;
    if (point.pathId && path.id === point.pathId) return true;
    if (point.hiddenArea) return !!path.hiddenArea || (!path.hidden && (!path.secret || path.open));
    return !path.hiddenArea && !path.hidden && (!path.secret || path.open);
  }

  function singleMapPointSurfaceClearance(point) {
    if (point.kind === 'pickup') return 14;
    if (point.kind === 'chest' || point.kind === 'door') return 11;
    return 9;
  }

  function singleMapPointOnWalkableSurface(map, point, candidate) {
    const clearance = singleMapPointSurfaceClearance(point);
    const insideRoom = (map.rooms || []).some((room) =>
      room.region === point.region && room.layer === point.layer &&
      Math.hypot(candidate.x - room.x, candidate.y - room.y) <= Math.max(2, room.r - clearance)
    );
    if (insideRoom) return true;
    return (map.paths || []).some((path) => {
      if (!singleMapPathAllowedForPoint(path, point)) return false;
      const usableHalfWidth = Math.max(2, path.width / 2 - clearance);
      return path.points.some((_, index) => index > 0 && mapSegmentDistance(candidate.x, candidate.y, path.points[index - 1], path.points[index]) <= usableHalfWidth);
    });
  }

  function singleMapPointReachable(map, point, candidate) {
    return singleMapPointOnWalkableSurface(map, point, candidate);
  }

  function singleMapInteractionMinimumGap(a, b) {
    const doorAndTransition = (a.kind === 'door' && b.kind === 'transition') || (a.kind === 'transition' && b.kind === 'door');
    return doorAndTransition ? 128 : SINGLE_MAP_POINT_GAP;
  }

  function singleMapInteractionPointsOverlap(a, b) {
    return !!a && !!b && a.layer === b.layer && Math.hypot(a.x - b.x, a.y - b.y) < singleMapInteractionMinimumGap(a, b) - .01;
  }

  function separateSingleMapInteractionPoints(map) {
    if (!map || map.interactionSeparationVersion >= SINGLE_MAP_INTERACTION_SEPARATION_VERSION) return map;
    const points = singleMapInteractionPoints(map);
    const movable = points.filter((point) => point.kind !== 'room');
    const order = { door: 0, transition: 1, chest: 2, npc: 3, trap: 4, pickup: 5, interaction: 6 };
    movable.sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9) || a.id.localeCompare(b.id));
    const placed = [];
    const collisions = (candidate, point) => placed.some((other) => singleMapInteractionPointsOverlap(other, { ...point, ...candidate }));
    const place = (point, candidate) => {
      if (point.apply) point.apply(candidate.x, candidate.y);
      placed.push({ ...point, x: candidate.x, y: candidate.y });
    };
    for (const point of movable) {
      const candidates = [{ x: point.x, y: point.y }];
      const seen = new Set([`${point.x.toFixed(2)}:${point.y.toFixed(2)}`]);
      const appendSamples = (samples) => {
        samples.sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y));
        samples.forEach((sample) => {
          const key = `${sample.x.toFixed(2)}:${sample.y.toFixed(2)}`;
          if (seen.has(key)) return;
          seen.add(key); candidates.push(sample);
        });
      };
      const strictPathId = point.pathId || '';
      appendSamples(singleMapPathSamples(map, point.region, point.layer, strictPathId));
      appendSamples(singleMapPathSamples(map, point.region, point.layer, strictPathId, true));
      const bounds = map.bounds || {};
      const clampX = (x) => Number.isFinite(bounds.minX) && Number.isFinite(bounds.maxX) ? clamp(x, bounds.minX + 40, bounds.maxX - 40) : x;
      const clampY = (y) => Number.isFinite(bounds.minY) && Number.isFinite(bounds.maxY) ? clamp(y, bounds.minY + 40, bounds.maxY - 40) : y;
      if (point.kind !== 'door') {
        for (let ring = 1; ring <= 10; ring++) {
          const distance = SINGLE_MAP_POINT_GAP + (ring - 1) * 28;
          for (let direction = 0; direction < 32; direction++) {
            const angle = direction * Math.PI * 2 / 32 + ring * .17;
            const candidate = { x: clampX(point.x + Math.cos(angle) * distance), y: clampY(point.y + Math.sin(angle) * distance) };
            const key = `${candidate.x.toFixed(2)}:${candidate.y.toFixed(2)}`;
            if (!seen.has(key)) { seen.add(key); candidates.push(candidate); }
          }
        }
      }
      const target = candidates.find((candidate) => !collisions(candidate, point) && singleMapPointReachable(map, point, candidate));
      if (!target) { map.interactionSeparationFailure = { kind: point.kind, id: point.id, region: point.region, layer: point.layer, pathId: point.pathId, candidates: candidates.length }; return false; }
      place(point, target);
    }
    if (!singleMapPlacementIsValid(map)) return false;
    delete map.interactionSeparationFailure;
    map.interactionSeparationVersion = SINGLE_MAP_INTERACTION_SEPARATION_VERSION;
    return map;
  }

  function singleMapPlacementIsValid(map) {
    const points = singleMapInteractionPoints(map);
    for (const point of points) {
      if (point.kind !== 'room' && !singleMapPointOnWalkableSurface(map, point, point)) return false;
    }
    const interactive = points.filter((point) => point.kind !== 'room');
    for (let a = 0; a < interactive.length; a++) for (let b = a + 1; b < interactive.length; b++) {
      if (singleMapInteractionPointsOverlap(interactive[a], interactive[b])) return false;
    }
    return true;
  }
  function singleMapRoom(map, id) { return map?.rooms?.find((room) => room.id === id) || null; }
  function singleMapRoomAt(map, x, y) {
    const layer = map?.player?.layer ?? 0;
    return map?.rooms?.find((room) => room.layer === layer && Math.hypot(x - room.x, y - room.y) <= room.r) || null;
  }
  function singleMapPointWalkable(map, x, y, r = 0) {
    const layer = map?.player?.layer ?? 0;
    if ((map.doors || []).some((door) => door.layer === layer && !door.open && Math.hypot(x - door.x, y - door.y) < 34 + r)) return false;
    if (map.rooms.some((room) => room.layer === layer && (!room.hiddenArea || map.hiddenAreas?.[room.region]) && Math.hypot(x - room.x, y - room.y) <= room.r - r)) return true;
    return map.paths.some((path) => {
      if (path.layer !== layer || (path.secret && !path.open) || (path.hidden && !path.revealed) || (path.hiddenArea && !map.hiddenAreas?.[path.region]) || singleMapBlockedBy(map, path)) return false;
      for (let i = 1; i < path.points.length; i++) if (mapSegmentDistance(x, y, path.points[i - 1], path.points[i]) <= path.width / 2 - r) return true;
      return false;
    });
  }
  function mapActionFor(map) {
    if (!map?.player) return null;
    const p = map.player, actions = [], layer = p.layer;
    (map.pickups || []).forEach((pickup) => {
      if (pickup.collected || pickup.layer !== layer || (pickup.hiddenArea && !map.hiddenAreas?.[pickup.region])) return;
      if (pickup.requiresPuzzle && !map.puzzleSolved?.[pickup.region]) return;
      const distance = Math.hypot(p.x - pickup.x, p.y - pickup.y);
      if (distance <= mapPickupInteractRadius(pickup)) actions.push({ kind: 'pickup', id: pickup.id, distance, label: `拾取 ${SINGLE_PICKUP_INFO[pickup.kind].name}` });
    });
    (map.traps || []).forEach((trap) => {
      if (!trap.armed || trap.layer !== layer) return;
      const distance = Math.hypot(p.x - trap.x, p.y - trap.y);
      if (distance <= 76) actions.push({ kind: 'trap', id: trap.id, distance, label: `解除${TRAP_INFO[trap.kind].name}` });
    });    (map.interactions || []).forEach((item) => {
      if (item.solved || item.layer !== layer) return;
      const distance = Math.hypot(p.x - item.x, p.y - item.y);
      const info = SINGLE_INTERACTION_INFO[item.kind] || SINGLE_INTERACTION_INFO.secret_wall;
      if (distance <= 72) actions.push({ kind: 'interaction', id: item.id, distance, label: item.kind === 'relay' ? '接通信号闸' : info.action });
    });
    (map.transitions || []).forEach((transition) => {
      if (transition.requiresHiddenArea && !map.hiddenAreas?.[transition.region]) return;
      const nodeA = singleMapRoom(map, transition.aId), nodeB = singleMapRoom(map, transition.bId);
      if (!nodeA || !nodeB) return;
      const blockerId = singleMapBlockedBy(map, transition);
      const blockedLabel = blockerId ? `${singleMapBlockerName(map, blockerId)}拦住去路` : '';
      if (layer === transition.aLayer) {
        const distance = Math.hypot(p.x - transition.aX, p.y - transition.aY);
        if (distance <= 52) actions.push({ kind: blockerId ? 'blocked' : 'transition', id: transition.id, side: 'a', distance, label: blockerId ? blockedLabel : layerTransitionLabel(transition.kind, 'a') });
      }
      if (layer === transition.bLayer && (!transition.reverseRequiresDiscovery || transition.discovered)) {
        const distance = Math.hypot(p.x - transition.bX, p.y - transition.bY);
        if (distance <= 52) actions.push({ kind: blockerId ? 'blocked' : 'transition', id: transition.id, side: 'b', distance: distance + 2, label: blockerId ? blockedLabel : layerTransitionLabel(transition.kind, 'b') });
      }
    });
    (map.doors || []).forEach((door) => {
      if (door.open || door.layer !== layer || (door.hidden && !door.revealed)) return;
      const distance = Math.hypot(p.x - door.x, p.y - door.y);
      if (distance > 66) return;
      const key = KEYS[door.keyId]; const hasKey = !!(state.player.keys?.[door.keyId]);
      actions.push({ kind: 'door', id: door.id, distance, label: hasKey ? `开锁 · ${key.name}` : `门锁需要${key.name}` });
    });
    (map.chests || []).forEach((chest) => {
      if (chest.opened || chest.layer !== layer || (chest.hidden && !chest.revealed) || (chest.hiddenArea && !map.hiddenAreas?.[chest.region])) return;
      const distance = Math.hypot(p.x - chest.x, p.y - chest.y);
      if (distance <= 62) actions.push({ kind: 'chest', id: chest.id, distance, label: '开启宝箱' });
    });
    (map.npcs || []).forEach((npc) => {
      if (npc.layer !== layer || (npc.hiddenArea && !map.hiddenAreas?.[npc.region])) return;
      const distance = Math.hypot(p.x - npc.x, p.y - npc.y);
      const def = npcById(npc.npcId);
      if (distance <= 68) actions.push({ kind: 'npc', id: npc.id, distance, label: `与 ${def?.name || '老乡'} 交谈` });
    });
    (map.rooms || []).forEach((room) => {
      if (room.layer !== layer || (room.hiddenArea && !map.hiddenAreas?.[room.region]) || map.cleared.includes(room.id) || ['entry', 'exit'].includes(room.type)) return;
      const distance = Math.hypot(p.x - room.x, p.y - room.y);
      if (distance > room.r * .72) return;
      let label;
      if (nodeHasEnemy(room)) {
        const base = ENEMY_TYPES[room.enemy.typeId], variant = room.enemy.elite ? ELITE_VARIANTS[room.enemy.typeId] : null;
        const enemyName = room.enemy.boss ? (room.bossTitle || state.singleMap?.bossTitle || '首领') : variant?.name || base?.name || '敌军';
        label = `挑战 ${room.enemy.boss ? '首领' : room.enemy.elite ? '精英' : '敌军'} · ${enemyName}`;
      } else label = room.type === 'event' ? '调查行军遗迹' : room.type === 'camp' ? '在废弃营地休整' : room.type === 'cache' ? '搜索隐蔽军资' : room.type === 'bonfire' ? (room.lit ? '星火营火 · 整备或传送' : '点亮星火营火') : '调查前方';
      actions.push({ kind: 'node', id: room.id, distance, label });
    });
    const actionPriority = (action) => action.kind === 'door' ? 0 : action.kind === 'trap' ? 1 : action.kind === 'chest' ? 2 : action.kind === 'npc' ? 3 : action.kind === 'pickup' ? 4 : action.kind === 'interaction' ? 5 : action.kind === 'node' ? 6 : action.kind === 'blocked' ? 8 : 9;
    actions.sort((a, b) => a.distance - b.distance || actionPriority(a) - actionPriority(b));
    return actions[0] || null;
  }
  function renderSingleMapTasks(map = state.singleMap) {
    if (!dom.singleMapTaskPanel || !dom.singleMapTaskList || !map || !state.player) return;
    const active = NPC_DEFINITIONS.filter((npc) => npc.quest && state.player.npcQuests?.[npc.quest.id] && state.player.npcQuests[npc.quest.id] !== 'complete');
    const signature = active.map((npc) => `${npc.id}:${state.player.npcQuests[npc.quest.id]}:${npcQuestObjectiveMet(npc)}`).join('|');
    if (signature === singleMapTaskSignature) return;
    singleMapTaskSignature = signature;
    dom.singleMapTaskPanel.classList.toggle('hidden', !active.length);
    if (dom.singleMapTaskCount) dom.singleMapTaskCount.textContent = String(active.length);
    if (!active.length) { dom.singleMapTaskList.innerHTML = ''; return; }
    dom.singleMapTaskList.innerHTML = active.map((npc) => {
      const ready = npcQuestObjectiveMet(npc);
      return `<article class="single-map-task ${ready ? 'ready' : ''}"><span>${npc.icon} ${npc.name}</span><strong>${npc.quest.title}</strong><small>${ready ? '回到委托人处领取报酬' : npc.quest.objective}</small><em>${ready ? '可领取' : '进行中'}</em></article>`;
    }).join('');
  }
  function updateSingleMapActionHint(map) {
    if (!dom.singleMapActionHint) return;
    const action = map.nearbyAction;
    const hintSignature = `${activeGamepad ? 'pad' : 'key'}|${map.player.layer}|${action ? `${action.kind}:${action.id}:${action.side || ''}:${action.label}` : 'none'}`;
    if (hintSignature === singleMapActionHintSignature) return;
    singleMapActionHintSignature = hintSignature;
    const interactKey = activeGamepad ? 'X' : 'E';
    const sprintHint = activeGamepad ? `长按 ${inputBindingLabel('sprint')} 疾跑` : `长按 ${inputBindingLabel('sprint')} 疾跑`;
    const moveKeys = `${formatKeyCode(keyBinding('moveUp'))}/${formatKeyCode(keyBinding('moveLeft'))}/${formatKeyCode(keyBinding('moveDown'))}/${formatKeyCode(keyBinding('moveRight'))}`;
    if (dom.singleMapControlsHint) dom.singleMapControlsHint.textContent = activeGamepad ? `左摇杆移动 · 长按 ${inputBindingLabel('sprint')} 疾跑 · ${inputBindingLabel('interact')} 互动` : `${moveKeys} 移动 · 长按 ${inputBindingLabel('sprint')} 疾跑 · ${inputBindingLabel('interact')} 互动`;
    if (map.nearbyAction) { dom.singleMapActionHint.textContent = `${interactKey} · ${map.nearbyAction.label}`; dom.singleMapActionHint.classList.add('active'); }
    else { dom.singleMapActionHint.textContent = `${sprintHint} · 靠近目标后按 ${interactKey} 互动`; dom.singleMapActionHint.classList.remove('active'); }
  }
  function renderSingleMap() {
    if (!state.singleMap || state.singleMap.version < 5 || state.singleMap.version > 8) state.singleMap = generateSingleMap(state.singlePace);
    else if (state.singleMap.version < 8) { state.singleMap = migrateSingleMapV7(state.singleMap); saveCurrentRun('map'); }
    const map = state.singleMap;
    if (!Array.isArray(map.pickups)) map.pickups = [];
    if (!Array.isArray(map.interactions)) map.interactions = [];
    repairSingleMapInteractionKinds(map);
    if (map.interactionSeparationVersion >= SINGLE_MAP_INTERACTION_SEPARATION_VERSION && !singleMapPlacementIsValid(map)) {
      map.interactionSeparationVersion = 0;
    }
    for (let separationAttempt = 0; separationAttempt < 12 && map.interactionSeparationVersion < SINGLE_MAP_INTERACTION_SEPARATION_VERSION; separationAttempt++) {
      if (separateSingleMapInteractionPoints(map)) break;
    }
    const regionCount = map.regionCount || Math.max(3, ...(map.rooms || []).map((room) => room.region + 1));
    map.regionCount = regionCount;
    map.finalRegion = map.finalRegion ?? regionCount - 1;
    if (!Array.isArray(map.charts) || map.charts.length !== regionCount) map.charts = Array.from({ length: regionCount }, (_, index) => index === 0 || !!map.charts?.[index]);
    if (!Array.isArray(map.transitions)) map.transitions = [];
    if (!Array.isArray(map.doors)) map.doors = [];
    if (!Array.isArray(map.chests)) map.chests = [];
    if (!Array.isArray(map.npcs)) map.npcs = [];
    if (!Array.isArray(map.chestsOpened)) map.chestsOpened = [];
    if (!Array.isArray(map.puzzleSolved) || map.puzzleSolved.length !== regionCount) map.puzzleSolved = Array.from({ length: regionCount }, (_, index) => !!map.puzzleSolved?.[index]);
    if (!Array.isArray(map.hiddenAreas) || map.hiddenAreas.length !== (map.regionCount || 3)) map.hiddenAreas = Array.from({ length: map.regionCount || 3 }, (_, index) => !!map.hiddenAreas?.[index]);
    if (!Number.isFinite(map.player.layer)) map.player.layer = 0;
    const walkPhase = Number(map.player.walkPhase);
    map.player.walkPhase = Number.isFinite(walkPhase) ? ((walkPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) : 0;
    map.player.sprinting = false;
    if (!Number.isFinite(map.player.vx)) map.player.vx = 0;
    if (!Number.isFinite(map.player.vy)) map.player.vy = 0;
    if (!Number.isFinite(map.player.wallSlideSign)) map.player.wallSlideSign = 0;
    dom.singleMapEyebrow.textContent = map.pace === 'quick' ? '山河寻路 · 快速模式' : `山河寻路 · 普通模式 · ${difficultyLabel()}`;
    dom.singleMapLayerName.textContent = SINGLE_LAYER_NAMES[map.player.layer] || '地表';
    dom.singleMapTitle.textContent = map.pace === 'quick' ? '四层山河图' : '长征山河长卷';
    dom.singleMapRegionCount.textContent = `${map.regionIndex + 1} / ${regionCount}`;
    dom.singleMapChartCount.textContent = `${map.charts.filter(Boolean).length} / ${regionCount}`;
    dom.singleMapCollectCount.textContent = String(map.collected || 0);
    dom.singleMapProgressCount.textContent = `${map.cleared.length} / ${map.rooms.length}`;
    const room = singleMapRoom(map, map.currentId) || map.rooms[0];
    dom.singleMapRoomRegion.textContent = SINGLE_REGIONS[room.region].name;
    dom.singleMapRoomName.textContent = room.name;
    dom.singleMapRoomDesc.textContent = room.desc;
    updateSingleMapActionHint(map);
    renderSingleMapTasks(map);
    setMeta(); setScreen('map'); maybeShowSingleMapControlsHint(); singleMapSaveAt = performance.now(); singleMapWasMoving = false; saveCurrentRun('map'); startSingleMapLoop();
  }
  function markSingleRoomCleared(id) { if (!state.singleMap) return; if (!state.singleMap.cleared.includes(id)) state.singleMap.cleared.push(id); if (!state.singleMap.visited.includes(id)) state.singleMap.visited.push(id); saveCurrentRun('map'); }
  function resolveSinglePickup(pickup) {
    if (!state.singleMap || !pickup || pickup.collected) return;
    const p = state.player, bonus = 1 + (p.relicMapBonus || 0);
    pickup.collected = true; state.singleMap.collected = (state.singleMap.collected || 0) + 1;
    let message = '';
    if (pickup.kind === 'ration') {
      const before = p.supplies;
      p.supplies = Math.min(p.maxSupplies, p.supplies + Math.round(7 * bonus));
      const gain = Math.max(0, Math.round(p.supplies - before));
      message = `补给 +${gain}`;
      queueAcquisition({ type: 'pickup', kicker: '地图拾取 · 行军物资', name: SINGLE_PICKUP_INFO.ration.name, icon: '粮', meta: '常见物资 · 补给', desc: '一支队伍能在山路上走多远，往往取决于粮袋里还剩多少。', effects: [gain > 0 ? `补给 +${gain}` : '补给已满，仍收入行囊'], note: '补给用于突刺与紧急救护。' });
    } else if (pickup.kind === 'herb') {
      const before = p.hp;
      p.hp = Math.min(p.maxHp, p.hp + Math.round((p.maxHp * .1 + 2) * bonus));
      const gain = Math.max(0, Math.round(p.hp - before));
      message = `兵力 +${gain}`;
      queueAcquisition({ type: 'pickup', kicker: '地图拾取 · 救护物资', name: SINGLE_PICKUP_INFO.herb.name, icon: '药', meta: '常见物资 · 恢复', desc: '晒干的草药和一卷干净绷带，能让伤员重新跟上队伍。', effects: [gain > 0 ? `兵力 +${gain}` : '兵力已满，仍收入行囊'], note: '草药只在拾取时恢复兵力，不会留到下一场战斗。' });
    } else if (pickup.kind === 'cartridge') {
      const gain = Math.round(14 * bonus);
      p.merit = (p.merit || 0) + gain;
      message = `军功 +${gain}`;
      queueAcquisition({ type: 'pickup', kicker: '地图拾取 · 缴获', name: SINGLE_PICKUP_INFO.cartridge.name, icon: '弹', meta: '常见物资 · 军功', desc: '散落在旧阵地里的弹壳还能回收换作军功。', effects: [`军功 +${gain}`], note: '军功可用于军需站与 NPC 交易。' });
    } else if (pickup.kind === 'chart') {
      const revealRegion = pickup.revealRegion ?? Math.min(2, pickup.region + 1);
      state.singleMap.charts[revealRegion] = true;
      message = SINGLE_REGIONS[revealRegion].name + '区域图已补全';
      queueAcquisition({ type: 'map', kicker: '获得区域图', name: SINGLE_REGIONS[revealRegion].name + '区域图', icon: '图', meta: '地图探索道具', desc: '一张被折过多次的旧地图，补全了山河图的道路和地势连接。', effects: [`解锁${SINGLE_REGIONS[revealRegion].name}小地图`], note: '小地图会在左上角显示完整道路与地标。' });
    } else if (pickup.kind === 'story') {
      const clue = STORY_CLUES.find((entry) => entry.id === pickup.clueId) || STORY_CLUES.find((entry) => entry.region === pickup.region && !(p.storyClues || []).includes(entry.id));
      if (clue) { grantStoryClue(clue.id, { source: '地图拾取 · 行军线索' }); message = `线索：${clue.title}`; }
      else message = '线索已经收集完整';    } else if (pickup.kind === 'relic') {
      const available = RELICS.filter((relic) => !(p.relics || []).includes(relic.id));
      if (available.length) {
        const relic = choice(state.rng, available);
        const reward = grantRelic(p, relic.id);
        message = `取得 ${reward.relic.name}`;
        if (reward.synergies?.length) message += `，触发联动「${reward.synergies.map((synergy) => synergy.name).join('、')}」`;
      } else {
        p.merit = (p.merit || 0) + 60;
        message = '信物已齐，残匣化为 60 军功';
        queueAcquisition({ type: 'pickup', kicker: '星火残匣', name: '信物残响', icon: '星', meta: '已有信物 · 化作军功', desc: '残匣中的红星已经与行囊里的旧物共鸣。', effects: ['军功 +60'], note: '所有信物都已收入行囊。' });
      }
    } else if (pickup.kind === 'equipment') {
      const rarity = pickup.equipmentRarity || 'common';
      const pool = EQUIPMENT_ITEMS.filter((item) => item.rarity === rarity);
      const item = choice(state.rng, pool.length ? pool : EQUIPMENT_ITEMS);
      const unit = acquireEquipment(p, item.id, { source: '地图拾取', autoEquip: true, silent: true });
      queueAcquisition({ type: 'equipment', kicker: '地图拾取 · 军备', name: item.name, icon: item.icon, meta: `${EQUIPMENT_RARITIES[item.rarity].name} · ${item.category}`, desc: item.desc, effects: item.effects.map((effect) => `${effect.label} ${effect.value}`), note: p.equippedEquipment.includes(unit.uid) ? '已自动装入空余军备槽，可在军备栏调整。' : '已收入军备栏，可在军备栏装备。' });
      message = `取得 ${item.name}`;
    } else {
      const before = p.morale;
      p.morale = Math.min(100, p.morale + Math.round(8 * bonus));
      const gain = Math.max(0, Math.round(p.morale - before));
      message = `士气 +${gain}`;
      queueAcquisition({ type: 'pickup', kicker: '地图拾取 · 鼓舞', name: SINGLE_PICKUP_INFO.star.name, icon: '星', meta: '常见物资 · 士气', desc: '一张被雨水打湿的红星纸片，仍让人想起队伍为何出发。', effects: [gain > 0 ? `士气 +${gain}` : '士气已满，仍收入行囊'], note: '士气越高，刀势与战意越强。' });
    }
    dom.singleMapCollectCount.textContent = String(state.singleMap.collected || 0); dom.singleMapChartCount.textContent = `${state.singleMap.charts.filter(Boolean).length} / ${state.singleMap.regionCount || state.singleMap.charts.length}`;
    showToast(`${SINGLE_PICKUP_INFO[pickup.kind].name}：${message}`); updateMetaBars(); saveCurrentRun('map');
  }
  function triggerMapTrap(trap) {
    const map = state.singleMap, p = state.player;
    if (!map || !trap || !trap.armed) return;
    trap.armed = false; trap.triggered = true;
    const damage = Math.max(1, Math.round(p.maxHp * (trap.kind === 'spikepit' ? .16 : trap.kind === 'rockfall' ? .14 : .1)));
    p.hp = Math.max(1, p.hp - damage);
    p.morale = Math.max(0, p.morale - 3);
    showToast(`${TRAP_INFO[trap.kind].name}触发：兵力 -${damage}`);
    playSound('enemy');
    updateMetaBars(); saveCurrentRun('map'); renderSingleMap();
  }
  function resolveMapTrap(trap) {
    const map = state.singleMap, p = state.player;
    if (!map || !trap || !trap.armed) return;
    trap.armed = false; trap.disarmed = true;
    const rewardMaterial = state.rng() < .42;
    if (rewardMaterial) grantMaterial(p, state.rng() < .55 ? 'tempered_steel' : 'machined_parts', 1, { source: '拆除机关所得' });
    else { p.merit = (p.merit || 0) + 10; queueAcquisition({ type: 'trap', kicker: '机关解除', name: TRAP_INFO[trap.kind].name, icon: TRAP_INFO[trap.kind].glyph, meta: '行军机关 · 已拆除', desc: '机关被稳妥拆下，队伍从夹层里找到一点可用物资。', effects: ['军功 +10'], note: '这条道路已经安全。' }); }
    playSound('guard');
    updateMetaBars(); saveCurrentRun('map'); renderSingleMap();
  }  function resolveSingleInteraction(item) {
    if (!state.singleMap || !item || item.solved) return;
    item.solved = true;
    if (item.kind === 'relay') {
      const relays = state.singleMap.interactions.filter((entry) => entry.region === item.region && entry.kind === 'relay');
      const solvedCount = relays.filter((entry) => entry.solved).length;
      if (solvedCount >= relays.length) {
        state.singleMap.puzzleSolved[item.region] = true;
        state.player.merit = (state.player.merit || 0) + 12;
        showToast('双信号闸接通：暗格显形，军功 +12。');
      } else {
        showToast(`信号闸已接通 ${solvedCount} / ${relays.length}，还要找到另一座。`);
      }
      saveCurrentRun('map');
      return;
    }
    const newlyUnlocked = unlockHiddenAreaForMap(state.singleMap, item.region);
    state.player.merit = (state.player.merit || 0) + 10;
    const interactionInfo = SINGLE_INTERACTION_INFO[item.kind] || SINGLE_INTERACTION_INFO.secret_wall;
    showToast(`暗道开启：${interactionInfo.name}后露出通往地下暗渠的入口，军功 +10。`);
    if (newlyUnlocked) queueAcquisition({ type: 'map', kicker: '发现隐藏区域', name: '地下暗渠入口', icon: '渠', meta: `${SINGLE_REGIONS[item.region].name} · 另一块地图`, desc: '石缝后的旧运粮道向下延伸，连接战斗区、隐蔽军资和一口返回上层的竖井。', effects: ['显露地下暗渠旧闸门', '标记暗渠军资与精英', '接通返回河谷的竖井'], note: '先打开入口处的暗渠闸门，再沿旧运粮道进入另一块地图。' });
    updateMetaBars();
    saveCurrentRun('map');
  }
  function openMapDoor(door) {
    if (!state.singleMap || !door || door.open) return false;
    const key = KEYS[door.keyId];
    if (!consumeKey(state.player, door.keyId)) { showToast(`这道门需要${key?.name || '对应钥匙'}。可以先找 NPC、精英敌人或宝箱。`); return false; }
    door.open = true;
    showToast(door.secretGate ? `使用${key.name}打开了通往地下暗渠的旧闸门。` : `使用${key.name}打开了暗门。`);
    playSound('guard');
    saveCurrentRun('map');
    return true;
  }
  function rollChestRarity(chest) {
    if (chest.masterVault) return 'epic';
    const luck = (state.player.chestLuck || 0) + Math.max(0, (chest.tier || 1) - 1) * 5;
    const roll = state.rng() * 100 - luck;
    if (roll >= 82) return 'epic';
    if (roll >= 46) return 'rare';
    return 'common';
  }
  function openMapChest(chest) {
    if (!state.singleMap || !chest || chest.opened) return;
    chest.opened = true; chest.revealed = true;
    state.singleMap.chestsOpened = state.singleMap.chestsOpened || [];
    state.singleMap.chestsOpened.push({ id: chest.id, region: chest.region, tier: chest.tier });
    const rarity = rollChestRarity(chest);
    const rarityInfo = EQUIPMENT_RARITIES[rarity];
    const roll = chest.masterVault ? .14 + state.rng() * .86 : state.rng();
    if (roll < .14) {
      const keyId = REGION_KEY_IDS[chest.region] || 'iron_key';
      grantKey(state.player, keyId, { silent: true, source: '宝箱所得' });
      queueAcquisition({ type: 'chest', kicker: '宝箱开启', name: KEYS[keyId].name, icon: KEYS[keyId].icon, meta: `${rarityInfo.name} · 暗门钥匙`, desc: '宝箱夹层里藏着一把还能用的钥匙。', effects: [KEYS[keyId].desc, `当前持有 ${state.player.keys[keyId] || 0} 把`], note: '钥匙会自动收入行囊。' });
    } else if (roll < .76) {
      const pool = EQUIPMENT_ITEMS.filter((item) => item.rarity === rarity);
      const item = choice(state.rng, pool.length ? pool : EQUIPMENT_ITEMS.filter((entry) => entry.rarity === 'common'));
      const unit = acquireEquipment(state.player, item.id, { silent: true, autoEquip: true, source: '宝箱所得' });
      queueAcquisition({ type: 'chest', kicker: chest.masterVault ? '隐藏军仓 · 高级军备' : '宝箱开启', name: item.name, icon: item.icon, meta: `${rarityInfo.name}军备 · ${item.category}`, desc: `${item.desc} 宝箱中的物件比普通散落物资更完整。`, effects: item.effects.map((effect) => `${effect.label} ${effect.value}`), note: state.player.equippedEquipment.includes(unit.uid) ? '已自动装入空余军备槽。' : '已收入军备栏，可自由装备或卸下。' });
    } else if (roll < .93) {
      const merit = Math.round((15 + chest.tier * 12) * (1 + (state.player.relicMapBonus || 0) * .4));
      const supplies = 8 + chest.tier * 4;
      state.player.merit = (state.player.merit || 0) + merit;
      state.player.supplies = Math.min(state.player.maxSupplies, state.player.supplies + supplies);
      queueAcquisition({ type: 'chest', kicker: chest.masterVault ? '隐藏军仓 · 大批缴获' : '宝箱开启', name: '缴获物资', icon: '箱', meta: `${rarityInfo.name} · 军需`, desc: '箱内是散落的军功、口粮和可用零件。', effects: [`军功 +${merit}`, `补给 +${supplies}`], note: '资源已经直接收入队伍。' });
    } else {
      const available = RELICS.filter((relic) => !(state.player.relics || []).includes(relic.id));
      if (available.length) {
        const relic = choice(state.rng, available), result = grantRelic(state.player, relic.id, { silent: true });
        queueAcquisition({ type: 'chest', kicker: chest.masterVault ? '隐藏军仓 · 星火信物' : '宝箱开启 · 稀有发现', name: relic.name, icon: relic.icon, meta: `${relic.rarity}星火信物`, desc: relic.desc, effects: [relic.effect], note: result.synergies?.length ? `触发联动：${result.synergies.map((item) => item.name).join('、')}` : '信物已收入顶栏。' });
      } else {
        state.player.merit = (state.player.merit || 0) + 45;
        queueAcquisition({ type: 'chest', kicker: '宝箱开启', name: '重复信物回声', icon: '星', meta: `${rarityInfo.name} · 信物残片`, desc: '箱中的信物与行囊里的旧物相互呼应。', effects: ['军功 +45'], note: '重复信物已转化为军功。' });
      }
    }
    const materialChance = chest.masterVault ? 1 : rarity === 'epic' ? .72 : rarity === 'rare' ? .38 : 0;
    if (materialChance && state.rng() < materialChance) { const materialId = state.rng() < .55 ? 'tempered_steel' : 'machined_parts'; grantMaterial(state.player, materialId, chest.masterVault ? 2 : 1, { source: chest.masterVault ? '隐藏军仓 · 稀有材料' : '宝箱夹层' }); }
    playSound('level');
    updateMetaBars(); saveCurrentRun('map');
  }
  function resolveSingleRoom(room) {
    const map = state.singleMap;
    if (!map || map.triggering || !room || map.cleared.includes(room.id)) return;
    map.triggering = true;
    if (room.type === 'bonfire') { if (!room.lit) { room.lit = true; state.player.bonfiresLit = (state.player.bonfiresLit || 0) + 1; restoreAtBonfire(room, '点亮星火营火'); checkAchievements(); queueAcquisition({ type: 'bonfire', kicker: '点亮星火营火', name: room.name.split(' · ')[0], icon: '✦', meta: `${SINGLE_REGIONS[room.region].name} · ${SINGLE_LAYER_NAMES[room.layer]}`, desc: '星火已经点亮，队伍在这里休整，并记住了归返的位置。', effects: ['兵力完全恢复', '架势完全恢复', '设为复活点'], note: '再次来到这里，可以传送到其他已点亮的营火。' }); } else openBonfirePanel(room); map.triggering = false; renderSingleMap(); return; }
    if (room.type === 'camp') { state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.round(state.player.maxHp * .24)); state.player.morale = Math.min(100, state.player.morale + 10); markSingleRoomCleared(room.id); map.triggering = false; showToast('废弃营地：队伍恢复了部分兵力与士气。'); return; }
    if (room.type === 'cache') { const chest = (map.chests || []).find((entry) => entry.id === room.chestId); if (chest && !chest.opened) openMapChest(chest); else showToast('这里的军资已经被搜走。'); markSingleRoomCleared(room.id); map.triggering = false; renderSingleMap(); return; }
    if (room.type === 'event') { showChapterEvent(() => { markSingleRoomCleared(room.id); map.triggering = false; renderSingleMap(); }); return; }
    if (nodeHasEnemy(room)) {
      const enemy = room.enemy;
      state.chapter = Math.min(5, [0, 1, 3, 4, 5][room.region] || 0);
      const route = { id: `single-${room.id}`, title: room.type === 'boss' ? (room.bossTitle || room.name) : `${room.name} · ${SINGLE_REGIONS[room.region].name}`, kind: room.type === 'boss' ? 'boss' : 'battle', count: 1, xp: enemy.elite ? 1.72 : enemy.boss ? 2.1 : 1.12, supply: enemy.elite ? 8 : 0, heal: 0, elite: enemy.elite, singleRoomId: room.id, forcedEnemyType: room.type === 'boss' ? null : enemy.typeId, bossType: room.type === 'boss' ? enemy.typeId : null, bossTitle: room.type === 'boss' ? (room.bossTitle || map.bossTitle) : null, bossScale: room.type === 'boss' ? (room.bossScale || map.bossScale) : 1, bossTrait: room.bossTrait, bossCounter: room.bossCounter, bossIntro: room.bossIntro, finalBoss: room.type === 'boss' && room.region === map.finalRegion, bossRegion: room.region };
      state.currentRoute = route; startBattle(route, room.type === 'boss'); return;
    }
    markSingleRoomCleared(room.id); map.triggering = false; renderSingleMap();
  }
  function completeSingleRoomAfterBattle() {
    if (!state.singleMap || !state.currentRoute?.singleRoomId) return;
    const room = singleMapRoom(state.singleMap, state.currentRoute.singleRoomId);
    markSingleRoomCleared(state.currentRoute.singleRoomId);
    if (room?.type === 'elite') {
      const keyId = REGION_KEY_IDS[room.region] || 'iron_key';
      grantKey(state.player, keyId, { source: '击败精英所得' });
    }
    state.singleMap.triggering = false;
    renderSingleMap();
  }
  function interactSingleMap() {
    const map = state.singleMap;
    if (!map || state.screen !== 'map' || map.triggering) return;
    const action = mapActionFor(map);
    if (!action) { showToast('附近没有可互动的目标。靠近敌人、遗迹、暗道或物资后再试。'); return; }
    if (action.kind === 'blocked') { showToast(`${action.label}。先击败拦路强敌。`); playSound('deny'); return; }
    if (action.kind === 'pickup') { resolveSinglePickup(map.pickups.find((entry) => entry.id === action.id)); return; }
    if (action.kind === 'interaction') { resolveSingleInteraction(map.interactions.find((entry) => entry.id === action.id)); return; }
    if (action.kind === 'trap') { resolveMapTrap(map.traps.find((entry) => entry.id === action.id)); return; }
    if (action.kind === 'door') { openMapDoor(map.doors.find((entry) => entry.id === action.id)); return; }
    if (action.kind === 'chest') { openMapChest(map.chests.find((entry) => entry.id === action.id)); return; }
    if (action.kind === 'npc') { const npc = map.npcs.find((entry) => entry.id === action.id); if (npc) openNpcPanel(npc.npcId); return; }
    if (action.kind === 'transition') {
      const transition = map.transitions.find((entry) => entry.id === action.id);
      if (!transition) return;
      const blockerId = singleMapBlockedBy(map, transition);
      if (blockerId) { showToast(`${singleMapBlockerName(map, blockerId)}拦住去路。先击败拦路强敌。`); playSound('deny'); return; }
      if (action.side === 'b' && transition.reverseRequiresDiscovery && !transition.discovered) { showToast('还没有找到通往这里的路。'); playSound('deny'); return; }
      const target = singleMapRoom(map, action.side === 'a' ? transition.bId : transition.aId);
      if (!target) return;
      transition.discovered = true;
      map.player.x = target.x;
      map.player.y = target.y;
      map.player.layer = target.layer;
      map.player.vx = 0;
      map.player.vy = 0;
      map.player.wallSlideSign = 0;
      map.currentId = target.id;
      map.regionIndex = target.region;
      if (!map.visited.includes(target.id)) map.visited.push(target.id);
      dom.singleMapLayerName.textContent = SINGLE_LAYER_NAMES[target.layer] || '地表';
      dom.singleMapRegionCount.textContent = `${target.region + 1} / ${map.regionCount || map.charts.length}`;
      dom.singleMapRoomRegion.textContent = SINGLE_REGIONS[target.region].name;
      dom.singleMapRoomName.textContent = target.name;
      dom.singleMapRoomDesc.textContent = target.desc;
      showToast(`${action.label}：${target.name}`);
      playSound('click');
      saveCurrentRun('map');
      return;
    }
    resolveSingleRoom(singleMapRoom(map, action.id));
  }
  function singleMapMovementRadius(map) {
    return Math.max(10, (map?.player?.r || 17) - 5);
  }

  function singleMapMovementClear(map, x, y, radius) {
    const bounds = map.bounds;
    if (!bounds || x < bounds.minX + radius || x > bounds.maxX - radius || y < bounds.minY + radius || y > bounds.maxY - radius) return false;
    return singleMapPointWalkable(map, x, y, radius);
  }

  function resolveSingleMapMovement(map, moveX, moveY) {
    const p = map?.player;
    if (!p) return { x: 0, y: 0, dx: 0, dy: 0, collided: false };
    const distance = Math.hypot(moveX, moveY);
    if (distance < .001) return { x: p.x, y: p.y, dx: 0, dy: 0, collided: false };
    const radius = singleMapMovementRadius(map);
    const steps = Math.max(1, Math.ceil(distance / 4));
    const stepX = moveX / steps, stepY = moveY / steps, stepLength = Math.hypot(stepX, stepY);
    const baseAngle = Math.atan2(stepY, stepX);
    const offsetDeck = [.24, -.24, .46, -.46, .7, -.7, .96, -.96, 1.24, -1.24];
    let x = p.x, y = p.y, collided = false;
    for (let step = 0; step < steps; step++) {
      if (singleMapMovementClear(map, x + stepX, y + stepY, radius)) {
        x += stepX; y += stepY;
        if (!collided) p.wallSlideSign = 0;
        continue;
      }
      collided = true;
      const preference = p.wallSlideSign || 1;
      let best = null;
      for (const scale of [1, .7, .4]) {
        for (const offset of offsetDeck) {
          const angle = baseAngle + offset;
          const candidateX = Math.cos(angle) * stepLength * scale;
          const candidateY = Math.sin(angle) * stepLength * scale;
          if (!singleMapMovementClear(map, x + candidateX, y + candidateY, radius)) continue;
          const affinity = Math.sign(offset) === preference ? .025 : 0;
          const score = Math.cos(offset) * scale + affinity;
          if (!best || score > best.score) best = { x: candidateX, y: candidateY, offset, score };
        }
      }
      if (!best) break;
      x += best.x; y += best.y;
      p.wallSlideSign = Math.sign(best.offset) || preference;
    }
    return { x, y, dx: x - p.x, dy: y - p.y, collided };
  }

  function updateSingleMap(now, dt) {
    const map = state.singleMap; if (!map) return;
    let dx = (movementInput.right ? 1 : 0) - (movementInput.left ? 1 : 0) + (controllerInput.right ? 1 : 0) - (controllerInput.left ? 1 : 0);
    let dy = (movementInput.down ? 1 : 0) - (movementInput.up ? 1 : 0) + (controllerInput.down ? 1 : 0) - (controllerInput.up ? 1 : 0);
    if (dx && dy) { dx *= .707; dy *= .707; }
    const hasInput = !!dx || !!dy;
    const p = map.player;
    if (!Number.isFinite(p.vx)) p.vx = 0;
    if (!Number.isFinite(p.vy)) p.vy = 0;
    if (!Number.isFinite(p.wallSlideSign)) p.wallSlideSign = 0;
    const sprinting = !!(movementInput.sprint || controllerInput.sprint) && hasInput;
    if (sprinting && !p.sprinting) p.sprintBurstUntil = now + 260;
    const burst = now < (p.sprintBurstUntil || 0);
    const speed = burst ? 780 : sprinting ? 460 : 255;
    const response = 1 - Math.exp(-(hasInput ? 18 : 26) * Math.max(0, dt));
    p.vx += (dx * speed - p.vx) * response;
    p.vy += (dy * speed - p.vy) * response;
    if (!hasInput && Math.hypot(p.vx, p.vy) < 2) { p.vx = 0; p.vy = 0; }
    const oldX = p.x, oldY = p.y;
    const movement = resolveSingleMapMovement(map, p.vx * dt, p.vy * dt);
    p.x = movement.x; p.y = movement.y;
    const moved = Math.hypot(p.x - oldX, p.y - oldY);
    if (moved > .02 && dt > 0) {
      p.vx = movement.dx / dt;
      p.vy = movement.dy / dt;
    } else if (movement.collided) {
      p.vx *= .25;
      p.vy *= .25;
    }
    p.moving = moved > .05; p.sprinting = p.moving && sprinting;
    if (moved > .05) {
      p.walkPhase = (p.walkPhase + moved * (sprinting ? .042 : .075)) % (Math.PI * 2);
      if (Math.abs(movement.dx) > .08) p.facing = movement.dx < 0 ? 'left' : 'right';
    }
    if ((hasInput || p.moving) && now - singleMapSaveAt > 4000) { singleMapSaveAt = now; saveCurrentRun('map'); }
    else if (!hasInput && !p.moving && singleMapWasMoving) { singleMapSaveAt = now; saveCurrentRun('map'); }
    singleMapWasMoving = hasInput || p.moving;
    if (sprinting && p.moving) { const sprung = (map.traps || []).find((trap) => trap.armed && trap.layer === p.layer && Math.hypot(p.x - trap.x, p.y - trap.y) < 30); if (sprung) { triggerMapTrap(sprung); return; } }
    const room = singleMapRoomAt(map, map.player.x, map.player.y);
    if (room && room.id !== map.currentId) {
      map.currentId = room.id;
      map.regionIndex = room.region;
      if (!map.visited.includes(room.id)) map.visited.push(room.id);
      if (['entry', 'exit'].includes(room.type) && !map.cleared.includes(room.id)) map.cleared.push(room.id);
      dom.singleMapRoomRegion.textContent = SINGLE_REGIONS[room.region].name;
      dom.singleMapRoomName.textContent = room.name;
      dom.singleMapRoomDesc.textContent = room.desc;
      dom.singleMapRegionCount.textContent = `${room.region + 1} / ${map.regionCount || map.charts.length}`;
      dom.singleMapLayerName.textContent = SINGLE_LAYER_NAMES[room.layer] || '地表';
      if (room.id !== map.lastSavedRoom) { map.lastSavedRoom = room.id; saveCurrentRun('map'); }
    }
    if (!singleMapUiRefreshAt || now >= singleMapUiRefreshAt) {
      map.nearbyAction = mapActionFor(map);
      updateSingleMapActionHint(map);
      renderSingleMapTasks(map);
      singleMapUiRefreshAt = now + (state.performanceMode ? 140 : 80);
    }
  }
  function traceMapClearing(ctx, room) {
    ctx.beginPath();
    for (let i = 0; i <= 18; i++) { const angle = (i / 18) * Math.PI * 2; const wobble = 1 + Math.sin(i * 2.7 + room.local * 1.3) * .08 + Math.cos(i * 1.9 + room.region) * .045; const x = room.x + Math.cos(angle) * room.r * wobble; const y = room.y + Math.sin(angle) * room.r * .78 * wobble; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.closePath();
  }
  function drawMapGuard(ctx, x, y, time, scale, elite, boss) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); const stride = Math.sin(time * .004 + x * .01) * 2.2;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 22, 17, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = boss ? '#e36854' : elite ? '#e1b46a' : '#b98767'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(-8 + stride, 24); ctx.moveTo(5, 8); ctx.lineTo(8 - stride, 24); ctx.stroke();
    ctx.fillStyle = boss ? '#521b19' : elite ? '#4b3522' : '#34251d'; ctx.beginPath(); ctx.roundRect(-10, -18, 20, 29, 5); ctx.fill(); ctx.strokeStyle = boss ? '#ff987d' : elite ? '#f0cc80' : '#d9b08e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#c7a17d'; ctx.beginPath(); ctx.arc(0, -26, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ece1cc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(boss ? 30 : 24, -34); ctx.stroke(); ctx.restore();
  }
  function drawSingleMapPlayer(ctx, map, time) {
    const p = map.player, moving = p.moving, sprint = p.sprinting, phase = p.walkPhase;
    const stride = moving ? Math.sin(phase) * (sprint ? 9 : 5.4) : 0;
    const armSwing = moving ? Math.sin(phase + Math.PI) * (sprint ? 10 : 6) : 0;
    const bodyBob = moving ? Math.abs(Math.sin(phase)) * (sprint ? 2.8 : 1.6) : Math.sin(time * .003) * .8;
    if (moving && sprint) {
      for (let ghost = 2; ghost >= 1; ghost--) {
        ctx.save(); ctx.globalAlpha = .07 + ghost * .035; ctx.fillStyle = '#e04c35';
        ctx.beginPath(); ctx.roundRect(p.x - (p.facing === 'left' ? -18 * ghost : 18 * ghost), p.y - 12, 22, 28, 7); ctx.fill(); ctx.restore();
      }
    }
    ctx.save(); ctx.translate(p.x, p.y); if (p.facing === 'left') ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.beginPath(); ctx.ellipse(0, 27, 18, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.translate(0, -bodyBob); ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c2119'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(-8 + stride, 28); ctx.moveTo(5, 10); ctx.lineTo(9 - stride, 28); ctx.stroke();
    ctx.strokeStyle = '#d1b36f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8 + stride, 28); ctx.lineTo(-12 + stride, 30); ctx.moveTo(9 - stride, 28); ctx.lineTo(13 - stride, 30); ctx.stroke();
    ctx.fillStyle = '#8e2f27'; ctx.beginPath(); ctx.roundRect(-12, -17, 24, 29, 6); ctx.fill(); ctx.strokeStyle = '#e2bb70'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#d6aa7c'; ctx.beginPath(); ctx.arc(0, -25, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#5b3527'; ctx.beginPath(); ctx.arc(-1, -29, 7.8, Math.PI, Math.PI * 2); ctx.fill();
    const leftHand = [-17 - armSwing * .22, 5 + armSwing * .72];
    const rightHand = [18 + armSwing * .22, 2 - armSwing * .72];
    ctx.strokeStyle = '#d6aa7c'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(leftHand[0], leftHand[1]); ctx.moveTo(8, -10); ctx.lineTo(rightHand[0], rightHand[1]); ctx.stroke();
    ctx.strokeStyle = '#e7d6aa'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rightHand[0], rightHand[1]); ctx.lineTo(sprint ? 36 : 31, -22 + armSwing * .18); ctx.stroke();
    ctx.strokeStyle = '#f3e0b1'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sprint ? 29 : 26, -15 + armSwing * .12); ctx.lineTo(sprint ? 37 : 33, -25 + armSwing * .12); ctx.stroke();
    ctx.fillStyle = '#e9c163'; ctx.beginPath(); ctx.arc(-7, -8, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a52721'; ctx.beginPath(); ctx.arc(-7, -8, 1.7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  // 单地图静态内容缓存（按 map 对象回收，不会跟着存档序列化）
  const singleMapStaticCache = new WeakMap();
  let singleMapContextCache = null;

  function drawSingleMapTerrain(ctx, map, now, camX, camY, width, height) {
    ctx.save();
    ctx.translate(-camX, -camY);
    // 静态内容按地图对象缓存一次：区域中心、区域光晕渐变、区域名都不随帧变化，
    // 之前每帧重建 5 个 createRadialGradient + 5 次房间数组过滤，纯浪费。
    let mapCache = singleMapStaticCache.get(map);
    if (!mapCache) {
      mapCache = { regionCenters: null, pathBBox: new WeakMap(), areaGradients: new WeakMap() };
      singleMapStaticCache.set(map, mapCache);
    }
    // 视口裁剪：大地图通常比画面大几倍，屏幕外的房间和路径不必逐帧重建路径、描边
    const viewMinX = camX - 140, viewMaxX = camX + width + 140;
    const viewMinY = camY - 140, viewMaxY = camY + height + 140;
    const clearedSet = new Set(map.cleared || []);
    const visitedSet = new Set(map.visited || []);
    if (!mapCache.regionCenters) {
      mapCache.regionCenters = Array.from({ length: map.regionCount || 3 }, (_, region) => {
        const rooms = map.rooms.filter((room) => room.region === region && !room.hiddenArea);
        if (!rooms.length) return null;
        return { region, x: rooms.reduce((sum, room) => sum + room.x, 0) / rooms.length, y: rooms.reduce((sum, room) => sum + room.y, 0) / rooms.length, palette: SINGLE_MAP_PALETTES[(region + 1) % SINGLE_MAP_PALETTES.length] };
      }).filter(Boolean);
    }
    mapCache.regionCenters.forEach((region) => {
      if (region.x + 760 < viewMinX || region.x - 760 > viewMaxX || region.y + 520 < viewMinY || region.y - 520 > viewMaxY) return;
      if (!state.performanceMode) {
        if (!region.gradient) {
          region.gradient = ctx.createRadialGradient(region.x, region.y, 40, region.x, region.y, 720);
          region.gradient.addColorStop(0, region.palette.ground);
          region.gradient.addColorStop(1, 'rgba(11,9,7,0)');
        }
        ctx.fillStyle = region.gradient; ctx.fillRect(region.x - 760, region.y - 520, 1520, 1040);
      }
      ctx.fillStyle = 'rgba(236,218,178,.3)'; ctx.font = 'bold 18px "Noto Serif SC", serif'; ctx.textAlign = 'center';
      ctx.fillText(SINGLE_REGIONS[region.region].name, region.x, region.y - 365);
    });
    if (!state.performanceMode) map.hiddenAreas?.forEach((unlocked, index) => { if (!unlocked) return; const rooms = map.rooms.filter((room) => room.region === index && room.hiddenArea); if (!rooms.length) return; const x = rooms.reduce((sum, room) => sum + room.x, 0) / rooms.length, y = rooms.reduce((sum, room) => sum + room.y, 0) / rooms.length; let gradient = mapCache.areaGradients.get(rooms[0]); if (!gradient) { gradient = ctx.createRadialGradient(x, y, 40, x, y, 620); gradient.addColorStop(0, SINGLE_MAP_PALETTES[3].ground); gradient.addColorStop(.6, 'rgba(32,20,27,.42)'); gradient.addColorStop(1, 'rgba(11,9,7,0)'); mapCache.areaGradients.set(rooms[0], gradient); } ctx.fillStyle = gradient; ctx.fillRect(x - 680, y - 470, 1360, 940); });
    map.paths.forEach((path) => {
      if ((path.secret && !path.open) || (path.hidden && !path.revealed) || (path.hiddenArea && !map.hiddenAreas?.[path.region])) return;
      let bbox = mapCache.pathBBox.get(path);
      if (!bbox) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        path.points.forEach((point) => {
          if (point.x < minX) minX = point.x;
          if (point.x > maxX) maxX = point.x;
          if (point.y < minY) minY = point.y;
          if (point.y > maxY) maxY = point.y;
        });
        bbox = { minX, minY, maxX, maxY };
        mapCache.pathBBox.set(path, bbox);
      }
      const pad = (path.width || 0) + 26;
      if (bbox.maxX + pad < viewMinX || bbox.minX - pad > viewMaxX || bbox.maxY + pad < viewMinY || bbox.minY - pad > viewMaxY) return;
      const palette = SINGLE_MAP_PALETTES[path.layer] || SINGLE_MAP_PALETTES[path.region], currentLayer = path.layer === map.player.layer;
      ctx.save(); ctx.globalAlpha = currentLayer ? 1 : .16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); path.points.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); });
      ctx.strokeStyle = '#080706'; ctx.lineWidth = path.width + 18; ctx.stroke();
      if (!state.performanceMode) {
        ctx.save(); ctx.globalAlpha = .28; ctx.strokeStyle = palette.edge; ctx.lineWidth = path.width + 8; ctx.stroke(); ctx.restore();
      }
      ctx.strokeStyle = palette.path; ctx.lineWidth = path.width; ctx.stroke();
      if (path.gate) { ctx.save(); ctx.globalAlpha = .38; ctx.strokeStyle = '#e4b75e'; ctx.lineWidth = 2; ctx.setLineDash([8, 12]); ctx.stroke(); ctx.restore(); }
      if (path.secret && path.open) { ctx.save(); ctx.globalAlpha = .58; ctx.strokeStyle = '#f0c968'; ctx.lineWidth = 2; ctx.setLineDash([5, 9]); ctx.stroke(); ctx.restore(); }
      const blockerId = singleMapBlockedBy(map, path);
      if (blockerId) { const mid = path.points[Math.floor(path.points.length * .55)] || path.points[0], isBossGate = path.requiresRegionBoss; ctx.save(); ctx.strokeStyle = isBossGate ? '#e25b47' : '#f0c76d'; ctx.fillStyle = isBossGate ? '#ff9b7a' : '#ffe1a0'; ctx.lineWidth = 3; ctx.setLineDash([4, 7]); ctx.beginPath(); ctx.moveTo(mid.x - path.width * .42, mid.y - path.width * .35); ctx.lineTo(mid.x + path.width * .42, mid.y + path.width * .35); ctx.moveTo(mid.x + path.width * .42, mid.y - path.width * .35); ctx.lineTo(mid.x - path.width * .42, mid.y + path.width * .35); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(mid.x, mid.y, 25, 0, Math.PI * 2); ctx.stroke(); drawMapGuard(ctx, mid.x, mid.y + 12, now, isBossGate ? 1.18 : 1.02, !isBossGate, isBossGate); ctx.fillStyle = isBossGate ? '#ffb09c' : '#ffe3a4'; ctx.font = 'bold 13px "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText(`${singleMapBlockerName(map, blockerId)}拦路`, mid.x, mid.y + 54); ctx.restore(); }
      ctx.restore();
    });

    map.rooms.forEach((room) => {
      if (room.x + room.r + 90 < viewMinX || room.x - room.r - 90 > viewMaxX || room.y + room.r + 90 < viewMinY || room.y - room.r - 90 > viewMaxY) return;
      if (room.hiddenArea && !map.hiddenAreas?.[room.region]) return;
      const isCleared = clearedSet.has(room.id);
      const palette = SINGLE_MAP_PALETTES[room.layer] || SINGLE_MAP_PALETTES[room.region], known = map.charts[room.region] || visitedSet.has(room.id) || Math.hypot(map.player.x - room.x, map.player.y - room.y) < 360;
      ctx.save(); ctx.globalAlpha = room.layer === map.player.layer ? 1 : .17; traceMapClearing(ctx, room);
      ctx.fillStyle = isCleared ? '#1e1b15' : palette.ground; ctx.fill();
      ctx.strokeStyle = room.type === 'boss' ? '#d34f3e' : room.hiddenAccent && !isCleared ? room.hiddenAccent : isCleared ? 'rgba(137,116,78,.45)' : palette.edge; ctx.lineWidth = room.type === 'boss' ? 4 : room.hiddenArea ? 3.2 : 2.5; ctx.stroke();
      if (known) { ctx.fillStyle = isCleared ? 'rgba(219,197,155,.54)' : '#f0d69d'; ctx.font = 'bold 14px "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText(room.name.split(' · ')[0], room.x, room.y + room.r * .48); }
      if (!isCleared && known && !nodeHasEnemy(room)) { const info = SINGLE_ROOM_INFO[room.type]; ctx.fillStyle = room.type === 'boss' ? '#7d271f' : '#3a2a1b'; ctx.beginPath(); ctx.arc(room.x, room.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = palette.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#ffe2a1'; ctx.font = 'bold 21px serif'; ctx.fillText(info.glyph, room.x, room.y + 7); }
      ctx.restore();
    });
    ctx.restore();
  }

  function drawSingleMap(now) {
    const canvas = dom.singleMapCanvas, map = state.singleMap; if (!canvas || !map) return;
    if (!singleMapContextCache) singleMapContextCache = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const ctx = singleMapContextCache, width = canvas.clientWidth || 960, height = canvas.clientHeight || 540, dpr = state.performanceMode ? .8 : Math.min(1.5, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#0b0907'; ctx.fillRect(0, 0, width, height);
    const bounds = map.bounds, mapWidth = bounds.maxX - bounds.minX, mapHeight = bounds.maxY - bounds.minY;
    const maxCamX = Math.max(bounds.minX, bounds.maxX - width), maxCamY = Math.max(bounds.minY, bounds.maxY - height);
    const camX = mapWidth <= width ? bounds.minX - (width - mapWidth) / 2 : clamp(map.player.x - width / 2, bounds.minX, maxCamX);
    const camY = mapHeight <= height ? bounds.minY - (height - mapHeight) / 2 : clamp(map.player.y - height / 2, bounds.minY, maxCamY);
    const viewMinX = camX - 140, viewMaxX = camX + width + 140;
    const viewMinY = camY - 140, viewMaxY = camY + height + 140;
    let mapCache = singleMapStaticCache.get(map);
    if (!mapCache) { mapCache = { regionCenters: null, pathBBox: new WeakMap(), areaGradients: new WeakMap(), viewport: null }; singleMapStaticCache.set(map, mapCache); }
    if (state.performanceMode) {
      // 性能模式缓存当前视口内的区域底色、暗渠和道路。缓存只占一屏，滚动时复制旧画面并只补边缘，
      // 避免大地图离屏缓存占用成倍显存，也避免每帧重新铺设整张道路。
      const viewport = mapCache.viewport;
      const stateSignature = [
        map.player.layer, map.charts.map((value) => value ? 1 : 0).join(''),
        map.hiddenAreas?.map((value) => value ? 1 : 0).join('') || '',
        map.puzzleSolved?.map((value) => value ? 1 : 0).join('') || '',
        map.cleared?.length || 0, map.visited?.length || 0,
        map.paths?.filter((path) => path.open).length || 0,
        map.paths?.filter((path) => path.revealed).length || 0,
        Math.floor(map.player.x / 160), Math.floor(map.player.y / 160), width, height, dpr
      ].join('|');
      const moveLimit = 96;
      const needsRebuild = !viewport || viewport.signature !== stateSignature || viewport.width !== width || viewport.height !== height || Math.abs(viewport.camX - camX) > moveLimit || Math.abs(viewport.camY - camY) > moveLimit;
      if (needsRebuild) {
        const cacheCanvas = viewport?.canvas || document.createElement('canvas');
        const cachePixelWidth = Math.max(1, Math.round(width * dpr)), cachePixelHeight = Math.max(1, Math.round(height * dpr));
        if (cacheCanvas.width !== cachePixelWidth || cacheCanvas.height !== cachePixelHeight) { cacheCanvas.width = cachePixelWidth; cacheCanvas.height = cachePixelHeight; }
        const cacheCtx = cacheCanvas.getContext('2d');
        cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cacheCtx.clearRect(0, 0, width, height);
        drawSingleMapTerrain(cacheCtx, map, now, camX, camY, width, height);
        mapCache.viewport = { canvas: cacheCanvas, camX, camY, width, height, signature: stateSignature };
      }
      const cached = mapCache.viewport;
      const offsetX = cached.camX - camX, offsetY = cached.camY - camY;
      ctx.drawImage(cached.canvas, offsetX, offsetY, width, height);
      const exposed = [];
      if (offsetX > .5) exposed.push([0, 0, offsetX, height]);
      else if (offsetX < -.5) exposed.push([width + offsetX, 0, -offsetX, height]);
      if (offsetY > .5) exposed.push([0, 0, width, offsetY]);
      else if (offsetY < -.5) exposed.push([0, height + offsetY, width, -offsetY]);
      if (exposed.length) {
        ctx.save();
        ctx.beginPath();
        exposed.forEach(([x, y, w, h]) => ctx.rect(x, y, Math.max(0, w), Math.max(0, h)));
        ctx.clip();
        drawSingleMapTerrain(ctx, map, now, camX, camY, width, height);
        ctx.restore();
      }
    } else {
      drawSingleMapTerrain(ctx, map, now, camX, camY, width, height);
    }
    ctx.save();
    ctx.translate(-camX, -camY);
    const clearedSet = new Set(map.cleared || []);
    const visitedSet = new Set(map.visited || []);
    const charted = !!map.charts[map.regionIndex];
    map.rooms.filter((room) => nodeHasEnemy(room) && !clearedSet.has(room.id) && (!room.hiddenArea || map.hiddenAreas?.[room.region])
      && room.x + 120 >= viewMinX && room.x - 120 <= viewMaxX && room.y + 120 >= viewMinY && room.y - 120 <= viewMaxY).forEach((room) => {
      const distance = Math.hypot(map.player.x - room.x, map.player.y - room.y);
      if (!map.charts[room.region] && distance > 470) return;
      ctx.save(); ctx.globalAlpha = room.layer === map.player.layer ? 1 : .13;
      drawMapGuard(ctx, room.x + (room.local % 2 ? 32 : -32), room.y + 18, now, room.enemy.boss ? 1.25 : room.enemy.elite ? 1.08 : .92, room.enemy.elite, room.enemy.boss);
      const base = ENEMY_TYPES[room.enemy.typeId], variant = room.enemy.elite ? ELITE_VARIANTS[room.enemy.typeId] : null, enemyName = room.enemy.boss ? (room.bossTitle || map.bossTitle) : variant?.name || base?.name || '敌军';
      if (distance < 320 || map.charts[room.region]) { ctx.fillStyle = room.enemy.boss ? '#ff9c86' : room.enemy.elite ? '#f1ca78' : '#d8b08b'; ctx.font = 'bold 13px "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText(enemyName, room.x, room.y - 72); }
      ctx.restore();
    });
    (map.pickups || []).forEach((pickup) => {
      if (pickup.collected || pickup.layer !== map.player.layer || (pickup.hiddenArea && !map.hiddenAreas?.[pickup.region])) return;
      if (pickup.requiresPuzzle && !map.puzzleSolved?.[pickup.region]) return;
      const distance = Math.hypot(map.player.x - pickup.x, map.player.y - pickup.y); if (distance > mapPickupDetectRadius(pickup, state.player)) return;
      const info = SINGLE_PICKUP_INFO[pickup.kind], pulse = .5 + .5 * Math.sin(now * .006 + pickup.x);
      ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = pickup.kind === 'chart' ? `rgba(122,208,168,${.35 + pulse * .34})` : pickup.kind === 'relic' ? `rgba(226,121,86,${.4 + pulse * .3})` : `rgba(237,191,102,${.35 + pulse * .34})`;
      ctx.shadowColor = pickup.kind === 'chart' ? 'rgba(104,219,173,.7)' : pickup.kind === 'relic' ? 'rgba(255,121,79,.8)' : 'rgba(255,210,110,.7)'; ctx.shadowBlur = 14; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
      ctx.fillStyle = '#fff1bd'; ctx.font = 'bold 11px serif'; ctx.textAlign = 'center'; ctx.fillText(info.glyph, pickup.x, pickup.y + 4);
    });
    (map.interactions || []).forEach((item) => {
      if (item.solved || item.layer !== map.player.layer) return;
      const distance = Math.hypot(map.player.x - item.x, map.player.y - item.y); if (distance > (state.player.relicSecretSense || 95) + 75) return;
      const info = SINGLE_INTERACTION_INFO[item.kind] || SINGLE_INTERACTION_INFO.secret_wall;
      ctx.save(); ctx.globalAlpha = .75 + .2 * Math.sin(now * .004); ctx.strokeStyle = item.kind === 'relay' ? '#9fc8d1' : '#d8b77a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(item.x - 10, item.y + 8); ctx.lineTo(item.x, item.y - 9); ctx.lineTo(item.x + 9, item.y + 8); ctx.stroke();
      ctx.fillStyle = '#ead09b'; ctx.font = 'bold 11px serif'; ctx.textAlign = 'center'; ctx.fillText(info.glyph, item.x, item.y + 22); ctx.restore();
    });
    (map.traps || []).forEach((trap) => {
      if (trap.layer !== map.player.layer) return;
      const distance = Math.hypot(map.player.x - trap.x, map.player.y - trap.y);
      if (!map.charts[trap.region] && distance > 240) return;
      const info = TRAP_INFO[trap.kind], pulse = .5 + .5 * Math.sin(now * .009 + trap.x);
      ctx.save(); ctx.globalAlpha = trap.armed ? .55 + pulse * .35 : .2;
      ctx.strokeStyle = trap.armed ? '#ef7659' : '#8b7c68'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(trap.x - 12, trap.y - 8); ctx.lineTo(trap.x + 12, trap.y + 8); ctx.moveTo(trap.x + 12, trap.y - 8); ctx.lineTo(trap.x - 12, trap.y + 8); ctx.stroke();
      ctx.fillStyle = trap.armed ? '#ffd1a0' : '#a89880'; ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.fillText(info.glyph, trap.x, trap.y - 15); ctx.restore();
    });    (map.doors || []).forEach((door) => {
      if (door.layer !== map.player.layer || (door.hidden && !door.revealed)) return;
      const distance = Math.hypot(map.player.x - door.x, map.player.y - door.y);
      if (!map.charts[door.region] && distance > 280) return;
      ctx.save(); ctx.translate(door.x, door.y);
      ctx.strokeStyle = door.open ? 'rgba(126,178,139,.72)' : '#d4a14e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      if (door.open) { ctx.beginPath(); ctx.moveTo(-18, 14); ctx.lineTo(-18, -15); ctx.lineTo(1, -15); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-18, 16); ctx.lineTo(-18, -16); ctx.lineTo(18, -16); ctx.lineTo(18, 16); ctx.stroke(); ctx.fillStyle = '#ffe1a0'; ctx.font = 'bold 15px serif'; ctx.textAlign = 'center'; ctx.fillText('锁', 0, 5); }
      if (distance < 260) { ctx.fillStyle = door.open ? '#a8c9ad' : '#e7c077'; ctx.font = 'bold 11px "Noto Serif SC", serif'; ctx.fillText(door.open ? '已打开' : KEYS[door.keyId]?.name || '门锁', 0, 34); }
      ctx.restore();
    });
    (map.chests || []).forEach((chest) => {
      if (chest.layer !== map.player.layer || (chest.hidden && !chest.revealed) || (chest.hiddenArea && !map.hiddenAreas?.[chest.region])) return;
      const distance = Math.hypot(map.player.x - chest.x, map.player.y - chest.y);
      if (!chest.revealed && distance > 260) return;
      ctx.save(); ctx.translate(chest.x, chest.y);
      ctx.fillStyle = chest.opened ? 'rgba(74,58,42,.5)' : '#704326'; ctx.fillRect(-17, -8, 34, 22);
      ctx.strokeStyle = chest.opened ? 'rgba(174,146,101,.45)' : '#e9bb65'; ctx.lineWidth = 2; ctx.strokeRect(-17, -8, 34, 22);
      ctx.beginPath(); ctx.moveTo(-17, -8); ctx.quadraticCurveTo(0, chest.opened ? -30 : -20, 17, -8); ctx.stroke();
      ctx.fillStyle = '#ffe1a0'; ctx.font = 'bold 11px serif'; ctx.textAlign = 'center'; ctx.fillText(chest.opened ? '空' : '箱', 0, 6);
      if (!chest.opened && distance < 240) { ctx.fillStyle = '#edcb83'; ctx.font = 'bold 11px "Noto Serif SC", serif'; ctx.fillText('宝箱', 0, 31); }
      ctx.restore();
    });
    (map.npcs || []).forEach((npc) => {
      if (npc.layer !== map.player.layer || (npc.hiddenArea && !map.hiddenAreas?.[npc.region])) return;
      const distance = Math.hypot(map.player.x - npc.x, map.player.y - npc.y);
      if (!map.charts[npc.region] && distance > 430) return;
      drawMapGuard(ctx, npc.x, npc.y, now, .86, false, false);
      ctx.fillStyle = '#d8d6b3'; ctx.font = 'bold 12px "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText(npcById(npc.npcId)?.name || '老乡', npc.x, npc.y - 60);
      ctx.strokeStyle = 'rgba(155,203,195,.62)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(npc.x, npc.y - 7, 27, 0, Math.PI * 2); ctx.stroke();
    });
    (map.transitions || []).forEach((transition) => {
      if (transition.requiresHiddenArea && !map.hiddenAreas?.[transition.region]) return;
      const a = singleMapRoom(map, transition.aId), b = singleMapRoom(map, transition.bId);
      if (!a || !b) return;
      const current = transition.aLayer === map.player.layer || transition.bLayer === map.player.layer;
      const near = Math.min(Math.hypot(map.player.x - transition.aX, map.player.y - transition.aY), Math.hypot(map.player.x - transition.bX, map.player.y - transition.bY)) < 300;
      if (!map.charts[transition.region] && !near) return;
      const blockerId = singleMapBlockedBy(map, transition), midX = (transition.aX + transition.bX) / 2, midY = (transition.aY + transition.bY) / 2;
      ctx.save(); ctx.globalAlpha = current ? .72 : .16; ctx.strokeStyle = blockerId ? '#e25b47' : '#a9c4c9'; ctx.lineWidth = blockerId ? 3 : 2; ctx.setLineDash(blockerId ? [4, 6] : [4, 8]);
      ctx.beginPath(); ctx.moveTo(transition.aX, transition.aY); ctx.lineTo(transition.bX, transition.bY); ctx.stroke(); ctx.setLineDash([]);
      if (blockerId) { ctx.beginPath(); ctx.moveTo(midX - 13, midY - 10); ctx.lineTo(midX + 13, midY + 10); ctx.moveTo(midX + 13, midY - 10); ctx.lineTo(midX - 13, midY + 10); ctx.stroke(); }
      ctx.fillStyle = blockerId ? '#ffb09c' : '#dbe9e8'; ctx.font = 'bold 12px "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText(blockerId ? '封锁' : (SINGLE_LAYER_TRANSITION_SHORT[transition.kind] || '通'), midX, midY - 14); ctx.restore();
    });
    drawSingleMapPlayer(ctx, map, now);
    let targetPoint = null, targetRadius = 40;
    if (map.nearbyAction?.kind === 'node') { const node = singleMapRoom(map, map.nearbyAction.id); if (node) { targetPoint = node; targetRadius = node.r + 8; } }
    else if (map.nearbyAction?.kind === 'door') { const door = map.doors.find((item) => item.id === map.nearbyAction.id); if (door) { targetPoint = door; targetRadius = 34; } }
    else if (map.nearbyAction?.kind === 'chest') { const chest = map.chests.find((item) => item.id === map.nearbyAction.id); if (chest) { targetPoint = chest; targetRadius = 34; } }
    else if (map.nearbyAction?.kind === 'npc') { const npc = map.npcs.find((item) => item.id === map.nearbyAction.id); if (npc) { targetPoint = npc; targetRadius = 38; } }
    if (targetPoint) { ctx.save(); ctx.strokeStyle = map.nearbyAction?.kind === 'node' && targetPoint.type === 'boss' ? 'rgba(244,91,65,.9)' : 'rgba(244,209,124,.88)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(targetPoint.x, targetPoint.y, targetRadius, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    ctx.fillStyle = '#e6cf9c'; ctx.font = 'bold 14px "Noto Serif SC", serif'; ctx.textAlign = 'left'; ctx.fillText(SINGLE_REGIONS[map.regionIndex].name, 18, 26);
    if (width < 420 || height < 320) return;
    const miniW = Math.min(300, width * .24), miniH = Math.min(154, height * .28), miniX = 18, miniY = 44;
    const regionRooms = map.rooms.filter((room) => room.region === map.regionIndex && (!room.hiddenArea || map.hiddenAreas?.[map.regionIndex])); if (!regionRooms.length) return;
    const regionPaths = map.paths.filter((path) => path.region === map.regionIndex && (!path.secret || path.open) && (!path.hidden || path.revealed) && (!path.hiddenArea || map.hiddenAreas?.[map.regionIndex]));
    const all = regionRooms.concat(regionPaths.flatMap((path) => path.points));
    const mb = { left: Math.min(...all.map((point) => point.x)), right: Math.max(...all.map((point) => point.x)), top: Math.min(...all.map((point) => point.y)), bottom: Math.max(...all.map((point) => point.y)) };
    const scale = Math.min((miniW - 24) / Math.max(1, mb.right - mb.left), (miniH - 36) / Math.max(1, mb.bottom - mb.top));
    const miniPoint = (x, y) => [miniX + 12 + (x - mb.left) * scale, miniY + 25 + (y - mb.top) * scale];
    ctx.save(); ctx.fillStyle = 'rgba(11,8,6,.9)'; ctx.strokeStyle = 'rgba(226,183,96,.45)'; ctx.lineWidth = 1; ctx.fillRect(miniX, miniY, miniW, miniH); ctx.strokeRect(miniX, miniY, miniW, miniH); ctx.fillStyle = '#d9b86f'; ctx.font = 'bold 12px serif'; ctx.textAlign = 'left'; ctx.fillText(charted ? `已补全区域图 · ${SINGLE_LAYER_NAMES[map.player.layer]}` : '区域图未补全', miniX + 10, miniY + 16);
    if (charted) {
      regionPaths.forEach((path) => { ctx.save(); ctx.globalAlpha = path.layer === map.player.layer ? .72 : .2; ctx.strokeStyle = path.secret ? '#c9ad72' : 'rgba(158,135,93,.7)'; ctx.lineWidth = path.layer === map.player.layer ? 1.6 : 1; if (path.secret) ctx.setLineDash([2, 3]); ctx.beginPath(); path.points.forEach((point, index) => { const [x, y] = miniPoint(point.x, point.y); if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); ctx.restore(); });
      map.transitions.filter((transition) => transition.region === map.regionIndex && (!transition.requiresHiddenArea || map.hiddenAreas?.[map.regionIndex])).forEach((transition) => { const a = singleMapRoom(map, transition.aId), b = singleMapRoom(map, transition.bId); if (!a || !b) return; const [ax, ay] = miniPoint(a.x, a.y), [bx, by] = miniPoint(b.x, b.y); ctx.save(); ctx.strokeStyle = 'rgba(151,192,199,.55)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.restore(); });
      regionRooms.forEach((room) => { const [x, y] = miniPoint(room.x, room.y); ctx.save(); ctx.globalAlpha = room.layer === map.player.layer ? 1 : .25; ctx.fillStyle = map.cleared.includes(room.id) ? 'rgba(113,94,65,.7)' : room.type === 'boss' ? '#7d271f' : nodeHasEnemy(room) ? '#65251f' : 'rgba(58,41,27,.95)'; ctx.strokeStyle = room.type === 'boss' ? '#e25643' : nodeHasEnemy(room) ? '#c96a52' : '#d7aa58'; ctx.fillRect(x - 5, y - 4, 10, 8); ctx.strokeRect(x - 5, y - 4, 10, 8); ctx.restore(); });
    }
    const [px, py] = charted ? miniPoint(map.player.x, map.player.y) : [miniX + miniW / 2, miniY + miniH / 2]; ctx.fillStyle = '#d93a31'; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function startSingleMapLoop() {
    cancelAnimationFrame(singleMapFrame);
    singleMapLastTime = performance.now();
    singleMapLastRenderAt = 0;
    singleMapUiRefreshAt = 0;
    singleMapActionHintSignature = '\u0000';
    singleMapPausedRendered = false;
    const tick = (now) => {
      if (state.screen !== 'map') { singleMapFrame = 0; return; }
      const frameInterval = state.performanceMode ? 1000 / 30 - 2 : 0;
      if (frameInterval && singleMapLastRenderAt && now - singleMapLastRenderAt < frameInterval) {
        singleMapFrame = requestAnimationFrame(tick);
        return;
      }
      const mapPaused = state.pauseOpen || state.saveManagerOpen || state.testModeOpen || state.restartPromptOpen || gameplayPausedByOverlay();
      if (mapPaused) {
        singleMapLastTime = now;
        if (!singleMapPausedRendered) {
          drawSingleMap(now);
          singleMapPausedRendered = true;
          singleMapLastRenderAt = now;
        }
        singleMapFrame = requestAnimationFrame(tick);
        return;
      }
      singleMapPausedRendered = false;
      const dt = Math.min(.05, Math.max(0, (now - singleMapLastTime) / 1000));
      singleMapLastTime = now;
      updateSingleMap(now, dt);
      drawSingleMap(now);
      singleMapLastRenderAt = now;
      singleMapFrame = requestAnimationFrame(tick);
    };
    singleMapFrame = requestAnimationFrame(tick);
  }
  function renderRouteScreen(preserveOptions = false) {
    dom.routeBossForecast?.classList.add('hidden');
    const chapter = CHAPTERS[state.chapter];
    dom.routeEyebrow.textContent = `${chapter.act} · ${chapter.name} · ${state.battle === 0 ? '第一战' : '第二战'}`;
    dom.routeTitle.textContent = state.battle === 0 ? '第一步，向哪里走？' : '敌军正在重新部署';
    dom.routeDesc.textContent = chapter.subtitle;
    if (dom.routeMerit) dom.routeMerit.textContent = Math.round(state.player?.merit || 0);
    if (dom.routeShopHint) {
      const untilShop = 4 - ((state.battleNumber || 0) % 4);
      dom.routeShopHint.textContent = untilShop <= 1 ? '军需队就在前方，路上也可能遇到流动军需站。' : `再走 ${untilShop} 段路，就会遇见军需队；途中也可能碰上流动军需站。`;
    }
    if (!preserveOptions || !state.routeOptions.length) state.routeOptions = shuffle(state.rng, ROUTE_TYPES).slice(0, 3);
    selectedRouteIndex = state.routeOptions.length ? 0 : -1;
    const mapOrder = ['ruijin', 'xiangjiang', 'zunyi', 'chishui', 'jinsha', 'dadu', 'luding', 'snow', 'grass', 'wuqi', 'huining'];
    const mapLabels = ['瑞金出发', '突破湘江', '遵义转折', '四渡赤水', '巧渡金沙江', '强渡大渡河', '飞夺泸定桥', '翻越夹金山', '穿越松潘草地', '抵达吴起镇', '会宁会师'];
    const mapKinds = ['start', 'river', 'milestone', 'river', 'river', 'river', 'milestone', 'mountain', 'mountain', 'milestone', 'rally'];
    const routeStepCount = 11;
    const routeProgress = clamp(.035 + (state.battleNumber / routeStepCount) * .93, .035, .965);
    const mapCurrentIndex = Math.min(mapOrder.length - 1, Math.round((state.battleNumber / routeStepCount) * (mapOrder.length - 1)));
    dom.routeMap.dataset.chapter = String(state.chapter);
    dom.routeMap.dataset.progress = routeProgress.toFixed(4);
    dom.routeMap.querySelectorAll('.route-node').forEach((node) => {
      const nodeIndex = mapOrder.findIndex((key) => node.classList.contains(`node-${key}`));
      if (nodeIndex >= 0) node.classList.add(`kind-${mapKinds[nodeIndex]}`);
      node.classList.toggle('past', nodeIndex >= 0 && nodeIndex < mapCurrentIndex);
      node.classList.toggle('current', nodeIndex === mapCurrentIndex);
      node.classList.toggle('future', nodeIndex > mapCurrentIndex);
    });
    const marchPath = document.getElementById('long-march-path');
    const progressPath = document.getElementById('route-progress-path');
    if (marchPath && progressPath) {
      const totalLength = marchPath.getTotalLength();
      progressPath.style.strokeDasharray = `${(totalLength * routeProgress).toFixed(2)} ${(totalLength + 2).toFixed(2)}`;
      const marker = dom.routeMap.querySelector('.march-column');
      const startPoint = marchPath.getPointAtLength(totalLength * routeProgress);
      if (marker) marker.setAttribute('transform', `translate(${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)})`);
    }
    if (dom.routeMapProgress) {
      dom.routeMapProgress.textContent = `已走 ${state.battleNumber} 段 · 共 12 段 · ${mapLabels[mapCurrentIndex]}`;
    }
    const progress = `<div class="route-progress">${Array.from({ length: 12 }, (_, i) => {
      const cls = i < state.battleNumber ? 'done' : i === state.battleNumber ? 'now' : '';
      return `<i class="${cls}"></i>`;
    }).join('')}</div>`;
    dom.routeCards.innerHTML = progress + state.routeOptions.map((route, index) => `
      <article class="choice-card" data-route-card="${index}" role="button" tabindex="0" aria-pressed="false">
        <div class="choice-icon">${route.icon}</div>
        <h3>${route.title}</h3>
        <p>${route.desc}</p>
        <div class="choice-tags">${route.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <div class="choice-card-footer"><span class="choice-card-action">点击选择</span><button class="choice-detail-link" type="button" data-route-detail="${index}">查看详情</button></div>
      </article>`).join('');
    dom.routeCards.querySelectorAll('[data-route-card]').forEach((card) => {
      const index = Number(card.dataset.routeCard);
      card.addEventListener('click', () => selectRouteCard(index));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRouteCard(index);
        }
      });
    });
    dom.routeCards.querySelectorAll('[data-route-detail]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedRouteIndex = Number(button.dataset.routeDetail);
        updateRouteSelection();
        openRouteDetail(selectedRouteIndex);
      });
    });
    updateRouteSelection();
    setMeta();
    setScreen('route');
    startRouteMapAnimation();
    saveCurrentRun('route');
  }

  function improvementEvent(event) {
    return !!event?.choices?.some((option) => option.relicId || option.techniqueId);
  }
  function eventRouteOption(event) {
    const improved = improvementEvent(event);
    return { id: `event-${event.id}`, kind: 'event', eventId: event.id, icon: improved ? '星' : '事', title: event.title, subtitle: event.desc, desc: event.desc, tags: improved ? ['星火机遇', '代价换取'] : ['随机事件', '可作出选择'], count: 0, xp: 0, supply: 0, heal: 0 };
  }
  function selectActBoss(actIndex = state.act) {
    const act = ROGUELIKE_ACTS[actIndex] || ROGUELIKE_ACTS[0];
    const boss = choice(state.rng, act.bossPool);
    return { ...boss, act: actIndex };
  }
  function currentActBoss() {
    if (!state.actBoss || state.actBoss.act !== state.act) state.actBoss = selectActBoss(state.act);
    return state.actBoss;
  }
  function eventRouteOptions() {
    const unused = EVENTS.filter((event) => !state.usedEvents.includes(event.id));
    const themed = unused.filter((event) => !event.chapters || event.chapters.includes(state.chapter));
    const source = themed.length >= 3 ? themed : (unused.length >= 3 ? unused : EVENTS);
    const rewardPool = shuffle(state.rng, source.filter(improvementEvent));
    const ordinaryPool = shuffle(state.rng, source.filter((event) => !improvementEvent(event)));
    const picked = [];
    if (rewardPool.length) picked.push(rewardPool.shift());
    [...ordinaryPool, ...rewardPool].forEach((event) => { if (picked.length < 3 && !picked.includes(event)) picked.push(event); });
    return shuffle(state.rng, picked).slice(0, 3).map(eventRouteOption);
  }
  function battleRouteOptions() {
    return [
      { id: 'battle-vanguard', kind: 'battle', icon: '锋', title: '截击前哨', subtitle: '主动咬住敌军前哨', desc: '一名敌将拦路。敌情较轻，适合稳定积累军功与历练。', tags: ['普通战', '稳扎稳打'], count: 1, xp: 1.12, supply: 0, heal: 0 },
      { id: 'battle-supply', kind: 'battle', icon: '粮', title: '夺取辎重', subtitle: '趁敌军换防截下补给', desc: '战后获得补给，但敌军会有所防备。', tags: ['普通战', '补给'], count: 1, xp: 1.08, supply: 11, heal: 0, firstStun: false },
      { id: 'battle-pincer', kind: 'battle', icon: '夹', title: '两面接敌', subtitle: '从侧翼同时压上', desc: '同时面对两名敌军，胜利后的历练更丰厚。', tags: ['双敌', '厚赏'], count: 2, xp: 1.5, supply: 0, heal: 0, support: true }
    ];
  }
  function eliteRouteOptions() {
    const actPressure = state.act * .08;
    return [
      { id: `elite-assault-${state.act}`, kind: 'elite', icon: '⚔', title: '正面破阵', subtitle: '直取精英据点', desc: '迎战劲敌，胜利后获得更高历练与军功。', tags: ['精英', '厚赏'], count: 1, xp: 1.72 + actPressure, supply: 0, heal: 0, elite: true },
      { id: `elite-night-${state.act}`, kind: 'elite', icon: '夜', title: '夜袭据点', subtitle: '借夜色先乱敌阵', desc: '敌将开场迟滞，但战后补给较少。', tags: ['精英', '先机'], count: 1, xp: 1.64 + actPressure, supply: 3, heal: 0, elite: true, firstStun: true },
      { id: `elite-bait-${state.act}`, kind: 'elite', icon: '诱', title: '诱敌出战', subtitle: '以物资换取主动', desc: '消耗部分补给，换取战前休整与更稳的节奏。', tags: ['精英', '休整'], count: 1, xp: 1.6 + actPressure, supply: -8, heal: 16, elite: true }
    ];
  }
  function campRouteOptions() {
    return [
      { id: `camp-rest-${state.act}`, kind: 'camp', icon: '营', title: '抓紧休整', subtitle: '先让队伍恢复体力', desc: '恢复较多兵力与士气，但不会获得额外历练。', tags: ['恢复', '整军'], count: 0, xp: 0, supply: 0, heal: 0, camp: { healPct: .3, morale: 12 } },
      { id: `camp-drill-${state.act}`, kind: 'camp', icon: '练', title: '临阵操练', subtitle: '把刚才的失误重新走一遍', desc: '获得历练，并小幅提高士气。', tags: ['历练', '士气'], count: 0, xp: 0, supply: 0, heal: 0, camp: { xp: 32 + state.act * 16, morale: 6 } },
      { id: `camp-scavenge-${state.act}`, kind: 'camp', icon: '搜', title: '轻装搜整', subtitle: '沿营地外围搜寻可用物资', desc: '获得补给与军功，但只恢复少量兵力。', tags: ['补给', '军功'], count: 0, xp: 0, supply: 0, heal: 0, camp: { healPct: .08, supplies: 14, merit: 24 } }
    ];
  }
  function buildRoguelikeRouteOptions() {
    const step = ROGUELIKE_STEPS[state.actStep] || 'event';
    if (step === 'event') return eventRouteOptions();
    if (step === 'battle') return battleRouteOptions();
    if (step === 'elite') return eliteRouteOptions();
    if (step === 'camp') return campRouteOptions();
    const boss = currentActBoss();
    return [{ id: `act-boss-${state.act}-${boss.id}`, kind: 'boss', icon: '首', title: boss.title, subtitle: '本幕最后的封锁', desc: `首领特性：${boss.trait}。${boss.counter}`, tags: ['首领战', '幕终', boss.trait], count: 1, xp: 2.1, supply: 0, heal: 0, bossType: boss.typeId, bossTitle: boss.title, bossScale: boss.scale, bossTrait: boss.trait, bossCounter: boss.counter, bossPattern: boss.pattern, bossRagePattern: boss.rage, finalActBoss: state.act === ROGUELIKE_ACTS.length - 1 }];
  }
  function routeChoiceOutcome(route) {
    if (route.kind === 'event') return { label: '可能获得', name: '信物 · 变招 · 军功', effect: '进入事件后选择具体做法。' };
    if (route.kind === 'camp') {
      const camp = route.camp || {}, gains = [];
      if (camp.healPct) gains.push(`兵力 +${Math.round(camp.healPct * 100)}%`);
      if (camp.morale) gains.push(`士气 +${camp.morale}`);
      if (camp.supplies) gains.push(`补给 +${camp.supplies}`);
      if (camp.xp) gains.push(`历练 +${camp.xp}`);
      if (camp.merit) gains.push(`军功 +${camp.merit}`);
      return { label: '整军获得', name: gains.join(' · ') || '整军', effect: route.subtitle };
    }
    if (route.kind === 'boss') return { label: '首领战', name: '丰厚历练 · 军功', effect: route.bossTrait || route.subtitle };
    return { label: route.elite ? '精英战' : '接战', name: `历练 ×${Number(route.xp || 1).toFixed(2)} · 军功`, effect: route.elite ? '多管血条 · 专属招式' : route.subtitle };
  }

  function renderRoguelikeRouteScreen(preserveOptions = false) {
    const act = ROGUELIKE_ACTS[state.act] || ROGUELIKE_ACTS[0];
    const boss = currentActBoss();
    const stepKind = ROGUELIKE_STEPS[state.actStep] || 'event';
    const stepNames = { event: '事件抉择', battle: '敌军拦路', elite: '精英拦路', camp: '整军抉择', boss: '本幕首领' };
    const titles = { event: '这次要怎样走？', battle: '先打掉哪一路？', elite: '劲敌盘踞在前', camp: '短暂整军', boss: '本幕最后一战' };
    const descs = { event: '选择本段事件。', battle: '选择交战方式。', elite: '选择精英战法。', camp: '选择整军所得。', boss: `本幕首领：${boss.title}` };
    dom.routeEyebrow.textContent = `${act.name} · ${stepNames[stepKind] || '继续前进'}`;
    dom.routeTitle.textContent = titles[stepKind] || '继续前进';
    dom.routeDesc.textContent = descs[stepKind] || '看清前路，再作决定。';
    if (dom.routeMerit) dom.routeMerit.textContent = Math.round(state.player?.merit || 0);
    if (dom.routeShopHint) dom.routeShopHint.textContent = `当前第 ${state.act + 1} 幕 · 第 ${state.actStep + 1} / ${ROGUELIKE_STEPS.length} 段`;
    if (dom.routeBossForecast) {
      dom.routeBossForecast.classList.remove('hidden');
      dom.routeBossForecast.innerHTML = `<div class="route-boss-mark">首</div><div><span>本幕首领 · 将在最终节点迎战</span><strong>${boss.title}</strong><p>${boss.trait} · ${boss.counter}</p></div>`;
    }
    if (!preserveOptions || !state.routeOptions.length) state.routeOptions = buildRoguelikeRouteOptions();
    selectedRouteIndex = state.routeOptions.length ? 0 : -1;
    dom.routeMap.dataset.chapter = String(state.chapter);
    if (dom.routeMapProgress) dom.routeMapProgress.textContent = `${act.name} · ${stepNames[stepKind] || '继续前进'}`;
    dom.routeCards.innerHTML = state.routeOptions.map((route, index) => `<article class="choice-card" data-route-card="${index}" role="button" tabindex="0" aria-pressed="false"><div class="choice-icon">${route.icon}</div><h3>${route.title}</h3>${cardKeyOutcomeHtml(routeChoiceOutcome(route))}<div class="choice-tags">${route.tags.map((tag) => `<span>${tag}</span>`).join('')}</div><div class="choice-card-footer"><span class="choice-card-action">点击选择</span><button class="choice-detail-link" type="button" data-route-detail="${index}">查看详情</button></div></article>`).join('');
    dom.routeCards.querySelectorAll('[data-route-card]').forEach((card) => { const index = Number(card.dataset.routeCard); card.addEventListener('click', () => selectRouteCard(index)); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRouteCard(index); } }); });
    dom.routeCards.querySelectorAll('[data-route-detail]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); selectedRouteIndex = Number(button.dataset.routeDetail); updateRouteSelection(); openRouteDetail(selectedRouteIndex); }));
    updateRouteSelection(); setMeta(); setScreen('route'); startRouteMapAnimation(); saveCurrentRun('route');
  }
  function showRoute(options = {}) {
    if (state.runMode === 'single') { if (!state.singleMap) state.singleMap = generateSingleMap(state.singlePace); renderSingleMap(); return; }
    if (state.runMode === 'roguelike') { renderRoguelikeRouteScreen(!!options.preserveOptions); return; }
    if (state.chapter >= CHAPTERS.length) { showBossIntro(); return; }
    renderRouteScreen(!!options.preserveOptions);
  }

  function updateRouteSelection() {
    const route = state.routeOptions[selectedRouteIndex];
    dom.routeCards.querySelectorAll('[data-route-card]').forEach((card) => {
      const selected = Number(card.dataset.routeCard) === selectedRouteIndex;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      const action = card.querySelector('.choice-card-action');
      if (action) action.textContent = gamepadChoiceActionText(selected);
    });
    updateSelectionFooter();
  }

  function selectRouteCard(index) {
    if (!state.routeOptions[index]) return;
    if (selectedRouteIndex === index) {
      openRouteDetail(index);
      return;
    }
    selectedRouteIndex = index;
    updateRouteSelection();
  }

  function openRouteDetail(index) {
    const route = state.routeOptions[index];
    if (!route) return;
    if (route.kind === 'event') {
      const event = EVENTS.find((candidate) => candidate.id === route.eventId);
      const improved = improvementEvent(event);
      openChoiceDetail({ kicker: '道路事件', title: route.title, body: '', highlight: { label: '可能获得', name: improved ? '信物 / 变招 / 军功' : '资源 / 军功', effect: '选定后进入事件，再选择具体做法。' }, effects: [{ label: '类型', value: improved ? '星火机遇' : '随机事件', tone: improved ? 'gain' : 'neutral' }], notes: [] });
      return;
    }
    const effects = [];
    if (route.kind === 'camp') {
      const camp = route.camp || {};
      if (camp.healPct) effects.push({ label: '兵力恢复', value: `${Math.round(camp.healPct * 100)}%`, tone: 'gain' });
      if (camp.morale) effects.push({ label: '士气', value: `+${camp.morale}`, tone: 'gain' });
      if (camp.supplies) effects.push({ label: '补给', value: `+${camp.supplies}`, tone: 'gain' });
      if (camp.xp) effects.push({ label: '历练', value: `+${camp.xp}`, tone: 'gain' });
      if (camp.merit) effects.push({ label: '军功', value: `+${camp.merit}`, tone: 'gain' });
    } else {
      effects.push(
        { label: '前方敌情', value: route.count === 1 ? '一名敌将' : '多名敌军', tone: 'neutral' },
        { label: '战后收获', value: route.xp >= 1.4 ? '丰厚' : route.xp > 1.1 ? '尚可' : '寻常', tone: route.xp > 1 ? 'gain' : 'neutral' }
      );
      if (route.elite) effects.push({ label: '来势', value: '劲敌拦路', tone: 'loss' });
      if (route.supply) effects.push({ label: '沿途补给', value: `+${route.supply}`, tone: 'gain' });
      if (route.heal) effects.push({ label: '战前休整', value: `恢复 ${route.heal} 兵力`, tone: 'gain' });
      if (route.firstStun) effects.push({ label: '夜袭先机', value: '敌将迟滞', tone: 'gain' });
      if (route.bossTrait) effects.push({ label: '首领特性', value: route.bossTrait, tone: 'loss' });
    }
    const outcome = routeChoiceOutcome(route);
    openChoiceDetail({
      kicker: '路线详情',
      title: route.title,
      body: route.desc,
      highlight: { label: outcome.label, name: outcome.name, effect: outcome.effect },
      effects,
      notes: [route.bossCounter ? `应对：${route.bossCounter}` : route.kind === 'camp' ? '选择后立即结算。' : '战斗结束后进入三选一成长。']
    });
  }

  function chooseRoute(index) {
    const route = state.routeOptions[index];
    if (!route) return;
    state.currentRoute = route;
    if (route.supply) state.player.supplies = clamp(state.player.supplies + route.supply, 0, state.player.maxSupplies);
    if (route.heal) state.player.hp = Math.min(state.player.maxHp, state.player.hp + route.heal);
    if (route.kind === 'event') {
      const event = EVENTS.find((candidate) => candidate.id === route.eventId);
      state.actStep += 1;
      showChapterEvent(() => showRoute(), event);
      return;
    }
    if (route.kind === 'camp') {
      const camp = route.camp || {};
      if (camp.healPct) state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.round(state.player.maxHp * camp.healPct));
      if (camp.morale) state.player.morale = Math.min(100, state.player.morale + camp.morale);
      if (camp.supplies) state.player.supplies = Math.min(state.player.maxSupplies, state.player.supplies + camp.supplies);
      if (camp.merit) state.player.merit = (state.player.merit || 0) + camp.merit;
      if (camp.xp) gainXp(camp.xp);
      updateMetaBars();
      state.actStep += 1;
      showToast(`${route.title}完成，队伍继续前进。`);
      showRoute();
      return;
    }
    if (route.kind === 'boss') { startBattle(route, true); return; }
    startBattle(route, false);
  }

  let selectedEventIndex = -1;
  let selectedTalentId = null;
  let selectedEquipmentUid = null;
  let currentNpcId = null;
  const acquisitionQueue = [];
  let acquisitionActive = false;

  function updateEventChoiceSelection() {
    const event = state.currentEvent;
    dom.eventCards.querySelectorAll('[data-event-card]').forEach((card) => {
      const index = Number(card.dataset.eventCard);
      const selected = index === selectedEventIndex;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      const action = card.querySelector('.event-choice-action');
      if (action) action.textContent = gamepadChoiceActionText(selected);
    });
    updateSelectionFooter();
  }

  function selectEventCard(index) {
    const event = state.currentEvent;
    if (!event?.choices?.[index]) return;
    if (selectedEventIndex === index) {
      openEventChoiceDetail(index);
      return;
    }
    selectedEventIndex = index;
    updateEventChoiceSelection();
  }

  function applyEventChoiceBonuses(player, choice) {
    const tag = choice?.tag || '';
    const supportTags = ['恢复', '休整', '互助', '救护', '粮秣', '补给', '整备'];
    const scoutTags = ['侦察', '探路', '隐蔽', '夜行', '急行', '节粮'];
    const meritGain = 10 + state.chapter * 3;
    player.merit = (player.merit || 0) + meritGain;
    if (supportTags.includes(tag)) {
      player.hp = Math.min(player.maxHp, player.hp + 5);
      player.morale = Math.min(100, player.morale + 2);
    } else if (scoutTags.includes(tag)) {
      player.supplies = Math.min(player.maxSupplies, player.supplies + 5);
    }
    return { meritGain, support: supportTags.includes(tag), scout: scoutTags.includes(tag) };
  }

  function eventChoiceAffordable(player, choice) {
    const cost = choice?.cost || {};
    return (!cost.hp || player.hp > cost.hp) && (!cost.supplies || player.supplies >= cost.supplies) && (!cost.morale || player.morale >= cost.morale) && (!cost.merit || (player.merit || 0) >= cost.merit);
  }

  function applyEventChoiceSpecial(player, choice) {
    const cost = choice?.cost || {};
    let reward = null;
    let techniqueUnlocked = null;
    if (cost.hp) player.hp = Math.max(1, player.hp - cost.hp);
    if (cost.supplies) player.supplies = Math.max(0, player.supplies - cost.supplies);
    if (cost.morale) player.morale = Math.max(0, player.morale - cost.morale);
    if (cost.merit) player.merit = Math.max(0, (player.merit || 0) - cost.merit);
    if (choice?.relicId) reward = grantRelic(player, choice.relicId);
    if (choice?.techniqueId) {
      techniqueUnlocked = unlockTechnique(player, choice.techniqueId);
      if (techniqueUnlocked?.duplicate) player.merit = (player.merit || 0) + 30;
    }
    return { reward, techniqueUnlocked };
  }

  function eventChoiceOutcome(choice) {
    const cost = resourceCostText(choice?.cost || {});
    if (choice?.relicId) {
      const relic = RELICS.find((entry) => entry.id === choice.relicId);
      if (relic) return { label: '获得信物', name: relic.name, effect: relic.effect, cost };
    }
    if (choice?.techniqueId) {
      const technique = PLAYER_TECHNIQUES[choice.techniqueId];
      if (technique) return { label: '学会变招', name: technique.name, effect: `${technique.input} · ${technique.desc}`, cost };
    }
    const preview = previewEventChoice(choice);
    const gains = preview.changes.filter((item) => item.value > 0);
    return {
      label: '获得',
      name: signedResourceList(gains) || (choice?.tag ? `${choice.tag}进展` : '继续行军'),
      effect: gains.length ? '' : (choice?.desc || ''),
      cost
    };
  }

  function eventChoiceEffectChips(choice) {
    const labels = { hp: '兵力', supplies: '补给', morale: '士气', merit: '军功' };
    const costEntries = Object.entries(choice?.cost || {}).filter(([, value]) => value);
    const costLabels = new Set(costEntries.map(([key]) => labels[key] || key));
    const chips = [{ label: '军功', value: `+${10 + state.chapter * 3}`, tone: 'gain' }];
    costEntries.forEach(([key, value]) => chips.push({ label: labels[key] || key, value: `-${value}`, tone: 'loss' }));
    const preview = previewEventChoice(choice);
    preview.changes.filter((item) => item.label !== '军功' && !costLabels.has(item.label)).forEach((item) => {
      chips.push({ label: item.label, value: `${item.value > 0 ? '+' : ''}${Math.round(item.value)}`, tone: item.value > 0 ? 'gain' : 'loss' });
    });
    return chips;
  }

  function previewEventChoice(choice) {
    const player = state.player;
    if (!player) return { changes: [], notes: [] };
    const clone = { ...player, cooldowns: { ...player.cooldowns }, upgrades: [...player.upgrades], relics: [...(player.relics || [])], relicSynergies: [...(player.relicSynergies || [])], techniques: [...(player.techniques || [])] };
    const before = {
      hp: player.hp, maxHp: player.maxHp, supplies: player.supplies,
      maxSupplies: player.maxSupplies, morale: player.morale, merit: player.merit
    };
    if (choice.apply) choice.apply(clone);
    const special = applyEventChoiceSpecial(clone, choice);
    const bonus = applyEventChoiceBonuses(clone, choice);
    const changes = [
      { label: '兵力', value: clone.hp - before.hp },
      { label: '兵力上限', value: clone.maxHp - before.maxHp },
      { label: '补给', value: clone.supplies - before.supplies },
      { label: '补给上限', value: clone.maxSupplies - before.maxSupplies },
      { label: '士气', value: clone.morale - before.morale },
      { label: '军功', value: clone.merit - before.merit }
    ].filter((item) => Math.abs(item.value) > .01);
    const notes = [];
    if (!eventChoiceAffordable(player, choice)) notes.push('资源不足，无法选择。');
    if (special.reward?.duplicate) notes.push('重复信物转化为军功。');
    if (special.reward) (special.reward.synergies || []).forEach((synergy) => notes.push(`联动：${synergy.name} · ${synergy.effect}`));
    if (special.techniqueUnlocked?.duplicate) notes.push('已经学会此变招，改为获得 30 军功。');
    return { changes, notes };
  }

  function openEventChoiceDetail(index) {
    const event = state.currentEvent;
    const choice = event?.choices?.[index];
    if (!event || !choice) return;
    const preview = previewEventChoice(choice);
    const outcome = eventChoiceOutcome(choice);
    dom.eventDetailKicker.textContent = '事件详情';
    dom.eventDetailTitle.textContent = choice.label;
    dom.eventDetailHistory.textContent = event.context || event.desc;
    dom.eventDetailOutcome.innerHTML = detailHighlightHtml({ label: outcome.label, name: outcome.name, effect: outcome.effect });
    dom.eventDetailOutcome.classList.toggle('hidden', !outcome.name);
    dom.eventDetailImpact.textContent = choice.desc || '';
    dom.eventDetailImpact.classList.toggle('hidden', !!(choice.relicId || choice.techniqueId));
    const effectChips = eventChoiceEffectChips(choice);
    dom.eventDetailEffects.innerHTML = effectChips.map((item) => effectChip(item.label, item.value, item.tone)).join('');
    dom.eventDetailMechanics.innerHTML = preview.notes.map((note) => `<li>${note}</li>`).join('');
    dom.eventDetailMechanics.closest('.event-detail-mechanics')?.classList.toggle('hidden', !preview.notes.length);
    dom.eventDetailOverlay.classList.remove('hidden');
    requestAnimationFrame(() => dom.eventDetailOverlay.focus({ preventScroll: true }));
  }

  function closeEventChoiceDetail() {
    dom.eventDetailOverlay.classList.add('hidden');
    const selected = dom.eventCards.querySelector(`[data-event-card="${selectedEventIndex}"]`);
    if (selected) requestAnimationFrame(() => selected.focus({ preventScroll: true }));
  }

  function showChapterEvent(callback, presetEvent = null) {
    const available = EVENTS.filter((event) => !state.usedEvents.includes(event.id));
    if (!presetEvent && !available.length) {
      callback();
      return;
    }
    const themed = available.filter((event) => event.chapters?.includes(state.chapter));
    const event = presetEvent || choice(state.rng, themed.length ? themed : available);
    state.currentEvent = event;
    if (!state.usedEvents.includes(event.id)) state.usedEvents.push(event.id);
    state.eventContinue = callback;
    selectedEventIndex = event.choices?.length ? 0 : -1;
    dom.eventDetailOverlay.classList.add('hidden');
    const fallbackScenes = ['', 'assets/events/chishui-river.webp', 'assets/events/jinsha-ferry.webp', 'assets/events/dadu-river.webp', 'assets/events/jiajin-snow.webp', 'assets/events/grassland.webp'];
    const fallbackCredits = ['', '赤水河 · HighestBridges / CC BY 4.0', '金沙江 · ogwen / CC BY-SA 3.0', '大渡河 · Huangdan2060 / CC0', '夹金山 · Lau Phang / CC BY-SA 3.0', '草地河湾 · Zhangmoon618 / Public domain'];
    const scene = event.scene || fallbackScenes[state.chapter] || fallbackScenes[1];
    const sceneCredit = event.sceneCredit || fallbackCredits[state.chapter] || fallbackCredits[1];
    dom.eventScreen.style.setProperty('--event-scene', `url("${scene}")`);
    dom.eventScreen.dataset.tone = ['ember', 'river', 'iron', 'frost', 'moss'][Math.max(0, state.chapter - 1)] || 'ember';
    if (dom.eventSceneCredit) dom.eventSceneCredit.textContent = `场景素材：${sceneCredit}`;
    dom.eventTitle.textContent = event.title;
    dom.eventDesc.textContent = `完成选择可得军功 +${10 + state.chapter * 3}`;
    if (dom.eventContext) {
      dom.eventContext.textContent = '';
      dom.eventContext.classList.add('hidden');
    }
    if (dom.eventSceneCredit) dom.eventSceneCredit.textContent = '';
    dom.eventCards.innerHTML = event.choices.map((choice, index) => {
      const outcome = eventChoiceOutcome(choice);
      return `<article class="choice-card event-choice" data-event-card="${index}" role="button" tabindex="0" aria-pressed="false">
        <span class="upgrade-rank">${choice.tag}</span>
        <h3>${choice.label}</h3>
        ${cardKeyOutcomeHtml(outcome)}
        <div class="choice-card-footer"><span class="event-choice-action">点击选择</span><button class="choice-detail-link" type="button" data-event-detail="${index}">查看详情</button></div>
      </article>`;
    }).join('');
    dom.eventCards.querySelectorAll('[data-event-card]').forEach((card) => {
      const index = Number(card.dataset.eventCard);
      card.addEventListener('click', () => selectEventCard(index));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectEventCard(index);
        }
      });
    });
    dom.eventCards.querySelectorAll('[data-event-detail]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedEventIndex = Number(button.dataset.eventDetail);
        updateEventChoiceSelection();
        openEventChoiceDetail(selectedEventIndex);
      });
    });
    updateEventChoiceSelection();
    setMeta();
    setScreen('event');
    saveCurrentRun('event');
  }

  function chooseEvent(index) {
    const event = state.currentEvent;
    const choice = event?.choices?.[index];
    if (!event || !choice || index !== selectedEventIndex) return;
    if (!eventChoiceAffordable(state.player, choice)) { showToast('当前资源不足，无法选择这一项。'); return; }
    if (choice.apply) choice.apply(state.player);
    const special = applyEventChoiceSpecial(state.player, choice);
    const eventBonus = applyEventChoiceBonuses(state.player, choice);
    state.player.hp = clamp(state.player.hp, 1, state.player.maxHp);
    state.player.supplies = clamp(state.player.supplies, 0, state.player.maxSupplies);
    state.player.morale = clamp(state.player.morale, 0, 100);
    updateMetaBars();
    const synergyNames = special.reward?.synergies?.map((synergy) => synergy.name) || [];
    const rewardMessage = special.reward ? ` · 获得${special.reward.relic.name}` : special.techniqueUnlocked ? ` · 学会${special.techniqueUnlocked.technique.name}` : '';
    const synergyMessage = synergyNames.length ? ` · 信物联动 ${synergyNames.join('、')}` : '';
    showToast(`事件：${choice.label}${rewardMessage}${synergyMessage} · 军功 +${eventBonus.meritGain}`);
    const callback = state.eventContinue;
    state.currentEvent = null;
    state.eventContinue = null;
    selectedEventIndex = -1;
    dom.eventDetailOverlay.classList.add('hidden');
    const canMeetShop = state.battleNumber - (state.lastRandomShopAt || -99) >= 4 && state.rng() < .24;
    if (canMeetShop) {
      state.lastRandomShopAt = state.battleNumber;
      setTimeout(() => openShop({ source: 'event', onContinue: callback, resumeAction: 'route' }), 420);
    } else {
      setTimeout(() => callback?.(), 420);
    }
  }

  function showBossIntro() {
    state.boss = true;
    setMeta();
    setScreen('boss');
    saveCurrentRun('boss');
  }

  function startBoss() {
    state.boss = true;
    state.currentRoute = { id: 'boss', title: '最后的封锁线', count: 1, xp: 1.6, supply: 0, heal: 0 };
    startBattle(state.currentRoute, true);
  }

  function updateRewardSelection() {
    const reward = state.pendingRewards[selectedRewardIndex];
    dom.rewardCards.querySelectorAll('[data-reward-card]').forEach((card) => {
      const selected = Number(card.dataset.rewardCard) === selectedRewardIndex;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      const action = card.querySelector('.choice-card-action');
      if (action) action.textContent = gamepadChoiceActionText(selected);
    });
    updateSelectionFooter();
  }

  function selectRewardCard(index) {
    if (!state.pendingRewards[index]) return;
    if (selectedRewardIndex === index) {
      openRewardDetail(index);
      return;
    }
    selectedRewardIndex = index;
    updateRewardSelection();
  }

  function openRewardDetail(index) {
    const reward = state.pendingRewards[index];
    if (!reward) return;
    const count = state.player.upgrades.filter((id) => id === reward.id).length;
    const effectText = (reward.effects || []).map((effect) => `${effect.label} ${effect.value}`).join(' · ');
    openChoiceDetail({
      kicker: '成长详情',
      title: reward.name,
      body: reward.detail || reward.desc,
      highlight: { label: '永久获得', name: effectText, effect: reward.notes?.[0] || '' },
      effects: reward.effects,
      notes: [count >= 2 ? '重复选择收益较低。' : '选定后永久生效。']
    });
  }

  const SHOP_PRICE_MULTIPLIER = 1.55;

  function shopItemCost(item) {
    const raw = (item.shopCost ?? item.cost) * SHOP_PRICE_MULTIPLIER * (1 - clamp(state.player?.shopDiscount || 0, 0, .3));
    return Math.max(5, Math.round(raw / 5) * 5);
  }

  function renderShop() {
    if (!state.player || !dom.shopItems) return;
    if (dom.shopMerit) dom.shopMerit.textContent = Math.round(state.player.merit || 0);
    dom.shopItems.innerHTML = state.shopItems.map((item, index) => {
      const cost = shopItemCost(item);
      const available = (item.stock ?? 1) > 0;
      const affordable = state.player.merit >= cost;
      const effectText = item.effects.map((effect) => `${effect.label} ${effect.value}`).join(' · ');
      const kindLabel = item.kind === 'relic' ? '信物' : item.kind === 'consumable' ? '小道具' : item.kind === 'equipment' ? '军备' : '战法效果';
      const destination = item.kind === 'relic' ? '永久收入信物栏' : item.kind === 'consumable' ? '收入战备栏，在战斗中按小道具键使用' : item.kind === 'equipment' ? '收入军备栏，可自由装备' : '立即生效';
      return `<article class="choice-card shop-item kind-${item.kind || 'effect'} ${available ? '' : 'sold-out'} ${index === selectedShopIndex ? 'selected' : ''}" data-shop-item="${index}" role="button" tabindex="0" aria-pressed="${index === selectedShopIndex}">
        <span class="upgrade-rank">${kindLabel} · ${available ? '限购 1 件' : '已售罄'}</span>
        <div class="choice-icon">${item.icon}</div>
        <h3>${item.name}</h3>
        ${cardKeyOutcomeHtml({ label: item.kind === 'relic' ? '获得信物' : item.kind === 'consumable' ? '获得小道具' : '获得效果', name: effectText || item.name, effect: destination })}
        <div class="shop-price">
          <span>${available ? `军功 ${cost}` : '已售罄'}</span>
          <button class="shop-buy" type="button" data-shop-buy="${index}" ${!available || !affordable ? 'disabled' : ''}>${available ? (affordable ? '买下' : '军功不足') : '已售罄'}</button>
        </div>
      </article>`;
    }).join('');
    dom.shopItems.querySelectorAll('[data-shop-item]').forEach((card) => {
      card.addEventListener('click', () => {
        selectedShopIndex = Number(card.dataset.shopItem);
        renderShop();
      });
    });
    dom.shopItems.querySelectorAll('[data-shop-buy]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        purchaseShopItem(Number(button.dataset.shopBuy));
      });
    });
  }

  function gamepadShopStep(direction, now) {
    if (!state.shopItems.length || now - gamepadLastMenuMove < 230) return;
    selectedShopIndex = ((selectedShopIndex + direction) % state.shopItems.length + state.shopItems.length) % state.shopItems.length;
    renderShop();
    const card = dom.shopItems.querySelector(`[data-shop-item="${selectedShopIndex}"]`);
    card?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    gamepadLastMenuMove = now;
  }

  function gamepadConfirmShop() {
    const item = state.shopItems[selectedShopIndex];
    if (!item) return;
    const cost = shopItemCost(item);
    if ((item.stock ?? 1) <= 0) {
      showToast('这件商品本店已售罄。');
      return;
    }
    if ((state.player.merit || 0) < cost) {
      showToast('军功不足，无法购买这件商品。');
      return;
    }
    purchaseShopItem(selectedShopIndex);
  }

  function openShop(options = {}) {
    if (!state.player) return;
    state.shopReturn = typeof options.onContinue === 'function' ? options.onContinue : null;
    state.shopSource = options.source || 'route';
    state.shopResumeAction = options.resumeAction || 'route';
    if (dom.shopEyebrow) dom.shopEyebrow.textContent = options.source === 'scheduled' ? '每四场 · 军需队抵达' : options.source === 'event' ? '行军偶遇 · 流动军需站' : '军需商店 · 军功兑换';
    if (dom.shopTitle) dom.shopTitle.textContent = '军需站';
    if (dom.shopDesc) dom.shopDesc.textContent = '每件限购 1 次。';
    state.shopItems = buildShopOffers();
    selectedShopIndex = state.shopItems.length ? 0 : -1;
    renderShop();
    setScreen('shop');
    saveCurrentRun('shop');
  }

  function purchaseShopItem(index) {
    const item = state.shopItems[index];
    if (!item || !state.player) return;
    state.player.shopCounts = state.player.shopCounts || {};
    const cost = shopItemCost(item);
    if ((item.stock ?? 1) <= 0) return;
    if ((state.player.merit || 0) < cost) {
      showToast('军功不足，继续战斗或完成行军事件再兑换。');
      return;
    }
    state.player.merit -= cost;
    item.apply(state.player);
    item.stock = 0;
    state.player.shopCounts[item.id] = (state.player.shopCounts[item.id] || 0) + 1;
    state.stats.shopPurchases = (state.stats.shopPurchases || 0) + 1;
    const effectLabels = (item.effects || []).map((effect) => `${effect.label} ${effect.value}`);
    const type = item.kind === 'relic' ? 'relic' : item.kind === 'consumable' ? 'consumable' : item.kind === 'equipment' ? 'equipment' : 'shop';
    const metaLabel = item.kind === 'relic' ? '信物' : item.kind === 'consumable' ? item.category || '小道具' : item.kind === 'equipment' ? '军备' : '战法效果';
    const note = item.kind === 'relic' ? '信物已收入顶栏，可查看联动。' : item.kind === 'consumable' ? `已收入战备栏，当前持有 ${state.player.consumables?.[item.consumableId] || 0} 个。` : item.kind === 'equipment' ? '军备已收入军备栏，可自由装备。' : '效果立即生效。';
    queueAcquisition({ type, kicker: '军需兑换 · 已支付军功', name: item.name, icon: item.icon, meta: `${metaLabel} · 军功 -${cost}`, desc: item.detail || item.desc || '军需站换来的补给。', effects: effectLabels.length ? effectLabels : ['效果已生效'], note });
    showToast(`兑换成功：${item.name}`);
    playSound('heal');
    updateMetaBars();
    renderShop();
    saveCurrentRun('shop');
  }

  function closeShop() {
    updateMetaBars();
    const callback = state.shopReturn;
    state.shopReturn = null;
    if (typeof callback === 'function') {
      callback();
      return;
    }
    setScreen('route');
    startRouteMapAnimation();
  }

  function showRewards(rewardIds = null) {
    if (dom.rewardSummary) {
      const xpEarned = state.combat?.xpEarned || 0;
      dom.rewardSummary.textContent = `历练 +${xpEarned} · 军功 +${state.combat?.meritEarned || 0} · 选择一项永久成长`;
    }
    const savedRewards = Array.isArray(rewardIds)
      ? rewardIds.map((id) => UPGRADES.find((upgrade) => upgrade.id === id)).filter(Boolean)
      : [];
    const pool = savedRewards.length ? savedRewards : shuffle(state.rng, UPGRADES.filter((upgrade) => {
      const count = state.player.upgrades.filter((id) => id === upgrade.id).length;
      return count < 2;
    }));
    state.pendingRewards = savedRewards.length ? savedRewards : pool.slice(0, 3);
    selectedRewardIndex = state.pendingRewards.length ? 0 : -1;
    dom.rewardCards.innerHTML = state.pendingRewards.map((upgrade, index) => {
      const effectText = (upgrade.effects || []).map((effect) => `${effect.label} ${effect.value}`).join(' · ');
      return `<article class="choice-card" data-reward-card="${index}" role="button" tabindex="0" aria-pressed="false">
        <span class="upgrade-rank">永久成长</span>
        <div class="choice-icon">${upgrade.icon}</div>
        <h3>${upgrade.name}</h3>
        ${cardKeyOutcomeHtml({ label: '获得效果', name: effectText || upgrade.name, effect: upgrade.desc })}
        <div class="choice-card-footer"><span class="choice-card-action">点击选择</span><button class="choice-detail-link" type="button" data-reward-detail="${index}">查看详情</button></div>
      </article>`;
    }).join('');
    dom.rewardCards.querySelectorAll('[data-reward-card]').forEach((card) => {
      const index = Number(card.dataset.rewardCard);
      card.addEventListener('click', () => selectRewardCard(index));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRewardCard(index);
        }
      });
    });
    dom.rewardCards.querySelectorAll('[data-reward-detail]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const index = Number(button.dataset.rewardDetail);
        selectedRewardIndex = index;
        updateRewardSelection();
        openRewardDetail(index);
      });
    });
    updateRewardSelection();
    setScreen('reward');
    saveCurrentRun('reward');
  }

  function chooseReward(index) {
    const upgrade = state.pendingRewards[index];
    if (!upgrade || index !== selectedRewardIndex) return;
    upgrade.apply(state.player);
    state.player.upgrades.push(upgrade.id);
    state.stats.upgrades += 1;
    const continueAfterReward = () => {
      showToast(`队伍习得：${upgrade.name}`);
      if (!state.boss && state.battleNumber > 0 && state.battleNumber % 4 === 0) {
        openShop({ source: 'scheduled', onContinue: proceedAfterReward, resumeAction: 'proceed-after-reward' });
      } else {
        proceedAfterReward();
      }
    };
    queueAcquisition({ type: 'upgrade', kicker: '战利品 · 队伍成长', name: upgrade.name, icon: upgrade.icon || '升', meta: '战斗所得 · 永久生效', desc: upgrade.detail || upgrade.desc || '这项成长会一直陪伴队伍。', effects: (upgrade.effects || []).map((effect) => `${effect.label} ${effect.value}`), note: upgrade.notes?.[0] || '效果已经生效。', onConfirm: continueAfterReward });
  }

  function proceedAfterReward() {
    if (state.runMode === 'single') {
      if (state.boss && state.currentRoute?.finalBoss) { showEnding(true); return; }
      completeSingleRoomAfterBattle();
      return;
    }
    if (state.runMode === 'roguelike') {
      if (state.boss) {
        if (state.act >= ROGUELIKE_ACTS.length - 1) { showEnding(true); return; }
        const finishedAct = state.act;
        state.act += 1;
        state.actStep = 0;
        state.boss = false;
        state.chapter = ROGUELIKE_ACTS[state.act].chapter;
        const p = state.player, firstActClear = finishedAct === 0;
        p.maxHp += firstActClear ? 48 : 34;
        p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * (firstActClear ? .58 : .42)));
        p.atk += firstActClear ? 4 : 2;
        p.defense += firstActClear ? 2 : 1;
        p.maxPosture += firstActClear ? 24 : 16;
        p.posture = 0;
        p.morale = Math.min(100, p.morale + (firstActClear ? 18 : 12));
        p.supplies = Math.min(p.maxSupplies, p.supplies + 20);
        p.merit = (p.merit || 0) + 35;
        const nextTechnique = PLAYER_TECHNIQUE_ORDER.find((id) => !(p.techniques || []).includes(id));
        const learned = nextTechnique ? unlockTechnique(p, nextTechnique) : null;
        if (!learned) p.merit += 45;
        const availableBossRelics = RELICS.filter((relic) => !(p.relics || []).includes(relic.id));
        const bossRelic = availableBossRelics.length ? choice(state.rng, availableBossRelics) : null;
        if (bossRelic) grantRelic(p, bossRelic.id, { source: '首领战利品' }); else p.merit += 60;
        const bossItem = choice(state.rng, CONSUMABLES);
        addConsumable(p, bossItem.id, firstActClear ? 2 : 1, { source: '首领战利品' });
        state.actBoss = selectActBoss(state.act);
        const nextBoss = state.actBoss;
        showHistory(ROGUELIKE_ACTS[finishedAct].chapter, () => {
          showToast(`首领战利品：${bossRelic ? bossRelic.name : '军功 +60'} · ${bossItem.name}${firstActClear ? ' ×2' : ''}；下一幕：${nextBoss.title}。`, 2600);
          showRoute();
        });
        return;
      }
      state.actStep += 1;
      showRoute();
      return;
    }
    if (state.battle === 1) {
      const chapterIndex = state.chapter;
      state.battle = 0;
      showHistory(chapterIndex, () => finishChapterAndContinue(chapterIndex));
    } else {
      state.battle = 1;
      showRoute();
    }
  }

  function finishChapterAndContinue(chapterIndex) {
    state.player.supplies = Math.min(state.player.maxSupplies, state.player.supplies + 18);
    state.player.morale = Math.min(100, state.player.morale + 7);
    state.player.merit = (state.player.merit || 0) + 12;
    state.chapter = chapterIndex + 1;
    if (state.chapter >= CHAPTERS.length) showBossIntro();
    else showChapterEvent(() => showRoute());
  }

  function showHistory(chapterIndex, callback) {
    const history = CHAPTERS[chapterIndex].history;
    dom.historyTitle.textContent = history.title;
    dom.historyDate.textContent = history.date;
    dom.historyPlace.textContent = history.place;
    dom.historySummary.textContent = history.summary;
    dom.historySignificance.textContent = history.significance;
    dom.historySources.innerHTML = sourceListHtml(history.sources);
    state.historyContinue = callback;
    setScreen('history');
    saveCurrentRun('history');
  }

  function showEnding(victory) {
    if (state.testMode || testRunActive) { exitTestMode(); return; }
    archiveRun(victory);
    state.finished = true;
    dom.endingScreen.classList.toggle('victory', victory);
    dom.endingScreen.classList.toggle('defeat', !victory);
    dom.endingEyebrow.textContent = victory ? '征途抵达 · 历史的回声' : '征途中止 · 山河未竟';
    dom.endingTitle.textContent = victory ? '胜利会师' : '队伍未能继续前进';
    dom.endingMark.textContent = victory ? '★' : '·';
    dom.endingCopy.textContent = victory
      ? '1936年10月，红一、红四方面军在会宁会合，红二方面军随后在将台堡、兴隆镇与红一方面军会师。红军三大主力胜利会师，长征胜利结束。这一路，你保住了队伍，也担下了每一次抉择的代价。'
      : '最后的封锁仍未突破。队伍在山河间停下脚步，但这一路拼出的刀锋、守住的阵脚，都已留在征途上。';
    dom.endingStats.innerHTML = `
      <div><span>闯过战阵</span><strong>${state.stats.victories} 场</strong></div>
      <div><span>队伍等级</span><strong>Lv.${state.player.level}</strong></div>
      <div><span>沿途所得</span><strong>${state.stats.upgrades}</strong></div>
      <div><span>军需所得</span><strong>${state.stats.shopPurchases || 0}</strong></div>
      <div><span>完美格挡</span><strong>${state.stats.parries || 0}</strong></div>
      <div><span>反击得手</span><strong>${state.stats.counters || 0}</strong></div>
      <div><span>处决</span><strong>${state.stats.executions || 0}</strong></div>
      <div><span>死亡次数</span><strong>${state.stats.deaths || state.player.deaths || 0} 次</strong></div>
      <div><span>行军难度</span><strong>${state.runMode === 'single' && state.singlePace === 'normal' ? difficultyLabel() : '快速模式'}</strong></div>
      <div><span>行军用时</span><strong>${formatRunDuration(state.runElapsedMs)}</strong></div>
      <div><span>余下军功</span><strong>${Math.round(state.player.merit || 0)}</strong></div>
      <div><span>行军种子</span><strong>${state.seed}</strong></div>`;
    dom.endingSourcePanel.innerHTML = sourceListHtml(victory ? ['dswHuining', 'cpcMarch', 'museum90', 'qstheory90'] : ['cpcSpirit', 'museum90']);
    dom.endingSourcePanel.classList.add('hidden');
    setMeta();
    setScreen('ending');
  }

  function resetRun(options = {}) {
    const preserveSave = options?.preserveSave === true;
    state.player = null;
    state.squadId = null;
    state.chapter = 0;
    state.battle = 0;
    state.battleNumber = 0;
    state.boss = false;
    state.finished = false;
    state.combat = null;
    state.actBoss = null;
    state.currentRoute = null;
    state.currentEvent = null;
    state.usedEvents = [];
    state.eventContinue = null;
    state.shopItems = [];
    state.shopSource = null;
    state.shopResumeAction = null;
    state.stats = { victories: 0, damage: 0, upgrades: 0, parries: 0, counters: 0, executions: 0, shopPurchases: 0, seed: state.seed };
    state.runElapsedMs = 0;
    state.runActiveSince = 0;
    state.runArchived = false;
    state.saveManagerOpen = false;
    state.acquisitionOpen = false;
    state.npcPanelOpen = false;
    state.pauseOpen = false;
    state.pauseStartedAt = 0;
    acquisitionQueue.length = 0;
    acquisitionActive = false;
    acquisitionCurrent = null;
    selectedTalentId = null;
    selectedEquipmentUid = null;
    currentNpcId = null;
    if (!preserveSave) clearCurrentRunSave();
    dom.acquisitionOverlay?.classList.add('hidden');
    dom.relicDetailOverlay?.classList.add('hidden');
    dom.growthOverlay?.classList.add('hidden');
    dom.equipmentOverlay?.classList.add('hidden');
    dom.npcOverlay?.classList.add('hidden');
    dom.bonfireOverlay?.classList.add('hidden');
    dom.pauseOverlay?.classList.add('hidden');
    currentBonfireId = null;
    dom.canvas.classList.add('hidden');
    dom.parryOverlay.className = 'parry-overlay hidden';
    parrySession = null;
    shotSession = null;
    scene.duel = null;
    scene.shotAim = null;
    scene.mikiri = null;
    scene.execution = null;
    setScreen('title');
    setMeta();
  }

  let testRunActive = false;
  let testModeSavedRun = false;
  let testModeFormalSnapshot = null;
  let testModeExitTimer = 0;
  let testRunEpoch = 0;

  function clearTestModeExitTimer() {
    if (testModeExitTimer) window.clearTimeout(testModeExitTimer);
    testModeExitTimer = 0;
  }

  function testScreenLabel() {
    return ({ title: '主界面', mode: '玩法选择', squad: '队伍选择', route: '行军路线', map: '俯视探索', event: '行军事件', reward: '战利品', shop: '军需站', battle: '战斗', boss: '首领战', history: '战史节点', ending: '结算' })[state.screen] || state.screen;
  }

  function renderTestMode() {
    if (!dom.testModeStatus) return;
    const p = testRunActive ? state.player : null;
    const activeEnemy = state.combat?.enemies?.find((enemy) => !enemy.dead);
    const health = activeEnemy ? enemyHealthState(activeEnemy) : null;
    const battleText = activeEnemy
      ? `${activeEnemy.name} · ${Math.max(0, Math.ceil(activeEnemy.hp))} 兵力 · ${health.remaining} 管`
      : (testRunActive ? '当前无战斗' : '尚未建立测试行军');
    dom.testModeStatus.innerHTML = `
      <span>测试状态<strong>${testRunActive ? '运行中 · 不记录' : state.testModeOpen ? '待开始' : '未开始'}</strong></span>
      <span>当前界面<strong>${testScreenLabel()}</strong></span>
      <span>变招<strong>${p ? `${(p.techniques || []).length} / ${Object.keys(PLAYER_TECHNIQUES).length}` : '—'}</strong></span>
      <span>信物<strong>${p ? `${p.relics?.length || 0} 件` : '—'}</strong></span>
      <span>军功<strong>${p ? Math.round(p.merit || 0) : '—'}</strong></span>
      <span>敌人<strong>${battleText}</strong></span>`;
    dom.testStartRun && (dom.testStartRun.textContent = testRunActive ? '重开测试行军' : '新建测试行军');
    dom.testSkipBattle && (dom.testSkipBattle.disabled = !(testRunActive && state.screen === 'battle' && state.combat && !state.combat.finished));
    dom.testSkipNode && (dom.testSkipNode.disabled = !testRunActive);
    dom.testGrantResources && (dom.testGrantResources.disabled = false);
    dom.testComboButtons.innerHTML = Object.values(PLAYER_TECHNIQUES).map((technique) => {
      const owned = !!p?.techniques?.includes(technique.id);
      return `<button type="button" data-test-technique="${technique.id}" ${p ? '' : 'disabled'} class="${owned ? 'active' : ''}" title="${technique.desc}"><b>${technique.name}</b><small>${technique.input}</small></button>`;
    }).join('');
    dom.testRelicList.innerHTML = RELICS.map((relic) => {
      const owned = !!p?.relics?.includes(relic.id);
      return `<button type="button" data-test-relic="${relic.id}" ${p ? '' : 'disabled'} class="${owned ? 'active' : ''}" title="${relic.desc}"><b>${relic.icon} ${relic.name}</b><small>${relic.effect}</small></button>`;
    }).join('');
    dom.testEquipmentList.innerHTML = EQUIPMENT_ITEMS.map((item) => {
      const owned = (p?.equipmentInventory || []).some((unit) => unit.itemId === item.id);
      return `<button type="button" data-test-equipment="${item.id}" ${p ? '' : 'disabled'} class="${owned ? 'active' : ''}" title="${item.desc}"><b>${item.icon} ${item.name}</b><small>${EQUIPMENT_RARITIES[item.rarity].name} · ${item.effects.map((effect) => `${effect.label} ${effect.value}`).join(' / ')}</small></button>`;
    }).join('');
    const normalTypes = ['blocker', 'skirmisher', 'gunner', 'cavalry', 'cold', 'swamp'];
    const eliteTypes = Object.keys(ELITE_VARIANTS);
    const bossTypes = ['bridgebreaker', 'daduLancer', 'frostmarksman', 'bogReaper', 'boss'];
    const enemyButton = (typeId, rank) => {
      const base = ENEMY_TYPES[typeId];
      const variant = rank === 'boss' ? (ELITE_VARIANTS[typeId] || base) : rank === 'elite' ? (ELITE_VARIANTS[typeId] || base) : base;
      const prefix = rank === 'boss' ? '首领' : rank === 'elite' ? '精英' : '普通';
      const detail = rank === 'boss' ? `${variant.role || base.role} · 三管血条` : rank === 'elite' ? `${variant.role || base.role} · 两管血条` : `${base.role} · 单管血条`;
      return `<button type="button" data-test-enemy="${typeId}" data-test-rank="${rank}" ${p ? '' : 'disabled'}><strong>${prefix} · ${variant.name || base.name}</strong><small>${detail}</small></button>`;
    };
    dom.testEnemyList.innerHTML = [
      ...normalTypes.map((typeId) => enemyButton(typeId, 'normal')),
      ...eliteTypes.map((typeId) => enemyButton(typeId, 'elite')),
      ...bossTypes.map((typeId) => enemyButton(typeId, 'boss'))
    ].join('');
  }

  function openTestMode() {
    if (state.training?.active) {
      showToast('战前演练进行中，结束后再打开测试台。');
      return;
    }
    if (!testRunActive && !state.testMode) {
      testModeSavedRun = !!(state.player && !state.finished && saveCurrentRun(state.screen));
      testModeFormalSnapshot = testModeSavedRun ? JSON.parse(JSON.stringify(loadCurrentRunSave())) : null;
      state.testMode = true;
    }
    state.testModeOpen = true;
    renderTestMode();
    dom.testModeOverlay?.classList.remove('hidden');
    setMeta();
    setTimeout(() => {
      if (activeGamepad) focusGamepadElement(dom.testStartRun || gamepadPrimaryElement());
      else dom.testStartRun?.focus({ preventScroll: true });
    }, 0);
  }

  function closeTestMode() {
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    if (!testRunActive) {
      state.testMode = false;
      testModeSavedRun = false;
      testModeFormalSnapshot = null;
      setMeta();
    }
    setTimeout(() => {
      if (activeGamepad && dom.testModeToggle) focusGamepadElement(dom.testModeToggle);
      else dom.testModeToggle?.focus({ preventScroll: true });
    }, 0);
  }

  function startTestRun() {
    clearTestModeExitTimer();
    testRunEpoch += 1;
    state.testMode = true;
    testRunActive = true;
    resetRun({ preserveSave: true });
    state.seed = 20261103;
    state.rng = mulberry32(state.seed);
    state.squadOptions = ['vanguard', 'scout', 'medic'];
    chooseSquad('vanguard');
    const p = state.player;
    p.name = '测试行军';
    p.maxHp = 420;
    p.hp = p.maxHp;
    p.maxPosture = 140;
    p.posture = 0;
    p.atk = 26;
    p.defense = 7;
    p.maxSupplies = 120;
    p.supplies = 120;
    p.morale = 88;
    p.level = 7;
    p.xp = 0;
    p.xpNext = 210;
    p.merit = 800;
    p.comboMax = 5;
    p.techniques = ['backcut'];
    state.chapter = 0;
    state.battleNumber = 0;
    state.act = 0;
    state.actStep = 0;
    state.actBoss = selectActBoss(0);
    updateMetaBars();
    showRoute();
    renderTestMode();
    showToast('测试行军已建立，可以补充资源、学习变招、添加信物或指定敌人。');
  }

  function ensureTestRun() {
    if (!testRunActive || !state.player || !state.testMode || state.player.hp <= 0 || state.combat?.finished) startTestRun();
  }

  function testGrantTechnique(techniqueId) {
    ensureTestRun();
    const result = unlockTechnique(state.player, techniqueId);
    if (!result) return;
    showToast(result.duplicate ? `已经掌握「${result.technique.name}」。` : `测试变招已取得：${result.technique.name} · ${result.technique.input}`);
    updateMetaBars();
    renderTestMode();
  }
  function startTestSingleMap() {
    ensureTestRun();
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    state.runMode = 'single';
    state.singlePace = 'normal';
    state.singleMap = generateSingleMap('normal');
    state.actBoss = null;
    renderSingleMap();
    showToast('已进入单幕山河图测试。');
  }

  function testGrantRelic(relicId) {
    ensureTestRun();
    const result = grantRelic(state.player, relicId);
    if (!result) return;
    const syn = result.synergies?.length ? `；联动 ${result.synergies.map((item) => item.name).join('、')}` : '';
    showToast(result.duplicate ? `已有${result.relic.name}，重复信物化为 28 军功。` : `测试信物已取得：${result.relic.name}${syn}`);
    updateMetaBars();
    renderTestMode();
  }
  function testGrantEquipment(itemId) {
    ensureTestRun();
    const unit = acquireEquipment(state.player, itemId, { source: '测试台', autoEquip: true });
    if (!unit) return;
    updateMetaBars();
    renderTestMode();
  }

  function testGrantResources() {
    ensureTestRun();
    const p = state.player;
    p.keys = { ...(p.keys || {}), iron_key: Math.max(1, p.keys?.iron_key || 0), river_key: Math.max(1, p.keys?.river_key || 0), snow_key: Math.max(1, p.keys?.snow_key || 0), master_key: Math.max(1, p.keys?.master_key || 0) }; p.level = Math.max(10, p.level || 1);
    p.maxHp = Math.max(420, p.maxHp);
    p.hp = p.maxHp;
    p.maxPosture = Math.max(140, p.maxPosture);
    p.posture = 0;
    p.postureBroken = false;
    p.hitstunUntil = 0;
    p.maxSupplies = Math.max(120, p.maxSupplies);
    p.supplies = p.maxSupplies;
    p.morale = 100;
    p.merit = (p.merit || 0) + 1000;
    p.level = Math.max(7, p.level || 1);
    showToast('测试资源已补满：兵力、架势、补给、士气与 1000 军功。');
    updateMetaBars();
    renderTestMode();
  }

  function startTestEnemy(typeId, rank = 'normal') {
    // Cancel the delayed return from a just-finished test battle before replacing it.
    clearTestModeExitTimer();
    ensureTestRun();
    const base = ENEMY_TYPES[typeId];
    if (!base) return;
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    const chapterByType = { bridgebreaker: 3, daduLancer: 3, cold: 4, frostmarksman: 4, swamp: 5, bogReaper: 5 };
    state.chapter = chapterByType[typeId] ?? state.chapter;
    state.runMode = 'roguelike';
    state.singleMap = null;
    state.battleNumber = 0;
    state.actStep = Math.min(2, state.actStep || 0);
    state.boss = rank === 'boss';
    const variant = ELITE_VARIANTS[typeId];
    const rankLabel = rank === 'boss' ? '首领' : rank === 'elite' ? '精英' : '普通';
    const title = rank === 'boss' ? (variant?.name || base.name) : rank === 'elite' ? (variant?.name || base.name) : base.name;
    const route = {
      id: `test-enemy-${typeId}-${rank}`, kind: rank === 'boss' ? 'boss' : 'battle', title: `测试 · ${rankLabel}${title}`,
      desc: `指定${rankLabel}战斗。`, count: 1, xp: rank === 'boss' ? 2.1 : rank === 'elite' ? 1.8 : 1,
      supply: 0, heal: 0, elite: rank === 'elite', testEnemyType: typeId,
      bossType: typeId, bossTitle: title, bossScale: rank === 'boss' ? (typeId === 'boss' ? 1.35 : 1.12) : 1
    };
    state.currentRoute = route;
    startBattle(route, rank === 'boss');
  }

  function testSkipBattle() {
    ensureTestRun();
    if (state.screen !== 'battle' || !state.combat || state.combat.finished) {
      showToast('当前没有可跳过的测试战斗。');
      return;
    }
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    state.combat.enemies.forEach((enemy) => { enemy.hp = 0; enemy.dead = true; });
    finishVictory();
  }

  function testSkipNode() {
    ensureTestRun();
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    if (state.screen === 'battle') { testSkipBattle(); return; }
    if (state.screen === 'map' && state.singleMap) {
      const room = singleMapRoom(state.singleMap, state.singleMap.currentId);
      if (room) markSingleRoomCleared(room.id);
      state.singleMap.triggering = false;
      renderSingleMap();
      return;
    }
    if (state.screen === 'event') {
      const callback = state.eventContinue;
      state.currentEvent = null;
      state.eventContinue = null;
      selectedEventIndex = -1;
      callback?.();
      return;
    }
    if (state.screen === 'reward') { proceedAfterReward(); return; }
    if (state.screen === 'shop') { closeShop(); return; }
    if (state.screen === 'history') { state.historyContinue?.(); return; }
    if (state.screen === 'route') {
      const route = state.routeOptions[selectedRouteIndex];
      if (state.runMode === 'roguelike' && route) {
        if (route.kind === 'boss') {
          state.boss = true;
          proceedAfterReward();
        } else {
          state.actStep = Math.min(ROGUELIKE_STEPS.length - 1, (state.actStep || 0) + 1);
          state.boss = false;
          showRoute();
        }
        return;
      }
    }
    showRoute();
  }

  function exitTestMode() {
    clearTestModeExitTimer();
    testRunEpoch += 1;
    const resumeFormalRun = testModeSavedRun;
    const formalSnapshot = testModeFormalSnapshot;
    testModeSavedRun = false;
    testModeFormalSnapshot = null;
    testRunActive = false;
    state.testMode = false;
    state.testModeOpen = false;
    dom.testModeOverlay?.classList.add('hidden');
    resetRun({ preserveSave: true });
    if (resumeFormalRun && formalSnapshot && activeSaveSlot()) {
      writeStorageJson(slotRunStorageKey(activeSaveSlot().id), formalSnapshot);
      state.testRestoreInProgress = true;
      try { continueCurrentRun(); }
      finally { state.testRestoreInProgress = false; }
      showToast('测试已结束，已恢复进入测试前的正式行军。');
    } else {
      setScreen('title');
      updateContinueButton();
      showToast('测试已结束，没有写入正式存档或战史。');
    }
  }

  const sleep = async (ms) => {
    let remaining = Math.max(0, ms);
    while (remaining > 0) {
      if (state.pauseOpen) { await new Promise((resolve) => setTimeout(resolve, 80)); continue; }
      const step = Math.min(80, remaining);
      await new Promise((resolve) => setTimeout(resolve, step));
      remaining -= step;
    }
  };

  const PERFORMANCE_KEY = 'longMarchPerformanceModeV1';

  let battleContextCache = null;
  function battleContext() {
    if (!battleContextCache) battleContextCache = dom.canvas.getContext('2d', { alpha: false, desynchronized: true });
    return battleContextCache;
  }
  const scene = {
    time: 0, last: 0, lastRender: 0, logicLast: 0, logicAccumulator: 0, running: true,
    particles: [], floats: [], slashes: [], shake: 0, flash: 0, goldFlash: 0, perfectFlash: 0, invulnerabilityFlash: 0, lunge: 0,
    enemyHit: {}, stars: [], duel: null, clash: null, projectiles: [], shotAim: null, mikiri: null, execution: null
  };
  const backgroundCache = new Map();

  let routeMapAnimationFrame = 0;
  let routeMapMotionStart = 0;
  let routeMapLastPaint = 0;

  function stopRouteMapAnimation() {
    cancelAnimationFrame(routeMapAnimationFrame);
    routeMapAnimationFrame = 0;
    routeMapMotionStart = 0;
    routeMapLastPaint = 0;
  }

  function updateRouteMapAnimation(now) {
    if (state.screen !== 'route' || state.performanceMode) {
      routeMapAnimationFrame = 0;
      return;
    }
    if (now - routeMapLastPaint < 32) {
      routeMapAnimationFrame = requestAnimationFrame(updateRouteMapAnimation);
      return;
    }
    routeMapLastPaint = now;
    const path = document.getElementById('long-march-path');
    const column = dom.routeMap?.querySelector('.march-column');
    if (!path || !column) {
      routeMapAnimationFrame = 0;
      return;
    }
    if (!routeMapMotionStart) routeMapMotionStart = now;
    const routeProgress = clamp(Number(dom.routeMap.dataset.progress) || .035, .035, .965);
    const lap = ((now - routeMapMotionStart) % 12000) / 12000;
    const point = path.getPointAtLength(path.getTotalLength() * routeProgress * lap);
    column.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
    routeMapAnimationFrame = requestAnimationFrame(updateRouteMapAnimation);
  }

  function startRouteMapAnimation() {
    stopRouteMapAnimation();
    if (state.screen !== 'route' || state.performanceMode) return;
    routeMapAnimationFrame = requestAnimationFrame(updateRouteMapAnimation);
  }

  function updateAdaptiveUiScale() {
    const ratio = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    const fontScale = clamp(.98 + .25 * Math.max(1, ratio), 1.15, 1.65);
    const uiScale = clamp(1 + (fontScale - 1) * .7, 1.08, 1.46);
    state.uiScale = uiScale;
    const root = document.documentElement;
    root.style.setProperty('--font-scale', fontScale.toFixed(3));
    root.style.setProperty('--ui-scale', uiScale.toFixed(3));
    root.style.setProperty('--topbar-height', `${Math.round(58 * uiScale)}px`);
  }

  function canvasFont(size, family = 'serif', weight = '') {
    const pixelSize = Math.max(1, Math.round(size * Math.max(1, state.uiScale)));
    return `${weight ? `${weight} ` : ''}${pixelSize}px ${family}`;
  }

  // 让战斗画面按“容器剩余高度”内接 16:9，而不是由宽度反推高度把下方 HUD 顶出屏幕。
  // 同时把画布容器的宽高写成实际尺寸，保证敌方血条、暗角、弹反层仍然贴合画面。
  function fitCanvasWrapToStage(wrap) {
    const stage = wrap.parentElement;
    if (!stage) return;
    const stageHeight = stage.clientHeight;
    if (stageHeight < 60) return;
    let reserved = 0;
    for (const child of stage.children) {
      if (child === wrap) continue;
      // 用内容实际需要的高度，避免卡片被压扁后画面又多占掉那一截
      reserved += Math.max(child.getBoundingClientRect().height, child.scrollHeight || 0);
    }
    const availableWidth = Math.max(160, stage.clientWidth);
    // 下限放到 72：窗口真的矮到放不下时宁可画面小一点，也不要让控制条被挤出屏幕。
    const availableHeight = Math.max(72, stageHeight - reserved);
    const fitWidth = Math.min(availableWidth, availableHeight * 16 / 9);
    const width = Math.round(fitWidth);
    const height = Math.round(fitWidth * 9 / 16);
    if (Math.abs((parseFloat(wrap.style.width) || 0) - width) > 1 || Math.abs((parseFloat(wrap.style.height) || 0) - height) > 1) {
      wrap.style.width = `${width}px`;
      wrap.style.height = `${height}px`;
    }
  }

  let canvasFitFrame = 0;
  function scheduleCanvasFit() {
    if (canvasFitFrame) return;
    canvasFitFrame = requestAnimationFrame(() => {
      canvasFitFrame = 0;
      resizeCanvasToDisplay();
    });
  }

  function resizeCanvasToDisplay() {
    if (!dom.canvas) return;
    const wrap = dom.canvas.parentElement;
    if (wrap) fitCanvasWrapToStage(wrap);
    const rect = dom.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dprCap = state.performanceMode ? 1 : 2;
    const widthCap = state.performanceMode ? 1280 : 3840;
    const fixedWidth = state.resolutionMode === 'auto' ? 0 : Number(state.resolutionMode);
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const fittedCssWidth = Math.min(rect.width, rect.height * 16 / 9);
    // 下限只留 320 兜底：帧首已经把 960×540 坐标系整体 setTransform 缩放到
    // 实际缓冲尺寸，小窗口下没必要再按 960 渲染（800×600 时画面只有 ~430 CSS 宽，
    // 却要填 960×540 的像素，白扔掉四分之三的填充量）。
    const naturalWidth = fixedWidth ? Math.round(fixedWidth) : Math.round(fittedCssWidth * dpr);
    // 性能模式用略低的内部分辨率换取明显更少的像素填充；CSS 尺寸不变，画面不会缩小。
    const renderScale = state.performanceMode ? .8 : 1;
    const targetWidth = clamp(Math.round(naturalWidth * renderScale), 320, widthCap);
    const targetHeight = Math.round(targetWidth * 9 / 16);
    if (Math.abs(dom.canvas.width - targetWidth) > 1 || Math.abs(dom.canvas.height - targetHeight) > 1) {
      dom.canvas.width = targetWidth;
      dom.canvas.height = targetHeight;
      scene.lastRender = 0;
    }
  }

  function applyResolutionMode(mode, persist = true) {
    state.resolutionMode = mode === 'auto' ? 'auto' : String(mode);
    if (dom.resolutionSelect) dom.resolutionSelect.value = state.resolutionMode;
    resizeCanvasToDisplay();
    if (persist) {
      try { localStorage.setItem('longMarchResolutionV1', state.resolutionMode); } catch (_) {}
    }
  }

  function persistGameSettings() {
    const payload = {
      masterVolume: state.volume,
      musicVolume: state.musicVolume,
      sfxVolume: state.sfxVolume,
      startupWindowMode: state.startupWindowMode,
      startFullscreen: !!state.startFullscreen
    };
    writeStorageJson(GAME_SETTINGS_KEY, payload);
    try {
      localStorage.setItem('longMarchVolumeV1', String(state.volume));
      localStorage.setItem('longMarchMusicVolumeV1', String(state.musicVolume));
      localStorage.setItem('longMarchSfxVolumeV1', String(state.sfxVolume));
      localStorage.setItem('longMarchStartupWindowV1', state.startupWindowMode);
      localStorage.setItem('longMarchStartFullscreenV1', state.startFullscreen ? '1' : '0');
    } catch (_) {}
  }

  function syncSettingsUi() {
    if (dom.performanceToggle) {
      dom.performanceToggle.textContent = `性能模式：${state.performanceMode ? '开' : '关'}`;
      dom.performanceToggle.setAttribute('aria-pressed', String(state.performanceMode));
      dom.performanceToggle.classList.toggle('active', state.performanceMode);
    }
    if (dom.resolutionSelect) {
      dom.resolutionSelect.value = state.resolutionMode;
    }
    if (dom.gamepadLayout) dom.gamepadLayout.value = state.gamepadLayout || 'auto';
    if (dom.soundToggle) {
      dom.soundToggle.textContent = `声音：${state.sound ? '开' : '关'}`;
      dom.soundToggle.classList.toggle('active', state.sound);
    }
    if (dom.volumeSlider) dom.volumeSlider.value = String(Math.round(state.volume * 100));
    if (dom.volumeValue) dom.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
    if (dom.musicVolumeSlider) dom.musicVolumeSlider.value = String(Math.round(state.musicVolume * 100));
    if (dom.musicVolumeValue) dom.musicVolumeValue.textContent = `${Math.round(state.musicVolume * 100)}%`;
    if (dom.sfxVolumeSlider) dom.sfxVolumeSlider.value = String(Math.round(state.sfxVolume * 100));
    if (dom.sfxVolumeValue) dom.sfxVolumeValue.textContent = `${Math.round(state.sfxVolume * 100)}%`;
    if (dom.startupWindowSelect) dom.startupWindowSelect.value = state.startupWindowMode || 'maximized';
    if (dom.startFullscreenToggle) {
      dom.startFullscreenToggle.textContent = `启动全屏：${state.startFullscreen ? '开' : '关'}`;
      dom.startFullscreenToggle.setAttribute('aria-pressed', String(!!state.startFullscreen));
      dom.startFullscreenToggle.classList.toggle('active', !!state.startFullscreen);
    }
    updateAudioMix();
    if (dom.resolutionSelect) dom.resolutionSelect.value = state.resolutionMode;
  }

  function groupedNames(ids, catalog) {
    const counts = ids.reduce((map, id) => { map[id] = (map[id] || 0) + 1; return map; }, {});
    return Object.entries(counts).map(([id, count]) => {
      const item = catalog.find((entry) => entry.id === id);
      return item ? `${item.name}${count > 1 ? ` ×${count}` : ''}` : id;
    });
  }

  function openBuffDetails() {
    const p = state.player;
    if (!p) return;
    const shopIds = Object.entries(p.shopCounts || {}).flatMap(([id, count]) => Array.from({ length: count }, () => id));
    const upgradeNames = groupedNames(p.upgrades || [], UPGRADES);
    const shopNames = groupedNames(shopIds, SHOP_ITEMS);
    const relicChips = (p.relics || []).map((id) => RELICS.find((relic) => relic.id === id)).filter(Boolean).map((relic) => `<span class="buff-detail-chip relic-detail-chip" title="${relic.desc}"><b>${relic.name}</b> · ${relic.effect}${relic.tags?.length ? ` · ${relic.tags.join('/')}` : ''}</span>`);
    const techniqueChips = (p.techniques || []).map((id) => PLAYER_TECHNIQUES[id]).filter(Boolean).map((technique) => `<span class="buff-detail-chip technique-detail-chip" title="${technique.desc}"><b>${technique.name}</b> · ${technique.input}</span>`);
    const synergyChips = (p.relicSynergies || []).map((id) => RELIC_SYNERGIES.find((synergy) => synergy.id === id)).filter(Boolean).map((synergy) => `<span class="buff-detail-chip synergy-detail-chip" title="${synergy.desc}"><b>联动 · ${synergy.name}</b> · ${synergy.effect}</span>`);
    const equippedNames = (p.equippedEquipment || []).map((uid) => equipmentById(equipmentUnitById(uid)?.itemId)?.name).filter(Boolean);
    const keyNames = Object.entries(p.keys || {}).map(([id, count]) => `${KEYS[id]?.name || id} ×${count}`);
    const talentNames = (p.talents || []).map((id) => TALENT_TREE.find((node) => node.id === id)?.name).filter(Boolean);
    const materialNames = Object.entries(p.materials || {}).map(([id, count]) => `${MATERIALS[id]?.name || id} ×${count}`);
    const storyClueCards = (p.storyClues || []).map((id) => STORY_CLUES.find((clue) => clue.id === id)).filter(Boolean).map((clue) => `<div class="story-clue-card"><b>${clue.title}</b><p>${clue.text}</p><small>${clue.source}</small></div>`);
    const achievementChips = ACHIEVEMENTS.filter((achievement) => (p.achievements || []).includes(achievement.id)).map((achievement) => `<span class="buff-detail-chip achievement-chip"><b>${achievement.name}</b> · ${achievement.desc}</span>`);
    const summary = [
      ['兵力', `${Math.ceil(p.hp)} / ${p.maxHp}`],
      ['架势上限', p.maxPosture],
      ['攻势', p.atk],
      ['防御', p.defense],
      ['士气', Math.round(p.morale)],
      ['补给', Math.round(p.supplies)],
      ['本场急救', `${1 + (p.emergencyBonus || 0)} 次`],
      ['已学变招', `${(p.techniques || []).length} / ${Object.keys(PLAYER_TECHNIQUES).length}`],
      ['信物联动', `${(p.relicSynergies || []).length} 组`],
      ['已点天赋', `${(p.talents || []).length} / ${TALENT_TREE.length}`],
      ['军备槽', `${(p.equippedEquipment || []).length} / ${equipmentSlotLimit(p)}`],
      ['军功', Math.round(p.merit || 0)],
      ['行军线索', `${(p.storyClues || []).length} / ${STORY_CLUES.length}`],
      ['行军成就', `${(p.achievements || []).length} / ${ACHIEVEMENTS.length}`]
    ];
    const combatBuffs = [
      p.dodgeCounterBonus ? '闪开后的追刀更重' : '',
      p.guardCounterBonus ? '挡刀后的守反更重' : '',
      p.comboWindowBonus ? '五式刀势更容易接上' : '',
      p.dodgeCounterWindowBonus ? '闪开后追刀的时机更从容' : '',
      p.guardCounterWindowBonus ? '挡刀后守反的时机更从容' : ''
    ].filter(Boolean);
    dom.buffDetailBody.innerHTML = `
      <div class="buff-summary-grid">${summary.map(([label, value]) => `<div class="buff-summary-card"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
      <section class="buff-section"><h4>信物联动</h4><div class="buff-chip-grid">${synergyChips.length ? synergyChips.join('') : '<span class="buff-empty">两件相关信物同时到手后，会触发额外联动。</span>'}</div></section>
      <section class="buff-section"><h4>已学变招</h4><div class="buff-chip-grid">${techniqueChips.length ? techniqueChips.join('') : '<span class="buff-empty">还没有学会变招。</span>'}</div></section>
      <section class="buff-section"><h4>星火信物</h4><div class="buff-chip-grid">${relicChips.length ? relicChips.join('') : '<span class="buff-empty">还没有取得信物。</span>'}</div></section>
      <section class="buff-section"><h4>当前军备</h4><div class="buff-chip-grid">${equippedNames.length ? equippedNames.map((name) => `<span class="buff-detail-chip">${name}</span>`).join('') : '<span class="buff-empty">还没有装备军备。</span>'}</div></section>
      <section class="buff-section"><h4>钥匙与天赋</h4><div class="buff-chip-grid">${[...keyNames, ...talentNames].length ? [...keyNames, ...talentNames].map((name) => `<span class="buff-detail-chip">${name}</span>`).join('') : '<span class="buff-empty">还没有取得钥匙或天赋。</span>'}</div></section>
      <section class="buff-section"><h4>沿途所得</h4><div class="buff-chip-grid">${upgradeNames.length ? upgradeNames.map((name) => `<span class="buff-detail-chip">${name}</span>`).join('') : '<span class="buff-empty">还没有带走新的战法。</span>'}</div></section>
      <section class="buff-section"><h4>军需所得</h4><div class="buff-chip-grid">${shopNames.length ? shopNames.map((name) => `<span class="buff-detail-chip">${name}</span>`).join('') : '<span class="buff-empty">还没有在军需站添置东西。</span>'}</div></section>
      <section class="buff-section"><h4>强化材料</h4><div class="buff-chip-grid">${materialNames.length ? materialNames.map((name) => `<span class="buff-detail-chip">${name}</span>`).join('') : '<span class="buff-empty">还没有取得精炼钢料或精密机件。</span>'}</div></section>
      <section class="buff-section"><h4>行军线索</h4><div class="story-clue-list">${storyClueCards.length ? storyClueCards.join('') : '<span class="buff-empty">沿途旧纸、刻记和人物口述会在这里拼成完整故事。</span>'}</div></section>
      <section class="buff-section"><h4>行军成就</h4><div class="buff-chip-grid">${achievementChips.length ? achievementChips.join('') : '<span class="buff-empty">还没有达成行军成就。</span>'}</div></section>
      <section class="buff-section"><h4>战法所得</h4><div class="buff-chip-grid">${combatBuffs.length ? combatBuffs.map((text) => `<span class="buff-detail-chip">${text}</span>`).join('') : '<span class="buff-empty">还没有练成新的战法。</span>'}</div></section>`;
    dom.buffDetailOverlay?.classList.remove('hidden');
    requestAnimationFrame(() => dom.buffDetailOverlay?.focus({ preventScroll: true }));
  }

  function closeBuffDetails() {
    dom.buffDetailOverlay?.classList.add('hidden');
  }

  function openSettings() {
    syncSettingsUi();
    renderInputBindings();
    syncBindingLabels();
    dom.settingsOverlay?.classList.remove('hidden');
    requestAnimationFrame(() => dom.settingsOverlay?.focus({ preventScroll: true }));
  }

  function closeSettings() {
    if (dom.settingsSelectPopover && !dom.settingsSelectPopover.classList.contains('hidden')) closeSettingsSelectPopover(false);
    if (gamepadFormEditing) stopGamepadFormEditing(false, false);
    dom.settingsOverlay?.classList.add('hidden');
  }

  function exitGame() {
    if (state.player && !state.finished && !state.testMode && !state.training?.active) saveCurrentRun(state.screen);
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (_) {}
    try { window.close(); } catch (_) {}
    setTimeout(() => {
      if (document.visibilityState !== 'hidden') showToast('浏览器未允许自动关闭，请按 Alt+F4 或关闭游戏窗口。', 4500);
    }, 260);
  }

  function syncFullscreenUi() {
    updateAdaptiveUiScale();
    const active = !!document.fullscreenElement;
    document.body.classList.toggle('is-fullscreen', active);
    if (dom.fullscreenToggle) {
      dom.fullscreenToggle.textContent = active ? '退出全屏' : '全屏';
      dom.fullscreenToggle.setAttribute('aria-pressed', String(active));
      dom.fullscreenToggle.classList.toggle('active', active);
    }
    requestAnimationFrame(resizeCanvasToDisplay);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (dom.app?.requestFullscreen) {
        await dom.app.requestFullscreen({ navigationUI: 'hide' });
      } else {
        showToast('这里无法进入全屏。');
      }
    } catch (_) {
      showToast('全屏没有打开，请再按一次。');
    }
  }

  function applyPerformanceMode(enabled, persist = true) {
    state.performanceMode = !!enabled;
    document.body.classList.toggle('performance-mode', state.performanceMode);
    if (dom.performanceToggle) {
      dom.performanceToggle.textContent = `性能模式：${state.performanceMode ? '开' : '关'}`;
      dom.performanceToggle.setAttribute('aria-pressed', String(state.performanceMode));
      dom.performanceToggle.classList.toggle('active', state.performanceMode);
    }
    scene.lastRender = 0;
    resizeCanvasToDisplay();
    startRouteMapAnimation();
    if (persist) {
      try { localStorage.setItem(PERFORMANCE_KEY, state.performanceMode ? '1' : '0'); } catch (_) {}
    }
  }

  for (let i = 0; i < 46; i++) {
    scene.stars.push({ x: (i * 173.7) % 960, y: 24 + ((i * 79.3) % 230), size: .5 + (i % 4) * .35, phase: i * .7 });
  }

  let audioCtx = null;
  let audioMaster = null;
  let sfxBus = null;
  let musicBus = null;
  let musicNoiseBuffer = null;
  let musicTimer = null;
  let musicMode = 'title';
  let musicStep = 0;
  let musicNextStepTime = 0;
  const MUSIC_LEVELS = { title: .18, journey: .17, battle: .16 };
  const MUSIC_TRACKS = {
    title: { bpm: 56, steps: 16 },
    journey: { bpm: 92, steps: 16 },
    battle: { bpm: 144, steps: 16 }
  };
  const sampledAudio = {
    parry: new Audio('assets/parry-clang-sharp.wav'),
    block: new Audio('assets/block-hit-sharp.wav')
  };
  for (const sample of Object.values(sampledAudio)) {
    sample.preload = 'auto';
    try { sample.load(); } catch (_) {}
  }

  function ensureAudioGraph() {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioMaster = audioCtx.createGain();
      audioMaster.gain.value = state.sound ? state.volume : 0;
      const masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.value = -12;
      masterCompressor.knee.value = 18;
      masterCompressor.ratio.value = 3;
      masterCompressor.attack.value = .003;
      masterCompressor.release.value = .2;
      audioMaster.connect(masterCompressor).connect(audioCtx.destination);

      const sfxCompressor = audioCtx.createDynamicsCompressor();
      sfxCompressor.threshold.value = -20;
      sfxCompressor.knee.value = 16;
      sfxCompressor.ratio.value = 4.5;
      sfxCompressor.attack.value = .002;
      sfxCompressor.release.value = .14;
      sfxBus = audioCtx.createGain();
      sfxBus.gain.value = 1;
      sfxBus.connect(sfxCompressor).connect(audioMaster);

      const musicCompressor = audioCtx.createDynamicsCompressor();
      musicCompressor.threshold.value = -24;
      musicCompressor.knee.value = 20;
      musicCompressor.ratio.value = 3;
      musicCompressor.attack.value = .012;
      musicCompressor.release.value = .3;
      musicBus = audioCtx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(musicCompressor).connect(audioMaster);

      musicNoiseBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * .5), audioCtx.sampleRate);
      const data = musicNoiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      musicNextStepTime = audioCtx.currentTime + .06;
      if (!musicTimer) musicTimer = setInterval(scheduleMusic, 80);
      document.body.dataset.musicMode = musicMode;
      updateMusicVolume();
      return audioCtx;
    } catch (_) {
      audioCtx = null;
      return null;
    }
  }

  function desiredMusicModeForScreen(name) {
    if (name === 'battle') return 'battle';
    if (name === 'title') return 'title';
    return 'journey';
  }

  function musicBaseGain() {
    return (MUSIC_LEVELS[musicMode] || MUSIC_LEVELS.journey) * state.musicVolume;
  }

  function updateMusicVolume() {
    document.body.dataset.musicMode = musicMode;
    if (!audioCtx || !musicBus) return;
    const now = audioCtx.currentTime;
    const target = state.sound ? musicBaseGain() : 0;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setTargetAtTime(target, now, .045);
  }

  function updateAudioMix() {
    if (!audioCtx || !audioMaster) return;
    const now = audioCtx.currentTime;
    audioMaster.gain.cancelScheduledValues(now);
    audioMaster.gain.setTargetAtTime(state.sound ? Math.max(0, state.volume) : 0, now, .035);
    updateMusicVolume();
  }

  function setMusicMode(mode, force = false) {
    const next = MUSIC_TRACKS[mode] ? mode : 'journey';
    if (next === musicMode && !force) return;
    musicMode = next;
    musicStep = 0;
    document.body.dataset.musicMode = musicMode;
    if (audioCtx) musicNextStepTime = audioCtx.currentTime + .05;
    updateMusicVolume();
  }

  function unlockAudio() {
    const ctx = ensureAudioGraph();
    if (!ctx) return;
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      setMusicMode(desiredMusicModeForScreen(state.screen), true);
      updateMusicVolume();
    }).catch(() => {});
  }

  function duckMusic(strength = .58, duration = 190) {
    if (!audioCtx || !musicBus || !state.sound) return;
    const now = audioCtx.currentTime;
    const base = musicBaseGain();
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(Math.max(.0001, musicBus.gain.value), now);
    musicBus.gain.linearRampToValueAtTime(Math.max(.0001, base * strength), now + .018);
    musicBus.gain.linearRampToValueAtTime(base, now + Math.max(.12, duration / 1000));
  }

  function musicTone(frequency, duration, type, volume, start, endFrequency = null) {
    if (!audioCtx || !musicBus || !state.sound || state.musicVolume <= 0) return;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(24, frequency), start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, endFrequency), start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(musicBus);
    oscillator.start(start);
    oscillator.stop(start + duration + .04);
  }

  function musicNoise(duration, volume, filterFrequency, start, type = 'bandpass') {
    if (!audioCtx || !musicBus || !musicNoiseBuffer || !state.sound || state.musicVolume <= 0) return;
    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    source.buffer = musicNoiseBuffer;
    filter.type = type;
    filter.frequency.value = filterFrequency;
    filter.Q.value = .9;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(gain).connect(musicBus);
    source.start(start);
    source.stop(start + duration + .03);
  }

  function scheduleMusicStep(track, step, when) {
    if (musicMode === 'title') {
      if (step === 0) {
        musicTone(73.42, 5.5, 'sine', .13, when);
        musicTone(110, 4.8, 'triangle', .065, when + .02);
      }
      const titleNotes = [220, 293.66, 349.23, 293.66, 261.63, 220, 196, 174.61];
      if (step % 2 === 0) musicTone(titleNotes[(step / 2) % titleNotes.length], 1.45, 'triangle', .07, when);
      if (step === 4 || step === 12) musicTone(587.33, 1.1, 'sine', .045, when + .03);
      if (step === 8) musicNoise(1.1, .012, 680, when, 'lowpass');
      return;
    }
    if (musicMode === 'journey') {
      const marchBass = [73.42, 73.42, 98, 87.31];
      const marchLead = [220, 261.63, 293.66, 329.63, 293.66, 261.63, 220, 196];
      if (step % 4 === 0) {
        musicTone(55, .34, 'sine', .3, when, 42);
        musicTone(marchBass[(step / 4) % marchBass.length], .65, 'triangle', .075, when + .01);
      }
      if (step % 4 === 2) musicNoise(.12, .07, 1550, when);
      if (step % 2 === 0) musicTone(marchLead[(step / 2) % marchLead.length], .4, 'triangle', .045, when);
      if (step === 0 || step === 8) musicTone(146.83, 1.9, 'sine', .035, when + .02);
      return;
    }
    const battleBass = [73.42, 73.42, 87.31, 73.42, 92.5, 73.42, 110, 103.83];
    const danger = state.player ? 1 - clamp(state.player.hp / Math.max(1, state.player.maxHp), 0, 1) : 0;
    if (step % 2 === 0) musicTone(52, .16, 'sine', .3, when, 34);
    if (step === 0 || step === 3 || step === 8 || step === 11) musicNoise(.09, .13, 2400, when);
    if (step === 4 || step === 12) musicNoise(.18, .17, 1450, when);
    musicTone(battleBass[step % battleBass.length], .18, 'sawtooth', .033 + danger * .012, when);
    if (step === 2 || step === 7 || step === 10 || step === 15) musicTone(466.16, .09, 'square', .035, when);
    if (step === 0 || step === 8) musicTone(116.54, .7, 'triangle', .055, when + .02);
  }

  function scheduleMusic() {
    if (!audioCtx || !state.sound || state.musicVolume <= 0 || audioCtx.state !== 'running') return;
    const track = MUSIC_TRACKS[musicMode] || MUSIC_TRACKS.journey;
    const bpm = track.bpm + (musicMode === 'battle' && state.combat?.boss ? 14 : 0);
    const stepDuration = 60 / bpm / 2;
    if (!musicNextStepTime || musicNextStepTime < audioCtx.currentTime - .3) musicNextStepTime = audioCtx.currentTime + .04;
    while (musicNextStepTime < audioCtx.currentTime + .2) {
      scheduleMusicStep(track, musicStep, musicNextStepTime);
      musicNextStepTime += stepDuration;
      musicStep = (musicStep + 1) % track.steps;
    }
  }

  function playSampledSound(name, volume) {
    if (!state.sound || !sampledAudio[name]) return false;
    try {
      const sound = sampledAudio[name].cloneNode();
      sound.volume = clamp(volume * state.volume * state.sfxVolume, 0, 1);
      const promise = sound.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => playParryFallback(name));
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function playParryFallback(name) {
    if (name === 'parry') {
      metalStrike(1860, 1380, .22, 'square', .14);
      metalStrike(2760, 2240, .2, 'triangle', .11, .006);
      metalStrike(760, 470, .34, 'sine', .12, .012);
      audioNoise(.11, .15, 3400);
    } else if (name === 'block') {
      metalStrike(880, 480, .16, 'square', .1);
      audioNoise(.1, .07, 1500);
    }
  }

  function audioTone(frequency, duration, type = 'sine', volume = .045, delay = 0) {
    if (!state.sound || state.sfxVolume <= 0 || state.volume <= 0) return;
    volume *= state.sfxVolume;
    try {
      ensureAudioGraph();
      if (!audioCtx) return;
      const start = audioCtx.currentTime + delay;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(sfxBus || audioCtx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .03);
    } catch (_) { /* Audio is optional. */ }
  }

  function audioNoise(duration = .12, volume = .025, filterFrequency = 1200) {
    if (!state.sound || state.sfxVolume <= 0 || state.volume <= 0) return;
    volume *= state.sfxVolume;
    try {
      ensureAudioGraph();
      if (!audioCtx) return;
      const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = audioCtx.createBufferSource();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = filterFrequency;
      filter.Q.value = .8;
      gain.gain.value = volume;
      source.connect(filter).connect(gain).connect(sfxBus || audioCtx.destination);
      source.start();
    } catch (_) { /* Audio is optional. */ }
  }
  function audioWhoosh(duration = .22, volume = .14, startFrequency = 3200, endFrequency = 360) {
    if (!state.sound || state.sfxVolume <= 0 || state.volume <= 0) return;
    volume *= state.sfxVolume;
    try {
      ensureAudioGraph();
      if (!audioCtx) return;
      const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * (1 - t * .45);
      }
      const source = audioCtx.createBufferSource();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.Q.value = 1.4;
      filter.frequency.setValueAtTime(startFrequency, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, endFrequency), now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      source.connect(filter).connect(gain).connect(sfxBus || audioCtx.destination);
      source.start(now);
    } catch (_) { /* Audio is optional. */ }
  }

  function metalStrike(startFrequency, endFrequency, duration, type, volume, delay = 0) {
    if (!state.sound || state.sfxVolume <= 0 || state.volume <= 0) return;
    volume *= state.sfxVolume;
    try {
      ensureAudioGraph();
      if (!audioCtx) return;
      const start = audioCtx.currentTime + delay;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(startFrequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), start + duration);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(sfxBus || audioCtx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .03);
    } catch (_) { /* Audio is optional. */ }
  }
  function playSound(name) {
    if (!state.sound || state.sfxVolume <= 0) return;
    if (['parry', 'block', 'crit', 'mikiri', 'rifle', 'enemyRifle', 'execution', 'executionRanged', 'headshot', 'boom', 'achievement'].includes(name)) {
      const strength = name === 'parry' ? .34 : name === 'headshot' ? .42 : name === 'achievement' ? .2 : .58;
      duckMusic(strength, name === 'parry' || name === 'headshot' ? 300 : 210);
    }
    if (name === 'achievement') {
      audioTone(523.25, .16, 'sine', .045);
      audioTone(659.25, .18, 'triangle', .04, .075);
      audioTone(783.99, .24, 'sine', .038, .15);
      metalStrike(1180, 820, .1, 'triangle', .026, .08);
    }
    if (name === 'hit') { metalStrike(180, 95, .12, 'sawtooth', .06); audioNoise(.07, .035, 900); }
    if (name === 'crit') { metalStrike(260, 120, .16, 'square', .075); metalStrike(620, 260, .18, 'triangle', .055, .015); audioNoise(.1, .055, 1600); }
    if (name === 'enemy') audioTone(62, .13, 'triangle', .035);
    if (name === 'heal') { audioTone(440, .12, 'sine', .025); audioTone(660, .14, 'sine', .02, .08); }
    if (name === 'guard') audioTone(180, .16, 'triangle', .03);
    if (name === 'deny') { audioTone(96, .12, 'square', .026); audioTone(68, .17, 'triangle', .022, .035); }
    if (name === 'save') { audioTone(392, .12, 'sine', .035); audioTone(523.25, .16, 'triangle', .032, .07); audioTone(659.25, .18, 'sine', .026, .14); }
    if (name === 'dodge') audioNoise(.12, .045, 620);
    if (name === 'parry') { if (!playSampledSound('parry', 1)) playParryFallback('parry'); return; }
    if (name === 'block') { if (!playSampledSound('block', .95)) playParryFallback('block'); return; }
    if (name === 'miss') audioTone(120, .12, 'sawtooth', .025);
    if (name === 'swing') audioNoise(.2, .022, 780);
    if (name === 'timing') {
      metalStrike(1880, 1510, .055, 'square', .07);
      audioTone(1180, .045, 'triangle', .035);
    }
    if (name === 'rifle') {
      metalStrike(740, 170, .08, 'square', .075);
      audioNoise(.11, .11, 2300);
      audioTone(95, .16, 'sawtooth', .045);
    }
    if (name === 'enemyRifle') {
      metalStrike(520, 120, .1, 'square', .07);
      audioNoise(.14, .12, 1750);
      audioTone(72, .2, 'triangle', .05);
    }
    if (name === 'click') { metalStrike(980, 560, .035, 'square', .045); audioTone(190, .045, 'triangle', .035); audioNoise(.025, .024, 1800); }
    if (name === 'mikiri') {
      audioTone(42, .5, 'sine', .28);
      metalStrike(78, 28, .3, 'triangle', .19);
      audioNoise(.24, .14, 145);
    }
    if (name === 'executionSlash') {
      audioWhoosh(.26, .2, 3900, 330);
      metalStrike(2100, 520, .12, 'sawtooth', .075);
    }
    if (name === 'execution') {
      metalStrike(1450, 180, .16, 'square', .16);
      audioTone(52, .48, 'sine', .24);
      audioNoise(.22, .13, 420);
    }
    if (name === 'executionRanged') {
      metalStrike(760, 210, .08, 'square', .11);
      audioNoise(.12, .1, 1800);
      audioTone(240, .08, 'triangle', .05, .02);
    }
    if (name === 'headshot') {
      metalStrike(4600, 860, .06, 'square', .24);
      metalStrike(2400, 420, .1, 'triangle', .16, .012);
      audioNoise(.16, .24, 3200);
      audioTone(58, .42, 'sine', .28);
      audioTone(92, .24, 'triangle', .15, .018);
      audioNoise(.28, .1, 180, .025);
    }
    if (name === 'boom') {
      audioTone(48, .62, 'sine', .22);
      audioTone(86, .34, 'triangle', .14, .012);
      metalStrike(96, 34, .46, 'triangle', .16);
      audioNoise(.34, .16, 190);
    }
    if (name === 'win') { [392, 494, 587, 784].forEach((tone, i) => audioTone(tone, .25, 'triangle', .03, i * .08)); }
    if (name === 'lose') { audioTone(180, .4, 'sawtooth', .025); audioTone(110, .5, 'triangle', .025, .1); }
  }

  const PLAYER_MIN_X = 185;
  const PLAYER_MAX_X = 600;
  const PLAYER_MIN_Y = 302;
  const PLAYER_MAX_Y = 408;
  const PLAYER_SPEED = 420;
  const MELEE_RANGE = 235;
  const THRUST_RANGE = 285;
  const PLAYER_COMBO_PROFILES = {
    1: { name: '一式·破锋', short: '一式', windup: 150, active: 95, recovery: 285, cancelRatio: .63, damage: .78, posture: .9, lunge: 48, windupHand: [4, -36], windupTip: [24, -94], strikeHand: [54, -18], strikeTip: [128, -35] },
    2: { name: '二式·回撩', short: '二式', windup: 112, active: 90, recovery: 250, cancelRatio: .58, damage: .72, posture: .95, lunge: 46, windupHand: [50, -22], windupTip: [118, -8], strikeHand: [6, -45], strikeTip: [38, -128] },
    3: { name: '三式·进斩', short: '三式', windup: 126, active: 98, recovery: 292, cancelRatio: .6, damage: .84, posture: 1.08, lunge: 82, windupHand: [4, -47], windupTip: [34, -132], strikeHand: [55, -17], strikeTip: [156, -24] },
    4: { name: '四式·山倾', short: '四式', windup: 315, active: 155, recovery: 310, cancelRatio: .66, damage: 1.38, posture: 1.72, lunge: 108, windupHand: [-18, -20], windupTip: [-78, -118], strikeHand: [65, 4], strikeTip: [164, 30] },
    5: { name: '五式·断岳', short: '五式', windup: 42, active: 88, recovery: 245, cancelRatio: .5, damage: .76, posture: .96, lunge: 52, windupHand: [28, -51], windupTip: [74, -118], strikeHand: [48, -8], strikeTip: [141, 8] }
  };
  const PLAYER_TECHNIQUES = {
    whirlwind: {
      id: 'whirlwind', name: '回旋破阵', short: '回旋', input: 'A / D + 左键', axis: 'horizontal',
      desc: '借横向换步回身横扫，两刀覆盖身侧，最适合打断围攻与快刀。', windup: 170, active: 220, recovery: 330, cancelRatio: .66,
      damage: .78, posture: 1.55, lunge: 44, hits: 2, secondDelay: 135, secondDamage: .54, secondPosture: .72,
      windupHand: [32, -28], windupTip: [102, -74], strikeHand: [-8, -38], strikeTip: [-118, -36]
    },
    breach: {
      id: 'breach', name: '破锋进斩', short: '进斩', input: 'W + 左键', axis: 'up',
      desc: '压低刀锋踏前破阵，前摇较长，却能把敌将架势一次劈开。', windup: 235, active: 145, recovery: 345, cancelRatio: .69,
      damage: 1.48, posture: 2.08, lunge: 118, hits: 1,
      windupHand: [-14, -18], windupTip: [-74, -102], strikeHand: [64, 4], strikeTip: [168, 28]
    },
    backcut: {
      id: 'backcut', name: '藏锋回刺', short: '回刺', input: 'S + 左键', axis: 'down',
      desc: '后撤半步藏住刀锋，再贴地回刺；退中带攻，适合躲开直线重招。', windup: 125, active: 125, recovery: 300, cancelRatio: .58,
      damage: .96, posture: 1.46, lunge: -28, hits: 1, retreatGuard: true,
      windupHand: [48, -8], windupTip: [116, 2], strikeHand: [42, -24], strikeTip: [148, -60]
    },
    crosscut: {
      id: 'crosscut', name: '交刃连斩', short: '交刃', input: 'W + A / D + 左键', axis: 'diagonal',
      desc: '斜向切入敌刃内侧，以两次交刃连斩压住对手的反击。', windup: 190, active: 155, recovery: 335, cancelRatio: .67,
      damage: 1.08, posture: 1.72, lunge: 86, hits: 2, secondDelay: 105, secondDamage: .76, secondPosture: .88,
      windupHand: [4, -46], windupTip: [46, -124], strikeHand: [54, -16], strikeTip: [154, -24]
    }
  };
  const PLAYER_TECHNIQUE_ORDER = ['whirlwind', 'breach', 'crosscut'];
  const PLAYER_COUNTER_PROFILES = {
    dodge: [
      { name: '闪身突进', short: '突进', windup: 88, active: 96, recovery: 235, cancelRatio: .56, damage: .92, posture: 1.15, lunge: 124, windupHand: [8, -30], windupTip: [42, -78], strikeHand: [60, -20], strikeTip: [158, -10] },
      { name: '回锋追斩', short: '回锋', windup: 105, active: 94, recovery: 250, cancelRatio: .58, damage: .96, posture: 1.22, lunge: 58, windupHand: [46, -24], windupTip: [112, -4], strikeHand: [2, -46], strikeTip: [34, -132] },
      { name: '破阵追落', short: '追落', windup: 150, active: 118, recovery: 315, cancelRatio: .68, damage: 1.35, posture: 1.55, lunge: 82, windupHand: [-6, -20], windupTip: [-56, -94], strikeHand: [68, -9], strikeTip: [158, 8] }
    ],
    guard: [
      { name: '守反斩', short: '守反', windup: 82, active: 94, recovery: 235, cancelRatio: .56, damage: 1.02, posture: 1.18, lunge: 58, windupHand: [35, -27], windupTip: [92, -18], strikeHand: [60, -20], strikeTip: [146, -34] },
      { name: '震步追斩', short: '追斩', windup: 126, active: 105, recovery: 285, cancelRatio: .62, damage: 1.18, posture: 1.36, lunge: 70, windupHand: [4, -46], windupTip: [42, -126], strikeHand: [-38, -24], strikeTip: [-146, -30] }
    ]
  };
  const movementInput = { left: false, right: false, up: false, down: false, sprint: false };
  const controllerInput = { left: false, right: false, up: false, down: false, sprint: false };
  const GAMEPAD_DEADZONE = .2;
  const GAMEPAD_MENU_DEADZONE = .58;
  let activeGamepad = null;
  let gamepadPrevButtons = [];
  let gamepadPrevMenuAxisX = 0;
  let gamepadPrevMenuAxisY = 0;
  let gamepadLastMenuMove = 0;
  let gamepadLastLabel = '';
  let gamepadReservedToastAt = 0;
  let gamepadFormEditing = null;
  let gamepadFormOriginalValue = '';
  let gamepadSelectMenuTarget = null;

  function gamepadButtonDown(pad, index) {
    const button = pad?.buttons?.[index];
    return !!button && (button.pressed || button.value > .5);
  }

  function effectiveGamepadLayout(pad) {
    if (state.gamepadLayout === 'xbox' || state.gamepadLayout === 'nintendo') return state.gamepadLayout;
    return /nintendo|switch|joy-?con/i.test(pad?.id || '') ? 'nintendo' : 'xbox';
  }

  function gamepadButtonMap(pad) {
    return {
      confirm: gamepadBinding('confirm', pad),
      cancel: gamepadBinding('cancel', pad),
      sweep: gamepadBinding('execute', pad),
      shoot: gamepadBinding('shoot', pad)
    };
  }

  function gamepadAxes(pad) {
    const axes = pad?.axes || [];
    const pairs = [[axes[0] || 0, axes[1] || 0], [axes[2] || 0, axes[3] || 0]];
    return pairs.find(([x, y]) => Math.hypot(x, y) > GAMEPAD_DEADZONE * .65) || pairs[0];
  }

  function gamepadRumble(strong = .35, weak = .22, duration = 80) {
    const actuator = activeGamepad?.vibrationActuator;
    if (!actuator?.playEffect) return;
    try {
      const result = actuator.playEffect('dual-rumble', {
        startDelay: 0, duration, strongMagnitude: clamp(strong, 0, 1), weakMagnitude: clamp(weak, 0, 1)
      });
      result?.catch?.(() => {});
    } catch (_) {}
  }

  function syncGamepadUi(pad) {
    const hadPad = !!activeGamepad;
    activeGamepad = pad || null;
    const label = pad ? '手柄已连接 · 左摇杆或十字键选择，A 确认，B 返回' : (navigator.getGamepads ? '尚未找到手柄。连接后按一下手柄按键。' : '这个浏览器暂时无法使用手柄。');
    if (label !== gamepadLastLabel) {
      gamepadLastLabel = label;
      if (dom.gamepadStatus) dom.gamepadStatus.textContent = label;
    }
    dom.gamepadIndicator?.classList.toggle('hidden', !pad);
    dom.gamepadControlStrip?.classList.toggle('hidden', !pad);
    dom.settingsGamepadHint?.classList.toggle('hidden', !pad);
    document.body.classList.toggle('gamepad-active', !!pad);
    if (hadPad !== !!pad) {
      refreshGamepadSelectionLabels();
      syncBindingLabels();
      if (pad) setTimeout(() => {
        const primary = gamepadPrimaryElement();
        if (primary) focusGamepadElement(primary);
      }, 30);
    }
    if (!pad) {
      controllerInput.left = false;
      controllerInput.right = false;
      controllerInput.up = false;
      controllerInput.down = false;
    }
  }

  function visibleGamepadFocusables() {
    if (dom.settingsSelectPopover && !dom.settingsSelectPopover.classList.contains('hidden')) {
      return [...dom.settingsSelectPopover.querySelectorAll('button:not([disabled])')]
        .filter((element) => element.getClientRects().length > 0);
    }
    const modal = [dom.acquisitionOverlay, dom.relicDetailOverlay, dom.growthOverlay, dom.equipmentOverlay, dom.npcOverlay, dom.restartConfirmOverlay, dom.saveManagerOverlay, dom.runHistoryOverlay, dom.enemyCodexOverlay, dom.manualMenuOverlay, dom.trainingBriefOverlay, dom.trainingMenuOverlay, dom.testModeOverlay, dom.settingsOverlay, dom.buffDetailOverlay, dom.eventDetailOverlay, dom.choiceDetailOverlay, dom.tutorialOverlay]
      .find((overlay) => overlay && !overlay.classList.contains('hidden'));
    const screen = document.querySelector('.screen.active');
    const root = modal || screen || document;
    const nodes = [...root.querySelectorAll('button:not([disabled]), [role="button"][tabindex], [data-gamepad-focusable="true"], input:not([type="text"]), select:not([disabled])')];
    if (!modal) {
      [dom.pauseToggle, dom.buffDetailBtn, dom.growthToggle, dom.equipmentToggle, dom.testModeToggle, dom.saveManagerToggle, dom.settingsToggle, ...(dom.relicHud ? [...dom.relicHud.querySelectorAll('button')] : [])].filter(Boolean).reverse().forEach((node) => {
        if (node.getClientRects().length && !node.classList.contains('hidden')) nodes.unshift(node);
      });
    }
    if (!modal && dom.selectionFooter && !dom.selectionFooter.classList.contains('hidden')) {
      nodes.push(...dom.selectionFooter.querySelectorAll('button:not([disabled])'));
    }
    return nodes.filter((element) => !element.closest('.hidden') && !element.matches('.choice-detail-link') && element.getClientRects().length > 0);
  }

  function focusGamepadElement(element) {
    if (!(element instanceof HTMLElement)) return;
    document.querySelectorAll('.gamepad-focus').forEach((node) => {
      node.classList.remove('gamepad-focus');
      node.removeAttribute('data-gamepad-focused');
    });
    element.focus({ preventScroll: true });
    element.classList.add('gamepad-focus');
    element.dataset.gamepadFocused = 'true';
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function ensureGamepadFocus() {
    if (!activeGamepad) return null;
    const items = visibleGamepadFocusables();
    if (!items.length) return null;
    const active = document.activeElement;
    let target = items.includes(active) ? active : null;
    if (!target) {
      const preferred = gamepadPrimaryElement();
      target = items.includes(preferred) ? preferred : items[0];
    }
    if (target !== active || !target.classList.contains('gamepad-focus')) focusGamepadElement(target);
    return target;
  }

  function settingsControlLabel(element) {
    return element?.closest('.settings-row')?.querySelector('strong')?.textContent?.trim() || '这项设置';
  }

  function updateSettingsGamepadHint(text = '十字键 / 左摇杆选择 · A 展开下拉或开始调整 · B 返回') {
    if (dom.settingsGamepadHint) dom.settingsGamepadHint.textContent = text;
  }

  function closeSettingsSelectPopover(restoreFocus = true) {
    const target = gamepadSelectMenuTarget;
    if (dom.settingsSelectPopover) {
      dom.settingsSelectPopover.classList.add('hidden');
      dom.settingsSelectPopover.replaceChildren();
    }
    gamepadSelectMenuTarget = null;
    if (target instanceof HTMLElement) {
      target.classList.remove('gamepad-editing');
      target.setAttribute('aria-expanded', 'false');
      if (restoreFocus) focusGamepadElement(target);
    }
    if (!gamepadFormEditing) updateSettingsGamepadHint();
  }

  function chooseSettingsSelectValue(select, value) {
    if (!(select instanceof HTMLSelectElement)) return;
    const option = [...select.options].find((candidate) => candidate.value === value);
    if (!option) return;
    const label = settingsControlLabel(select);
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    closeSettingsSelectPopover(true);
    showToast(`${label}：${option.text}`);
    gamepadRumble(.16, .1, 45);
  }

  function openSettingsSelectPopover(select) {
    if (!(select instanceof HTMLSelectElement) || !dom.settingsSelectPopover) return;
    if (gamepadFormEditing) stopGamepadFormEditing(false, false);
    if (gamepadSelectMenuTarget && gamepadSelectMenuTarget !== select) closeSettingsSelectPopover(false);
    const panel = select.closest('.settings-panel');
    if (!panel) return;
    const popover = dom.settingsSelectPopover;
    const selectRect = select.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    popover.replaceChildren();
    [...select.options].forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.text;
      button.dataset.value = option.value;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === select.selectedIndex));
      if (index === select.selectedIndex) button.classList.add('current');
      button.addEventListener('click', () => chooseSettingsSelectValue(select, option.value));
      popover.append(button);
    });
    const popoverWidth = Math.max(selectRect.width, 260);
    const desiredLeft = selectRect.left - panelRect.left + panel.scrollLeft;
    const rightAlignedLeft = selectRect.right - panelRect.left + panel.scrollLeft - popoverWidth;
    popover.style.left = `${Math.max(12, Math.min(desiredLeft, rightAlignedLeft))}px`;
    popover.style.top = `${selectRect.bottom - panelRect.top + panel.scrollTop + 7}px`;
    popover.style.width = `${popoverWidth}px`;
    popover.classList.remove('hidden');
    gamepadSelectMenuTarget = select;
    select.classList.add('gamepad-editing');
    select.setAttribute('aria-expanded', 'true');
    updateSettingsGamepadHint(`正在展开「${settingsControlLabel(select)}」：上下选择，A 确定，B 返回`);
    const current = popover.querySelectorAll('button')[Math.max(0, select.selectedIndex)] || popover.querySelector('button');
    requestAnimationFrame(() => focusGamepadElement(current));
  }

  function stopGamepadFormEditing(revert = false, announce = true) {
    const control = gamepadFormEditing;
    if (!(control instanceof HTMLInputElement)) return false;
    if (revert) {
      control.value = gamepadFormOriginalValue;
      control.dispatchEvent(new Event('input', { bubbles: true }));
    }
    control.classList.remove('gamepad-editing');
    gamepadFormEditing = null;
    gamepadFormOriginalValue = '';
    updateSettingsGamepadHint();
    if (announce) showToast(revert ? '已取消调整。' : `${settingsControlLabel(control)}：${control.value}%`);
    return true;
  }

  function startGamepadFormEditing(control) {
    if (!(control instanceof HTMLInputElement) || control.type !== 'range') return;
    if (gamepadFormEditing && gamepadFormEditing !== control) stopGamepadFormEditing(false, false);
    gamepadFormEditing = control;
    gamepadFormOriginalValue = control.value;
    control.classList.add('gamepad-editing');
    focusGamepadElement(control);
    updateSettingsGamepadHint(`正在调整「${settingsControlLabel(control)}」：左右减速调整，A 确认，B 取消`);
    showToast('音量调整：十字键或左摇杆左右微调，A 确认。');
    gamepadRumble(.14, .08, 40);
  }

  function adjustGamepadRange(control, direction) {
    if (!(control instanceof HTMLInputElement) || control.type !== 'range') return false;
    if (gamepadFormEditing !== control) startGamepadFormEditing(control);
    const step = Number(control.step) || 1;
    const min = Number(control.min) || 0;
    const max = Number(control.max) || 100;
    const next = clamp(Number(control.value) + direction * step * 5, min, max);
    control.value = String(next);
    control.dispatchEvent(new Event('input', { bubbles: true }));
    updateSettingsGamepadHint(`正在调整「${settingsControlLabel(control)}」：${control.value}% · 左右继续，A 确认，B 取消`);
    focusGamepadElement(control);
    gamepadRumble(.1, .06, 30);
    return true;
  }

  function gamepadPrimaryElement() {
    if (dom.restartConfirmOverlay && !dom.restartConfirmOverlay.classList.contains('hidden')) return dom.restartConfirmCancel;
    if (dom.manualMenuOverlay && !dom.manualMenuOverlay.classList.contains('hidden')) return dom.manualGuideBtn || dom.manualPracticeBtn;
    if (dom.saveManagerOverlay && !dom.saveManagerOverlay.classList.contains('hidden')) return dom.saveSlotNew || dom.saveManagerDone;
    if (dom.runHistoryOverlay && !dom.runHistoryOverlay.classList.contains('hidden')) return dom.runHistoryDone;
    if (dom.enemyCodexOverlay && !dom.enemyCodexOverlay.classList.contains('hidden')) return dom.enemyCodexDone;
    if (dom.trainingBriefOverlay && !dom.trainingBriefOverlay.classList.contains('hidden')) return dom.trainingBriefConfirm;
    if (dom.trainingMenuOverlay && !dom.trainingMenuOverlay.classList.contains('hidden')) return dom.trainingStartFull;
    if (dom.acquisitionOverlay && !dom.acquisitionOverlay.classList.contains('hidden')) return dom.acquisitionConfirm;
    if (dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden')) return dom.relicDetailDone;
    if (dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden')) return dom.talentTree?.querySelector('.talent-node.selected') || dom.talentTree?.querySelector('[data-talent-id]') || dom.talentConfirm;
    if (dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden')) return dom.equipmentInventory?.querySelector('.equipment-item-card.selected') || dom.equipmentInventory?.querySelector('[data-equipment-uid]') || dom.equipmentDone;
    if (dom.npcOverlay && !dom.npcOverlay.classList.contains('hidden')) return dom.npcOptions?.querySelector('button');
    if (dom.bonfireOverlay && !dom.bonfireOverlay.classList.contains('hidden')) return dom.bonfireList?.querySelector('[data-bonfire-id]:not([disabled])') || dom.bonfireClose;
    if (dom.testModeOverlay && !dom.testModeOverlay.classList.contains('hidden')) return dom.testStartRun;
    if (dom.settingsOverlay && !dom.settingsOverlay.classList.contains('hidden')) return dom.performanceToggle || dom.settingsDone;
    if (dom.buffDetailOverlay && !dom.buffDetailOverlay.classList.contains('hidden')) return dom.buffDetailDone;
    const detailModal = [dom.eventDetailOverlay, dom.choiceDetailOverlay].find((overlay) => overlay && !overlay.classList.contains('hidden'));
    if (detailModal) return detailModal.querySelector('button:not([disabled]), [role="button"][tabindex]') || visibleGamepadFocusables()[0] || null;
    const preferred = {
      title: dom.continueRunBtn && !dom.continueRunBtn.classList.contains('hidden') ? dom.continueRunBtn : dom.startBtn,
      mode: dom.modeCards?.querySelector('[data-mode-choice]'),
      difficulty: dom.difficultyOptions?.querySelector('[data-difficulty-choice]'),
      map: dom.singleMapBoard?.querySelector('[data-map-move]'),
      squad: dom.squadCards?.querySelector('[data-squad-card]'),
      route: dom.routeCards?.querySelector('[data-route-card]'),
      event: dom.eventCards?.querySelector('[data-event-card]'),
      reward: dom.rewardCards?.querySelector('[data-reward-card]'),
      shop: dom.shopItems?.querySelector('.shop-buy:not([disabled])') || dom.shopContinue,
      boss: dom.bossStart,
      history: dom.historyContinue,
      ending: dom.endingRestart
    }[state.screen];
    return preferred || visibleGamepadFocusables()[0] || null;
  }

  function moveGamepadFocus(direction, adjustForm = false) {
    const items = visibleGamepadFocusables();
    if (!items.length) return;
    const active = document.activeElement;
    const activeIndex = items.indexOf(active);
    if (adjustForm && active instanceof HTMLInputElement && active.type === 'range') {
      adjustGamepadRange(active, direction);
      return;
    }
    if (adjustForm && active instanceof HTMLSelectElement) {
      openSettingsSelectPopover(active);
      return;
    }
    if (gamepadFormEditing && active === gamepadFormEditing) stopGamepadFormEditing(false, false);
    const nextIndex = activeIndex < 0 ? (direction < 0 ? items.length - 1 : 0) : (activeIndex + direction + items.length) % items.length;
    focusGamepadElement(items[nextIndex]);
  }

  function gamepadMenuStep(direction, now, adjustForm = false) {
    if (now - gamepadLastMenuMove < 230) return;
    moveGamepadFocus(direction, adjustForm);
    gamepadLastMenuMove = now;
  }

  function gamepadSelectionCount() {
    if (state.screen === 'squad') return squadOptionIds().length;
    if (state.screen === 'route') return state.routeOptions.length;
    if (state.screen === 'event') return state.currentEvent?.choices?.length || 0;
    if (state.screen === 'reward') return state.pendingRewards.length;
    return 0;
  }

  function gamepadSelectionIndex() {
    if (state.screen === 'squad') return Math.max(0, squadOptionIds().indexOf(selectedSquadId));
    if (state.screen === 'route') return selectedRouteIndex;
    if (state.screen === 'event') return selectedEventIndex;
    if (state.screen === 'reward') return selectedRewardIndex;
    return -1;
  }

  function focusSelectedChoiceCard() {
    const selector = state.screen === 'squad' ? '[data-squad-card].selected'
      : state.screen === 'route' ? '[data-route-card].selected'
        : state.screen === 'event' ? '[data-event-card].selected'
          : state.screen === 'reward' ? '[data-reward-card].selected' : '';
    if (selector) focusGamepadElement(document.querySelector(selector));
  }

  function setGamepadSelection(index) {
    const count = gamepadSelectionCount();
    if (!count) return;
    const next = ((index % count) + count) % count;
    if (state.screen === 'squad') {
      selectedSquadId = squadOptionIds()[next];
      updateSquadSelection();
    } else if (state.screen === 'route') {
      selectedRouteIndex = next;
      updateRouteSelection();
    } else if (state.screen === 'event') {
      selectedEventIndex = next;
      updateEventChoiceSelection();
    } else if (state.screen === 'reward') {
      selectedRewardIndex = next;
      updateRewardSelection();
    }
    focusSelectedChoiceCard();
  }

  function gamepadSelectionStep(direction, now) {
    if (now - gamepadLastMenuMove < 230) return;
    setGamepadSelection(gamepadSelectionIndex() + direction);
    gamepadLastMenuMove = now;
  }

  function gamepadOpenSelectionDetail() {
    const index = gamepadSelectionIndex();
    if (index < 0) return;
    if (state.screen === 'squad') openSquadDetail(selectedSquadId);
    else if (state.screen === 'route') openRouteDetail(index);
    else if (state.screen === 'event') openEventChoiceDetail(index);
    else if (state.screen === 'reward') openRewardDetail(index);
  }

  function gamepadConfirmSelection() {
    if (dom.selectionConfirm && !dom.selectionConfirm.disabled) {
      dom.selectionConfirm.click();
      return;
    }
    showToast('请先选择一个选项。');
  }

  function gamepadPrimaryAction() {
    const element = {
      boss: dom.bossStart,
      history: dom.historyContinue,
      ending: dom.endingRestart
    }[state.screen];
    if (element) {
      element.click();
      return true;
    }
    return false;
  }

  function gamepadConfirmFocused() {
    let active = document.activeElement;
    const focusables = visibleGamepadFocusables();
    if (!(active instanceof HTMLElement) || !focusables.includes(active)) {
      active = gamepadPrimaryElement();
      focusGamepadElement(active);
    }
    if (!(active instanceof HTMLElement)) return;
    if (active.matches('button, [role="button"]')) {
      active.click();
    } else if (active instanceof HTMLSelectElement) {
      openSettingsSelectPopover(active);
    } else if (active instanceof HTMLInputElement && active.type === 'range') {
      if (gamepadFormEditing === active) stopGamepadFormEditing(false, true);
      else startGamepadFormEditing(active);
    }
  }

  function gamepadBackAction() {
    if (dom.acquisitionOverlay && !dom.acquisitionOverlay.classList.contains('hidden')) { confirmAcquisition(); return; }
    if (dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden')) { closeRelicDetail(); return; }
    if (dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden')) { closeGrowthPanel(); return; }
    if (dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden')) { closeEquipmentPanel(); return; }
    if (dom.npcOverlay && !dom.npcOverlay.classList.contains('hidden')) { closeNpcPanel(); return; }
    if (dom.settingsSelectPopover && !dom.settingsSelectPopover.classList.contains('hidden')) { closeSettingsSelectPopover(true); return; }
    if (gamepadFormEditing) { stopGamepadFormEditing(true, true); return; }
    if (dom.restartConfirmOverlay && !dom.restartConfirmOverlay.classList.contains('hidden')) { closeRestartConfirm(); return; }
    if (dom.saveManagerOverlay && !dom.saveManagerOverlay.classList.contains('hidden')) { closeSaveManager(); return; }
    if (dom.settingsOverlay && !dom.settingsOverlay.classList.contains('hidden')) { closeSettings(); return; }
    if (dom.buffDetailOverlay && !dom.buffDetailOverlay.classList.contains('hidden')) { closeBuffDetails(); return; }
    if (dom.runHistoryOverlay && !dom.runHistoryOverlay.classList.contains('hidden')) { closeRunHistory(); return; }
    if (dom.enemyCodexOverlay && !dom.enemyCodexOverlay.classList.contains('hidden')) { closeEnemyCodex(); return; }
    if (dom.manualMenuOverlay && !dom.manualMenuOverlay.classList.contains('hidden')) { closeManualMenu(); return; }
    if (dom.trainingMenuOverlay && !dom.trainingMenuOverlay.classList.contains('hidden')) { closeTrainingMenu(); return; }
    if (dom.testModeOverlay && !dom.testModeOverlay.classList.contains('hidden')) { closeTestMode(); return; }
    if (dom.trainingBriefOverlay && !dom.trainingBriefOverlay.classList.contains('hidden')) { dom.trainingBriefSecondary.click(); return; }
    if (dom.tutorialOverlay && !dom.tutorialOverlay.classList.contains('hidden')) {
      if (tutorialStep > 0) {
        tutorialStep -= 1;
        renderTutorialStep();
      } else {
        closeTutorial(true);
      }
      return;
    }
    if (dom.choiceDetailOverlay && !dom.choiceDetailOverlay.classList.contains('hidden')) { closeChoiceDetail(); return; }
    if (dom.eventDetailOverlay && !dom.eventDetailOverlay.classList.contains('hidden')) { closeEventChoiceDetail(); return; }
    if (state.screen === 'shop') { closeShop(); return; }
    if (state.screen === 'history') {
      if (typeof state.historyContinue === 'function') state.historyContinue();
      return;
    }
    if (state.screen === 'ending') {
      if (dom.endingSourcePanel && !dom.endingSourcePanel.classList.contains('hidden')) dom.endingSourcePanel.classList.add('hidden');
      return;
    }
    if (state.screen === 'difficulty') { setScreen('mode'); return; }
    if (state.screen === 'squad') {
      if (selectedSquadId) {
        selectedSquadId = null;
        updateSquadSelection();
        focusGamepadElement(gamepadPrimaryElement());
      } else setScreen('title');
      return;
    }
    if (state.screen === 'route') {
      selectedRouteIndex = -1;
      updateRouteSelection();
      focusGamepadElement(gamepadPrimaryElement());
      return;
    }
    if (state.screen === 'event') {
      selectedEventIndex = -1;
      updateEventChoiceSelection();
      focusGamepadElement(gamepadPrimaryElement());
      return;
    }
    if (state.screen === 'reward') {
      selectedRewardIndex = -1;
      updateRewardSelection();
      focusGamepadElement(gamepadPrimaryElement());
      return;
    }
    showToast('这里没有可返回的上一页。');
  }

  function gamepadExecute() {
    const combat = state.combat;
    const enemy = targetEnemy();
    if (!combat || state.screen !== 'battle' || combat.finished || !enemy) return;
    if (!enemy.status.broken) {
      showToast('敌将尚未露出败势，现在还不能处决。');
      return;
    }
    beginPlayerAttack('normal');
  }

  function pollGamepad(now) {
    if (!navigator.getGamepads) {
      syncGamepadUi(null);
      return;
    }
    const pads = [...navigator.getGamepads()].filter(Boolean);
    const pad = pads.find((candidate) => candidate.connected) || null;
    syncGamepadUi(pad);
    if (!pad) {
      gamepadPrevButtons = [];
      gamepadPrevMenuAxisX = 0;
      gamepadPrevMenuAxisY = 0;
      return;
    }
    const down = (index) => gamepadButtonDown(pad, index);
    const just = (index) => down(index) && !gamepadPrevButtons[index];
    const released = (index) => !down(index) && !!gamepadPrevButtons[index];
    const buttonMap = gamepadButtonMap(pad);
    const settingsOpen = !!dom.settingsOverlay && !dom.settingsOverlay.classList.contains('hidden');
    const pauseOpen = !!dom.pauseOverlay && !dom.pauseOverlay.classList.contains('hidden');
    const buffOpen = !!dom.buffDetailOverlay && !dom.buffDetailOverlay.classList.contains('hidden');
    const tutorialOpen = !!dom.tutorialOverlay && !dom.tutorialOverlay.classList.contains('hidden');
    const runHistoryOpen = !!dom.runHistoryOverlay && !dom.runHistoryOverlay.classList.contains('hidden');
    const saveManagerOpen = !!dom.saveManagerOverlay && !dom.saveManagerOverlay.classList.contains('hidden');
    const enemyCodexOpen = !!dom.enemyCodexOverlay && !dom.enemyCodexOverlay.classList.contains('hidden');
    const manualMenuOpen = !!dom.manualMenuOverlay && !dom.manualMenuOverlay.classList.contains('hidden');
    const trainingMenuOpen = !!dom.trainingMenuOverlay && !dom.trainingMenuOverlay.classList.contains('hidden');
    const trainingBriefOpen = !!dom.trainingBriefOverlay && !dom.trainingBriefOverlay.classList.contains('hidden');
    const testModeOpen = !!dom.testModeOverlay && !dom.testModeOverlay.classList.contains('hidden');
    const acquisitionOpen = !!dom.acquisitionOverlay && !dom.acquisitionOverlay.classList.contains('hidden');
    const relicDetailOpen = !!dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden');
    const growthOpen = !!dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden');
    const equipmentOpen = !!dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden');
    const npcOpen = !!dom.npcOverlay && !dom.npcOverlay.classList.contains('hidden');
    const bonfireOpen = !!dom.bonfireOverlay && !dom.bonfireOverlay.classList.contains('hidden');
    const restartOpen = !!dom.restartConfirmOverlay && !dom.restartConfirmOverlay.classList.contains('hidden');
    const detailOpen = (dom.choiceDetailOverlay && !dom.choiceDetailOverlay.classList.contains('hidden')) || (dom.eventDetailOverlay && !dom.eventDetailOverlay.classList.contains('hidden'));
    const anyModalOpen = settingsOpen || pauseOpen || buffOpen || tutorialOpen || runHistoryOpen || enemyCodexOpen || saveManagerOpen || manualMenuOpen || trainingMenuOpen || trainingBriefOpen || testModeOpen || acquisitionOpen || relicDetailOpen || growthOpen || equipmentOpen || npcOpen || bonfireOpen || restartOpen || detailOpen;
    const battleActive = state.screen === 'battle' && state.combat && !state.combat.finished && !state.player.postureBroken;
    const [axisX, axisY] = gamepadAxes(pad);
    let menuAxisX = Math.abs(axisX) >= GAMEPAD_MENU_DEADZONE ? Math.sign(axisX) : 0;
    let menuAxisY = Math.abs(axisY) >= GAMEPAD_MENU_DEADZONE ? Math.sign(axisY) : 0;
    if (menuAxisX && menuAxisY) {
      if (Math.abs(axisX) > Math.abs(axisY)) menuAxisY = 0;
      else menuAxisX = 0;
    }
    const justMenuX = menuAxisX && menuAxisX !== gamepadPrevMenuAxisX ? menuAxisX : 0;
    const justMenuY = menuAxisY && menuAxisY !== gamepadPrevMenuAxisY ? menuAxisY : 0;
    gamepadPrevMenuAxisX = menuAxisX;
    gamepadPrevMenuAxisY = menuAxisY;
    const menuUp = just(12) || justMenuY < 0;
    const menuDown = just(13) || justMenuY > 0;
    const menuLeft = just(14) || justMenuX < 0;
    const menuRight = just(15) || justMenuX > 0;
    const menuNegative = menuUp || menuLeft;
    const menuPositive = menuDown || menuRight;

    if (state.bindingCapture) {
      const capture = state.bindingCapture;
      controllerInput.left = controllerInput.right = controllerInput.up = controllerInput.down = controllerInput.sprint = false;
      if (capture.kind === 'pad' && now >= capture.armedAt) {
        const pressedIndex = pad.buttons.findIndex((button, index) => (button.pressed || button.value > .5) && !gamepadPrevButtons[index]);
        if (pressedIndex >= 0) assignInputBinding('pad', capture.action, pressedIndex);
        else if (just(gamepadBinding('cancel', pad))) { state.bindingCapture = null; renderInputBindings(); }
      }
      gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
      return;
    }

    if (just(gamepadBinding('pause', pad))) {
      if (pauseOpen) closePauseMenu();
      else if (!anyModalOpen) {
        if (canPauseGame()) openPauseMenu();
        else if (settingsOpen) closeSettings();
        else openSettings();
      }
      gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
      return;
    }
    if (just(gamepadBinding('buffs', pad)) && state.training?.active && state.screen === 'battle') {
      finishPracticalTutorial('已跳过战前演练。');
      gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
      return;
    }
    if (just(gamepadBinding('buffs', pad)) && !anyModalOpen) {
      if (buffOpen) closeBuffDetails();
      else openBuffDetails();
      gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
      return;
    }
    if (just(buttonMap.cancel) && !anyModalOpen && !battleActive && state.screen !== 'map') {
      gamepadBackAction();
      gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
      return;
    }

    if (settingsOpen || pauseOpen || buffOpen || detailOpen || runHistoryOpen || enemyCodexOpen || saveManagerOpen || trainingMenuOpen || trainingBriefOpen || testModeOpen || acquisitionOpen || relicDetailOpen || growthOpen || equipmentOpen || npcOpen || bonfireOpen || restartOpen) {
      controllerInput.left = false;
      controllerInput.right = false;
      controllerInput.up = false;
      controllerInput.down = false;
      ensureGamepadFocus();
      if (menuUp) gamepadMenuStep(-1, now, false);
      if (menuDown) gamepadMenuStep(1, now, false);
      if (menuLeft) gamepadMenuStep(-1, now, true);
      if (menuRight) gamepadMenuStep(1, now, true);
      if (acquisitionOpen && (just(buttonMap.confirm) || just(buttonMap.cancel))) confirmAcquisition();
      else if (pauseOpen && just(buttonMap.cancel)) closePauseMenu();
      else if (restartOpen && just(buttonMap.cancel)) closeRestartConfirm();
      else if (relicDetailOpen && just(buttonMap.cancel)) closeRelicDetail();
      else if (growthOpen && just(buttonMap.cancel)) closeGrowthPanel();
      else if (equipmentOpen && just(buttonMap.cancel)) closeEquipmentPanel();
      else if (npcOpen && just(buttonMap.cancel)) closeNpcPanel();
      else if (bonfireOpen && just(buttonMap.cancel)) closeBonfirePanel();
      else if (trainingBriefOpen && just(buttonMap.cancel)) dom.trainingBriefSecondary.click();
      else if (trainingMenuOpen && just(buttonMap.cancel)) closeTrainingMenu();
      else if (runHistoryOpen && just(buttonMap.cancel)) closeRunHistory();
      else if (saveManagerOpen && just(buttonMap.cancel)) closeSaveManager();
      else if (testModeOpen && just(buttonMap.cancel)) closeTestMode();
      else if (enemyCodexOpen && just(buttonMap.cancel)) closeEnemyCodex();
      else if (!acquisitionOpen && just(buttonMap.confirm)) {
        if (dom.choiceDetailOverlay && !dom.choiceDetailOverlay.classList.contains('hidden')) closeChoiceDetail();
        else if (dom.eventDetailOverlay && !dom.eventDetailOverlay.classList.contains('hidden')) closeEventChoiceDetail();
        else gamepadConfirmFocused();
      }
    } else if (tutorialOpen) {
      controllerInput.left = false;
      controllerInput.right = false;
      controllerInput.up = false;
      controllerInput.down = false;
      ensureGamepadFocus();
      if (menuUp) gamepadMenuStep(-1, now, false);
      if (menuDown) gamepadMenuStep(1, now, false);
      if (menuLeft && tutorialStep > 0) {
        tutorialStep -= 1;
        renderTutorialStep();
      }
      if (menuRight && tutorialStep < dom.tutorialSlides.length - 1) {
        tutorialStep += 1;
        renderTutorialStep();
      }
      if (just(buttonMap.confirm)) gamepadConfirmFocused();
    } else if (battleActive) {
      let left = axisX < -GAMEPAD_DEADZONE || down(14);
      let right = axisX > GAMEPAD_DEADZONE || down(15);
      if (left && right) left = right = false;
      controllerInput.left = left;
      controllerInput.right = right;
      controllerInput.up = axisY < -GAMEPAD_DEADZONE;
      controllerInput.down = axisY > GAMEPAD_DEADZONE;

      if (just(gamepadBinding('jump', pad))) performJump();
      if (just(buttonMap.cancel)) performDodge();
      if (just(gamepadBinding('attack', pad))) startAttackHold({ button: 0 });
      if (released(gamepadBinding('attack', pad))) releaseAttackHold();
      const guardIndex = gamepadBinding('guard', pad), guardDown = down(guardIndex);
      if (just(guardIndex)) pressGuardInput('gamepad');
      if (guardDown && parrySession?.active && !state.combat.blockHeld) {
        state.combat.blockHeld = true;
        state.combat.blockHeldAt = now;
      }
      if (released(guardIndex)) releaseGuardInput();
      if (just(buttonMap.sweep)) gamepadExecute();
      if (just(buttonMap.shoot)) fireRifle();
      if (just(gamepadBinding('heal', pad))) useEmergencyHeal();
      if (just(gamepadBinding('item', pad))) useQuickItem();
    } else {
      controllerInput.left = false;
      controllerInput.right = false;
      controllerInput.up = false;
      controllerInput.down = false;
      const selectionScreen = ['squad', 'route', 'event', 'reward'].includes(state.screen);
      if (state.screen === 'map') {
        let mapLeft = axisX < -GAMEPAD_DEADZONE || down(14);
        let mapRight = axisX > GAMEPAD_DEADZONE || down(15);
        if (mapLeft && mapRight) mapLeft = mapRight = false;
        controllerInput.left = mapLeft;
        controllerInput.right = mapRight;
        controllerInput.up = axisY < -GAMEPAD_DEADZONE || down(12);
        controllerInput.down = axisY > GAMEPAD_DEADZONE || down(13);
        controllerInput.sprint = down(gamepadBinding('sprint', pad));
        if (just(gamepadBinding('interact', pad))) interactSingleMap();
      } else if (selectionScreen) {
        if (menuNegative) gamepadSelectionStep(-1, now);
        if (menuPositive) gamepadSelectionStep(1, now);
        if (just(buttonMap.confirm)) gamepadConfirmSelection();
        if (just(buttonMap.shoot)) gamepadOpenSelectionDetail();
      } else if (state.screen === 'shop') {
        if (menuNegative) gamepadShopStep(-1, now);
        if (menuPositive) gamepadShopStep(1, now);
        if (just(buttonMap.confirm)) gamepadConfirmShop();
      } else {
        ensureGamepadFocus();
        if (menuUp) gamepadMenuStep(-1, now, false);
        if (menuDown) gamepadMenuStep(1, now, false);
        if (menuLeft) gamepadMenuStep(-1, now, true);
        if (menuRight) gamepadMenuStep(1, now, true);
        if (just(buttonMap.confirm) && !gamepadPrimaryAction()) gamepadConfirmFocused();
      }
    }
    gamepadPrevButtons = pad.buttons.map((button) => button.pressed || button.value > .5);
  }

  function playerCenterX() {
    return state.combat?.playerRenderX ?? 360;
  }

  function currentEnemyDistance() {
    const enemy = targetEnemy();
    if (!enemy || !state.combat) return 999;
    const index = state.combat.enemies.indexOf(enemy);
    return Math.max(0, enemyCanvasPosition(index).x - state.combat.playerX);
  }

  function canPlayerMove() {
    const combat = state.combat;
    const p = state.player;
    if (!combat || state.screen !== 'battle' || combat.holding || combat.dodge || p?.postureBroken) return false;
    if (p?.hitstunUntil > performance.now()) return false;
    const dodgingShot = shotSession?.active && shotSession.combat === combat;
    return dodgingShot || (!combat.busy && combat.phase === 'player' && !parrySession?.active);
  }

  function movePlayer(delta) {
    const combat = state.combat;
    if (!canPlayerMove()) return;
    combat.playerX = clamp(combat.playerX + delta, PLAYER_MIN_X, PLAYER_MAX_X);
  }

  function spawnFootDust(x, direction, y = (state.combat?.playerY || 352) + 30) {
    for (let i = 0; i < 4; i++) {
      scene.particles.push({
        x: x + (state.rng() - .5) * 16,
        y: y + (state.rng() - .5) * 5,
        vx: -direction * (10 + state.rng() * 30) + (state.rng() - .5) * 12,
        vy: -6 - state.rng() * 12,
        life: .22 + state.rng() * .16, maxLife: .38,
        color: i % 2 ? '#b7a17e' : '#8f7e65', size: 1.2 + state.rng() * 2.2
      });
    }
  }

  function updatePlayerMovement(dt) {
    const combat = state.combat;
    if (!combat || combat.dodge) return;
    const canMove = canPlayerMove();
    if (!canMove) {
      combat.moveVelocity = 0;
      return;
    }
    const moveLeft = movementInput.left || controllerInput.left;
    const moveRight = movementInput.right || controllerInput.right;
    const moveUp = movementInput.up || controllerInput.up;
    const moveDown = movementInput.down || controllerInput.down;
    let directionX = Number(moveRight) - Number(moveLeft);
    let directionY = Number(moveDown) - Number(moveUp);
    const inputLength = Math.hypot(directionX, directionY);
    if (inputLength > 1) {
      directionX /= inputLength;
      directionY /= inputLength;
    }
    const guardSlow = combat.blockHeld ? .42 : 1;
    const targetVelocityX = directionX * PLAYER_SPEED * (1 + (state.player?.moveSpeedBonus || 0)) * guardSlow;
    const targetVelocityY = directionY * PLAYER_SPEED * .72 * (1 + (state.player?.moveSpeedBonus || 0)) * guardSlow;
    const acceleration = inputLength ? 3600 : 5200;
    combat.moveVelocity += clamp(targetVelocityX - combat.moveVelocity, -acceleration * dt, acceleration * dt);
    combat.moveVelocityY += clamp(targetVelocityY - combat.moveVelocityY, -acceleration * dt, acceleration * dt);
    if (!directionX && Math.abs(combat.moveVelocity) < 4) combat.moveVelocity = 0;
    if (!directionY && Math.abs(combat.moveVelocityY) < 4) combat.moveVelocityY = 0;
    const speed = Math.hypot(combat.moveVelocity, combat.moveVelocityY);
    if (speed > .5) {
      const previousX = combat.playerX;
      const previousY = combat.playerY;
      combat.playerX = clamp(combat.playerX + combat.moveVelocity * dt, PLAYER_MIN_X, PLAYER_MAX_X);
      combat.playerY = clamp(combat.playerY + combat.moveVelocityY * dt, PLAYER_MIN_Y, PLAYER_MAX_Y);
      if (combat.playerX === previousX) combat.moveVelocity = 0;
      if (combat.playerY === previousY) combat.moveVelocityY = 0;
      combat.stepPhase += speed * dt * .045;
      if (combat.stepPhase - combat.lastFootstep >= Math.PI) {
        combat.lastFootstep = combat.stepPhase;
        spawnFootDust(combat.playerX, Math.sign(combat.moveVelocity) || 1, combat.playerY + 30);
      }
    }
  }

  function cancelParryForDodge() {
    if (!parrySession) return;
    const resolve = parrySession.resolve;
    clearPauseAwareDelay(parrySession.watchdog);
    parrySession.active = false;
    parrySession.resolved = true;
    cancelAnimationFrame(parrySession.frame);
    dom.parryOverlay.className = 'parry-overlay hidden';
    scene.duel = null;
    parrySession = null;
    resolve('dodged');
  }

  function pressGuardInput(source = 'key') {
    if (shotSession?.active) {
      attemptShotDefense(source);
      return;
    }
    if (parrySession?.active) {
      attemptParry(source);
      return;
    }
    if (state.screen === 'battle' && state.combat && !state.combat.finished && !state.player.postureBroken) {
      if (state.combat.busy && !cancelPlayerRecovery()) return;
      state.combat.blockHeld = true;
      state.combat.blockHeldAt = performance.now();
      setActionState();
    }
  }

  function releaseGuardInput() {
    if (state.combat) state.combat.blockHeld = false;
    setActionState();
  }

  function performJump() {
    const combat = state.combat, p = state.player;
    if (!combat || combat.finished || state.screen !== 'battle' || !p || p.postureBroken || p.hitstunUntil > performance.now() || combat.blockHeld) return false;
    if (!combat.grounded) return false;
    combat.grounded = false;
    combat.jumpVelocity = 430;
    combat.jumpHeight = Math.max(1, combat.jumpHeight || 0);
    combat.stompDone = false;
    combat.dodge = null;
    playSound('dodge');
    dom.controlHint.textContent = '跃起 · 下落时可踩头或出刀';
    return true;
  }

  function updateJumpPhysics(dt, now) {
    const combat = state.combat, p = state.player;
    if (!combat || !p || combat.grounded && (combat.jumpHeight || 0) <= 0) return;
    combat.jumpVelocity -= 760 * dt;
    combat.jumpHeight = Math.max(0, (combat.jumpHeight || 0) + combat.jumpVelocity * dt);
    if (combat.jumpVelocity < 0 && !combat.stompDone) {
      const target = targetEnemy();
      if (target && !target.dead && Math.abs((target.x || 735) - combat.playerX) < 105 && combat.jumpHeight > 42 && combat.jumpHeight < 118) {
        combat.stompDone = true;
        combat.jumpVelocity = -120;
        target.status.stun = Math.max(target.status.stun || 0, 1);
        target.hitstunUntil = Math.max(target.hitstunUntil || 0, now + 420);
        target.intent = { type: 'stunned', label: '踩头打断 · 迟滞', value: 0 };
        addEnemyPosture(target, 24);
        scene.shake = Math.max(scene.shake, 10);
        scene.goldFlash = Math.max(scene.goldFlash, .42);
        const stompPos = enemyCanvasPosition(combat.enemies.indexOf(target));
        spawnParticles(stompPos.x, stompPos.y - 55, '#ffd66e', 24);
        playSound('guard');
        addLog('<strong>踏敌肩头</strong>，打断了敌将的起手。', 'good');
        if (state.training?.active && state.training.step === 7) recordTrainingSuccess(7);
      }
    }
    if (combat.jumpHeight <= 0) { combat.jumpHeight = 0; combat.jumpVelocity = 0; combat.grounded = true; combat.stompDone = false; }
  }

  function performDodge() {
    const combat = state.combat;
    const p = state.player;
    const now = performance.now();
    if (!combat || state.screen !== 'battle' || combat.finished || combat.holding) return;
    if (combat.busy) {
      if (!cancelPlayerRecovery()) {
        combat.queuedDodge = true;
        setText(dom.controlHint, '闪避已蓄势 · 收招后立刻闪开');
        return;
      }
    }
    if (p.postureBroken || p.hitstunUntil > now) return;
    if (combat.blockHeld) {
      showToast('松开 F 后再闪避。');
      return;
    }
    if (combat.dodge) return;
    if (now < p.dodgeCooldownUntil) return;

    const thrustDodge = parrySession?.active && parrySession.enemy?.intent?.type === 'thrust';
    if (thrustDodge) {
      const progress = parryProgressAt(parrySession, now);
      if (progress < parrySession.cueAt - .015) {
        showToast(`等枪尖闪光再按 ${inputBindingLabel('dodge')} 识破。`);
        return;
      }
      if (progress > parrySession.blockEnd + .06) return;
    }

    const moveLeft = movementInput.left || controllerInput.left;
    const moveRight = movementInput.right || controllerInput.right;
    const moveUp = movementInput.up || controllerInput.up;
    const moveDown = movementInput.down || controllerInput.down;
    let inputX = Number(moveRight) - Number(moveLeft);
    let inputY = Number(moveDown) - Number(moveUp);
    if (!inputX && !inputY) inputX = -1;
    const inputLength = Math.hypot(inputX, inputY) || 1;
    inputX /= inputLength;
    inputY /= inputLength;
    let direction = Math.sign(inputX);
    let verticalDirection = Math.sign(inputY);
    if (direction < 0 && combat.playerX <= PLAYER_MIN_X + 8) direction = inputY ? 0 : 1;
    if (direction > 0 && combat.playerX >= PLAYER_MAX_X - 8) direction = inputY ? 0 : -1;
    if (verticalDirection < 0 && combat.playerY <= PLAYER_MIN_Y + 8) verticalDirection = inputX ? 0 : 1;
    if (verticalDirection > 0 && combat.playerY >= PLAYER_MAX_Y - 8) verticalDirection = inputX ? 0 : -1;
    inputX = direction || inputX;
    inputY = verticalDirection || inputY;
    const normalLength = Math.hypot(inputX, inputY) || 1;
    inputX /= normalLength;
    inputY /= normalLength;
    const startX = combat.playerX;
    const startY = combat.playerY;
    const dodgeDistance = 188;
    const endX = clamp(startX + inputX * dodgeDistance, PLAYER_MIN_X, PLAYER_MAX_X);
    const endY = clamp(startY + inputY * dodgeDistance * .42, PLAYER_MIN_Y, PLAYER_MAX_Y);
    combat.moveVelocity = 0;
    combat.moveVelocityY = 0;
    combat.dodge = { start: now, duration: 280, startX, endX, startY, endY, direction, verticalDirection, identify: thrustDodge };
    combat.invulnerableUntil = now + 440;
    p.dodgeCooldownUntil = now + Math.round(780 * (1 - (p.dodgeCooldownReduction || 0)));
    scene.invulnerabilityFlash = .32;
    spawnParticles(startX, startY + 2, '#d5c493', 18);
    spawnParticles(startX + inputX * 34, startY - 30, '#f2dfae', 10);
    playSound('dodge');
    gamepadRumble(.24, .16, 70);

    if (thrustDodge) {
      if (state.training?.active && state.training.step === 4) recordTrainingSuccess(4);
      const enemy = parrySession.enemy;
      p.posture = Math.max(0, p.posture - 28);
      p.postureRecoverAt = now + 700;
      p.morale = Math.min(100, p.morale + 5);
      spawnFloat(playerCenterX(), 245, '识破!', '#fff0b0');
      spawnFloat(playerCenterX(), 275, '架势回稳', '#9fd39b');
      addLog('<strong>识破突刺</strong>：横闪让过枪尖，接下来拉枪踏刃。', 'good');
      playSound('parry');
      cancelParryForDodge();
      startMikiriCounter(enemy);
    } else if (parrySession?.active) {
      cancelParryForDodge();
      setText(dom.controlHint, '闪避成功 · 落地后立即左键反击');
    }
    setActionState();
  }

  function startMikiriCounter(enemy) {
    const combat = state.combat;
    if (!combat || !enemy || state.screen !== 'battle') return;
    const now = performance.now();
    const enemyIndex = combat.enemies.indexOf(enemy);
    const impactX = playerCenterX() + 66;
    const impactY = combat.playerY + 22;
    combat.busy = true;
    combat.phase = 'enemy';
    combat.moveVelocity = 0;
    combat.moveVelocityY = 0;
    enemy.action = 'mikiri';
    enemy.hitstunUntil = now + 900;
    enemy.intent = { type: 'stagger', label: '识破 · 拉枪踏刃', value: 0 };
    scene.mikiri = { start: now, duration: 760, enemyIndex, impactX, impactY, impacted: false };
    dom.controlHint.textContent = '识破！拉枪、踏刃、轰！';
    renderEnemyCards();
    setActionState();
    setTimeout(() => {
      if (!state.combat || state.combat !== combat || combat.finished || enemy.dead || !scene.mikiri) return;
      scene.mikiri.impacted = true;
      addEnemyPosture(enemy, 54);
      scene.shake = Math.max(scene.shake, 27);
      scene.goldFlash = Math.max(scene.goldFlash, .88);
      scene.flash = Math.max(scene.flash, .28);
      scene.clash = { x: impactX, y: impactY, life: .44, maxLife: .44, power: 1.7 };
      spawnParticles(impactX, impactY, '#ffe2a0', 54);
      spawnParticles(impactX, impactY + 8, '#7d5a3a', 26);
      spawnFloat(impactX, impactY - 92, '踏刃!', '#fff0b0');
      playSound('mikiri');
      gamepadRumble(1, .82, 190);
      addLog('<strong>踏刃识破</strong>：敌枪被拉落，一脚踩住枪身，敌军架势遭到重创。', 'good');
      renderEnemyCards();
    }, 315);
    setTimeout(() => {
      if (!state.combat || state.combat !== combat || combat.finished) return;
      scene.mikiri = null;
      combat.busy = false;
      combat.phase = 'player';
      combat.comboStage = 0;
      combat.comboExpiresAt = 0;
      if (!enemy.dead) {
        enemy.action = 'stagger';
        enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 260);
        enemy.intent = { type: 'stagger', label: '枪身被踩 · 架势重创', value: 0 };
      }
      setActionState();
      renderEnemyCards();
    }, 790);
  }

  function updateDodge(now) {
    const combat = state.combat;
    if (!combat?.dodge) return;
    const dodge = combat.dodge;
    const t = clamp((now - dodge.start) / dodge.duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    combat.playerX = dodge.startX + (dodge.endX - dodge.startX) * eased;
    combat.playerY = dodge.startY + (dodge.endY - dodge.startY) * eased;
    if (t >= 1) {
      combat.dodge = null;
      combat.dodgeCounterUntil = now + 720 + (state.player.dodgeCounterWindowBonus || 0);
      const followup = combat.queuedAttack;
      combat.queuedAttack = null;
      if (followup === 'normal' && !state.player.postureBroken && !combat.enemies.every((enemy) => enemy.dead)) {
        beginPlayerAttack('normal', 'dodge');
      } else {
        setActionState();
      }
    }
  }

  function enemyScale() {
    return 1 + Math.min(10, state.battleNumber) * .085 + state.chapter * .13;
  }

  function difficultyProfile() {
    if (state.runMode === 'single' && state.singlePace === 'quick') return { id: 'quick', name: '快速模式', rank: '标准', enemyHp: 1, enemyAtk: 1, enemyPosture: 1, merit: 1 };
    return DIFFICULTY_LEVELS.find((entry) => entry.id === state.difficulty) || DIFFICULTY_LEVELS[1];
  }
  function difficultyLabel() {
    const profile = difficultyProfile();
    return `${profile.rank} · ${profile.name}`;
  }
  function makeEnemy(typeId, route, index, boss = false) {
    const base = ENEMY_TYPES[typeId];
    const scale = boss ? 1 : enemyScale();
    const difficulty = state.runMode === 'single' ? difficultyProfile() : { enemyHp: 1, enemyAtk: 1, enemyPosture: 1, merit: 1 };
    const elite = !boss && route.elite === true;
    const bossVariant = boss && typeId !== 'boss' ? ELITE_VARIANTS[typeId] : null;
    const eliteVariant = elite || bossVariant ? (bossVariant || ELITE_VARIANTS[typeId]) : null;
    const lateElitePressure = elite ? Math.max(0, state.chapter - 2) : 0;
    const eliteHpScale = elite ? 1.55 * (1 + lateElitePressure * .12) * (eliteVariant?.hpMultiplier || 1) : 1;
    const eliteAttackScale = elite ? 1.12 * (1 + lateElitePressure * .055) * (eliteVariant?.damageMultiplier || 1) : 1;
    const bossScale = boss ? (route.bossScale || 1) : 1;
    const bossBaseMultiplier = boss ? (typeId === 'boss' ? 5.2 : 7.2) : 1;
    const hp = Math.round(base.hp * scale * eliteHpScale * (boss ? bossBaseMultiplier * bossScale : 1.58) * difficulty.enemyHp);
    const attack = Math.round(base.atk * (1 + state.chapter * .13 + Math.min(10, state.battleNumber) * .035) * eliteAttackScale * (boss ? 1.2 * bossScale : 1) * difficulty.enemyAtk);
    const homeX = index === 0 ? 735 : 610 + index * 170;
    const healthSegments = boss ? 3 : elite ? 2 : 1;
    const eliteSpecial = elite || bossVariant ? ELITE_SPECIALS[typeId] : null;
    const basePattern = [...(ENEMY_PATTERNS[typeId] || ['slash', 'quick', 'shot'])];
    const lateMoves = [];
    if (!boss && state.chapter >= 2) lateMoves.push('quick');
    if (!boss && state.chapter >= 3) lateMoves.push('combo');
    const elitePattern = elite || bossVariant ? [...(ELITE_PATTERNS[typeId] || [])] : [];
    const normalPattern = [...new Set(elite || bossVariant ? [...elitePattern, ELITE_SIGNATURES[typeId] || 'eliteMove'] : [...basePattern, ...lateMoves])];
    const pattern = boss && Array.isArray(route.bossPattern) && route.bossPattern.length ? [...route.bossPattern] : normalPattern;
    const phase2Pattern = boss && Array.isArray(route.bossRagePattern) && route.bossRagePattern.length ? [...route.bossRagePattern] : null;
    const basePosture = eliteVariant?.posture || 380;
    const elitePosture = Math.round(basePosture * (1 + lateElitePressure * .12));
    return {
      id: `${typeId}-${Date.now()}-${index}-${Math.floor(state.rng() * 10000)}`,
      typeId,
      name: boss ? (route.bossTitle ? `首领·${route.bossTitle}` : base.name) : elite ? `精英·${eliteVariant.name}` : base.name,
      glyph: eliteVariant?.glyph || base.glyph,
      color: eliteVariant?.color || base.color,
      role: eliteVariant?.role || base.role,
      elite, eliteSpecial, eliteStyle: eliteVariant?.style || '', eliteXpMultiplier: elite ? (eliteVariant?.xp || 1.5) : boss ? 2.2 : 1, weaponKind: eliteVariant?.weapon || base.weapon || 'saber', healthSegments,
      hp, maxHp: hp, atk: attack, defense: Math.round(base.defense * (1 + state.chapter * .05)),
      crit: base.crit || 0, scale: base.scale * (eliteVariant ? eliteVariant.scale * (boss ? .82 : 1) : 1), boss,
      status: { stun: route.firstStun && index === 0 ? 1 : 0, armor: 0, charged: false, broken: false },
      posture: 0, maxPosture: Math.round((boss ? 760 * bossScale : elite ? elitePosture : 230) * difficulty.enemyPosture), postureRecoverAt: 0, lastPostureHitAt: 0, postureBreakUntil: 0, hitstunUntil: 0,
      pattern, phase2Pattern, bossMechanic: boss ? (route.bossTrait || '') : '', sequenceIndex: 0,
      intent: null, dead: false, phase2: false, hasActed: false,
      x: homeX, homeX, y: 330 + (index % 2) * 18, moveTargetX: homeX, action: 'idle'
    };
  }

  function createEnemies(route, boss) {
    if (route?.testEnemyType) return [makeEnemy(route.testEnemyType, route, 0, !!boss)];
    if (boss) return [makeEnemy(route.bossType || 'boss', route, 0, true)];
    if (route?.forcedEnemyType) return [makeEnemy(route.forcedEnemyType, route, 0, false)];
    const chapter = CHAPTERS[state.chapter];
    const lateElitePool = route.elite && state.chapter >= 3 ? LATE_ELITE_POOLS[state.chapter] : null;
    const pool = lateElitePool?.length ? lateElitePool : chapter.enemies;
    const count = route.count;
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const type = choice(state.rng, pool);
      enemies.push(makeEnemy(type, route, i, false));
    }
    if (count === 2 && route.support) enemies[1].hp = Math.max(1, Math.round(enemies[1].hp * .8));
    return enemies;
  }

  function intentDamage(enemy) {
    const base = enemy.atk + Math.round(enemy.atk * .1);
    return Math.max(1, base);
  }

  function enemyHealthState(enemy) {
    const segments = Math.max(1, enemy.healthSegments || 1);
    const segmentSize = enemy.maxHp / segments;
    const remaining = Math.max(0, Math.ceil(enemy.hp / segmentSize));
    const currentHp = enemy.hp <= 0 ? 0 : enemy.hp - (Math.max(1, remaining) - 1) * segmentSize;
    return { remaining, segments, segmentSize, currentHp, currentPct: remaining > 0 ? clamp(currentHp / segmentSize * 100, 0, 100) : 0 };
  }

  function assignIntent(enemy) {
    if (enemy.dead) return;
    if (enemy.status.stun > 0) {
      enemy.intent = { type: 'stunned', label: '陷入迟滞', value: 0 };
      return;
    }
    if (enemy.status.charged) {
      enemy.intent = { type: 'heavy', label: '重击即将落下', value: Math.round(intentDamage(enemy) * 1.65) };
      return;
    }
    if (enemy.boss && enemy.hp <= enemy.maxHp * .5) enemy.phase2 = true;
    const pattern = enemy.boss && enemy.phase2 ? (enemy.phase2Pattern || ENEMY_PATTERNS.bossRage) : enemy.pattern;
    const move = pattern[enemy.sequenceIndex % pattern.length];
    enemy.sequenceIndex += 1;
    if (move === 'guard') {
      enemy.intent = { type: 'guard', label: enemy.boss ? '收紧防线' : '就地戒备', value: 0 };
    } else if (move === 'charge') {
      enemy.intent = { type: 'charge', label: '正在蓄力', value: 0 };
    } else if (move === 'siege') {
      enemy.intent = { type: 'siege', label: '全线合围', value: Math.round(intentDamage(enemy) * 1.45) };
    } else if (move === 'shot') {
      enemy.intent = { type: 'shot', label: '抬枪瞄准 · 可走位', value: Math.round(intentDamage(enemy) * .9) };
    } else if (move === 'whirlwind') {
      enemy.intent = { type: 'whirlwind', label: '旋风斩 · 五连', value: Math.round(intentDamage(enemy) * 1.8) };
    } else if (move === 'blinkSlash') {
      enemy.intent = { type: 'blinkSlash', label: '瞬步一闪 · 快位移', value: Math.round(intentDamage(enemy) * 1.25) };
    } else if (move === 'slowFast') {
      enemy.intent = { type: 'slowFast', label: '快慢双刀 · 迟滞后急斩', value: Math.round(intentDamage(enemy) * 1.45) };
    } else if (move === 'quick') {
      enemy.intent = { type: 'quick', label: '快速斩 · 前摇短', value: intentDamage(enemy) };
    } else if (move === 'thrust') {
      enemy.intent = { type: 'thrust', label: '枪刃突刺 · 可弹反', value: Math.round(intentDamage(enemy) * 1.32) };
    } else if (move === 'eliteMove') {
      enemy.intent = { type: 'eliteMove', label: `${enemy.eliteSpecial?.label || '精英绝技'} · 专属`, value: Math.round(intentDamage(enemy) * 1.3) };
    } else if (move === 'combo') {
      enemy.intent = { type: 'combo', label: '双连斩 · 两段', value: Math.round(intentDamage(enemy) * 1.45) };
    } else if (move === 'advanceCombo') {
      enemy.intent = { type: 'advanceCombo', label: '抢近身 · 三段追斩', value: Math.round(intentDamage(enemy) * 1.6) };
    } else if (move === 'retreatThrust') {
      enemy.intent = { type: 'retreatThrust', label: '后撤蓄枪 · 贯阵突刺', value: Math.round(intentDamage(enemy) * 1.62) };
    } else if (move === 'backstepShot') {
      enemy.intent = { type: 'backstepShot', label: '后撤抬枪 · 瞄准射击', value: Math.round(intentDamage(enemy) * 1.08) };
    } else if (move === 'backstepCleave') {
      enemy.intent = { type: 'backstepCleave', label: '后撤蓄势 · 大范围横劈', value: Math.round(intentDamage(enemy) * 1.75) };
    } else if (move === 'feintDash') {
      enemy.intent = { type: 'feintDash', label: '左右虚晃 · 贴身快斩', value: Math.round(intentDamage(enemy) * 1.22) };
    } else {
      enemy.intent = { type: 'attack', label: enemy.phase2 ? '猛烈横斩' : '横斩', value: intentDamage(enemy) };
    }
  }

  function assignAllIntents() {
    state.combat.enemies.forEach(assignIntent);
  }

  function renderEnemyCards() {
    const combat = state.combat;
    if (!combat) return;
    dom.enemyCards.innerHTML = combat.enemies.map((enemy) => {
      const health = enemyHealthState(enemy);
      const pct = health.currentPct;
      const posturePct = clamp(enemy.posture / enemy.maxPosture * 100, 0, 100);
      const target = combat.targetId === enemy.id ? 'target' : '';
      const dead = enemy.dead ? 'dead' : '';
      const broken = enemy.status.broken ? 'broken' : '';
      const elite = enemy.elite ? 'elite' : '';
      const status = enemy.status.broken ? '可处决' : enemy.action === 'breathe' ? '喘息' : enemy.status.stun > 0 ? '迟滞' : enemy.status.armor > 0 ? '戒备' : enemy.phase2 ? '狂暴' : '';
      return `<button class="enemy-card ${target} ${dead} ${broken} ${elite}" data-enemy="${enemy.id}" type="button">
        <div class="enemy-name"><span>${enemy.name}</span><span>${status ? `${status} · ` : ''}尚余 ${Math.max(0, health.remaining)} 道防线</span></div>
        ${enemy.bossMechanic ? `<div class="enemy-trait">${enemy.bossMechanic}</div>` : ''}
        <div class="enemy-bar"><i style="width:${pct}%"></i></div>
        <div class="enemy-posture-row"><span>架势</span><div class="enemy-posture"><i data-posture="${enemy.id}" style="width:${posturePct}%"></i></div></div>
      </button>`;
    }).join('');
    dom.enemyCards.querySelectorAll('[data-enemy]').forEach((button) => {
      button.addEventListener('click', () => {
        const enemy = combat.enemies.find((item) => item.id === button.dataset.enemy);
        if (enemy && !enemy.dead) {
          combat.targetId = enemy.id;
          renderEnemyCards();
        }
      });
    });
    updateEliteHealthHud();
    const intents = combat.enemies.filter((enemy) => !enemy.dead).map((enemy) => {
      const text = enemy.status.broken ? '架势崩溃 · 可处决' : enemy.action === 'breathe' ? '正在喘息调息 · 攻击可打断' : enemy.intent ? enemy.intent.label : '正在移动';
      const value = enemy.intent && enemy.intent.value && !enemy.status.broken ? ` <b>${enemy.intent.value}</b>` : '';
      return `${enemy.name}：${text}${value}`;
    });
    dom.intentLine.innerHTML = intents.length ? intents.join('　｜　') : '敌军已被击退。';
  }

  function logEntryHtml(entry) {
    const count = entry.count > 1 ? `<span class="log-count">×${entry.count}</span>` : '';
    return `<div class="log-entry ${entry.type || ''}">${entry.text}${count}</div>`;
  }

  function renderCombatLog() {
    if (!state.combat) return;
    dom.combatLog.innerHTML = state.combat.logs.map(logEntryHtml).join('');
    dom.combatLog.scrollTop = 0;
  }

  // 同一句话在 4 秒内重复出现就并进原来那条，用 ×N 计数。
  // 连续挨打时「格挡时机失误」能一秒一条，不压的话整块面板只剩这一句，
  // 首领招式、破防、掉落全被挤出可视区。
  const LOG_DEDUPE_WINDOW = 4000;

  function addLog(text, type = '') {
    if (!state.combat) return;
    const now = performance.now();
    const tone = type || '';
    const logs = state.combat.logs;
    const hitIndex = logs.findIndex((entry) => entry.text === text
      && (entry.type || '') === tone
      && now - (entry.at || 0) < LOG_DEDUPE_WINDOW);
    if (hitIndex >= 0) {
      const entry = logs[hitIndex];
      entry.count = (entry.count || 1) + 1;
      entry.at = now;
      // 只改这一行，不整块重排，省掉一次 innerHTML 重建 + 滚动位置复位
      const node = dom.combatLog.children[hitIndex];
      if (node) node.innerHTML = `${entry.text}<span class="log-count">×${entry.count}</span>`;
      else renderCombatLog();
      return;
    }
    logs.unshift({ text, type, count: 1, at: now });
    state.combat.logs = logs.slice(0, 18);
    renderCombatLog();
  }

  function setActionState() {
    if (!state.combat || !dom.controlBar) return;
    const p = state.player;
    const now = performance.now();
    const stunned = (p?.hitstunUntil || 0) > now;
    const dodging = !!state.combat.dodge;
    const locked = state.combat.busy || state.combat.phase !== 'player' || p?.postureBroken || stunned || dodging;
    dom.controlBar.classList.toggle('locked', locked);
    dom.controlBar.classList.toggle('guarding', !!state.combat.blockHeld);
    setText(dom.ammoText, state.combat.ammo ?? 0);
    setText(dom.gourdText, state.combat.emergencyUses ?? 0);
    if (dom.dodgeState) {
      const remain = Math.max(0, (p.dodgeCooldownUntil - now) / 1000);
      setText(dom.dodgeState, dodging ? '闪避中' : remain > 0 ? remain.toFixed(1) + 's' : '就绪');
      dom.dodgeState.classList.toggle('ready', !dodging && remain <= 0);
      dom.dodgeState.classList.toggle('cooldown', dodging || remain > 0);
    }
    if (dodging) {
      setText(dom.controlHint, '闪避中 · 左键可先接反击');
      return;
    }
    if (p?.postureBroken) {
      setText(dom.controlHint, '我方架势崩溃，正在重整阵脚…');
      return;
    }
    if (stunned) {
      setText(dom.controlHint, '身形一晃 · 片刻后便能还手…');
      return;
    }
    if (!locked && !state.combat.holding) {
      if (state.combat.comboStage > 0 && state.combat.comboStage < 5 && now <= (state.combat.comboExpiresAt || 0)) {
        const nextStage = state.combat.comboStage + 1;
        const techHint = state.combat.comboStage >= 2 && (state.player.techniques || []).length ? ' · W/A/S/D + 左键可变招' : '';
        setText(dom.controlHint, `左键续上第 ${nextStage} 式${techHint}`);
        return;
      }
      if (state.combat.dodgeCounterUntil > now) {
        setText(dom.controlHint, '闪避已占先机 · 左键追上去');
        return;
      }
      if (state.combat.counterWindowUntil > now) {
        setText(dom.controlHint, '挡势已成 · 左键接守反');
        return;
      }
      if (state.combat.counterKind && now <= (state.combat.counterExpiresAt || 0)) {
        const chain = PLAYER_COUNTER_PROFILES[state.combat.counterKind] || [];
        const next = Math.min(chain.length, (state.combat.counterStep || 0) + 1);
        setText(dom.controlHint, `左键接 ${chain[next - 1]?.name || '追击'}`);
        return;
      }
      if (state.combat.blockHeld) {
        setText(dom.controlHint, `防御中 · 金光一闪时按 ${inputBindingLabel('guard')} 弹反`);
        return;
      }
      const enemy = targetEnemy();
      const distance = Math.round(currentEnemyDistance());
      if (enemy?.status.broken) {
        setText(dom.controlHint, distance <= MELEE_RANGE ? '处决就绪：左键近战处决 / R 远程爆头' : '处决就绪：R 远程爆头，或继续靠近后左键近战处决');
      } else {
        const rangeText = distance <= MELEE_RANGE ? '已进入刀锋距离' : '还需再靠近些';
        setText(dom.controlHint, `${rangeText} · ${formatKeyCode(keyBinding('moveUp'))}/${formatKeyCode(keyBinding('moveLeft'))}/${formatKeyCode(keyBinding('moveDown'))}/${formatKeyCode(keyBinding('moveRight'))} 或左摇杆走位 · ${inputBindingLabel('dodge')} 定向闪避 · 按住 ${inputBindingLabel('guard')} 格挡 · 金光后点按弹反`);
      }
    }
  }

  function renderCombat() {
    if (!state.combat) return;
    const chapter = CHAPTERS[state.chapter];
    dom.battleChapter.textContent = state.combat.boss ? '终章' : `${chapter.act} · ${chapter.name}`;
    dom.battleTitle.textContent = state.combat.boss ? (state.currentRoute?.title || '本幕首领') : (state.currentRoute?.title || chapter.subtitle);
    dom.turnCount.textContent = '●';
    dom.bossWarning.classList.toggle('hidden', !state.combat.boss);
    updateMetaBars();
    renderEnemyCards();
    renderCombatLog();
    setActionState();
  }

  function startBattle(route, boss, resumeSnapshot = null) {
    state.boss = boss;
    state.combat = {
      enemies: createEnemies(route, boss),
      busy: false, phase: 'player', holding: false, holdStart: 0, holdFrame: 0, playerX: 360, playerRenderX: 360, playerY: 352, playerRenderY: 352, ammo: 6, targetId: null, boss,
      emergencyUses: 1 + (state.player?.emergencyBonus || 0), blockHeld: false, jumpHeight: 0, jumpVelocity: 0, grounded: true, stompDone: false, blockHeldAt: 0, dodge: null, invulnerableUntil: 0, moveVelocity: 0, moveVelocityY: 0, stepPhase: 0, lastFootstep: 0, queuedAttack: null, queuedDodge: false, counterWindowUntil: 0, comboStage: 0, comboExpiresAt: 0, dodgeCounterUntil: 0, counterKind: null, counterStep: 0, counterExpiresAt: 0, logs: [], started: Date.now(), finished: false, lastPostureUi: 0, actionSerial: 0
    };
    if (resumeSnapshot) applyCombatSnapshot(state.combat, resumeSnapshot);
    const newlyDiscovered = state.combat.enemies.filter((enemy) => discoverEnemy(enemy)).map((enemy) => enemy.name);
    const player = state.player;
    if (!resumeSnapshot) {
      player.guard = 0;
      player.cooldowns.charge = 0;
      player.cooldowns.tactic = 0;
      player.firstAction = true;
      if (player.openingMoraleBonus) player.morale = Math.min(100, player.morale + player.openingMoraleBonus);
      player.firstGuard = true;
      player.firstSupply = true;
      player.firstBlockHeal = true;
      player.posture = 0;
      player.postureBroken = false;
      player.postureBreakUntil = 0;
      player.hitstunUntil = 0;
      player.dodgeCooldownUntil = 0;
      state.battleNumber += 1;
    }
    state.combat.targetId = resumeSnapshot ? state.combat.targetId : state.combat.enemies[0]?.id || null;
    scene.execution = null;
    assignAllIntents();
    saveCurrentRun('battle');
    addLog(boss ? (route.finalBoss ? '<strong>最后的封锁线</strong>挡住通往会师地的道路。' : `<strong>${route.bossTitle || route.title}</strong>守住下一地区的入口。`) : `<strong>${route.title}</strong>：队伍进入接敌位置。`, 'bad');
    if (newlyDiscovered.length) addLog(`<strong>已识得敌将</strong>：${newlyDiscovered.join('、')}。`, 'good');
    if (route.firstStun) addLog('夜袭奏效，敌军短暂陷入迟滞。', 'good');
    if (boss && route.bossTrait) addLog(`<strong>首领特性</strong>：${route.bossTrait}。${route.bossCounter || ''}`, 'bad');
    renderCombat();
    dom.canvas.classList.remove('hidden');
    setMeta();
    setScreen('battle');
    resizeCanvasToDisplay();
    armPlayerWindow();
    if (boss && route.bossIntro && !resumeSnapshot) {
      const bossClue = STORY_CLUES.find((clue) => clue.id === 'clue_boss_confession') || STORY_CLUES.find((clue) => clue.region === route.bossRegion);
      if (bossClue) grantStoryClue(bossClue.id, { silent: true });
      queueAcquisition({ type: 'boss-intro', kicker: '首领初见', name: route.bossTitle || route.title || '敌军首领', icon: '首', meta: state.combat.boss ? '首领战' : '强敌', desc: `${route.bossIntro || '敌军拦住去路。'}${bossClue ? `\n\n${bossClue.text}` : ''}`, effects: [route.bossTrait ? `特性：${route.bossTrait}` : '看清起手与收招', route.bossCounter ? `应对：${route.bossCounter}` : '先稳住架势'], note: '看清第一刀后，战斗才会开始。', onConfirm: () => startRealtimeCombat() });
    } else startRealtimeCombat();
    playSound('enemy');
  }

  function targetEnemy() {
    const combat = state.combat;
    const broken = combat.enemies.find((enemy) => !enemy.dead && enemy.status.broken);
    let target = broken || combat.enemies.find((enemy) => enemy.id === combat.targetId && !enemy.dead);
    if (!target) target = combat.enemies.find((enemy) => !enemy.dead);
    if (target) combat.targetId = target.id;
    return target;
  }

  function enemyCanvasPosition(index) {
    const enemies = state.combat?.enemies || [];
    const enemy = enemies[index];
    if (enemy) return { x: enemy.x ?? enemy.homeX ?? 735, y: enemy.y ?? 330 };
    if (enemies.length <= 1) return { x: 735, y: 330 };
    return { x: 600 + index * 175, y: 330 + (index % 2) * 18 };
  }

  function spawnParticles(x, y, color, count = 16) {
    count = Math.max(1, Math.ceil(count * (state.performanceMode ? .45 : 1)));
    const particleLimit = state.performanceMode ? 90 : 240;
    if (scene.particles.length >= particleLimit) return;
    count = Math.min(count, particleLimit - scene.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = state.rng() * Math.PI * 2;
      const speed = 40 + state.rng() * 160;
      scene.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
        life: .35 + state.rng() * .45, maxLife: .8, color, size: 1 + state.rng() * 3
      });
    }
  }

  function spawnProjectile(x1, y1, x2, y2, color = '#ffd37d', options = {}) {
    const life = options.life || .18;
    scene.projectiles.push({
      x1, y1, x2, y2, color, life, maxLife: life,
      hostile: !!options.hostile, width: options.width || 3
    });
  }
  function spawnFloat(x, y, text, color = '#f6dfba') {
    scene.floats.push({ x, y, text, color, life: .9, maxLife: .9, vy: -44 });
  }

  function enemyHitFx(index, text, color = '#ff6a56', strong = false) {
    const pos = enemyCanvasPosition(index);
    scene.enemyHit[index] = .25;
    scene.shake = Math.max(scene.shake, strong ? 12 : 6);
    spawnParticles(pos.x, pos.y - 65, color, strong ? 28 : 16);
    spawnFloat(pos.x, pos.y - 120, text, color);
    scene.slashes.push({ x: pos.x, y: pos.y - 60, life: .2, maxLife: .2, radius: strong ? 75 : 52, angle: (state.rng() - .5) * .8, shards: strong ? 9 : 6 });
  }

  function playerHitFx(damage) {
    const x = playerCenterX();
    gamepadRumble(.72, .4, 120);
    scene.shake = Math.max(scene.shake, 10);
    scene.flash = .42;
    spawnParticles(x, 330, '#e54e3d', 18);
    spawnFloat(x, 245, `-${damage}`, '#ff7664');
  }

  function showPlayerStateNotice(title, detail, kind, duration = 0) {
  const combat = state.combat;
  if (!combat) return;
  combat.statusNotice = { title, detail, kind, until: performance.now() + duration };
  dom.playerStateTitle.textContent = title;
  dom.playerStateDetail.textContent = detail;
  dom.playerStateWarning.className = `player-state-warning ${kind}`;
  dom.playerStateWarning.classList.remove('hidden');
}

function updatePlayerStateNotice(now) {
  const notice = state.combat?.statusNotice;
  if (!notice) return;
  if (notice.until <= now) {
    state.combat.statusNotice = null;
    dom.playerStateWarning.className = 'player-state-warning hidden';
  }
}

function breakPlayerPosture() {
    const p = state.player;
    if (p.postureBroken) return;
    p.postureBroken = true;
    p.posture = p.maxPosture;
    p.postureBreakUntil = performance.now() + 1700;
    state.combat.blockHeld = false;
    movementInput.left = false;
    movementInput.right = false;
    scene.shake = Math.max(scene.shake, 14);
    scene.flash = .52;
    spawnFloat(playerCenterX(), 235, '架势崩溃!', '#ff9a78');
    spawnParticles(playerCenterX(), 315, '#e47b55', 28);
    playSound('boom');
    playSound('miss');
    addLog('<strong>我方架势崩溃</strong>，短时间内无法行动。', 'bad');
    showToast('我方架势崩溃！');
    showPlayerStateNotice('架势崩溃', '扶剑失衡 · 正在重整架势', 'broken', 1700);
    updateMetaBars();
    setActionState();
  }

  function addPlayerPosture(amount, source = '') {
    const p = state.player;
    if (p.postureBroken) return;
    const before = p.posture;
    p.posture = clamp(p.posture + amount, 0, p.maxPosture);
    p.postureRecoverAt = performance.now() + 2550;
    if (before < p.maxPosture * .72 && p.posture >= p.maxPosture * .72) {
      showToast('架势将崩：先拉开距离，或靠弹反、识破稳住阵脚。');
      scene.goldFlash = Math.max(scene.goldFlash, .12);
    }
    if (p.posture >= p.maxPosture) breakPlayerPosture();
  }

  function moraleMultiplier() {
    const p = state.player;
    const spread = .2 + p.moralePower;
    return clamp(1 + ((p.morale - 50) / 100) * spread, .76, 1.3);
  }

  function calculatePlayerDamage(enemy, multiplier, options = {}) {
    const p = state.player;
    const variance = randInt(state.rng, -2, 5);
    let base = p.atk + variance - Math.max(0, enemy.defense * .55);
    if (options.basic) {
      base += p.basicBonus;
      base *= .8;
    }
    if (options.charge) base *= 1 + p.chargeBonus;
    base *= multiplier * .62;
    base *= moraleMultiplier();
    if (p.hp / p.maxHp < .4) base *= 1 + p.lowHpBonus;
    let critChance = p.crit + (options.critBonus || 0);
    if (p.firstAction && p.squadId === 'scout') critChance += .08;
    let critical = state.rng() < critChance;
    if (p.firstStrikeCrit && p.firstAction) critical = true;
    if (options.noCrit) critical = false;
    if (critical) base *= 1.7;
    if (enemy.status.armor > 0) base *= .62;
    return { damage: Math.max(1, Math.round(base)), critical };
  }

  function attackPostureDamage(label) {
    if (label.includes('扫荡') || label.includes('处决')) return 0;
    if (label.includes('突刺')) return 29;
    if (label.includes('拼刀')) return 22;
    if (label.includes('步枪')) return 7;
    if (label.includes('穿插')) return 12;
    return 12;
  }

  function enemyIsPreparingAttack(enemy) {
    if (!enemy?.intent || ['move', 'guard', 'breathe', 'stagger', 'broken', 'stunned'].includes(enemy.intent.type)) return false;
    return ['dash', 'backstep', 'blink', 'attack', 'advanceWindup', 'feintDash', 'thrustWindup', 'cleaveWindup', 'aimWindup'].includes(enemy.action);
  }

  function enemyHighThreatActive(enemy) {
    return !!enemy?.intent && HIGH_THREAT_INTENTS.has(enemy.intent.type);
  }

  function tryEnemyGuard(enemy, label) {
    if (!enemy || enemy.dead || enemy.status.broken || enemy.status.stun > 0) return false;
    if (label.includes('步枪') || label.includes('处决') || label.includes('扫荡')) return false;
    if (enemyHighThreatActive(enemy) || enemyIsPreparingAttack(enemy)) return false;
    const now = performance.now();
    if ((enemy.blockCooldownUntil || 0) > now) return false;
    const recovering = (enemy.recoveryUntil || 0) > now;
    const idle = ['patrol', 'retreat'].includes(enemy.action);
    const forced = !!enemy.tutorialForceGuard;
    const chance = forced ? 1 : recovering ? .72 : idle ? .26 : 0;
    if (!chance || (!forced && state.rng() >= chance)) return false;
    if (forced) {
      enemy.tutorialForceGuard = false;
      if (state.training?.active && state.training.step === 1) recordTrainingMetric('guard', '横刃格挡');
    }
    enemy.blockingUntil = now + 180;
    enemy.blockCooldownUntil = now + 920;
    enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, now + 75);
    enemy.action = 'block';
    enemy.moveTargetX = enemy.x;
    setTimeout(() => {
      if (!enemy.dead && enemy.action === 'block' && performance.now() >= (enemy.blockingUntil || 0)) {
        enemy.action = 'patrol';
        renderEnemyCards();
      }
    }, 190);
    const pos = enemyCanvasPosition(state.combat.enemies.indexOf(enemy));
    spawnParticles(pos.x - 18, pos.y - 42, '#f1cf82', 14);
    spawnFloat(pos.x, pos.y - 104, '格挡', '#d8c18b');
    playSound('block');
    addLog(`<strong>${enemy.name}</strong> 在收招间隙横刃格挡，这一击只造成极少伤害。`, 'bad');
    return true;
  }

  function addEnemyPosture(enemy, amount) {
    if (!enemy || enemy.dead || enemy.status.broken || amount <= 0) return;
    const now = performance.now();
    enemy.posture = clamp(enemy.posture + amount, 0, enemy.maxPosture);
    enemy.lastPostureHitAt = now;
    enemy.postureRecoverAt = now + 1450;
    if (enemy.action === 'breathe') {
      enemy.action = 'stagger';
      enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, now + 240);
      enemy.intent = { type: 'stagger', label: '喘息被打断', value: 0 };
      addLog(`<strong>${enemy.name} 的喘息被打断</strong>。`, 'good');
    }
    if (enemy.posture >= enemy.maxPosture) breakEnemyPosture(enemy);
  }

  function shouldEnemyBreathe(enemy, now) {
    return !enemy.dead && !enemy.status.broken && enemy.action !== 'breathe' &&
      enemy.posture >= enemy.maxPosture * .55 && enemy.posture < enemy.maxPosture * .94 &&
      now - (enemy.lastPostureHitAt || 0) >= 2800;
  }

  async function performEnemyBreather(combat, enemy) {
    if (state.combat !== combat || combat.finished || enemy.dead || enemy.status.broken) return;
    const startedAt = performance.now();
    const duration = 1600;
    const startPosture = enemy.posture;
    const recovery = 22;
    enemy.action = 'breathe';
    enemy.moveTargetX = enemy.homeX;
    enemy.intent = { type: 'breathe', label: '喘息调息 · 命中可打断', value: 0 };
    renderEnemyCards();
    addLog(`${enemy.name} 开始喘口气，架势会慢慢回落；趁现在打断。`, '');
    while (state.combat === combat && !combat.finished && !enemy.dead && enemy.action === 'breathe') {
      const t = clamp((performance.now() - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const nextPosture = Math.max(0, startPosture - recovery * eased);
      if (enemy.action === 'breathe') enemy.posture = Math.min(enemy.posture, nextPosture);
      await sleep(70);
    }
    if (state.combat === combat && !combat.finished && !enemy.dead && enemy.action === 'breathe') {
      enemy.action = 'patrol';
      enemy.intent = { type: 'move', label: '喘息结束', value: 0 };
      addLog(`${enemy.name} 缓过气来，架势稳住了。`, '');
      renderEnemyCards();
    }
  }

  function breakEnemyPosture(enemy) {
    if (!enemy || enemy.dead || enemy.status.broken) return;
    enemy.status.broken = true;
    enemy.posture = enemy.maxPosture;
    enemy.postureBreakUntil = performance.now() + (enemy.boss ? 3000 : 3800);
    enemy.action = 'collapse';
    enemy.moveTargetX = Math.min(enemy.x, state.combat.playerX + 185);
    enemy.intent = { type: 'broken', label: '架势崩溃 · 可处决', value: 0 };
    const index = state.combat.enemies.indexOf(enemy);
    const pos = enemyCanvasPosition(index);
    scene.goldFlash = Math.max(scene.goldFlash, .65);
    scene.shake = Math.max(scene.shake, 12);
    scene.clash = { x: pos.x, y: pos.y - 58, life: .3, maxLife: .3, power: 1.1 };
    spawnParticles(pos.x, pos.y - 65, '#ffe2a0', 34);
    spawnFloat(pos.x, pos.y - 128, '架势崩溃!', '#ffe4a1');
    playSound('boom');
    playSound('parry');
    addLog(`<strong>${enemy.name} 架势崩溃</strong>，贴近左键处决，或按 R 远程爆头。`, 'good');
    renderEnemyCards();
    showToast('敌将露出败势：贴近处决，或举枪远程爆头');
  }

  function dealDamageToEnemy(enemy, damage, critical, label = '', options = {}) {
    if (!enemy || enemy.dead || enemy.status.broken) return;
    const now = performance.now();
    const preparing = enemyIsPreparingAttack(enemy);
    const highThreat = enemyHighThreatActive(enemy);
    const index = state.combat.enemies.indexOf(enemy);
    if (tryEnemyGuard(enemy, label)) {
      const health = enemyHealthState(enemy);
      const blockDamage = Math.min(Math.max(0, health.currentHp - 1), Math.max(1, Math.round(damage * .16)));
      enemy.hp = Math.max(1, enemy.hp - blockDamage);
      state.stats.damage += blockDamage;
      enemyHitFx(index, `-${blockDamage} 格挡`, '#d8c18b', false);
      addEnemyPosture(enemy, 1.2 + attackPostureDamage(label) * .035);
      return;
    }
    const healthBefore = enemyHealthState(enemy);
    const wouldClearBar = damage >= healthBefore.currentHp;
    const appliedDamage = wouldClearBar ? Math.max(0, healthBefore.currentHp - 1) : damage;
    enemy.hp = Math.max(1, enemy.hp - appliedDamage);
    state.stats.damage += appliedDamage;
    enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, now + (enemy.boss ? 72 : critical ? 190 : 118));
    enemyHitFx(index, wouldClearBar ? '锁血' : `-${appliedDamage}${critical ? ' 暴击' : ''}`, wouldClearBar ? '#ffe3a0' : critical ? '#ffd26f' : '#ff6a56', critical);
    playSound(critical ? 'crit' : 'hit');
    if (!options.noPosture) {
      const postureDamage = Math.round(attackPostureDamage(label) * (critical ? 1.22 : 1) * (options.postureMultiplier || 1));
      addEnemyPosture(enemy, postureDamage);
    }
    if (preparing && !highThreat && !enemy.status.broken) {
      enemy.status.stun = 1;
      enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, now + 260);
      if (state.training?.active && state.training.step === 1) recordTrainingMetric('interrupt', '抢招打断');
      spawnFloat(enemyCanvasPosition(index).x, enemyCanvasPosition(index).y - 118, '抢招打断!', '#9fd39b');
      addLog(`<strong>抢招命中</strong>：在 ${enemy.name} 低威胁出招前打断其动作。`, 'good');
    }
    if (wouldClearBar && !enemy.status.broken) {
      enemy.hp = Math.max(1, enemy.hp);
      breakEnemyPosture(enemy);
      spawnFloat(enemyCanvasPosition(index).x, enemyCanvasPosition(index).y - 142, '锁血 · 可处决!', '#ffe3a0');
      addLog(`<strong>${enemy.name}</strong> 已只剩一口气。贴近处决，或举枪远程终结。`, 'good');
      return;
    }
    addLog(`${label || '队伍攻击'}对 ${enemy.name} 造成 <strong>${appliedDamage}</strong> 点伤害${critical ? '，暴击！' : '。'}`);
  }

  function healPlayer(amount, source = '补给') {
    const p = state.player;
    const healed = Math.min(p.maxHp - p.hp, Math.max(0, Math.round(amount)));
    p.hp += healed;
    const x = playerCenterX();
    spawnFloat(x, 260, `+${healed}`, '#91d08a');
    spawnParticles(x, 325, '#83b878', 14);
    playSound('heal');
    addLog(`${source}恢复了 <strong>${healed}</strong> 点兵力。`, 'good');
  }

  function useEmergencyHeal() {
    const combat = state.combat;
    const p = state.player;
    if (!combat || state.screen !== 'battle' || combat.finished || p.postureBroken) return;
    if (combat.emergencyUses <= 0) {
      showToast('本场急救已经用完。');
      return;
    }
    if (p.hp >= p.maxHp) {
      showToast('队伍兵力充足，无需急救。');
      return;
    }
    combat.emergencyUses -= 1;
    healPlayer(Math.round(p.maxHp * .28) + p.healBonus, '战地急救');
    updateMetaBars();
    setActionState();
  }

  function resolveExecutionDamage(enemy, type, variant) {
    const pos = enemyCanvasPosition(state.combat.enemies.indexOf(enemy));
    const health = enemyHealthState(enemy);
    const damage = Math.max(1, Math.ceil(health.currentHp));
    enemy.hp = Math.max(0, enemy.hp - damage);
    enemy.status.broken = false;
    enemy.posture = 0;
    enemy.postureBreakUntil = 0;
    const healthAfter = enemyHealthState(enemy);
    if (!state.training?.active) {
      state.stats.executions = (state.stats.executions || 0) + 1; checkAchievements();
      const executionMerit = Math.round(12 * (1 + (state.player.executionMeritBonus || 0)));
      state.player.merit = (state.player.merit || 0) + executionMerit;
      spawnFloat(pos.x, pos.y - 92, `军功 +${executionMerit}`, '#efc978');
    }
    if (state.training?.active && state.training.step === 6) recordTrainingSuccess(6);
    const labelMap = { waist: '腰斩处决', pierce: '贯胸处决', behead: '斩首处决', headshot: '远程爆头' };
    const label = labelMap[type === 'ranged' ? 'headshot' : variant] || '处决';
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.dead = true;
      enemy.intent = null;
      addLog(`<strong>${label}</strong>：${enemy.name} 被彻底击溃。`, 'good');
      state.player.supplies = Math.min(state.player.maxSupplies, state.player.supplies + 3);
    } else {
      enemy.action = 'stagger';
      enemy.moveTargetX = enemy.x;
      enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 900);
      enemy.hasActed = true;
      enemy.intent = { type: 'stagger', label: `${label} · 尚余 ${healthAfter.remaining} 道防线`, value: 0 };
      spawnFloat(pos.x, pos.y - 150, '破甲 · 破去一道防线!', '#ffe2a0');
      addLog(`<strong>${label}</strong>：${enemy.name} 的一道防线被击溃，尚余 ${healthAfter.remaining} 道。`, 'good');
    }
    updateMetaBars();
    renderEnemyCards();
    return enemy.dead;
  }

  function startExecutionCinematic(enemy, type = 'melee') {
    const combat = state.combat;
    if (!combat || !enemy || enemy.dead || !enemy.status.broken || combat.finished || scene.execution) return;
    const variants = ['waist', 'pierce', 'behead'];
    const variant = type === 'ranged' ? 'headshot' : variants[Math.floor(state.rng() * variants.length)];
    const duration = type === 'ranged' ? 1540 : 1420;
    const impactAt = .43;
    const now = performance.now();
    state.player.firstAction = false;
    combat.busy = true;
    combat.phase = 'attack';
    combat.blockHeld = false;
    combat.moveVelocity = 0;
    combat.moveVelocityY = 0;
    combat.queuedAttack = null;
    combat.queuedDodge = false;
    enemy.action = 'execution';
    enemy.hitstunUntil = now + duration + 520;
    scene.execution = { type, variant, enemyIndex: combat.enemies.indexOf(enemy), start: now, duration, impactAt, impacted: false };
    const labels = {
      waist: '腰斩处决 · 断阵', pierce: '贯胸处决 · 穿阵',
      behead: '斩首处决 · 落锋', headshot: '远程爆头 · 绝响'
    };
    dom.controlHint.textContent = labels[variant];
    renderEnemyCards();
    setActionState();
    if (type === 'melee') playSound('executionSlash');
    else playSound('executionRanged');
    playSound('swing');
    addLog(type === 'ranged' ? `<strong>远程处决锁定</strong>：枪口对准 ${enemy.name} 的头颅。` : `<strong>近战处决锁定</strong>：${enemy.name} 已无力招架。`, 'good');
    setTimeout(() => {
      if (!state.combat || state.combat !== combat || combat.finished || !scene.execution) return;
      scene.execution.impacted = true;
      scene.flash = .92;
      scene.goldFlash = .78;
      scene.shake = 34;
      const pos = enemyCanvasPosition(combat.enemies.indexOf(enemy));
      scene.clash = { x: pos.x - 20, y: pos.y - 52, life: .5, maxLife: .5, power: 2.2 };
      spawnParticles(pos.x, pos.y - 55, type === 'ranged' ? '#ffe8b0' : '#fff0b8', type === 'ranged' ? 70 : 58);
      spawnParticles(pos.x, pos.y - 55, '#d84235', type === 'ranged' ? 40 : 30);
      spawnFloat(pos.x, pos.y - 145, labels[variant], '#fff0b8');
      playSound(type === 'ranged' ? 'headshot' : 'execution');
      gamepadRumble(1, .9, 220);
      resolveExecutionDamage(enemy, type, variant);
    }, Math.round(duration * impactAt));
    setTimeout(() => {
      if (!state.combat || state.combat !== combat || combat.finished) {
        if (scene.execution) scene.execution = null;
        return;
      }
      scene.execution = null;
      if (combat.enemies.every((target) => target.dead)) {
        finishVictory();
        return;
      }
      combat.busy = false;
      combat.phase = 'player';
      if (!enemy.dead) {
        enemy.action = 'stagger';
        enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 360);
      }
      renderEnemyCards();
      setActionState();
    }, duration);
  }

  function executeBrokenEnemy() {
    const enemy = targetEnemy();
    if (!enemy || !enemy.status.broken || enemy.dead) return;
    startExecutionCinematic(enemy, 'melee');
  }

  function basicAttack() {
    const p = state.player;
    const enemy = targetEnemy();
    if (!enemy) return;
    const attack = scene.playerAttack;
    if (attack?.aerial) {
      const result = calculatePlayerDamage(enemy, .92, { critBonus: .06 });
      dealDamageToEnemy(enemy, result.damage, result.critical, '跳劈', { postureMultiplier: 1.2 });
      if (state.combat) state.combat.jumpVelocity = -260;
      addLog('<strong>跳劈</strong>从上方压落。', 'good');
      if (state.training?.active && state.training.step === 7) recordTrainingSuccess(7);
      return;
    }
    if (attack?.counterKind) {
      const chain = PLAYER_COUNTER_PROFILES[attack.counterKind] || [];
      const profile = chain[(attack.counterStep || 1) - 1];
      if (!profile) return;
      const counterBonus = attack.counterKind === 'dodge' ? (p.dodgeCounterBonus || 0) : (p.guardCounterBonus || 0) + (p.squadId === 'engineer' ? .12 : 0);
      state.stats.counters = (state.stats.counters || 0) + 1; checkAchievements();
      const result = calculatePlayerDamage(enemy, profile.damage * (1 + counterBonus), { critBonus: .08 });
      p.firstAction = false;
      dealDamageToEnemy(enemy, result.damage, result.critical, profile.name, { postureMultiplier: profile.posture });
      if (state.training?.active && state.training.step === 3 && attack.counterKind === 'dodge' && attack.counterStep === 1) {
        recordTrainingSuccess(3);
      }
      return;
    }
    const stage = attack?.comboStage || 1;
    const profile = PLAYER_COMBO_PROFILES[stage] || PLAYER_COMBO_PROFILES[1];
    const result = calculatePlayerDamage(enemy, profile.damage, { basic: true });
    p.firstAction = false;
    dealDamageToEnemy(enemy, result.damage, result.critical, profile.name, { postureMultiplier: profile.posture });
  }

  function chargeAttack() {
    const p = state.player;
    const enemy = targetEnemy();
    if (!enemy) return;
    p.firstAction = false;
    const result = calculatePlayerDamage(enemy, 1.68 * (1 + (p.chargeBonus || 0)), { charge: true, critBonus: .04 });
    dealDamageToEnemy(enemy, result.damage, result.critical, '突刺');
    addLog('<strong>突刺</strong>命中，敌军阵脚被打乱。', 'good');
  }

  function tacticAttack() {
    const p = state.player;
    const enemy = targetEnemy();
    if (!enemy) return;
    p.firstAction = false;
    p.cooldowns.tactic = Math.max(2, 4 - p.tacticCooldownReduction);
    p.supplies = Math.max(0, p.supplies - 4);
    const result = calculatePlayerDamage(enemy, .62, { critBonus: .04 });
    dealDamageToEnemy(enemy, result.damage, result.critical, '战术穿插');
    if (!enemy.dead) {
      const resist = enemy.boss ? .45 : 0;
      if (state.rng() > resist) {
        enemy.status.stun = 1;
        enemy.intent = { type: 'stunned', label: '陷入迟滞', value: 0 };
        addLog(`${enemy.name} 的下一步行动被迟滞。`, 'good');
      } else {
        addLog(`${enemy.name} 稳住了阵脚，迟滞效果有限。`, 'bad');
      }
    }
  }

  function defend() {
    const p = state.player;
    const squadBonus = p.squadId === 'engineer' ? .2 : 0;
    p.guard = Math.min(.85, .56 + squadBonus);
    p.morale = Math.min(100, p.morale + (p.squadId === 'engineer' ? 8 : 5));
    spawnParticles(playerCenterX(), 320, '#d9b762', 18);
    playSound('guard');
    addLog('队伍稳住阵脚，接下来能挡下更多伤害。', 'good');
  }

  function supplyAction() {
    const p = state.player;
    const cost = Math.max(5, 12 - p.supplyCostReduction);
    if (p.supplies < cost) {
      showToast('补给不足，无法紧急补给。');
      return null;
    }
    p.supplies -= cost;
    const medicBonus = p.squadId === 'medic' ? 1.5 : 1;
    healPlayer((20 + p.healBonus) * medicBonus, '紧急补给');
    p.morale = Math.min(100, p.morale + 2);
    const free = p.squadId === 'medic' && p.firstSupply;
    p.firstSupply = false;
    return { free };
  }

  function clearPlayerWindow() {
    const combat = state.combat;
    if (!combat) return;
    clearTimeout(combat.playerTimer);
    clearTimeout(combat.warnTimer);
    combat.playerTimer = 0;
    combat.warnTimer = 0;
    dom.controlBar.classList.remove('danger');
  }

  function armPlayerWindow() {
    const combat = state.combat;
    if (!combat || combat.finished || state.screen !== 'battle') return;
    clearPlayerWindow();
    combat.phase = 'player';
    combat.busy = false;
    setActionState();
  }
  function cancelPlayerRecovery() {
    const combat = state.combat;
    const player = state.player;
    const attack = scene.playerAttack;
    if (!combat || !attack || attack.cancelled || !attack.resolved) return false;
    const elapsed = performance.now() - attack.start;
    if (elapsed < (attack.cancelAt || attack.windup + attack.active)) return false;
    attack.cancelled = true;
    clearTimeout(attack.finishTimer);
    const finishedStage = attack.comboStage || 0;
    if (attack.counterKind) {
      const chain = PLAYER_COUNTER_PROFILES[attack.counterKind] || [];
      if ((attack.counterStep || 0) < chain.length) {
        combat.counterKind = attack.counterKind;
        combat.counterStep = attack.counterStep;
        combat.counterExpiresAt = performance.now() + 560 + (attack.counterKind === 'dodge' ? (player.dodgeCounterWindowBonus || 0) : (player.guardCounterWindowBonus || 0));
      } else {
        combat.counterKind = null;
        combat.counterStep = 0;
        combat.counterExpiresAt = 0;
      }
      combat.comboStage = 0;
      combat.comboExpiresAt = 0;
    } else if (finishedStage > 0 && finishedStage < ((player.comboMax || 5) - 1)) {
      combat.comboStage = finishedStage;
      combat.comboExpiresAt = performance.now() + 520 + (player.comboWindowBonus || 0);
    } else {
      combat.comboStage = 0;
      combat.comboExpiresAt = 0;
    }
    scene.playerAttack = null;
    scene.lunge = 0;
    combat.busy = false;
    combat.phase = 'player';
    combat.queuedAttack = null;
    combat.queuedDodge = false;
    return true;
  }

  function startAttackHold(event) {
    const combat = state.combat;
    if (!combat || combat.finished || state.screen !== 'battle' || combat.holding || combat.blockHeld) return;
    if (event.button === 0 && combat.counterWindowUntil > performance.now() && !combat.busy) {
      if (state.player.postureBroken || state.player.hitstunUntil > performance.now()) {
        combat.queuedAttack = 'normal';
        setText(dom.controlHint, '守反已蓄势 · 稳住身形后立刻出刀');
        return;
      }
      combat.counterWindowUntil = 0;
      beginPlayerAttack('normal', 'guard');
      return;
    }
    if (state.player.postureBroken || state.player.hitstunUntil > performance.now()) return;
    if (combat.dodge) {
      if (event.button === 0) {
        combat.queuedAttack = 'normal';
        setText(dom.controlHint, '闪避反击已蓄势 · 落地立刻出刀');
      }
      return;
    }
    if (combat.busy) {
      if (!cancelPlayerRecovery()) {
        if (event.button === 0) {
          combat.queuedAttack = 'normal';
          setText(dom.controlHint, '下一刀已蓄势 · 收招后立刻接上');
        }
        return;
      }
    }
    if (combat.phase !== 'player') return;
    if (event.button === 2) {
      showToast(`敌刃落下时按 ${inputBindingLabel('guard')} 格挡。`);
      return;
    }
    if (event.button !== 0) return;
    combat.holding = true;
    combat.holdStart = performance.now();
    const now = performance.now();
    combat.holdFollowup = combat.counterWindowUntil > now ? 'guard'
      : combat.dodgeCounterUntil > now ? 'dodge'
        : combat.counterKind && now <= (combat.counterExpiresAt || 0) ? combat.counterKind
          : null;
    scene.lunge = 0;
    dom.controlBar.classList.add('charging');
    dom.controlHint.textContent = '蓄力中…松开左键发动突刺';
    const tick = (now) => {
      if (!combat.holding) return;
      const charge = clamp((now - combat.holdStart) / 700, 0, 1);
      dom.chargeMeter.style.width = `${charge * 100}%`;
      setText(dom.controlHint, charge > .5 ? '蓄力完成：松开左键发动突刺' : '继续按住左键蓄力…');
      combat.holdFrame = requestAnimationFrame(tick);
    };
    combat.holdFrame = requestAnimationFrame(tick);
  }

  function releaseAttackHold() {
    const combat = state.combat;
    if (!combat || !combat.holding) return;
    const held = performance.now() - combat.holdStart;
    const followup = held < 350 ? combat.holdFollowup : null;
    combat.holdFollowup = null;
    combat.holding = false;
    cancelAnimationFrame(combat.holdFrame);
    dom.chargeMeter.style.width = '0%';
    dom.controlBar.classList.remove('charging');
    beginPlayerAttack(held >= 350 ? 'thrust' : 'normal', followup);
  }

  function fireRifle() {
    beginPlayerAttack('shoot');
  }

  function fireRifleDamage() {
    const enemy = targetEnemy();
    if (!enemy) return;
    const distance = currentEnemyDistance();
    const enemyPos = enemyCanvasPosition(state.combat.enemies.indexOf(enemy));
    const muzzleX = playerCenterX() + 62;
    const result = calculatePlayerDamage(enemy, (distance > MELEE_RANGE ? .72 : .9) * (1 + (state.player.rangedBonus || 0)), { critBonus: .03 });
    spawnProjectile(muzzleX, 300, enemyPos.x - 35, 302, '#ffe08a', { life: .16, width: 3 });
    spawnParticles(muzzleX + 6, 300, '#ffd36a', 14);
    scene.shake = Math.max(scene.shake, 4);
    playSound('rifle');
    dealDamageToEnemy(enemy, result.damage, result.critical, '步枪射击');
    addLog(`<strong>步枪射击</strong>命中 ${enemy.name}。`, 'good');
  }

  function directionalTechniqueForPlayer(player) {
    if (!player || !Array.isArray(player.techniques)) return null;
    const horizontal = movementInput.left || movementInput.right || controllerInput.left || controllerInput.right;
    const forward = movementInput.up || controllerInput.up;
    const backward = movementInput.down || controllerInput.down;
    if (horizontal && forward && player.techniques.includes('crosscut')) return 'crosscut';
    if (horizontal && player.techniques.includes('whirlwind')) return 'whirlwind';
    if (forward && player.techniques.includes('breach')) return 'breach';
    if (backward && player.techniques.includes('backcut')) return 'backcut';
    return null;
  }

  function techniqueAttack() {
    const attack = scene.playerAttack;
    const tech = PLAYER_TECHNIQUES[attack?.techniqueId];
    const p = state.player;
    const enemy = targetEnemy();
    if (!tech || !enemy) return;
    p.firstAction = false;
    state.stats.techniques = (state.stats.techniques || 0) + 1;
    const damageMultiplier = tech.damage * (1 + (p.techniqueDamageBonus || 0));
    const postureMultiplier = tech.posture * (1 + (p.techniquePostureBonus || 0));
    const result = calculatePlayerDamage(enemy, damageMultiplier, { critBonus: .035 });
    dealDamageToEnemy(enemy, result.damage, result.critical, tech.name, { postureMultiplier });
    spawnFloat(playerCenterX() + 72, 238, tech.name, '#ffd88a');
    addLog(`<strong>变招·${tech.name}</strong>切入敌阵，${tech.hits > 1 ? '刀势仍在继续。' : '敌将阵脚被重重压住。'}`, 'good');
    if (tech.hits > 1) {
      setTimeout(() => {
        if (!state.combat || state.combat.finished || attack.cancelled || enemy.dead || enemy.status.broken) return;
        const followup = calculatePlayerDamage(enemy, tech.secondDamage * (1 + (p.techniqueDamageBonus || 0)), { critBonus: .02 });
        dealDamageToEnemy(enemy, followup.damage, followup.critical, `${tech.name}·回锋`, { postureMultiplier: tech.secondPosture * (1 + (p.techniquePostureBonus || 0)) });
        const pos = enemyCanvasPosition(state.combat.enemies.indexOf(enemy));
        scene.slashes.push({ x: pos.x, y: pos.y - 65, life: .18, maxLife: .18, radius: 66, angle: -.7, shards: 8 });
      }, tech.secondDelay || 120);
    }
  }

  function beginPlayerAttack(actionType = 'normal', followup = null) {
    const combat = state.combat;
    const p = state.player;
    if (!combat || combat.finished || state.screen !== 'battle' || p.postureBroken || p.hitstunUntil > performance.now() || combat.blockHeld || combat.dodge) return;
    if (combat.busy) {
      if (!cancelPlayerRecovery()) {
        combat.queuedAttack = actionType;
        setText(dom.controlHint, '下一式已蓄势 · 收招后立刻接上');
        return;
      }
    }
    if (combat.phase !== 'player') return;
    if (combat.enemies.every((enemy) => enemy.dead)) {
      finishVictory();
      return;
    }
    const target = targetEnemy();
    const executionDistance = currentEnemyDistance();
    if (target?.status.broken) {
      if (actionType === 'shoot') {
        if (combat.ammo <= 0) {
          showToast('弹药耗尽，无法进行远程处决。');
          return;
        }
        combat.ammo -= 1;
        updateMetaBars();
        startExecutionCinematic(target, 'ranged');
        return;
      }
      if (actionType === 'normal' || actionType === 'thrust') {
        if (executionDistance > MELEE_RANGE + 45) {
          showToast('距离过远：靠近后左键近战处决，或按 R 远程爆头。');
          return;
        }
        startExecutionCinematic(target, 'melee');
        return;
      }
    }
    if (actionType === 'thrust' && p.supplies < 3) {
      actionType = target?.status.broken ? 'execute' : 'normal';
      if (actionType !== 'execute') showToast('补给不足，这一击只能改为普通攻击。');
    }
    const now = performance.now();
    let comboStage = 0;
    let counterKind = followup || null;
    let counterStep = 0;
    let counterProfile = null;
    let techniqueId = null;
    if (actionType === 'normal') {
      if (counterKind) {
        const chain = PLAYER_COUNTER_PROFILES[counterKind] || [];
        const continuing = combat.counterKind === counterKind && now <= (combat.counterExpiresAt || 0);
        counterStep = continuing ? Math.min(chain.length, (combat.counterStep || 0) + 1) : 1;
        counterProfile = chain[counterStep - 1] || null;
      } else {
        counterKind = null;
        const canChain = combat.comboStage > 0 && now <= (combat.comboExpiresAt || 0);
        if (canChain && combat.comboStage >= 2) techniqueId = directionalTechniqueForPlayer(p);
        if (techniqueId) actionType = 'technique';
        else comboStage = canChain ? (combat.comboStage % 5) + 1 : 1;
      }
    }
    const techniqueProfile = techniqueId ? PLAYER_TECHNIQUES[techniqueId] : null;
    const comboProfile = comboStage ? PLAYER_COMBO_PROFILES[comboStage] : null;
    const attackProfile = counterProfile || techniqueProfile || comboProfile;
    const aerial = actionType === 'normal' && (combat.jumpHeight || 0) > 18;
    const distance = currentEnemyDistance();
    const followupRange = counterKind === 'dodge' ? MELEE_RANGE + 330 : counterKind === 'guard' ? MELEE_RANGE + 210 : techniqueId === 'breach' || techniqueId === 'crosscut' ? MELEE_RANGE + 65 : MELEE_RANGE;
    const executeRange = MELEE_RANGE + 45;
    if (((actionType === 'normal' || actionType === 'technique') && distance > followupRange) || (actionType === 'execute' && distance > executeRange)) {
      showToast(actionType === 'execute' ? '距离过远：继续靠近后左键处决。' : '距离过远：按住 D 靠近，或按 R 射击。');
      return;
    }
    if (actionType === 'thrust' && distance > THRUST_RANGE) {
      showToast('突刺距离不足：按住 D 缩短距离。');
      return;
    }
    if (actionType === 'shoot' && combat.ammo <= 0) {
      showToast('弹药耗尽。');
      return;
    }
    clearPlayerWindow();
    if (actionType === 'thrust') p.supplies = Math.max(0, p.supplies - 3);
    if (actionType === 'shoot') combat.ammo -= 1;
    const windup = aerial ? 92 : attackProfile ? attackProfile.windup : actionType === 'execute' ? 285 : actionType === 'thrust' ? 315 : actionType === 'shoot' ? 140 : 115;
    const active = aerial ? 82 : attackProfile ? attackProfile.active : actionType === 'execute' ? 160 : actionType === 'thrust' ? 145 : actionType === 'shoot' ? 72 : 90;
    const recovery = aerial ? 170 : attackProfile ? attackProfile.recovery : actionType === 'execute' ? 290 : actionType === 'thrust' ? 300 : actionType === 'shoot' ? 210 : 245;
    const total = windup + active + recovery;
    const cancelAt = windup + active + recovery * (attackProfile ? attackProfile.cancelRatio : .35);
    combat.busy = true;
    combat.phase = 'attack';
    combat.moveVelocity = 0;
    combat.comboStage = comboStage;
    combat.comboExpiresAt = 0;
    if (counterKind && counterProfile) {
      combat.counterKind = counterKind;
      combat.counterStep = counterStep;
      combat.counterExpiresAt = 0;
      combat.counterWindowUntil = 0;
      combat.dodgeCounterUntil = 0;
    } else {
      combat.counterKind = null;
      combat.counterStep = 0;
      combat.counterExpiresAt = 0;
    }
    if (!comboStage) {
      combat.comboStage = 0;
      combat.comboExpiresAt = 0;
    }
    const attack = { type: actionType, followup, comboStage, techniqueId, counterKind, counterStep, aerial, start: now, windup, active, recovery, total, cancelAt, resolved: false, cancelled: false, impactTimer: 0, finishTimer: 0 };
    scene.playerAttack = attack;
    dom.controlHint.textContent = actionType === 'execute' ? '处决！' : actionType === 'thrust' ? '突刺蓄势…' : actionType === 'shoot' ? '举枪瞄准…' : techniqueProfile ? `${techniqueProfile.name} · ${techniqueProfile.input}` : counterProfile ? `${counterProfile.name} · 第 ${counterStep} 刀` : `${comboProfile?.name || '突击'} · 第 ${comboStage} 式`;
    if (comboStage) showComboStage(comboStage);
    else if (techniqueProfile) {
      clearTimeout(showComboStage.timer);
      dom.comboReadout.classList.remove('hidden', 'finisher');
      dom.comboReadout.classList.add('technique');
      dom.comboStageLabel.textContent = techniqueProfile.short;
      const label = dom.comboReadout.querySelector('b'); if (label) label.textContent = '变招';
      dom.comboStageCount.textContent = techniqueProfile.input;
      showComboStage.timer = setTimeout(() => dom.comboReadout.classList.add('hidden'), 900);
    } else if (counterProfile) showCounterStage(counterKind, counterStep, PLAYER_COUNTER_PROFILES[counterKind].length);
    setActionState();
    updateMetaBars();

    attack.impactTimer = setTimeout(() => {
      if (attack.cancelled || !state.combat || state.combat !== combat || state.screen !== 'battle') return;
      attack.resolved = true;
      scene.lunge = actionType === 'thrust' ? 1.5 : actionType === 'execute' ? 1.7 : actionType === 'shoot' ? .15 : attackProfile ? attackProfile.lunge / 52 : 1;
      if (attack.counterKind === 'dodge' && attack.counterStep === 1) {
        const enemyPos = enemyCanvasPosition(combat.enemies.indexOf(targetEnemy()));
        combat.playerX = clamp(enemyPos.x - MELEE_RANGE * .72, PLAYER_MIN_X, PLAYER_MAX_X);
      }
      playSound('swing');
      if (actionType === 'execute') executeBrokenEnemy();
      else if (actionType === 'thrust') chargeAttack();
      else if (actionType === 'shoot') fireRifleDamage();
      else if (actionType === 'technique') techniqueAttack();
      else basicAttack();
      updateMetaBars();
      renderEnemyCards();
    }, windup + active * .45);

    attack.finishTimer = setTimeout(() => {
      if (attack.cancelled) return;
      if (scene.playerAttack === attack) scene.playerAttack = null;
      scene.lunge = 0;
      if (!state.combat || state.combat !== combat) return;
      combat.busy = false;
      combat.phase = 'player';
      const allDead = combat.enemies.every((enemy) => enemy.dead);
      if (allDead) {
        finishVictory();
        return;
      }
      const finishedStage = attack.comboStage || 0;
      if (attack.counterKind) {
        const chain = PLAYER_COUNTER_PROFILES[attack.counterKind] || [];
        if ((attack.counterStep || 0) < chain.length) {
          combat.counterKind = attack.counterKind;
          combat.counterStep = attack.counterStep;
          combat.counterExpiresAt = performance.now() + 560 + (attack.counterKind === 'dodge' ? (p.dodgeCounterWindowBonus || 0) : (p.guardCounterWindowBonus || 0));
        } else {
          combat.counterKind = null;
          combat.counterStep = 0;
          combat.counterExpiresAt = 0;
          combat.counterWindowUntil = 0;
          combat.dodgeCounterUntil = 0;
        }
        combat.comboStage = 0;
        combat.comboExpiresAt = 0;
      } else if (finishedStage > 0 && finishedStage < (p.comboMax || 5)) {
        combat.comboStage = finishedStage;
        combat.comboExpiresAt = performance.now() + 520 + (p.comboWindowBonus || 0);
        if (finishedStage === 4) {
          combat.busy = true;
          combat.phase = 'attack';
          combat.queuedAttack = null;
          combat.queuedDodge = false;
          setText(dom.controlHint, '五式·断岳 · 顺势衔接');
          setTimeout(() => {
            if (!state.combat || state.combat !== combat || combat.finished) return;
            combat.busy = false;
            combat.phase = 'player';
            if (state.player.postureBroken || state.player.hitstunUntil > performance.now()) {
              setActionState();
              return;
            }
            beginPlayerAttack('normal');
          }, 38);
          setActionState();
          return;
        }
      } else {
        combat.comboStage = 0;
        combat.comboExpiresAt = 0;
      }
      const queuedDodge = combat.queuedDodge;
      const queuedAttack = combat.queuedAttack;
      combat.queuedDodge = false;
      combat.queuedAttack = null;
      if (queuedDodge) {
        performDodge();
        return;
      }
      if (queuedAttack) {
        beginPlayerAttack(queuedAttack, attack.counterKind ? attack.counterKind : followup);
        return;
      }
      setActionState();
    }, total);
  }

  let parrySession = null;
  let shotSession = null;

  function resetParryButton() {
    dom.parryButton.innerHTML = `<span>${inputBindingLabel('guard')}</span> 弹反 / 格挡`;
    dom.parryButton.classList.remove('hidden');
    dom.dodgeButton.classList.add('hidden');
  }

  function triggerTimingCue() {
    dom.parryResult.textContent = '✦ 金光一闪 · 准备弹反';
    dom.parryOverlay.classList.add('cue');
    scene.goldFlash = Math.max(scene.goldFlash, .13);
    playSound('timing');
    setTimeout(() => dom.parryOverlay.classList.remove('cue'), 190);
  }

  function makeTrainingTimeWarp(baseDuration, startP = .46) {
    return { startP, endP: .78, factor: 4.4, baseDuration };
  }

  function timeWarpDuration(warp) {
    return warp.baseDuration * (1 + (warp.endP - warp.startP) * (warp.factor - 1));
  }

  function warpProgressAt(warp, elapsed) {
    const base = warp.baseDuration;
    const startElapsed = base * warp.startP;
    const slowElapsed = base * (warp.endP - warp.startP) * warp.factor;
    if (elapsed <= startElapsed) return clamp(elapsed / Math.max(1, startElapsed) * warp.startP, 0, warp.startP);
    if (elapsed <= startElapsed + slowElapsed) {
      return warp.startP + clamp((elapsed - startElapsed) / Math.max(1, slowElapsed), 0, 1) * (warp.endP - warp.startP);
    }
    return warp.endP + clamp((elapsed - startElapsed - slowElapsed) / Math.max(1, base * (1 - warp.endP)), 0, 1) * (1 - warp.endP);
  }

  function warpElapsedForProgress(warp, progress) {
    const base = warp.baseDuration;
    if (progress <= warp.startP) return base * warp.startP * (progress / warp.startP);
    if (progress <= warp.endP) return base * warp.startP + base * (warp.endP - warp.startP) * warp.factor * ((progress - warp.startP) / (warp.endP - warp.startP));
    return base * warp.startP + base * (warp.endP - warp.startP) * warp.factor + base * (1 - warp.endP) * ((progress - warp.endP) / (1 - warp.endP));
  }

  function parryProgressAt(session, now) {
    if (!session) return 0;
    const elapsed = Math.max(0, now - session.start);
    return session.timeWarp ? warpProgressAt(session.timeWarp, elapsed) : clamp(elapsed / session.duration, 0, 1);
  }

  function shotProgressAt(session, now) {
    if (!session) return 0;
    const elapsed = Math.max(0, now - session.start);
    return session.timeWarp ? warpProgressAt(session.timeWarp, elapsed) : clamp(elapsed / session.duration, 0, 1);
  }

  function promptParry(enemy, options = {}) {
    return new Promise((resolve) => {
      const intent = options.intent || enemy.intent || { type: 'attack' };
      const thrust = intent.type === 'thrust';
      const eliteMove = intent.type === 'eliteMove';
      const customCombo = intent.type === 'whirlwind' || intent.type === 'slowFast';
      const sequenceLabel = options.sequenceLabel || (intent.type === 'whirlwind' ? '旋风斩' : intent.type === 'slowFast' ? '快慢双刀' : '');
      const comboStep = options.comboStep || (intent.type === 'combo' ? (options.followup ? 2 : 1) : customCombo ? 1 : 0);
      const comboTotal = options.comboTotal || (intent.type === 'combo' ? 2 : customCombo ? 2 : 0);
      const quick = intent.type === 'quick' || options.quick === true || options.followup === true;
      const narrow = intent.type === 'heavy' || intent.type === 'siege' || thrust || eliteMove || intent.type === 'slowFast' || options.narrow === true;
      const baseDuration = options.duration || (narrow ? (thrust ? 930 : 980) : comboStep === 1 ? 960 : options.followup ? 760 : quick ? 720 : 920);
      const normalPerfectStart = options.perfectStart ?? (narrow ? (thrust ? .565 : .575) : quick ? .58 : .565);
      const perfectEnd = options.perfectEnd ?? (narrow ? (thrust ? .64 : .65) : quick ? .655 : .65);
      const blockStart = options.blockStart ?? (narrow ? (thrust ? .515 : .525) : quick ? .535 : .515);
      const blockEnd = options.blockEnd ?? (narrow ? (thrust ? .72 : .73) : quick ? .74 : .73);
      const trainingStartP = Math.max(.32, normalPerfectStart - .11);
      const timeWarp = options.trainingSlow ? makeTrainingTimeWarp(baseDuration, trainingStartP) : null;
      const perfectStart = timeWarp ? trainingStartP : normalPerfectStart;
      const duration = timeWarp ? timeWarpDuration(timeWarp) : baseDuration;
      const cueLeadMs = options.cueLeadMs ?? (quick ? 110 : 125);
      const cueAt = timeWarp ? timeWarp.startP : Math.max(.08, perfectStart - cueLeadMs / duration);
      const start = performance.now();
      const enemyIndex = state.combat.enemies.indexOf(enemy);
      scene.duel = {
        active: true, resolved: false, enemyIndex, start, duration, progress: 0,
        perfectStart, perfectEnd, blockStart, blockEnd, cueAt, cueUntil: 0,
        grade: null, narrow, quick, thrust, eliteMove, comboStep, comboTotal,
        sequenceLabel, style: options.style || intent.type, title: options.title || ''
      };
      const trainingPrompt = !!state.training?.active;
      dom.parryOverlay.className = `parry-overlay${narrow ? ' narrow' : ''}${quick ? ' quick' : ''}${comboStep ? ' combo' : ''}${thrust ? ' thrust' : ''}${eliteMove ? ' elite' : ''}${trainingPrompt ? '' : ' minimal-cue'}`;
      resetParryButton();
      setTimeout(() => dom.parryButton.focus({ preventScroll: true }), 0);
      dom.parryOverlay.classList.remove('hidden');
      const defaultTitle = comboStep
        ? `${sequenceLabel || '连斩'} · 第 ${comboStep} 刀`
        : eliteMove
          ? intent.label.replace(' · 专属', '')
          : thrust
            ? '枪刃突刺！'
            : narrow
              ? '重击！看准武器落下'
              : quick
                ? '快斩！盯住刀锋'
                : '看准敌军出手，再格挡';
      const defaultHint = customCombo
        ? `每一刀都要分开看；先看刀锋，再逐刀按 ${inputBindingLabel('guard')}，不要连续乱按`
        : comboStep
          ? '普通格挡或失守后会继续追刀；完美弹反可抢回节奏'
          : thrust
            ? `金光后按 ${inputBindingLabel('guard')} 弹反；按 ${inputBindingLabel('dodge')} 定向闪避可识破`
            : narrow
              ? `抬刀蓄势时不要按，刀锋真正下落时按 ${inputBindingLabel('guard')} 格挡`
              : quick
                ? `敌人抬手后会极快落下，看到刀锋前压立即按 ${inputBindingLabel('guard')}`
                : `观察手臂和武器，在武器即将触及队伍时按 ${inputBindingLabel('guard')} 或点击下方按钮格挡`;
      dom.parryKicker.textContent = trainingPrompt ? (options.kicker || (comboStep ? `${sequenceLabel || '连斩'} · 第 ${comboStep} 刀` : eliteMove ? '精英绝技' : thrust ? '枪刃突刺' : narrow ? '重击将至' : '敌将出招')) : '';
      dom.parryTitle.textContent = trainingPrompt ? (options.title || defaultTitle) : (thrust ? '识破' : '');
      dom.parryHint.textContent = trainingPrompt ? (options.hint || defaultHint) : '';
      dom.parryResult.textContent = trainingPrompt ? (state.combat.blockHeld ? `防御中 · 金光一闪后点按 ${inputBindingLabel('guard')}` : '等待金光提示') : '';
      const trainingDodgeStep = state.training?.active && state.training.step === 3;
      if (thrust || trainingDodgeStep) dom.dodgeButton.classList.remove('hidden');
      if (trainingDodgeStep) dom.parryButton.classList.add('hidden');
      playSound('swing');
      parrySession = {
        active: true, resolved: false, start, duration, baseDuration, timeWarp, perfectStart, perfectEnd,
        blockStart, blockEnd, cueAt, eliteMove, enemy, resolve, frame: 0, comboStep, comboTotal,
        sequenceLabel, style: options.style || intent.type,
        impactFx: false, cueTriggered: false, resolveDelay: options.resolveDelay ?? null, watchdog: 0
      };
      parrySession.watchdog = pauseAwareDelay(() => {
        if (parrySession?.active && !parrySession.resolved) {
          dom.parryResult.textContent = '这一击已过 · 重新看招';
          finishParry('miss');
        }
      }, Math.ceil(duration) + 2200);
      const tick = (now) => {
        if (!parrySession || !parrySession.active) return;
        if (state.pauseOpen) {
          parrySession.frame = requestAnimationFrame(tick);
          return;
        }
        const progress = parryProgressAt(parrySession, now);
        if (scene.duel) scene.duel.progress = progress;
        if (!parrySession.cueTriggered && progress >= parrySession.cueAt) {
          parrySession.cueTriggered = true;
          if (scene.duel) scene.duel.cueUntil = performance.now() + 170;
          triggerTimingCue();
          if (parrySession.timeWarp) {
            const trainingStep = state.training?.step;
            let cueKey = inputBindingLabel('guard');
            let cueText = `点按 ${inputBindingLabel('guard')} 完美格挡；不要提前连按。`;
            if (trainingStep === 3) {
              cueKey = inputBindingLabel('dodge');
              cueText = `现在按 ${inputBindingLabel('dodge')} 闪避；落地后立刻按 ${inputBindingLabel('attack')} 反击。`;
            } else if (trainingStep === 4 || thrust) {
              cueKey = inputBindingLabel('dodge');
              cueText = `现在按 ${inputBindingLabel('dodge')} 闪避识破；也可按 ${inputBindingLabel('guard')} 完美格挡。`;
            }
            showTrainingCue(cueKey, '金光亮起 · 现在出手', cueText, 2300);
          }
        }
        if (!parrySession.impactFx && progress >= .5) {
          parrySession.impactFx = true;
          scene.shake = Math.max(scene.shake, comboStep === 2 ? 11 : 7);
          spawnParticles(playerCenterX() + 76, 315, comboStep === 2 ? '#ff8b65' : '#d9b36d', comboStep === 2 ? 24 : 14);
        }
        if (progress >= parrySession.blockEnd && state.combat?.blockHeld) {
          finishParry('block');
          return;
        }
        if (progress >= 1) {
          finishParry('miss');
          return;
        }
        parrySession.frame = requestAnimationFrame(tick);
      };
      parrySession.frame = requestAnimationFrame(tick);
    });
  }

  function promptEnemyShot(enemy, options = {}) {
    return new Promise((resolve) => {
      const combat = state.combat;
      const enemyIndex = combat.enemies.indexOf(enemy);
      const aimX = combat.playerX;
      const baseDuration = options.duration || 1180;
      const normalPerfectStart = options.perfectStart ?? .625;
      const trainingStartP = Math.max(.32, normalPerfectStart - .11);
      const timeWarp = options.trainingSlow ? makeTrainingTimeWarp(baseDuration, trainingStartP) : null;
      const perfectStart = timeWarp ? trainingStartP : normalPerfectStart;
      const duration = timeWarp ? timeWarpDuration(timeWarp) : baseDuration;
      const start = performance.now();
      scene.shotAim = { enemyIndex, start, duration, baseDuration, timeWarp, aimX, fired: false, parried: false };
      const trainingPrompt = !!state.training?.active;
      dom.parryOverlay.className = `parry-overlay shot${trainingPrompt ? '' : ' minimal-cue'}`;
      dom.parryTitle.textContent = trainingPrompt ? (options.title || '枪线锁定！') : '';
      dom.parryHint.textContent = trainingPrompt ? (options.hint || `${formatKeyCode(keyBinding('moveLeft'))}/${formatKeyCode(keyBinding('moveRight'))} 或左摇杆横移躲枪线；枪响前点按 ${inputBindingLabel('guard')} 弹开子弹，按住只能护住要害`) : '';
      dom.parryResult.textContent = trainingPrompt ? `等待金光 · 闪光后点按 ${inputBindingLabel('guard')} 弹反` : '';
      dom.parryButton.innerHTML = '<span>F</span> 弹反子弹';
      dom.dodgeButton.classList.remove('hidden');
      dom.parryOverlay.classList.remove('hidden');
      playSound('swing');
      audioTone(760, .16, 'triangle', .025);
      const cueAt = timeWarp ? timeWarp.startP : perfectStart - 105 / duration;
      shotSession = {
        active: true, resolved: false, combat, enemy, enemyIndex, aimX,
        start, duration, baseDuration, timeWarp, normalStart: options.normalStart ?? .55, perfectStart, perfectEnd: options.perfectEnd ?? .675, normalEnd: options.normalEnd ?? .73,
        grade: null, resolve, timer: 0, cueTimer: 0
      };
      shotSession.cueTimer = pauseAwareDelay(() => {
        if (!shotSession?.active || shotSession.resolved) return;
        if (scene.shotAim) scene.shotAim.cueUntil = performance.now() + 170;
        triggerTimingCue();
        if (timeWarp) showTrainingCue(inputBindingLabel('dodge'), '枪火一闪 · 现在闪开', `按 ${inputBindingLabel('dodge')} 横向闪避；也可点按 ${inputBindingLabel('guard')} 弹开子弹。`, 2300);
      }, timeWarp ? warpElapsedForProgress(timeWarp, cueAt) : duration * cueAt);
      shotSession.timer = pauseAwareDelay(() => fireEnemyShot(), duration);
    });
  }

  function attemptShotDefense(source = 'key') {
    if (!shotSession || !shotSession.active || shotSession.resolved) return;
    const progress = shotProgressAt(shotSession, performance.now());
    if (progress > shotSession.normalEnd) {
      if (source === 'key') state.combat.blockHeld = true;
      dom.parryResult.textContent = '出手偏晚 · 只能护住要害';
      return;
    }
    if (progress >= shotSession.perfectStart && progress <= shotSession.perfectEnd) {
      shotSession.grade = 'perfect';
      if (scene.shotAim) scene.shotAim.parried = true;
      dom.parryResult.textContent = '完美弹反 · 子弹将反震敌军';
      scene.goldFlash = Math.max(scene.goldFlash, .52);
      scene.perfectFlash = Math.max(scene.perfectFlash, .9);
      scene.shake = Math.max(scene.shake, 14);
      playSound('parry');
      return;
    }
    if (progress < shotSession.normalStart) {
      if (source === 'key') {
        state.combat.blockHeld = true;
        state.combat.blockHeldAt = performance.now();
      }
      dom.parryResult.textContent = `举枪防御 · 枪响时点按 ${inputBindingLabel('guard')} 才能弹开`;
      playSound('guard');
      return;
    }
    const grade = 'block';
    shotSession.grade = grade;
    if (scene.shotAim) scene.shotAim.parried = true;
    dom.parryResult.textContent = grade === 'perfect' ? '完美弹反 · 子弹将反震敌军' : '普通弹反 · 子弹被枪身架开';
    if (grade === 'perfect') {
      scene.goldFlash = Math.max(scene.goldFlash, .52);
      scene.perfectFlash = Math.max(scene.perfectFlash, .9);
      scene.shake = Math.max(scene.shake, 14);
      playSound('parry');
    } else {
      playSound('block');
    }
  }

  function fireEnemyShot() {
    if (!shotSession || !shotSession.active || shotSession.resolved) return;
    const session = shotSession;
    session.active = false;
    const moved = Math.abs(session.combat.playerX - session.aimX);
    const dodged = moved >= 82;
    const parried = !!session.grade;
    const guarding = !!session.combat.blockHeld;
    const enemyPos = enemyCanvasPosition(session.enemyIndex);
    const targetY = 302;
    if (scene.shotAim) scene.shotAim.fired = true;
    spawnProjectile(enemyPos.x - 72, 300, session.aimX, targetY, parried ? '#ffe6a7' : dodged ? '#ffbd83' : '#ff754f', {
      life: .22, hostile: true, width: 3.6
    });
    spawnParticles(enemyPos.x - 72, 300, '#ffd180', 16);
    playSound('enemyRifle');
    if (parried) {
      scene.clash = { x: session.aimX, y: targetY, life: .24, maxLife: .24, power: session.grade === 'perfect' ? 1.15 : .75 };
      spawnParticles(session.aimX, targetY, '#ffe4a1', session.grade === 'perfect' ? 34 : 18);
      spawnFloat(session.aimX, 252, session.grade === 'perfect' ? '完美弹反!' : '弹开!', '#ffe2a0');
      addEnemyPosture(session.enemy, session.grade === 'perfect' ? 22 + Math.round(22 * (state.player?.relicParryPosture || 0)) : 10);
      dom.parryResult.textContent = session.grade === 'perfect' ? '完美弹反！子弹被架开' : '普通弹反！子弹被架开';
      addLog(session.grade === 'perfect' ? '<strong>完美弹反</strong>：子弹被枪身崩开。' : '<strong>普通弹反</strong>：子弹被架向一侧。', 'good');
    } else if (dodged) {
      dom.parryResult.textContent = '横向脱离枪线！';
      spawnFloat(session.aimX, 250, 'MISS', '#c9ddba');
      addLog('队伍横向移动，敌人的枪击落空。', 'good');
    } else {
      dom.parryResult.textContent = guarding ? '防御中弹 · 冲击被卸掉少许' : '枪弹命中！';
    }
    if (state.training?.active && state.training.step === 5 && (parried || dodged)) recordTrainingSuccess(5);
    setTimeout(() => {
      dom.parryOverlay.classList.add('hidden');
      dom.parryOverlay.className = 'parry-overlay hidden';
      resetParryButton();
      scene.shotAim = null;
      if (shotSession === session) shotSession = null;
      session.resolved = true;
      session.resolve({ dodged, parried, grade: session.grade, guarding });
    }, 230);
  }

  function attemptParry(source = 'key') {
    if (state.player.postureBroken) {
      showToast('我方架势崩溃，暂时无法格挡。');
      return;
    }
    if (!parrySession || !parrySession.active || parrySession.resolved) return;
    const progress = parryProgressAt(parrySession, performance.now());
    if (progress > parrySession.blockEnd) {
      if (source === 'key') state.combat.blockHeld = true;
      dom.parryResult.textContent = '出手偏晚 · 只能保持防御';
      finishParry('miss');
      return;
    }
    if (progress >= parrySession.perfectStart && progress <= parrySession.perfectEnd) {
      finishParry('perfect');
      return;
    }
    if (progress < parrySession.blockStart) {
      if (source === 'key') {
        state.combat.blockHeld = true;
        state.combat.blockHeldAt = performance.now();
      }
      dom.parryResult.textContent = `防御姿态 · 等刀锋接触时再点按 ${inputBindingLabel('guard')}`;
      playSound('guard');
      return;
    }
    finishParry('block');
  }

  function finishParry(grade) {
    if (!parrySession || !parrySession.active || parrySession.resolved) return;
    parrySession.resolved = true;
    parrySession.active = false;
    parrySession.grade = grade;
    clearPauseAwareDelay(parrySession.watchdog);
    cancelAnimationFrame(parrySession.frame);
    const enemy = parrySession.enemy;
    const resolve = parrySession.resolve;
    const comboStep = parrySession.comboStep || 0;
    const enemyPos = enemyCanvasPosition(state.combat.enemies.indexOf(enemy));
    const clashX = (playerCenterX() + enemyPos.x - 60) / 2;
    dom.parryOverlay.classList.add(grade);
    if (scene.duel) {
      scene.duel.resolved = true;
      scene.duel.active = false;
      scene.duel.grade = grade;
    }
    if (grade === 'perfect') {
      const nextHitComing = comboStep > 0 && comboStep < parrySession.comboTotal;
      dom.parryResult.textContent = nextHitComing ? '完美弹反！看下一刀' : '完美弹反！架势已震退';
      state.stats.parries += 1; checkAchievements();
      if (state.training?.active && state.training.step === 2) recordTrainingSuccess(2);
      state.player.morale = Math.min(100, state.player.morale + 8);
      state.player.posture = Math.max(0, state.player.posture - 18);
      state.player.firstAction = false;
      enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + (comboStep ? 180 : 520));
      addEnemyPosture(enemy, Math.round((comboStep ? 16 : 26) * (1 + (state.player.relicParryPosture || 0))));
      state.combat.counterWindowUntil = performance.now() + 900 + (state.player.guardCounterWindowBonus || 0);
      state.combat.counterKind = 'guard';
      state.combat.counterStep = 0;
      scene.goldFlash = Math.max(scene.goldFlash, .72);
      scene.perfectFlash = 1;
      scene.shake = Math.max(scene.shake, 24);
      scene.clash = { x: clashX, y: 315, life: .34, maxLife: .34, power: 1.35 };
      spawnParticles(clashX, 315, '#ffe4a1', 58);
      spawnParticles(clashX, 315, '#f04a3f', 24);
      spawnFloat(clashX, 248, '拼刀·震退', '#ffe2a0');
      addLog('<strong>完美格挡</strong>：敌刃被震开，敌将架势大损。趁现在反击！', 'good');
      playSound('parry');
      gamepadRumble(1, .78, 145);
    } else if (grade === 'block') {
      const guardCounterReady = comboStep !== 1;
      if (guardCounterReady) {
        state.combat.counterWindowUntil = performance.now() + 760 + (state.player.guardCounterWindowBonus || 0);
        state.combat.counterKind = 'guard';
        state.combat.counterStep = 0;
        setText(dom.controlHint, '挡势已成 · 左键接守反');
      }
      dom.parryResult.textContent = comboStep === 1 ? '第一刀挡住 · 追刀将至' : '格挡成功 · 左键守反';
      state.player.morale = Math.min(100, state.player.morale + 3);
      enemy.hitstunUntil = Math.max(enemy.hitstunUntil || 0, performance.now() + 120);
      state.player.hitstunUntil = Math.max(state.player.hitstunUntil || 0, performance.now() + 65);
      addPlayerPosture(comboStep === 1 ? 20 : 24, '格挡反震');
      scene.goldFlash = Math.max(scene.goldFlash, .2);
      scene.shake = Math.max(scene.shake, 7);
      scene.clash = { x: clashX, y: 322, life: .18, maxLife: .18, power: .55 };
      spawnParticles(clashX, 322, '#e8c477', 10);
      addLog('格挡成功：队伍用枪身卸开了这一击。', 'good');
      if (state.player.squadId === 'medic' && state.player.firstBlockHeal) {
        healPlayer(8, '卫生员救护');
        state.player.firstBlockHeal = false;
      }
      playSound('block');
      gamepadRumble(.46, .34, 90);
    } else {
      dom.parryResult.textContent = comboStep === 1 ? '第一刀失守 · 追刀将至' : '时机失误 · 正常受击';
      addLog('格挡时机失误，敌军攻击没有被有效卸开。', 'bad');
      playSound('miss');
      gamepadRumble(.52, .28, 100);
    }
    const pause = parrySession.resolveDelay ?? (comboStep === 1 && grade !== 'perfect' ? 285 : grade === 'perfect' ? 225 : 175);
    setTimeout(() => {
      const counterQueued = (grade === 'block' || grade === 'perfect') && comboStep !== 1 && state.combat?.queuedAttack === 'normal';
      dom.parryOverlay.classList.add('hidden');
      dom.parryOverlay.className = 'parry-overlay hidden';
      if (parrySession) parrySession = null;
      scene.duel = null;
      resolve(grade);
      if (counterQueued && state.combat && !state.combat.finished) {
        state.combat.queuedAttack = null;
        setTimeout(() => beginPlayerAttack('normal', 'guard'), 35);
      }
    }, pause);
  }

  function enemyAttack(enemy, parryGrade = null, options = {}) {
    const p = state.player;
    const intent = options.intent || enemy.intent || { type: 'attack', value: enemy.atk };
    if (enemy.dead) return;
    if (!options.directDamage && intent.type === 'charge') {
      enemy.status.charged = true;
      enemy.intent = { type: 'heavy', label: '重击即将落下', value: Math.round(intentDamage(enemy) * 1.75) };
      addLog(`${enemy.name} 正在蓄力，即将发动重击。`, 'bad');
      playSound('enemy');
      return;
    }
    if (!options.directDamage && intent.type === 'guard') {
      enemy.status.armor = 1;
      enemy.armorUntil = performance.now() + 3200;
      addLog(`${enemy.name} 收紧队形，提高了防御。`, '');
      return;
    }
    if (parryGrade === 'perfect' || parryGrade === 'dodged') {
      if (enemy.status.charged) enemy.status.charged = false;
      return;
    }
    if (performance.now() < state.combat.invulnerableUntil) {
      const now = performance.now();
      state.combat.dodgeCounterUntil = now + 900 + (p.dodgeCounterWindowBonus || 0);
      state.combat.counterKind = 'dodge';
      state.combat.counterStep = 0;
      p.posture = Math.max(0, p.posture - 8);
      p.morale = Math.min(100, p.morale + 3);
      spawnFloat(playerCenterX(), 255, '闪避反击!', '#d9e8bb');
      addLog('队伍侧身让过锋刃，抢到了追刀的机会。', 'good');
      return;
    }
    let raw = options.value ?? intent.value ?? intentDamage(enemy);
    if (intent.type === 'siege') {
      raw = Math.round(raw * 1.12);
      p.morale = Math.max(0, p.morale - 6);
    }
    if (enemy.boss && enemy.phase2) raw = Math.round(raw * 1.12);
    if (p.postureBroken) raw = Math.round(raw * 1.85);
    if (parryGrade === 'block') raw = Math.round(raw * (options.blockMultiplier || .32));
    if (state.combat.blockHeld) raw = Math.round(raw * (options.guardMultiplier || .92));
    if (p.guard > 0) raw = Math.round(raw * (1 - p.guard));
    if (p.squadId === 'engineer') raw = Math.max(1, raw - 2);
    if (p.hp / p.maxHp < .35 && p.lowHpDefenseBonus) raw = Math.round(raw * (1 - p.lowHpDefenseBonus));
    raw = Math.max(1, raw);
    p.hp = Math.max(0, p.hp - raw);
    const basePostureHit = intent.type === 'eliteMove' ? 30 : intent.type === 'heavy' ? 32 : intent.type === 'siege' ? 38 : intent.type === 'thrust' ? 27 : intent.type === 'quick' ? 21 : intent.type === 'shot' ? 15 : 23;
    const latePressure = 1 + state.chapter * .055 + state.battleNumber * .012;
    const postureHit = parryGrade === 'block' ? 0 : basePostureHit * (options.postureMultiplier || 1) * latePressure;
    if (postureHit > 0) addPlayerPosture(Math.round(postureHit), options.label || intent.label || '受击');
    const hitStun = parryGrade === 'block' ? 55 : state.combat.blockHeld ? 75 : intent.type === 'heavy' || intent.type === 'siege' ? 250 : 165;
    p.hitstunUntil = Math.max(p.hitstunUntil || 0, performance.now() + hitStun);
    state.combat.comboStage = 0;
    state.combat.comboExpiresAt = 0;
    state.combat.dodgeCounterUntil = 0;
    state.combat.counterWindowUntil = 0;
    state.combat.counterKind = null;
    state.combat.counterStep = 0;
    state.combat.counterExpiresAt = 0;
    if (state.combat.blockHeld && parryGrade !== 'perfect') {
      state.combat.counterWindowUntil = performance.now() + 420 + (p.guardCounterWindowBonus || 0);
      state.combat.counterKind = 'guard';
      state.combat.counterStep = 0;
    }
    if (hitStun >= 120 && !p.postureBroken) showPlayerStateNotice('受击硬直', '身形一晃 · 片刻后便能还手', 'hitstun', hitStun);
    scene.enemyHit[state.combat.enemies.indexOf(enemy)] = .18;
    playerHitFx(raw);
    playSound(intent.type === 'shot' ? 'enemyRifle' : 'enemy');
    const label = options.label || intent.label || '攻击';
    addLog(`<strong>${enemy.name}</strong> 使出${label}，${parryGrade === 'block' ? '刀势被挡下大半，' : state.combat.blockHeld ? '队伍勉强架住，' : p.postureBroken ? '阵脚已乱，' : ''}仍损失 ${raw} 点兵力。`, 'bad');
    setActionState();
    if (enemy.status.charged) enemy.status.charged = false;
    if (!enemy.dead && !enemy.status.broken) enemy.recoveryUntil = Math.max(enemy.recoveryUntil || 0, performance.now() + 240);
  }

  function canContinueEnemySequence(combat, enemy) {
    return state.combat === combat && state.screen === 'battle' && !combat.finished &&
      !enemy.dead && !enemy.status.broken && !(enemy.status.stun > 0) && state.player.hp > 0 && !state.player.postureBroken;
  }

  async function performWhirlwind(combat, enemy) {
    const total = 5;
    const titles = ['旋风斩 · 起刀', '旋风斩 · 回锋', '旋风斩 · 追斩', '旋风斩 · 逆刃', '旋风斩 · 终刀'];
    const durations = [820, 610, 510, 475, 450];
    addLog(`<strong>${enemy.name}</strong> 旋身压上，刀势将连续斩出五刀。`, 'bad');
    renderEnemyCards();
    for (let step = 1; step <= total; step++) {
      if (!canContinueEnemySequence(combat, enemy)) {
        addLog('旋风斩的连续刀势被打断。', 'good');
        return;
      }
      const hitIntent = { type: step === 1 ? 'attack' : 'quick', label: `旋风斩 · 第 ${step} 刀` };
      enemy.action = 'attack';
      enemy.moveTargetX = clamp(combat.playerX + 270, 510, 825);
      if (step > 1) {
        scene.shake = Math.max(scene.shake, 5 + step);
        spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x - 45, 310, step % 2 ? '#f1c977' : '#ff7d61', 12 + step);
      }
      const grade = await promptParry(enemy, {
        intent: hitIntent,
        comboStep: step,
        comboTotal: total,
        sequenceLabel: '旋风斩',
        style: 'whirlwind',
        quick: step > 1,
        narrow: step === 1,
        duration: durations[step - 1],
        perfectStart: step === 1 ? .56 : .57,
        perfectEnd: step === 1 ? .65 : .665,
        blockStart: step === 1 ? .51 : .535,
        blockEnd: step === 1 ? .73 : .745,
        cueLeadMs: step === 1 ? 125 : step === 2 ? 100 : 84,
        resolveDelay: step === total ? 105 : step === 1 ? 75 : 55,
        title: titles[step - 1],
        hint: step === 1
          ? '第一刀之后会停约 0.8 秒；第二刀亮起后，后面三刀会连续追来'
          : `刀光已贴身：逐刀点按 ${inputBindingLabel('guard')}，不要按住连打`,
        kicker: `绝技 · 旋风斩 · 第 ${step} 刀`
      });
      enemyAttack(enemy, grade, {
        intent: hitIntent,
        value: Math.round(intentDamage(enemy) * (step === 5 ? .34 : .3)),
        label: hitIntent.label,
        postureMultiplier: .55,
        blockMultiplier: .42,
        guardMultiplier: .94
      });
      updateMetaBars();
      renderEnemyCards();
      if (!canContinueEnemySequence(combat, enemy)) return;
      if (step === 1) await sleep(800);
      else if (step < total) await sleep(step === 2 ? 145 : step === 3 ? 100 : 82);
    }
    addLog('<strong>旋风斩五刀收势</strong>：最后一道刀光从阵前掠过。', 'bad');
  }

  async function performBlinkSlash(combat, enemy) {
    addLog(`<strong>${enemy.name}</strong> 压低身形，突然化作一道残影切入阵前。`, 'bad');
    enemy.action = 'blink';
    enemy.moveTargetX = clamp(combat.playerX + 242, 505, 825);
    const start = enemyCanvasPosition(combat.enemies.indexOf(enemy));
    spawnParticles(start.x + 24, start.y - 38, '#d9b978', 24);
    playSound('swing');
    await sleep(290);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    const pos = enemyCanvasPosition(combat.enemies.indexOf(enemy));
    scene.shake = Math.max(scene.shake, 9);
    spawnParticles(pos.x - 42, 310, '#ff8c68', 18);
    const hitIntent = { type: 'quick', label: '瞬步一闪' };
    const grade = await promptParry(enemy, {
      intent: hitIntent,
      style: 'blinkSlash',
      quick: true,
      narrow: true,
      duration: 600,
      perfectStart: .59,
      perfectEnd: .665,
      blockStart: .535,
      blockEnd: .74,
      cueLeadMs: 110,
      resolveDelay: 85,
      title: '瞬步一闪！',
      hint: '残影落定后才真正出刀；斜向刀光压到面前时点按 F',
      kicker: '身法绝技 · 快速位移'
    });
    enemyAttack(enemy, grade, {
      intent: hitIntent,
      value: Math.round(intentDamage(enemy) * 1.08),
      label: '瞬步一闪',
      postureMultiplier: 1.12,
      blockMultiplier: .36,
      guardMultiplier: .95
    });
  }

  async function performSlowFast(combat, enemy) {
    addLog(`<strong>${enemy.name}</strong> 先高举武器蓄势，刀尖停了一拍。`, 'bad');
    const firstIntent = { type: 'slowFast', label: '快慢双刀 · 慢刀' };
    const firstGrade = await promptParry(enemy, {
      intent: firstIntent,
      comboStep: 1,
      comboTotal: 2,
      sequenceLabel: '快慢双刀',
      style: 'slowFast',
      narrow: true,
      duration: 980,
      perfectStart: .58,
      perfectEnd: .655,
      blockStart: .525,
      blockEnd: .735,
      cueLeadMs: 140,
      resolveDelay: 78,
      title: '快慢双刀 · 慢刀',
      hint: '这是故意放慢的第一刀；挡完不要松警惕，第二刀会突然加速',
      kicker: '节奏绝技 · 快慢双刀 · 第 1 刀'
    });
    enemyAttack(enemy, firstGrade, {
      intent: firstIntent,
      value: Math.round(intentDamage(enemy) * .55),
      label: firstIntent.label,
      postureMultiplier: .86,
      blockMultiplier: .38
    });
    updateMetaBars();
    renderEnemyCards();
    if (!canContinueEnemySequence(combat, enemy)) return;
    await sleep(firstGrade === 'perfect' ? 150 : 135);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    addLog('<strong>快刀反撩</strong>：慢刀余势未尽，第二刀已经贴近。', 'bad');
    scene.shake = Math.max(scene.shake, 10);
    const secondIntent = { type: 'quick', label: '快慢双刀 · 急斩' };
    const secondGrade = await promptParry(enemy, {
      intent: secondIntent,
      comboStep: 2,
      comboTotal: 2,
      sequenceLabel: '快慢双刀',
      style: 'slowFast',
      quick: true,
      narrow: true,
      duration: 515,
      perfectStart: .585,
      perfectEnd: .66,
      blockStart: .53,
      blockEnd: .745,
      cueLeadMs: 105,
      resolveDelay: 85,
      title: '快慢双刀 · 急斩！',
      hint: '第二刀几乎没有抬手；看到刀锋窜出立刻点按 F',
      kicker: '节奏绝技 · 快慢双刀 · 第 2 刀'
    });
    enemyAttack(enemy, secondGrade, {
      intent: secondIntent,
      value: Math.round(intentDamage(enemy) * .88),
      label: secondIntent.label,
      postureMultiplier: 1.05,
      blockMultiplier: .36,
      guardMultiplier: .95
    });
  }


  async function performRetreatThrust(combat, enemy) {
    const enemyIndex = combat.enemies.indexOf(enemy);
    const pos = enemyCanvasPosition(enemyIndex);
    enemy.action = 'thrustWindup';
    scene.goldFlash = Math.max(scene.goldFlash, .16);
    spawnFloat(pos.x, pos.y - 132, '后撤蓄枪', '#ffcf73');
    spawnParticles(pos.x + 8, pos.y - 42, '#e6ba62', 18);
    addLog(`<strong>${enemy.name}</strong> 连续后撤，压低枪身蓄出一记贯穿突刺。`, 'bad');
    await sleep(520);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'dash';
    enemy.moveTargetX = clamp(combat.playerX + 238, 455, 760);
    playSound('swing');
    await sleep(410);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    const hitIntent = { type: 'thrust', label: '后撤贯阵突刺' };
    const grade = await promptParry(enemy, {
      intent: hitIntent,
      style: 'retreatThrust',
      thrust: true,
      narrow: true,
      duration: 1120,
      perfectStart: .565,
      perfectEnd: .645,
      blockStart: .52,
      blockEnd: .725,
      cueLeadMs: 135,
      resolveDelay: 92,
      title: '后撤蓄枪 · 贯阵突刺！',
      hint: '先看清明显后撤和枪尖拖地；枪身再次压平时可弹反，闪光后闪避可识破',
      kicker: '位移绝技 · 远近转换'
    });
    enemyAttack(enemy, grade, {
      intent: hitIntent,
      value: Math.round(intentDamage(enemy) * .88),
      label: hitIntent.label,
      postureMultiplier: 1.2,
      blockMultiplier: .36,
      guardMultiplier: .94
    });
  }

  async function performBackstepShot(combat, enemy) {
    const enemyIndex = combat.enemies.indexOf(enemy);
    const pos = enemyCanvasPosition(enemyIndex);
    enemy.action = 'aimWindup';
    scene.goldFlash = Math.max(scene.goldFlash, .18);
    spawnFloat(pos.x, pos.y - 132, '后撤抬枪', '#ffd27d');
    spawnParticles(pos.x - 12, pos.y - 34, '#e9c477', 16);
    addLog(`<strong>${enemy.name}</strong> 主动拉开枪线，抬枪瞄准下一次出手。`, 'bad');
    await sleep(560);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    const shot = await promptEnemyShot(enemy, {
      duration: 1080,
      perfectStart: .59,
      perfectEnd: .675,
      normalStart: .535,
      normalEnd: .75,
      title: '后撤抬枪 · 远距锁定！',
      hint: '先横移离开枪线；枪响前也可点按 F/LB 弹开子弹'
    });
    if (state.combat === combat && !combat.finished && !enemy.dead && !shot.dodged && !shot.parried) {
      const shotIntent = { type: 'shot', label: '远距锁定射击' };
      enemyAttack(enemy, null, {
        directDamage: true,
        intent: shotIntent,
        value: Math.round(intentDamage(enemy) * 1.02),
        label: shotIntent.label,
        guardMultiplier: .78,
        postureMultiplier: 1.04
      });
    }
  }

  async function performBackstepCleave(combat, enemy) {
    const enemyIndex = combat.enemies.indexOf(enemy);
    const pos = enemyCanvasPosition(enemyIndex);
    enemy.action = 'cleaveWindup';
    scene.goldFlash = Math.max(scene.goldFlash, .22);
    scene.shake = Math.max(scene.shake, 6);
    spawnFloat(pos.x, pos.y - 134, '后撤蓄势', '#ffd37d');
    spawnParticles(pos.x, pos.y - 42, '#efc26e', 24);
    addLog(`<strong>${enemy.name}</strong> 一个大后撤步拉开距离，重刃高举准备大范围横劈。`, 'bad');
    await sleep(620);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'dash';
    enemy.moveTargetX = clamp(combat.playerX + 246, 455, 760);
    scene.shake = Math.max(scene.shake, 8);
    await sleep(340);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    const hitIntent = { type: 'heavy', label: '回身裂阵横劈' };
    const grade = await promptParry(enemy, {
      intent: hitIntent,
      style: 'backstepCleave',
      narrow: true,
      duration: 1320,
      perfectStart: .57,
      perfectEnd: .65,
      blockStart: .525,
      blockEnd: .735,
      cueLeadMs: 150,
      resolveDelay: 100,
      title: '后撤蓄势 · 裂阵横劈！',
      hint: '后撤和举刀都是前戏；真正横扫回阵前时再点按 F/LB',
      kicker: '范围绝技 · 明显后撤前摇'
    });
    enemyAttack(enemy, grade, {
      intent: hitIntent,
      value: Math.round(intentDamage(enemy) * .98),
      label: hitIntent.label,
      postureMultiplier: 1.35,
      blockMultiplier: .34,
      guardMultiplier: .93
    });
  }

  async function performAdvanceCombo(combat, enemy) {
    const enemyIndex = combat.enemies.indexOf(enemy);
    const pos = enemyCanvasPosition(enemyIndex);
    enemy.action = 'advanceWindup';
    scene.shake = Math.max(scene.shake, 7);
    spawnFloat(pos.x, pos.y - 132, '抢近身位', '#ffb46e');
    spawnParticles(pos.x - 12, pos.y - 36, '#e98963', 20);
    addLog(`<strong>${enemy.name}</strong> 突然加速贴近，连续三段追斩封住退路。`, 'bad');
    await sleep(430);
    const titles = ['贴身快斩', '逆手回撩', '追身落斩'];
    for (let step = 1; step <= 3; step++) {
      if (!canContinueEnemySequence(combat, enemy)) return;
      enemy.action = 'attack';
      const hitIntent = { type: step === 3 ? 'heavy' : 'quick', label: `近身三段 · ${titles[step - 1]}` };
      const grade = await promptParry(enemy, {
        intent: hitIntent,
        comboStep: step,
        comboTotal: 3,
        sequenceLabel: '近身三段追斩',
        style: 'advanceCombo',
        quick: step < 3,
        narrow: step === 3,
        duration: step === 1 ? 500 : step === 2 ? 445 : 620,
        perfectStart: step === 3 ? .58 : .55,
        perfectEnd: step === 3 ? .655 : .62,
        blockStart: step === 3 ? .53 : .515,
        blockEnd: step === 3 ? .74 : .72,
        cueLeadMs: step === 3 ? 116 : 92,
        resolveDelay: step === 3 ? 88 : 58,
        title: `抢近身 · ${titles[step - 1]}`,
        hint: step === 1 ? '第一刀很快；抬刀后还有两刀连续追来' : step === 2 ? '第二刀逆手回撩，不要提前松警惕' : '最后一段是追身落斩，刀锋下压时弹反',
        kicker: `位移连段 · 近身三段 · 第 ${step} 刀`
      });
      enemyAttack(enemy, grade, {
        intent: hitIntent,
        value: Math.round(intentDamage(enemy) * (step === 3 ? .62 : .34)),
        label: hitIntent.label,
        postureMultiplier: step === 3 ? 1.18 : .72,
        blockMultiplier: .38,
        guardMultiplier: .95
      });
      updateMetaBars();
      renderEnemyCards();
      if (!canContinueEnemySequence(combat, enemy)) return;
      if (step < 3) await sleep(step === 1 ? 105 : 92);
    }
  }

  async function performFeintDash(combat, enemy) {
    const enemyIndex = combat.enemies.indexOf(enemy);
    enemy.action = 'backstep';
    enemy.moveTargetX = clamp(combat.playerX + 350, 560, 825);
    const firstPos = enemyCanvasPosition(enemyIndex);
    spawnFloat(firstPos.x, firstPos.y - 130, '虚晃后撤', '#ffc878');
    addLog(`<strong>${enemy.name}</strong> 左右虚晃两次，故意拉开半步，随后突然贴身。`, 'bad');
    await sleep(300);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'blink';
    enemy.moveTargetX = clamp(combat.playerX + 224, 450, 755);
    spawnParticles(enemyCanvasPosition(enemyIndex).x, 315, '#e78360', 22);
    await sleep(260);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'attack';
    const hitIntent = { type: 'quick', label: '虚晃贴身快斩' };
    const grade = await promptParry(enemy, {
      intent: hitIntent,
      style: 'feintDash',
      quick: true,
      narrow: true,
      duration: 680,
      perfectStart: .575,
      perfectEnd: .65,
      blockStart: .53,
      blockEnd: .735,
      cueLeadMs: 105,
      resolveDelay: 80,
      title: '左右虚晃 · 贴身快斩！',
      hint: '两次假动作后才会真正贴身出刀；看到刀锋突然拉长时点按 F/LB',
      kicker: '身法绝技 · 虚晃抢近'
    });
    enemyAttack(enemy, grade, {
      intent: hitIntent,
      value: Math.round(intentDamage(enemy) * .72),
      label: hitIntent.label,
      postureMultiplier: 1.0,
      blockMultiplier: .37,
      guardMultiplier: .95
    });
  }

  async function performFrostmarksmanMove(combat, enemy) {
    const label = enemy.eliteSpecial?.label || '雪岭锁魂铳';
    enemy.action = 'backstep';
    enemy.moveTargetX = clamp(combat.playerX + 450, 680, 865);
    scene.goldFlash = Math.max(scene.goldFlash, .18);
    addLog(`<strong>${enemy.name}</strong> 退入雪幕，先架起冷枪锁住阵前。`, 'bad');
    await sleep(230);
    if (!canContinueEnemySequence(combat, enemy)) return;
    let shot = await promptEnemyShot(enemy, {
      duration: 960,
      perfectStart: .61,
      perfectEnd: .685,
      normalStart: .54,
      normalEnd: .74,
      title: `${label} · 第一枪`,
      hint: '先横移离开枪线，或枪响前点按 F/LB 弹开子弹；这只是第一段'
    });
    if (state.combat === combat && !combat.finished && !enemy.dead && !shot.dodged && !shot.parried) {
      enemyAttack(enemy, null, {
        directDamage: true,
        intent: { type: 'shot', label: `${label} · 封路枪` },
        value: Math.round(intentDamage(enemy) * .72),
        label: `${label} · 封路枪`,
        guardMultiplier: .8,
        postureMultiplier: 1.02
      });
    }
    updateMetaBars();
    renderEnemyCards();
    if (!canContinueEnemySequence(combat, enemy)) return;
    await sleep(90);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'dash';
    enemy.moveTargetX = clamp(combat.playerX + 225, 470, 785);
    spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x, 310, '#c9d8de', 20);
    addLog(`<strong>${enemy.name}</strong> 借着枪声前压，枪刃贴着雪面刺来。`, 'bad');
    await sleep(190);
    if (!canContinueEnemySequence(combat, enemy)) return;
    const thrustIntent = { type: 'thrust', label: `${label} · 枪刃破雪` };
    enemy.action = 'attack';
    const thrustGrade = await promptParry(enemy, {
      intent: thrustIntent,
      comboStep: 2,
      comboTotal: 3,
      sequenceLabel: label,
      style: 'eliteMove',
      narrow: true,
      duration: 650,
      perfectStart: .585,
      perfectEnd: .66,
      blockStart: .53,
      blockEnd: .745,
      cueLeadMs: 105,
      resolveDelay: 78,
      title: `${label} · 枪刃破雪！`,
      hint: '枪响之后立刻前压；枪尖闪光时弹反，闪避可识破',
      kicker: `劲敌绝技 · ${label} · 第 2 刀`
    });
    enemyAttack(enemy, thrustGrade, {
      intent: thrustIntent,
      value: Math.round(intentDamage(enemy) * .8),
      label: thrustIntent.label,
      postureMultiplier: 1.15,
      blockMultiplier: .36,
      guardMultiplier: .94
    });
    updateMetaBars();
    renderEnemyCards();
    if (!canContinueEnemySequence(combat, enemy)) return;
    await sleep(80);
    if (!canContinueEnemySequence(combat, enemy)) return;
    enemy.action = 'backstep';
    enemy.moveTargetX = clamp(combat.playerX + 430, 650, 865);
    await sleep(130);
    if (!canContinueEnemySequence(combat, enemy)) return;
    shot = await promptEnemyShot(enemy, {
      duration: 650,
      perfectStart: .59,
      perfectEnd: .67,
      normalStart: .525,
      normalEnd: .745,
      title: `${label} · 回身绝铳！`,
      hint: '最后一枪几乎没有准备动作；盯住枪口火光，立即弹反或闪避'
    });
    if (state.combat === combat && !combat.finished && !enemy.dead && !shot.dodged && !shot.parried) {
      enemyAttack(enemy, null, {
        directDamage: true,
        intent: { type: 'shot', label: `${label} · 回身绝铳` },
        value: Math.round(intentDamage(enemy) * .92),
        label: `${label} · 回身绝铳`,
        guardMultiplier: .78,
        postureMultiplier: 1.12
      });
    }
  }

  async function performEliteMove(combat, enemy) {
    const label = enemy.eliteSpecial?.label || '精英绝技';
    const profiles = {
      blocker: { durations: [880, 620], gap: 190, first: .56, second: .615, style: 'eliteMove', types: ['attack', 'heavy'], stages: ['重盾压势', '崩山绝撞'], damage: [.58, .78], posture: [1.0, 1.32] },
      skirmisher: { durations: [620, 430], gap: 62, first: .57, second: .6, style: 'blinkSlash', types: ['quick', 'quick'], stages: ['疾影切入', '回锋补斩'], damage: [.48, .62], posture: [.72, .92] },
      cavalry: { durations: [760, 470], gap: 96, first: .57, second: .605, style: 'eliteMove', types: ['thrust', 'thrust'], stages: ['长枪贯阵', '回马绝刺'], damage: [.62, .76], posture: [1.05, 1.2] },
      cold: { durations: [920, 540], gap: 152, first: .575, second: .62, style: 'slowFast', types: ['slowFast', 'quick'], stages: ['雪线蓄锋', '封杀急斩'], damage: [.56, .72], posture: [.88, 1.12] },
      swamp: { durations: [600, 420], gap: 50, first: .57, second: .605, style: 'blinkSlash', types: ['quick', 'quick'], stages: ['泥影贴身', '伏刃抹喉'], damage: [.5, .62], posture: [.75, .95] },
      bridgebreaker: {
        steps: 3, durations: [940, 620, 470], gaps: [145, 82], perfectStarts: [.565, .61, .585],
        style: 'eliteMove', types: ['heavy', 'heavy', 'quick'], stages: ['断索压顶', '回刃裂岸', '追锋断桥'],
        damage: [.56, .66, .72], posture: [1.05, 1.18, 1.32]
      },
      daduLancer: {
        steps: 3, durations: [820, 430, 610], gaps: [72, 48], perfectStarts: [.57, .605, .585],
        style: 'eliteMove', types: ['thrust', 'quick', 'thrust'], stages: ['回马蓄势', '翻身快刺', '贯日绝枪'],
        damage: [.58, .56, .8], posture: [1.05, .9, 1.24]
      },
      bogReaper: {
        steps: 5, durations: [520, 400, 470, 395, 560], gaps: [44, 88, 34, 52], perfectStarts: [.585, .605, .57, .61, .59],
        style: 'blinkSlash', types: ['quick', 'quick', 'attack', 'quick', 'thrust'], stages: ['泥影左刃', '贴地右割', '翻身压刀', '乱草回锋', '索命贯刺'],
        damage: [.38, .4, .48, .43, .68], posture: [.65, .68, .82, .7, 1.02]
      }
    };
    if (enemy.typeId === 'frostmarksman') {
      await performFrostmarksmanMove(combat, enemy);
      return;
    }
    const profile = profiles[enemy.typeId] || profiles.blocker;
    const lateElite = ['bridgebreaker', 'daduLancer', 'frostmarksman', 'bogReaper'].includes(enemy.typeId);
    const eliteRankLabel = lateElite ? '劲敌绝技' : '精英绝技';

    if (enemy.typeId === 'blocker') {
      enemy.status.armor = 1;
      enemy.armorUntil = performance.now() + 3800;
      scene.shake = Math.max(scene.shake, 8);
      spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x - 22, 318, '#d8b36d', 18);
      addLog(`<strong>${enemy.name}</strong> 举起重盾，借盾墙压进。`, 'bad');
    } else if (enemy.typeId === 'skirmisher' || enemy.typeId === 'swamp') {
      enemy.action = 'blink';
      enemy.moveTargetX = clamp(combat.playerX + 218, 470, 790);
      spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x, 316, enemy.typeId === 'swamp' ? '#809a63' : '#e57a57', 22);
      await sleep(enemy.typeId === 'swamp' ? 110 : 165);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> ${enemy.typeId === 'swamp' ? '贴着泥影伏低，短刃已经出鞘' : '踏出残影，双刃一前一后封住退路'}。`, 'bad');
    } else if (enemy.typeId === 'cavalry') {
      enemy.action = 'dash';
      enemy.moveTargetX = clamp(combat.playerX + 205, 465, 785);
      scene.shake = Math.max(scene.shake, 9);
      await sleep(230);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> 压低长枪，借冲势直贯阵前。`, 'bad');
    } else if (enemy.typeId === 'cold') {
      scene.goldFlash = Math.max(scene.goldFlash, .16);
      addLog(`<strong>${enemy.name}</strong> 将重刃拖过雪面，先慢后快地抬刀。`, 'bad');
    } else if (enemy.typeId === 'bridgebreaker') {
      enemy.status.armor = 1;
      enemy.armorUntil = performance.now() + 4400;
      enemy.action = 'advanceWindup';
      enemy.moveTargetX = clamp(combat.playerX + 215, 470, 780);
      scene.shake = Math.max(scene.shake, 10);
      spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x - 12, 312, '#d59b57', 22);
      await sleep(210);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> 双手拖起重刃，每一步都把刀锋压得更低。`, 'bad');
    } else if (enemy.typeId === 'daduLancer') {
      enemy.action = 'thrustWindup';
      scene.goldFlash = Math.max(scene.goldFlash, .2);
      await sleep(170);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> 拨马回身，枪尾猛地一沉，三记贯刺蓄势待发。`, 'bad');
    } else if (enemy.typeId === 'bogReaper') {
      enemy.action = 'feintDash';
      enemy.moveTargetX = clamp(combat.playerX + 218, 470, 790);
      spawnParticles(enemyCanvasPosition(combat.enemies.indexOf(enemy)).x, 314, '#89a46c', 24);
      await sleep(145);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> 贴着泥影折身切入，双刃在身侧交错成乱影。`, 'bad');
    } else if (enemy.typeId === 'gunner') {
      const firstIntent = { type: 'attack', label: '枪托震击 · 近身砸击' };
      enemy.action = 'attack';
      const firstGrade = await promptParry(enemy, {
        intent: firstIntent,
        comboStep: 1,
        comboTotal: 2,
        sequenceLabel: label,
        style: 'eliteMove',
        narrow: true,
        duration: 720,
        perfectStart: .57,
        perfectEnd: .655,
        blockStart: .52,
        blockEnd: .74,
        cueLeadMs: 118,
        resolveDelay: 78,
        title: `${label} · 枪托近砸`,
        hint: '先用枪托砸开防线，随后会从贴身距离直接开火',
        kicker: `精英绝技 · ${label} · 第 1 刀`
      });
      enemyAttack(enemy, firstGrade, {
        intent: firstIntent,
        value: Math.round(intentDamage(enemy) * .56),
        label: firstIntent.label,
        postureMultiplier: .96,
        blockMultiplier: .38
      });
      updateMetaBars();
      renderEnemyCards();
      if (!canContinueEnemySequence(combat, enemy)) return;
      await sleep(120);
      if (!canContinueEnemySequence(combat, enemy)) return;
      addLog(`<strong>${enemy.name}</strong> 枪口贴到面前，抵近射击！`, 'bad');
      enemy.action = 'attack';
      const shot = await promptEnemyShot(enemy, {
        duration: 700,
        perfectStart: .58,
        perfectEnd: .685,
        normalStart: .53,
        normalEnd: .75,
        title: `${label} · 抵近射击！`,
        hint: '枪响极快：先横向移动，或枪响前点按 F 弹开子弹'
      });
      if (state.combat === combat && !combat.finished && !enemy.dead && !shot.dodged && !shot.parried) {
        const shotIntent = { type: 'shot', label: '抵近射击' };
        enemyAttack(enemy, null, {
          directDamage: true,
          intent: shotIntent,
          value: Math.round(intentDamage(enemy) * 1.05),
          label: '枪托震击 · 抵近射击',
          guardMultiplier: .78,
          postureMultiplier: 1.08
        });
      }
      return;
    }

    addLog(`<strong>${enemy.name}</strong> 使出专属招式「${label}」。`, 'bad');
    const totalSteps = profile.steps || 2;
    for (let step = 1; step <= totalSteps; step++) {
      if (!canContinueEnemySequence(combat, enemy)) return;
      const hitType = profile.types[step - 1];
      const hitIntent = { type: hitType, label: `${label} · ${profile.stages[step - 1]}` };
      const stepStart = profile.perfectStarts?.[step - 1] ?? (step === 1 ? profile.first : step === 2 ? profile.second : .585);
      enemy.action = 'attack';
      const grade = await promptParry(enemy, {
        intent: hitIntent,
        comboStep: step,
        comboTotal: totalSteps,
        sequenceLabel: label,
        style: profile.style,
        quick: hitType === 'quick',
        narrow: hitType !== 'quick',
        duration: profile.durations[step - 1],
        perfectStart: stepStart,
        perfectEnd: stepStart + (hitType === 'quick' ? .072 : .086),
        blockStart: hitType === 'quick' ? .535 : .52,
        blockEnd: hitType === 'quick' ? .75 : .735,
        cueLeadMs: hitType === 'quick' ? 92 : 128,
        resolveDelay: step === totalSteps ? 92 : 70,
        title: `${label} · ${profile.stages[step - 1]}`,
        hint: step === 1
          ? '先看清这名精英的专属起势；第一段被挡下后还有后续变化'
          : hitType === 'quick'
            ? '后续刀锋会突然加速，看到武器再次前压时立刻点按 F'
            : '这一段的停顿和方向会变化，不要照着上一刀的节奏连按',
        kicker: `${eliteRankLabel} · ${label} · 第 ${step} 刀`
      });
      enemyAttack(enemy, grade, {
        intent: hitIntent,
        value: Math.round(intentDamage(enemy) * profile.damage[step - 1]),
        label: hitIntent.label,
        postureMultiplier: profile.posture[step - 1],
        blockMultiplier: .36,
        guardMultiplier: .94
      });
      updateMetaBars();
      renderEnemyCards();
      if (!canContinueEnemySequence(combat, enemy)) return;
      if (step < totalSteps) {
        const gap = profile.gaps?.[step - 1] ?? profile.gap ?? 90;
        await sleep(gap);
      }
    }
  }


  async function runEnemyBrain(combat, enemy, index) {
    await sleep(360 + index * 140);
    while (state.combat === combat && state.screen === 'battle' && !combat.finished && !enemy.dead && !enemy.brainDisabled && state.player.hp > 0) {
      while ((state.saveManagerOpen || state.testModeOpen || gameplayPausedByOverlay()) && state.combat === combat && !combat.finished) await sleep(80);
      if (enemy.status.broken) {
        await sleep(220);
        continue;
      }
      if ((enemy.hitstunUntil || 0) > performance.now()) {
        await sleep(80);
        continue;
      }
      if (enemy.status.stun > 0) {
        enemy.status.stun = Math.max(0, enemy.status.stun - 1);
        enemy.intent = null;
        addLog(`${enemy.name} 的攻势迟滞了一拍。`, 'good');
        await sleep(520);
        continue;
      }
      if (shouldEnemyBreathe(enemy, performance.now())) {
        await performEnemyBreather(combat, enemy);
        await sleep(320);
        continue;
      }
      await performRealtimeEnemyAction(combat, enemy, index);
      if (state.combat !== combat || combat.finished) return;
      enemy.action = 'patrol';
      enemy.moveTargetX = clamp(enemy.homeX + (state.rng() - .5) * 110, combat.playerX + 235, 845);
      await sleep(260 + Math.floor(state.rng() * 180));
    }
  }

  async function performRealtimeEnemyAction(combat, enemy, index) {
    if (state.combat !== combat || combat.finished || enemy.dead || enemy.status.broken) return;
    while ((parrySession?.active || shotSession?.active) && state.combat === combat && !combat.finished) await sleep(70);
    if (!enemy.intent || enemy.hasActed) assignIntent(enemy);
    enemy.hasActed = true;
    renderEnemyCards();
    const intent = enemy.intent;
    if (!intent) return;
    const retreatPattern = ['retreatThrust', 'backstepShot', 'backstepCleave'].includes(intent.type);
    const advancePattern = intent.type === 'advanceCombo';
    const feintPattern = intent.type === 'feintDash';
    const ranged = intent.type === 'shot' || intent.type === 'backstepShot';
    const targetX = retreatPattern
      ? clamp(combat.playerX + 430, 650, 860)
      : advancePattern ? clamp(combat.playerX + 226, 455, 765)
        : feintPattern ? clamp(combat.playerX + 330, 545, 820)
          : ranged ? clamp(combat.playerX + 420, 650, 865) : clamp(combat.playerX + 252, 500, 815);
    enemy.action = retreatPattern ? 'backstep' : advancePattern ? 'advanceWindup' : feintPattern ? 'feintDash' : 'dash';
    enemy.moveTargetX = targetX;
    await sleep(retreatPattern ? 470 : advancePattern ? 390 : feintPattern ? 260 : ranged ? 220 : 275);
    while ((enemy.hitstunUntil || 0) > performance.now() && state.combat === combat && !combat.finished && !enemy.dead) await sleep(25);
    if (state.combat !== combat || combat.finished || enemy.dead || enemy.status.broken || enemy.status.stun > 0) return;
    enemy.action = 'attack';
    if (intent.type === 'retreatThrust') {
      await performRetreatThrust(combat, enemy);
    } else if (intent.type === 'backstepShot') {
      await performBackstepShot(combat, enemy);
    } else if (intent.type === 'backstepCleave') {
      await performBackstepCleave(combat, enemy);
    } else if (intent.type === 'advanceCombo') {
      await performAdvanceCombo(combat, enemy);
    } else if (intent.type === 'feintDash') {
      await performFeintDash(combat, enemy);
    } else if (intent.type === 'shot') {
      const shot = await promptEnemyShot(enemy);
      if (!enemy.dead && !shot.dodged && !shot.parried && state.combat === combat && !combat.finished) {
        enemyAttack(enemy, null, {
          directDamage: true,
          value: intent.value,
          label: '远程枪击',
          guardMultiplier: .78
        });
      }
    } else if (intent.type === 'whirlwind') {
      await performWhirlwind(combat, enemy);
    } else if (intent.type === 'blinkSlash') {
      await performBlinkSlash(combat, enemy);
    } else if (intent.type === 'slowFast') {
      await performSlowFast(combat, enemy);
    } else if (intent.type === 'eliteMove') {
      await performEliteMove(combat, enemy);
    } else if (intent.type === 'combo') {
      const firstGrade = await promptParry(enemy, { comboStep: 1 });
      enemyAttack(enemy, firstGrade, {
        value: Math.round(intentDamage(enemy) * .58),
        label: '双连斩 · 第一刀'
      });
      if (firstGrade === 'perfect') {
        addLog('<strong>第一刀被完美弹开</strong>，但敌人强行压上第二刀。', 'good');
      }
      if (!enemy.dead && !enemy.status.broken && state.player.hp > 0 && state.combat === combat && !combat.finished) {
        await sleep(firstGrade === 'perfect' ? 180 : 130);
        enemy.action = 'attack';
        addLog('<strong>连斩追刀</strong>：第一刀之后，敌人立刻压上第二刀。', 'bad');
        const secondGrade = await promptParry(enemy, { followup: true, comboStep: 2 });
        enemyAttack(enemy, secondGrade, {
          value: Math.round(intentDamage(enemy) * .72),
          label: '双连斩 · 追刀'
        });
      } else if (enemy.status.broken) {
        addLog('<strong>双连斩被打断</strong>：敌人架势崩溃，追刀未能挥出。', 'good');
      }
    } else {
      const damaging = ['attack', 'heavy', 'siege', 'quick', 'thrust'].includes(intent.type);
      const trainingPrompt = state.training?.active && intent.training;
      const parryGrade = damaging ? await promptParry(enemy, trainingPrompt ? {
        duration: intent.type === 'thrust' ? 930 : intent.type === 'quick' ? 720 : 920,
        trainingSlow: !!intent.trainingSlow,
        perfectStart: intent.type === 'quick' ? .58 : .565,
        perfectEnd: intent.type === 'quick' ? .655 : .65,
        blockStart: intent.type === 'quick' ? .535 : .515,
        blockEnd: intent.type === 'quick' ? .74 : .73,
        cueLeadMs: 125,
        title: intent.label || '看准这一刀',
        hint: intent.trainingSlow ? `起手仍按正常速度；金光亮起后画面放慢，此时按 ${inputBindingLabel('guard')}` : `正常速度：看准武器落下再按 ${inputBindingLabel('guard')}`,
        kicker: intent.trainingSlow ? '战前演练 · 金光亮相' : '战前演练 · 正常速度'
      } : undefined) : null;
      if (!enemy.dead && state.combat === combat && !combat.finished) enemyAttack(enemy, parryGrade);
    }
    updateMetaBars();
    renderEnemyCards();
    if (combat.enemies.every((target) => target.dead)) {
      finishVictory();
      return;
    }
    if (state.player.hp <= 0) {
      finishDefeat();
      return;
    }
    if (enemy.status.broken) {
      enemy.action = 'collapse';
      enemy.moveTargetX = Math.min(enemy.x, combat.playerX + 185);
    } else {
      enemy.action = 'retreat';
      enemy.moveTargetX = enemy.homeX;
      if (!enemy.status.charged) enemy.intent = { type: 'move', label: '移动换位', value: 0 };
    }
    await sleep(225);
  }

  function startRealtimeCombat() {
    const combat = state.combat;
    if (!combat) return;
    combat.enemies.forEach((enemy, index) => {
      runEnemyBrain(combat, enemy, index);
    });
  }

  function finishDefeat() {
    if (state.training?.active) { state.player.hp = Math.max(1, Math.round(state.player.maxHp * .6)); state.player.posture = 0; state.player.postureBroken = false; updateMetaBars(); showToast('护住阵脚，队伍已缓过气。继续练习。'); return; }
    const combat = state.combat, p = state.player, map = state.singleMap;
    if (!combat || combat.finished || !p) return;
    combat.finished = true;
    combat.busy = true;
    if (state.testMode || testRunActive) {
      addLog('测试战斗结束，正式行军未受影响。', 'good');
      showToast('测试战斗结束，正在返回正式行军…', 1500);
      clearTestModeExitTimer();
      const exitEpoch = testRunEpoch;
      testModeExitTimer = window.setTimeout(() => {
        testModeExitTimer = 0;
        if (testRunEpoch !== exitEpoch || !testRunActive) return;
        exitTestMode();
      }, 720);
      return;
    }
    if (state.runMode === 'single' && state.singlePace === 'normal' && (p.lives || 1) > 1 && map) {
      p.lives -= 1;
      p.deaths = (p.deaths || 0) + 1;
      state.stats.deaths = (state.stats.deaths || 0) + 1;
      const target = singleMapRoom(map, map.respawnId) || map.rooms[0];
      map.player.x = target.x; map.player.y = target.y; map.player.layer = target.layer;
      map.currentId = target.id; map.regionIndex = target.region;
      if (!map.visited.includes(target.id)) map.visited.push(target.id);
      p.hp = p.maxHp; p.posture = 0; p.postureBroken = false; p.postureBreakUntil = 0; p.hitstunUntil = 0; p.respawnId = target.id;
      map.triggering = false;
      map.nearbyAction = null;
      state.combat = null; state.boss = false; state.currentRoute = null;
      parrySession = null; shotSession = null; scene.duel = null; scene.shotAim = null; scene.mikiri = null; scene.execution = null; scene.playerAttack = null; scene.lunge = 0;
      dom.parryOverlay?.classList.add('hidden'); dom.canvas?.classList.add('hidden');
      updateMetaBars(); setScreen('map'); renderSingleMap(); saveCurrentRun('map');
      queueAcquisition({ type: 'respawn', kicker: '星火未熄 · 重新集结', name: '从营火归来', icon: '✦', meta: `剩余 ${p.lives} 条命 · 已归返 ${target.name.split(' · ')[0]}`, desc: '队伍在最后点亮的星火旁重新集结。战场上的敌人仍守在原处。', effects: ['兵力完全恢复', '架势完全恢复', `本局死亡 ${p.deaths} 次`], note: '再次接敌前，可以先整备军备或沿营火转移。' });
      playSound('mikiri');
      return;
    }
    addLog('队伍已无力再战。', 'bad');
    playSound('lose');
    updateMetaBars();
    setTimeout(() => showEnding(false), 650);
  }

  function updateEnemyMovement(dt) {
    const combat = state.combat;
    if (!combat || combat.finished) return;
    combat.enemies.forEach((enemy) => {
      if (enemy.dead || (enemy.hitstunUntil || 0) > performance.now()) return;
      const speed = enemy.action === 'blink' ? 920 : enemy.action === 'backstep' ? 560 : enemy.action === 'dash' ? 390 : enemy.action === 'advanceWindup' ? 470 : enemy.action === 'feintDash' ? 620 : enemy.action === 'thrustWindup' || enemy.action === 'cleaveWindup' || enemy.action === 'aimWindup' ? 0 : enemy.action === 'retreat' ? 250 : enemy.action === 'collapse' ? 280 : enemy.action === 'breathe' ? 80 : enemy.action === 'stagger' ? 0 : 132;
      if (enemy.status.broken) {
        const target = clamp(enemy.moveTargetX ?? enemy.x, 0, 865);
        const diff = target - enemy.x;
        if (Math.abs(diff) > 1) enemy.x += clamp(diff, -speed * dt, speed * dt);
        return;
      }
      const minX = combat.playerX + 178;
      let maxX = 865;
      if (enemy.action === 'patrol' || enemy.action === 'retreat') maxX = Math.min(maxX, combat.playerX + 205);
      const target = clamp(enemy.moveTargetX ?? enemy.homeX, minX, maxX);
      const diff = target - enemy.x;
      if (Math.abs(diff) > 1) enemy.x += clamp(diff, -speed * dt, speed * dt);
    });
  }

  function updatePostureUi() {
    const combat = state.combat;
    const p = state.player;
    if (!combat || !p) return;
    updateMetaBars();
    combat.enemies.forEach((enemy) => {
      const bar = dom.enemyCards.querySelector(`[data-posture="${enemy.id}"]`);
      if (bar) setPct(bar, enemy.posture / enemy.maxPosture * 100);
    });
  }

  function updateRealtimeCombat(dt, now) {
    const combat = state.combat;
    const p = state.player;
    if (!combat || state.screen !== 'battle' || combat.finished || !p) return;
    updateJumpPhysics(dt, now);
    updateEnemyMovement(dt);
    updatePlayerStateNotice(now);
    if (p.postureBroken) {
      if (now >= p.postureBreakUntil) {
        p.postureBroken = false;
        p.posture = 28;
        p.postureRecoverAt = now + 700;
        if (state.combat.statusNotice?.kind === 'broken') state.combat.statusNotice.until = now;
        setActionState();
        showToast('阵脚重整完成');
      }
    } else if (now >= p.postureRecoverAt) {
      const moving = Math.hypot(combat.moveVelocity || 0, combat.moveVelocityY || 0) > 18 || movementInput.left || movementInput.right || movementInput.up || movementInput.down || controllerInput.left || controllerInput.right || controllerInput.up || controllerInput.down;
      const recoverRate = moving ? .55 : 3.2;
      p.posture = Math.max(0, p.posture - recoverRate * dt);
    }
    if (p.hitstunUntil && now >= p.hitstunUntil) {
      p.hitstunUntil = 0;
      if (combat.counterWindowUntil > now && combat.queuedAttack === 'normal' && !combat.busy && !p.postureBroken) {
        combat.counterWindowUntil = 0;
        combat.queuedAttack = null;
        beginPlayerAttack('normal', 'guard');
      } else {
        setActionState();
      }
    }
    if (!parrySession?.active && scene.duel) scene.duel = null;
    if (!shotSession?.active && scene.shotAim) scene.shotAim = null;
    if (combat.phase === 'attack' && !scene.playerAttack) {
      combat.busy = false;
      combat.phase = 'player';
      setActionState();
    }
    if (p.moraleRegen > 0) p.morale = Math.min(100, p.morale + p.moraleRegen * dt * .14);
    combat.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      if (enemy.status.broken) {
        if (now >= enemy.postureBreakUntil) {
          enemy.status.broken = false;
          enemy.posture = 0;
          enemy.postureBreakUntil = 0;
          if (!enemy.dead) assignIntent(enemy);
          renderEnemyCards();
        }
      }
      if (enemy.status.armor > 0 && now >= (enemy.armorUntil || 0)) {
        enemy.status.armor = 0;
        enemy.armorUntil = 0;
      }
    });
    if (now - combat.lastPostureUi > 120) {
      combat.lastPostureUi = now;
      updatePostureUi();
      setActionState();
    }
  }


  function gainXp(amount) {
    const p = state.player;
    const oldSlotLimit = equipmentSlotLimit(p);
    p.xp += amount;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      p.xpNext += 24;
      p.maxHp += 14;
      p.hp = Math.min(p.maxHp, p.hp + 8);
      p.maxPosture += 4;
      p.atk += 2;
      if (p.level % 2 === 0) p.defense += 1;
      p.morale = Math.min(100, p.morale + 5);
      p.merit = (p.merit || 0) + 8;
      showLevelToast(p.level);
      addLog(`队伍升至 <strong>Lv.${p.level}</strong>：兵力上限、架势上限、攻势与士气得到提升。`, 'good');
    }
    const newSlotLimit = equipmentSlotLimit(p);
    if (newSlotLimit > oldSlotLimit) queueAcquisition({ type: 'slot', kicker: '等级成长 · 军备扩充', name: '新军备槽', icon: '架', meta: `队伍等级 ${p.level}`, desc: '队伍已经能稳定携带更多军备。', effects: [`军备槽上限提升至 ${newSlotLimit}`], note: '军备槽总上限为 4。' });
    updateMetaBars();
  }

  function finishVictory() {
    if (state.training?.active) { finishPracticalTutorial(); return; }
    clearPlayerWindow();
    if (state.combat.finished) return;
    state.combat.finished = true;
    state.combat.busy = true;
    state.stats.victories += 1; checkAchievements();
    const xp = Math.round(state.combat.enemies.reduce((sum, enemy) => sum + enemy.maxHp * .42 + 10, 0) + 15 + state.battleNumber * 2);
    const p = state.player;
    const eliteEnemy = state.combat.enemies.find((enemy) => enemy.elite);
    const eliteCleared = !!eliteEnemy;
    const difficulty = state.runMode === 'single' ? difficultyProfile() : { merit: 1 };
    const baseMeritGain = state.combat.boss ? (70 + state.chapter * 4) : eliteCleared ? (28 + state.chapter * 2) : (7 + state.chapter * 1.2 + state.battleNumber * .2);
    const meritGain = Math.round(baseMeritGain * (difficulty.merit || 1) * (1 + (p.meritGainBonus || 0)));
    const xpMultiplier = state.combat.boss ? 2.5 : eliteCleared ? Math.max(1.5, eliteEnemy.eliteXpMultiplier || 1.5) : (state.currentRoute?.xp || 1);
    const xpEarned = Math.round(xp * xpMultiplier * 1.16);
    state.combat.meritEarned = meritGain;
    state.combat.xpEarned = xpEarned;
    state.combat.xpMultiplier = xpMultiplier;
    p.merit = (p.merit || 0) + meritGain;
    spawnFloat(playerCenterX(), 220, `军功 +${meritGain}`, '#f3cf78');
    p.supplies = Math.min(p.maxSupplies, p.supplies + 9);
    p.morale = Math.min(100, p.morale + 6);
    addLog(`敌军被击退，缴获军功 <strong>+${meritGain}</strong>。`, 'good');
    playSound('win');
    spawnFloat(playerCenterX(), 258, `历练 +${xpEarned}`, '#e8c477');
    addLog(`这一战让队伍得到 <strong>${xpEarned}</strong> 点历练。`, 'good');
    gainXp(xpEarned);
    updateMetaBars();
    renderEnemyCards();
    setTimeout(() => {
      const continuesAfterBoss = state.runMode === 'single'
        ? !state.currentRoute?.finalBoss
        : state.runMode === 'roguelike' && state.act < ROGUELIKE_ACTS.length - 1;
      if (state.combat.boss && !continuesAfterBoss) showEnding(true);
      else showRewards();
    }, 450);
  }

  function traceFivePointStar(ctx, x, y, outerRadius, innerRadius = outerRadius * .43) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawBackground(ctx, palette, terrain, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 540);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(.7, palette.skyBottom);
    gradient.addColorStop(1, palette.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 540);

    ctx.save();
    const starX = 760, starY = terrain === 'jiajin' ? 112 : 122, starRadius = terrain === 'jiajin' ? 31 : 39;
    const starGlow = ctx.createRadialGradient(starX, starY, 4, starX, starY, starRadius * 2.6);
    starGlow.addColorStop(0, 'rgba(255,232,164,.26)');
    starGlow.addColorStop(.48, 'rgba(232,196,119,.11)');
    starGlow.addColorStop(1, 'rgba(232,196,119,0)');
    ctx.fillStyle = starGlow;
    ctx.beginPath(); ctx.arc(starX, starY, starRadius * 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = terrain === 'jiajin' ? .62 : .76;
    ctx.shadowColor = 'rgba(255,224,145,.72)';
    ctx.shadowBlur = 22;
    traceFivePointStar(ctx, starX, starY, starRadius);
    ctx.fillStyle = terrain === 'jiajin' ? '#d8c89e' : '#e8c477';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = terrain === 'jiajin' ? .38 : .55;
    scene.stars.forEach((star) => {
      const twinkle = .35 + .35 * Math.sin(time * .0012 + star.phase);
      ctx.fillStyle = `rgba(245,232,197,${twinkle})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.restore();

    if (['chishui', 'jinsha', 'dadu'].includes(terrain)) {
      ctx.fillStyle = 'rgba(28,64,72,.36)';
      ctx.fillRect(0, 390, 960, 150);
      for (let i = 0; i < 12; i++) {
        const y = 405 + i * 11;
        ctx.strokeStyle = `rgba(150,195,192,${.035 + i * .004})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -40; x < 1000; x += 70) {
          const yy = y + Math.sin((x + time * .05 + i * 35) * .025) * 2;
          if (x === -40) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }

    if (terrain === 'jiajin') {
      for (let i = 0; i < 45; i++) {
        const x = (i * 73 + time * (.016 + (i % 5) * .004)) % 980 - 10;
        const y = (i * 37 + time * (.023 + (i % 4) * .005)) % 500;
        ctx.fillStyle = `rgba(247,250,248,${.18 + (i % 3) * .08})`;
        ctx.beginPath(); ctx.arc(x, y, .7 + (i % 3) * .5, 0, Math.PI * 2); ctx.fill();
      }
    }

    drawMountains(ctx, palette, terrain, time);
    const fog = ctx.createLinearGradient(0, 250, 0, 430);
    fog.addColorStop(0, 'rgba(0,0,0,0)');
    fog.addColorStop(1, palette.fog || 'rgba(0,0,0,.2)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 250, 960, 190);
    ctx.fillStyle = palette.ground;
    ctx.beginPath();
    ctx.moveTo(0, 432);
    ctx.lineTo(960, 420);
    ctx.lineTo(960, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();
  }

  function drawMountains(ctx, palette, terrain, time) {
    ctx.save();
    ctx.fillStyle = palette.far;
    ctx.globalAlpha = .75;
    ctx.beginPath();
    ctx.moveTo(-40, 410);
    ctx.lineTo(80, 250); ctx.lineTo(180, 390); ctx.lineTo(300, 205);
    ctx.lineTo(430, 405); ctx.lineTo(560, 228); ctx.lineTo(690, 410);
    ctx.lineTo(830, 245); ctx.lineTo(1010, 420); ctx.lineTo(1010, 460); ctx.lineTo(-40, 460);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = terrain === 'jiajin' ? '#b7c4c8' : palette.near;
    ctx.globalAlpha = .83;
    ctx.beginPath();
    ctx.moveTo(-20, 440);
    ctx.lineTo(130, 310); ctx.lineTo(250, 420); ctx.lineTo(410, 285);
    ctx.lineTo(550, 437); ctx.lineTo(710, 300); ctx.lineTo(900, 438); ctx.lineTo(980, 438);
    ctx.lineTo(980, 500); ctx.lineTo(-20, 500); ctx.closePath(); ctx.fill();

    if (terrain === 'jiajin') {
      ctx.fillStyle = 'rgba(235,240,238,.7)';
      ctx.beginPath();
      ctx.moveTo(75, 340); ctx.lineTo(130, 310); ctx.lineTo(180, 348);
      ctx.lineTo(350, 330); ctx.lineTo(410, 285); ctx.lineTo(470, 335);
      ctx.lineTo(650, 335); ctx.lineTo(710, 300); ctx.lineTo(770, 343);
      ctx.closePath(); ctx.fill();
    }

    if (terrain === 'grassland') {
      ctx.strokeStyle = 'rgba(91,105,67,.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 80; i++) {
        const x = (i * 57.3) % 960;
        const y = 416 + (i * 31.7) % 105;
        const sway = Math.sin(time * .002 + i) * 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway, y - 13, x + sway * 2, y - 24); ctx.stroke();
      }
    }
    ctx.restore();
    drawLocationScenery(ctx, palette, terrain, time);
  }

  function drawLocationScenery(ctx, palette, terrain, time) {
    ctx.save();
    if (terrain === 'zunyi') {
      ctx.fillStyle = 'rgba(22,12,9,.78)';
      for (let i = 0; i < 11; i++) {
        const x = 32 + i * 82;
        const h = 17 + (i % 3) * 8;
        ctx.fillRect(x, 397 - h, 52, h);
        ctx.beginPath();
        ctx.moveTo(x - 5, 397 - h); ctx.lineTo(x + 26, 384 - h); ctx.lineTo(x + 57, 397 - h);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillRect(584, 348, 44, 58);
      ctx.beginPath(); ctx.moveTo(570, 350); ctx.lineTo(606, 330); ctx.lineTo(642, 350); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(183,44,41,.6)'; ctx.fillRect(602, 356, 5, 24);
    } else if (terrain === 'chishui') {
      ctx.fillStyle = 'rgba(32,20,15,.82)';
      ctx.beginPath(); ctx.moveTo(0, 420); ctx.lineTo(0, 250); ctx.lineTo(190, 322); ctx.lineTo(300, 438); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(960, 420); ctx.lineTo(960, 235); ctx.lineTo(790, 315); ctx.lineTo(690, 438); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(235,198,143,.42)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(185, 314); ctx.quadraticCurveTo(480, 250, 792, 310); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(185, 338); ctx.quadraticCurveTo(480, 278, 792, 335); ctx.stroke();
      for (let i = 0; i < 10; i++) {
        const x = 230 + i * 55; const y = 300 + Math.sin(i / 9 * Math.PI) * -23;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 27); ctx.stroke();
      }
    } else if (terrain === 'jinsha') {
      ctx.fillStyle = 'rgba(218,194,142,.18)';
      ctx.beginPath(); ctx.ellipse(300, 414, 145, 12, -.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(720, 432, 190, 15, .05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(15,9,7,.88)';
      ctx.beginPath(); ctx.moveTo(420, 394); ctx.quadraticCurveTo(480, 414, 548, 394); ctx.lineTo(532, 402); ctx.quadraticCurveTo(480, 420, 435, 402); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(238,206,150,.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(472, 398); ctx.lineTo(492, 365); ctx.stroke();
    } else if (terrain === 'dadu') {
      ctx.fillStyle = 'rgba(34,20,17,.9)';
      ctx.beginPath(); ctx.moveTo(0, 455); ctx.lineTo(0, 168); ctx.lineTo(155, 240); ctx.lineTo(280, 456); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(960, 455); ctx.lineTo(960, 150); ctx.lineTo(810, 232); ctx.lineTo(690, 456); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(224,188,128,.48)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(180, 318); ctx.quadraticCurveTo(480, 285, 790, 318); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(180, 343); ctx.quadraticCurveTo(480, 327, 790, 343); ctx.stroke();
      for (let i = 0; i < 14; i++) {
        const x = 210 + i * 42; const y = 305 + Math.sin(i / 13 * Math.PI) * -14;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 38); ctx.stroke();
      }
    } else if (terrain === 'jiajin') {
      ctx.globalAlpha = .72; ctx.fillStyle = 'rgba(239,244,240,.9)';
      ctx.beginPath(); ctx.moveTo(60, 375); ctx.lineTo(180, 230); ctx.lineTo(270, 320); ctx.lineTo(360, 208); ctx.lineTo(455, 330); ctx.lineTo(590, 205); ctx.lineTo(700, 322); ctx.lineTo(820, 235); ctx.lineTo(940, 376); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = .32;
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = 'rgba(235,245,245,.6)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(80 + i * 190, 455); ctx.lineTo(350 + i * 120, 412); ctx.stroke();
      }
    } else if (terrain === 'grassland') {
      ctx.fillStyle = 'rgba(75,92,57,.34)'; ctx.fillRect(0, 390, 960, 80);
      ctx.strokeStyle = 'rgba(120,155,139,.3)'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(-30, 418 + i * 17); ctx.bezierCurveTo(220, 380 + i * 20, 660, 465 - i * 8, 990, 414 + i * 14); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(173,160,102,.42)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 45; i++) {
        const x = (i * 57) % 960; const y = 420 + (i * 29) % 96; const sway = Math.sin(i * .9) * 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway, y - 10, x + sway * 2, y - 20); ctx.stroke();
      }
    } else if (terrain === 'huining') {
      ctx.strokeStyle = 'rgba(213,180,116,.24)'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(-30, 408 + i * 18); ctx.quadraticCurveTo(390, 360 + i * 20, 990, 420 + i * 14); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(54,32,20,.9)'; ctx.fillRect(744, 324, 42, 82); ctx.fillRect(728, 310, 74, 16);
      ctx.fillStyle = 'rgba(183,44,41,.75)'; ctx.fillRect(762, 286, 4, 25);
      ctx.beginPath(); ctx.moveTo(766, 286); ctx.lineTo(804, 296); ctx.lineTo(766, 307); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  let backgroundCacheScale = 0;

  function backgroundKey(palette, terrain, scale) {
    return `${scale.toFixed(2)}|${terrain}|${palette.skyTop}|${palette.skyBottom}|${palette.ground}|${palette.far}|${palette.near}|${palette.fog || ''}`;
  }

  function getCachedBackground(palette, terrain) {
    const scale = clamp((dom.canvas.width || 960) / 960, 1, 2);
    if (Math.abs(scale - backgroundCacheScale) > .02) {
      backgroundCache.clear();
      backgroundCacheScale = scale;
    }
    const key = backgroundKey(palette, terrain, scale);
    let cached = backgroundCache.get(key);
    if (!cached) {
      cached = document.createElement('canvas');
      cached.width = Math.round(960 * scale);
      cached.height = Math.round(540 * scale);
      const cacheCtx = cached.getContext('2d');
      cacheCtx.setTransform(scale, 0, 0, scale, 0, 0);
      drawBackground(cacheCtx, palette, terrain, 0);
      backgroundCache.set(key, cached);
    }
    return cached;
  }

  function drawBentLimb(ctx, points, color, width, outline = 'rgba(10,7,5,.9)') {
    const traceLimb = () => {
      ctx.beginPath();
      points.forEach((point, index) => { if (index === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]); });
      ctx.stroke();
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (state.performanceMode) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width + 2;
      traceLimb();
      return;
    }
    ctx.strokeStyle = outline;
    ctx.lineWidth = width + 5;
    traceLimb();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    traceLimb();
    if (width >= 6 && !state.performanceMode) {
      ctx.strokeStyle = 'rgba(232,188,126,.22)';
      ctx.lineWidth = Math.max(1.4, width * .2);
      ctx.save();
      ctx.translate(0, -1.1);
      traceLimb();
      ctx.restore();
    }
  }

  function drawWeapon(ctx, hand, tip, kind = 'saber', bright = 0) {
    const dx = tip[0] - hand[0];
    const dy = tip[1] - hand[1];
    const length = Math.max(18, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    let strikeReach = length;
    ctx.save();
    ctx.translate(hand[0], hand[1]);
    ctx.rotate(angle);
    ctx.lineJoin = 'round';
    if (bright > .1) {
      ctx.shadowColor = 'rgba(255,211,126,.9)';
      ctx.shadowBlur = state.performanceMode ? 0 : 16 * bright;
    }
    if (kind === 'spear') {
      ctx.strokeStyle = '#5a3822';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(length - 8, 0); ctx.stroke();
      ctx.strokeStyle = '#b78a4f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-20, -1); ctx.lineTo(length - 14, -1); ctx.stroke();
      ctx.fillStyle = '#d9c39a';
      ctx.strokeStyle = '#17100c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(length - 14, -7); ctx.lineTo(length + 5, 0); ctx.lineTo(length - 14, 7); ctx.lineTo(length - 22, 0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#c43d31';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(length - 25, 0); ctx.lineTo(length - 34, 11); ctx.stroke();
    } else if (kind === 'rifle') {
      const stock = '#552f1d';
      const wood = '#7b4b2c';
      const metal = '#2d2925';
      ctx.fillStyle = stock;
      ctx.strokeStyle = '#120c09';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, -3); ctx.lineTo(-5, -7); ctx.lineTo(4, -5); ctx.lineTo(7, 5); ctx.lineTo(-4, 8); ctx.lineTo(-18, 4);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = wood;
      ctx.fillRect(-2, -3, 24, 6);
      ctx.fillStyle = metal;
      ctx.fillRect(17, -3, Math.max(12, length - 16), 4);
      ctx.fillRect(10, 2, 12, 7);
      ctx.fillStyle = '#b69762';
      ctx.fillRect(4, -7, 10, 3);
      ctx.fillRect(31, -5, 3, 2);
      ctx.fillStyle = '#d4c9ae';
      ctx.fillRect(length - 4, -2, 4, 2);
    } else {
      const dagger = kind === 'dagger';
      ctx.strokeStyle = '#2a1711';
      ctx.lineWidth = dagger ? 5.5 : 6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(3, 0); ctx.stroke();
      ctx.strokeStyle = '#9e6d45';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(1, 0); ctx.stroke();
      ctx.strokeStyle = '#d7b46b';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(4, dagger ? -7 : -8); ctx.lineTo(4, dagger ? 7 : 8); ctx.stroke();
      ctx.fillStyle = '#20201f';
      ctx.fillRect(1, dagger ? -6 : -7, 5, dagger ? 12 : 14);
      const bladeLength = dagger
        ? Math.max(24, Math.min(length * 1.08, 66) - 8)
        : Math.max(56, length * 1.34 - 8);
      strikeReach = bladeLength + 8;
      const bladeHalf = dagger ? 2.8 : 2.45;
      ctx.beginPath();
      ctx.moveTo(8, -bladeHalf);
      ctx.quadraticCurveTo(bladeLength * .62, -bladeHalf * .88, bladeLength - 7, -1.15);
      ctx.lineTo(bladeLength + 9, 0);
      ctx.lineTo(bladeLength - 8, 1.45);
      ctx.quadraticCurveTo(bladeLength * .58, bladeHalf * 1.03, 8, bladeHalf);
      ctx.closePath();
      ctx.fillStyle = bright > .1 ? '#ece7d6' : '#b9b5a8';
      ctx.strokeStyle = 'rgba(20,16,13,.96)';
      ctx.lineWidth = 1.25;
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = bright > .1 ? '#fff9dc' : 'rgba(245,242,226,.82)';
      ctx.lineWidth = .95;
      ctx.beginPath();
      ctx.moveTo(12, -bladeHalf * .42); ctx.quadraticCurveTo(bladeLength * .62, -1.05, bladeLength - 3, -.18); ctx.stroke();
      ctx.strokeStyle = 'rgba(57,48,38,.7)';
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(12, bladeHalf * .35); ctx.quadraticCurveTo(bladeLength * .58, .8, bladeLength - 7, .9); ctx.stroke();
      ctx.strokeStyle = '#b5322c';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-25, 8); ctx.stroke();
      ctx.fillStyle = '#c33d32';
      ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-29, 11); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill();
    }
    if (bright > .1) {
      ctx.globalAlpha = .9 * bright;
      ctx.strokeStyle = '#fff4c7';
      ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(strikeReach - 4, -8 - bright * 4); ctx.lineTo(strikeReach + 5, 0); ctx.lineTo(strikeReach - 4, 8 + bright * 4); ctx.stroke();
      ctx.fillStyle = '#fff8de';
      ctx.beginPath(); ctx.arc(strikeReach, 0, 1.7 + bright * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawSoldier(x, y, index, time, lunge) {
    const ctx = battleContext();
    const combat = state.combat;
    const p = state.player;
    const moveSpeed = Math.hypot(combat?.moveVelocity || 0, combat?.moveVelocityY || 0);
    const walking = moveSpeed > 18 && !combat?.dodge;
    const stride = walking ? Math.sin((combat.stepPhase || 0) + index * .85) * (4.5 + Math.min(3.5, moveSpeed * .008)) : 0;
    const bob = Math.sin(time * .003 + index * 1.7) * 1.3 + (walking ? Math.abs(Math.sin((combat.stepPhase || 0) + index * .85)) * 1.8 : 0);
    const squadColor = p.squadId === 'scout' ? '#c6573b' : p.squadId === 'engineer' ? '#9b7a43' : '#4d8772';
    const broken = !!p.postureBroken;
    const stunned = (p.hitstunUntil || 0) > time;
    const hitRatio = stunned ? clamp((p.hitstunUntil - time) / 220, 0, 1) : 0;
    const hitRecoil = -17 * hitRatio;
    const guardPose = !!combat?.blockHeld || !!(scene.duel && (scene.duel.progress > .42 || scene.duel.grade));
    const guardLunge = !guardPose ? 0 : scene.duel ? clamp((scene.duel.progress - .34) * 170, 0, 64) : 48;
    const attack = scene.playerAttack;
    let poseLunge = lunge;
    let hand = [13, -3];
    let tip = [78, -52];
    let weaponKind = 'saber';
    let bright = scene.lunge > .2 ? .55 : 0;
    let actionPhase = 'idle';
    let phaseT = 0;
    let headOffset = [0, 0];
    let offElbow = [-18, -2];
    let elbowBias = [5, 6];
    let sashDrive = 0;

    if (combat?.holding) {
      const hold = clamp((performance.now() - combat.holdStart) / 700, 0, 1);
      poseLunge = -12 * hold;
      hand = [-8, -13];
      tip = [-50, -61];
      bright = .25 + hold * .75;
      actionPhase = 'charge';
      phaseT = hold;
    } else if (attack?.type === 'shoot') {
      const elapsed = performance.now() - attack.start;
      const total = attack.windup + attack.active + attack.recovery;
      const t = clamp(elapsed / total, 0, 1);
      poseLunge = Math.sin(t * Math.PI) * 9;
      hand = [28, -19];
      tip = [112, -20];
      weaponKind = 'rifle';
      bright = .8;
      actionPhase = 'shoot';
      phaseT = t;
    } else if (attack) {
      const elapsed = performance.now() - attack.start;
      const counterProfile = attack.counterKind ? (PLAYER_COUNTER_PROFILES[attack.counterKind] || [])[(attack.counterStep || 1) - 1] : null;
      const comboProfile = PLAYER_COMBO_PROFILES[attack.comboStage];
      const techniqueProfile = attack.techniqueId ? PLAYER_TECHNIQUES[attack.techniqueId] : null;
      const attackProfile = counterProfile || techniqueProfile || comboProfile;
      if (attackProfile) {
        if (elapsed < attack.windup) {
          const t = clamp(elapsed / attack.windup, 0, 1);
          actionPhase = 'windup'; phaseT = t;
          const recoil = attack.counterKind === 'dodge' && attack.counterStep === 1 ? 24 : attack.comboStage === 2 ? 12 : attack.comboStage === 4 ? -18 : -8;
          poseLunge = recoil * t;
          hand = lerpPoint([13, -3], attackProfile.windupHand, t);
          tip = lerpPoint([78, -52], attackProfile.windupTip, t);
          bright = .38 + t * .62;
        } else if (elapsed < attack.windup + attack.active) {
          const t = clamp((elapsed - attack.windup) / attack.active, 0, 1);
          actionPhase = 'active'; phaseT = t;
          const eased = attack.comboStage === 4 || attack.counterStep > 1 ? 1 - Math.pow(1 - t, 3) : 1 - Math.pow(1 - t, 2);
          poseLunge = attackProfile.lunge * eased;
          hand = lerpPoint(attackProfile.windupHand, attackProfile.strikeHand, eased);
          tip = lerpPoint(attackProfile.windupTip, attackProfile.strikeTip, eased);
          bright = 1;
        } else {
          const t = clamp((elapsed - attack.windup - attack.active) / attack.recovery, 0, 1);
          actionPhase = 'recovery'; phaseT = t;
          const eased = 1 - Math.pow(1 - t, 2);
          poseLunge = attackProfile.lunge * (1 - eased);
          hand = lerpPoint(attackProfile.strikeHand, [13, -3], eased);
          tip = lerpPoint(attackProfile.strikeTip, [78, -52], eased);
          bright = 1 - t;
        }
      } else if (elapsed < attack.windup) {
        const t = clamp(elapsed / attack.windup, 0, 1);
        actionPhase = 'windup'; phaseT = t;
        poseLunge = attack.followup === 'dodge' ? 18 * t : -10 * t;
        hand = lerpPoint([13, -3], [1, -39], t);
        tip = lerpPoint([78, -52], [18, -92], t);
        bright = .35 + t * .65;
      } else if (elapsed < attack.windup + attack.active) {
        const t = clamp((elapsed - attack.windup) / attack.active, 0, 1);
        actionPhase = 'active'; phaseT = t;
        const eased = 1 - Math.pow(1 - t, 2);
        poseLunge = (attack.type === 'thrust' ? 94 : 55) * eased;
        hand = lerpPoint([1, -39], [55, -18], eased);
        tip = lerpPoint([18, -92], [attack.type === 'thrust' ? 158 : 124, -20], eased);
        bright = 1;
      } else {
        const t = clamp((elapsed - attack.windup - attack.active) / attack.recovery, 0, 1);
        actionPhase = 'recovery'; phaseT = t;
        poseLunge = (attack.type === 'thrust' ? 94 : 55) * (1 - t);
        hand = lerpPoint([55, -18], [13, -3], t);
        tip = lerpPoint([attack.type === 'thrust' ? 158 : 124, -20], [78, -52], t);
        bright = 1 - t;
      }
    } else if (scene.mikiri && state.combat?.phase === 'enemy') {
      actionPhase = 'mikiri';
      phaseT = clamp((performance.now() - scene.mikiri.start) / scene.mikiri.duration, 0, 1);
      poseLunge = 8;
      hand = [34, -10];
      tip = [92, 2];
      bright = .75;
    } else if (guardPose) {
      hand = [32, -25];
      tip = [112, -12];
      bright = scene.duel?.grade === 'perfect' ? 1 : .45;
      actionPhase = 'guard';
      phaseT = 1;
    }

    const activeStage = attack?.counterKind ? 3 : attack?.comboStage || 0;
    const sweep = actionPhase === 'active' ? Math.sin(phaseT * Math.PI * .5) : 0;
    const windup = actionPhase === 'windup' ? Math.sin(phaseT * Math.PI * .5) : 0;
    const recover = actionPhase === 'recovery' ? 1 - phaseT : 0;
    const dodgingNow = !!combat?.dodge;
    const dodgeT = dodgingNow ? clamp((performance.now() - combat.dodge.start) / combat.dodge.duration, 0, 1) : 0;
    const dodgeArc = dodgingNow ? Math.sin(dodgeT * Math.PI) : 0;
    let bodyAngle = 0;
    let bodyY = 0;
    let leadKnee = [15, 23];
    let leadFoot = [23 + stride, 42];
    let rearKnee = [-18, 23];
    let rearFoot = [-25 - stride, 42];
    let offHand = [-21, 4];
    if (dodgingNow) {
      const rawDodgeDir = combat.dodge.direction || 0;
      const dodgeDir = rawDodgeDir || 1;
      const verticalDodge = combat.dodge.verticalDirection || 0;
      bodyAngle = (-rawDodgeDir * .42 + verticalDodge * .13) * dodgeArc;
      bodyY = -13 * dodgeArc + verticalDodge * 4 * dodgeArc;
      leadKnee = [dodgeDir * 18, 10];
      leadFoot = [dodgeDir * 41, 27 + verticalDodge * 6];
      rearKnee = [-dodgeDir * 27, 15];
      rearFoot = [-dodgeDir * 51, 26 - verticalDodge * 5];
      offHand = [-dodgeDir * 43, -23 - verticalDodge * 6];
      offElbow = [-dodgeDir * 42, -9];
      elbowBias = [-dodgeDir * 11, -4];
      headOffset = [dodgeDir * 4, -3];
      sashDrive = -dodgeDir;
    } else if (actionPhase === 'active') {
      if (attack?.type === 'thrust') {
        bodyAngle = .34;
        bodyY = 2;
        leadKnee = [31, 13];
        leadFoot = [64, 35];
        rearKnee = [-29, 24];
        rearFoot = [-58, 44];
        offHand = [-49, 4];
        offElbow = [-37, -4];
        elbowBias = [14, -2];
        headOffset = [5, 0];
        sashDrive = 1;
      } else if (attack?.techniqueId) {
        if (attack.techniqueId === 'whirlwind') {
          bodyAngle = .62;
          bodyY = -7 * sweep;
          leadKnee = [31, 16];
          leadFoot = [69, 34];
          rearKnee = [-34, 25];
          rearFoot = [-67, 42];
          offHand = [42 - sweep * 35, -25];
          offElbow = [28, -12];
          elbowBias = [-18, -7];
          headOffset = [5, -3];
          sashDrive = 1.45;
        } else if (attack.techniqueId === 'breach' || attack.techniqueId === 'crosscut') {
          bodyAngle = .48;
          bodyY = 2;
          leadKnee = [38, 12];
          leadFoot = [78 + sweep * 8, 32];
          rearKnee = [-31, 26];
          rearFoot = [-65, 46];
          offHand = [-56, 3];
          offElbow = [-42, -4];
          elbowBias = [16, -5];
          headOffset = [7, 0];
          sashDrive = 1.3;
        } else {
          bodyAngle = -.18;
          bodyY = 5 * sweep;
          leadKnee = [17, 27];
          leadFoot = [30, 46];
          rearKnee = [-31, 20];
          rearFoot = [-51, 36];
          offHand = [-32, -20];
          offElbow = [-25, -11];
          elbowBias = [4, 3];
          headOffset = [-3, 2];
          sashDrive = -.45;
        }
      } else if (activeStage === 5) {
        bodyAngle = .22;
        bodyY = -3 * sweep;
        leadKnee = [24, 18];
        leadFoot = [47 + sweep * 8, 40];
        rearKnee = [-25, 25];
        rearFoot = [-42 - sweep * 6, 43];
        offHand = [-30 - sweep * 8, -8];
        offElbow = [-27, -5];
        elbowBias = [7, -3];
        headOffset = [3, -1];
        sashDrive = .7;
      } else if (activeStage === 4) {
        bodyAngle = .39;
        bodyY = -6 * sweep;
        leadKnee = [29, 16];
        leadFoot = [57 + sweep * 10, 42];
        rearKnee = [-27, 26];
        rearFoot = [-51 - sweep * 8, 45];
        offHand = [-44 - sweep * 12, -8 - sweep * 8];
        offElbow = [-34, -12];
        elbowBias = [-12, -5];
        headOffset = [4, -1];
        sashDrive = 1.1;
      } else if (activeStage === 3) {
        bodyAngle = .37;
        bodyY = -4 * sweep;
        leadKnee = [27, 16];
        leadFoot = [56 + sweep * 10, 41];
        rearKnee = [-27, 23];
        rearFoot = [-48 - sweep * 6, 40];
        offHand = [-48 - sweep * 18, -15];
        offElbow = [-38, -9];
        elbowBias = [-14, -2];
        headOffset = [3, -2];
        sashDrive = .9;
      } else {
        bodyAngle = activeStage === 2 ? .29 : .25;
        bodyY = -4 * sweep;
        leadKnee = [24, 17];
        leadFoot = [45 + sweep * 13, 40];
        rearKnee = [-25, 25];
        rearFoot = [-44 - sweep * 9, 43];
        offHand = activeStage === 2 ? [28, -24] : [-39 - sweep * 13, 2 + sweep * 6];
        offElbow = activeStage === 2 ? [18, -10] : [-31, -4];
        elbowBias = activeStage === 2 ? [-4, -7] : [9, -2];
        headOffset = [3, -1];
        sashDrive = .8;
      }
    } else if (actionPhase === 'windup') {
      bodyAngle = attack?.type === 'thrust' ? -.34 : activeStage === 2 ? .18 : activeStage === 4 ? -.33 : activeStage === 5 ? -.15 : activeStage === 3 ? -.2 : -.2;
      bodyY = 7 * windup;
      leadKnee = [18, 28];
      leadFoot = [29, 45];
      rearKnee = [-25, 20];
      rearFoot = [-37, 39];
      offHand = activeStage === 2 ? [17, -29] : activeStage === 5 ? [-26, -14] : [-38, -18 - windup * 12];
      offElbow = activeStage === 2 ? [9, -13] : [-27, -15];
      elbowBias = activeStage === 3 ? [-12, 1] : activeStage === 4 ? [-8, -3] : [10, 7];
      headOffset = [-2, 2];
      sashDrive = -.65;
    } else if (actionPhase === 'recovery') {
      bodyAngle = (activeStage === 4 ? .2 : activeStage === 3 ? .15 : activeStage === 5 ? .08 : .1) * recover;
      bodyY = 4 * recover;
      leadKnee = [21, 25];
      leadFoot = [35, 43];
      rearKnee = [-24, 24];
      rearFoot = [-48, 44];
      offHand = [-35, 1];
      offElbow = [-28, 1];
      elbowBias = [5, 7];
      headOffset = [1, 1];
      sashDrive = .35 * recover;
    } else if (actionPhase === 'charge') {
      bodyAngle = -.3;
      bodyY = 8;
      leadKnee = [22, 28];
      leadFoot = [37, 45];
      rearKnee = [-27, 21];
      rearFoot = [-47, 40];
      offHand = [-43, -23];
      offElbow = [-32, -15];
      elbowBias = [11, 7];
      headOffset = [-3, 2];
      sashDrive = -.8;
    } else if (actionPhase === 'mikiri') {
      bodyAngle = .24;
      bodyY = 6;
      leadKnee = [35, 12];
      leadFoot = [66, 39];
      rearKnee = [-27, 26];
      rearFoot = [-48, 45];
      offHand = [-37, -7];
      offElbow = [-30, -9];
      elbowBias = [12, -2];
      headOffset = [4, 1];
      sashDrive = .9;
    } else if (actionPhase === 'guard') {
      bodyAngle = -.14;
      bodyY = 7;
      leadKnee = [24, 27];
      leadFoot = [42, 44];
      rearKnee = [-27, 27];
      rearFoot = [-48, 45];
      offHand = [22, -15];
      offElbow = [12, -8];
      elbowBias = [-9, 6];
      headOffset = [-2, 2];
      sashDrive = -.4;
    } else if (actionPhase === 'shoot') {
      bodyAngle = -.16;
      bodyY = 3;
      leadKnee = [23, 25];
      leadFoot = [42, 42];
      rearKnee = [-25, 25];
      rearFoot = [-44, 43];
      offHand = [29, -25];
      offElbow = [18, -10];
      elbowBias = [-4, 4];
      headOffset = [-2, 1];
      sashDrive = -.3;
    } else if (walking) {
      bodyAngle = (combat.moveVelocity / PLAYER_SPEED) * .14;
      bodyY = Math.abs(Math.sin(combat.stepPhase)) * 1.3;
      rearKnee = [-18, 21 + Math.sin(combat.stepPhase) * 5];
      rearFoot = [-30 - stride * 2, 41];
      leadKnee = [16, 21 - Math.sin(combat.stepPhase) * 5];
      leadFoot = [28 + stride * 2, 41];
      offHand = [-24, 3 + Math.sin(combat.stepPhase) * 8];
      offElbow = [-20, -1];
      sashDrive = .24;
    }

    const jumpOffset = combat?.jumpHeight || 0;
    ctx.save();
    ctx.translate(x + poseLunge + guardLunge + hitRecoil, y + bob + bodyY + (broken ? 9 : 0) - jumpOffset);
    ctx.scale(1.22, 1.22);
    if (!broken) {
      if (stunned) ctx.rotate(-.15 * hitRatio);
      else ctx.rotate(bodyAngle);
    }

    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(0, 44 + jumpOffset, 35, 10, 0, 0, Math.PI * 2); ctx.fill();

    if (broken) {
      ctx.rotate(-.2);
      drawBentLimb(ctx, [[-6, 7], [-24, 24], [-7, 37]], '#17100d', 8);
      drawBentLimb(ctx, [[8, 7], [22, 25], [31, 39]], '#17100d', 8);
      ctx.fillStyle = '#1a1310';
      ctx.strokeStyle = 'rgba(6,4,3,.95)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-16, -16); ctx.lineTo(17, -6); ctx.lineTo(12, 18); ctx.lineTo(-13, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      drawBentLimb(ctx, [[-10, -10], [-25, 1], [-20, 17]], '#17100d', 5);
      drawBentLimb(ctx, [[13, -6], [25, 2], [24, 16]], '#17100d', 5);
      drawWeapon(ctx, [24, 14], [38, 58], 'saber', 0);
      ctx.fillStyle = '#1a1310';
      ctx.beginPath(); ctx.arc(-5, -30, 10.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1a13';
      ctx.fillRect(-17, -42, 24, 6);
      ctx.strokeStyle = squadColor; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-14, -20); ctx.quadraticCurveTo(-5, -12, 12, -21); ctx.stroke();
      ctx.fillStyle = '#e8c477'; ctx.font = canvasFont(12, 'serif', 'bold'); ctx.fillText('★', -12, -25);
      ctx.restore();
      return;
    }

    drawBentLimb(ctx, [[-7, 6], rearKnee, rearFoot], '#2e1e18', 10);
    drawBentLimb(ctx, [[7, 6], leadKnee, leadFoot], '#33221a', 10);
    if (!state.performanceMode) {
      ctx.fillStyle = '#5a3a27';
      ctx.beginPath(); ctx.arc(rearKnee[0], rearKnee[1], 5.2, 0, Math.PI * 2); ctx.arc(leadKnee[0], leadKnee[1], 5.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#241711'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rearFoot[0], rearFoot[1]); ctx.lineTo(rearFoot[0] - 11, rearFoot[1] + 2); ctx.moveTo(leadFoot[0], leadFoot[1]); ctx.lineTo(leadFoot[0] + 11, leadFoot[1] + 2); ctx.stroke();

    const sashWave = Math.sin(time * .012) * 2.5;
    ctx.save();
    ctx.strokeStyle = squadColor;
    ctx.globalAlpha = .92;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.bezierCurveTo(-20 - sashDrive * 8, 2 + sashWave, -30 - sashDrive * 15, 9 - sashWave, -42 - sashDrive * 20, 20 + sashWave);
    ctx.stroke();
    if (!state.performanceMode) {
      ctx.strokeStyle = 'rgba(255,224,154,.34)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#1a1310';
    ctx.strokeStyle = 'rgba(6,4,3,.95)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-16, -18); ctx.lineTo(15, -18); ctx.lineTo(12, 10); ctx.lineTo(-11, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a1a13'; ctx.fillRect(-17, -12, 33, 7);
    ctx.fillStyle = '#493126'; ctx.fillRect(-15, -17, 5, 24);

    drawBentLimb(ctx, [[-11, -14], offElbow, offHand], '#2e1e18', actionPhase === 'guard' ? 9 : 8);
    const elbow = [(11 + hand[0]) / 2 + elbowBias[0], (-14 + hand[1]) / 2 + elbowBias[1]];
    drawBentLimb(ctx, [[11, -14], elbow, hand], '#33221a', actionPhase === 'active' ? 10.5 : 8.5);
    if (!state.performanceMode) {
      ctx.fillStyle = '#a77852';
      ctx.beginPath(); ctx.arc(offHand[0], offHand[1], 3.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a3a27'; ctx.beginPath(); ctx.arc(elbow[0], elbow[1], 4.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a77852'; ctx.beginPath(); ctx.arc(hand[0], hand[1], 3.8, 0, Math.PI * 2); ctx.fill();
    }
    drawWeapon(ctx, hand, tip, weaponKind, bright);

    ctx.fillStyle = '#1a1310';
    ctx.beginPath(); ctx.arc(-1 + headOffset[0], -34 + headOffset[1], 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1a13';
    ctx.fillRect(-14 + headOffset[0], -47 + headOffset[1], 25, 6);
    ctx.fillRect(-6 + headOffset[0], -51 + headOffset[1], 14, 5);
    ctx.strokeStyle = squadColor; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-13, -23); ctx.quadraticCurveTo(-2, -16, 15, -24); ctx.stroke();
    if (state.performanceMode) { ctx.fillStyle = '#e8c477'; ctx.fillRect(-11 + headOffset[0], -31 + headOffset[1], 5, 5); }
    else { ctx.fillStyle = '#e8c477'; ctx.font = canvasFont(14, 'serif', 'bold'); ctx.fillText('★', -10 + headOffset[0], -28 + headOffset[1]); }
    ctx.restore();
  }

  function duelLungeDistance(progress) {
    if (!Number.isFinite(progress)) return 0;
    if (progress < .18) return 0;
    if (progress < .54) {
      const t = clamp((progress - .18) / .36, 0, 1);
      return (t * t * (3 - 2 * t)) * 54;
    }
    const t = clamp((progress - .54) / .46, 0, 1);
    const eased = 1 - Math.pow(1 - t, 2);
    return (1 - eased) * 54;
  }

  function drawEnemyFigure(enemy, index, time) {
    const ctx = battleContext();
    if (enemy.dead) return;
    const pos = enemyCanvasPosition(index);
    const hit = scene.enemyHit[index] || 0;
    const hitRatio = clamp(hit / .25, 0, 1);
    const hitShake = hit > 0 ? (Math.random() - .5) * 10 * hitRatio : 0;
    const awayFromPlayer = pos.x >= playerCenterX() ? 1 : -1;
    const hitRecoil = hitRatio * 16 * awayFromPlayer;
    const bob = Math.sin(time * .0027 + index * 2.1) * 2;
    const scale = enemy.scale;
    const isBoss = enemy.boss;
    const duel = scene.duel && scene.duel.enemyIndex === index ? scene.duel : null;
    const mikiri = scene.mikiri && scene.mikiri.enemyIndex === index ? scene.mikiri : null;
    const progress = duel ? clamp(duel.progress, 0, 1) : 0;
    const lungeIn = duel ? duelLungeDistance(progress) : 0;
    const meleeIntent = !duel && ['attack', 'quick', 'combo', 'thrust', 'heavy', 'siege', 'whirlwind', 'blinkSlash', 'slowFast'].includes(enemy.intent?.type);

    const aiming = !duel && ['shot', 'backstepShot'].includes(enemy.intent?.type);
    let enemyBodyAngle = 0;
    let enemyBodyY = 0;
    let enemyLeadKnee = [-17, 27];
    let enemyLeadFoot = [-31, 48];
    let enemyRearKnee = [19, 27];
    let enemyRearFoot = [34, 48];
    let enemyOffHand = [-34, 8];
    let enemyOffElbow = [-31, -2];
    let enemyElbowBias = [-10, 8];
    let enemyHeadOffset = [0, 0];
    if (mikiri) {
      const t = clamp((performance.now() - mikiri.start) / mikiri.duration, 0, 1);
      enemyBodyAngle = .2 + Math.sin(t * Math.PI) * .1;
      enemyBodyY = 7;
      enemyLeadKnee = [-27, 25];
      enemyLeadFoot = [-48, 46];
      enemyRearKnee = [26, 28];
      enemyRearFoot = [47, 49];
      enemyOffHand = [-42, -10];
      enemyHeadOffset = [-3, 3];
    } else if (enemy.status.broken) {
      enemyBodyY = 11;
      enemyHeadOffset = [4, 5];
    } else if (duel) {
      if (progress < .38) {
        const t = clamp(progress / .38, 0, 1);
        enemyBodyAngle = .34 * t;
        enemyBodyY = 8 * t;
        enemyLeadKnee = [-24, 25];
        enemyLeadFoot = [-40 - t * 5, 46];
        enemyRearKnee = [22, 22];
        enemyRearFoot = [42 + t * 4, 42];
        enemyOffHand = [-43, -19 - t * 14];
        enemyOffElbow = [-40, -12];
        enemyHeadOffset = [-2, 2];
      } else if (progress < .72) {
        const t = clamp((progress - .38) / .34, 0, 1);
        enemyBodyAngle = .34 - .65 * t;
        enemyBodyY = -7 * Math.sin(t * Math.PI);
        enemyLeadKnee = [-31, 21];
        enemyLeadFoot = [-51 - t * 13, 46];
        enemyRearKnee = [27, 24];
        enemyRearFoot = [43 + t * 12, 47];
        enemyOffHand = [-52 - t * 19, -17];
        enemyOffElbow = [-47 - t * 13, -9];
        enemyHeadOffset = [-2 + t * 6, -1];
      } else {
        const t = clamp((progress - .72) / .28, 0, 1);
        enemyBodyAngle = -.31 * (1 - t);
        enemyBodyY = 3 * t;
        enemyLeadKnee = [-29, 26];
        enemyLeadFoot = [-49, 47];
        enemyRearKnee = [24, 27];
        enemyRearFoot = [43, 48];
        enemyOffHand = [-38, 0];
        enemyOffElbow = [-33, 1];
      }
    } else if (enemy.action === 'backstep') {
      enemyBodyAngle = -.24;
      enemyBodyY = -6;
      enemyLeadKnee = [-22, 18];
      enemyLeadFoot = [-55, 42];
      enemyRearKnee = [25, 22];
      enemyRearFoot = [50, 43];
      enemyOffHand = [-48, -20];
      enemyHeadOffset = [4, -3];
    } else if (enemy.action === 'thrustWindup') {
      enemyBodyAngle = .25;
      enemyBodyY = 8;
      enemyLeadKnee = [-30, 27];
      enemyLeadFoot = [-52, 47];
      enemyRearKnee = [28, 22];
      enemyRearFoot = [49, 41];
      enemyOffHand = [-50, -7];
      enemyOffElbow = [-39, -3];
      enemyHeadOffset = [-2, 2];
    } else if (enemy.action === 'cleaveWindup') {
      enemyBodyAngle = -.34;
      enemyBodyY = 6;
      enemyLeadKnee = [-25, 24];
      enemyLeadFoot = [-48, 46];
      enemyRearKnee = [27, 25];
      enemyRearFoot = [50, 47];
      enemyOffHand = [-52, -22];
      enemyHeadOffset = [3, 2];
    } else if (enemy.action === 'block') {
      enemyBodyAngle = .08;
      enemyBodyY = 3;
      enemyLeadKnee = [-22, 25];
      enemyLeadFoot = [-42, 47];
      enemyRearKnee = [23, 25];
      enemyRearFoot = [43, 47];
      enemyOffHand = [-34, -16];
      enemyElbowBias = [-16, -8];
      enemyHeadOffset = [-1, 1];
    } else if (enemy.action === 'advanceWindup') {
      enemyBodyAngle = -.32;
      enemyBodyY = -5;
      enemyLeadKnee = [-32, 18];
      enemyLeadFoot = [-61, 40];
      enemyRearKnee = [29, 23];
      enemyRearFoot = [55, 44];
      enemyOffHand = [-52, -12];
      enemyHeadOffset = [5, -2];
    } else if (enemy.action === 'feintDash') {
      enemyBodyAngle = Math.sin(time * .025) * .22;
      enemyBodyY = -4;
      enemyLeadKnee = [-27, 19];
      enemyLeadFoot = [-52, 41];
      enemyRearKnee = [25, 20];
      enemyRearFoot = [49, 42];
      enemyOffHand = [-44, -16];
      enemyHeadOffset = [Math.sin(time * .025) * 4, -1];
    } else if (enemy.action === 'aimWindup') {
      enemyBodyAngle = .16;
      enemyBodyY = 5;
      enemyLeadKnee = [-24, 25];
      enemyLeadFoot = [-46, 46];
      enemyRearKnee = [25, 25];
      enemyRearFoot = [46, 46];
      enemyOffHand = [-26, -17];
      enemyHeadOffset = [-2, 1];
    } else if (enemy.action === 'blink') {
      enemyBodyAngle = -.34;
      enemyBodyY = -8;
      enemyLeadKnee = [-28, 18];
      enemyLeadFoot = [-54, 39];
      enemyRearKnee = [26, 19];
      enemyRearFoot = [49, 40];
      enemyOffHand = [-48, -19];
      enemyHeadOffset = [3, -2];
    } else if (enemy.action === 'dash') {
      enemyBodyAngle = -.21;
      enemyBodyY = -3;
      enemyLeadKnee = [-24, 22];
      enemyLeadFoot = [-46, 43];
      enemyRearKnee = [25, 22];
      enemyRearFoot = [47, 43];
      enemyOffHand = [-40, -4];
    } else if (enemy.action === 'breathe') {
      enemyBodyAngle = .11 + .035 * Math.sin(time * .004);
      enemyBodyY = 10;
      enemyLeadKnee = [-27, 29];
      enemyLeadFoot = [-45, 49];
      enemyRearKnee = [26, 29];
      enemyRearFoot = [45, 49];
      enemyOffHand = [-27, 1];
      enemyOffElbow = [-25, 3];
      enemyHeadOffset = [-2, 4];
    } else if (enemy.action === 'stagger') {
      enemyBodyAngle = -.21;
      enemyBodyY = 6;
      enemyLeadFoot = [-43, 48];
      enemyRearFoot = [40, 48];
      enemyOffHand = [-39, -5];
      enemyHeadOffset = [2, 3];
    } else if (aiming) {
      enemyBodyAngle = .13;
      enemyBodyY = 4;
      enemyLeadKnee = [-23, 24];
      enemyLeadFoot = [-45, 45];
      enemyRearKnee = [24, 24];
      enemyRearFoot = [44, 45];
      enemyOffHand = [-27, -15];
      enemyHeadOffset = [-1, 1];
    }
    if (duel?.style === 'whirlwind') {
      const spin = Math.sin(progress * Math.PI * 4);
      enemyBodyAngle += spin * (progress > .42 && progress < .73 ? .15 : .06);
      enemyBodyY -= Math.abs(spin) * 4;
      enemyLeadFoot[0] -= Math.abs(spin) * 9;
      enemyRearFoot[0] += Math.abs(spin) * 9;
      enemyHeadOffset[0] += spin * 2;
    }
    if (duel?.thrust) {
      if (progress < .34) {
        const t = clamp((progress - .1) / .24, 0, 1);
        enemyBodyAngle = .12 + .2 * t;
        enemyBodyY = 7 * t;
      } else if (progress < .68) {
        const t = clamp((progress - .5) / .18, 0, 1);
        enemyBodyAngle = -.34 * t;
        enemyBodyY = -5 * Math.sin(t * Math.PI);
        enemyLeadKnee = [-35, 17];
        enemyLeadFoot = [-64 - t * 12, 40];
        enemyRearKnee = [29, 27];
        enemyRearFoot = [53, 48];
        enemyOffHand = [-51, -5];
        enemyHeadOffset = [4, -1];
      }
    }
    if (duel?.style === 'blinkSlash' && progress >= .3 && progress < .72) {
      enemyBodyAngle -= .1;
      enemyLeadFoot[0] -= 8;
      enemyRearFoot[0] += 6;
      enemyHeadOffset[0] -= 2;
    }
    let hand = [-22, -3];
    let tip = [-55, -60];
    let weaponKind = enemy.weaponKind || 'saber';
    if (!duel && (enemy.action === 'blink' || enemy.action === 'dash' || enemy.action === 'backstep' || enemy.action === 'advanceWindup' || enemy.action === 'feintDash' || enemy.action === 'retreat' || enemy.action === 'collapse' || enemy.action === 'patrol')) {
      const blinking = enemy.action === 'blink';
      ctx.save();
      ctx.globalAlpha = blinking ? .82 : enemy.action === 'dash' || enemy.action === 'backstep' || enemy.action === 'advanceWindup' ? .52 : .24;
      ctx.strokeStyle = blinking ? '#ffb078' : enemy.status.broken ? '#ffe0a0' : '#d9b978';
      ctx.shadowColor = blinking ? '#ff6f4f' : 'transparent';
      ctx.shadowBlur = blinking && !state.performanceMode ? 16 : 0;
      ctx.lineWidth = blinking ? 3 : 2;
      const direction = (state.combat?.playerX ?? 360) < enemy.x ? 1 : -1;
      const trailCount = blinking ? 9 : 5;
      for (let i = 0; i < trailCount; i++) {
        const yy = pos.y - 82 + i * (blinking ? 13 : 21);
        ctx.beginPath();
        ctx.moveTo(pos.x + direction * (26 + i * 4), yy);
        ctx.lineTo(pos.x + direction * (92 + i * (blinking ? 20 : 15)), yy + (blinking ? 5 : 1));
        ctx.stroke();
      }
      ctx.fillStyle = blinking ? 'rgba(240,105,72,.22)' : 'rgba(200,171,116,.18)';
      for (let i = 0; i < (blinking ? 6 : 3); i++) {
        ctx.beginPath();
        ctx.arc(pos.x - direction * (10 + i * 14), pos.y + 34 - i * 5, 10 + i * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (duel) {
      if (duel.style === 'whirlwind') {
        if (progress < .42) {
          const t = clamp(progress / .42, 0, 1);
          hand = lerpPoint([-22, -3], [10, -43], t);
          tip = lerpPoint([-55, -60], [64, -139], t);
        } else if (progress < .73) {
          const t = clamp((progress - .42) / .31, 0, 1);
          const angle = -1.86 + t * 3.55;
          hand = lerpPoint([10, -43], [-31, -22], t);
          tip = [Math.cos(angle) * 154, -48 + Math.sin(angle) * 84];
        } else {
          const t = clamp((progress - .73) / .27, 0, 1);
          hand = lerpPoint([-31, -22], [-22, -3], t);
          tip = lerpPoint([-139, -33], [-55, -60], t);
        }
      } else if (duel.style === 'blinkSlash') {
        if (progress < .42) {
          const t = clamp(progress / .42, 0, 1);
          hand = lerpPoint([-22, -3], [30, -18], t);
          tip = lerpPoint([-55, -60], [-112, -96], t);
        } else if (progress < .72) {
          const t = clamp((progress - .42) / .30, 0, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          hand = lerpPoint([30, -18], [-34, -35], eased);
          tip = lerpPoint([-112, -96], [-166, 30], eased);
        } else {
          const t = clamp((progress - .72) / .28, 0, 1);
          hand = lerpPoint([-34, -35], [-22, -3], t);
          tip = lerpPoint([-166, 30], [-55, -60], t);
        }
      } else if (duel.style === 'slowFast') {
        if (duel.comboStep === 2) {
          if (progress < .43) {
            const t = clamp(progress / .43, 0, 1);
            hand = lerpPoint([16, -33], [31, -17], t);
            tip = lerpPoint([44, -92], [112, -16], t);
          } else if (progress < .72) {
            const t = clamp((progress - .43) / .29, 0, 1);
            const eased = 1 - Math.pow(1 - t, 2);
            hand = lerpPoint([31, -17], [-34, -24], eased);
            tip = lerpPoint([112, -16], [-154, -52], eased);
          } else {
            const t = clamp((progress - .72) / .28, 0, 1);
            hand = lerpPoint([-34, -24], [-22, -3], t);
            tip = lerpPoint([-154, -52], [-55, -60], t);
          }
        } else if (progress < .5) {
          const t = clamp(progress / .5, 0, 1);
          hand = lerpPoint([-22, -3], [2, -53], t);
          tip = lerpPoint([-55, -60], [35, -145], t);
        } else if (progress < .75) {
          const t = clamp((progress - .5) / .25, 0, 1);
          const eased = 1 - Math.pow(1 - t, 2);
          hand = lerpPoint([2, -53], [-38, -21], eased);
          tip = lerpPoint([35, -145], [-144, -28], eased);
        } else {
          const t = clamp((progress - .75) / .25, 0, 1);
          hand = lerpPoint([-38, -21], [-22, -3], t);
          tip = lerpPoint([-144, -28], [-55, -60], t);
        }
      } else if (duel.thrust) {
        if (progress < .1) {
          hand = [-22, -3];
          tip = [-55, -60];
        } else if (progress < .34) {
          const t = (progress - .1) / .24;
          hand = lerpPoint([-22, -3], [18, -38], t);
          tip = lerpPoint([-55, -60], [78, -42], t);
        } else if (progress < .5) {
          const tremble = Math.sin(performance.now() * .052) * 2.5;
          hand = [16 + tremble, -37];
          tip = [76 + tremble, -41];
        } else if (progress < .68) {
          const t = (progress - .5) / .18;
          const eased = 1 - Math.pow(1 - t, 3);
          hand = lerpPoint([16, -37], [-24, -34], eased);
          tip = lerpPoint([76, -41], [-172, -34], eased);
        } else {
          const t = (progress - .68) / .32;
          hand = lerpPoint([-24, -34], [-22, -3], t);
          tip = lerpPoint([-172, -34], [-55, -60], t);
        }
      } else if (progress < .1) {
        hand = [-22, -3];
        tip = [-55, -60];
      } else if (progress < .34) {
        const t = (progress - .1) / .24;
        hand = lerpPoint([-22, -3], [-2, -38], t);
        tip = lerpPoint([-55, -60], [8, -94], t);
      } else if (progress < .5) {
        const tremble = Math.sin(performance.now() * .045) * 4;
        hand = [2 + tremble, -52];
        tip = [32 + tremble, -125];
      } else if (progress < .68) {
        const t = (progress - .5) / .18;
        const eased = 1 - Math.pow(1 - t, 2);
        hand = lerpPoint([2, -52], [-38, -22], eased);
        tip = lerpPoint([32, -125], [-138, -28], eased);
      } else {
        const t = (progress - .68) / .32;
        hand = lerpPoint([-38, -22], [-22, -3], t);
        tip = lerpPoint([-138, -28], [-55, -60], t);
      }
    } else if (aiming || (enemy.eliteStyle === 'rifle' && !duel)) {
      hand = [-16, -27];
      tip = [-104, -28];
      weaponKind = 'rifle';
    }
    if (!duel && enemy.action === 'thrustWindup') {
      hand = [-15, -32];
      tip = [-122, -20];
    } else if (!duel && enemy.action === 'cleaveWindup') {
      hand = [-20, -49];
      tip = [-102, -151];
    } else if (!duel && enemy.action === 'advanceWindup') {
      hand = [-11, -37];
      tip = [-92, -91];
    } else if (!duel && enemy.action === 'feintDash') {
      hand = [-7, -30];
      tip = [-82, -76];
    }
    if (mikiri) {
      const t = clamp((performance.now() - mikiri.start) / mikiri.duration, 0, 1);
      hand = [-5 - t * 8, -18];
      tip = [-124 - t * 18, -7 + Math.sin(t * Math.PI) * 7];
    }
    if (enemy.status.broken) {
      hand = [17, 10];
      tip = [31, 59];
      weaponKind = enemy.weaponKind || 'saber';
    }
    const cueGlint = duel && duel.cueUntil > performance.now()
      ? clamp((duel.cueUntil - performance.now()) / 170, 0, 1)
      : 0;
    const baseGlint = aiming
      ? .72
      : duel && progress >= .18 && progress <= .74
        ? clamp(.62 + .38 * (1 - Math.abs(progress - .61) / .25), 0, 1)
        : 0;
    const glint = Math.max(baseGlint, cueGlint);

    const eliteStyle = enemy.eliteStyle;
    const bodyHalf = isBoss ? 32 : eliteStyle === 'shield' ? 25 : eliteStyle === 'ambush' ? 17 : eliteStyle === 'dual' ? 18 : eliteStyle === 'cavalry' ? 23 : eliteStyle === 'rifle' ? 22 : 20;
    const headRadius = isBoss ? 21 : eliteStyle === 'shield' ? 16 : eliteStyle === 'heavy' ? 17 : eliteStyle === 'ambush' ? 13 : 14;
    const bodyTop = eliteStyle === 'ambush' ? -15 : -18;
    const shoulderSink = eliteStyle === 'shield' ? 3 : eliteStyle === 'ambush' ? 2 : 0;

    ctx.save();
    ctx.translate(pos.x - lungeIn + hitShake + hitRecoil, pos.y + bob + enemyBodyY + (enemy.status.broken ? 8 : 0));
    const displayScale = scale * (isBoss ? 1.25 : enemy.elite ? 1.18 : 1.08);
    ctx.scale(displayScale, displayScale);
    if (enemy.status.broken) ctx.rotate(.32);
    else if (enemy.action === 'stagger') ctx.rotate(-awayFromPlayer * .16);
    else ctx.rotate(enemyBodyAngle);

    if (enemy.status.stun > 0) {
      ctx.strokeStyle = 'rgba(240,209,141,.55)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -42, 52, 0, Math.PI * 2); ctx.stroke();
    }
    if (enemy.status.broken) {
      const pulse = .5 + .5 * Math.sin(performance.now() * .02);
      if (state.performanceMode) {
        ctx.fillStyle = `rgba(255,218,132,${.12 + pulse * .07})`;
      } else {
        const gold = ctx.createRadialGradient(0, -36, 8, 0, -36, 96);
        gold.addColorStop(0, `rgba(255,224,148,${.17 + pulse * .12})`);
        gold.addColorStop(1, 'rgba(255,206,105,0)');
        ctx.fillStyle = gold;
      }
      ctx.beginPath(); ctx.arc(0, -36, 96, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,224,145,${.5 + pulse * .35})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, -38, 54 + pulse * 7, 0, Math.PI * 2); ctx.stroke();
    } else if (enemy.action === 'breathe') {
      const pulse = .5 + .5 * Math.sin(performance.now() * .014);
      if (state.performanceMode) {
        ctx.fillStyle = `rgba(190,211,151,${.1 + pulse * .06})`;
      } else {
        const breath = ctx.createRadialGradient(0, -32, 7, 0, -32, 88);
        breath.addColorStop(0, `rgba(176,218,143,${.12 + pulse * .09})`);
        breath.addColorStop(.55, `rgba(220,188,102,${.08 + pulse * .05})`);
        breath.addColorStop(1, 'rgba(220,188,102,0)');
        ctx.fillStyle = breath;
      }
      ctx.beginPath(); ctx.arc(0, -32, 88, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(205,224,163,${.35 + pulse * .28})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.beginPath(); ctx.arc(0, -34, 48 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (duel && !duel.resolved) {
      const dangerPulse = .5 + .5 * Math.sin(performance.now() * .022);
      if (state.performanceMode) {
        ctx.fillStyle = `rgba(220,54,44,${.08 + dangerPulse * .05})`;
      } else {
        const danger = ctx.createRadialGradient(0, -28, 8, 0, -28, 86);
        danger.addColorStop(0, `rgba(240,74,63,${.11 + dangerPulse * .08})`);
        danger.addColorStop(.55, `rgba(201,52,47,${.06 + dangerPulse * .05})`);
        danger.addColorStop(1, 'rgba(201,52,47,0)');
        ctx.fillStyle = danger;
      }
      ctx.beginPath(); ctx.arc(0, -28, 86, 0, Math.PI * 2); ctx.fill();
    }
    if (isBoss && enemy.phase2) {
      if (state.performanceMode) {
        ctx.fillStyle = 'rgba(232,62,48,.12)';
      } else {
        const aura = ctx.createRadialGradient(0, -35, 12, 0, -35, 118);
        aura.addColorStop(0, 'rgba(232,62,48,.2)');
        aura.addColorStop(1, 'rgba(232,62,48,0)');
        ctx.fillStyle = aura;
      }
      ctx.beginPath(); ctx.arc(0, -35, 118, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(0, 47, isBoss ? 47 : eliteStyle === 'shield' ? 38 : eliteStyle === 'ambush' ? 26 : 31, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (eliteStyle === 'cavalry') {
      ctx.strokeStyle = '#2b1811';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-31, 40); ctx.lineTo(-19, -92); ctx.stroke();
      const wave = Math.sin(performance.now() * .006) * 3;
      ctx.fillStyle = '#8e2d26';
      ctx.beginPath(); ctx.moveTo(-18, -88); ctx.quadraticCurveTo(13, -82 + wave, 39, -68); ctx.lineTo(17, -44); ctx.quadraticCurveTo(-2, -55, -18, -52); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e7c678';
      ctx.font = canvasFont(12, 'serif', 'bold');
      ctx.fillText('★', 4, -62);
    }
    const enemyCloth = Math.sin(time * .011 + index) * 3;
    ctx.save();
    ctx.strokeStyle = enemy.color;
    ctx.globalAlpha = .72;
    ctx.lineWidth = isBoss ? 8 : 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.bezierCurveTo(23, 1 + enemyCloth, 34, 9 - enemyCloth, 48, 21 + enemyCloth);
    ctx.stroke();
    if (!state.performanceMode) {
      ctx.strokeStyle = 'rgba(238,194,114,.26)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    if (enemy.status.broken) {
      drawBentLimb(ctx, [[-8, 8], [-35, 22], [-14, 43]], enemy.color, isBoss ? 13 : eliteStyle === 'shield' ? 12 : 10);
      drawBentLimb(ctx, [[8, 8], [32, 26], [44, 40]], enemy.color, isBoss ? 13 : eliteStyle === 'shield' ? 12 : 10);
      ctx.fillStyle = 'rgba(15,8,5,.85)';
      ctx.beginPath(); ctx.arc(-34, 22, 5.6, 0, Math.PI * 2); ctx.arc(32, 26, 5.6, 0, Math.PI * 2); ctx.fill();
    } else {
      drawBentLimb(ctx, [[-8, 8], enemyRearKnee, enemyRearFoot], enemy.color, isBoss ? 13 : eliteStyle === 'shield' ? 12 : 10);
      drawBentLimb(ctx, [[8, 8], enemyLeadKnee, enemyLeadFoot], enemy.color, isBoss ? 13 : eliteStyle === 'shield' ? 12 : 10);
      if (!state.performanceMode) {
        ctx.fillStyle = 'rgba(25,13,8,.9)';
        ctx.beginPath(); ctx.arc(enemyRearKnee[0], enemyRearKnee[1], 5.8, 0, Math.PI * 2); ctx.arc(enemyLeadKnee[0], enemyLeadKnee[1], 5.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#20140f'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(enemyRearFoot[0], enemyRearFoot[1]); ctx.lineTo(enemyRearFoot[0] + 12, enemyRearFoot[1] + 2); ctx.moveTo(enemyLeadFoot[0], enemyLeadFoot[1]); ctx.lineTo(enemyLeadFoot[0] - 12, enemyLeadFoot[1] + 2); ctx.stroke();
    }

    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = 'rgba(8,5,4,.95)';
    ctx.lineWidth = isBoss ? 6 : eliteStyle === 'shield' ? 5 : 4;
    ctx.beginPath();
    ctx.moveTo(-bodyHalf, bodyTop - shoulderSink);
    ctx.lineTo(bodyHalf, bodyTop - shoulderSink);
    ctx.lineTo(bodyHalf - 2, 12);
    ctx.lineTo(-bodyHalf + 3, 12);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#17100c';
    ctx.fillRect(-bodyHalf + 1, -9, bodyHalf * 2 - 2, eliteStyle === 'shield' ? 8 : 6);
    if (eliteStyle === 'dual') {
      ctx.fillStyle = 'rgba(234,203,138,.65)';
      ctx.fillRect(-13, -13, 5, 22);
      ctx.fillRect(8, -13, 5, 22);
    }

    ctx.fillStyle = enemy.color;
    ctx.beginPath(); ctx.arc(enemyHeadOffset[0], (isBoss ? -38 : eliteStyle === 'heavy' ? -37 : eliteStyle === 'ambush' ? -31 : -34) + enemyHeadOffset[1], headRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#261713';
    ctx.fillRect(-bodyHalf - 2 + enemyHeadOffset[0], (isBoss ? -59 : eliteStyle === 'heavy' ? -57 : -51) + enemyHeadOffset[1], bodyHalf * 2 + 4, isBoss ? 8 : 6);
    if (eliteStyle === 'cavalry') {
      ctx.strokeStyle = '#d2aa57';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(-7, -61); ctx.lineTo(3, -69); ctx.stroke();
      ctx.fillStyle = '#a8342c';
      ctx.beginPath(); ctx.arc(3, -69, 5, 0, Math.PI * 2); ctx.fill();
    }

    drawBentLimb(ctx, [[-11, -13], enemyOffElbow, enemyOffHand], enemy.color, isBoss ? 11 : eliteStyle === 'shield' ? 11 : 8.5, 'rgba(8,5,4,.9)');
    const elbow = [(-10 + hand[0]) / 2 + enemyElbowBias[0], (-14 + hand[1]) / 2 + enemyElbowBias[1]];
    drawBentLimb(ctx, [[-10, -14], elbow, hand], enemy.color, isBoss ? 12 : 9.5, 'rgba(8,5,4,.95)');
    if (!state.performanceMode) {
      ctx.fillStyle = '#a77c58';
      ctx.beginPath(); ctx.arc(enemyOffHand[0], enemyOffHand[1], isBoss ? 4.5 : 3.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(35,20,13,.95)';
      ctx.beginPath(); ctx.arc(elbow[0], elbow[1], 5.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a77c58';
      ctx.beginPath(); ctx.arc(hand[0], hand[1], isBoss ? 4.5 : 3.8, 0, Math.PI * 2); ctx.fill();
    }
    drawWeapon(ctx, hand, tip, weaponKind, glint);
    if (eliteStyle === 'shield') {
      ctx.save();
      ctx.translate(-16, -7);
      ctx.rotate(-.12);
      ctx.fillStyle = '#3f2c22';
      ctx.strokeStyle = '#c59a58';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, -30); ctx.lineTo(17, -27); ctx.lineTo(22, 2); ctx.lineTo(3, 33); ctx.lineTo(-18, 17); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a94434';
      ctx.beginPath(); ctx.moveTo(-9, -20); ctx.lineTo(10, -18); ctx.lineTo(12, 0); ctx.lineTo(1, 17); ctx.lineTo(-9, 7); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (eliteStyle === 'dual') {
      drawWeapon(ctx, [-14, -4], [-92, 29], 'dagger', Math.max(.25, glint * .75));
    }

    if (!state.performanceMode) {
      ctx.fillStyle = 'rgba(239,227,200,.72)';
      ctx.font = canvasFont(isBoss ? 26 : 18, 'serif');
      ctx.textAlign = 'center';
      ctx.fillText(enemy.glyph, 0, isBoss ? -31 : -29);
    }

    if (glint > 0) {
      ctx.save();
      ctx.globalAlpha = glint;
      ctx.fillStyle = '#fff3ba';
      ctx.beginPath(); ctx.arc(tip[0], tip[1], 3.5 + glint * 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,228,150,.85)';
      ctx.lineWidth = 1.3;
      const glintRays = state.performanceMode ? 3 : 6;
      for (let i = 0; i < glintRays; i++) {
        const angle = i / glintRays * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(tip[0] + Math.cos(angle) * 8, tip[1] + Math.sin(angle) * 8);
        ctx.lineTo(tip[0] + Math.cos(angle) * (16 + glint * 10), tip[1] + Math.sin(angle) * (16 + glint * 10));
        ctx.stroke();
      }
      if (cueGlint > 0) {
        ctx.globalAlpha = cueGlint;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(tip[0], tip[1], 24 + (1 - cueGlint) * 16, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    const health = enemyHealthState(enemy);
    const barWidth = isBoss ? 420 : 96;
    const barX = clamp(pos.x - barWidth / 2, 12, 948 - barWidth);
    const barY = isBoss ? 190 : 236;
    const barCenterX = barX + barWidth / 2;
    const postureBarY = barY + health.segments * 8 + 6;
    // 顶部 #elite-health-hud 正在显示同一只敌人时，画布里这一套就是同屏第三份血条了，
    // 只留下面的状态提示与出招预警，条和名字都交给顶部那条统一显示。
    // 判定用 eliteHudTargetId（由 updateEliteHealthHud 写），不按 elite/boss 粗判，
    // 这样多敌阵容里没被顶部条锁定的那几只仍然有自己的血条。
    const barOwnedByHud = eliteHudTargetId === enemy.id;
    if (!barOwnedByHud) {
      for (let i = 0; i < health.segments; i++) {
        const y = barY + i * 8;
        ctx.fillStyle = 'rgba(10,7,5,.72)';
        ctx.fillRect(barX, y, barWidth, 6);
        if (i === 0 && health.remaining > 0) {
          ctx.fillStyle = enemy.elite ? '#ef6a4e' : '#d33b31';
          ctx.fillRect(barX, y, barWidth * health.currentPct / 100, 6);
        } else if (i < health.remaining) {
          ctx.fillStyle = enemy.elite ? 'rgba(210,89,55,.62)' : 'rgba(180,48,42,.55)';
          ctx.fillRect(barX, y, barWidth, 6);
        }
      }
      ctx.fillStyle = 'rgba(10,7,5,.72)';
      ctx.fillRect(barX, postureBarY, barWidth, 5);
      ctx.fillStyle = enemy.status.broken ? '#ffe8a6' : '#d8b85e';
      ctx.fillRect(barX, postureBarY, barWidth * clamp(enemy.posture / enemy.maxPosture, 0, 1), 5);
      ctx.fillStyle = 'rgba(239,227,200,.88)';
      ctx.font = canvasFont(isBoss ? 16 : 12, 'serif');
      ctx.textAlign = 'center';
      ctx.fillText(`${enemy.name}${health.segments > 1 ? `  尚余 ${health.remaining} 道防线` : ''}`, barCenterX, barY - 8);
    }
    if (enemy.status.broken) {
      ctx.fillStyle = '#ffe4a0';
      ctx.font = canvasFont(13, '"Noto Serif SC", serif', 'bold');
      ctx.fillText('架势崩溃 · 可处决', pos.x, postureBarY + 18);
    } else if (enemy.action === 'breathe') {
      ctx.fillStyle = '#d9e6b1';
      ctx.font = canvasFont(13, '"Noto Serif SC", serif', 'bold');
      ctx.fillText('喘息调息 · 架势回落 · 可打断', pos.x, postureBarY + 18);
    }

    if (meleeIntent) {
      const pulse = .55 + .35 * Math.sin(performance.now() * .012);
      ctx.save();
      ctx.globalAlpha = pulse;
      const specialAhead = ['combo', 'whirlwind', 'blinkSlash', 'slowFast', 'eliteMove'].includes(enemy.intent.type);
      ctx.strokeStyle = specialAhead ? '#ff7758' : '#e8c477';
      ctx.fillStyle = specialAhead ? '#ff9b7e' : '#f3d58e';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(pos.x - 38, postureBarY + 28);
      ctx.lineTo(pos.x - 118, postureBarY + 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pos.x - 118, postureBarY + 28);
      ctx.lineTo(pos.x - 106, postureBarY + 22);
      ctx.lineTo(pos.x - 106, postureBarY + 34);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  function drawDuelMotion(now) {
    const duel = scene.duel;
    if (!duel || !state.combat) return;
    const ctx = battleContext();
    const pos = enemyCanvasPosition(duel.enemyIndex);
    const progress = clamp(duel.progress, 0, 1);
    const lunge = duelLungeDistance(progress);
    const x = pos.x - lunge;
    const dashing = progress >= .18 && progress < .56;
    if (dashing) {
      const pulse = clamp(1 - Math.abs(progress - .23) / .15, 0, 1);
      ctx.save();
      ctx.globalAlpha = .35 + pulse * .5;
      ctx.strokeStyle = duel.comboStep === 2 ? '#ff8c6c' : '#f0cf87';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = state.performanceMode ? 0 : 12;
      for (let i = 0; i < 7; i++) {
        const yy = pos.y - 78 + i * 17;
        const length = 54 + i * 11;
        ctx.lineWidth = 1.2 + (i % 3) * .8;
        ctx.beginPath();
        ctx.moveTo(x + 92 + i * 5, yy);
        ctx.lineTo(x + 92 + i * 5 + length, yy + 2);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(205,174,119,.22)';
      for (let i = 0; i < 4; i++) {
        const drift = (now * .04 + i * 19) % 42;
        ctx.beginPath();
        ctx.arc(x + 36 + drift, pos.y + 40, 11 + i * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const slashPulse = clamp(1 - Math.abs(progress - .61) / .27, 0, 1);
    if (duel.style === 'whirlwind' && progress > .4 && progress < .82) {
      ctx.save();
      ctx.globalAlpha = .46 + slashPulse * .48;
      ctx.lineCap = 'round';
      ctx.strokeStyle = duel.comboStep >= 3 ? '#ffad78' : '#f8dc94';
      ctx.shadowColor = duel.comboStep >= 3 ? '#ff623e' : '#e9b95f';
      ctx.shadowBlur = state.performanceMode ? 0 : 18;
      for (let layer = 0; layer < 3; layer++) {
        const radius = 106 - layer * 18;
        const start = -2.1 + layer * .16;
        ctx.lineWidth = 7 - layer * 2;
        ctx.setLineDash([58 + duel.comboStep * 5, 13]);
        ctx.beginPath();
        ctx.arc(x + 6, pos.y - 48, radius, start, start + 2.15);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,211,132,.65)';
      for (let i = 0; i < 10; i++) {
        const angle = -.8 + i * .35;
        const radius = 70 + i * 7;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * radius, pos.y - 48 + Math.sin(angle) * radius * .62, 1.4 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (duel.style === 'blinkSlash' && progress > .42 && progress < .78) {
      ctx.save();
      ctx.globalAlpha = .5 + slashPulse * .45;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ff704f';
      ctx.shadowBlur = state.performanceMode ? 0 : 20;
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = i % 2 ? '#ffb27b' : '#fff0bc';
        ctx.lineWidth = 5 - i * .7;
        ctx.beginPath();
        ctx.moveTo(x + 74 + i * 9, pos.y - 132 - i * 4);
        ctx.bezierCurveTo(x + 38, pos.y - 95, x - 4, pos.y - 44, x - 78, pos.y + 3 + i * 6);
        ctx.stroke();
      }
      ctx.restore();
    } else if ((duel.style === 'slowFast' || duel.style === 'eliteMove') && progress > .46 && progress < .8) {
      const second = duel.comboStep === 2;
      ctx.save();
      ctx.globalAlpha = .48 + slashPulse * .46;
      ctx.lineCap = 'round';
      ctx.strokeStyle = second ? '#ff8d69' : '#f8df9b';
      ctx.shadowColor = second ? '#ff5a38' : '#e8bd68';
      ctx.shadowBlur = state.performanceMode ? 0 : 16;
      for (let i = 0; i < 3; i++) {
        const bend = 18 + i * 18;
        ctx.lineWidth = 6 - i;
        ctx.beginPath();
        ctx.moveTo(x + 58, pos.y - 126 - bend);
        ctx.quadraticCurveTo(x + 8, pos.y - 72, x - 116 + i * 9, pos.y - 12 + i * 13);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (progress < .8 && !duel.resolved && state.training?.active) {
      const label = duel.sequenceLabel
        ? `${duel.sequenceLabel} · 第 ${duel.comboStep} 刀`
        : duel.title || (duel.eliteMove ? '精英绝技' : duel.thrust ? '枪刃突刺' : duel.narrow ? '重击落下' : duel.quick ? '快斩' : '突进横斩');
      const boxWidth = Math.max(144, Math.min(230, label.length * 18 + 26));
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = canvasFont(20, '"Noto Serif SC", serif', 'bold');
      const glow = duel.comboStep === 2 ? '#ff684e' : duel.style === 'blinkSlash' ? '#ff9b6f' : duel.quick ? '#ff9d72' : '#f3d58e';
      ctx.fillStyle = 'rgba(14,8,6,.78)';
      ctx.fillRect(x - boxWidth / 2, pos.y - 174, boxWidth, 30);
      ctx.strokeStyle = glow;
      ctx.globalAlpha = .88;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - boxWidth / 2, pos.y - 174, boxWidth, 30);
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.shadowColor = glow;
      ctx.shadowBlur = state.performanceMode ? 0 : 12;
      ctx.fillText(label, x, pos.y - 153);
      ctx.restore();
    }
  }

  function updateEffects(dt) {
    scene.shake *= Math.pow(.001, dt);
    scene.flash = Math.max(0, scene.flash - dt * 1.8);
    scene.goldFlash = Math.max(0, scene.goldFlash - dt * 1.8);
    scene.perfectFlash = Math.max(0, scene.perfectFlash - dt * 2.7);
    scene.invulnerabilityFlash = Math.max(0, scene.invulnerabilityFlash - dt * 3.4);
    if (scene.clash) {
      scene.clash.life -= dt;
      if (scene.clash.life <= 0) scene.clash = null;
    }
    scene.lunge *= Math.pow(.006, dt);
    Object.keys(scene.enemyHit).forEach((key) => {
      scene.enemyHit[key] = Math.max(0, scene.enemyHit[key] - dt);
      if (scene.enemyHit[key] <= 0) delete scene.enemyHit[key];
    });
    scene.particles.forEach((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 170 * dt;
      particle.vx *= .99;
    });
    scene.particles = scene.particles.filter((particle) => particle.life > 0);
    scene.floats.forEach((float) => {
      float.life -= dt;
      float.y += float.vy * dt;
      float.vy *= .97;
    });
    scene.floats = scene.floats.filter((float) => float.life > 0);
    scene.projectiles.forEach((shot) => { shot.life -= dt; });
    scene.projectiles = scene.projectiles.filter((shot) => shot.life > 0);
    scene.slashes.forEach((slash) => { slash.life -= dt; });
    scene.slashes = scene.slashes.filter((slash) => slash.life > 0);
  }

  function drawDodgeTrail(now) {
    const combat = state.combat;
    const dodge = combat?.dodge;
    if (!dodge) return;
    const ctx = battleContext();
    const t = clamp((now - dodge.start) / dodge.duration, 0, 1);
    const x = combat.playerRenderX;
    const y = combat.playerRenderY;
    const dx = dodge.endX - dodge.startX;
    const dy = dodge.endY - dodge.startY;
    const length = Math.hypot(dx, dy) || 1;
    const vx = dx / length;
    const vy = dy / length;
    ctx.save();
    ctx.globalAlpha = .32 * (1 - t);
    ctx.strokeStyle = dodge.identify ? '#ffe3a2' : '#c8d0ba';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const spread = (i - 2) * 13;
      const sx = x - vx * (35 + i * 9) - vy * spread;
      const sy = y - 38 - vy * (35 + i * 9) + vx * spread;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - vx * (55 + i * 8), sy - vy * (55 + i * 8) + 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(206,190,145,.24)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(x - vx * (28 + i * 26), y + 28 - vy * (28 + i * 26), 13 + i * 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMikiriCounter(now) {
    const combat = state.combat;
    const mikiri = scene.mikiri;
    if (!combat || !mikiri) return;
    const ctx = battleContext();
    const t = clamp((now - mikiri.start) / mikiri.duration, 0, 1);
    const stomp = clamp((t - .17) / .2, 0, 1);
    const impact = t >= .37 ? clamp((t - .37) / .32, 0, 1) : 0;
    const x = mikiri.impactX;
    const y = mikiri.impactY;
    ctx.save();
    ctx.globalAlpha = 1 - impact * .65;
    ctx.strokeStyle = '#fff0b0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 86, y - 46);
    ctx.quadraticCurveTo(x - 34, y - 24 + Math.sin(t * 24) * 2, x + 12, y - 4);
    ctx.stroke();
    if (stomp > 0) {
      const bootY = y - 62 + stomp * 62;
      ctx.globalAlpha = .9;
      ctx.strokeStyle = '#24140f';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 18, bootY - 30);
      ctx.lineTo(x + 2, bootY - 3);
      ctx.stroke();
      ctx.fillStyle = '#3b2418';
      ctx.strokeStyle = '#e4c477';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + 12, bootY + 2, 20, 7, -.12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    if (impact > 0) {
      ctx.globalAlpha = 1 - impact;
      ctx.strokeStyle = '#ffe7a3';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x + 10, y + 4, 24 + impact * 92, 8 + impact * 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,239,184,.72)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = i / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 26, y + Math.sin(angle) * 12);
        ctx.lineTo(x + Math.cos(angle) * (52 + impact * 34), y + Math.sin(angle) * (22 + impact * 20));
        ctx.stroke();
      }
    }
    ctx.restore();
  }


  function drawExecutionCinematic(now) {
    const ex = scene.execution;
    if (!ex) return;
    const ctx = battleContext();
    const t = clamp((now - ex.start) / ex.duration, 0, 1);
    const pre = clamp(t / ex.impactAt, 0, 1);
    const post = clamp((t - ex.impactAt) / (1 - ex.impactAt), 0, 1);
    const impactPulse = Math.max(0, 1 - Math.abs(t - ex.impactAt) * 13);
    const labelMap = { waist: '腰斩处决', pierce: '贯胸处决', behead: '斩首处决', headshot: '远程爆头' };
    const label = labelMap[ex.variant] || '处决';
    const shake = impactPulse * 18 + post * 2;
    ctx.save();
    ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    const bg = ctx.createRadialGradient(480, 270, 30, 480, 270, 520);
    bg.addColorStop(0, '#35130f');
    bg.addColorStop(.38, '#140b08');
    bg.addColorStop(1, '#030202');
    ctx.fillStyle = bg;
    ctx.fillRect(-30, -30, 1020, 600);
    ctx.globalAlpha = .22 + pre * .25;
    ctx.strokeStyle = '#e7b861';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 24; i++) {
      const y = 36 + i * 21;
      const offset = (now * .12 + i * 17) % 180;
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.lineTo(300 + offset, y - 16);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const zoom = 1.08 + Math.sin(pre * Math.PI * .5) * .14 + post * .05;
    ctx.translate(480, 280);
    ctx.scale(zoom, zoom);
    ctx.translate(-480, -280);

    const enemyX = 590;
    const enemyY = 324;
    const playerStart = ex.type === 'ranged' ? 160 : 205;
    const playerX = playerStart + pre * (ex.type === 'ranged' ? 15 : 220);
    const playerY = 330;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Enemy silhouette close-up.
    ctx.save();
    ctx.translate(enemyX + post * (ex.variant === 'behead' ? 8 : 18), enemyY);
    if (ex.variant === 'pierce') ctx.rotate(-post * .15);
    ctx.fillStyle = '#321b16';
    ctx.strokeStyle = '#0a0605';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28, -48); ctx.lineTo(28, -48); ctx.lineTo(23, 24); ctx.lineTo(-23, 24); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#321b16'; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(-17, 20); ctx.lineTo(-31, 63); ctx.lineTo(-20, 98); ctx.moveTo(17, 20); ctx.lineTo(31, 63); ctx.lineTo(22, 98); ctx.stroke();
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(-23, -33); ctx.lineTo(-51, 9); ctx.moveTo(23, -33); ctx.lineTo(48, -7); ctx.stroke();
    const headBaseX = 0;
    const headBaseY = -70;
    const headX = headBaseX + (ex.variant === 'behead' ? post * 112 : ex.variant === 'headshot' ? post * 28 : 0);
    const headY = headBaseY - (ex.variant === 'behead' ? post * 74 : ex.variant === 'headshot' ? post * 22 : 0);
    ctx.fillStyle = '#4a251c';
    ctx.strokeStyle = '#080504';
    ctx.lineWidth = 4;
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(ex.variant === 'behead' ? post * 2.8 : ex.variant === 'headshot' ? post * .55 : 0);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a9875e';
    ctx.fillRect(-29, -10, 58, 8);
    ctx.restore();
    if (ex.variant === 'waist' && post > 0) {
      ctx.fillStyle = '#080504';
      ctx.fillRect(-32, 20 + post * 5, 64, 7 + post * 19);
      ctx.strokeStyle = '#ffdd8b';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-40 - post * 30, 23); ctx.lineTo(40 + post * 30, 18); ctx.stroke();
    }
    if (ex.variant === 'pierce' && post > 0) {
      ctx.strokeStyle = '#fff0b4';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-120, -5); ctx.lineTo(140, -2); ctx.stroke();
      ctx.strokeStyle = 'rgba(215,63,48,.85)'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(24, -13); ctx.lineTo(45, 4); ctx.stroke();
    }
    if (ex.variant === 'behead' && post > 0) {
      ctx.strokeStyle = '#fff0b4'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-92, -25); ctx.lineTo(34, -68); ctx.stroke();
      ctx.strokeStyle = 'rgba(208,54,41,.88)'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(-3, -51); ctx.lineTo(18, -45); ctx.stroke();
    }
    if (ex.variant === 'headshot' && post > 0) {
      ctx.fillStyle = `rgba(255,240,188,${1 - post * .7})`;
      ctx.beginPath(); ctx.arc(headX, headY, 38 + post * 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(211,55,42,${.8 - post * .5})`;
      ctx.lineWidth = 9;
      for (let i = 0; i < 9; i++) {
        const angle = i / 9 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(headX + Math.cos(angle) * 12, headY + Math.sin(angle) * 12);
        ctx.lineTo(headX + Math.cos(angle) * (45 + post * 70), headY + Math.sin(angle) * (28 + post * 50));
        ctx.stroke();
      }
    }
    ctx.restore();

    // Attacker silhouette.
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.fillStyle = '#19100d';
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -45); ctx.lineTo(21, -45); ctx.lineTo(18, 20); ctx.lineTo(-17, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#19100d'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(-11, 17); ctx.lineTo(-28, 59); ctx.lineTo(-15, 95); ctx.moveTo(12, 17); ctx.lineTo(28, 58); ctx.lineTo(18, 94); ctx.stroke();
    ctx.fillStyle = '#4d2d1d'; ctx.beginPath(); ctx.arc(0, -65, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c1392f'; ctx.fillRect(-25, -77, 50, 7);
    ctx.strokeStyle = '#19100d'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-15, -30); ctx.lineTo(-42, 2); ctx.moveTo(15, -30); ctx.lineTo(ex.type === 'ranged' ? 58 : 52, -13); ctx.stroke();
    if (ex.type === 'ranged') {
      ctx.strokeStyle = '#6d4c30'; ctx.lineWidth = 13;
      ctx.beginPath(); ctx.moveTo(35, -15); ctx.lineTo(104, -15); ctx.stroke();
      ctx.strokeStyle = '#c9a66a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(54, -22); ctx.lineTo(86, -22); ctx.stroke();
      if (impactPulse > 0) {
        ctx.fillStyle = '#fff4c8';
        ctx.beginPath(); ctx.arc(112, -15, 12 + impactPulse * 26, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffd268'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(112, -15); ctx.lineTo(372, -74); ctx.stroke();
      }
    } else {
      const weaponTip = ex.variant === 'pierce' ? [152, -10] : ex.variant === 'behead' ? [118, -68] : [136, 14];
      ctx.strokeStyle = '#e9dcc0'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(50, -13); ctx.lineTo(weaponTip[0], weaponTip[1]); ctx.stroke();
      ctx.strokeStyle = '#fff1bd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(58, -15); ctx.lineTo(weaponTip[0], weaponTip[1]); ctx.stroke();
      if (impactPulse > 0) {
        ctx.globalAlpha = impactPulse;
        ctx.strokeStyle = '#fff0b4'; ctx.lineWidth = 8;
        ctx.beginPath();
        if (ex.variant === 'pierce') { ctx.moveTo(20, -8); ctx.lineTo(320, -8); }
        else if (ex.variant === 'behead') { ctx.moveTo(0, -22); ctx.lineTo(350, -111); }
        else { ctx.moveTo(-5, 25); ctx.lineTo(345, -26); }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    if (impactPulse > 0) {
      ctx.fillStyle = `rgba(255,244,203,${impactPulse * .78})`;
      ctx.fillRect(-40, -40, 1040, 620);
      ctx.strokeStyle = `rgba(255,225,137,${impactPulse})`;
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(590, 250, 48 + (1 - impactPulse) * 170, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    // Cinematic letterbox and caption.
    ctx.fillStyle = 'rgba(0,0,0,.94)';
    ctx.fillRect(0, 0, 960, 48 + post * 10);
    ctx.fillRect(0, 492 - post * 10, 960, 48 + post * 10);
    ctx.fillStyle = '#e8c477';
    ctx.font = canvasFont(24, '"Noto Serif SC", serif', 'bold');
    ctx.textAlign = 'center';
    ctx.fillText(label, 480, 500);
    ctx.fillStyle = 'rgba(239,224,190,.68)';
    ctx.font = canvasFont(11, '"Noto Serif SC", serif');
    ctx.fillText(t < ex.impactAt ? '处决动作进行中 · 操作锁定' : (post > .75 ? '处决完成' : '命中'), 480, 522);
    if (t < .2) {
      const reveal = clamp(t / .18, 0, 1);
      ctx.fillStyle = `rgba(237,207,137,${1 - reveal})`;
      ctx.fillRect(0, 0, 960, 540);
    }
  }

  function drawEnemyShotAim(now) {
    const aim = scene.shotAim;
    if (!aim || aim.fired || !state.combat) return;
    const ctx = battleContext();
    const enemyPos = enemyCanvasPosition(aim.enemyIndex);
    const progress = aim.timeWarp ? warpProgressAt(aim.timeWarp, now - aim.start) : clamp((now - aim.start) / aim.duration, 0, 1);
    const pulse = .55 + .45 * Math.sin(now * .028);
    const startX = enemyPos.x - 104;
    const startY = 301;
    const endY = 305;
    ctx.save();
    ctx.globalAlpha = .45 + progress * .45;
    ctx.setLineDash([10 + progress * 5, 9]);
    ctx.lineDashOffset = -now * .035;
    ctx.strokeStyle = aim.parried ? '#ffe6a7' : `rgba(255,74,53,${.55 + pulse * .35})`;
    ctx.shadowColor = aim.parried ? '#ffe2a0' : '#ff3d2f';
    ctx.shadowBlur = state.performanceMode ? 0 : 12;
    ctx.lineWidth = 1.8 + progress * 1.8;
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(aim.aimX, endY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    const radius = 15 + pulse * 4;
    ctx.beginPath(); ctx.arc(aim.aimX, endY, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(aim.aimX - radius - 9, endY); ctx.lineTo(aim.aimX - radius + 4, endY);
    ctx.moveTo(aim.aimX + radius - 4, endY); ctx.lineTo(aim.aimX + radius + 9, endY);
    ctx.moveTo(aim.aimX, endY - radius - 9); ctx.lineTo(aim.aimX, endY - radius + 4);
    ctx.moveTo(aim.aimX, endY + radius - 4); ctx.lineTo(aim.aimX, endY + radius + 9);
    ctx.stroke();
    ctx.fillStyle = aim.parried ? '#ffe5a4' : '#ffb09c';
    ctx.font = canvasFont(13, '"Noto Serif SC", serif', 'bold');
    ctx.textAlign = 'center';
    ctx.fillText('枪线 · 横移脱离', aim.aimX, endY - radius - 14);
    if (aim.cueUntil > now) {
      const cue = clamp((aim.cueUntil - now) / 170, 0, 1);
      if (state.performanceMode) {
        ctx.fillStyle = `rgba(255,235,166,${cue * .28})`;
      } else {
        const flash = ctx.createRadialGradient(startX, startY, 2, startX, startY, 38 + (1 - cue) * 18);
        flash.addColorStop(0, `rgba(255,255,225,${cue})`);
        flash.addColorStop(.35, `rgba(255,220,130,${cue * .75})`);
        flash.addColorStop(1, 'rgba(255,210,100,0)');
        ctx.fillStyle = flash;
      }
      ctx.beginPath(); ctx.arc(startX, startY, 56, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawEffects() {
    const ctx = battleContext();
    if (scene.clash) {
      const clash = scene.clash;
      const ratio = clamp(clash.life / clash.maxLife, 0, 1);
      const burst = (1 - ratio) * 54 * clash.power + 10;
      ctx.save();
      ctx.translate(clash.x, clash.y);
      ctx.rotate(-.24);
      ctx.globalAlpha = ratio;
      ctx.shadowColor = 'rgba(255,240,184,.95)';
      ctx.shadowBlur = state.performanceMode ? 0 : 18 * clash.power;
      ctx.strokeStyle = '#fff8dc';
      ctx.lineWidth = 7 * clash.power;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-76, 24); ctx.quadraticCurveTo(-18, -12, 58, -18); ctx.stroke();
      ctx.strokeStyle = '#f5c45f';
      ctx.lineWidth = 3.5 * clash.power;
      ctx.beginPath(); ctx.moveTo(-54, 39); ctx.quadraticCurveTo(8, 8, 76, -1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,88,61,.9)';
      ctx.lineWidth = 2;
      const shardCount = state.performanceMode ? 8 : 18;
      for (let i = 0; i < shardCount; i++) {
        const angle = i / shardCount * Math.PI * 2 + .17;
        const inner = burst * .28;
        const outer = burst + 15 + (i % 4) * 7;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff4c6';
      for (let i = 0; i < 7; i++) {
        const angle = i * 1.73 + ratio;
        const d = burst * (.44 + (i % 3) * .13);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * d, Math.sin(angle) * d);
        ctx.lineTo(Math.cos(angle + .08) * (d + 13), Math.sin(angle + .08) * (d + 13));
        ctx.lineTo(Math.cos(angle - .06) * (d + 8), Math.sin(angle - .06) * (d + 8));
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    scene.projectiles.forEach((shot) => {
      const progress = 1 - clamp(shot.life / shot.maxLife, 0, 1);
      const x = shot.x1 + (shot.x2 - shot.x1) * progress;
      const y = shot.y1 + (shot.y2 - shot.y1) * progress;
      const direction = Math.sign(shot.x2 - shot.x1) || 1;
      const trail = (shot.hostile ? 34 : 28) + progress * 24;
      ctx.save();
      ctx.globalAlpha = .95;
      ctx.shadowColor = shot.color;
      ctx.shadowBlur = state.performanceMode ? 0 : shot.hostile ? 20 : 14;
      ctx.strokeStyle = shot.color;
      ctx.lineWidth = shot.width;
      ctx.beginPath();
      ctx.moveTo(x - direction * trail, y + 2);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = '#fff5d4';
      ctx.beginPath(); ctx.arc(x, y, shot.hostile ? 2.4 : 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    scene.slashes.forEach((slash) => {
      const alpha = clamp(slash.life / slash.maxLife, 0, 1);
      const r = slash.radius;
      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle || -.25);
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255,224,140,.8)';
      ctx.shadowBlur = state.performanceMode ? 0 : 10;
      ctx.strokeStyle = '#fff3c4';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-r * .78, 5); ctx.quadraticCurveTo(-r * .08, -14, r * .8, -7); ctx.stroke();
      ctx.strokeStyle = '#e7b34f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-r * .64, 18); ctx.lineTo(-r * .12, 5); ctx.lineTo(r * .18, 11); ctx.lineTo(r * .72, -1);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,235,174,.9)';
      const shardCount = slash.shards || 6;
      for (let i = 0; i < shardCount; i++) {
        const t = (i + .5) / shardCount;
        const x = (t - .5) * r * 1.45;
        const y = Math.sin(t * Math.PI) * -8 + (i % 3) * 5;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + 4 + (i % 2) * 5, y - 8 - (i % 3) * 3); ctx.lineTo(x + 2, y - 2);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    });
    scene.particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    scene.floats.forEach((float) => {
      const alpha = clamp(float.life / float.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = float.color;
      ctx.font = canvasFont(24, '"Noto Serif SC", serif', 'bold');
      ctx.textAlign = 'center';
      ctx.fillText(float.text, float.x, float.y);
      ctx.globalAlpha = 1;
    });
  }

  const LOGIC_STEP = 1 / 60;
  const MAX_LOGIC_STEPS = 6;

  function updateBattleSimulation(now) {
    scene.time = now;
    if (!state.combat || state.screen !== 'battle') {
      scene.logicLast = now;
      scene.logicAccumulator = 0;
      return false;
    }
    if (state.training?.briefing || state.restartPromptOpen || state.saveManagerOpen || state.testModeOpen || gameplayPausedByOverlay()) {
      scene.logicLast = now;
      scene.logicAccumulator = 0;
      return true;
    }

    const elapsed = Math.min(.1, Math.max(0, (now - scene.logicLast) / 1000));
    scene.logicLast = now;
    scene.logicAccumulator = Math.min(.1, scene.logicAccumulator + elapsed);
    let steps = 0;
    while (scene.logicAccumulator >= LOGIC_STEP && steps < MAX_LOGIC_STEPS) {
      updateRealtimeCombat(LOGIC_STEP, now);
      updateDodge(now);
      updatePlayerMovement(LOGIC_STEP);
      if (state.combat) {
        const blend = 1 - Math.pow(.5, LOGIC_STEP * 60);
        state.combat.playerRenderX += (state.combat.playerX - state.combat.playerRenderX) * blend;
        state.combat.playerRenderY += (state.combat.playerY - state.combat.playerRenderY) * blend;
      }
      updateEffects(LOGIC_STEP);
      scene.logicAccumulator -= LOGIC_STEP;
      steps += 1;
    }
    if (steps >= MAX_LOGIC_STEPS) scene.logicAccumulator = 0;
    return !!state.combat;
  }

  function drawBattleSceneFrame(now) {
    const ctx = battleContext();
    const pixelWidth = dom.canvas.width;
    const pixelHeight = dom.canvas.height;
    const scaleX = pixelWidth / 960;
    const scaleY = pixelHeight / 540;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    if (!state.combat || state.screen !== 'battle') {
      ctx.fillStyle = '#100c09';
      ctx.fillRect(0, 0, 960, 540);
      return;
    }
    if (scene.execution) {
      drawExecutionCinematic(now);
      return;
    }
    const chapter = CHAPTERS[state.chapter];
    const palette = state.combat.boss
      ? { skyTop: '#100b0b', skyBottom: '#4b1718', far: '#2a1212', near: '#150b0b', ground: '#080505', sun: '#e13c32', fog: 'rgba(190,58,44,.14)' }
      : chapter.palette;
    const shake = state.performanceMode ? Math.min(8, scene.shake * .65) : scene.shake;
    const duel = scene.duel;
    const playerX = state.combat.playerRenderX;
    const focusSession = parrySession?.active && parrySession.timeWarp
      ? parrySession
      : shotSession?.active && shotSession.timeWarp ? shotSession : null;
    let focusAmount = 0;
    if (focusSession) {
      const warp = focusSession.timeWarp;
      const progress = focusSession === shotSession ? shotProgressAt(focusSession, now) : parryProgressAt(focusSession, now);
      if (progress >= warp.startP && progress <= warp.endP) {
        const rampIn = clamp((progress - warp.startP) / .025, 0, 1);
        const rampOut = clamp((warp.endP - progress) / .035, 0, 1);
        focusAmount = Math.min(rampIn, rampOut);
      }
    }
    ctx.save();
    ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    if (focusAmount > 0) {
      const zoom = 1 + focusAmount * .115;
      ctx.translate(480, 270);
      ctx.scale(zoom, zoom);
      ctx.translate(-480, -270);
    }
    ctx.drawImage(getCachedBackground(palette, state.combat.boss ? 'huining' : chapter.terrain), 0, 0);
    drawDodgeTrail(now);
    drawSoldier(playerX, state.combat.playerRenderY, 1, now, scene.lunge * 52);
    state.combat.enemies.forEach((enemy, index) => {
      if (duel && index !== duel.enemyIndex) {
        ctx.save();
        ctx.globalAlpha = .2;
        drawEnemyFigure(enemy, index, now);
        ctx.restore();
      } else {
        drawEnemyFigure(enemy, index, now);
      }
    });
    drawDuelMotion(now);
    drawMikiriCounter(now);
    drawEnemyShotAim(now);
    drawEffects();
    ctx.restore();

    if (focusAmount > 0) {
      const focusEdge = ctx.createRadialGradient(480, 270, 150, 480, 270, 565);
      focusEdge.addColorStop(0, 'rgba(0,0,0,0)');
      focusEdge.addColorStop(.7, `rgba(12,7,3,${focusAmount * .045})`);
      focusEdge.addColorStop(1, `rgba(8,4,2,${focusAmount * .32})`);
      ctx.fillStyle = focusEdge;
      ctx.fillRect(0, 0, 960, 540);
      ctx.save();
      ctx.strokeStyle = `rgba(255,218,126,${focusAmount * .34})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, 936, 516);
      ctx.restore();
    }

    if (scene.flash > 0) {
      ctx.fillStyle = `rgba(207,41,32,${scene.flash * .28})`;
      ctx.fillRect(0, 0, 960, 540);
    }
    if (scene.goldFlash > 0) {
      ctx.fillStyle = `rgba(255,214,112,${scene.goldFlash * .2})`;
      ctx.fillRect(0, 0, 960, 540);
    }
    if (scene.perfectFlash > 0) {
      const edge = ctx.createRadialGradient(480, 270, 165, 480, 270, 560);
      edge.addColorStop(0, 'rgba(255,226,126,0)');
      edge.addColorStop(.58, `rgba(255,205,90,${scene.perfectFlash * .025})`);
      edge.addColorStop(.84, `rgba(255,210,105,${scene.perfectFlash * .16})`);
      edge.addColorStop(1, `rgba(255,242,185,${scene.perfectFlash * .42})`);
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, 960, 540);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(255,241,181,${scene.perfectFlash * .92})`;
      ctx.shadowColor = '#ffe6a0';
      ctx.shadowBlur = state.performanceMode ? 0 : 26;
      ctx.lineWidth = 10 + scene.perfectFlash * 14;
      ctx.strokeRect(8, 8, 944, 524);
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = scene.perfectFlash * .72;
      for (let i = 0; i < 12; i++) {
        const horizontal = i % 2 === 0;
        const side = i < 6 ? 0 : 1;
        const along = (i % 6) / 5;
        ctx.beginPath();
        if (horizontal) {
          const y = side ? 534 : 6;
          const x = 60 + along * 840;
          ctx.moveTo(x - 46, y);
          ctx.lineTo(x + 46, y);
        } else {
          const x = side ? 954 : 6;
          const y = 48 + along * 444;
          ctx.moveTo(x, y - 36);
          ctx.lineTo(x, y + 36);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (scene.invulnerabilityFlash > 0) {
      ctx.save();
      ctx.globalAlpha = scene.invulnerabilityFlash;
      ctx.strokeStyle = 'rgba(208,230,186,.75)';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 928, 508);
      ctx.restore();
    }
  }

  let lastGamepadPollAt = 0;
  function drawBattleScene(now) {
    try {
      const battleVisible = state.screen === 'battle' && !!state.combat;
      // 菜单和地图也依赖这里轮询手柄，但不需要一直绘制隐藏的战斗画布。
      // 战斗内每次刷新都读手柄；非战斗界面限制到约 60–80Hz，省电时更轻。
      if (battleVisible || !lastGamepadPollAt || now - lastGamepadPollAt >= 12) {
        pollGamepad(now);
        lastGamepadPollAt = now;
      }
      if (!battleVisible) {
        scene.logicLast = now;
        scene.logicAccumulator = 0;
        scene.lastRender = 0;
        requestAnimationFrame(drawBattleScene);
        return;
      }
      updateBattleSimulation(now);
      const battlePaused = state.training?.briefing || state.restartPromptOpen || state.saveManagerOpen || state.testModeOpen || gameplayPausedByOverlay();
      if (battlePaused) {
        if (!scene.pausedRendered) {
          drawBattleSceneFrame(now);
          scene.pausedRendered = true;
        }
        requestAnimationFrame(drawBattleScene);
        return;
      }
      scene.pausedRendered = false;
      const frameInterval = state.performanceMode ? 1000 / 30 - 2 : 0;
      if (frameInterval && scene.lastRender && now - scene.lastRender < frameInterval) {
        requestAnimationFrame(drawBattleScene);
        return;
      }
      scene.lastRender = now;
      drawBattleSceneFrame(now);
    } catch (error) {
      showRuntimeError(error);
      scene.duel = null;
      scene.shotAim = null;
      scene.playerAttack = null;
      if (state.combat && !state.combat.finished) {
        state.combat.busy = false;
        state.combat.phase = 'player';
        setActionState();
      }
    }
    requestAnimationFrame(drawBattleScene);
  }

  document.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  requestAnimationFrame(drawBattleScene);

  function init() {
    probeRemoteSaveStorage();
    loadInputBindings();
    initializeSaveLibrary();
    migrateLegacyRunHistoryToSlots();
    loadEnemyCodexState();
    renderSquads();
    state.rng = mulberry32(0x9e3779b9);
    dom.tutorialBtn.addEventListener('click', openManualMenu);
    dom.manualMenuClose?.addEventListener('click', () => closeManualMenu());
    dom.manualGuideBtn?.addEventListener('click', openManualGuide);
    dom.manualPracticeBtn?.addEventListener('click', openManualPractice);
    dom.manualMenuOverlay?.addEventListener('pointerdown', (event) => { if (event.target === dom.manualMenuOverlay) closeManualMenu(); });
    dom.testModeToggle?.addEventListener('click', openTestMode);
    dom.testModeClose?.addEventListener('click', closeTestMode);
    dom.testStartRun?.addEventListener('click', startTestRun);
    dom.testSkipBattle?.addEventListener('click', testSkipBattle);
    dom.testSkipNode?.addEventListener('click', testSkipNode);
    dom.testGrantResources?.addEventListener('click', testGrantResources);
    dom.testEquipmentList?.addEventListener('click', (event) => { const button = event.target.closest('[data-test-equipment]'); if (button) testGrantEquipment(button.dataset.testEquipment); });
    dom.testExit?.addEventListener('click', exitTestMode);
    dom.testComboButtons?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-test-technique]');
      if (button) testGrantTechnique(button.dataset.testTechnique);
    });
    dom.testSingleMap?.addEventListener('click', startTestSingleMap);
    dom.testRelicList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-test-relic]');
      if (button) testGrantRelic(button.dataset.testRelic);
    });
    dom.testEnemyList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-test-enemy]');
      if (button) startTestEnemy(button.dataset.testEnemy, button.dataset.testRank);
    });
    dom.continueRunBtn?.addEventListener('click', continueCurrentRun);
    dom.pauseToggle?.addEventListener('click', openPauseMenu);
    dom.pauseResume?.addEventListener('click', closePauseMenu);
    dom.pauseSaveExit?.addEventListener('click', saveAndExitToTitle);
    dom.saveManagerToggle?.addEventListener('click', openSaveManager);
    dom.saveManagerBtn?.addEventListener('click', openSaveManager);
    dom.saveManagerClose?.addEventListener('click', closeSaveManager);
    dom.saveManagerDone?.addEventListener('click', closeSaveManager);
    dom.saveSlotNew?.addEventListener('click', createNewSaveSlot);
    dom.openSaveFolder?.addEventListener('click', () => { if (remoteSaveAvailable) remoteRequest('GET', 'open-save-folder'); });
    dom.saveSlotList?.addEventListener('click', (event) => {
      const play = event.target.closest('[data-save-slot-play]');
      if (play) { switchToSaveSlot(play.dataset.saveSlotPlay); return; }
      const remove = event.target.closest('[data-save-slot-delete]');
      if (!remove) return;
      if (remove.dataset.confirm !== '1') {
        remove.dataset.confirm = '1';
        remove.textContent = '再次点击删除';
        return;
      }
      deleteSaveSlot(remove.dataset.saveSlotDelete);
      showToast('这份存档已经删除。');
    });
    dom.runHistoryBtn?.addEventListener('click', openRunHistory);
    dom.runHistoryClose?.addEventListener('click', closeRunHistory);
    dom.runHistoryDone?.addEventListener('click', closeRunHistory);
    dom.enemyCodexBtn?.addEventListener('click', openEnemyCodex);
    dom.codexCategoryRow?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-codex-tab]');
      if (!button) return;
      activeCodexTab = button.dataset.codexTab;
      selectedCodexKey = '';
      renderEnemyCodex();
      playSound('click');
    });
    dom.enemyCodexGrid?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-codex-key]');
      if (!card) return;
      selectCodexEntry(activeCodexTab, card.dataset.codexKey, true);
      playSound('click');
    });
    dom.enemyCodexClose?.addEventListener('click', closeEnemyCodex);
    dom.enemyCodexDone?.addEventListener('click', closeEnemyCodex);
    dom.tutorialPractice?.addEventListener('click', () => { continueToPracticalAfterGuide = false; openTrainingMenu(); });
    dom.trainingSelect?.addEventListener('click', openTrainingMenu);
    dom.trainingExit?.addEventListener('click', () => finishPracticalTutorial('已跳过战前演练。'));
    dom.trainingQuickSkip?.addEventListener('click', () => finishPracticalTutorial('已跳过战前演练。'));
    dom.trainingMenuClose?.addEventListener('click', closeTrainingMenu);
    dom.trainingMenuSkip?.addEventListener('click', skipTrainingMenu);
    dom.trainingStartFull?.addEventListener('click', () => startPracticalTutorial(0, false));
    dom.trainingLessonGrid?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-training-step]');
      if (!card) return;
      startPracticalTutorial(Number(card.dataset.trainingStep), true);
    });
    dom.trainingBriefConfirm?.addEventListener('click', () => resolveTrainingBrief('primary'));
    dom.trainingBriefSecondary?.addEventListener('click', () => resolveTrainingBrief('menu'));
    dom.trainingBriefSkip?.addEventListener('click', () => resolveTrainingBrief('skip'));
    dom.tutorialClose.addEventListener('click', () => closeTutorial(true));
    dom.tutorialSkip.addEventListener('click', () => closeTutorial(true));
    dom.tutorialPrev.addEventListener('click', () => {
      tutorialStep = Math.max(0, tutorialStep - 1);
      renderTutorialStep();
    });
    dom.tutorialNext.addEventListener('click', () => {
      if (tutorialStep >= dom.tutorialSlides.length - 1) closeTutorial(true);
      else { tutorialStep += 1; renderTutorialStep(); }
    });
    dom.difficultyBack?.addEventListener('click', () => setScreen('mode'));
    dom.startBtn.addEventListener('click', () => {
      if (loadCurrentRunSave()) {
        showToast('这份存档已有行军，请继续或去存档夹新建存档。');
        openSaveManager();
        return;
      }
      const input = dom.seedInput.value.trim();
      const seedText = input || String(Math.floor(Math.random() * 900000000) + 100000000);
      state.seed = /^\d+$/.test(seedText) ? Number(seedText) >>> 0 : hashSeed(seedText);
      state.rng = mulberry32(state.seed);
      state.squadOptions = shuffle(state.rng, Object.keys(SQUADS)).slice(0, 3);
      selectedSquadId = state.squadOptions[0] || null;
      renderModeCards();
      setScreen('mode');
      setMeta();
    });
    dom.restartBtn.addEventListener('click', () => openRestartConfirm(false));
    dom.pauseAbandonRun?.addEventListener('click', () => openRestartConfirm(true));
    dom.restartConfirmCancel?.addEventListener('click', closeRestartConfirm);
    dom.restartConfirmButton?.addEventListener('click', confirmRestartRun);
    dom.endingRestart.addEventListener('click', resetRun);
    dom.historyContinue.addEventListener('click', () => {
      if (typeof state.historyContinue === 'function') state.historyContinue();
    });
    dom.bossStart.addEventListener('click', startBoss);
    dom.endingSources.addEventListener('click', () => dom.endingSourcePanel.classList.toggle('hidden'));
    let savedPerformanceMode = false;
    let savedVolume = 1;
    let savedMusicVolume = .9;
    let savedSfxVolume = 1.18;
    let savedResolution = 'auto';
    let savedSound = true;
    let savedStartupWindow = 'maximized';
    let savedStartFullscreen = false;
    try {
      savedPerformanceMode = localStorage.getItem(PERFORMANCE_KEY) === '1';
      const storedSound = localStorage.getItem('longMarchSoundEnabledV1');
      if (storedSound !== null) savedSound = storedSound !== '0';
      savedResolution = localStorage.getItem('longMarchResolutionV1') || 'auto';
      const storedGamepadLayout = localStorage.getItem('longMarchGamepadLayoutV1') || 'auto';
      if (['auto','xbox','nintendo'].includes(storedGamepadLayout)) state.gamepadLayout = storedGamepadLayout;
    } catch (_) {}
    const storedGameSettings = readStorageJson(GAME_SETTINGS_KEY, {}) || {};
    // 注意：键不存在时 getItem 返回 null，而 Number(null) === 0（不是 NaN）。
    // 之前直接 Number(...) 会让"从没存过音量"被读成 0，进而覆盖默认值 1，
    // 表现为全新安装全程无声，而且这个 0 还会被写回存储变成永久静音。
    const legacyVolume = (() => {
      try {
        const raw = localStorage.getItem('longMarchVolumeV1');
        if (raw === null || raw === '') return NaN;
        const value = Number(raw);
        return Number.isFinite(value) ? value : NaN;
      } catch (_) { return NaN; }
    })();
    // 已经被上面那个 bug 写坏存档的机器（legacy 键是 0，但设置面板从没写过 masterVolume），
    // 同样回落到默认音量，否则修了读取逻辑也救不回这些机器。
    const hasExplicitMasterVolume = Object.prototype.hasOwnProperty.call(storedGameSettings, 'masterVolume');
    const legacyVolumeUsable = Number.isFinite(legacyVolume) && !(legacyVolume === 0 && !hasExplicitMasterVolume);
    const masterVolumeFallback = legacyVolumeUsable ? legacyVolume : savedVolume;
    const readSettingNumber = (key, fallback, min, max) => {
      const value = Number(storedGameSettings[key]);
      return clamp(Number.isFinite(value) ? value : fallback, min, max);
    };
    savedVolume = readSettingNumber('masterVolume', masterVolumeFallback, 0, 1);
    savedMusicVolume = readSettingNumber('musicVolume', savedMusicVolume, 0, 1);
    savedSfxVolume = readSettingNumber('sfxVolume', savedSfxVolume, 0, 1.5);
    if (['maximized', '1280x720', '1600x900', '1920x1080', '2560x1440'].includes(storedGameSettings.startupWindowMode)) savedStartupWindow = storedGameSettings.startupWindowMode;
    savedStartFullscreen = !!storedGameSettings.startFullscreen;
    state.volume = savedVolume;
    state.musicVolume = savedMusicVolume;
    state.sfxVolume = savedSfxVolume;
    state.startupWindowMode = savedStartupWindow;
    state.startFullscreen = savedStartFullscreen;
    state.resolutionMode = savedResolution;
    state.sound = savedSound;
    persistGameSettings();
    updateAdaptiveUiScale();
    applyPerformanceMode(savedPerformanceMode, false);
    applyResolutionMode(savedResolution, false);
    syncSettingsUi();
    dom.settingsToggle.addEventListener('click', openSettings);
    dom.exitGameBtn?.addEventListener('click', exitGame);
    dom.buffDetailBtn.addEventListener('click', openBuffDetails);
    dom.buffDetailClose.addEventListener('click', closeBuffDetails);
    dom.buffDetailDone.addEventListener('click', closeBuffDetails);
    dom.buffDetailOverlay.addEventListener('pointerdown', (event) => {
      if (event.target === dom.buffDetailOverlay) closeBuffDetails();
    });
    dom.settingsClose.addEventListener('click', closeSettings);
    dom.settingsDone.addEventListener('click', closeSettings);
    dom.bindingList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-bind-kind][data-bind-action]');
      if (!button || button.disabled) return;
      startBindingCapture(button.dataset.bindKind, button.dataset.bindAction);
    });
    dom.bindingReset?.addEventListener('click', resetInputBindings);
    syncBindingLabels();
    dom.settingsOverlay.addEventListener('pointerdown', (event) => {
      if (event.target === dom.settingsOverlay) closeSettings();
    });
    dom.volumeSlider.addEventListener('input', () => {
      state.volume = clamp(Number(dom.volumeSlider.value) / 100, 0, 1);
      syncSettingsUi();
      persistGameSettings();
    });
    dom.musicVolumeSlider?.addEventListener('input', () => {
      state.musicVolume = clamp(Number(dom.musicVolumeSlider.value) / 100, 0, 1);
      syncSettingsUi();
      persistGameSettings();
    });
    dom.sfxVolumeSlider?.addEventListener('input', () => {
      state.sfxVolume = clamp(Number(dom.sfxVolumeSlider.value) / 100, 0, 1.5);
      syncSettingsUi();
      persistGameSettings();
    });
    dom.startupWindowSelect?.addEventListener('change', () => {
      state.startupWindowMode = dom.startupWindowSelect.value || 'maximized';
      persistGameSettings();
      showToast('启动窗口已保存，下次启动生效。');
    });
    dom.startFullscreenToggle?.addEventListener('click', () => {
      state.startFullscreen = !state.startFullscreen;
      syncSettingsUi();
      persistGameSettings();
      showToast(state.startFullscreen ? '下次启动将直接进入全屏。' : '下次启动将按窗口大小打开。');
    });
    dom.resolutionSelect.addEventListener('change', () => {
      applyResolutionMode(dom.resolutionSelect.value, true);
      showToast(`画面清晰度：${dom.resolutionSelect.options[dom.resolutionSelect.selectedIndex].text}`);
    });
    dom.gamepadLayout?.addEventListener('change', () => {
      state.gamepadLayout = dom.gamepadLayout.value;
      try { localStorage.setItem('longMarchGamepadLayoutV1', state.gamepadLayout); } catch (_) {}
      showToast(`手柄按键：${dom.gamepadLayout.options[dom.gamepadLayout.selectedIndex].text}`);
    });
    dom.fullscreenToggle.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', syncFullscreenUi);
    if ('ResizeObserver' in window) {
      // 画布容器、战斗屏、控制条任一尺寸变化都重算一次内接尺寸：
      // 以前只盯画布自己，顶栏一变高、控制条一换行，画布不会跟着缩，底栏就被挤出屏幕。
      const fitObserver = new ResizeObserver(scheduleCanvasFit);
      for (const target of [dom.canvas.parentElement, document.getElementById('screen-battle'), document.querySelector('.control-bar')]) {
        if (target) fitObserver.observe(target);
      }
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        let topbarFrame = 0;
        new ResizeObserver(() => {
          if (topbarFrame) return;
          topbarFrame = requestAnimationFrame(() => {
            topbarFrame = 0;
            // --topbar-height 同时被当成 .topbar 自身的 height/min-height；
            // 直接量会把上一次的值当最小值，顶栏换行后就再也降不回来（只增不减）。
            // 量之前先松开这条约束，拿到的是真实内容高度。
            const inlineHeight = topbar.style.height;
            const inlineMin = topbar.style.minHeight;
            topbar.style.height = 'auto';
            topbar.style.minHeight = '0px';
            const height = Math.ceil(topbar.getBoundingClientRect().height);
            topbar.style.height = inlineHeight;
            topbar.style.minHeight = inlineMin;
            const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-height')) || 0;
            if (height > 0 && Math.abs(height - current) > 1) {
              document.documentElement.style.setProperty('--topbar-height', `${height}px`);
              scheduleCanvasFit();
            }
          });
        }).observe(topbar);
      }
    }
    window.addEventListener('resize', () => { updateAdaptiveUiScale(); scheduleCanvasFit(); }, { passive: true });
    syncFullscreenUi();
    dom.performanceToggle.addEventListener('click', () => {
      applyPerformanceMode(!state.performanceMode, true);
      showToast(state.performanceMode ? '性能模式已开启：画面更轻快。' : '完整画面已恢复。');
    });
    dom.selectionConfirm.addEventListener('click', () => {
      if (state.screen === 'squad' && selectedSquadId) chooseSquad(selectedSquadId);
      else if (state.screen === 'route' && selectedRouteIndex >= 0) chooseRoute(selectedRouteIndex);
      else if (state.screen === 'event') chooseEvent(selectedEventIndex);
      else if (state.screen === 'reward') chooseReward(selectedRewardIndex);
    });
    dom.choiceDetailOverlay.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      closeChoiceDetail();
    });
    dom.eventDetailOverlay.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      closeEventChoiceDetail();
    });
    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) return;
      if (dom.acquisitionOverlay && !dom.acquisitionOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape' || event.code === 'Enter' || event.code === 'Space') { event.preventDefault(); confirmAcquisition(); }
        return;
      }
      if ((event.code === 'Escape' || event.code === 'KeyP') && dom.pauseOverlay && !dom.pauseOverlay.classList.contains('hidden')) {
        event.preventDefault();
        closePauseMenu();
        return;
      }
      if (event.code === 'Escape') {
        if (dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeRelicDetail();
        } else if (dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeGrowthPanel();
        } else if (dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeEquipmentPanel();
        } else if (dom.bonfireOverlay && !dom.bonfireOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeBonfirePanel();
        } else if (dom.npcOverlay && !dom.npcOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeNpcPanel();
        } else if (dom.saveManagerOverlay && !dom.saveManagerOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeSaveManager();
        } else if (dom.testModeOverlay && !dom.testModeOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeTestMode();
        } else if (dom.settingsOverlay && !dom.settingsOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeSettings();
        } else if (dom.buffDetailOverlay && !dom.buffDetailOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeBuffDetails();
        } else if (!dom.choiceDetailOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeChoiceDetail();
        } else if (!dom.eventDetailOverlay.classList.contains('hidden')) {
          event.preventDefault();
          closeEventChoiceDetail();
        } else if (canPauseGame() && !blockingGameplayModalOpen()) {
          event.preventDefault();
          openPauseMenu();
        }
      }
      if (event.code === 'KeyP' && canPauseGame() && !blockingGameplayModalOpen()) {
        event.preventDefault();
        openPauseMenu();
      }
    });
    dom.shopContinue?.addEventListener('click', closeShop);
    dom.relicHud?.addEventListener('click', (event) => { const button = event.target.closest('[data-hud-relic]'); if (button) openRelicDetail(button.dataset.hudRelic); });
    dom.relicDetailClose?.addEventListener('click', closeRelicDetail);
    dom.relicDetailDone?.addEventListener('click', closeRelicDetail);
    dom.growthToggle?.addEventListener('click', openGrowthPanel);
    dom.growthClose?.addEventListener('click', closeGrowthPanel);
    dom.talentTree?.addEventListener('click', (event) => { const button = event.target.closest('[data-talent-id]'); if (!button) return; selectedTalentId = button.dataset.talentId; renderGrowthPanel(); });
    dom.talentConfirm?.addEventListener('click', () => { if (selectedTalentId) unlockTalent(selectedTalentId); });
    dom.equipmentToggle?.addEventListener('click', openEquipmentPanel);
    dom.equipmentClose?.addEventListener('click', closeEquipmentPanel);
    dom.equipmentDone?.addEventListener('click', closeEquipmentPanel);
    dom.equipmentInventory?.addEventListener('click', (event) => { const button = event.target.closest('[data-equipment-uid]'); if (!button) return; selectedEquipmentUid = button.dataset.equipmentUid; renderEquipmentPanel(); });
    dom.equipmentEquip?.addEventListener('click', toggleSelectedEquipment);
    dom.equipmentUpgrade?.addEventListener('click', () => { if (selectedEquipmentUid) upgradeEquipmentUnit(selectedEquipmentUid); });
    dom.npcClose?.addEventListener('click', closeNpcPanel);
    dom.npcOptions?.addEventListener('click', (event) => { const button = event.target.closest('[data-npc-action]'); if (button && !button.disabled) handleNpcAction(button.dataset.npcAction); });
    dom.bonfireClose?.addEventListener('click', closeBonfirePanel);
    dom.bonfireList?.addEventListener('click', (event) => { const button = event.target.closest('[data-bonfire-id]'); if (button && !button.disabled) travelToBonfire(button.dataset.bonfireId); });
    dom.acquisitionConfirm?.addEventListener('click', confirmAcquisition);
    let lastButtonClickSoundAt = 0;
    const playButtonClickSound = () => {
      const now = performance.now();
      if (now - lastButtonClickSoundAt < 55) return;
      lastButtonClickSoundAt = now;
      playSound('click');
    };
    document.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button, [role="button"]')) playButtonClickSound();
    }, { capture: true, passive: true });
    document.addEventListener('click', (event) => {
      if (event.target.closest('button, [role="button"]')) playButtonClickSound();
    }, { capture: true });
    dom.gamepadRefresh?.addEventListener('click', () => {
      pollGamepad(performance.now());
      const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
      showToast(pads.length ? '手柄已连接。' : '尚未找到手柄，请连接后按一下手柄按键。');
    });
    window.addEventListener('gamepadconnected', (event) => {
      const pad = navigator.getGamepads?.()[event.gamepad.index] || event.gamepad;
      syncGamepadUi(pad);
      showToast('手柄已连接。');
    });
    window.addEventListener('gamepaddisconnected', () => {
      syncGamepadUi(null);
      showToast('手柄已断开，已换回键鼠。');
    });

    dom.soundToggle.addEventListener('click', () => {
      state.sound = !state.sound;
      syncSettingsUi();
      updateAudioMix();
      try { localStorage.setItem('longMarchSoundEnabledV1', state.sound ? '1' : '0'); } catch (_) {}
      if (state.sound) playSound('click');
    });
    dom.quickItemHud?.addEventListener('click', useQuickItem);
    dom.quickItemHud?.addEventListener('contextmenu', (event) => { event.preventDefault(); cycleQuickItem(); });
    dom.dodgeButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!shotSession?.active) showToast('枪尖闪光时按 Space / B，可拉枪识破。');
      performDodge();
    });
    dom.parryOverlay.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (event.button !== 0) {
        showToast('敌军出刀时按 F 或 LB 格挡。');
      } else if (parrySession?.resolved && (parrySession.grade === 'block' || parrySession.grade === 'perfect') && state.combat?.counterWindowUntil > performance.now()) {
        state.combat.queuedAttack = 'normal';
        dom.parryResult.textContent = '守反已蓄势 · 收势后立刻出刀';
      } else if (shotSession?.active) {
        attemptShotDefense('pointer');
      } else if (state.training?.active && state.training.step === 3 && parrySession?.active) {
        performDodge();
      } else {
        attemptParry('pointer');
      }
    });
    document.addEventListener('contextmenu', (event) => {
      if (state.screen === 'battle') event.preventDefault();
    });
    document.addEventListener('auxclick', (event) => {
      if (state.screen === 'battle') event.preventDefault();
    });
    dom.parryOverlay.addEventListener('contextmenu', (event) => event.preventDefault());
    dom.canvas.addEventListener('pointerdown', startAttackHold);
    dom.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener('pointerup', (event) => {
      if (event.button === 0) releaseAttackHold();
    });
    window.addEventListener('pointercancel', () => {
      if (!state.combat || !state.combat.holding) return;
      state.combat.holding = false;
      cancelAnimationFrame(state.combat.holdFrame);
      dom.chargeMeter.style.width = '0%';
      dom.controlBar.classList.remove('charging');
      setActionState();
    });
    window.addEventListener('keydown', (event) => {
      if (state.bindingCapture?.kind === 'key' && performance.now() >= (state.bindingCapture.armedAt || 0)) {
        event.preventDefault();
        event.stopPropagation();
        if (event.code === 'Escape') {
          state.bindingCapture = null;
          renderInputBindings();
          showToast('已取消按键绑定。');
        } else {
          assignInputBinding('key', state.bindingCapture.action, event.code);
        }
        return;
      }
      if (dom.acquisitionOverlay && !dom.acquisitionOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape' || event.code === 'Enter' || event.code === 'Space') { event.preventDefault(); confirmAcquisition(); }
        return;
      }
      if (dom.pauseOverlay && !dom.pauseOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape' || event.code === 'KeyP') { event.preventDefault(); closePauseMenu(); }
        return;
      }
      if (dom.relicDetailOverlay && !dom.relicDetailOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') { event.preventDefault(); closeRelicDetail(); }
        return;
      }
      if (dom.growthOverlay && !dom.growthOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') { event.preventDefault(); closeGrowthPanel(); }
        return;
      }
      if (dom.equipmentOverlay && !dom.equipmentOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') { event.preventDefault(); closeEquipmentPanel(); }
        return;
      }
      if (dom.npcOverlay && !dom.npcOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') { event.preventDefault(); closeNpcPanel(); }
        return;
      }
      if (dom.testModeOverlay && !dom.testModeOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') { event.preventDefault(); closeTestMode(); }
        return;
      }
      if (dom.restartConfirmOverlay && !dom.restartConfirmOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeRestartConfirm();
        }
        return;
      }
      if (dom.runHistoryOverlay && !dom.runHistoryOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeRunHistory();
        }
        return;
      }
      if (dom.manualMenuOverlay && !dom.manualMenuOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeManualMenu();
        }
        return;
      }
      if (dom.trainingBriefOverlay && !dom.trainingBriefOverlay.classList.contains('hidden')) {
        if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();
          dom.trainingBriefConfirm.click();
        } else if (event.code === 'Escape') {
          event.preventDefault();
          dom.trainingBriefSecondary.click();
        }
        return;
      }
      if (dom.trainingMenuOverlay && !dom.trainingMenuOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeTrainingMenu();
        }
        return;
      }
      if (!dom.tutorialOverlay.classList.contains('hidden')) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeTutorial(true);
        } else if (event.code === 'ArrowRight') {
          event.preventDefault();
          if (tutorialStep >= dom.tutorialSlides.length - 1) closeTutorial(true);
          else { tutorialStep += 1; renderTutorialStep(); }
        } else if (event.code === 'ArrowLeft') {
          event.preventDefault();
          tutorialStep = Math.max(0, tutorialStep - 1);
          renderTutorialStep();
        }
        return;
      }
      if (state.screen === 'battle' && event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
      }
      if (state.screen === 'map') {
        if (keyMatches(event, 'moveLeft') || event.code === 'ArrowLeft') { event.preventDefault(); movementInput.left = true; return; }
        if (keyMatches(event, 'moveRight') || event.code === 'ArrowRight') { event.preventDefault(); movementInput.right = true; return; }
        if (keyMatches(event, 'moveUp') || event.code === 'ArrowUp') { event.preventDefault(); movementInput.up = true; return; }
        if (keyMatches(event, 'moveDown') || event.code === 'ArrowDown') { event.preventDefault(); movementInput.down = true; return; }
        if (keyMatches(event, 'sprint')) { event.preventDefault(); movementInput.sprint = true; return; }
        if (keyMatches(event, 'interact')) { event.preventDefault(); if (!event.repeat) interactSingleMap(); return; }
        if (keyMatches(event, 'item') || keyMatches(event, 'heal')) event.preventDefault();
        return;
      }
      if (state.screen === 'battle') {
        if (event.code === 'Escape' && state.training?.active) {
          event.preventDefault();
          event.stopPropagation();
          finishPracticalTutorial('已跳过战前演练。');
          return;
        }
        if (keyMatches(event, 'moveLeft') || event.code === 'ArrowLeft') {
          event.preventDefault();
          movementInput.left = true;
          return;
        }
        if (keyMatches(event, 'moveRight') || event.code === 'ArrowRight') {
          event.preventDefault();
          movementInput.right = true;
          return;
        }
        if (keyMatches(event, 'moveUp') || event.code === 'ArrowUp') {
          event.preventDefault();
          movementInput.up = true;
          return;
        }
        if (keyMatches(event, 'moveDown') || event.code === 'ArrowDown') {
          event.preventDefault();
          movementInput.down = true;
          return;
        }
        if (keyMatches(event, 'attack')) {
          event.preventDefault();
          if (!event.repeat) startAttackHold({ button: 0 });
          return;
        }
        if (keyMatches(event, 'jump')) {
          event.preventDefault();
          if (!event.repeat) performJump();
          return;
        }
        if (keyMatches(event, 'dodge')) {
          event.preventDefault();
          if (!event.repeat) performDodge();
          return;
        }
        if (!parrySession?.active && keyMatches(event, 'shoot')) {
          event.preventDefault();
          fireRifle();
          return;
        }
        if (!parrySession?.active && keyMatches(event, 'heal')) {
          event.preventDefault();
          useEmergencyHeal();
          return;
        }
        if (keyMatches(event, 'item')) {
          event.preventDefault();
          if (!event.repeat) useQuickItem();
          return;
        }
        if (keyMatches(event, 'execute')) {
          event.preventDefault();
          if (!event.repeat) gamepadExecute();
          return;
        }
        if (keyMatches(event, 'buffs')) {
          event.preventDefault();
          if (!event.repeat) openBuffDetails();
          return;
        }
      }
      if (event.code === 'BrowserBack' || event.code === 'BrowserForward') {
        if (state.screen === 'battle') event.preventDefault();
        return;
      }
      const parryKey = keyMatches(event, 'guard');
      if (parryKey) {
        event.preventDefault();
        if (event.repeat) {
          if (state.combat?.blockHeld) state.combat.blockHeldAt = performance.now();
          return;
        }
        pressGuardInput('key');
      }
    });
    window.addEventListener('keyup', (event) => {
      if (keyMatches(event, 'moveLeft') || event.code === 'ArrowLeft') movementInput.left = false;
      if (keyMatches(event, 'moveRight') || event.code === 'ArrowRight') movementInput.right = false;
      if (keyMatches(event, 'moveUp') || event.code === 'ArrowUp') movementInput.up = false;
      if (keyMatches(event, 'moveDown') || event.code === 'ArrowDown') movementInput.down = false;
      if (keyMatches(event, 'sprint')) movementInput.sprint = false;
      if (keyMatches(event, 'attack')) releaseAttackHold();
      if (keyMatches(event, 'guard')) releaseGuardInput();
    });
    window.addEventListener('blur', () => {
      movementInput.left = false;
      movementInput.right = false;
      movementInput.up = false;
      movementInput.down = false;
      movementInput.sprint = false;
      controllerInput.sprint = false;
      if (state.combat) state.combat.blockHeld = false;
      setActionState();
    });
    setScreen('title');
    setTimeout(() => {
      const hasSavedRun = !!loadCurrentRunSave();
      if (!hasSavedRun && state.screen === 'title' && beginActiveSlotOnboarding()) return;
      if (dom.continueRunBtn && hasSavedRun) dom.continueRunBtn.focus({ preventScroll: true });
      else if (dom.startBtn) dom.startBtn.focus({ preventScroll: true });
    }, 320);
  }

  window.__longMarch = { state, GAME_VERSION, openTestMode, startTestRun, exitTestMode, startTestEnemy, startTestSingleMap, grantRelic, unlockTechnique, acquireEquipment, equipEquipmentUnit, unequipEquipmentUnit, grantKey, openMapChest, openMapDoor, openNpcPanel, revealHiddenVaultForMap, unlockHiddenAreaForMap, migrateSingleMapV7, interactSingleMap, resolveSinglePickup, resolveSingleInteraction, mapActionFor, singleMapBlockedBy, singleMapBlockerName, currentNpcSpawn, checkAchievements, ACHIEVEMENTS, openPauseMenu, closePauseMenu, saveAndExitToTitle, captureCombatSnapshot, confirmAcquisition, openGrowthPanel, renderGrowthPanel, openRelicDetail, renderTopRelics, relicArtSvg, saveCurrentRun, loadCurrentRunSave, applySavedPlayerState, updateMetaBars, renderSingleMapTasks, finishDefeat, getTestModeDebug: () => ({ testMode: state.testMode, testRunActive, testModeSavedRun, hasFormalSnapshot: !!testModeFormalSnapshot, formalSnapshotSavedAt: testModeFormalSnapshot?.savedAt || null, exitPending: !!testModeExitTimer, epoch: testRunEpoch }), RELICS, RELIC_SYNERGIES, PLAYER_TECHNIQUES, EQUIPMENT_ITEMS, EQUIPMENT_RARITIES, KEYS, TALENT_TREE, NPC_DEFINITIONS, ROGUELIKE_ACTS, ROGUELIKE_STEPS, beginPlayerAttack, getCombatDebug: () => ({ comboStage: state.combat?.comboStage || 0, comboExpiresAt: state.combat?.comboExpiresAt || 0, attack: scene.playerAttack ? { type: scene.playerAttack.type, comboStage: scene.playerAttack.comboStage, techniqueId: scene.playerAttack.techniqueId || null, windup: scene.playerAttack.windup, active: scene.playerAttack.active, recovery: scene.playerAttack.recovery } : null, techniques: [...(state.player?.techniques || [])] }), getAudioState: () => ({ mode: musicMode, contextState: audioCtx?.state || 'none', musicGain: musicBus?.gain?.value || 0, masterGain: audioMaster?.gain?.value || 0, sfxGain: sfxBus?.gain?.value || 0, hasMusicBus: !!musicBus, hasSfxBus: !!sfxBus, step: musicStep }), playSound, SOURCES, CHAPTERS, SQUADS, UPGRADES, SHOP_ITEMS, EVENTS, ENEMY_TYPES, ENEMY_CODEX_ENTRIES, ELITE_SPECIALS, LATE_ELITE_POOLS, discoveredEnemyCodexIds, renderRouteScreen, showRoute, showChapterEvent, startBattle, showRewards, proceedAfterReward, generateSingleMap, renderSingleMap, singleMapPointWalkable, openShop, purchaseShopItem, makeEnemy, createEnemies, openEnemyCodex, renderEnemyCodex, openSaveManager, renderSaveManager, createNewSaveSlot, switchToSaveSlot, deleteSaveSlot, archiveRun, renderRunHistory, PLAYER_COMBO_PROFILES, ELITE_VARIANTS, addPlayerPosture, breakEnemyPosture, performRealtimeEnemyAction, updateEnemyMovement, performDodge, enemyAttack, gainXp, applyEventChoiceBonuses };
  window.__longMarch.singleMapInteractionPoints = singleMapInteractionPoints;
  window.__longMarch.separateSingleMapInteractionPoints = separateSingleMapInteractionPoints;
  window.__longMarch.singleMapInteractionPointsOverlap = singleMapInteractionPointsOverlap;
  window.__longMarch.SINGLE_MAP_POINT_GAP = SINGLE_MAP_POINT_GAP;
  window.__longMarch.validateSingleMapPlacement = singleMapPlacementIsValid;
  window.__longMarch.singleMapPointOnWalkableSurface = singleMapPointOnWalkableSurface;
  window.__longMarch.resolveSingleMapMovement = resolveSingleMapMovement;
  window.__longMarch.updateSingleMap = updateSingleMap;
  document.addEventListener('DOMContentLoaded', init);
})();
