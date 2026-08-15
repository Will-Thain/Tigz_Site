export type CharacterProgress = {
  updatedAt: string;
  pmcLevel: string;
  pmcKd: string;
  scavKd: string;
  survival: string;
  hideoutNotes: string;
  questNotes: string;
  source: "admin";
};

export const characterProgress: CharacterProgress = {
  updatedAt: "2026-08-15T00:00:00.000Z",
  pmcLevel: "—",
  pmcKd: "—",
  scavKd: "—",
  survival: "—",
  hideoutNotes: "Hideout is not read from the game. A mod can type notes here after Tigz publishes them.",
  questNotes:
    "Quest state can later sync from a TarkovTracker.org read-only token. Until that token exists, this board stays manual.",
  source: "admin",
};
