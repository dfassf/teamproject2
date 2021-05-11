const express=require('express');
const router=express.Router();
const mainRouter=require('./main/index')
const userRouter=require('./user/index')

router.use('/user',userRouter)
router.use('/',mainRouter)


module.exports=router;

