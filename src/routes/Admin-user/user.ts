
// standard imports
import express from 'express'

import userModel from '../../Models/User'


import { createUser,deleteUser,getUser,getUsers,updateUser } from '../../controllers/users'

// middleware imports
import { advancedResults } from '../../middleware/advancedResults'
import { protectRoute,authorize } from '../../middleware/auth'

const adminUserRouter = express.Router({
    mergeParams: true
})


adminUserRouter.get('/',advancedResults(userModel,[]),protectRoute,authorize('admin'),getUsers)
adminUserRouter.post('/',protectRoute,authorize('admin'),createUser)
adminUserRouter.get('/:id',protectRoute,authorize('admin'),getUser)
adminUserRouter.put('/:id',protectRoute,authorize('admin'),updateUser)
adminUserRouter.delete('/:id',protectRoute,authorize('admin'),deleteUser)


export default adminUserRouter