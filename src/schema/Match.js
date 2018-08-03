export const MatchFields = `
    id: String!
    shardId: String!
    gameMode: String
    playedAt: String
    mapName: String
    durationSeconds: Int
    telemetryUrl: String
    teamSize: Int
    isCustomMatch: String
`

export default `
    type MatchStats {
        DBNOs: Int!
        assists: Int!
        boosts: Int!
        damageDealt: Float!
        deathType: String!
        headshotKills: Int!
        heals: Int!
        killPlace: Int!
        killPoints: Int!
        killPointsDelta: Float!
        killStreaks: Int!
        kills: Int!
        lastKillPoints: Int!
        lastWinPoints: Int!
        longestKill: Float!
        mostDamage: Float!
        name: String!
        playerId: String!
        revives: Int!
        rideDistance: Float!
        roadKills: Int!
        teamKills: Int!
        timeSurvived: Int!
        vehicleDestroys: Int!
        walkDistance: Float!
        weaponsAcquired: Int!
        winPlace: Int!
        winPoints: Int!
        winPointsDelta: Float!
    }

    type MatchPlayer {
        id: String!
        name: String!
        rosterId: String!
        stats: MatchStats!
    }

    type Match {
        ${MatchFields}
        players: [MatchPlayer!]!
    }

    type SampleMatch {
        id: String!
        playerName: String!
        shardId: String!
    }

    type Query {
        match(id: String!): Match!
        sampleMatch(shardId: String!): SampleMatch!
    }
`
