import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

export const getDashboard = async (req, res) => {
  try {
    /* ================= KPI COUNTS ================= */

    // Unassigned leads
    const unassignedLeads = await Lead.countDocuments({
      assignedTo: null,
    });

    // Assigned this week
    const assignedThisWeek = await Lead.countDocuments({
      assignedTo: { $ne: null },
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    /* ================= SALES PEOPLE ================= */

    // Fetch ALL sales users
    const salesUsers = await User.find({
      role: "Sales",
    }).select("name employeeId assignedLeads closedLeads status");

    // Count active only
    const activeSalesPeople = salesUsers.filter(
      (u) => u.status === "Active"
    ).length;

    /* ================= CONVERSION RATE ================= */

    const assignedLeads = await Lead.countDocuments({
      assignedTo: { $ne: null },
    });

    const closedLeads = await Lead.countDocuments({
      assignedTo: { $ne: null },
      status: "Closed",
    });

    const conversionRate = assignedLeads
      ? Math.round((closedLeads / assignedLeads) * 100)
      : 0;

    /* ================= RECENT ACTIVITY ================= */

    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .select("message");

    // frontend expects string[]
    const activityMessages = recentActivities.map(
      (a) => a.message || "Activity recorded"
    );

    /* ================= CONVERSION TREND (LAST 14 DAYS) ================= */

    const conversionTrend = [];

    for (let i = 13; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const assignedCount = await Lead.countDocuments({
        assignedTo: { $ne: null },
        createdAt: { $gte: start, $lte: end },
      });

      const closedCount = await Lead.countDocuments({
        assignedTo: { $ne: null },
        status: "Closed",
        updatedAt: { $gte: start, $lte: end },
      });

      conversionTrend.push(
        assignedCount
          ? Math.round((closedCount / assignedCount) * 100)
          : 0
      );
    }

    /* ================= RESPONSE ================= */

    res.json({
      unassignedLeads,
      assignedThisWeek,
      activeSalesPeople,
      conversionRate,
      recentActivities: activityMessages,
      activeEmployees: salesUsers,
      conversionTrend,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};
