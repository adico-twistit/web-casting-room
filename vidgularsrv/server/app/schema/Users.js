'use strict';

exports = module.exports = function(app, mongoose) {
  var bcrypt = require('bcryptjs');

  var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    firstName: String,
    lastName: String,
    picture: String,
    role: {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    },
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    bio: { type: String, default: '' },
    facebook: String,
    foursquare: String,
    google: String,
    github: String,
    instagram: String,
    linkedin: String,
    live: String,
    yahoo: String,
    twitter: String,
    twitch: String
  });

  UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
      });
    });
  });

  UserSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
      done(err, isMatch);
    });
  };

  UserSchema.methods.canPlayRoleOf = function(role) {
    if (role === "admin" && this.roles.admin) {
      return true;
    }

    if (role === "account" && this.roles.account) {
      return true;
    }

    return false;
  };
  UserSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('account')) {
      returnUrl = '/account/';
    }

    if (this.canPlayRoleOf('admin')) {
      returnUrl = '/admin/';
    }

    return returnUrl;
  };

  UserSchema.index({ username: 1 }, { unique: true });
  UserSchema.index({ email: 1 }, { unique: true });
  UserSchema.index({ timeCreated: 1 });
  UserSchema.index({ 'twitter': 1 });
  UserSchema.index({ 'github': 1 });
  UserSchema.index({ 'facebook': 1 });
  UserSchema.index({ 'google': 1 });
  UserSchema.set('autoIndex', (app.get('env') === 'development'));
  
  app.db.model('User', UserSchema);
};  