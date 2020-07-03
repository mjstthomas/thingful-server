const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe.only('Auth Endpoints', function() {
  let db

  const { testUsers } = helpers.makeThingsFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/auth/login`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    const requiredFields = ['user_name', 'password']

    requiredFields.forEach(field =>{
        const loginAttemptedBody= {
            user_name: testUser.user_name,
            password: testUser.password
        }


    it(`responds with 400 required error when '${field}' is missing`, ()=>{
        delete loginAttemptedBody[field]
    
        return supertest(app)
            .post('/api/auth/login')
            .send(loginAttemptedBody)
            .expect(400, {error: `Missing '${field}' in request body`})
        })
      })
    })

    it('responds with 400 and "missing user_name or password"', ()=>{
      const userInvalidUser = { user_name: 'user-not', password: 'existy' }

      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, {error: 'missing user_name or password'})
    })

    it.only(`responds 400 'invalid user_name or password' when bad password`, () => {
           const userInvalidPass = { 
              user_name: testUser.user_name,
              password: 'incorrect' }
          console.log(testUser.user_name)
           return supertest(app)
             .post('/api/auth/login')
             .send(userInvalidPass)
             .expect(400, { error: `Incorrect user_name or password` })
         })
})