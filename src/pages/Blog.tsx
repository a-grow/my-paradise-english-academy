import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// SheetDB API endpoint - Update this with your actual SheetDB URL
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/YOUR_SHEETDB_ID';

interface BlogPost {
  title: string;
  title_zh?: string;
  date: string;
  content: string;
  content_zh?: string;
}

const Blog = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEETDB_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        // Sort by date, newest first
        const sortedPosts = data.sort((a: BlogPost, b: BlogPost) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Unable to load blog posts. Please try again later.');
        // Use fallback demo data
        setPosts([
          {
            title: '🎉 Now enrolling for Spring 2026!',
            title_zh: '🎉 2026春季班招生中！',
            date: '2026-02-01',
            content: 'Limited spots available for our new Book 1 class on Fridays! Contact us today to reserve your spot.',
            content_zh: '週五新開Book 1班級，名額有限！立即聯繫我們預約名額。'
          },
          {
            title: '🌟 New Student Welcome Event',
            title_zh: '🌟 新生歡迎活動',
            date: '2026-01-15',
            content: 'Join us for our special new student orientation! Meet Teacher Andy and learn about our exciting curriculum.',
            content_zh: '歡迎參加我們的新生說明會！認識Teacher Andy，了解我們精彩的課程內容。'
          },
          {
            title: '📚 Oxford Discover Series Updates',
            title_zh: '📚 Oxford Discover 系列更新',
            date: '2026-01-10',
            content: 'We are excited to announce that all our classes now use the latest Oxford Discover curriculum materials!',
            content_zh: '我們很高興宣布，所有課程現在都使用最新的 Oxford Discover 教材！'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getTitle = (post: BlogPost) => {
    return language === 'zh' && post.title_zh ? post.title_zh : post.title;
  };

  const getContent = (post: BlogPost) => {
    return language === 'zh' && post.content_zh ? post.content_zh : post.content;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef9f3] via-[#e0f2fe] to-[#f0e7fe]">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <Sparkles className="absolute top-20 right-20 w-12 h-12 text-paradise-yellow/40 animate-float" />
        <Sparkles className="absolute top-40 left-10 w-8 h-8 text-paradise-purple/40 animate-float-delayed" />
        <Sparkles className="absolute bottom-40 right-10 w-10 h-10 text-paradise-sky/40 animate-float" />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-paradise-purple/90 to-paradise-sky/90 backdrop-blur-md shadow-lg py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-paradise-yellow animate-bounce-gentle" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                {language === 'zh' ? '部落格' : 'Blog'}
              </h1>
            </div>
            <Button
              variant="heroOutline"
              size="sm"
              onClick={() => window.close()}
              asChild
            >
              <a href="/" target="_self">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'zh' ? '返回首頁' : 'Home'}
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Blog Posts */}
      <main className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {language === 'zh' ? '所有文章' : 'All Posts'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'zh' ? '了解我們的最新消息和活動' : 'Stay updated with our latest news and events'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-paradise-purple animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <article
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-xl border-2 border-paradise-sky/20 hover:border-paradise-purple/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 text-paradise-teal mb-3">
                  <Calendar className="w-4 h-4" />
                  <time className="text-sm font-medium">{formatDate(post.date)}</time>
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  {getTitle(post)}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {getContent(post)}
                </p>
              </article>
            ))}
          </div>
        )}

        {error && !loading && posts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            {language === 'zh' ? '顯示示範資料' : 'Showing demo data'}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1e293b] py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © 2024 My Paradise English - {language === 'zh' ? '版權所有' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
