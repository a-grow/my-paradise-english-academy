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
  if (spotsLeft === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
        <XCircle className="w-4 h-4" />
        Full
      </span>
    );
  }
  
  if (spotsLeft <= 2) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
        <Clock className="w-4 h-4" />
        {spotsLeft} Spots Left
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-semibold">
      <CheckCircle className="w-4 h-4" />
      Available
    </span>
  );
};

const ClassCard = ({ slot, isGroup }: { slot: ClassSlot; isGroup: boolean }) => {
  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg mb-3",
      slot.spotsLeft === 0 
        ? "bg-slate-50 border-slate-200" 
        : "bg-white border-blue-100 hover:border-pink-400"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-lg font-bold text-slate-900">Oxford Discover {slot.level}</p>
          <p className="text-slate-500">{slot.day} • {slot.time}</p>
        </div>
        <AvailabilityBadge spotsLeft={slot.spotsLeft} />
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {isGroup ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
        <span>{slot.spotsLeft}/{slot.maxSpots} spots available</span>
      </div>
    </div>
  );
};

const ClassesSection = () => {
  return (
    <section id="classes" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Class in Session: Take a Peek!
          </h2>
          <p className="text-xl text-slate-600">
            Watch our students explore English through fun art projects!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-black relative">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/VRnrJ2ngjQ8" 
              title="Class Sample"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 relative flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 text-blue-300 mx-auto mb-2" />
              <p className="text-slate-400 font-medium">More Class Clips Coming Soon!</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-white to-pink-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">One-on-One Classes</h3>
            </div>
            {oneOnOneClasses.map((slot) =>
