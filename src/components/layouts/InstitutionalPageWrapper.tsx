import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/components/PublicLayout';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface InstitutionalPageWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  lastUpdated?: string;
  status?: 'published' | 'draft' | 'coming-soon';
  className?: string;
}

export const InstitutionalPageWrapper: React.FC<InstitutionalPageWrapperProps> = ({
  children,
  title,
  description,
  seoTitle,
  seoDescription,
  lastUpdated,
  status = 'published',
  className = ""
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'coming-soon':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Rascunho';
      case 'coming-soon':
        return 'Em breve';
      default:
        return '';
    }
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>{seoTitle || `${title} – ROLÊ ENTRETENIMENTO`}</title>
        <meta 
          name="description" 
          content={seoDescription || description} 
        />
        <meta property="og:title" content={seoTitle || title} />
        <meta property="og:description" content={seoDescription || description} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://roleentretenimento.com${window.location.pathname}`} />
      </Helmet>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {getStatusIcon()}
                <span className="text-sm font-medium text-muted-foreground">
                  {getStatusText()}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {description}
              </p>

              {lastUpdated && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Última atualização: {lastUpdated}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto ${className}`}>
              {children}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
};