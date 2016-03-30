var db = require("./db");

module.exports = Account;

function Account(params) {
    for (var param in params) {
        if (param != '__proto__')
            this[param] = params[param];
    }
    ;
};

Account.prototype.save = function (callback) {
    var account = this;
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    account.createtime=time;
    db.open(function (err, db) {
        if (err) return callback(err);
        db.collection('accounts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //将用户数据插入 accounts 集合
            collection.insert(account, {safe: true}, function (err, account) {
                db.close();//关闭数据库
                callback(null,account.ops[0]);//成功！err 为 null，并返回存储后的文档
            });
        });
    });
};

//读取用户信息
Account.prototype.get = function (name, callback) {
//打开数据库
    db.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 accounts 集合
        db.collection('accounts', function (err, collection) {
            if (err) {
                db.close();//关闭数据库
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, account) {
                db.close();//关闭数据库
                if (account) {
                    return callback(null, account);//成功！返回查询的用户信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};