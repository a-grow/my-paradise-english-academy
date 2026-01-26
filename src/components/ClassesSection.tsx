import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { useClasses } from '@/hooks/useSheetDB';

const ClassesSection = () => {
  const { t } = useLanguage();
  const { data: classes, isLoading, error } = useClasses();

  return (
    <section id="classes" className="py-20 bg-[#fef9f3] relative">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-paradise-coral/10 px-5 py-2 rounded-full mb-4">
            <Calendar className="w-5 h-5 text-paradise-coral" />
            <span className="text-paradise-coral font-semibold text-sm">{t('classes.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('classes.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('classes.subtitle')}
          </p>
        </div>

        {/* Glassy Schedule Container */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 shadow-xl border-2 border-paradise-sky/20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-paradise-teal" />
            <h3 className="text-2xl font-display font-bold text-foreground">{t('classes.groupTitle')}</h3>
          </div>
          <p className="text-paradise-coral font-medium mb-8 text-sm">*{t('classes.note')}</p>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-paradise-purple animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading classes...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-red-500">
              Failed to load class schedule. Please try again later.
            </div>
          )}

          {/* Class List */}
          {classes && classes.length > 0 && (
            <div className="space-y-4">
              {classes.map((item, index) => {
                const isFull = item.status?.toLowerCase() === 'full';
                const classId = `class-${item.class_name?.toLowerCase().replace(/\s+/g, '-') || index}`;
                
                return (
                  <div 
                    key={item.id || index}
                    id={classId}
                    className="flex flex-col sm:flex-row justify-between items-center p-5 
                      bg-white rounded-2xl border-2 shadow-sm
                      transition-all duration-500 border-transparent hover:border-paradise-sky/30"
                  >
                    <div className="text-center sm:text-left mb-3 sm:mb-0">
                      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                        <span className="bg-paradise-teal/10 text-paradise-teal px-3 py-1 rounded-full text-sm font-semibold">
                          {item.class_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2 justify-center sm:justify-start">
                        <Clock className="w-4 h-4" />
                        <span>{item.schedule}</span>
                      </div>
                    </div>

                    {/* Availability Badge - Display Only */}
                    <div 
                      className={`
                        px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide cursor-default
                        ${isFull 
                          ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                          : 'bg-green-100 text-green-600 border-2 border-green-200'
                        }
                      `}
                    >
                      {isFull ? t('classes.full') : t('classes.available')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {classes && classes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No classes available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
