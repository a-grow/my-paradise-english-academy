import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, Sparkles } from 'lucide-react';

const WhatsNewSection = () => {
  const { t } = useLanguage();

  // Easy to edit announcement content - can later connect to Google Sheets
  const announcement = {
    en: "🎉 Now enrolling for Spring 2026! Limited spots available for our new Book 1 class on Fridays!",
    zh: "🎉 2026春季班招生中！週五新開Book 1班級，名額有限！"
  };

  return (
    <section className="py-16 bg-[#fef9f3] relative">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Glassy Announcement Box */}
        <div className="relative bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border-4 border-dashed border-paradise-coral/30">
          {/* Corner Decorations */}
          <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-paradise-yellow" />
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-paradise-pink" />
          
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-paradise-coral to-paradise-pink rounded-2xl flex items-center justify-center shadow-lg">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('whatsNew.title')}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('lang') === 'zh' ? announcement.zh : announcement.en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsNewSection;
