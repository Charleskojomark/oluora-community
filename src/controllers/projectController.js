const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const proposer_id = req.user.id;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        proposer_id
      },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    logger.info(`Project created: ${project.title} by user ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const proposer = req.query.proposer;

    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (proposer) where.proposer_id = parseInt(proposer);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          proposer: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          votes: {
            select: {
              vote_type: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.project.count({ where })
    ]);

    // Add vote counts to each project
    const projectsWithVotes = projects.map(project => {
      const upvotes = project.votes.filter(vote => vote.vote_type === 'UPVOTE').length;
      const downvotes = project.votes.filter(vote => vote.vote_type === 'DOWNVOTE').length;
      
      return {
        ...project,
        vote_counts: {
          upvotes,
          downvotes,
          total: upvotes + downvotes
        },
        votes: undefined // Remove votes array from response
      };
    });

    res.json({
      status: 'success',
      data: projectsWithVotes,
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

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        votes: {
          select: {
            vote_type: true,
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const upvotes = project.votes.filter(vote => vote.vote_type === 'UPVOTE').length;
    const downvotes = project.votes.filter(vote => vote.vote_type === 'DOWNVOTE').length;

    const projectWithVotes = {
      ...project,
      vote_counts: {
        upvotes,
        downvotes,
        total: upvotes + downvotes
      }
    };

    res.json({
      status: 'success',
      data: projectWithVotes
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if user is the proposer or admin
    if (project.proposer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status && req.user.role === 'ADMIN') updateData.status = status;

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    logger.info(`Project updated: ${updatedProject.title} by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if user is the proposer or admin
    if (project.proposer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Project deleted: ${project.title} by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const voteOnProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        user_id_project_id: {
          user_id: req.user.id,
          project_id: parseInt(id)
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: {
          user_id_project_id: {
            user_id: req.user.id,
            project_id: parseInt(id)
          }
        },
        data: { vote_type }
      });

      logger.info(`Vote updated: ${vote_type} on project ${id} by user ${req.user.id}`);

      return res.json({
        status: 'success',
        message: 'Vote updated successfully',
        data: updatedVote
      });
    } else {
      // Create new vote
      const vote = await prisma.vote.create({
        data: {
          user_id: req.user.id,
          project_id: parseInt(id),
          vote_type
        }
      });

      logger.info(`Vote created: ${vote_type} on project ${id} by user ${req.user.id}`);

      res.status(201).json({
        status: 'success',
        message: 'Vote created successfully',
        data: vote
      });
    }
  } catch (error) {
    next(error);
  }
};

const getProjectVotes = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        votes: {
          select: {
            vote_type: true,
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const upvotes = project.votes.filter(vote => vote.vote_type === 'UPVOTE').length;
    const downvotes = project.votes.filter(vote => vote.vote_type === 'DOWNVOTE').length;

    res.json({
      status: 'success',
      data: {
        project_id: parseInt(id),
        vote_counts: {
          upvotes,
          downvotes,
          total: upvotes + downvotes
        },
        votes: project.votes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  voteOnProject,
  getProjectVotes
};