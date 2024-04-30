const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'covid19India.db')
let db = null
const initialZationDbResponse = async () => {
  try {
    ;(db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })),
      app.listen(3000, () => {
        console.log('Sucessfully working http://localhost:3000/')
      })
  } catch (e) {
    console.log(`Db Error:- ${e.message}`)
    process.exit(1)
  }
}
initialZationDbResponse()

const changeGetAllDbName = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}
//getAll
app.get('/states/', async (request, response) => {
  const getAllrequestDb = `
        SELECT
            *
            FROM
                state
    `
  const getResponseDb = await db.all(getAllrequestDb)
  const resGetAllData = getResponseDb.map(eachObj => {
    return changeGetAllDbName(eachObj)
  })
  response.send(resGetAllData)
})

//GetId
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getrequestDb = `
      SELECT
        *
        FROM
        state
      WHERE state_id=${stateId}
  `
  const GetIdResponseDb = await db.get(getrequestDb)
  const resGetIdData = changeGetAllDbName(GetIdResponseDb)
  response.send(resGetIdData)
})

const changePostDbName = dbObject => {
  return {
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.dbObject,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.dbObject,
  }
}

//Post
app.post('/districts/', async (request, response) => {
  const PostBodyData = request.body
  const {districtName, stateId, cases, cured, active, deaths} = PostBodyData
  const PostDbRequest = `
        Insert INTO
          district(district_name, state_id, cases, cured, active, deaths)
        Values
          (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
          )
      `
  const PostResponseDb = await db.run(PostDbRequest)
  const resGetIdData = changePostDbName(PostResponseDb)
  response.send('District Successfully Added')
})

const changeGetIdDbName = dataObject => {
  return {
    districtId: dataObject.district_id,
    districtName: dataObject.district_name,
    stateId: dataObject.state_id,
    cases: dataObject.cases,
    cured: dataObject.cured,
    active: dataObject.active,
    deaths: dataObject.deaths,
  }
}

//GETId
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const GetIdRequesttoDb = `
      SELECT
        *
        FROM
        district
      WHERE district_id=${districtId}
  `
  const GetIdResponseDb = await db.get(GetIdRequesttoDb)
  const resGetIdData = changeGetIdDbName(GetIdResponseDb)
  response.send(resGetIdData)
})

//Delete
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const DeleteRequesttoDb = `
      DELETE
        FROM
      district
      WHERE district_id = ${districtId}
    `
  const DeleteResponseDb = await db.run(DeleteRequesttoDb)
  response.send('District Removed')
})

//PUT
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const bodyDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = bodyDetails
  const PutRequestToDb = `
      UPDATE 
        district
      SET
        district_name='${districtName}',
        state_id=${stateId},
        cases=${cases},
        cured=${cured},
        active=${active},
        deaths=${deaths}
      WHERE district_id = ${districtId}
    `
  const getPutResponse = await db.run(PutRequestToDb)
  changePostDbName(getPutResponse)
  response.send('District Details Updated')
})

//GetState
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getStartsRequest = `SELECT
      sum(cases) as totalCases,
      sum(cured) as totalCured,
      sum(active) as totalActive,
      sum(deaths) as totalDeaths
      FROM
      district
      WHERE state_id=${stateId}
    `
  const getStateResponse = await db.get(getStartsRequest)
  response.send(getStateResponse)
})

const geteStateDataChange = dbObject => {
  return {
    stateName: dbObject.state_name,
  }
}
//getId

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getFromDb = `
    SELECT state_id
    FROM
    district
    WHERE district_id = ${districtId}
  `
  const getDistrictIdQueryResponse = await db.get(getFromDb)

  const getFromDbMovieName = `
      SELECT state_name as stateName
      FROM
      state
      WHERE state_id = ${getDistrictIdQueryResponse.state_id}
    `
  const getStateNameQueryResponse = await db.get(getFromDbMovieName)
  response.send(getStateNameQueryResponse)
})

module.exports = app
