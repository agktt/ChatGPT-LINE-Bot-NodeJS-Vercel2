// faq/index.js
export const staticFaqMap = [
  {
    keywords: ["費用", "料金", "金額"],
    answer: "ギョギョッ！メバルの費用感はこちらだギョ！\n\n📦 初期費用：33,000円（税込）～\n📅 月額：11,000円（税込）～\n※台数やプランによって変わるので、くわしくはお問い合わせください♪"
  },
  {
    keywords: ["導入", "ステップ", "流れ"],
    answer: "メバル導入の流れは以下の通りギョ！\n\n1️⃣ お問い合わせ → 2️⃣ 機器準備 → 3️⃣ 設置 or サポート → 4️⃣ 管理画面確認✨"
  },
  {
    keywords: ["必要", "準備", "始めるには"],
    answer: "メバルを始めるには📷カメラ、🌐ネット環境、🖥PCやスマホが必要だギョ〜！"
  }
  // ...必要に応じて追加！
];

export const getStaticFaqAnswer = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const faq of staticFaqMap) {
    if (faq.keywords.some(k => lower.includes(k))) {
      return faq.answer;
    }
  }
  return null;
};
