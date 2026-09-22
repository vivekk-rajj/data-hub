# data-hub

The Data Hub - Express REST API for Sprint 10 Track B (MongoDB Atlas + Mongoose)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your MongoDB Atlas connection string (`MONGO_URI`) and optional `PORT`.
4. Start the server:
   ```bash
   npm start
   ```

## MongoDB Atlas Configuration

1. Create an M0 Sandbox cluster in MongoDB Atlas.
2. Create a database user with read/write permissions.
3. In **Network Access**, allow your current IP (or `0.0.0.0/0` for testing).
4. Copy the SRV connection string and paste it into `.env` as `MONGO_URI`.

> Never commit credentials. `.env` is ignored by git.

## API Endpoints

- `POST /posts` - create a post in MongoDB
- `GET /posts` - fetch all posts (author populated)
- `GET /posts/:id` - fetch one post by id (author populated)
- `PUT /posts/:id` - update a post
- `DELETE /posts/:id` - delete a post
- `GET /posts/top/recent` - fetch top 3 newest posts
- `POST /login` - mock login endpoint

## Postman QA Checklist

1. `POST /posts` with valid `title`, `content`, and optional `authorId` returns `201`.
2. `POST /posts` missing required fields returns `400`.
3. `GET /posts` returns persisted data from Atlas.
4. `GET /posts/:id` returns `404` for missing id and `400` for invalid id format.
5. `PUT /posts/:id` updates document and returns `404` when post does not exist.
6. `DELETE /posts/:id` removes document and returns `404` when missing.
7. `GET /posts/top/recent` returns at most 3 records sorted by `createdAt` descending.

## Render Deployment (Environment Variables)

When deploying on Render:

1. Create a new Web Service connected to this repository.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. In Render **Environment** settings, add:
   - `MONGO_URI` = your Atlas connection string
   - `PORT` = `10000` (or leave unset to use Render default)
