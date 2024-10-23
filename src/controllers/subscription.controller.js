import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscriber } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    try {
        // Check if the subscription exists
        const userSubscribed = await Subscriber.findOne({ channel: channelId, subscriber: req.user._id });

        if (userSubscribed) {
            await Subscriber.deleteOne({ subscriber: req.user._id, channel: channelId });

            return res.status(201).json(
                new ApiResponse(201, "unsubscribed")
            );
        } else {
            const newSubscriber = await Subscriber.create({
                channel: channelId,
                subscriber: req.user._id,
            });

            return res.status(201).json(
                new ApiResponse(201, newSubscriber, "subscribed to the channel")
            );
        }
    } catch (error) {
        throw new ApiError(500, "Error while toggling subscription");
    }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    try {
        const userChannelSubscribers = await Subscriber.find({ channel: channelId });

        const userIds = userChannelSubscribers.map(u => u.subscriber._id);

        return res.status(201).json(
            new ApiResponse(201, userIds, "subscribed users fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching subscribers");
    }
});

// Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    try {
        const subscribedChannels = await Subscriber.find({ subscriber: subscriberId });

        return res.status(201).json(
            new ApiResponse(201, subscribedChannels, "subscribed channels fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching subscribed channels");
    }
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
