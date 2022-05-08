import express, { Router } from 'express'
import Games from '../../Models/Games'
import { advancedResults } from '../../middleware/advancedResults'


const gamesRouter = express.Router({
    mergeParams: true
})

import {protectRoute,authorize} from '../../middleware/auth'
import { createGame, getGame, getGames, updateGame } from '../../controllers/games'


gamesRouter.get('/',advancedResults(Games,{
    path: 'gamestore',
    select: 'name description'
}),getGames)

gamesRouter.post('/',protectRoute,authorize("publisher","admin"),createGame)

gamesRouter.get('/:id',getGame)

gamesRouter.put("/:id",protectRoute,authorize("publisher","admin"),updateGame)

gamesRouter.delete("/:id",protectRoute,authorize("publisher","admin"),updateGame)

export default gamesRouter