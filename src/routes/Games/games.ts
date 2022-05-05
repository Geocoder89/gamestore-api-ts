import express, { Router } from 'express'
import Games from '../../Models/Games'
import { advancedResults } from '../../middleware/advancedResults'


const gamesRouter = express.Router({
    mergeParams: true
})

import {protectRoute,authorize} from '../../middleware/auth'
import { createGame } from '../../controllers/games'


gamesRouter.get('/',advancedResults(Games,{
    path: 'gamestore',
    select: 'name description'
}))

gamesRouter.post('/',protectRoute,authorize("publisher","admin"),createGame)

export default gamesRouter