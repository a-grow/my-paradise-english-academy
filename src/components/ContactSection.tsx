import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, Sparkles, Star } from 'lucide-react';

const ContactSection = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-[#f43f5e] via-[#ec4899] via-[#a855f7] to-[#38bdf8] relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-delayed" />
        <Star className="absolute top-10 right-1/4 w-8 h-8 text-paradise-yellow/60 fill-paradise-yellow/60 animate-float" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg">
            <Sparkles className="w-5 h-5 text-paradise-yellow" />
            <span className="text-white font-semibold">{t('contact.badge')}</span>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-xl mx-auto">
            {t('contact.subtitle')}
          </p>

          {/* Contact Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="mailto:hello@myparadiseenglish.com"
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full hover:bg-white/30 transition-colors"
            >
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white font-medium">hello@myparadiseenglish.com</span>
            </a>
            <a 
              href="tel:+886123456789"
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full hover:bg-white/30 transition-colors"
            >
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white font-medium">+886 123 456 789</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a 
              href="https://facebook.com/myparadiseenglish" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all"
              aria-label="Facebook"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://instagram.com/myparadiseenglish" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all"
              aria-label="Instagram"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
