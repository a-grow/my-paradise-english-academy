import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#1e293b] py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-white/60 text-sm">
          © 2026 My Paradise English. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
