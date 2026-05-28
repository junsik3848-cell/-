"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  postUserId,
  myUserId,
}: {
  postUserId: string;
  myUserId: string | null;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!myUserId || myUserId === postUserId) { setIsLoaded(true); return; }
    const supabase = createClient();
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", myUserId)
      .eq("following_id", postUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data);
        setIsLoaded(true);
      });
  }, [myUserId, postUserId]);

  if (!isLoaded || myUserId === postUserId || isFollowing) return null;

  async function toggle() {
    if (!myUserId) { router.push("/login"); return; }
    const supabase = createClient();
    await supabase.from("follows").insert({ follower_id: myUserId, following_id: postUserId });
    setIsFollowing(true);
  }

  return (
    <button
      onClick={toggle}
      className="px-4 py-1.5 rounded-full border border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
    >
      팔로우
    </button>
  );
}
