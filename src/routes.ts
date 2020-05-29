import express from 'express';
import passport from 'passport';
import Validation from './validation';
import * as Controllers from './controllers';

const routes = express.Router();

routes.post(
  '/followtag',
  Validation.validateSession,
  Validation.followPlayer,
  Controllers.Player.followPlayer,
);

routes.post(
  '/followid/:tagId',
  Validation.validateSession,
  Validation.playerInfo,
  Controllers.Player.followPlayerId,
);

routes.post(
  '/unfollowid/:tagId',
  Validation.validateSession,
  Validation.playerInfo,
  Controllers.Player.unfollowPlayerId,
);

routes.get(
  '/isfollowing/:tagId',
  Validation.validateSession,
  Validation.playerInfo,
  Controllers.Player.isFollowing,
);

routes.get(
  '/info/:tagId',
  Validation.validateSession,
  Validation.playerInfo,
  Controllers.Player.getStats,
);

routes.get(
  '/following',
  Validation.validateSession,
  Controllers.Player.getFollowing,
);

routes.get(
  '/feed/global',
  Validation.globalFeed,
  Controllers.Player.getGlobalFeed,
);

routes.get(
  '/feed/local',
  Validation.validateSession,
  Validation.localFeed,
  Controllers.Player.getLocalFeed,
);

routes.get(
  '/dialogflow',
  Validation.validateSession,
  Validation.sendMessageBot,
  Controllers.DialogFlow.sendMessage,
);

routes.get('/auth/bnet', passport.authenticate('bnet'));

routes.get(
  '/auth/bnet/callback',
  passport.authenticate('bnet', { failureRedirect: '/auth/bnet' }),
  Controllers.Session.loginWithBnet,
);

export default routes;
