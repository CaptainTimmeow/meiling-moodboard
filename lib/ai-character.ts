import type { CanvasElement } from "@/types";

export type Locale = "zh" | "en";

export interface BoardContext {
  title: string;
  elements: CanvasElement[];
  elementCount: number;
  hasText: boolean;
  hasImage: boolean;
  hasAudio: boolean;
}

function analyzeBoard(elements: CanvasElement[]): BoardContext {
  return {
    title: "",
    elements,
    elementCount: elements.length,
    hasText: elements.some((e) => e.type === "text"),
    hasImage: elements.some((e) => e.type === "image"),
    hasAudio: elements.some((e) => e.type === "audio"),
  };
}

const momoResponses: Record<Locale, string[]> = {
  zh: [
    "空白也是故事的一部分。不过，要不要试着放一句今天最想说的话？",
    "我感觉到这个画面在等一个颜色。试试温暖的渐变？",
    "声音有时候比文字更能留住心情。上传一段音乐或环境音吧。",
    "文字和图片叠在一起会产生奇妙的化学反应，试试看。",
    "这个板子现在好安静……像清晨。要加一点光吗？",
    "把两张图叠在一起，或者把文字放大到超出边界，意外往往很美。",
    "你现在的心情是什么形状？试着把它描述成一种颜色或一种天气。",
    "如果这张心情板是一首歌，它现在是什么节奏？",
    "我喜欢这个组合。要不要再加一层，让时间感更深一点？",
    "有时候，把最重要的东西放得小小的，反而最让人注意。",
  ],
  en: [
    "White space is part of the story too. But maybe add one sentence you really want to say today?",
    "I feel like this canvas is waiting for a color. Try a warm gradient?",
    "Sound can capture a mood better than words sometimes. Upload a song or ambient sound.",
    "Text and images overlapping create a kind of chemical reaction—try it.",
    "This board feels so quiet right now… like early morning. Want to add some light?",
    "Overlap two images, or make the text bigger than the frame. Accidents can be beautiful.",
    "What shape is your current mood? Try describing it as a color or a weather.",
    "If this mood board were a song, what tempo would it be right now?",
    "I love this combination. Want to add another layer to deepen the sense of time?",
    "Sometimes the most important thing becomes most noticeable when you make it tiny.",
  ],
};

const contextualResponses: Record<Locale, Record<string, string[]>> = {
  zh: {
    empty: [
      "从头开始总是最让人兴奋的。先丢一句今天的心情进来吧，随便什么都行。",
      "一张白纸有无限可能。你今天是哪种颜色？",
      "还没开始吗？没关系。闭上眼睛，第一个浮现的画面，就是起点。",
    ],
    textOnly: [
      "文字已经在了，要不要给它们配一张图？让画面替你多说出一点。",
      "这些文字读起来很有感觉。试着把某句话放大，让它成为整个板子的情绪锚点。",
    ],
    imageOnly: [
      "图片已经说出了很多。要不要加一句话，像给照片写一句悄悄话？",
      "视觉很丰富了。如果加一段背景音乐，整个氛围会完全不一样。",
    ],
    audioOnly: [
      "有声音的画面很特别。加一句歌词或者心情文字，让它更有故事感。",
      "这段音频是什么来头？给它配一张相关的图吧。",
    ],
    mixed: [
      "这个组合已经很有层次了。试试调整一下元素的大小对比，会有惊喜。",
      "我喜欢这里文字和图片的对话感。要不要再叠一层，让时间流动起来？",
      "看起来你已经找到节奏了。如果换一张深色背景，情绪会不会更沉一点？",
    ],
    colorHelp: [
      "如果你今天心情偏冷，试试蓝紫渐变；偏暖的话，桃粉和嫩绿都很温柔。",
      "深色的背景像夜晚，适合放发光的文字或高饱和的图片。",
      "纯白背景最百搭，但如果想要一点呼吸感，淡淡的薄荷渐变会很治愈。",
    ],
    layoutHelp: [
      "把最重要的元素放在稍微偏左或偏上的位置，人的视线会自然停留。",
      "试试不对齐。刻意地打破网格，反而会让画面更生动。",
      "大小对比是关键。一大一小，一远一近，画面就有了呼吸。",
    ],
    encouragement: [
      "没有对错，只有当下的感觉。你已经做得很棒了。",
      "心情板是写给自己的信，不用完美，只要真实。",
      "我在这儿呢。慢慢玩，不着急。",
    ],
  },
  en: {
    empty: [
      "Starting from scratch is always the most exciting. Drop in one sentence about how you feel today.",
      "A blank canvas has infinite possibilities. What color are you today?",
      "Haven't started yet? It's okay. Close your eyes—the first image that appears is your starting point.",
    ],
    textOnly: [
      "The words are there. How about pairing them with an image? Let the picture say a little more.",
      "These words feel strong. Try making one sentence huge, so it becomes the emotional anchor of the board.",
    ],
    imageOnly: [
      "The images already say a lot. How about adding one sentence, like a whisper to the photo?",
      "The visuals are rich. If you add background music, the whole atmosphere will shift.",
    ],
    audioOnly: [
      "A board with sound is special. Add a lyric or a mood note to give it more story.",
      "Where is this audio from? Pair it with a related image.",
    ],
    mixed: [
      "This combination already has great layers. Try adjusting the size contrast between elements for a surprise.",
      "I love the dialogue between text and image here. Want to add another layer to make time flow?",
      "Looks like you've found the rhythm. Would a darker background make the emotion feel deeper?",
    ],
    colorHelp: [
      "If your mood is cool today, try a blue-purple gradient. For warmth, peach and mint are both gentle.",
      "Dark backgrounds are like night—perfect for glowing text or highly saturated images.",
      "Pure white is the most versatile, but if you want some breathing room, a soft mint gradient is very healing.",
    ],
    layoutHelp: [
      "Place the most important element slightly left or above center—our eyes naturally rest there.",
      "Try misalignment. Deliberately breaking the grid makes the canvas feel more alive.",
      "Contrast in size is key. One big, one small; one far, one near—and the canvas starts to breathe.",
    ],
    encouragement: [
      "There is no right or wrong, only how you feel right now. You're doing great.",
      "A mood board is a letter to yourself. It doesn't need to be perfect, just honest.",
      "I'm right here. Take your time, no rush.",
    ],
  },
};

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(message: string, locale: Locale): string {
  const lower = message.toLowerCase();
  const zhColor = ["颜色", "背景", "色", "配", "渐变"];
  const enColor = ["color", "background", "gradient", "palette", "hue"];
  const zhLayout = ["位置", "大小", "排版", "对齐", "放", "移动", "布局"];
  const enLayout = ["layout", "position", "size", "align", "move", "space"];
  const zhEncourage = ["累", "难", "不会", "不好", "差", "放弃", "丑"];
  const enEncourage = ["tired", "hard", "bad", "ugly", "can't", "suck", "give up"];

  const isColor = locale === "zh" ? zhColor.some((w) => lower.includes(w)) : enColor.some((w) => lower.includes(w));
  const isLayout = locale === "zh" ? zhLayout.some((w) => lower.includes(w)) : enLayout.some((w) => lower.includes(w));
  const isEncourage = locale === "zh" ? zhEncourage.some((w) => lower.includes(w)) : enEncourage.some((w) => lower.includes(w));

  if (isColor) return "colorHelp";
  if (isLayout) return "layoutHelp";
  if (isEncourage) return "encouragement";
  return "general";
}

export function generateMomoResponse(
  message: string,
  locale: Locale,
  elements: CanvasElement[]
): string {
  const ctx = analyzeBoard(elements);
  const intent = detectIntent(message, locale);

  // Priority 1: emotional support
  if (intent === "encouragement") {
    return pickOne(contextualResponses[locale]["encouragement"]);
  }

  // Priority 2: specific help
  if (intent === "colorHelp") {
    return pickOne(contextualResponses[locale]["colorHelp"]);
  }
  if (intent === "layoutHelp") {
    return pickOne(contextualResponses[locale]["layoutHelp"]);
  }

  // Priority 3: board-state based
  if (ctx.elementCount === 0) {
    return pickOne(contextualResponses[locale]["empty"]);
  }
  if (ctx.hasText && !ctx.hasImage && !ctx.hasAudio) {
    return pickOne(contextualResponses[locale]["textOnly"]);
  }
  if (ctx.hasImage && !ctx.hasText && !ctx.hasAudio) {
    return pickOne(contextualResponses[locale]["imageOnly"]);
  }
  if (ctx.hasAudio && !ctx.hasText && !ctx.hasImage) {
    return pickOne(contextualResponses[locale]["audioOnly"]);
  }
  if (ctx.elementCount >= 2) {
    return pickOne(contextualResponses[locale]["mixed"]);
  }

  // Fallback to general Momo wisdom
  return pickOne(momoResponses[locale]);
}
