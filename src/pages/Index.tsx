import HeroSection from "@/components/HeroSection";
import CurriculumSection from "@/components/CurriculumSection";
import ClassesSection from "@/components/ClassesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* THE ANIMATED ATMOSPHERE */}
      <div className="fixed inset-0 z-0">
        {/* Sky Blue Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#38bdf8]/20 rounded-full blur-[120px] animate-pulse" />
        {/* Paradise Pink Glow */}
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#fb7185]/20 rounded-full blur-[120px] animate-pulse delay-700" />
        {/* Sunny Yellow Glow */}
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-[#fbbf24]/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <CurriculumSection />
        <ClassesSection />
      </div>
    </div>
  );
};

export default Index;
