const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { sequelize, Review, User, Curriculum } = require('../../models/index');
const createToken = require('../../jwt');
const createHash = require('../../chash');
const loginCheck = require('../../middleware/getcookie');
const getCookie = require('../../middleware/getcookie');

router.get('/', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        let loadData = await sequelize.query('SELECT * FROM review where \`show\`=1;')

        let page = (req.query.id == undefined) ? 1 : req.query.id;
        let offset = (req.query.id == undefined) ? 0 : 3 * (page - 1);
        let page_array = [];
        let allRev = await sequelize.query('select * from review where \`show\`=1;');
        let resultsall = await sequelize.query('select * from review where \`show\`=1;')
            .then((resultall) => {
                let totalrecord = resultall[0].length;
                return totalrecord;
            }).catch((error) => {
                console.log(error);
            });
        ;
        let results = await sequelize.query(`select id, title, userid, content, date_format(date, '%Y-%m-%d') as date, hit, curr_id, \`show\` from review where \`show\`=1 order by id desc limit 3 offset ${offset};`)
            .then((result) => {

                let total_record = result[0].length;
                let total_page = Math.ceil(resultsall / 3);

                for (i = 1; i <= total_page; i++) {
                    page_array.push(i);
                };
                result[0].forEach(ele => {
                    ele.num = resultsall - offset;
                    resultsall--;
                });

                let ifEmpty;
                if (result[0].length !== 0) {
                    ifEmpty = false;
                } else { ifEmpty = true }

                let block = 10;
                let block_article = Math.ceil(page_array.length / block)
                let block_arr = []
                let block_start = Math.ceil(page / block)
                let block_first = 1;
                if (block_start != 1) {
                    block_first = 1 + (block * (block_start - 1))
                }
                let block_last = block_start * block
                if (block_last > total_page) {
                    block_last = total_page
                }

                for(let i=block_first; i<=block_last; i++){
                    block_arr.push(i)
                }

                let nextBlock = 1 + (block * (block_start))
                if (nextBlock > total_page) nextBlock = total_page
                let prevBlock = ((block_start - 1) * block) - 9;
                if (prevBlock < 0) prevBlock = 1

                res.render('../views/user/review_list.html', {
                    revList: result[0],
                    totalRev: allRev[0],
                    searchPages: page_array,
                    ifEmpty,
                    block_arr,
                    nextBlock,
                    prevBlock,
                    total_page,
                    page,
                    isLogin: req.session.isLogin
                });

            })
    } catch (e) { console.log(e) }
})

router.get('/search', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        let { srcCtg, keyword } = req.query
        console.log('1?????????', srcCtg)
        function getSql() {
            if (srcCtg == 'all') {
                let sql = `and concat (title, '', userid, '', content, '') like '%${keyword}%' `
                console.log('case 1')
                return sql;
            }
            else if (srcCtg == '' && keyword == '') {
                let sql = '';
                console.log('case 2')
                return sql;
            }
            else {
                let sql = `and concat (${srcCtg}, '') like '%${keyword}%' `
                console.log('case 3')
                return sql;
            }
        }
        let sql = getSql()
        let loadData = await sequelize.query(`SELECT * FROM review where \`show\`=1 ${sql}`)

        let page = (req.query.id == undefined) ? 1 : req.query.id;
        let offset = (req.query.id == undefined) ? 0 : 3 * (page - 1);
        let page_array = [];
        let allRev = await sequelize.query(`select * from review where \`show\`=1 ${sql}`);
        let resultsall = await sequelize.query(`select * from review where \`show\`=1 ${sql}`)
            .then((resultall) => {
                let totalrecord = resultall[0].length;
                return totalrecord;
            }).catch((error) => {
                console.log(error);
            });
        ;
        let results = await sequelize.query(`select id, title, userid, content, date_format(date, '%Y-%m-%d') as date, hit, curr_id, \`show\` from review where \`show\`=1 ${sql} order by id desc limit 3 offset ${offset}`)
            .then((result) => {

                let total_record = result[0].length;
                let total_page = Math.ceil(resultsall / 3);
                for (i = 1; i <= total_page; i++) {
                    page_array.push(i);
                };
                result[0].forEach(ele => {
                    ele.num = resultsall - offset;
                    resultsall--;
                });

                let ifEmpty;
                if (result[0].length !== 0) {
                    ifEmpty = false;
                } else { ifEmpty = true; }

                let block = 10;
                let block_article = Math.ceil(page_array.length / block);
                let block_arr = [];
                let block_start = Math.ceil(page / block);
                let block_first = 1;
                if (block_start != 1) {
                    block_first = 1 + (block * (block_start - 1));
                }
                let block_last = block_start * block
                if (block_last > total_page) {
                    block_last = total_page;
                }
                for (let i = block_first; i <= block_last; i++) {
                    block_arr.push(i);
                }
                let nextBlock = 1 + (block * (block_start))
                if (nextBlock > total_page) nextBlock = total_page;
                let prevBlock = ((block_start - 1) * block) - 9;
                if (prevBlock < 0) prevBlock = 1;

                res.render('../views/user/review_list.html',{
                    revList:result[0], 
                    totalRev:allRev[0], 
                    searchPages:page_array,
                    ifEmpty, srcCtg, keyword,
                    block_arr,
                    nextBlock,
                    prevBlock,
                    total_page,
                    page,
                    isLogin: req.session.isLogin
                });
            })
    } catch (e) { console.log(e) }
})

router.get('/write', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        //???????????? ???????????? usertype ??????
        let cookieString = req.headers.cookie;
        let signedinId = getCookie(cookieString)
        //???????????? ???
        if (signedinId == '' || signedinId == undefined || signedinId == null) {
            let selCurr = await Curriculum.findAll({
                attributes: ['id', 'subject'],
                where: { ifdeleted: null, }
            })
            res.render('../views/user/review_write.html', {
                selectedCurr: selCurr,
                signedinId,
                isLogin: req.session.isLogin
            })
            return;
        }
        //?????? ??? ?????????
        else {
            let getUserType = await User.findOne({
                attributes: ['id', 'usertype'],
                where: { userid: signedinId }
            })
            function modChk() {
                if (getUserType == undefined || getUserType.dataValues.usertype == undefined) {
                    return 0;
                } else if (getUserType.dataValues.usertype == 2) {
                    return 1;
                }
            }
            let ifMod = modChk();
            //???????????? ??????
            if (ifMod == 1) {
                let selCurr = await Curriculum.findAll({
                    attributes: ['id', 'subject'],
                    where: { ifdeleted: null }
                })
                res.render('../views/user/review_write.html', {
                    selectedCurr: selCurr,
                    ifMod,
                    signedinId,
                    isLogin: req.session.isLogin
                })
                return;
            } else {
                let selectedCurr = [];
                let userCurr = await User.findOne({
                    attributes: ['userclass'],
                    where: {
                        userid: signedinId
                    }
                })
                let userClass = userCurr.dataValues.userclass

                //???????????? ??????????????? ????????????x 
                if (userClass == null || userClass == undefined) {
                    let reviewAuth = {
                        msg: '????????? ????????? ??? ?????? ?????? ????????? ????????????.',
                        move: 'http://localhost:3000/review'
                    }
                    res.render('../views/user/review_write.html', { reviewAuth,  isLogin: req.session.isLogin })
                    return;
                } else { // ?????? ??? ???????????? ??????
                    let currArr = userClass.split(' ')
                
                    for (let i = 0; i < currArr.length; i++) {
                        if(currArr[i]!==''){
                            let [selCurr] = await Curriculum.findAll({
                                attributes: ['id', 'subject'],
                                where: {
                                    id: currArr[i],
                                    ifdeleted: null
                                }
                            })
                            selectedCurr.push(selCurr.dataValues)
                        }
                    }
                    res.render('../views/user/review_write.html', {
                        selectedCurr: selectedCurr,
                        signedinId,
                        isLogin: req.session.isLogin
                    })
                }
            }
        }
    } catch (e) { console.log(e) }
})

router.post('/write_success', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        let cookieString = req.headers.cookie;
        let signedinId = getCookie(cookieString)

        let { title, userid, content, curr_id } = req.body; // ????????? ???????????? ???

        function pwCreate(password) {
            let pw = crypto.createHmac('sha256', Buffer.from(process.env.salt))
                .update(password)
                .digest('base64')
                .replace('=', '')
                .replace('==', '')
            return pw;
        }
        //???????????? ?????? ????????? ?????? ?????????, ????????? ????????? ???????????? ??????
        let emptyChk = (req.body.postpw == undefined) ? '' : req.body.postpw
        let postpw = (emptyChk == '') ? null : pwCreate(emptyChk)

        let result = await Review.create({
            title, userid, content, curr_id, postpw
        })
        res.redirect('/review')
    } catch (e) { console.log(e) }
})

router.get('/view', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        let cookieString = req.headers.cookie;
        let signedinId = getCookie(cookieString)
        //????????? ?????? ??????

        let result = await Review.findOne({
            where: { id: req.query.id }
        });

        let hit = result.dataValues.hit
        hit += 1;
        let addHit = await Review.update({
            hit: hit
        }, { where: { id: req.query.id } })
        //view ????????? ????????? ??????

        function getDate(date) {
            var year = date.getFullYear()
            var month = (1 + date.getMonth());
            month = month >= 10 ? month : '0' + month;
            var day = date.getDate();
            day = day >= 10 ? day : '0' + day;
            return year + '-' + month + '-' + day;
        }
        let registeredDate = getDate(result.dataValues.date)

        getCurrId = (result.dataValues.curr_id)
        // ??????????????? curr_id ??????
        let getSub = await Curriculum.findOne({
            attributes: ['id', 'subject'],
            where: {
                id: getCurrId
            }
        })

        res.render('./user/review_view.html', {
            result,
            getSub: getSub.dataValues.subject,
            signedinId,
            isLogin: req.session.isLogin
        });
    } catch (e) { console.log(e) }
})

//???????????? ??????
router.get('/pwchk', async (req, res) => {
    if(req.session.isLogin ==undefined) req.session.isLogin = true;
    let cookieString = req.headers.cookie;
    let loginStatus = loginCheck(cookieString);

    async function getUserStat() { //????????????????????? ????????? 0 ??????
        if (loginStatus == undefined || loginStatus == null || loginStatus == '') {
            return 0;

        } else { //????????? ???????????? ?????????
            let result = await User.findOne({
                where: { userid: loginStatus }
            })
            return result.dataValues.usertype;
        }
    }

    let userStat = await getUserStat();
    if (userStat == 2) { //???????????? ??????
        res.redirect(`/user/modify?id=${req.query.id}&usercode=0`)
    } else { //?????? ??????
        let getPost = await Review.findOne({
            attributes: ['userid', 'postpw'],
            where: {
                id: req.query.id
            }
        })

        let getWriter = getPost.dataValues.userid;
        let getPw = getPost.dataValues.postpw;
        let postid = req.query.id;
        if (loginStatus == undefined && getPw == '') {
            console.log('???????????? ???????????? ??????')

            let reviewAuth = {
                result: false,
                msg: '???????????? ?????? ????????? ?????????.',
                move: 'http://localhost:3000/review/'
            }
            res.render('../views/user/review_modify.html', { reviewAuth, isLogin: req.session.isLogin });
            //????????? ??? ??????????
            return;
        } else if (loginStatus !== undefined && loginStatus !== getWriter) {
            console.log('????????? ?????? ?????? ?????? ??????')
            let reviewAuth = {
                result: false,
                msg: '?????????????????? ?????? ????????? ????????????.',
                move: 'http://localhost:3000/review/'
            }
            res.render('../views/user/review_modify.html', { reviewAuth, isLogin: req.session.isLogin });
            return;
        } else if (loginStatus == undefined && getPw !== '') {
            let forMod = true;
            console.log('???????????? ????????? ?????? ??????')
            res.render('../views/user/review_pwchk.html', { postid, forMod, isLogin: req.session.isLogin })
            return;
        } else {
            console.log('????????? ?????? ?????? ??????')
            res.redirect(`/review/modify?id=${req.query.id}&usercode=1`)
        }
    }
})

router.post('/pwchk', async (req, res) => {
    let userpw = req.body.userpw
    let token = createHash(userpw)
    let check = await Review.findOne({
        where: {
            postpw: token,
        }
    })

    if (check == null) {
        result = {
            result: false,
        }
        console.log('nope')
    } else {
        result = {
            result: true,
        }
        console.log('yes')
    }
    res.json(result)
})

router.get('/modify', async (req, res) => {
    try {
        if(req.session.isLogin ==undefined) req.session.isLogin = true;
        let { usercode } = req.query;
        if (usercode == '0') {
            // ??????????????? && ?????????
            let cookieString = req.headers.cookie;
            let signedinId = (getCookie(cookieString) == undefined) ? '' : getCookie(cookieString);
            let getUserType = await User.findOne({
                attributes: ['usertype'],
                where: { userid: signedinId }
            })

            function modChk() {
                if (getUserType == undefined || getUserType.dataValues.usertype == undefined) {
                    return 0;
                } else if (getUserType.dataValues.usertype == 2) {
                    return 1;
                }
            }
            let ifMod = modChk();
            let result = await Review.findOne({
                where: { id: req.query.id }
            })
            let getCurr = await Curriculum.findAll({
                attributes: ['id', 'subject'],
                where: { ifdeleted: null }
            })

            res.render('./user/review_modify.html', {
                loadReview: result,
                getCurr,
                boardid: req.query.id,
                ifMod,
                isLogin: req.session.isLogin
            })
            return;
        }
        else {
            let cookieString = req.headers.cookie;
            let signedinId = (getCookie(cookieString) == undefined) ? '' : getCookie(cookieString); 
            let userCurr = await User.findOne({
                attributes: ['userclass'],
                where: {
                    userid: signedinId
                }
            })
            let userClass = userCurr.dataValues.userclass;

            //???????????? ??????????????? ????????????x
            if (userClass == null || userClass == undefined) {
                let reviewAuth = {
                    msg: '????????? ????????? ??? ?????? ?????? ????????? ????????????.',
                    move: 'http://localhost:3000/review'
                }
                res.render('../views/review_modify.html', { reviewAuth, isLogin: req.session.isLogin })
                return;
            } else { // ?????? ??? ???????????? ??????
                let selectedCurr = [];
                let convertedCurr = [];
                let currArr = userClass.split(' ')
                for (let i = 0; i < currArr.length; i++) {
                    convertedCurr.push(parseInt(currArr[i]))
                }
                for (let i = 0; i < currArr.length; i++) {
                    if(currArr[i]!==''){
                        let selCurr = await Curriculum.findAll({
                            attributes: ['id', 'subject'],
                            where: {
                                id: convertedCurr[i],
                                ifdeleted: null,
                            }
                        })
                        selectedCurr.push(selCurr[0])
                    }
                }
                let result = await Review.findOne({
                    where: { id: req.query.id }
                })
                res.render('../views/user/review_modify.html', {
                    loadReview: result,
                    getCurr: selectedCurr,
                    signedinId,
                    boardid: req.query.id,
                    usercode,
                    isLogin: req.session.isLogin
                })
            }
            return;
        }
    } catch (e) { console.log(e) }
})

router.post('/modify_success', async (req, res) => {
    try {
        let { title, userid, curr_id, content, boardid } = req.body;
        let postpw = (req.body.postpw == undefined || req.body.postpw == null || req.body.postpw == '') ? null : req.body.postpw;
        console.log(postpw)

        function pwCreate(password) {
            let pw = crypto.createHmac('sha256', Buffer.from(process.env.salt))
                .update(password)
                .digest('base64')
                .replace('=', '')
                .replace('==', '')
            return pw;
        }
        console.log(pwCreate(postpw))
        //???????????? ?????? ????????? ?????? ?????????, ????????? ????????? ???????????? ??????
        let emptyChk = (req.body.postpw == undefined) ? '' : req.body.postpw
        let postpw2 = (emptyChk == '') ? null : pwCreate(emptyChk)

        let result = await Review.update({ 
            title, content, userid, curr_id, postpw:postpw2
        },
            {
                where: {
                    id: boardid,
                }
            })
        res.redirect(`/review/view/?id=${boardid}`)
    } catch (e) { console.log(e) }
})

async function authDel(req, res, next) {
    if(req.session.isLogin ==undefined) req.session.isLogin = true;
    let cookieString = req.headers.cookie;
    let getWriter = await Review.findOne({
        where: {
            id: req.query.id
        }
    })
    let writer = getWriter.dataValues.userid;
    let signedinId = (getCookie(cookieString) == undefined) ? '' : getCookie(cookieString);
    let getUserType = await User.findOne({
        attributes: ['usertype'],
        where: { userid: signedinId }
    })

    function userChk() {
        if (getUserType == undefined || getUserType.dataValues.usertype == undefined) {
            return 0;
        } else if (getUserType.dataValues.usertype == 1) {
            return 1;
        } else if (getUserType.dataValues.usertype == 2) {
            return 2;
        }
    }

    let ifMod = userChk();
    let getPw = getWriter.dataValues.postpw;
    if (ifMod == 0 && req.query.submit == undefined && getPw !== undefined) {
        //?????????
        console.log('?????????')
        let postid = req.query.id
        let forMod = false;
        res.render('../views/user/review_pwchk.html', { postid, forMod, isLogin: req.session.isLogin })
        return 0;
    } else if (ifMod == 0 && getPw == '') {
        console.log('???????????? ???????????? ??????')

        let reviewAuth = {
            result: false,
            msg: '???????????? ?????? ????????? ?????????.',
            move: 'http://localhost:3000/review/'
        }
        res.render('../views/user/review_modify.html', { reviewAuth, isLogin: req.session.isLogin });
        return 0;
    } else if (ifMod == 0 && req.query.submit == 'true' && getPw !== undefined) {
        console.log('?????????????????????')
        next();

    } else if (ifMod == 1) {
        console.log('????????????1')
        console.log(signedinId, '?????????????????????')
        console.log(writer, '?????????')
        if (signedinId !== undefined && signedinId !== writer) {

            let reviewAuth = {
                result: false,
                msg: '??????????????? ????????? ??? ????????????.',
                move: 'http://localhost:3000/review/'
            }
            res.render('../views/logincheck.html', { reviewAuth, isLogin: req.session.isLogin })
            return;
        } else {
            console.log('??????')
            next()
        }
    } else if (ifMod == 2) {
        console.log('????????????2')
        next();
    }
}

router.get('/delete', authDel, async (req, res) => {
    try {
        console.log('here here')

        let { id } = req.query;
        console.log(id)
        let result = await Review.destroy({
            where: { id: id }
        })
        res.redirect('/review')
    } catch (e) { console.log(e) }
})

module.exports = router;
