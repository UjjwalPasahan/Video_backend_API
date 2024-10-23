
import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    try {

        const comments = await Comment.find({ video: videoId }).skip(page * 10 - limit).limit(parseInt(limit))

        if (!comments) {
            throw new ApiError(401, "No Comments found")
        }

        return res.status(201).json(
            new ApiResponse(201, comments, "Comments found")
        )
    } catch (error) {
        throw new ApiError(501, "something went wrong while fetching all comments")
    }


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: Add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;

    // Validate inputs
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    try {
        const comment = await Comment.create({
            content,
            owner: req.user._id,
            video: videoId,
        });

        return res.status(201).json(
            new ApiResponse(201, comment, "Comment added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error while adding comment");
    }
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: Update a comment
    const { content } = req.body;
    const { commentId } = req.params;

    // Validate inputs
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if the user is the owner of the comment
        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized to update this comment");
        }

        // Update the comment
        comment.content = content;
        await comment.save();

        return res.status(200).json(
            new ApiResponse(200, comment, "Comment updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error while updating comment");
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: Delete a comment
    const { commentId } = req.params;

    // Validate inputs
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if the user is the owner of the comment
        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized to delete this comment");
        }

        await Comment.deleteOne({ _id: commentId });

        return res.status(200).json(
            new ApiResponse(200, null, "Comment deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error while deleting comment");
    }
});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
