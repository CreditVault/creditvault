import type { Application } from "@/lib/applications";

export type Achievement = {
  id: string;
  label: string;
  desc: string;
  earned: boolean;
  progress: number; // 0..1
  icon: string; // emoji for lightness
};

export function computeAchievements(input: {
  bookmarks: number;
  likes: number;
  apps: Application[];
  reviews: number;
}): Achievement[] {
  const submitted = input.apps.filter((a) =>
    ["submitted", "review", "approved", "renewed"].includes(a.status),
  ).length;
  const approved = input.apps.filter((a) => a.status === "approved").length;

  const at = (n: number, target: number) => Math.min(1, n / target);
  return [
    {
      id: "first-save",
      label: "First bookmark",
      desc: "Save your first offer to the vault.",
      earned: input.bookmarks >= 1,
      progress: at(input.bookmarks, 1),
      icon: "🔖",
    },
    {
      id: "ten-saved",
      label: "Curator",
      desc: "Save 10 offers.",
      earned: input.bookmarks >= 10,
      progress: at(input.bookmarks, 10),
      icon: "🗂️",
    },
    {
      id: "first-apply",
      label: "First application",
      desc: "Submit your first application.",
      earned: submitted >= 1,
      progress: at(submitted, 1),
      icon: "🚀",
    },
    {
      id: "approved",
      label: "Approved!",
      desc: "Get one program approved.",
      earned: approved >= 1,
      progress: at(approved, 1),
      icon: "🏆",
    },
    {
      id: "reviewer",
      label: "Community reviewer",
      desc: "Post a helpful review.",
      earned: input.reviews >= 1,
      progress: at(input.reviews, 1),
      icon: "💬",
    },
    {
      id: "verified",
      label: "Verified founder",
      desc: "Track 5+ active applications.",
      earned: submitted >= 5,
      progress: at(submitted, 5),
      icon: "✅",
    },
    {
      id: "supporter",
      label: "Early supporter",
      desc: "Like 5 programs.",
      earned: input.likes >= 5,
      progress: at(input.likes, 5),
      icon: "❤️",
    },
    {
      id: "os-hero",
      label: "Open-source hero",
      desc: "Star CreditVault on GitHub.",
      earned: false,
      progress: 0,
      icon: "⭐",
    },
  ];
}
