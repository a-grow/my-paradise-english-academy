import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105"
    >
      <Globe className="w-5 h-5" />
      <span>{language === 'en' ? '繁體中文' : 'English'}</span>
    </button>
  );
};

export default LanguageToggle;
