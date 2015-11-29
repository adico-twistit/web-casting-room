var config = {
  APP_NAME: 'WebcastApp',

  REDIS_URL: getEnv('REDISURL') || 'localhost',
  REDIS_PORT: getEnv('PORT') || '6379',
  PUBSUB_CHANNEL: getEnv('PUBSUB_CHANNEL') || 'pubsubChannel',
  COOKIE_SECRET: process.env.COOKIE_SECRET || '46d6cc16b2fa445595e747a3349cb5e5',
  TOKEN_SECRET: process.env.TOKEN_SECRET || '46d6cc16b2fa445595e747a3349cb6e4',
  
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/vidgular',
  MONGO_CONN: 'wc connection',
  

  // OAuth 2.0
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || 'bd6def32e2bb1f786b4c4cb9b5c757a0',
  FOURSQUARE_SECRET: process.env.FOURSQUARE_SECRET || '',
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || '',
  GITHUB_SECRET: process.env.GITHUB_SECRET || '',
  INSTAGRAM_SECRET: process.env.INSTAGRAM_SECRET || '46d6cc16b2fa445595e747a3349cb6e4',

  LINKEDIN_SECRET: process.env.LINKEDIN_SECRET || '',
  TWITCH_SECRET: process.env.TWITCH_SECRET || '',
  WINDOWS_LIVE_SECRET: process.env.WINDOWS_LIVE_SECRET || '',
  YAHOO_SECRET: process.env.YAHOO_SECRET || '',

  // OAuth 1.0
  TWITTER_KEY: process.env.TWITTER_KEY || '',
  TWITTER_SECRET: process.env.TWITTER_SECRET || ''

};

function getEnv(variable){
  return process.env[variable];
};

module.exports = config;