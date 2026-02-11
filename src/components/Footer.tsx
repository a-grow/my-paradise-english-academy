import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#1e293b] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-paradise-yellow" />
            <span className="text-xl font-display font-bold text-white">
              My Paradise English
            </span>
          </div>
          
          <p className="text-white/60 text-sm flex items-center gap-2 flex-wrap justify-center">
            {t('footer.made')} <Heart className="w-4 h-4 text-paradise-coral fill-current" /> {t('footer.location')} 
            <span className="mx-2">•</span>
            © 2024 {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
