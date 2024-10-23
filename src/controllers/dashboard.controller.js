import { Video } from "../models/video.model.js";
import { Subscriber } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        // Get the user's information
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Fetch all videos owned by the user
        const videos = await Video.find({ owner: req.user._id }).sort({ views: -1 });
        const subs = await Subscriber.countDocuments({ channel: req.user._id });

        // Calculate total video views
        let videoviews = 0;
        for (let i = 0; i < videos.length; i++) {
            videoviews += videos[i].views;
        }

        // Extract video IDs for fetching total likes
        const videoIds = videos.map(v => v._id);
        const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

        // Prepare channel stats response
        const channelStatus = {
            totalVideos: videos.length,
            totalLikes,
            totalSubs: subs,
            totalViews: videoviews,
            channelName: user.username,
            logo: user.avatar,
            mostViewedVideo: videos[0] || null // Handle case if there are no videos
        };

        return res.status(201).json(
            new ApiResponse(201, channelStatus, "Info fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching channel stats:", error);
        throw new ApiError(500, "Error fetching channel stats");
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        // Fetch all videos owned by the user
        const videos = await Video.find({ owner: req.user._id });

        return res.status(201).json(
            new ApiResponse(201, videos, "Videos fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching channel videos:", error);
        throw new ApiError(500, "Error fetching channel videos");
    }
});

export {
    getChannelStats,
    getChannelVideos
};
