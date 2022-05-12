import express from 'express'

import { createGameStore, getGamestores,getSingleGamestore,updateGamestore,deleteGamestore,gamestorePhotoUpload,getGamestoreByRadius } from '../../controllers/gamestores'
import { advancedResults } from '../../middleware/advancedResults'
import { authorize, protectRoute } from '../../middleware/auth'
import GamestoreModel from '../../Models/Gamestores'
import gamesRouter from '../Games/games'
import reviewRouter from '../Reviews/reviews'



export const gamestoreRouter = express.Router()


// reroute into other resource router

gamestoreRouter.use('/:gamestoreId/games',gamesRouter)
gamestoreRouter.use('/:gamestoreId/reviews',reviewRouter)


// create and post gamestore routes.
gamestoreRouter.get('/',advancedResults(GamestoreModel,"games"),getGamestores)
gamestoreRouter.post('/',protectRoute,authorize("publisher","admin"),createGameStore)



// single gamestore routes
gamestoreRouter.get('/:id',getSingleGamestore)

gamestoreRouter.put('/:id',protectRoute,authorize('publisher','admin'),updateGamestore)

gamestoreRouter.delete('/:id',protectRoute,authorize('publisher','admin'),deleteGamestore)


// photo upload
gamestoreRouter.put('/:id/photo',protectRoute,authorize
('publisher','admin'),gamestorePhotoUpload)

// zipcode and distance.
gamestoreRouter.get('/radius/:zipcode/:distance',getGamestoreByRadius)

