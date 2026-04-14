"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "zh" | "en";

const translations = {
  zh: {
    // Login
    title: "Meiling 的心情板",
    subtitle: "输入你最喜欢的三个词，开始创作",
    word1: "词 1",
    word2: "词 2",
    word3: "词 3",
    enter: "进入",
    opening: "进入中...",
    errorWrongWords: "这几个词不太对哦，再试一次",

    // Gallery
    moodBoard: "心情板",
    sharedSpace: "我们共同的空间",
    newMoodscapePlaceholder: "给新的心情板取个名字...",
    newEntry: "新建心情板",
    noEntriesYet: "还没有心情板",
    createFirst: "从上面创建一个开始吧",
    leave: "离开",

    // Editor
    back: "返回",
    text: "文字",
    image: "图片",
    audio: "音频",
    background: "背景",
    delete: "删除",
    white: "纯白",
    dark: "深色",
    gradient: "渐变",
    doubleClickEdit: "双击编辑文字",
    untitledAudio: "未命名音频",

    // Language
    language: "语言",
  },
  en: {
    // Login
    title: "Meiling's Mood Board",
    subtitle: "Enter your favorite 3 words to begin",
    word1: "Word 1",
    word2: "Word 2",
    word3: "Word 3",
    enter: "Enter",
    opening: "Opening...",
    errorWrongWords: "Those words don't match. Try again.",

    // Gallery
    moodBoard: "Mood Board",
    sharedSpace: "A shared space",
    newMoodscapePlaceholder: "Name your new moodscape...",
    newEntry: "New entry",
    noEntriesYet: "No entries yet",
    createFirst: "Create your first moodscape above",
    leave: "Leave",

    // Editor
    back: "Back",
    text: "Text",
    image: "Image",
    audio: "Audio",
    background: "Background",
    delete: "Delete",
    white: "White",
    dark: "Dark",
    gradient: "Gradient",
    doubleClickEdit: "Double click to edit",
    untitledAudio: "Untitled audio",

    // Language
    language: "Language",
  },
};

const I18nContext = createContext<{
  locale: Locale;
  t: (key: keyof typeof translations.zh) => string;
  setLocale: (locale: Locale) => void;
}>({
  locale: "zh",
  t: (key) => translations.zh[key],
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("moodboard_locale") as Locale | null;
    if (saved && (saved === "zh" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("moodboard_locale", l);
  };

  const t = (key: keyof typeof translations.zh) => translations[locale][key];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
