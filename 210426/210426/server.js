const express=require('express');
const app=express();
const main=require('./routes/index');
const board=require('./routes/board');
const nunjucks=require('nunjucks');
const mysql=require('mysql');
const bodyParser=require('body-parser');
const port=process.env.SERVER_PORT;

app.set('view engine','ejs')
nunjucks.configure('views',{
    express:app,
})

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use('/',main);
app.use('/board',board);

app.get('/',(req,res)=>{
    res.send('pls world');
})






/////////////////////////
app.listen(port,()=>{
    console.log(`server starts port at ${port}`)
})