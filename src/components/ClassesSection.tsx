import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

// Real class data - DO NOT CHANGE class times
const groupClasses = [
  { id: 'book4', time: '6:00 PM - 6:50 PM', day: 'Tuesday', dayZh: '週二', book: 'Book 4', bookNum: 4, isFull: false },
  { id: 'book3', time: '7:00 PM - 7:50 PM', day: 'Tuesday', dayZh: '週二', book: 'Book 3', bookNum: 3, isFull: false },
  { id: 'book2', time: '8:00 PM - 8:50 PM', day: 'Tuesday', dayZh: '週二', book: 'Book 2', bookNum: 2, isFull: true },
  { id: 'book1', time: '7:00 PM - 7:50 PM', day: 'Friday', dayZh: '週五', book: 'Book 1', bookNum: 1, isFull: false },
  { id: 'book5', time: '8:30 PM - 9:20 PM', day: 'Friday', dayZh: '週五', book: 'Book 5', bookNum: 5, isFull: false },
];

const ClassesSection = () => {
  const { t, language } = useLanguage();
  const [highlightedBook, setHighlightedBook] = useState<string | null>(null);

  useEffect(() => {
    // Listen for book card clicks from curriculum section
    const handleBookClick = (e: CustomEvent) => {
      setHighlightedBook(e.detail);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedBook(null), 3000);
    };

    window.addEventListener('highlightClass', handleBookClick as EventListener);
    return () => window.removeEventListener('highlightClass', handleBookClick as EventListener);
  }, []);

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

          {/* Class List */}
          <div className="space-y-4">
            {groupClasses.map((item) => (
              <div 
                key={item.id}
                id={`class-${item.id}`}
                className={`
                  flex flex-col sm:flex-row justify-between items-center p-5 
                  bg-white rounded-2xl border-2 shadow-sm
                  transition-all duration-500
                  ${highlightedBook === item.id 
                    ? 'border-paradise-yellow shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-[1.02]' 
                    : 'border-transparent hover:border-paradise-sky/30'
                  }
                `}
              >
                <div className="text-center sm:text-left mb-3 sm:mb-0">
                  <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                    <p className="text-xl font-bold text-foreground">
                      {language === 'zh' ? item.dayZh : item.day}
                    </p>
                    <span className="bg-paradise-teal/10 text-paradise-teal px-3 py-1 rounded-full text-sm font-semibold">
                      {item.book}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1 justify-center sm:justify-start">
                    <Clock className="w-4 h-4" />
                    <span>{item.time}</span>
                  </div>
                </div>

                {/* Availability Badge */}
                <div className={`
                  px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide
                  ${item.isFull 
                    ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                    : 'bg-green-100 text-green-600 border-2 border-green-200'
                  }
                `}>
                  {item.isFull ? t('classes.full') : t('classes.available')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
