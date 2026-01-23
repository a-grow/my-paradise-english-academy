import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.classes': 'Classes',
    'nav.curriculum': 'Curriculum',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'My Paradise English',
    'hero.subtitle': 'Where Learning English is an Adventure!',
    'hero.cta': 'Start Your Journey',
    'hero.availability': 'Check Class Availability',
    
    // Classes
    'classes.title': 'Our Magical Classes',
    'classes.subtitle': 'Choose your perfect learning adventure',
    'classes.oneOnOne': 'One-on-One Classes',
    'classes.oneOnOneDesc': 'Personalized attention with flexible curriculum tailored to your child\'s needs. Includes homework and progress tracking!',
    'classes.group': 'Group Classes',
    'classes.groupDesc': 'Learn with friends! Up to 5 students per class for interactive and fun group learning experiences.',
    'classes.spotsLeft': 'spots left',
    'classes.full': 'Full',
    'classes.available': 'Available',
    'classes.limited': 'Limited Spots',
    
    // Curriculum
    'curriculum.title': 'Oxford Discover Curriculum',
    'curriculum.subtitle': 'World-class learning materials for every level',
    'curriculum.level': 'Level',
    'curriculum.ages': 'Ages',
    'curriculum.book': 'Oxford Discover',
    
    // Contact
    'contact.title': 'Ready to Start?',
    'contact.subtitle': 'Contact us today and begin your English adventure!',
    'contact.cta': 'Get in Touch',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.location': 'Taiwan',
  },
  zh: {
    // Navigation
    'nav.home': '首頁',
    'nav.classes': '課程',
    'nav.curriculum': '教材',
    'nav.contact': '聯繫我們',
    
    // Hero
    'hero.title': 'My Paradise English',
    'hero.subtitle': '學習英語是一場奇妙的冒險！',
    'hero.cta': '開始您的旅程',
    'hero.availability': '查看課程空位',
    
    // Classes
    'classes.title': '我們的神奇課程',
    'classes.subtitle': '選擇您的完美學習冒險',
    'classes.oneOnOne': '一對一課程',
    'classes.oneOnOneDesc': '個人化教學，課程靈活安排，根據孩子的需求量身定制。包含作業和進度追蹤！',
    'classes.group': '團體課程',
    'classes.groupDesc': '與朋友一起學習！每班最多5位學生，互動有趣的團體學習體驗。',
    'classes.spotsLeft': '個名額',
    'classes.full': '已滿',
    'classes.available': '可報名',
    'classes.limited': '名額有限',
    
    // Curriculum
    'curriculum.title': 'Oxford Discover 教材',
    'curriculum.subtitle': '世界級的學習教材，適合每個程度',
    'curriculum.level': '級別',
    'curriculum.ages': '年齡',
    'curriculum.book': 'Oxford Discover',
    
    // Contact
    'contact.title': '準備好開始了嗎？',
    'contact.subtitle': '今天就聯繫我們，開始您的英語冒險！',
    'contact.cta': '立即聯繫',
    
    // Footer
    'footer.rights': '版權所有',
    'footer.location': '台灣',
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
