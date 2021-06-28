const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createToken = require('../../jwt');
const createHash = require('../../chash');
const crypto = require('crypto');
const { sequelize, User } = require('../../models/index')
const getCookie = require('../../middleware/getcookie');


router.get('/', async (req, res) => {

    res.render('main.html',{
        isLogin: req.session.isLogin
    });
});

router.post('/auth/local/login', async (req, res) => {
    let { userid, userpw } = req.body

    let result = {}
    let token = createHash(userpw)
    console.log(token)
    let check = await User.findOne({
        where: {
            userid: userid,
            userpw: token,
        }
    })
    let token2 = createToken(userid)

    if (check == null) {
        result = {
            result: false,
            msg: 'check the id or the password',
        }
        console.log('nope')
    } else {
        result = {
            result: true,
            msg: 'signed in successfully',
            id: userid
        }
        console.log('yes')
        res.cookie('AccessToken', token2, { httpOnly: true, secure: true })
        req.session.isLogin = true;
    }
    res.json(result)
})

router.get('/auth/local/logout', async (req, res) => {
    let cookieString = req.headers.cookie
    let signedinId = (getCookie(cookieString) == undefined) ? '' : getCookie(cookieString);
    console.log(signedinId)
    let getUserType = await User.findOne({
        where:{userid:signedinId}
    })
    console.log(getUserType.dataValues.usertype,'ㅋㅋㅋ')
    console.log(req.query.adm)
    if(getUserType.dataValues.usertype==2 && req.query.adm=='1'){
        console.log('admin logout')
        // res.redirect('/admin')
    }
    res.clearCookie('AccessToken');
    req.session.isLogin = false;
    res.send('<script type="text/javascript"> location.href = document.referrer;</script>')
})

module.exports = router;