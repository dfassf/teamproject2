require('dotenv').config()
const crypto = require('crypto')

module.exports = (req, res, next) => {
    let { AccessToken } = req.cookies;
    if (AccessToken == undefined) {
        console.log('로그아웃 상태')
        next();
    } else{
        console.log('로그인 상태')
    let [header, payload, sign] = AccessToken.split('.');
    let signature = getSignature(header, payload)

    if (sign != signature) {
        console.log('invalid token');
    }
    let { userid, exp } = JSON.parse(Buffer.from(payload, 'base64').toString())
    let nexttime = new Date().getTime();
    console.log(nexttime)
    if (nexttime > exp) {
        console.log('token has expired');
        res.clearCookie('AccessToken');
    } else{ console.log('token still valid')}
    req.userid = userid;

    next();
    }
}

function getSignature(header,payload){
    const signature = crypto.createHmac('sha256',Buffer.from(process.env.salt))
                                                       .update(header+"."+payload)
                                                       .digest('base64')
                                                       .replace('=','')
                                                       .replace('==','')
    return signature;
}