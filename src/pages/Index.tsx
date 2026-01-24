import HeroSection from "@/components/HeroSection";
import CurriculumSection from "@/components/CurriculumSection";
import ClassesSection from "@/components/ClassesSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-white relative">
      {/* Background Colors */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-white to-[#fdf2f8]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <CurriculumSection />
        <ClassesSection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
