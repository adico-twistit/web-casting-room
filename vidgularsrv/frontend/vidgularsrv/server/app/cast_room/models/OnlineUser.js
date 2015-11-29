(function online_user_model() {
    'use strict';

    module.exports = function OnlineUser(data, socketid) {
        this.id = data.id || 0;
        this.area = data.area || '';
        this.socketid = socketid;
        this.email = data.email || '';
        this.raiseHand = data.raiseHand || 0;
        this.applause = data.applause || 0;
        this.age = data.age || -1;
    };
}());
