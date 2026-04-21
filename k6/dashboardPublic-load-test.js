import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "10s", target: 20 },
        { duration: "20s", target: 50 },
        { duration: "10s", target: 0 },
    ],
    thresholds: {
        http_req_duration: ["p(95)<1000"],
        http_req_failed: ["rate<0.01"],
    },
};

const BASE_URL = "https://backend.cupzone.fun/public";

export default function () {
    // =========================
    // 1. GET TOURNAMENT LIST
    // =========================
    const resTournament = http.get(`${BASE_URL}/tournament`);

    check(resTournament, {
        "status = 200": (r) => r.status === 200,
        "success = true": (r) => r.json("success") === true,
        "data is array": (r) => Array.isArray(r.json("data")),
        "data not empty": (r) => r.json("data").length > 0,
    });

    const tournaments = resTournament.json("data");

    if (!tournaments || tournaments.length === 0) {
        return;
    }

    // random tournament (giống user thật)
    const randomIndex = Math.floor(Math.random() * tournaments.length);
    const tournamentId = tournaments[randomIndex].id;

    sleep(1);

    // =========================
    // 2. GET MATCHES BY TOURNAMENT
    // =========================
    const resMatches = http.get(
        `${BASE_URL}/tournament/${tournamentId}/match`
    );

    check(resMatches, {
        "match status = 200": (r) => r.status === 200,
        "match success = true": (r) => r.json("success") === true,
        "has tournament info": (r) => r.json("data.tournament") !== null,
        "matches is array": (r) =>
            Array.isArray(r.json("data.matches")),
    });

    // validate sâu hơn (đúng business)
    check(resMatches, {
        "match has score": (r) => {
            const matches = r.json("data.matches");
            return matches.every(
                (m) =>
                    m.home_score !== undefined &&
                    m.away_score !== undefined
            );
        },
        "match has teams": (r) => {
            const matches = r.json("data.matches");
            return matches.every(
                (m) => m.home_team && m.away_team
            );
        },
    });

    sleep(1);
}