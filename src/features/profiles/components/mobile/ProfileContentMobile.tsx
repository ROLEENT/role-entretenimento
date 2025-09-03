import { TabsContent } from "@/components/ui/tabs";
import { ProfileBioMobile } from "./ProfileBioMobile";
import { ProfileEventListMobile } from "./ProfileEventListMobile";
import { ProfileMediaGridMobile } from "./ProfileMediaGridMobile";
import { ProfileAboutMobile } from "./ProfileAboutMobile";
import { Profile } from "@/features/profiles/api";
import { memo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentMobileProps {
  profile: Profile;
  activeTab: string;
}

const TabContentLoader = () => (
  <div className="space-y-4 px-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);

export const ProfileContentMobile = memo(function ProfileContentMobile({ profile, activeTab }: ProfileContentMobileProps) {
  return (
    <div className="md:hidden">
      {/* Visão Tab Content */}
      {activeTab === "visao" && (
        <div className="mx-auto max-w-screen-sm space-y-0 animate-fade-in">
          <Suspense fallback={<TabContentLoader />}>
            <ProfileBioMobile profile={profile} />
            
            {/* Quick upcoming events preview */}
            <div className="px-4 py-3 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Próximos eventos</h3>
              <ProfileEventListMobile profile={profile} limit={3} />
            </div>
          </Suspense>
        </div>
      )}

      {/* Agenda Tab Content */}
      {activeTab === "agenda" && (
        <div className="mx-auto max-w-screen-sm px-4 py-3 animate-fade-in">
          <Suspense fallback={<TabContentLoader />}>
            <ProfileEventListMobile profile={profile} />
          </Suspense>
        </div>
      )}

      {/* Mídia Tab Content */}
      {activeTab === "midia" && (
        <div className="mx-auto max-w-screen-sm px-4 py-3 animate-fade-in">
          <Suspense fallback={<TabContentLoader />}>
            <ProfileMediaGridMobile profile={profile} />
          </Suspense>
        </div>
      )}

      {/* Sobre Tab Content */}
      {activeTab === "sobre" && (
        <div className="mx-auto max-w-screen-sm animate-fade-in">
          <Suspense fallback={<TabContentLoader />}>
            <ProfileAboutMobile profile={profile} />
          </Suspense>
        </div>
      )}
    </div>
  );
});