import { invokeService } from '../services/dapr.client.js';
import logger from '../core/logger.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    logger.info('Fetching dashboard statistics', { correlationId });

    // Fetch data from multiple services in parallel via Dapr
    const [usersResponse, ordersResponse] = await Promise.allSettled([
      invokeService('user-service', 'api/users', 'GET', null, {
        headers: { 'x-correlation-id': correlationId },
      }),
      invokeService('order-service', 'api/orders', 'GET', null, {
        headers: {
          'x-correlation-id': correlationId,
          Authorization: req.headers.authorization,
        },
      }),
    ]);

    // Process user data
    let userStats = {
      total: 0,
      active: 0,
      newThisMonth: 0,
      growth: 0,
    };

    if (usersResponse.status === 'fulfilled') {
      const users = usersResponse.value?.data || usersResponse.value || [];
      userStats.total = users.length;
      userStats.active = users.filter((u) => u.isActive !== false).length;

      // Calculate new users this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      userStats.newThisMonth = users.filter((u) => new Date(u.createdAt) >= startOfMonth).length;

      // Calculate growth (mock for now)
      userStats.growth = userStats.newThisMonth > 0 ? ((userStats.newThisMonth / userStats.total) * 100).toFixed(1) : 0;
    }

    // Process order data
    let orderStats = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      revenue: 0,
      growth: 0,
    };

    if (ordersResponse.status === 'fulfilled') {
      const orders = ordersResponse.value?.data || ordersResponse.value || [];
      orderStats.total = orders.length;
      orderStats.pending = orders.filter((o) => o.status === 0 || o.status === 'Created').length; // Status 0 = Created
      orderStats.processing = orders.filter((o) => o.status === 1 || o.status === 'Processing').length; // Status 1 = Processing
      orderStats.completed = orders.filter((o) => o.status === 3 || o.status === 'Delivered').length; // Status 3 = Delivered
      orderStats.revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Calculate growth (mock for now)
      orderStats.growth = 8.3;
    }

    // Mock data for products and reviews (to be implemented when those services are ready)
    const productStats = {
      total: 29, // From seed data
      active: 29,
      lowStock: 0,
      outOfStock: 0,
    };

    const reviewStats = {
      total: 20, // From seed data
      pending: 0,
      averageRating: 4.2,
      growth: 0,
    };

    const stats = {
      users: userStats,
      orders: orderStats,
      products: productStats,
      reviews: reviewStats,
    };

    logger.info('Dashboard statistics fetched successfully', {
      correlationId,
      stats: {
        totalUsers: userStats.total,
        totalOrders: orderStats.total,
        pendingOrders: orderStats.pending,
        revenue: orderStats.revenue,
      },
    });

    res.json({
      success: true,
      data: stats,
      correlationId,
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard statistics', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
      correlationId,
    });
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (req, res) => {
  const correlationId = req.correlationId;
  const limit = parseInt(req.query.limit) || 5;

  try {
    logger.info('Fetching recent orders', { correlationId, limit });

    const response = await invokeService('order-service', 'api/orders', 'GET', null, {
      headers: {
        'x-correlation-id': correlationId,
        Authorization: req.headers.authorization,
      },
    });

    const orders = response?.data || response || [];

    // Sort by creation date (newest first) and limit
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        customerEmail: order.customerEmail,
        total: order.totalAmount,
        status: getOrderStatusName(order.status),
        createdAt: order.createdAt,
      }));

    logger.info('Recent orders fetched successfully', {
      correlationId,
      count: recentOrders.length,
    });

    res.json({
      success: true,
      data: recentOrders,
      correlationId,
    });
  } catch (error) {
    logger.error('Failed to fetch recent orders', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message,
      correlationId,
    });
  }
};

/**
 * Get recent users
 */
export const getRecentUsers = async (req, res) => {
  const correlationId = req.correlationId;
  const limit = parseInt(req.query.limit) || 5;

  try {
    logger.info('Fetching recent users', { correlationId, limit });

    const response = await invokeService('user-service', 'api/users', 'GET', null, {
      headers: { 'x-correlation-id': correlationId },
    });

    const users = response?.data || response || [];

    // Sort by creation date (newest first) and limit
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((user) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }));

    logger.info('Recent users fetched successfully', {
      correlationId,
      count: recentUsers.length,
    });

    res.json({
      success: true,
      data: recentUsers,
      correlationId,
    });
  } catch (error) {
    logger.error('Failed to fetch recent users', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users',
      error: error.message,
      correlationId,
    });
  }
};

/**
 * Get analytics data for a specific period
 */
export const getAnalytics = async (req, res) => {
  const correlationId = req.correlationId;
  const period = req.query.period || '7d'; // 7d, 30d, 90d

  try {
    logger.info('Fetching analytics data', { correlationId, period });

    // Mock analytics data (to be implemented with real time-series data)
    const analytics = {
      period,
      revenue: {
        current: 125430,
        previous: 115200,
        change: 8.9,
      },
      orders: {
        current: 342,
        previous: 318,
        change: 7.5,
      },
      users: {
        current: 89,
        previous: 76,
        change: 17.1,
      },
      chart: {
        labels: generateDateLabels(period),
        datasets: [
          {
            label: 'Revenue',
            data: generateMockData(period, 1000, 5000),
          },
          {
            label: 'Orders',
            data: generateMockData(period, 10, 50),
          },
        ],
      },
    };

    res.json({
      success: true,
      data: analytics,
      correlationId,
    });
  } catch (error) {
    logger.error('Failed to fetch analytics', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
      correlationId,
    });
  }
};

// Helper functions

/**
 * Convert order status enum to name
 */
function getOrderStatusName(status) {
  const statusMap = {
    0: 'pending',
    1: 'processing',
    2: 'shipped',
    3: 'completed',
    4: 'cancelled',
    Created: 'pending',
    Processing: 'processing',
    Shipped: 'shipped',
    Delivered: 'completed',
    Cancelled: 'cancelled',
  };
  return statusMap[status] || 'pending';
}

/**
 * Generate date labels for charts
 */
function generateDateLabels(period) {
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const labels = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  return labels;
}

/**
 * Generate mock data for charts
 */
function generateMockData(period, min, max) {
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const data = [];

  for (let i = 0; i < days; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return data;
}
