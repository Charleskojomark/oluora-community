const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const xUpdateService = require('../services/xUpdateService');

const prisma = new PrismaClient();

const getXUpdates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const author = req.query.author;
    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    const skip = (page - 1) * limit;

    const where = {};
    if (author) where.author = { contains: author, mode: 'insensitive' };
    
    // Date filtering
    if (from_date || to_date) {
      where.posted_at = {};
      if (from_date) where.posted_at.gte = new Date(from_date);
      if (to_date) where.posted_at.lte = new Date(to_date);
    }

    const [xUpdates, total] = await Promise.all([
      prisma.xUpdate.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          posted_at: 'desc'
        }
      }),
      prisma.xUpdate.count({ where })
    ]);

    res.json({
      status: 'success',
      data: xUpdates,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getXUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const xUpdate = await prisma.xUpdate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!xUpdate) {
      return res.status(404).json({
        status: 'error',
        message: 'X update not found'
      });
    }

    res.json({
      status: 'success',
      data: xUpdate
    });
  } catch (error) {
    next(error);
  }
};

const refreshXUpdates = async (req, res, next) => {
  try {
    // Only allow admins to manually refresh
    if (req.user && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    const newUpdates = await xUpdateService.fetchAndStoreUpdates();
    
    logger.info(`X updates refreshed: ${newUpdates.length} new updates`);

    res.json({
      status: 'success',
      message: 'X updates refreshed successfully',
      data: {
        new_updates_count: newUpdates.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getXUpdates,
  getXUpdate,
  refreshXUpdates
};