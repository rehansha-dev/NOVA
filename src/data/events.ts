export interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attendees: number;
  description: string;
}

export const events: Event[] = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    category: "Technology",
    date: "September 12, 2026",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    venue: "Innovation Hub",
    attendees: 128,
    description:
      "A hands-on workshop exploring practical applications of artificial intelligence and machine learning.",
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    category: "Business",
    date: "September 13, 2026",
    startTime: "5:00 PM",
    endTime: "7:00 PM",
    venue: "Main Auditorium",
    attendees: 94,
    description:
      "Students pitch startup ideas and receive feedback from entrepreneurs and industry mentors.",
  },
  {
    id: 3,
    title: "Inter-College Dance Battle",
    category: "Cultural",
    date: "September 15, 2026",
    startTime: "6:00 PM",
    endTime: "9:00 PM",
    venue: "Open Air Theatre",
    attendees: 216,
    description:
      "A high-energy cultural competition featuring dance teams from colleges across the region.",
  },
  {
    id: 4,
    title: "Hackathon 2026",
    category: "Technology",
    date: "September 18, 2026",
    startTime: "9:00 AM",
    endTime: "9:00 PM",
    venue: "Innovation Center",
    attendees: 350,
    description:
      "A campus-wide hackathon where students build innovative solutions to real-world problems.",
  },
];