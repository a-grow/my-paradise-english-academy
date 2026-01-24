const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-[#e0f2fe] to-white overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10 text-center md:text-left">
        <div className="inline-block bg-white border border-[#38bdf8]/30 px-4 py-2 rounded-full mb-8 shadow-sm">
          <span className="text-[#0d9488] font-bold text-sm uppercase tracking-widest">Now Enrolling for 2026!</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-6 leading-tight">
          Where English <br />
          <span className="text-[#fb7185] italic">Becomes an Adventure</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed mx-auto md:mx-0">
          Join Teacher Andy for fun, relaxing, and creative English classes using the world-class Oxford Discover curriculum.
        </p>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <a href="#classes" className="bg-[#fb7185] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-transform">
            Watch Class
          </a>
          <a href="#classes" className="bg-white text-[#0d9488] border-2 border-[#38bdf8]/30 px-10 py-5 rounded-2xl font-bold text-xl shadow-md hover:border-[#fb7185] transition-all">
            Learn More
          </a>
        </div>
      </div>
      
      {/* Paradise Sunflare Circle */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#fb7185]/10 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;
