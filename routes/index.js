/*
 * GET home page
 */
var User = require('../models/user.js');
var MD5Utils = require('../models/MD5Utils');
exports.index = function (req, res) {
    res.render('index', {user: req.session.user, title: "记账系统"});
};
exports.reg = function(req,res){
    res.render('login',{action:'reg'});
};
exports.doReg = function (req, res) {
    var user = new User(req.body.user);
    if (user.password != user.password_rep) {
        req.flash('error', '确认密码不一致，请重新填写');
        return res.redirect('/reg');
    }
    user.password = MD5Utils.createMD5ByParam(user.password);
    user.get(user.name, function (err, user1) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/reg');
        }
        if (user1) {
            req.flash('error', "用户名已存在");
            return res.redirect('/reg');
        }
        //保存用户信息
        user.save(function (err, user) {
            if (err) {
                req.flash('error', err.message)
                return res.redirect('/reg');
            }
            req.session.user = user;//用户信息存入 session
            req.flash('success', '注册成功!');
            res.redirect('/');//注册成功后返回主页
        })
    });
};
exports.login = function (req, res) {
    res.render("login",{action:'login'});
};
exports.doLogin = function (req, res) {
    var user = new User(req.body.user);
    var password = MD5Utils.createMD5ByParam(user.password);
    user.get(user.name, function (err, user) {
            if (err) {
                return res.render("login", {error: err.message});
            }
            if (!user) {
                req.flash('error', '用户名不存在')
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '账号或密码错误，请重新输入')
                return res.redirect('/login');
            }
            //用户名账号都匹配则将用户信息存入session中
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');
        }
    );
};
exports.startAccount = function (req, res) {
    res.render("keepAccount");
};
exports.accountList = function (req, res) {
};
exports.logout = function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
};