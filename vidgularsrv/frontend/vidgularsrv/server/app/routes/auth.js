var router = require('express').Router();

/*
  Injected Functions Aliases
*/
var ensureAuthenticated = require('../core/auth.common').ensureAuthenticated;
/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
router.post('/login', require('../ctrls/controller.auth').postLogin );
/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
router.post('/signup', require('../ctrls/controller.auth').postSignup);
/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
router.post('/google', require('../ctrls/controller.auth').postGoogle);
/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */
router.post('/github', require('../ctrls/controller.auth').postGithub);
/*
|--------------------------------------------------------------------------
| Login with Instagram
|--------------------------------------------------------------------------
*/
router.post('/instagram', require('../ctrls/controller.auth').postInstagram);
/*
 |--------------------------------------------------------------------------
 | Login with LinkedIn
 |--------------------------------------------------------------------------
 */
router.post('/linkedin', require('../ctrls/controller.auth').postLinkedin);
/*
 |--------------------------------------------------------------------------
 | Login with Windows Live
 |--------------------------------------------------------------------------
 */
router.post('/live', require('../ctrls/controller.auth').postLive);
/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
router.post('/facebook', require('../ctrls/controller.auth').postFacebook);
/*
 |--------------------------------------------------------------------------
 | Login with Yahoo
 |--------------------------------------------------------------------------
 */
router.post('/yahoo', require('../ctrls/controller.auth').postYahoo);
/*
 |--------------------------------------------------------------------------
 | Login with Twitter
 |--------------------------------------------------------------------------
 */
router.post('/twitter', require('../ctrls/controller.auth').postTwitter);
/*
 |--------------------------------------------------------------------------
 | Login with Foursquare
 |--------------------------------------------------------------------------
 */
router.post('/foursquare', require('../ctrls/controller.auth').postFoursquare);
/*
 |--------------------------------------------------------------------------
 | Login with Twitch
 |--------------------------------------------------------------------------
 */
router.post('/twitch', require('../ctrls/controller.auth').postTwitch);
/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
router.post('/unlink', ensureAuthenticated, require('../ctrls/controller.auth').postUnlink);

module.exports = router;