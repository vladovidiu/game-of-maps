const Router = require('koa-router')
const database = require('./database')
const cache = require('./cache')
const joi = require('joi')
const validate = require('koa-joi-validate')

const router = new Router()

// Check cache before continuing to any endpoint handlers
router.use(cache.checkResponseCache)

// Insert response into cache once handlers have finished
router.use(cache.addResponseToCache)

const idValidator = validate({
  params: { id: joi.number().min(0).max(1000).required() }
})

const typeValidator = validate({
  params: { type: joi.string().valid(['castle', 'city', 'town', 'ruin', 'landmark', 'region']).required() }
})

router.get('/hello', async ctx => {
  ctx.body = 'Hello World'
})

router.get('/time', async ctx => {
  const result = await database.queryTime()
  ctx.body = result
})

router.get('/locations/:type', typeValidator, async ctx => {
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

router.get('/kingdoms/:id/size', idValidator, async ctx => {
  const id = ctx.params.id
  const result = await database.getRegionSize(id)
  if (!result) { ctx.throw(404) }

  // Convert response (in square meters) to square km
  const sqKm = result.size * (10 ** -6)
  ctx.body = sqKm
})

router.get('/kingdoms/:id/castles', typeValidator, async ctx => {
  const regionId = ctx.params.id
  const result = await database.countCastles(regionId)
  ctx.body = result ? result.count : ctx.throw(404)
})

router.get('/kingdoms/:id/summary', idValidator, async ctx => {
  const id = ctx.params.id
  const result = await database.getSummary('kingdoms', id)
  ctx.body = result || ctx.throw(404)
})

router.get('/locations/:id/summary', idValidator, async ctx => {
  const id = ctx.params.id
  const result = await database.getSummary('locations', id)
  ctx.body = result || ctx.throw(404)
})

module.exports = router
