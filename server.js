const express = require('express');
const app = express();
const PORT = 5000;

let blogPosts = [];

app.use(express.json());

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

app.get('/posts', (req, res) => {
  return res.status(200).json({
    message: 'Posts retrieved successfully',
    count: blogPosts.length,
    data: blogPosts
  });
});

app.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  const post = blogPosts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).json({ message: `Post with id ${id} not found` });
  }

  return res.status(200).json({
    message: 'Post retrieved successfully',
    data: post
  });
});

app.post('/posts', (req, res) => {
  const newPost = {
    id: req.body.id || Date.now().toString(),
    title: req.body.title || 'Untitled Post',
    content: req.body.content || '',
    author: req.body.author || 'Anonymous',
    createdAt: new Date().toISOString()
  };

  blogPosts.push(newPost);

  return res.status(201).json({
    message: 'Post created successfully',
    data: newPost
  });
});

app.put('/posts/:id', (req, res) => {
  const { id } = req.params;
  const index = blogPosts.findIndex((post) => post.id === id);

  if (index === -1) {
    return res.status(404).json({ message: `Post with id ${id} not found` });
  }

  blogPosts[index] = {
    ...blogPosts[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  return res.status(200).json({
    message: 'Post updated successfully',
    data: blogPosts[index]
  });
});

app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = blogPosts.length;

  blogPosts = blogPosts.filter((post) => post.id !== id);

  if (blogPosts.length === initialLength) {
    return res.status(404).json({ message: `Post with id ${id} not found` });
  }

  return res.status(200).json({
    message: 'Post deleted successfully',
    deletedId: id
  });
});

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

app.listen(PORT, () => {
  console.log(`The Data Hub server is running on http://localhost:${PORT}`);
});
