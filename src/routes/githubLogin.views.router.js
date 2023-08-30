import { Router } from "express";
const router = Router()

router.get('/login', (req, res) => {
    res.render('githubLogin')
})

router.get('/', (req, res) => {
    res.redirect('users')
})

router.get('/error', (req, res) => {
    res.render('error', { error: "no se pudo autenticar"})
})

export default router