(function() {
    'use strict';
    var redis = require('redis');
    var sub = redis.createClient();
    var pub = redis.createClient();
    sub.subscribe('pubsubChannel');

    module.exports = function(io) {
        

        return {
            sub: sub,
            publish: function( data ) { pub.publish( 'pubsubChannel', data ) },
            
        };
    }    
})();
