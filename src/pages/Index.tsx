import HeroSection from "@/components/HeroSection";
import CurriculumSection from "@/components/CurriculumSection";
import ClassesSection from "@/components/ClassesSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* GLOBAL SUNFLARES - These stay behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-paradise-sky/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-paradise-pink/15 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-paradise-yellow/15 rounded-full blur-[120px] animate-pulse delay-1000" />
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
