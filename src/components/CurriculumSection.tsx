import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Star } from 'lucide-react';

const books = [
  { level: 1, ages: '5-6', color: 'from-paradise-coral to-paradise-pink', description: 'Foundation skills & basic vocabulary' },
  { level: 2, ages: '6-7', color: 'from-paradise-yellow to-paradise-coral', description: 'Reading fundamentals & simple sentences' },
  { level: 3, ages: '7-8', color: 'from-paradise-mint to-paradise-teal', description: 'Story comprehension & grammar basics' },
  { level: 4, ages: '8-9', color: 'from-paradise-sky to-paradise-purple', description: 'Critical thinking & writing skills' },
  { level: 5, ages: '9-10', color: 'from-paradise-purple to-paradise-pink', description: 'Advanced reading & creative expression' },
];

const CurriculumSection = () => {
  const { t } = useLanguage();

  return (
    <section id="curriculum" className="py-24 bg-gradient-to-b from-paradise-sky/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-paradise-yellow/20 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-5 h-5 text-paradise-coral" />
            <span className="text-paradise-coral font-semibold">World-Class Materials</span>
          </div>
          <h2 className="text-5xl font-display font-bold text-foreground mb-4">
            {t('curriculum.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('curriculum.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {books.map((book, index) => (
            <div 
              key={book.level}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`
                relative h-64 rounded-3xl bg-gradient-to-br ${book.color} p-6
                transform transition-all duration-500 hover:scale-105 hover:-rotate-3
                shadow-xl hover:shadow-2xl cursor-pointer
              `}>
                {/* Book spine effect */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/10 rounded-l-3xl"></div>
                
                {/* Star decoration */}
                <Star 
                  className="absolute top-4 right-4 w-8 h-8 text-white/40 group-hover:text-white/80 transition-colors" 
                  fill="currentColor"
                />
                
                <div className="relative z-10 h-full flex flex-col justify-end text-white">
                  <p className="text-sm font-medium opacity-80 mb-1">
                    {t('curriculum.book')}
                  </p>
                  <h3 className="text-4xl font-display font-bold mb-2">
                    {t('curriculum.level')} {book.level}
                  </h3>
                  <p className="text-sm opacity-80">
                    {t('curriculum.ages')}: {book.ages}
                  </p>
                </div>
              </div>
              
              {/* Hover description */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300 pointer-events-none">
                <div className="bg-foreground text-background text-xs text-center py-2 px-3 rounded-lg shadow-lg">
                  {book.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;
