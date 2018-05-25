const postgres = require('pg')
const log = require('./logger')
const connectionString = process.env.DATABASE_URL

// Initialize postgres client
const client = new postgres.Client({ connectionString })

// Connect to the DB
client.connect().then(() => {
  log.info(`Connected To ${client.database} at ${client.host}:${client.port}`)
}).catch(log.error)

module.exports = {
  queryTime: async () => {
    const result = await client.query('SELECT NOW() as now')
    return result.rows[0]
  },

  getLocations: async type => {
    const locationQuery = `
      SELECT ST_AsGeoJSON(geog), name, type, gid
      FROM locations
      WHERE UPPER(type) = UPPER($1);
    `
    const result = await client.query(locationQuery, [ type ])
    return result.rows
  },

  getKingdomBoundaries: async () => {
    const boundaryQuery = `
      SELECT ST_AsGeoJSON(geog), name, gid
      FROM kingdoms;
    `
    const result = await client.query(boundaryQuery)
    return result.rows
  },

  getRegionSize: async id => {
    const sizeQuery = `
      SELECT ST_AREA(geog) as size
      FROM kingdoms
      WHERE gid = $1
      LIMIT(1);
    `
    const result = await client.query(sizeQuery, [ id ])
    return result.rows[0]
  },

  countCastles: async regionId => {
    const countQuery = `
      SELECT count(*)
      FROM kingdoms, locations
      WHERE ST_intersects(kingdoms.geog, locations.geog)
      AND kingdoms.gid = $1
      AND locations.type = 'Castle';
    `
    const result = await client.query(countQuery, [ regionId ])
    return result.rows[0]
  },

  getSummary: async (table, id) => {
    if (table !== 'kingdoms' && table !== 'locations') {
      throw new Error(`Invalid table - ${table}`)
    }

    const summaryQuery = `
      SELECT summary, url
      FROM ${table}
      WHERE gid = $1
      LIMIT(1)
    `
    const result = await client.query(summaryQuery, [ id ])
    return result.rows[0]
  }
}
