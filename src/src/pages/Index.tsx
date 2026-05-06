import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatsNewSection from "@/components/WhatsNewSection";
import TeacherSection from "@/components/TeacherSection";
import VideoSection from "@/components/VideoSection";
import ClassesSection from "@/components/ClassesSection";
import CurriculumSection from "@/components/CurriculumSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhatsNewSection />
      <TeacherSection />
      <VideoSection />
      <ClassesSection />
      <CurriculumSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
