const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const createTownhall = async (req, res, next) => {
  try {
    const { title, description, scheduled_at, zoom_link } = req.body;
    const organizer_id = req.user.id;

    const townhall = await prisma.townhall.create({
      data: {
        title,
        description,
        organizer_id,
        scheduled_at: new Date(scheduled_at),
        zoom_link
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    logger.info(`Townhall created: ${townhall.title} by user ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Townhall created successfully',
      data: townhall
    });
  } catch (error) {
    next(error);
  }
};

const getTownhalls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const organizer = req.query.organizer;
    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (organizer) where.organizer_id = parseInt(organizer);
    
    // Date filtering
    if (from_date || to_date) {
      where.scheduled_at = {};
      if (from_date) where.scheduled_at.gte = new Date(from_date);
      if (to_date) where.scheduled_at.lte = new Date(to_date);
    }

    const [townhalls, total] = await Promise.all([
      prisma.townhall.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduled_at: 'asc'
        }
      }),
      prisma.townhall.count({ where })
    ]);

    res.json({
      status: 'success',
      data: townhalls,
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

const getTownhall = async (req, res, next) => {
  try {
    const { id } = req.params;

    const townhall = await prisma.townhall.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!townhall) {
      return res.status(404).json({
        status: 'error',
        message: 'Townhall not found'
      });
    }

    res.json({
      status: 'success',
      data: townhall
    });
  } catch (error) {
    next(error);
  }
};

const updateTownhall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, scheduled_at, zoom_link, status } = req.body;

    const townhall = await prisma.townhall.findUnique({
      where: { id: parseInt(id) }
    });

    if (!townhall) {
      return res.status(404).json({
        status: 'error',
        message: 'Townhall not found'
      });
    }

    // Check if user is the organizer or admin
    if (townhall.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (scheduled_at) updateData.scheduled_at = new Date(scheduled_at);
    if (zoom_link) updateData.zoom_link = zoom_link;
    if (status && req.user.role === 'ADMIN') updateData.status = status;

    const updatedTownhall = await prisma.townhall.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    logger.info(`Townhall updated: ${updatedTownhall.title} by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Townhall updated successfully',
      data: updatedTownhall
    });
  } catch (error) {
    next(error);
  }
};

const deleteTownhall = async (req, res, next) => {
  try {
    const { id } = req.params;

    const townhall = await prisma.townhall.findUnique({
      where: { id: parseInt(id) }
    });

    if (!townhall) {
      return res.status(404).json({
        status: 'error',
        message: 'Townhall not found'
      });
    }

    // Check if user is the organizer or admin
    if (townhall.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    await prisma.townhall.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Townhall deleted: ${townhall.title} by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Townhall deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTownhall,
  getTownhalls,
  getTownhall,
  updateTownhall,
  deleteTownhall
};