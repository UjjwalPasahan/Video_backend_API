import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    try {
        const tweet = await Tweet.create({
            content: content.trim(),
            owner: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, tweet, "Tweet added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "An error occurred while creating the tweet");
    }
});



const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    try {
        const tweets = await Tweet.find({ owner: userId });

        return res.status(200).json(
            new ApiResponse(200, tweets, "User tweets retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve user tweets");
    }
});



const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated content is required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    try {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }


        if (!tweet.owner.equals(req.user._id)) {
            throw new ApiError(403, "You are not authorized to update this tweet");
        }

        tweet.content = content.trim();
        await tweet.save();

        return res.status(200).json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to update tweet");
    }
});



const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    try {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        if (!tweet.owner.equals(req.user._id)) {
            throw new ApiError(403, "You are not authorized to delete this tweet");
        }

        await Tweet.deleteOne({ _id: tweetId });

        return res.status(200).json(
            new ApiResponse(200, null, "Tweet deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to delete tweet");
    }
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
