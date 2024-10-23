import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fileUpload, fileUploadV } from "../utils/fileUpload.js";
import { deleteFile } from "../utils/deleteFile.js";
import { v2 as cloudinary } from 'cloudinary';

// Get all videos with pagination, search, and sort
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    try {
        const filter = query ? { title: { $regex: query, $options: "i" } } : {};
        if (userId && isValidObjectId(userId)) {
            filter.owner = userId;
        }

        const videos = await Video.find(filter)
            .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return res.status(200).json(
            new ApiResponse(200, videos, "Videos retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve videos");
    }
});

// Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        return res.status(400).json(new ApiResponse(400, null, "Title and description are required"));
    }
    
    const videoPath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    
    if (!videoPath) {
        return res.status(400).json(new ApiResponse(400, null, "No video file found"));
    }
    
    if (!thumbnailPath) {
        return res.status(400).json(new ApiResponse(400, null, "No thumbnail found"));
    }
    
    try {
        console.log("Uploading video file...");
        const thumbnailFileUploaded = await fileUpload(thumbnailPath);
        const videoFileUploaded = await fileUploadV(videoPath);
        console.log("Uploading thumbnail file...");
        
        if (!videoFileUploaded || !thumbnailFileUploaded) {
            return res.status(500).json(new ApiResponse(500, null, "Error uploading files"));
        }
        
        console.log("Files uploaded successfully");
        
        const duration = videoFileUploaded.duration;
        
        if (duration === undefined) {
            return res.status(500).json(new ApiResponse(500, null, "Could not determine video duration"));
        }
        
        console.log("Creating video document...");
        const video = await Video.create({
            videoFile: videoFileUploaded.url,
            thumbnail: thumbnailFileUploaded.url,
            title,
            description,
            owner: req.user._id,
            duration: duration
        });
        
        console.log("Video document created successfully");
        
        return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
    } catch (error) {
        console.error(`Error publishing video: ${error.message}`);
        return res.status(500).json(new ApiResponse(500, null, `An error occurred while publishing the video: ${error.message}`));
    }
});




// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    try {
        const video = await Video.findById(videoId);
        video.views += 1;
        
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        video.save()

        return res.status(200).json(
            new ApiResponse(200, video, "Video retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve video");
    }
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const thumbNailPath = req.files?.thumbnail?.[0]?.path;

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        if (thumbNailPath) {
            const thumbnailFileUploaded = await fileUpload(thumbNailPath);
            if (!thumbnailFileUploaded) {
                throw new ApiError(500, "Error uploading thumbnail");
            }
            video.thumbnail = thumbnailFileUploaded.url;
        }

        video.title = title;
        video.description = description;
        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Video updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to update video");
    }
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const publicId = video.videoFile
            .replace('http://res.cloudinary.com/dxz3esyow/video/upload/', '')
            .split('.')[0];

        const deletionResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

        if (deletionResult.result !== 'ok') {
            throw new ApiError(500, "Failed to delete video from Cloudinary");
        }

        await Video.deleteOne({ _id: videoId });

        return res.status(200).json(
            new ApiResponse(200, null, "Video deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Video deletion failed");
    }
});

// Toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        video.isPublished = !video.isPublished;
        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Publish status toggled successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to toggle publish status");
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
