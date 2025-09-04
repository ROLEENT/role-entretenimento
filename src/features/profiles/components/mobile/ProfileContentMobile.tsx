import { TabsContent } from "@/components/ui/tabs";
import { ProfileBioMobile } from "./ProfileBioMobile";
import { ProfileEventListMobile } from "./ProfileEventListMobile";
import { ProfileMediaGridMobile } from "./ProfileMediaGridMobile";
import { ProfileAboutMobile } from "./ProfileAboutMobile";
import { Profile } from "@/features/profiles/api";
import { memo, Suspense, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentMobileProps {
  profile: Profile;
  activeTab: string;
}

const TabContentLoader = memo(() => (
  <div className="space-y-4 px-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-6 w-1/2" />
  </div>
));

TabContentLoader.displayName = 'TabContentLoader';

// Memoized tab content components to prevent unnecessary re-renders
const VisaoGeralContent = memo(({ profile }: { profile: Profile }) => (
  <div className="mx-auto max-w-screen-sm space-y-0">
    <Suspense fallback={<TabContentLoader />}>
      <ProfileBioMobile profile={profile} />
      
      {/* Quick upcoming events preview */}
      {profile.handle && (
        <div className="px-4 py-3 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Próximos eventos</h3>
          <ProfileEventListMobile profile={profile} limit={3} />
        </div>
      )}
    </Suspense>
  </div>
));

const AgendaContent = memo(({ profile }: { profile: Profile }) => (
  <div className="mx-auto max-w-screen-sm px-4 py-3">
    <Suspense fallback={<TabContentLoader />}>
      {profile.handle ? (
        <ProfileEventListMobile profile={profile} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Agenda não disponível</p>
        </div>
      )}
    </Suspense>
  </div>
));

const ConteudosContent = memo(() => (
  <div className="mx-auto max-w-screen-sm px-4 py-3">
    <Suspense fallback={<TabContentLoader />}>
      <div className="text-center py-8 text-muted-foreground">
        <p>Conteúdos em breve</p>
      </div>
    </Suspense>
  </div>
));

const MediaContent = memo(({ profile }: { profile: Profile }) => (
  <div className="mx-auto max-w-screen-sm px-4 py-3">
    <Suspense fallback={<TabContentLoader />}>
      {profile.user_id ? (
        <ProfileMediaGridMobile profile={profile} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Mídia não disponível</p>
        </div>
      )}
    </Suspense>
  </div>
));

const AvaliacoesContent = memo(() => (
  <div className="mx-auto max-w-screen-sm px-4 py-3">
    <Suspense fallback={<TabContentLoader />}>
      <div className="text-center py-8 text-muted-foreground">
        <p>Avaliações em breve</p>
      </div>
    </Suspense>
  </div>
));

const SobreContent = memo(({ profile }: { profile: Profile }) => (
  <div className="mx-auto max-w-screen-sm px-4 py-3">
    <Suspense fallback={<TabContentLoader />}>
      <ProfileAboutMobile profile={profile} />
    </Suspense>
  </div>
));

// Set display names for better debugging
VisaoGeralContent.displayName = 'VisaoGeralContent';
AgendaContent.displayName = 'AgendaContent';  
ConteudosContent.displayName = 'ConteudosContent';
MediaContent.displayName = 'MediaContent';
AvaliacoesContent.displayName = 'AvaliacoesContent';
SobreContent.displayName = 'SobreContent';

const ProfileContentMobile = memo(function ProfileContentMobile({ profile, activeTab }: ProfileContentMobileProps) {
  // Early return for loading state
  if (!profile) {
    return (
      <div className="md:hidden">
        <TabContentLoader />
      </div>
    );
  }

  // Memoize content rendering to prevent unnecessary re-renders
  const content = useMemo(() => {
    switch (activeTab) {
      case "visao-geral":
        return <VisaoGeralContent profile={profile} />;
      case "agenda":
        return <AgendaContent profile={profile} />;
      case "conteudos":
        return <ConteudosContent />;
      case "fotos-videos":
        return <MediaContent profile={profile} />;
      case "avaliacoes":
        return <AvaliacoesContent />;
      case "sobre":
        return <SobreContent profile={profile} />;
      default:
        return <VisaoGeralContent profile={profile} />;
    }
  }, [activeTab, profile]);

  return (
    <div className="md:hidden">
      {content}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.profile?.id === nextProps.profile?.id &&
    prevProps.profile?.handle === nextProps.profile?.handle &&
    prevProps.profile?.user_id === nextProps.profile?.user_id
  );
});

ProfileContentMobile.displayName = 'ProfileContentMobile';

export { ProfileContentMobile };