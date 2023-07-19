// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

// Create an express app
const app = express();
// Use body parser middleware
app.use(bodyParser.json());
// Use cors middleware
app.use(cors());

// Store comments
const commentsByPostId = {};

// Retrieve comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create comments
app.post('/posts/:id/comments', async (req, res) => {
    // Generate random id
    const commentId = randomBytes(4).toString('hex');
    // Get content from request body
    const { content } = req.body;
    // Get comments for post id
    const comments = commentsByPostId[req.params.id] || [];
    // Add new comment to comments
    comments.push({ id: commentId, content, status: 'pending' });
    // Update comments
    commentsByPostId[req.params.id] = comments;
    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: { id: commentId, content, postId: req.params.id, status: 'pending' }
    });
    // Send response
    res.status(201).send(comments);
});

// Receive events
app.post('/events', async (req, res) => {
    // Get event type and data
    const { type, data } = req.body;
    // Check if event type is CommentModerated
    if (type === 'CommentModerated') {
        // Get comments for post id
        const comments = commentsByPostId[data.postId];
        // Get comment for comment id
        const comment = comments.find(comment => comment.id === data.id);
        // Update comment status
        comment.status = data.status;
        // Emit event to event bus
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: { id: data.id, content: data.content, postId: data.postId, status: data.status }
        });
    }
    // Send response
    res.send({});
});

//