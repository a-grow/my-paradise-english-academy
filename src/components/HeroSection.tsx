import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, BookOpen } from 'lucide-react';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-paradise">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Star className="w-12 h-12 text-paradise-yellow opacity-80" fill="currentColor" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Sparkles className="w-16 h-16 text-white opacity-60" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float">
          <BookOpen className="w-14 h-14 text-paradise-mint opacity-70" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float-delayed">
          <Star className="w-10 h-10 text-paradise-yellow opacity-80" fill="currentColor" />
        </div>
        
        {/* Bubble decorations */}
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-20">
        <div className="animate-bounce-gentle inline-block mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-paradise-yellow" />
            <span className="text-white font-semibold">Taiwan's Most Fun English School!</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 drop-shadow-xl animate-fade-in">
          {t('hero.title')}
        </h1>
        
        <p className="text-2xl md:text-3xl text-white/90 mb-10 font-medium max-w-2xl mx-auto animate-fade-in-delayed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delayed-more">
          <Button variant="hero" size="lg" className="text-lg">
            {t('hero.cta')}
          </Button>
          <Button variant="heroOutline" size="lg" className="text-lg">
            {t('hero.availability')}
          </Button>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
