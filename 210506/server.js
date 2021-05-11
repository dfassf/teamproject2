const express=require('express'); //
const {sequelize}=require('./models') //
const app=express(); //
const {User}=require('./models') //
const router = require('./routers/index');
const bodyParser=require('body-parser');
const session=require('express-session');
const cors=require('cors');


app.use(cors());
app.set('view engine','html');
const nunjucks=require('nunjucks');
nunjucks.configure('views',{
    express:app
})
//설명필요 

app.use(session({
    secret:'aaa',
    resave:false,
    saveUninitialized:true,
}))


app.use(bodyParser.urlencoded({extended:false}))

sequelize.sync({force:false,})
.then(()=>{
    console.log('접속 성공')
})
.catch(()=>{
    console.log('접속 실패')
})


app.use('/',router) //두가지 미드웨어가 들어갈 수 있다





app.listen(3000,()=>{
    console.log('3000')
})


/* const express=require('express');
const {sequelize}=require('./models')
const app=express();
const {User}=require('./models')
const Sequelize=require('sequelize')
sequelize.sync({force:false,})
.then(()=>{
    console.log('접속 성공')
})
.catch(()=>{
    console.log('접속 실패')
})
app.get('/', async (req,res)=>{
    User.create({
        userid:'dfassf',
        userpw:'1234',
        username:'엄신우',
        gender: true,
        userimage: 'no image',
        //userdt:NOW라고 지정되어 있어 굳이 안넣어도 됨.
    })
    let result=await User.update({
        userpw:'12345678',
        username:'엄신우1',
        gender:false,
    },{
        where: {userid:'dfassf'} // where 절 사용법
    })
    console.log(result)
    
    User.destroy({
        where:{id:1}
    })
    res.send('hello world')
    
})
let userList=user.findAll({})
.then((result)=>{
    console.log(result)
})
.catch((error)=>{
    console.log(error)
})
console.log(userList);
let userList=await User.findAll({ //await은 실행되고 있는 함수에 붙여야 함->app.get의 req res 앞
    //await async는 매우매우매우매우중요
})
 
app.listen(3000,()=>{
    console.log('3000')
})
*/