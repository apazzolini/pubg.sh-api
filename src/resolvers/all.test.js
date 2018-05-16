import moment from 'moment'
import { query, sql } from 'pgr'
import Player from '@/models/Player.js'

const andreAcctId = 'account.2bd7a66c1b5b4b25a18ee20f64f733b7'

global.__Fixture(__filename, { mock: true })

describe('model :: Player and Match', () => {
    beforeAll(global.__setupTestEnv)
    afterAll(global.__teardownTestEnv)

    const origCreate = Player.create
    const origFind = Player.find
    beforeEach(() => {
        Player.create = jest.fn(async (...args) => origCreate.call(Player, ...args))
        Player.find = jest.fn(async (...args) => origFind.call(Player, ...args))
    })

    test('retrieves new players from the PUBG api', async () => {
        expect(await global.__graphql(`
            query {
                player(shardId: "pc-na", name: "BreaK") {
                    id
                    name
                    matches {
                        id
                    }
                }
            }
        `)).toMatchSnapshot()
        expect(Player.create).toHaveBeenCalled()
    })

    test('re-requesting a player retrieves it from the db', async () => {
        expect(await global.__graphql(`
            query {
                player(shardId: "pc-na", name: "BreaK") {
                    id
                    name
                    matches {
                        id
                    }
                }
            }
        `)).toMatchSnapshot()
        expect(Player.create).not.toHaveBeenCalled()
    })

    test('requesting a player on a differnt shard updates the db', async () => {
        expect(await global.__graphql(`
            query {
                player(shardId: "pc-eu", name: "BreaK") {
                    id
                    name
                    matches {
                        id
                    }
                }
            }
        `)).toMatchSnapshot()

        expect(Player.create).toHaveBeenCalled()
        expect(await query(sql`SELECT * FROM players p LEFT JOIN player_shards ps ON p.id = ps.player_id`))
            .toHaveLength(2)
    })

    test('re-requesting a player refreshes matches if enough time has passed', async () => {
        Player.find = jest.fn(async (...args) => {
            return {
                id: 'account.a36bed11ed214557b0ddef9ef1a56d07',
                name: 'BreaK',
                lastFetchedAt: moment.utc('2018-01-01 00:00:00'),
            }
        })

        await global.__graphql(`
            query {
                player(shardId: "pc-na", name: "BreaK") {
                    id
                    name
                    matches {
                        id
                    }
                }
            }
        `)
        expect(Player.create).toHaveBeenCalled()
    })

    test('retrieves match data from the PUBG api', async () => {
        const matchId = await query.one(sql`
            SELECT match_id AS id
            FROM match_players
            WHERE player_id = ${andreAcctId}
            LIMIT 1
        `, { rowMapper: row => row.id })

        expect(await global.__graphql(`
            query {
                match(id: "${matchId}") {
                    id
                    gameMode
                    playedAt
                    mapName
                    durationSeconds
                    telemetryUrl
                    players {
                        id
                        rosterId
                        name
                        stats
                    }
                }
            }
        `)).toMatchSnapshot()
    })
})
