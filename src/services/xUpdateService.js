const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const fetchFromXAPI = async () => {
  try {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        'Authorization': `Bearer ${process.env.X_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        query: '#AbiaState -is:retweet', // Fetch posts with #AbiaState, exclude retweets
        'tweet.fields': 'id,text,author_id,created_at',
        'user.fields': 'username',
        'expansions': 'author_id',
        max_results: 10
      }
    });

    const users = response.data.includes?.users || [];
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.username;
      return map;
    }, {});

    return response.data.data?.map(tweet => ({
      post_id: tweet.id,
      content: tweet.text,
      author: userMap[tweet.author_id] || 'Unknown',
      posted_at: new Date(tweet.created_at)
    })) || [];
  } catch (error) {
    logger.error('Error fetching from X API:', error.response?.data || error.message);
    return [];
  }
};

const fetchAndStoreUpdates = async () => {
  try {
    const updates = await fetchFromXAPI();
    const newUpdates = [];

    for (const update of updates) {
      try {
        // Check if update already exists
        const existingUpdate = await prisma.xUpdate.findUnique({
          where: { post_id: update.post_id }
        });

        if (!existingUpdate) {
          const savedUpdate = await prisma.xUpdate.create({
            data: {
              post_id: update.post_id,
              content: update.content,
              author: update.author,
              posted_at: update.posted_at,
              fetched_at: new Date()
            }
          });
          newUpdates.push(savedUpdate);
        }
      } catch (error) {
        logger.error(`Error saving update ${update.post_id}:`, error);
      }
    }

    // Clean up old updates (keep only last 1000 records)
    const oldUpdates = await prisma.xUpdate.findMany({
      skip: 1000,
      orderBy: { posted_at: 'desc' },
      select: { id: true }
    });

    if (oldUpdates.length > 0) {
      await prisma.xUpdate.deleteMany({
        where: {
          id: {
            in: oldUpdates.map(update => update.id)
          }
        }
      });
    }

    logger.info(`Processed ${updates.length} updates, ${newUpdates.length} new updates stored`);
    return newUpdates;
  } catch (error) {
    logger.error('Error in fetchAndStoreUpdates:', error);
    throw error;
  }
};

const getCachedUpdates = async (options = {}) => {
  try {
    const { page = 1, limit = 10, author, from_date, to_date } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (author) where.author = { contains: author, mode: 'insensitive' };
    
    if (from_date || to_date) {
      where.posted_at = {};
      if (from_date) where.posted_at.gte = new Date(from_date);
      if (to_date) where.posted_at.lte = new Date(to_date);
    }

    const [updates, total] = await Promise.all([
      prisma.xUpdate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { posted_at: 'desc' }
      }),
      prisma.xUpdate.count({ where })
    ]);

    return {
      updates,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    logger.error('Error getting cached updates:', error);
    throw error;
  }
};

module.exports = {
  fetchAndStoreUpdates,
  getCachedUpdates,
  fetchFromXAPI
};