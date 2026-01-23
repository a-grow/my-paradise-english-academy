import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const ContactSection = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-gradient-paradise relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-6 h-6 text-paradise-yellow" />
            <span className="text-white font-semibold text-lg">Start Your Adventure!</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-white font-medium">hello@myparadiseenglish.com</span>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl">
              <Phone className="w-6 h-6 text-white" />
              <span className="text-white font-medium">+886 123 456 789</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <MapPin className="w-5 h-5 text-white/80" />
            <span className="text-white/80">{t('footer.location')}</span>
          </div>

          <Button variant="hero" size="lg" className="text-xl px-12">
            {t('contact.cta')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
