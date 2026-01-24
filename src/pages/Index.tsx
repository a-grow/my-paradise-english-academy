import HeroSection from "@/components/HeroSection";
import CurriculumSection from "@/components/CurriculumSection";
import ClassesSection from "@/components/ClassesSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa]">
      {/* THE MASTER BACKGROUND - This gives the color back to the whole site */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-paradise-sky/20 via-white to-paradise-pink/10" />
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-paradise-sky/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-paradise-pink/30 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-paradise-yellow/30 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <CurriculumSection />
        <ClassesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
