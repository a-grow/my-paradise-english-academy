import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// SheetDB API endpoint for Classes tab
const SHEETDB_CLASSES_URL = 'https://sheetdb.io/api/v1/9ctz2zljbz6wx?sheet=Classes';

interface ClassItem {
  id?: string;
  day: string;
  day_zh?: string;
  time: string;
  book: string;
  level?: number;
  status?: string;
}

// Day order for sorting
const dayOrder: Record<string, number> = {
  'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
};

const ClassesSection = () => {
  const { t, language } = useLanguage();
  const [highlightedBook, setHighlightedBook] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEETDB_CLASSES_URL);
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data: ClassItem[] = await response.json();
        
        // Sort by day and time ascending
        const sorted = data.sort((a, b) => {
          const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
          if (dayDiff !== 0) return dayDiff;
          return a.time.localeCompare(b.time);
        });
        
        setClasses(sorted);
      } catch (err) {
        console.error('Error fetching classes:', err);
        // Fallback to default data
        setClasses([
          { id: 'book4', time: '6:00 PM - 6:50 PM', day: 'Tuesday', day_zh: '週二', book: 'Book 4', level: 4, status: 'available' },
          { id: 'book3', time: '7:00 PM - 7:50 PM', day: 'Tuesday', day_zh: '週二', book: 'Book 3', level: 3, status: 'available' },
          { id: 'book2', time: '8:00 PM - 8:50 PM', day: 'Tuesday', day_zh: '週二', book: 'Book 2', level: 2, status: 'full' },
          { id: 'book1', time: '7:00 PM - 7:50 PM', day: 'Friday', day_zh: '週五', book: 'Book 1', level: 1, status: 'available' },
          { id: 'book5', time: '8:30 PM - 9:20 PM', day: 'Friday', day_zh: '週五', book: 'Book 5', level: 5, status: 'available' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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

  // Generate class ID from book name
  const getClassId = (item: ClassItem) => {
    return item.id || item.book.toLowerCase().replace(/\s+/g, '');
  };

  const isFull = (item: ClassItem) => {
    return item.status?.toLowerCase() === 'full';
  };

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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-paradise-teal animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((item, index) => {
                const classId = getClassId(item);
                return (
                  <div 
                    key={classId + index}
                    id={`class-${classId}`}
                    className={`
                      flex flex-col sm:flex-row justify-between items-center p-5 
                      bg-white rounded-2xl border-2 shadow-sm
                      transition-all duration-500
                      ${highlightedBook === classId 
                        ? 'border-paradise-yellow shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-[1.02]' 
                        : 'border-transparent hover:border-paradise-sky/30'
                      }
                    `}
                  >
                    <div className="text-center sm:text-left mb-3 sm:mb-0">
                      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                        <p className="text-xl font-bold text-foreground">
                          {language === 'zh' && item.day_zh ? item.day_zh : item.day}
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
                      ${isFull(item) 
                        ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                        : 'bg-green-100 text-green-600 border-2 border-green-200'
                      }
                    `}>
                      {isFull(item) ? t('classes.full') : t('classes.available')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
