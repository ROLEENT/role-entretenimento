import { SafeHTML } from '@/components/ui/safe-html';

interface ArticleContentProps {
  content: string;
}

const ArticleContent = ({ content }: ArticleContentProps) => {
  return (
    <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
      <SafeHTML 
        content={content}
        className="article-content"
      />
      <style>{`
        .article-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }
        .article-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }
        .article-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
        }
        .article-content p {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          color: hsl(var(--muted-foreground));
        }
        .article-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .article-content em {
          font-style: italic;
          color: hsl(var(--foreground));
        }
        .article-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .article-content a:hover {
          color: hsl(var(--primary));
          opacity: 0.8;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 8px;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          color: hsl(var(--muted-foreground));
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .article-content code {
          background-color: hsl(var(--muted));
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .article-content pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .article-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </article>
  );
};

export default ArticleContent;