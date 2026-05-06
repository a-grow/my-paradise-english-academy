import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Star, BookOpen } from 'lucide-react';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f43f5e] via-[#ec4899] via-[#a855f7] to-[#38bdf8]">
      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        <Star className="absolute top-20 left-12 w-12 h-12 text-paradise-yellow fill-paradise-yellow animate-float drop-shadow-lg" />
        <Star className="absolute bottom-32 right-20 w-10 h-10 text-paradise-yellow fill-paradise-yellow animate-float-delayed drop-shadow-lg" />
        
        {/* Sparkle Stars */}
        <div className="absolute top-32 right-40">
          <Sparkles className="w-16 h-16 text-white/60 animate-float" />
        </div>
        
        {/* Floating Bubbles/Circles */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#ec4899]/40 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/20 rounded-full blur-sm animate-float-delayed" />
        <div className="absolute top-1/2 left-16 w-20 h-20 bg-[#38bdf8]/30 rounded-full blur-sm animate-float" />
        
        {/* Book Icon */}
        <BookOpen className="absolute bottom-1/3 left-16 w-16 h-16 text-[#14b8a6]/50 animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 pt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg">
          <Sparkles className="w-5 h-5 text-paradise-yellow" />
          <span className="text-white font-semibold">{t('hero.badge')}</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-2xl md:text-3xl text-white/90 font-medium mb-12 drop-shadow-md">
          {t('hero.subtitle')}
        </p>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fef9f3"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
