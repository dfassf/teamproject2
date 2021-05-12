const express=require('express');
const router=express.Router();
const mysql=require('mysql'); //npm install mysql 이후

let connection = mysql.createConnection({ //실질적인 설치는 아니고 세팅만 하는 것
    host:'127.0.0.1',
    user:'root',
    password:'',
    database:'homepage',
})
connection.connect(); //이렇게 쳐야 데이터베이스가 연결이 됨

// 목록 화면 가져오기
router.get('/list',(req,res)=>{    
    connection.query("select idx,subject,writer,content,date_format(today,'%Y-%m-%d %h:%i:%s') as today,hit from board order by idx desc;",(error, results)=>{ //results의 종류는 array
        if(error){
            //console.log(error);
        } else{
            //console.log(results);
            let total_record=results.length;
            results.forEach(ele=>{
                ele.number=total_record;
                total_record--;
            });
            res.render('./board/list.html',{
                list:results,
            })
        }
    })
});

//글쓰기 메뉴
router.get('/write',(req,res)=>{    
    res.render('./board/board_write.html')
});

//글 제목 누르면 보기 
router.get('/view',(req,res)=>{
    
    let idx=req.query.idx;

    connection.query(`select * from board where idx=${idx};`,(error,results)=>{
        if(error){
            //console.log(error);
        } else{ 
            //console.log(`select * from board where idx=${idx};`);
            //console.log('보기'+results);
            res.render('../views/board/board_view.html',{
                list:results[0],
                // idx:idx
            })
        }
    })
    connection.query(`update board set hit=ifnull(hit,0)+1 where idx='${idx}'`);

});

// 글쓰기 메뉴에서 글쓰기 클릭 시
router.post('/write',(req,res)=>{
    let subject=req.body.board_subject;
    let writer=req.body.board_writer;
    let content=req.body.board_content;
    let sql=`insert into board (subject,writer,content,hit) values('${subject}','${writer}','${content}','0')`

    connection.query(sql,(error,results)=>{
        if(error){

        } else{
            let insertId=results.insertId;
            res.redirect(`./board/view?idx=${insertId}`)
            console.log(results) 
        }
    })

})

//보기 페이지>수정 페이지 불러오기
router.get('/modify',(req,res)=>{    
    let idx=req.query.idx;


    connection.query(`select * from board where idx=${idx};`,(error,results)=>{
        if(error){
            //console.log(error);
        } else{ 
           // console.log('수정로드'+results);
            res.render('./board/board_modify.html',{
                item:results[0],
                idx:idx
            })
        }
    })
});

//수정페이지에서 글 수정시
router.post('/modify',(req,res)=>{
    let idx=req.body.board_idx;
    let subject=req.body.board_subject;
    let writer=req.body.board_writer;
    let content=req.body.board_content;


    let sql = `update board set subject='${subject}', writer='${writer}', content='${content}', today=now() where idx='${idx}'`;
    console.log(sql)
    connection.query(sql,(error,results)=> {
        if(error){
           // console.log(error);
        }else{
           // console.log('수정완료'+results);
           //let insertId=results.insertId;
            res.redirect(`/board/view?idx=${idx}`);
            console.log(idx,subject,writer,content);
        }
    })
})

router.get('/delete',(req,res)=>{
    let idx=req.query.idx;
    let sql=`delete from board where idx='${idx}'`;
    connection.query(sql,(error,results)=>{
        if(error){
          //  console.log('dpfj'+error);
        }else{
            res.redirect('/board/list');
        }
    })
})

module.exports=router;