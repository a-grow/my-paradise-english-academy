import { Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-b from-paradise-sky/20 to-white">
      {/* Animated background shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-paradise-yellow/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-paradise-pink/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 border border-paradise-sky/20">
            <span className="flex h-2 w-2 rounded-full bg-paradise-coral animate-ping"></span>
            <span className="text-paradise-teal font-semibold text-sm">Now Enrolling for 2026!</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-slate-900 leading-tight mb-6">
            Where English <br />
            <span className="text-paradise-coral">Becomes an Adventure</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            Join Teacher Andy for fun, relaxing, and creative English classes using the world-class Oxford Discover curriculum.
          </p>
          
          <div className="flex flex-wrap gap-4">
            {/* WATCH CLASS BUTTON */}
            <a 
              href="#classes" 
              className="group flex items-center gap-3 bg-paradise-coral text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-xl shadow-paradise-coral/20"
            >
              <div className="bg-white/20 rounded-full p-1 group-hover:scale-110 transition-transform">
                <Play fill="currentColor" className="w-5 h-5" />
              </div>
              Watch Class
            </a>

            {/* LEARN MORE BUTTON - Now points to #classes too! */}
            <a 
              href="#classes" 
              className="px-8 py-4 rounded-2xl bg-white text-paradise-teal border-2 border-paradise-sky/20 font-bold text-lg hover:border-paradise-coral transition-all shadow-lg"
            >
              Learn More
            </a>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=student${i}`} alt="Student" />
                </div>
              ))}
            </div>
            <p className="text-slate-500 font-medium">
              <span className="text-paradise-teal font-bold">20+ years</span> of teaching experience
            </p>
          </div>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
    </section>
  );
};

export default HeroSection;
