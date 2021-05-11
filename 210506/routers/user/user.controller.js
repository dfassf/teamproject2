const {User}=require('../../models/index')


let join=(req,res)=>{
    res.render('./user/join.html')
}

let join_success=async(req,res)=>{
    let userid=req.body.userid;
    let userpw=req.body.userpw;
    let username=req.body.username;
    let gender=req.body.gender;
    let userimage=req.file==undefined ? '' : req.file.path
    try{
        let rst=await User.create({
            userid,userpw,username,gender,userimage
    })
    } catch(e){
        console.log(e)
    }
    res.render('./user/join_success.html',{
        userid:userid,
        userpw:userpw,
        username:username,
        gender:gender,
    })
}

let login = (req,res)=>{
    let flag=req.query.flag;
    res.render('./user/login.html', {flag});
}


let logout = (req,res)=>{
    delete req.session.isLogin;
    delete req.session.uid;

    req.session.save(()=>{
        res.redirect('/')
    })
}
let info=async(req,res)=>{
    let userlist=await User.findAll({})

    res.render('./user/info.html',{
        userlist:userlist
 
    })
    /*
    res.json({
        userlist,
    })    */
}

let login_check = async(req,res)=>{
    let userid=req.body.userid;
    let userpw=req.body.userpw;
    let result = await User.findOne({
        where:{userid,userpw}
    })
    if(result==null){ //로그인 실패
        res.redirect('/user/login?flag=0')
    } else{
        req.session.uid=userid; //로그인 성공
        req.session.isLogin=true; //로그인상태가 트룬지 아닌지
        req.session.save(()=>{
            res.redirect('/');
        })
    }
}

let userid_check=async(req,res)=>{
    let userid=req.query.userid
    let flag=false;
    let result=await User.findOne({
        where:{userid}
    })


    // result undefined: 생성가능
    // result 존재: 생성불가능
    if(result==undefined){
        flag=true;
    } else{
        flag=false;
    }
    res.json({
        login:flag,
        userid,
    })

}





module.exports={ // 객체로 넘어감
    join:join,
    login:login,
    logout:logout,
    info:info,
    join_success:join_success,
    login_check:login_check,
    userid_check:userid_check
}