import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-paradise-purple/90 to-paradise-sky/90 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-paradise-yellow animate-bounce-gentle" />
          <span className="text-2xl font-display font-bold text-white drop-shadow-md">
            My Paradise English
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="nav-link">{t('nav.home')}</a>
          <a href="#classes" className="nav-link">{t('nav.classes')}</a>
          <a href="#curriculum" className="nav-link">{t('nav.curriculum')}</a>
          <a href="#contact" className="nav-link">{t('nav.contact')}</a>
          <a href="/blog" target="_blank" rel="noopener noreferrer" className="nav-link">{t('nav.blog')}</a>
        </div>

        <LanguageToggle />
      </div>
    </nav>
  );
};

export default Navbar;
