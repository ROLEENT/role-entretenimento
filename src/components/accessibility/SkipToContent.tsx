import { Button } from '@/components/ui/button';

export function SkipToContent() {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content') || 
                      document.querySelector('[role="main"]') ||
                      document.querySelector('main');
    
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      onClick={handleSkip}
      className="absolute top-4 left-4 z-50 -translate-y-full focus:translate-y-0 transition-transform"
      variant="outline"
    >
      Pular para o conteúdo principal
    </Button>
  );
}

export function FocusManager() {
  return (
    <>
      <SkipToContent />
      <div 
        id="focus-guard-start" 
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />
    </>
  );
}