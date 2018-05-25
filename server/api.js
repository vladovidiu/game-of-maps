const Router = require('koa-router')
const database = require('./database')
const cache = require('./cache')
const joi = require('joi')
const validate = require('koa-joi-validate')

const router = new Router()

router.get('/hello', async ctx => {
  ctx.body = 'Hello World'
})

router.get('/time', async ctx => {
  const result = await database.queryTime()
  ctx.body = result
})

router.get('/locations/:type', async ctx => {
  const type = ctx.params.type
  const results = await database.getLocations(type)
  if (results.length === 0) { ctx.throw(404) }

  const locations = results.map(row => {
    let geoJson = JSON.parse(row.st_asgeojson)
    geoJson.properties = { name: row.name, type: row.type, id: row.gid }
    return geoJson
  })

  ctx.body = locations
})

router.get('/kingdoms', async ctx => {
  const results = await database.getKingdomBoundaries()
  if (results.length === 0) { ctx.throw(404) }

  const boundaries = results.map(row => {
    let geoJson = JSON.parse(row.st_asgeojson)
    geoJson.properties = { name: row.name, id: row.gid }
    return geoJson
  })

  ctx.body = boundaries
})

module.exports = router
