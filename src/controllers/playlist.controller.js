
import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    try {
        if (!name || name.trim() === "") {
            throw new ApiError(400, "Playlist name is required")
        }

        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._id
        })

        return res.status(201).json(
            new ApiResponse(201, playlist, "Playlist created successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create playlist")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID")
        }

        const playlistsOfUser = await Playlist.find({ owner: userId })

        if (!playlistsOfUser.length) {
            return res.status(200).json(
                new ApiResponse(200, [], "No playlists found for this user")
            )
        }

        return res.status(200).json(
            new ApiResponse(200, playlistsOfUser, "User playlists retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to retrieve user playlists")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    try {
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID")
        }

        const playlist = await Playlist.findById(playlistId)

        if (!playlist) {
            throw new ApiError(404, "Playlist not found")
        }

        return res.status(200).json(
            new ApiResponse(200, playlist, "Playlist retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to retrieve playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    try {
        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist ID or video ID")
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { videos: videoId } },
            { new: true }
        ).populate('videos')

        if (!playlist) {
            throw new ApiError(404, "Playlist not found")
        }

        return res.status(200).json(
            new ApiResponse(200, playlist, "Video added to playlist successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to add video to playlist")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    try {
        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist ID or video ID")
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { videos: videoId } },
            { new: true }
        )

        if (!playlist) {
            throw new ApiError(404, "Playlist not found")
        }

        return res.status(200).json(
            new ApiResponse(200, playlist, "Video removed from playlist successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to remove video from playlist")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    try {
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID")
        }

        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

        if (!deletedPlaylist) {
            throw new ApiError(404, "Playlist not found")
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Playlist deleted successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete playlist")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    try {
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID")
        }

        if (!name && !description) {
            throw new ApiError(400, "At least one field (name or description) is required for update")
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $set: { name, description } },
            { new: true, runValidators: true }
        )

        if (!updatedPlaylist) {
            throw new ApiError(404, "Playlist not found")
        }

        return res.status(200).json(
            new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
        )
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}