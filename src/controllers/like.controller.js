import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    try {
        // Check if the like already exists
        const likedVideo = await Like.findOne({ video: videoId, likedBy: req.user._id });

        if (likedVideo) {
            await Like.deleteOne({ video: videoId, likedBy: req.user._id });

            return res.status(201).json(
                new ApiResponse(201, "like deleted successfully")
            );
        } else {
            const newLike = await Like.create({
                video: videoId,
                likedBy: req.user._id,
            });

            return res.status(201).json(
                new ApiResponse(201, newLike, "liked")
            );
        }
    } catch (error) {
        throw new ApiError(500, "Error toggling like on video");
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    try {
        const likedComment = await Like.findOne({ comment: commentId, likedBy: req.user._id });

        if (likedComment) {
            await Like.deleteOne({ comment: commentId, likedBy: req.user._id });

            return res.status(201).json(
                new ApiResponse(201, "like deleted successfully")
            );
        } else {
            const newLike = await Like.create({
                comment: commentId,
                likedBy: req.user._id,
            });

            return res.status(201).json(
                new ApiResponse(201, newLike, "liked")
            );
        }
    } catch (error) {
        throw new ApiError(500, "Error toggling like on comment");
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    try {
        const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

        if (likedTweet) {
            await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });

            return res.status(201).json(
                new ApiResponse(201, "like deleted successfully")
            );
        } else {
            const newLike = await Like.create({
                tweet: tweetId,
                likedBy: req.user._id,
            });

            return res.status(201).json(
                new ApiResponse(201, newLike, "liked")
            );
        }
    } catch (error) {
        throw new ApiError(500, "Error toggling like on tweet");
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        // Get all liked videos for the user
        const videos = await Like.find({ likedBy: req.user._id, video: { $exists: true } });

        return res.status(201).json(
            new ApiResponse(201, videos, "liked videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching liked videos");
    }
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
