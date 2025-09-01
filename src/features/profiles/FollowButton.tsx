import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function FollowButton({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/entrar"; return; }
      if (following) {
        await supabase.from("followers").delete().eq("profile_id", profileId).eq("user_id", user.id);
        setFollowing(false);
      } else {
        await supabase.from("followers").insert({ profile_id: profileId, user_id: user.id });
        setFollowing(true);
      }
    } finally { setLoading(false); }
  }
  return (
    <button onClick={toggle} disabled={loading} className="h-9 px-3 rounded-md border text-sm">
      {following ? "Seguindo" : "Seguir"}
    </button>
  );
}