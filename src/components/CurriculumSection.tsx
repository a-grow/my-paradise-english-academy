import { BookOpen, Star } from 'lucide-react';

const books = [
  { color: 'from-paradise-coral to-paradise-pink' },
  { color: 'from-paradise-yellow to-paradise-coral' },
  { color: 'from-paradise-mint to-paradise-teal' },
  { color: 'from-paradise-sky to-paradise-purple' },
  { color: 'from-paradise-purple to-paradise-pink' },
];

const CurriculumSection = () => {
  return (
    <section id="curriculum" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-paradise-yellow/20 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-5 h-5 text-paradise-coral" />
            <span className="text-paradise-coral font-semibold">Our Curriculum</span>
          </div>
          <h2 className="text-5xl font-display font-bold text-slate-900 mb-4">
            World-Class Learning Materials
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {books.map((book, index) => (
            <div key={index} className={`h-48 md:h-64 rounded-3xl bg-gradient-to-br ${book.color} shadow-xl relative`}>
              <Star className="absolute top-4 right-4 w-8 h-8 text-white/30" fill="currentColor" />
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/5 rounded-l-3xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;
