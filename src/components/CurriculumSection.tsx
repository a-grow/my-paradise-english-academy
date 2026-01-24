const books = [
  { color: 'from-[#fb7185] to-[#f43f5e]', delay: '0' },
  { color: 'from-[#fbbf24] to-[#f59e0b]', delay: '100' },
  { color: 'from-[#34d399] to-[#10b981]', delay: '200' },
  { color: 'from-[#38bdf8] to-[#0ea5e9]', delay: '300' },
  { color: 'from-[#a855f7] to-[#8b5cf6]', delay: '400' },
];

const CurriculumSection = () => {
  return (
    <section id="curriculum" className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold text-slate-900 mb-16">World-Class Learning Materials</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {books.map((book, index) => (
            <div 
              key={index} 
              className={`
                h-64 rounded-[2rem] bg-gradient-to-br ${book.color} 
                shadow-2xl transform transition-all duration-500 
                hover:scale-110 hover:-rotate-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
                cursor-pointer relative overflow-hidden group
              `}
            >
              {/* This creates the "Book Spine" look */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/10" />
              {/* This adds a subtle white glow on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;
