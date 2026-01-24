import { Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="inline-block bg-white/80 border border-[#38bdf8]/30 px-4 py-2 rounded-full mb-8 shadow-sm">
          <span className="text-[#0d9488] font-bold text-sm uppercase italic">Now Enrolling for 2026!</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-bold text-slate-900 mb-6 leading-tight">
          Where English <br />
          <span className="text-[#fb7185] italic">Becomes an Adventure</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Join Teacher Andy for fun, relaxing, and creative English classes using the world-class Oxford Discover curriculum.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <a href="#classes" className="flex items-center gap-3 bg-[#fb7185] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-transform">
            <Play fill="currentColor" className="w-5 h-5" />
            Watch Class
          </a>
          <a href="#classes" className="px-8 py-4 rounded-2xl bg-white text-[#0d9488] border-2 border-[#38bdf8]/30 font-bold text-lg shadow-md hover:border-[#fb7185] transition-all">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
