import { Router } from 'express';
import {authorization} from '.././utils.js';
import passport from 'passport';
import { passportCall } from '.././utils.js';
import { current, githubCallback, githubLogin } from '../controllers/sessions.controller.js';

const router = Router();

// AUTENTICACION GITHUB

router.get('/github', passport.authenticate('github', {scope: ['user:email']}), githubLogin )
router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), githubCallback )
router.get('/current', passportCall('jwt'), authorization('user'), current)

export default router;