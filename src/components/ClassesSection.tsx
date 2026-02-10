import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const SHEETDB_CLASSES_URL = 'https://sheetdb.io/api/v1/9ctz2zljbz6wx?sheet=Classes';

interface RawClassItem {
  ID: string;
  class_name: string;
  schedule: string;
  status: string;
}

interface ClassItem {
  id: string;
  className: string;
  day: string;
  time: string;
  status: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayOrder: Record<string, number> = {
  'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
};

function parseSchedule(schedule: string): { day: string; time: string } {
  // Find which day name appears in the schedule string
  for (const d of DAYS) {
    const idx = schedule.toLowerCase().indexOf(d.toLowerCase());
    if (idx !== -1) {
      const time = schedule.substring(idx + d.length).trim();
      return { day: d, time };
    }
  }
  return { day: '', time: schedule };
}

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
        const data: RawClassItem[] = await response.json();

        // Filter out header row and parse
        const parsed: ClassItem[] = data
          .filter(row => row.ID !== 'id' && row.class_name && row.schedule)
          .map(row => {
            const { day, time } = parseSchedule(row.schedule);
            return {
              id: row.class_name.toLowerCase().replace(/\s+/g, ''),
              className: row.class_name,
              day,
              time,
              status: row.status || 'Available',
            };
          });

        // Sort by day then time
        const sorted = parsed.sort((a, b) => {
          const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
          if (dayDiff !== 0) return dayDiff;
          return a.time.localeCompare(b.time);
        });

        setClasses(sorted);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const handleBookClick = (e: CustomEvent) => {
      setHighlightedBook(e.detail);
      setTimeout(() => setHighlightedBook(null), 3000);
    };
    window.addEventListener('highlightClass', handleBookClick as EventListener);
    return () => window.removeEventListener('highlightClass', handleBookClick as EventListener);
  }, []);

  const isFull = (item: ClassItem) => item.status.toLowerCase() === 'full';

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
              {classes.map((item, index) => (
                <div
                  key={item.id + index}
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
                      <p className="text-xl font-bold text-foreground">{item.day}</p>
                      <span className="bg-paradise-teal/10 text-paradise-teal px-3 py-1 rounded-full text-sm font-semibold">
                        {item.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1 justify-center sm:justify-start">
                      <Clock className="w-4 h-4" />
                      <span>{item.time}</span>
                    </div>
                  </div>

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
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
