import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, Award, Globe, Clock } from 'lucide-react';

const TeacherSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-[#fef9f3] relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {t('teacher.title')}
          </h2>
        </div>

        {/* Glassy Teacher Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-xl border-2 border-paradise-sky/20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Photo */}
            <div className="shrink-0">
              <div className="w-48 h-48 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/andy.jpg" 
                  alt="Teacher Andy" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-display font-bold text-foreground mb-4">
                Teacher Andy
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed italic mb-6">
                "{t('teacher.quote')}"
              </p>

              {/* Credentials */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-2 bg-paradise-coral/10 text-paradise-coral px-4 py-2 rounded-full text-sm font-semibold">
                  <Globe className="w-4 h-4" /> {t('teacher.from')}
                </span>
                <span className="inline-flex items-center gap-2 bg-paradise-sky/10 text-paradise-teal px-4 py-2 rounded-full text-sm font-semibold">
                  <GraduationCap className="w-4 h-4" /> {t('teacher.degree')}
                </span>
                <span className="inline-flex items-center gap-2 bg-paradise-yellow/20 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold">
                  <Award className="w-4 h-4" /> {t('teacher.cert')}
                </span>
                <span className="inline-flex items-center gap-2 bg-paradise-purple/10 text-paradise-purple px-4 py-2 rounded-full text-sm font-semibold">
                  <Clock className="w-4 h-4" /> {t('teacher.exp')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherSection;
