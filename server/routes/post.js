require('dotenv').config()
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Post = require('../models/Post')
const User = require('../models/User')


// @route POST api/post/
// @desc Register user
// @access Public
router.get('/', verifyToken , async(req, res) => {
    try {
        const posts = await Post.find({user:req.userId}).populate('user', ['username'])
        res.json({success:true, posts})
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

// @route POST api/post/
// @desc Register user
// @access Public
router.post('/', verifyToken , async(req, res) => {
    const {title, description, url, status} = req.body
    //Simple validation
    if (!title) 
    return res.status(400).json({success: false, message: 'Title is required'})

    try {
        const user = await User.findOne({_id: req.userId})
        const newPost = new Post
        ({
            title, description, url: (url.startsWith('https://')) ? url : `https://${url}`, 
            status: status || 'To Learn', 
            user: req.userId
        })
        await newPost.save()
        res.json({success: true, message: 'Success', post: newPost, user: user})
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

// @route PUT api/post/
// @desc Register user
// @access Public
router.put('/:id', verifyToken , async(req, res) => {
    const {title, description, url, status} = req.body
    if (!title) 
    return res.status(400).json({success: false, message: 'Title is required'})

    try {
        const user = await User.findOne({_id: req.userId})
        let updatedPost = {
            title,
            description: description || '',
            url: (url.startsWith('https://')) ? url : `https://${url}`,
            status: status || 'To Learn', 
        }
        const postUpdateCondition = {_id: req.params.id, user: req.userId}
        updatedPost = await Post.findOneAndUpdate(postUpdateCondition, updatedPost, {new: true})
        if (!updatedPost)
        return res.status(401).json({success: false, message: 'UnAuthorized'})
        res.json({success: true, message: 'Success', post: updatedPost})
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

// @route DELETE api/post/
// @desc Register user
// @access Public
router.delete('/:id', verifyToken , async(req, res) => {
    try {
        const postDeleteCondition = {_id: req.params.id, user: req.userId}
        const deletedPost = await Post.findOneAndDelete(postDeleteCondition)
        if (!deletedPost)
        return res.status(401).json({success: false, message: 'UnAuthorized'})
        res.json({success: true, message: 'Delete Success'})
    }catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"})
    }
})

module.exports = router