import test from 'japa';
import { UserFactory } from '../../database/factories/index';
import supertest = require('supertest')
import Database from '@ioc:Adonis/Lucid/Database';
import Hash from '@ioc:Adonis/Core/Hash'

const Base_url = `http://${process.env.HOST}:${process.env.HOST}`

test.group('User', (group) => {
    test('it should create an user', (assert) => {
        assert.isTrue(true)
    })

    test('it should create an user', async (assert) => {
        const userPayLoad = {
            email: 'user@test',
            username: 'test',
            password: 'test',
            avatar: 'http://linkfake.com'
        }
        const { body } = await supertest(Base_url).post('/users').send(userPayLoad).expect(201)

        assert.exists(body.user, 'User undefined')
        assert.exists(body.user.id, 'ID undefined')
        assert.equal(body.user.email, userPayLoad.email)
        assert.equal(body.user.username, userPayLoad.username)
        assert.notExists(body.user.password, userPayLoad.password)
        assert.equal(body.user.avatar, userPayLoad.avatar)
    })

    test('it should return 409 when email is already in use', async (assert) => {
        const { email } = await UserFactory.create()
        const { body } = await supertest(Base_url).post('/users').send({
            email,
            username: 'test',
            password: 'test'
        }).expect(409)

        assert.exists(body.message)
        assert.exists(body.code)
        assert.exists(body.status,)
        assert.include(body.message, 'email')
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 409)
    })

    test('it should return 409 when username is already in use', async (assert) => {
        const { username } = await UserFactory.create()
        const { body } = await supertest(Base_url).post('/users').send({
            email: 'teste@teste',
            username,
            password: 'test'
        }).expect(409)

        assert.exists(body.message)
        assert.exists(body.code)
        assert.exists(body.status,)
        assert.include(body.message, 'username')
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 409)
    })

    test('it should return 422 when required data is not provided', async (assert) => {
        const { body } = await supertest(Base_url).post('/users').send({}).expect(422)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })

    test('it should update an user', async (assert) => {
        const { id, password } = await UserFactory.create()
        const email = 'test@test.com'
        const avatar = 'https://image.com/1'

        const { body } = await supertest(Base_url).put(`/users/${id}`).send({
            email,
            avatar,
            password
        }).expect(200)

        assert.exists(body.user, 'User undefined')
        assert.equal(body.user.email, email)
        assert.equal(body.user.avatar, avatar)
        assert.equal(body.user.id, id)
    })

    test('it should update password of the user', async (assert) => {

        const user = await UserFactory.create()
        const password = 'test'

        const { body } = await supertest(Base_url).put(`/users/${user.id}`).send({
            email: user.email,
            avatar: user.avatar,
            password
        }).expect(200)

        assert.exists(body.user, 'User undefined')
        assert.equal(body.user.password, password)
        assert.equal(body.user.id, user.id)

        await user.refresh()
        assert.isTrue(await Hash.verify(user.password, password))
    })

    test('it should return 422 when required data is not provided', async (assert) => {
        const { id } = await UserFactory.create()

        const { body } = await supertest(Base_url).put(`/users/${id}`).send({}).expect(422)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })

    test('it should return 422 when receive a invalid password', async (assert) => {
        const { id, email, avatar } = await UserFactory.create()

        const { body } = await supertest(Base_url).put(`/users/${id}`).send({
            password: 'tes',
            avatar,
            email
        }).expect(422)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })
    test('it should return 422 when receive a invalid email', async (assert) => {
        const { id, password, avatar } = await UserFactory.create()

        const { body } = await supertest(Base_url).put(`/users/${id}`).send({
            password,
            avatar,
            email: 'test@'
        }).expect(422)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })
    test('it should return 422 when receive a invalid avatar', async (assert) => {
        const { id, email, password } = await UserFactory.create()

        const { body } = await supertest(Base_url).put(`/users/${id}`).send({
            password,
            avatar: '123',
            email
        }).expect(422)
        assert.equal(body.code, 'BAD_REQUEST')
        assert.equal(body.status, 422)
    })

    group.beforeEach(async () => {
        await Database.beginGlobalTransaction()
    })
    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction()
    })
})