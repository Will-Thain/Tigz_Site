export type Poll = {
  id: string;
  question: string;
  closesAt: string;
  active: boolean;
  options: { id: string; label: string; votes: number }[];
};

export const polls: Poll[] = [
  {
    id: "kit-meta",
    question: "What kit do you want to see featured on stream this week?",
    closesAt: "2026-08-22T00:00:00.000Z",
    active: true,
    options: [
      { id: "budget", label: "Budget / hatchling recovery", votes: 0 },
      { id: "mid", label: "Mid-tier class 4", votes: 0 },
      { id: "chad", label: "Chad kit, no regrets", votes: 0 },
      { id: "sniper", label: "Bolt action night ops", votes: 0 },
    ],
  },
  {
    id: "map-week",
    question: "Which map should own the next raid series?",
    closesAt: "2026-08-20T00:00:00.000Z",
    active: true,
    options: [
      { id: "customs", label: "Customs", votes: 0 },
      { id: "woods", label: "Woods", votes: 0 },
      { id: "streets", label: "Streets", votes: 0 },
      { id: "lighthouse", label: "Lighthouse", votes: 0 },
    ],
  },
];

export function pollIsOpen(poll: Poll) {
  if (poll.active === false) return false;
  if (!poll.closesAt) return true;
  const closes = new Date(poll.closesAt).getTime();
  return Number.isNaN(closes) || Date.now() < closes;
}
