# Videoooozzz Backend Documentation

## Overview
Videoooozzz is a video-sharing platform backend built with Node.js, Express, and MongoDB. The application provides features similar to YouTube, including video uploads, user management, subscriptions, likes, comments, and playlists.

## Database Schema

### Users
- Primary user entity storing account information
```javascript
{
  id: string (Primary Key),
  username: string,
  email: string,
  fullName: string,
  avatar: string,
  coverImage: string,
  watchHistory: [Video ObjectIds],
  password: string (hashed),
  refreshToken: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Videos
- Stores video content and metadata
```javascript
{
  id: string (Primary Key),
  owner: ObjectId (ref: Users),
  videoFile: string,
  thumbnail: string,
  title: string,
  description: string,
  duration: number,
  views: number,
  isPublished: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions
- Manages channel subscriptions between users
```javascript
{
  id: string (Primary Key),
  subscriber: ObjectId (ref: Users),
  channel: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Likes
- Handles likes for videos, comments, and tweets
```javascript
{
  id: string (Primary Key),
  video: ObjectId (ref: Videos),
  comment: ObjectId (ref: Comments),
  tweet: ObjectId (ref: Tweets),
  likedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Comments
- Stores user comments on videos
```javascript
{
  id: string (Primary Key),
  video: ObjectId (ref: Videos),
  owner: ObjectId (ref: Users),
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Playlists
- Manages user-created video playlists
```javascript
{
  id: string (Primary Key),
  owner: ObjectId (ref: Users),
  videos: [ObjectId] (ref: Videos),
  name: string,
  description: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Tweets
- Handles user posts/updates
```javascript
{
  id: string (Primary Key),
  owner: ObjectId (ref: Users),
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Authentication Routes (`/api/users`)
- **POST** `/register` - Register new user (supports avatar and cover image upload)
- **POST** `/login` - User login
- **GET** `/logout` - User logout (requires authentication)
- **GET** `/refresh-token` - Refresh access token
- **POST** `/change-password` - Change user password (requires authentication)
- **GET** `/current-user` - Get current user details (requires authentication)
- **PATCH** `/update-account` - Update account details (requires authentication)
- **PATCH** `/avatar` - Update avatar image (requires authentication)
- **PATCH** `/cover-image` - Update cover image (requires authentication)
- **GET** `/c/:username` - Get channel profile
- **GET** `/history` - Get watch history

### Video Routes (`/api/videos`)
All routes require authentication
- **GET** `/` - Get all videos
- **POST** `/` - Upload new video (supports video file and thumbnail upload)
- **GET** `/:videoId` - Get video by ID
- **DELETE** `/:videoId` - Delete video
- **PATCH** `/:videoId` - Update video details
- **PATCH** `/toggle/publish/:videoId` - Toggle video publish status

### Comment Routes (`/api/comments`)
All routes require authentication
- **GET** `/:videoId` - Get video comments
- **POST** `/:videoId` - Add comment to video
- **DELETE** `/c/:commentId` - Delete comment
- **PATCH** `/c/:commentId` - Update comment

### Like Routes (`/api/likes`)
All routes require authentication
- **POST** `/toggle/v/:videoId` - Toggle video like
- **POST** `/toggle/c/:commentId` - Toggle comment like
- **POST** `/toggle/t/:tweetId` - Toggle tweet like
- **GET** `/videos` - Get liked videos

### Playlist Routes (`/api/playlists`)
All routes require authentication
- **POST** `/` - Create playlist
- **GET** `/:playlistId` - Get playlist by ID
- **PATCH** `/:playlistId` - Update playlist
- **DELETE** `/:playlistId` - Delete playlist
- **PATCH** `/add/:videoId/:playlistId` - Add video to playlist
- **PATCH** `/remove/:videoId/:playlistId` - Remove video from playlist
- **GET** `/user/:userId` - Get user playlists

### Subscription Routes (`/api/subscriptions`)
All routes require authentication
- **GET** `/c/:channelId` - Get subscribed channels
- **POST** `/c/:channelId` - Toggle subscription
- **GET** `/u/:subscriberId` - Get channel subscribers

### Tweet Routes (`/api/tweets`)
All routes require authentication
- **POST** `/` - Create tweet
- **GET** `/user/:userId` - Get user tweets
- **PATCH** `/:tweetId` - Update tweet
- **DELETE** `/:tweetId` - Delete tweet

### Dashboard Routes (`/api/dashboard`)
All routes require authentication
- **GET** `/stats` - Get channel statistics
- **GET** `/videos` - Get channel videos

### Health Check Route (`/api/healthcheck`)
- **GET** `/` - Check API health status

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer
- **File Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Additional Features**:
  - CORS support
  - Cookie parsing
  - Aggregate pagination for MongoDB
  - Environment variable support
  - File streaming capabilities

## Development Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables

3. Run development server:
```bash
npm run dev
```

The server will start with nodemon for automatic reloading during development.

## Security Features
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes using middleware
- Refresh token mechanism
- File upload validation
- CORS protection

## File Upload
- Supports multiple file uploads for:
  - Video files
  - Thumbnails
  - Avatar images
  - Cover images
- Uses Multer for handling multipart/form-data
- Cloudinary integration for file storage
- Streaming support for efficient file handling

## Middleware
- `auth.middleware.js`: JWT verification
- `multer.middleware.js`: File upload handling

This backend provides a robust foundation for a video-sharing platform with comprehensive user management, content handling, and social features.