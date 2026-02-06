import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// SheetDB API endpoint for Blog tab
const SHEETDB_BLOG_URL = 'https://sheetdb.io/api/v1/9ctz2zljbz6wx?sheet=Blog';

interface BlogPost {
  title: string;
  title_zh?: string;
  date: string;
  content: string;
  content_zh?: string;
  image?: string;
}

const WhatsNewSection = () => {
  const { t, language } = useLanguage();
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEETDB_BLOG_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data: BlogPost[] = await response.json();
        
        // Sort by date descending and get the newest
        const sorted = data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLatestPost(sorted[0] || null);
      } catch (err) {
        console.error('Error fetching latest post:', err);
        setLatestPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  const getTitle = (post: BlogPost) => {
    return language === 'zh' && post.title_zh ? post.title_zh : post.title;
  };

  const getContent = (post: BlogPost) => {
    return language === 'zh' && post.content_zh ? post.content_zh : post.content;
  };

  return (
    <section className="py-16 bg-[#fef9f3] relative">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Glassy Announcement Box */}
        <div className="relative bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border-4 border-dashed border-paradise-coral/30 overflow-hidden">
          {/* Corner Decorations */}
          <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-paradise-yellow" />
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-paradise-pink" />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 text-paradise-coral animate-spin" />
            </div>
          ) : latestPost ? (
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Image */}
              {latestPost.image && (
                <div className="w-full md:w-48 shrink-0">
                  <img 
                    src={latestPost.image} 
                    alt={getTitle(latestPost)}
                    className="w-full h-32 md:h-36 object-cover rounded-xl shadow-md"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-3">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-paradise-coral to-paradise-pink rounded-2xl flex items-center justify-center shadow-lg">
                    <Megaphone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground">
                      {t('whatsNew.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(latestPost.date).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">
                  {getTitle(latestPost)}
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {getContent(latestPost)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-paradise-coral to-paradise-pink rounded-2xl flex items-center justify-center shadow-lg">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  {t('whatsNew.title')}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {language === 'zh' ? '敬請期待更多精彩消息！' : 'Stay tuned for exciting updates!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhatsNewSection;
