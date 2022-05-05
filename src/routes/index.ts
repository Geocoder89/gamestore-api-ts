import express from 'express'
import gamesRouter from './Games/games'
import { gamestoreRouter } from './Gamestores/gamestores'
import {userRouter} from './user/users'


export const routes = express.Router()

routes.use('/api/v1/auth',userRouter)
routes.use('/api/v1/gamestores',gamestoreRouter)
routes.use('/api/v1/games',gamesRouter)