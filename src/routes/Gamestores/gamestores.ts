import express, { Router } from 'express'
import { createGameStore, getGamestores } from '../../controllers/gamestores'
import { advancedResults } from '../../middleware/advancedResults'
import { authorize, protectRoute } from '../../middleware/auth'
import GamestoreModel from '../../Models/Gamestores'
import gamesRouter from '../Games/games'



export const gamestoreRouter = express.Router()


// reroute into other resource router

gamestoreRouter.use('/:gamestoreId/games',gamesRouter)
gamestoreRouter.get('/',advancedResults(GamestoreModel,"games"),getGamestores)
gamestoreRouter.post('/',protectRoute,authorize("publisher","admin"),createGameStore)


