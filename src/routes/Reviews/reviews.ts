import express from 'express'

import ReviewModel from '../../Models/Reviews'


import { addReview, deleteReview, getReview, getReviews, updateReview } from '../../controllers/reviews'

import { advancedResults } from '../../middleware/advancedResults'

import { protectRoute,authorize } from '../../middleware/auth'


const reviewRouter = express.Router({
    mergeParams: true
})


reviewRouter.get('/',advancedResults(ReviewModel,{
    path: 'gamestore',
    select: 'name description'
}),
getReviews
)

reviewRouter.post('/',protectRoute,authorize('user','admin'),addReview)

reviewRouter.get('/:id',getReview)
reviewRouter.put('/:id',protectRoute,authorize('user','admin'),updateReview)

reviewRouter.delete('/:id',authorize('user','admin'),deleteReview)



export default reviewRouter