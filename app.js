/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , settings = require("./settings");
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');

var app = express();
var server  =  http.createServer(app);
var io = require('socket.io')(server);

// all environments
console.log(__dirname);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(flash());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db,
        url: 'mongodb://localhost:27017'
    })
}));
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    var error = req.flash('error');
    res.locals.error = error.length?error:null;
    var success = req.flash('success');
    res.locals.success = success.length?success:null;
    res.locals.session = req.session;
    next();
});

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
//url拦截
app.all("*",function(req,res,next){
    var url = req.originalUrl
    if(url=='/'||url=='/reg')
        return next();
    if(url!="/login"&&!req.session.user){
            req.flash('error', "你尚未登录请先进行登录");
            return res.redirect('/login');
    }
    next();
});
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/socketio', function(req,res){
    res.render('socket');
});
app.get('/startAccount',routes.startAccount);
app.post('/accountList', routes.accountList);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);
app.post('/accountSave',routes.accountSave);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
