import express, { Router } from 'express'
import adminUserRouter from './Admin-user/user'
import gamesRouter from './Games/games'
import { gamestoreRouter } from './Gamestores/gamestores'
import reviewRouter from './Reviews/reviews'
import {userRouter} from './user/users'


export const routes = express.Router()

routes.use('/api/v1/auth',userRouter)
routes.use('/api/v1/gamestores',gamestoreRouter)
routes.use('/api/v1/games',gamesRouter)
routes.use('api/v1/reviews',reviewRouter)
routes.use('api/v1/users',adminUserRouter)