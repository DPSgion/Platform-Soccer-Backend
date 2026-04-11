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

const getAllTeams = () => {
  return teams;
};

const getTeamById = (teamId) => {
  return teams.find((team) => team.id === teamId);
};

module.exports = {
  getAllTeams,
  getTeamById
};