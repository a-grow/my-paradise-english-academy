import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Tv, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-br from-[#fef9f3] to-[#e0f2fe] relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-10 right-10 opacity-30">
        <Sparkles className="w-12 h-12 text-paradise-yellow animate-float" />
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-paradise-sky/20 px-5 py-2 rounded-full mb-4">
            <Tv className="w-5 h-5 text-paradise-teal" />
            <span className="text-paradise-teal font-semibold text-sm">{t('video.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {t('video.title')}
          </h2>
        </div>

        {/* Glassy Video Container */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 shadow-xl border-2 border-paradise-purple/20">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/NEW_VIDEO_ID" 
              title="My Paradise English - Class in Session"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>

          {/* YouTube Button */}
          <div className="text-center mt-8">
            <Button
              asChild
              variant="hero"
              size="lg"
              className="bg-gradient-to-r from-paradise-coral to-paradise-pink text-white hover:from-paradise-pink hover:to-paradise-coral hover:animate-wiggle"
            >
              <a 
                href="https://www.youtube.com/@MyParadiseEnglish" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Youtube className="w-5 h-5" />
                {t('video.youtube')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
