var db = require("./db");

module.exports = User;

function User(params) {
    for (var param in params) {
        if (param != '__proto__')
            this[param] = params[param];
    }
    ;
};

User.prototype.save = function (callback) {
    var user = this;
    db.open(function (err, db) {
        if (err) return callback(err);
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //将用户数据插入 users 集合
            collection.insert(user, {safe: true}, function (err, user) {
                db.close();//关闭数据库
                callback(null,user.ops[0]);//成功！err 为 null，并返回存储后的文档
            });
        });
    });
};

//读取用户信息
User.prototype.get = function (name, callback) {
//打开数据库
    db.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();//关闭数据库
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                db.close();//关闭数据库
                if (user) {
                    return callback(null, user);//成功！返回查询的用户信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};