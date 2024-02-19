import { createUser } from '../controllers/user.controller'

export const userRoutes = (app) => {
  app.get('/users', createUser)
}
