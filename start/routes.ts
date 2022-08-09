import Route from '@ioc:Adonis/Core/Route'
import UsersController from 'App/Controllers/Http/UsersController';


Route.get('/', async () => {
  return { hello: 'world' }
})
Route.post('/users', UsersController.store)
Route.put('/users/:id', UsersController.update)

