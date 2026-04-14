const teams = [
  {
    id: "t1",
    name: "Arsenal",
    country: "England",
    description: "Cau lac bo Arsenal de demo API.",
    logo_url: "https://byvn.net/9g0n",
    kit_url: [
      "https://byvn.net/5W3n",
      "https://byvn.net/J1bL"
    ]
  },
  {
    id: "t2",
    name: "Manchester United",
    country: "England",
    description: "Cau lac bo Manchester United.",
    logo_url: "https://byvn.net/TpsK",
    kit_url: [
      "https://byvn.net/NBYP",
      "https://byvn.net/BAUE"
    ]
  },
];
const teamMembers = [
  {
    id: "tm1",
    team_id: "t1",
    full_name: "Bukayo Saka",
    image_url: "https://picsum.photos/200",
    age: 22,
    height_cm: 178,
    weight_kg: 70.5,
    preferred_foot: "LEFT",
    main_position: "RW",
    jersey_number: 7,
    joined_at: "2024-01-10",
  },
  {
    id: "tm2",
    team_id: "t1",
    full_name: "Martin Odegaard",
    image_url: "https://picsum.photos/201",
    age: 25,
    height_cm: 178,
    weight_kg: 68,
    preferred_foot: "LEFT",
    main_position: "CM",
    jersey_number: 8,
    joined_at: "2024-01-10",
  },
  {
    id: "tm3",
    team_id: "t2",
    full_name: "Bruno Fernandes",
    image_url: "https://picsum.photos/202",
    age: 29,
    height_cm: 179,
    weight_kg: 71,
    preferred_foot: "RIGHT",
    main_position: "CAM",
    jersey_number: 8,
    joined_at: "2024-01-10",
  },
];

const getAllTeams = () => {
  return teams;
};

const getTeamById = (teamId) => {
  return teams.find((team) => team.id === teamId);
};
const getTeamMembers = (teamId) =>
  teamMembers.filter((member) => member.team_id === teamId);

module.exports = {
  getAllTeams,
  getTeamById,
  getTeamMembers
};
