import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-6 border border-paradise-sky/30">
            <span className="flex h-2 w-2 rounded-full bg-paradise-coral animate-ping" />
            <span className="text-paradise-teal font-bold text-sm uppercase tracking-wider">Now Enrolling for 2026!</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-slate-900 leading-tight mb-6">
            Where English <br />
            <span className="text-paradise-coral italic">Becomes an Adventure</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 mb-10 max-w-2xl leading-relaxed font-medium">
            Join Teacher Andy for fun, relaxing, and creative English classes using the world-class Oxford Discover curriculum.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-paradise-coral hover:bg-paradise-coral/90 text-white px-8 h-16 rounded-2xl text-lg font-bold shadow-xl shadow-paradise-coral/30 group transition-all hover:scale-105" asChild>
              <a href="#classes" className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Play fill="currentColor" className="w-5 h-5" />
                </div>
                Watch Class
              </a>
            </Button>

            <Button size="lg" variant="outline" className="border-2 border-paradise-sky/40 hover:border-paradise-coral px-8 h-16 rounded-2xl text-lg font-bold bg-white/60 backdrop-blur-sm text-paradise-teal transition-all hover:scale-105" asChild>
              <a href="#classes">Learn More</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
