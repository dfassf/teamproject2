const express=require('express');
const router=express.Router();
//메인 페이지는 최초페이지 app으로, 서브 페이지들은 router들로 내용을 가져옴

router.get('/',(req,res)=>{
    res.render('index.html',{
        title:'holy holy'
    });
})

module.exports=router;