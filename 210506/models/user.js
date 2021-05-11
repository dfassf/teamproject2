const Sequelize=require('sequelize');
const moment=require('moment');



//대문자 Sequelize = class
module.exports=class User extends Sequelize.Model{
    static init(sequelize){ //자식놈 init
        return super.init({ //부모의 init
            userid:{
                type:Sequelize.STRING(20),
                allowNull:false,// notnull과 같음
                unique: true // 유니크하게 만들거다~중복불가. primary는 숫자만 가능, auto-increment를 쓰기때문
            },
            userpw:{
                type:Sequelize.STRING(40),
                allowNull:false,
            },
            username:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            gender:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
            },
            userimage:{
                type:Sequelize.STRING(100),
                allowNull:true,
            },
            userdt:{
                type:Sequelize.DATEONLY,
                allowNull:false,
                defaultValue:Sequelize.NOW,
                get:function(){
                    return moment(this.getDataValue('userdt')).format('YYYY-MM-DD')
                } //npm install moment
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            paranoid:false,
            modelName:'User',
            tableName:'usersum', // 원래컴 가면 꼭
            charset:'utf8',
            collate:'utf8_general_ci'
        })
    }
}