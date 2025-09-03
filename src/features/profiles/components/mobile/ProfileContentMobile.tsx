import { TabsContent } from "@/components/ui/tabs";
import { ProfileBioMobile } from "./ProfileBioMobile";
import { ProfileEventListMobile } from "./ProfileEventListMobile";
import { ProfileMediaGridMobile } from "./ProfileMediaGridMobile";
import { ProfileAboutMobile } from "./ProfileAboutMobile";
import { Profile } from "@/features/profiles/api";

interface ProfileContentMobileProps {
  profile: Profile;
  activeTab: string;
}

export function ProfileContentMobile({ profile, activeTab }: ProfileContentMobileProps) {
  return (
    <div className="md:hidden">
      {/* Visão Tab Content */}
      {activeTab === "visao" && (
        <div className="mx-auto max-w-screen-sm space-y-0">
          <ProfileBioMobile profile={profile} />
          
          {/* Quick upcoming events preview */}
          <div className="px-4 py-3 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Próximos eventos</h3>
            <ProfileEventListMobile profile={profile} limit={3} />
          </div>
        </div>
      )}

      {/* Agenda Tab Content */}
      {activeTab === "agenda" && (
        <div className="mx-auto max-w-screen-sm px-4 py-3">
          <ProfileEventListMobile profile={profile} />
        </div>
      )}

      {/* Mídia Tab Content */}
      {activeTab === "midia" && (
        <div className="mx-auto max-w-screen-sm px-4 py-3">
          <ProfileMediaGridMobile profile={profile} />
        </div>
      )}

      {/* Sobre Tab Content */}
      {activeTab === "sobre" && (
        <div className="mx-auto max-w-screen-sm">
          <ProfileAboutMobile profile={profile} />
        </div>
      )}
    </div>
  );
}