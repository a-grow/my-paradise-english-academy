import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { User, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassSlot {
  id: string;
  time: string;
  day: string;
  spotsLeft: number;
  maxSpots: number;
  level: number;
}

const oneOnOneClasses: ClassSlot[] = [
  { id: '1', time: '3:00 PM', day: 'Mon/Wed', spotsLeft: 3, maxSpots: 5, level: 1 },
  { id: '2', time: '4:00 PM', day: 'Tue/Thu', spotsLeft: 1, maxSpots: 5, level: 2 },
  { id: '3', time: '5:00 PM', day: 'Mon/Wed', spotsLeft: 0, maxSpots: 5, level: 3 },
  { id: '4', time: '6:00 PM', day: 'Fri', spotsLeft: 4, maxSpots: 5, level: 4 },
];

const groupClasses: ClassSlot[] = [
  { id: '5', time: '3:30 PM', day: 'Mon/Wed/Fri', spotsLeft: 2, maxSpots: 5, level: 1 },
  { id: '6', time: '4:30 PM', day: 'Tue/Thu', spotsLeft: 0, maxSpots: 5, level: 2 },
  { id: '7', time: '5:30 PM', day: 'Mon/Wed', spotsLeft: 5, maxSpots: 5, level: 3 },
  { id: '8', time: '6:30 PM', day: 'Sat', spotsLeft: 1, maxSpots: 5, level: 5 },
];

const AvailabilityBadge = ({ spotsLeft }: { spotsLeft: number }) => {
  const { t } = useLanguage();
  
  if (spotsLeft === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-semibold">
        <XCircle className="w-4 h-4" />
        {t('classes.full')}
      </span>
    );
  }
  
  if (spotsLeft <= 2) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-paradise-coral/20 text-paradise-coral text-sm font-semibold">
        <Clock className="w-4 h-4" />
        {spotsLeft} {t('classes.spotsLeft')}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-paradise-mint/20 text-paradise-teal text-sm font-semibold">
      <CheckCircle className="w-4 h-4" />
      {t('classes.available')}
    </span>
  );
};

const ClassCard = ({ slot, isGroup }: { slot: ClassSlot; isGroup: boolean }) => {
  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
      slot.spotsLeft === 0 
        ? "bg-muted/50 border-muted" 
        : "bg-white border-paradise-sky/30 hover:border-paradise-coral"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-lg font-bold text-foreground">Oxford Discover {slot.level}</p>
          <p className="text-muted-foreground">{slot.day} • {slot.time}</p>
        </div>
        <AvailabilityBadge spotsLeft={slot.spotsLeft} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isGroup ? (
          <Users className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span>{slot.spotsLeft}/{slot.maxSpots} spots available</span>
      </div>
    </div>
  );
};

const ClassesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="classes" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-paradise-yellow/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-paradise-sky/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-display font-bold text-foreground mb-4">
            {t('classes.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('classes.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* One-on-One Classes */}
          <Card className="card-fun p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-paradise-coral to-paradise-pink flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  {t('classes.oneOnOne')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('classes.oneOnOneDesc')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {oneOnOneClasses.map((slot) => (
                <ClassCard key={slot.id} slot={slot} isGroup={false} />
              ))}
            </div>
          </Card>

          {/* Group Classes */}
          <Card className="card-fun p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-paradise-sky to-paradise-purple flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  {t('classes.group')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('classes.groupDesc')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {groupClasses.map((slot) => (
                <ClassCard key={slot.id} slot={slot} isGroup={true} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
