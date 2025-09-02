import { Profile } from "@/features/profiles/api";
import { ProfileOverviewNew } from "./ProfileOverviewNew";
import { ProfileAgenda } from "./ProfileAgenda";
import { ProfileContentTab } from "./ProfileContentTab";
import { ProfilePortfolio } from "./ProfilePortfolio";
import { ProfileReviews } from "./ProfileReviews";
import { ProfileAbout } from "./ProfileAbout";
import { MediaUpload } from "@/components/profiles/MediaUpload";
import { ReviewForm } from "@/components/profiles/ReviewForm";

interface ProfileContentNewProps {
  profile: Profile;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileContentNew({ profile, activeTab, onTabChange }: ProfileContentNewProps) {
  switch (activeTab) {
    case "visao-geral":
      return <ProfileOverviewNew profile={profile} onTabChange={onTabChange} />;
    
    case "agenda":
      return <ProfileAgenda profile={profile} />;
    
    case "conteudos":
      return <ProfileContentTab profile={profile} />;
    
    case "fotos-videos":
      return (
        <div className="space-y-8">
          <ProfilePortfolio profileUserId={profile.user_id || ''} />
          <MediaUpload profileId={profile.id} />
        </div>
      );
    
    case "avaliacoes":
      return (
        <div className="space-y-8">
          <ProfileReviews profileUserId={profile.user_id || ''} />
          <ReviewForm profileId={profile.id} />
        </div>
      );
    
    case "sobre":
      return <ProfileAbout profile={profile} />;
    
    default:
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-4xl">🚧</div>
            <h3 className="text-lg font-medium">Em breve</h3>
            <p className="text-muted-foreground">Esta seção está sendo desenvolvida.</p>
          </div>
        </div>
      );
  }
}