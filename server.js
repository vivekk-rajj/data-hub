const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const Post = require('./models/Post');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const postsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/posts', postsLimiter);

app.use((req, res, next) => {
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  console.log(`[${req.method}] ${req.originalUrl} - ${timestamp}`);
  next();
});

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const buildPostUpdate = (body) => {
  const update = {};

  if (typeof body.title !== 'undefined') update.title = body.title;
  if (typeof body.content !== 'undefined') update.content = body.content;
  if (typeof body.authorId !== 'undefined') update.authorId = body.authorId;

  return update;
};

app.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const posts = await Post.find().populate('authorId');

    return res.status(200).json({
      message: 'Posts retrieved successfully',
      count: posts.length,
      data: posts
    });
  })
);

app.get(
  '/posts/top/recent',
  asyncHandler(async (req, res) => {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('authorId');

    return res.status(200).json({
      message: 'Recent posts retrieved successfully',
      count: posts.length,
      data: posts
    });
  })
);

app.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id).populate('authorId');

    if (!post) {
      return res.status(404).json({ message: `Post with id ${id} not found` });
    }

    return res.status(200).json({
      message: 'Post retrieved successfully',
      data: post
    });
  })
);

app.post(
  '/posts',
  asyncHandler(async (req, res) => {
    const newPost = await Post.create({
      title: req.body.title,
      content: req.body.content,
      authorId: req.body.authorId
    });

    const createdPost = await Post.findById(newPost._id).populate('authorId');

    return res.status(201).json({
      message: 'Post created successfully',
      data: createdPost
    });
  })
);

app.put(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatePayload = buildPostUpdate(req.body);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        message: 'At least one of title, content, or authorId is required for update'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true
    }).populate('authorId');

    if (!updatedPost) {
      return res.status(404).json({ message: `Post with id ${id} not found` });
    }

    return res.status(200).json({
      message: 'Post updated successfully',
      data: updatedPost
    });
  })
);

app.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: `Post with id ${id} not found` });
    }

    return res.status(200).json({
      message: 'Post deleted successfully',
      deletedId: id
    });
  })
);

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  const mockToken = `mock-jwt-${username}-${password}-token-${Date.now()}`;

  return res.status(200).json({
    message: 'Login successful',
    token: mockToken
  });
});

app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      error: error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid post id format'
    });
  }

  console.error('Unexpected server error:', error);

  return res.status(500).json({
    message: 'Internal server error'
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully');

    app.listen(PORT, () => {
      console.log(`The Data Hub server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
