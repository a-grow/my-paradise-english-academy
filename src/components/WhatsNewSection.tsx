import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, Sparkles, Loader2 } from 'lucide-react';
import { useBlog } from '@/hooks/useSheetDB';

const WhatsNewSection = () => {
  const { t } = useLanguage();
  const { data: blogPosts, isLoading, error } = useBlog();

  return (
    <section className="py-16 bg-[#fef9f3] relative">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Section Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-paradise-purple/10 px-5 py-2 rounded-full mb-4">
            <Megaphone className="w-5 h-5 text-paradise-purple" />
            <span className="text-paradise-purple font-semibold text-sm">{t('whatsNew.title')}</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-paradise-purple animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading announcements...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-500">
            Failed to load announcements. Please try again later.
          </div>
        )}

        {/* Blog Posts */}
        {blogPosts && blogPosts.length > 0 && (
          <div className="space-y-6">
            {blogPosts.map((post, index) => (
              <div 
                key={post.id || index}
                className="relative bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border-4 border-dashed border-paradise-coral/30"
              >
                {/* Corner Decorations */}
                <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-paradise-yellow" />
                <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-paradise-pink" />
                
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    {post.title}
                  </h3>
                  <p className="text-sm text-paradise-purple font-medium">
                    {post.date}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed mt-2">
                    {post.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {blogPosts && blogPosts.length === 0 && (
          <div className="relative bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border-4 border-dashed border-paradise-coral/30 text-center">
            <p className="text-muted-foreground">No announcements at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatsNewSection;
