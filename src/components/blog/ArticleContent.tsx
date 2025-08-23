import ReactMarkdown from "react-markdown";

interface ArticleContentProps {
  content: string;
}

const ArticleContent = ({ content }: ArticleContentProps) => {
  return (
    <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
      <ReactMarkdown 
        components={{
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground border-b border-border/30 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 leading-relaxed text-muted-foreground">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default ArticleContent;