import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { User, Users, CheckCircle, Clock, XCircle, Play } from 'lucide-react';
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
