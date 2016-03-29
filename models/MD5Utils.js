/**
 * Created by tangaoyu on 2016/3/29.
 */
var crypto = require('crypto');

exports.createMD5ByParam = function(msg){
    if(msg){
        var md5 = crypto.createHash('md5');
        return md5.update(msg).digest('hex');
    }
    return;
}
