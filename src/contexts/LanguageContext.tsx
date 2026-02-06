import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'lang': 'en',
    // Navigation
    'nav.home': 'Home',
    'nav.classes': 'Classes',
    'nav.curriculum': 'Curriculum',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.badge': "✨ Taiwan's Most Fun English School!",
    'hero.title': 'My Paradise English',
    'hero.subtitle': 'Where Learning English is an Adventure!',
    
    // What's New
    'whatsNew.title': "What's New?",
    
    // Teacher
    'teacher.title': 'Meet Teacher Andy!',
    'teacher.quote': "Hello! My name is Teacher Andy. I believe learning should be an adventure! In my classroom, your child will find a fun, relaxing atmosphere where they can feel safe to express themselves and explore the English language through creativity. I'm here to make every lesson the highlight of their day!",
    'teacher.from': 'From USA',
    'teacher.degree': "Bachelor's Degree",
    'teacher.cert': 'TEFL Certified',
    'teacher.exp': '20 Years Experience',
    
    // Video
    'video.badge': 'Class in Session',
    'video.title': 'Take a Peek!',
    'video.placeholder': 'Watch Our Class Preview',
    
    // Classes
    'classes.badge': 'Classes',
    'classes.title': 'Group Classes',
    'classes.subtitle': 'Join our fun and interactive group learning experiences',
    'classes.groupTitle': 'Group Classes',
    'classes.note': 'All group classes use Oxford Discover books',
    'classes.full': 'FULL',
    'classes.available': 'AVAILABLE',
    
    // Curriculum
    'curriculum.badge': 'World-Class Materials',
    'curriculum.title': 'Oxford Discover Curriculum',
    'curriculum.subtitle': 'World-class learning materials for every level',
    'curriculum.book': 'Oxford Discover',
    'curriculum.level': 'Level',
    'curriculum.clickHint': '👆 Click a book to see class details',
    
    // Contact
    'contact.badge': 'Start Your Adventure!',
    'contact.title': 'Ready to Start?',
    'contact.subtitle': 'Contact us today and begin your English adventure!',
    
    // Footer
    'footer.made': 'Made with',
    'footer.location': 'in Taiwan',
    'footer.rights': 'All rights reserved',
  },
  zh: {
    'lang': 'zh',
    // Navigation
    'nav.home': '首頁',
    'nav.classes': '課程',
    'nav.curriculum': '教材',
    'nav.contact': '聯繫我們',
    
    // Hero
    'hero.badge': '✨ 台灣最有趣的英語學校！',
    'hero.title': 'My Paradise English',
    'hero.subtitle': '學習英語是一場奇妙的冒險！',
    
    // What's New
    'whatsNew.title': '最新消息',
    
    // Teacher
    'teacher.title': '認識 Teacher Andy！',
    'teacher.quote': '哈囉！我是 Teacher Andy。我相信學習應該是一場冒險！在我的課堂上，您的孩子會發現一個有趣、輕鬆的氛圍，讓他們可以安心地表達自己，透過創意探索英語世界。我會讓每一堂課都成為他們一天中最精彩的時刻！',
    'teacher.from': '來自美國',
    'teacher.degree': '學士學位',
    'teacher.cert': 'TEFL 認證',
    'teacher.exp': '20年教學經驗',
    
    // Video
    'video.badge': '課堂進行中',
    'video.title': '來看一看！',
    'video.placeholder': '觀看課程預覽',
    
    // Classes
    'classes.badge': '課程資訊',
    'classes.title': '團體課程',
    'classes.subtitle': '加入我們有趣又互動的團體學習體驗',
    'classes.groupTitle': '團體課程',
    'classes.note': '所有團體課程均使用 Oxford Discover 教材',
    'classes.full': '已滿',
    'classes.available': '可報名',
    
    // Curriculum
    'curriculum.badge': '世界級教材',
    'curriculum.title': 'Oxford Discover 教材',
    'curriculum.subtitle': '世界級的學習教材，適合每個程度',
    'curriculum.book': 'Oxford Discover',
    'curriculum.level': '級別',
    'curriculum.clickHint': '👆 點擊書本查看課程資訊',
    
    // Contact
    'contact.badge': '開始您的冒險！',
    'contact.title': '準備好開始了嗎？',
    'contact.subtitle': '今天就聯繫我們，開始您的英語冒險！',
    
    // Footer
    'footer.made': '用',
    'footer.location': '在台灣製作',
    'footer.rights': '版權所有',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
