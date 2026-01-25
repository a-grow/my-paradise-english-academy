import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Star } from 'lucide-react';

const books = [
  { id: 'book1', level: 1, gradient: 'from-[#ec4899] to-[#f43f5e]' },
  { id: 'book2', level: 2, gradient: 'from-[#f97316] to-[#fbbf24]' },
  { id: 'book3', level: 3, gradient: 'from-[#14b8a6] to-[#22d3d1]' },
  { id: 'book4', level: 4, gradient: 'from-[#8b5cf6] to-[#a78bfa]' },
  { id: 'book5', level: 5, gradient: 'from-[#d946ef] to-[#a855f7]' },
];

const CurriculumSection = () => {
  const { t } = useLanguage();

  const handleBookClick = (bookId: string) => {
    // Dispatch custom event to highlight corresponding class
    window.dispatchEvent(new CustomEvent('highlightClass', { detail: bookId }));
    
    // Smooth scroll to the class
    const classElement = document.getElementById(`class-${bookId}`);
    if (classElement) {
      classElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="curriculum" className="py-20 bg-[#fef9f3] relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-paradise-coral/10 px-5 py-2 rounded-full mb-4">
            <BookOpen className="w-5 h-5 text-paradise-coral" />
            <span className="text-paradise-coral font-semibold text-sm">{t('curriculum.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {t('curriculum.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('curriculum.subtitle')}
          </p>
        </div>

        {/* Book Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => handleBookClick(book.id)}
              className={`
                relative h-56 md:h-64 rounded-[1.5rem] bg-gradient-to-br ${book.gradient}
                shadow-xl transform transition-all duration-300
                hover:scale-105 hover:-rotate-2 hover:shadow-2xl
                cursor-pointer overflow-hidden group
                focus:outline-none focus:ring-4 focus:ring-paradise-yellow/50
              `}
            >
              {/* Star decoration */}
              <Star className="absolute top-4 right-4 w-8 h-8 text-white/40 fill-white/40 group-hover:text-white/60 group-hover:fill-white/60 transition-colors" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              
              {/* Book info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white/80 text-sm font-medium">{t('curriculum.book')}</p>
                <p className="text-white text-2xl font-display font-bold">
                  {t('curriculum.level')} {book.level}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Hint text */}
        <p className="text-center text-muted-foreground mt-8 text-sm">
          {t('curriculum.clickHint')}
        </p>
      </div>
    </section>
  );
};

export default CurriculumSection;
