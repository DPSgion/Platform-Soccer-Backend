const tournaments = [
  {
    id: "1",
    name: "Cupzone Tournament 2026",
    logo_url: "https://picsum.photos/200/200",
    description: "Giải đấu bóng đá mùa hè 2026",
    format: "LEAGUE",
    start_date: "2026-07-01",
    end_date: "2026-07-20",
    status: "UPCOMING",
    organizer_id: "user_1",
  },
  {
    id: "2",
    name: "Champions Cup 2026",
    logo_url: "https://picsum.photos/200/201",
    description: "Giải đấu loại trực tiếp",
    format: "KNOCKOUT",
    start_date: "2026-08-10",
    end_date: "2026-08-30",
    status: "UPCOMING",
    organizer_id: "user_2",
  },
];

// fake matches data
const matches = [
  {
    id: "m1",
    tournament_id: "1",
    home_team_id: "team_1",
    away_team_id: "team_2",
    home_score: 2,
    away_score: 1,
    stadium: "National Stadium",
    start_time: "2026-07-05 18:00:00",
  },
  {
    id: "m2",
    tournament_id: "1",
    home_team_id: "team_3",
    away_team_id: "team_1",
    home_score: 0,
    away_score: 3,
    stadium: "Jalan Besar Stadium",
    start_time: "2026-07-10 20:00:00",
  },
  {
    id: "m3",
    tournament_id: "2",
    home_team_id: "team_4",
    away_team_id: "team_5",
    home_score: 1,
    away_score: 1,
    stadium: "Sport Hub",
    start_time: "2026-08-12 19:30:00",
  },
];
const teams = {
  team_1: {
    name: "Lions FC",
    logo: "https://picsum.photos/50/50?1",
  },
  team_2: {
    name: "Tigers FC",
    logo: "https://picsum.photos/50/50?2",
  },
  team_3: {
    name: "Eagles FC",
    logo: "https://picsum.photos/50/50?3",
  },
  team_4: {
    name: "Dragon FC",
    logo: "https://picsum.photos/50/50?4",
  },
  team_5: {
    name: "Phoenix FC",
    logo: "https://picsum.photos/50/50?5",
  },
};
// Danh sách giải đấu
exports.getTournaments = async () => {
  return tournaments;
};
//Chi tiết giải đấu và các trận đấu liên quan
exports.getTournamentMatches = async (tournamentId) => {
  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const tournamentMatches = matches
    .filter((m) => m.tournament_id === tournamentId)
    .map((m) => ({
      ...m,
      home_team: {
        id: m.home_team_id,
        name: teams[m.home_team_id].name,
        logo: teams[m.home_team_id].logo,
      },
      away_team: {
        id: m.away_team_id,
        name: teams[m.away_team_id].name,
        logo: teams[m.away_team_id].logo,
      },
    }));

  return {
    tournament,
    matches: tournamentMatches,
  };
};
