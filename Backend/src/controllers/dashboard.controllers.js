import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  const channelStats = {};

  const videoStates = await Video.aggregate([
    {
      $match: {
        owner: req.user?._id,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalVideos: { $count: {} },
      },
    },
  ]);

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        channel: req.user?._id,
      },
    },
    {
      $count: "totalSubscribers",
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $match: {
        video: { $ne: null },
        liked: true,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "channelVideo",
        pipeline: [
          {
            $match: {
              owner: req.user?._id,
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelVideo: {
          $first: "$channelVideo",
        },
      },
    },
    {
      $match: {
        channelVideo: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        likeCount: {
          $sum: 1,
        },
      },
    },
  ]);

  channelStats.ownerName = req.user?.fullName;
  channelStats.totalViews = (videoStates && videoStates[0]?.totalViews) || 0;
  channelStats.totalVideos = (videoStates && videoStates[0]?.totalVideos) || 0;
  channelStats.totalSubscribers =
    (subscriber && subscriber[0]?.totalSubscribers) || 0;
  channelStats.totalLikes = (totalLikes && totalLikes[0]?.likeCount) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel states sent successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const allVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    // lookup for owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner"
    },
    // lookup for likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
        ],
      },
    },
    // lookup for dislikes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "dislikes",
        pipeline: [
          {
            $match: {
              liked: false,
            },
          },
        ],
      },
    },
    // lookup for comments
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: 1,
        category: 1,
        difficulty: 1,
        createdAt: 1,
        updatedAt: 1,
        likesCount: {
          $size: "$likes",
        },
        dislikesCount: {
          $size: "$dislikes",
        },
        commentsCount: {
          $size: "$comments",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { videos: allVideos }, "All videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
}