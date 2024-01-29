require('dotenv').config()
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

const User = require('../models/User')

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post('/register', async(req, res) => {
    const {username, password} = req.body
    //Simple validation
    if (!username || !password) 
    return res.status(400).json({success: false, message: 'Missing username or password'})

    try {
        const user = await User.findOne({username: username, password: password})
        if (user)
        return res.status(422).json({success: true, message: 'Username already in use'})

        const hashedPassword = await argon2.hash(password)
        const newUser = new User({
            username: username,
            password: hashedPassword
        })
        await newUser.save()
        const accessToken = jwt.sign({userId: newUser._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            'success': true,
            'message': 'User saved successfully',
            accessToken
        })
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

router.post('/login', async(req, res) => {
    const {username, password} = req.body
    //Simple validation
    if (!username || !password) 
    return res.status(422).json({success: false, message: 'Missing username or password'})

    try {
        const user = await User.findOne({username: username})
        if (!user)
        return res.status(404).json({success: false, message: 'User not found'})

        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid) {
           return res.status(404).json({success: false, message: 'User not found'})
        }
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            'success': true,
            'message': 'User login successfully',
            accessToken
        })
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

router.get('/', verifyToken, async(req, res) => {
    try {
        const user = await User.findOne({_id: req.userId})
        res.json({
            'success': true,
            'message': 'User login successfully',
            user:user
        })
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

module.exports = router