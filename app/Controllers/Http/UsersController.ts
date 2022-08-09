import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import BadRequest from '../../Exceptions/BadRequestException';
import CreateUser from '../../Validators/CreateUserValidator';
import UpdateUser from '../../Validators/UpdateUserValidator';


export default class UsersController {
    static async store({ request, response }: HttpContextContract) {
        const userPayload = await request.validate(CreateUser)
        // const userPayload = request.only(['email', 'password', 'username', 'avatar'])
        // if (!userPayload.email||!userPayload.username||!userPayload.password) throw new BadRequest('provide required data', 422)

        const userByEmail = await User.findBy('email', userPayload.email)
        const userByUsername = await User.findBy('username', userPayload.username)


        if (userByEmail) throw new BadRequest('email already in use', 409)
        if (userByUsername) throw new BadRequest('username already in use', 409)

        const user = await User.create(userPayload)

        return response.created({ user })
    }

    static async update({ request, response }: HttpContextContract) {
        const { email, password, avatar } = await request.validate(UpdateUser)
        // const { email, password, avatar } = await request.only(['email', 'avatar', 'password'])
        const id = request.param('id')

        const user = await User.findOrFail(id)
        user.email = email
        user.password = password

        if (avatar) user.avatar = avatar
        await user.save()

        return response.ok({})
    }

}
