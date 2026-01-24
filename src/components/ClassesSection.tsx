import { Card } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Facebook, Instagram } from 'lucide-react';

const groupClasses = [
  { id: '1', time: '6:00 PM - 6:50 PM', day: 'Tuesday', book: 'Book 4', isFull: false },
  { id: '2', time: '7:00 PM - 7:50 PM', day: 'Tuesday', book: 'Book 3', isFull: false },
  { id: '3', time: '8:00 PM - 8:50 PM', day: 'Tuesday', book: 'Book 2', isFull: false },
  { id: '4', time: '7:00 PM - 7:50 PM', day: 'Friday', book: 'Book 1', isFull: false },
  { id: '5', time: '8:30 PM - 9:20 PM', day: 'Friday', book: 'Book 5', isFull: false },
];

const ClassesSection = () => {
  return (
    <section id="classes" className="py-24 bg-background relative overflow-hidden">
      {/* Paradise Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-paradise-yellow/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-paradise-sky/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* MEET TEACHER ANDY */}
        <div className="max-w-4xl mx-auto mb-20 bg-paradise-mint/10 rounded-[40px] p-8 md:p-12 border-4 border-dashed border-paradise-mint flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 shrink-0 rounded-3xl border-8 border-white shadow-2xl overflow-hidden rotate-3 bg-slate-100">
            <img 
              src="/andy.jpg" 
              alt="Teacher Andy" 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=Teacher+Andy"; }}
            />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">Meet Teacher Andy!</h2>
            <p className="text-lg text-muted-foreground leading-relaxed italic">
              "Hello! My name is Teacher Andy. I believe learning should be an adventure! In my classroom, your child will find a fun, relaxing atmosphere where they can feel safe to express themselves and explore the English language through creativity."
            </p>
            <p className="mt-6 font-bold text-paradise-teal text-lg">
              🇺🇸 From USA • Bachelor's Degree • TEFL Certified • 20 Years Experience
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-5xl font-display font-bold text-foreground mb-4">Class in Session: Take a Peek!</h2>
        </div>

        <div className="max-w-4xl mx-auto mb-24">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-black">
            <iframe className="w-full h-full" src="https://www.youtube.com/embed/VRnrJ2ngjQ8" title="Class Sample" allowFullScreen></iframe>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-24">
          <Card className="card-fun p-8 md:p-12 border-none shadow-2xl bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-paradise-sky to-paradise-purple flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-display font-bold text-foreground">Group Classes</h3>
              </div>
              <p className="text-paradise-pink font-semibold text-lg md:ml-4">(*All group classes use Oxford Discover books)</p>
            </div>
            
            <div className="grid gap-4">
              {groupClasses.map((slot) => (
                <div key={slot.id} className="flex flex-col sm:flex-row justify-between items-center p-6 bg-white rounded-3xl border-2 border-paradise-sky/20 hover:border-paradise-coral transition-all gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-foreground">{slot.day}</p>
                      <span className="px-3 py-1 bg-paradise-mint/20 text-paradise-teal rounded-lg font-bold text-sm">{slot.book}</span>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">{slot.time}</p>
                  </div>
                  {slot.isFull ? (
                    <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-100 text-red-600 font-black tracking-wider">
                      <XCircle className="w-6 h-6" /> FULL
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-paradise-mint/20 text-paradise-teal font-black tracking-wider">
                      <CheckCircle className="w-6 h-6" /> AVAILABLE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SOCIAL LINKS */}
        <div className="text-center py-16 bg-paradise-yellow/10 rounded-[40px] border-4 border-white">
          <h2 className="text-5xl font-display font-bold mb-4">Ready to Start?</h2>
          <p className="text-2xl text-muted-foreground mb-10">Click the best link for you to contact us!</p>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="https://facebook.com/MyParadiseEnglish" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-[#1877F2] text-white px-10 py-5 rounded-3xl font-bold text-xl hover:scale-105 transition-transform shadow-xl"><Facebook className="w-8 h-8" /> Facebook</a>
            <a href="https://instagram.com/MyParadiseEnglish" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white px-10 py-5 rounded-3xl font-bold text-xl hover:scale-105 transition-transform shadow-xl"><Instagram className="w-8 h-8" /> Instagram</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
