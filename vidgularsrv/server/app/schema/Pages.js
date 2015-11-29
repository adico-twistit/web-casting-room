'use strict';

exports = module.exports = function(app, mongoose) {

    var PagesSchema = new mongoose.Schema({
        name: String,
        url: String
    });

    app.db.model('Pages', PagesSchema);
};