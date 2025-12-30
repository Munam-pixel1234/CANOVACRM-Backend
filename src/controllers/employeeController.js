import User from "../models/User.js";
import Lead from "../models/Lead.js";
import bcrypt from "bcryptjs";
import Activity from "../models/Activity.js";

/* ================= CREATE EMPLOYEE ================= */
export const createEmployee = async (req, res) => {
  try {
    const { name, email, language, location } = req.body;

    if (!name || !email || !language) {
      return res
        .status(400)
        .json({ message: "Name, email and language required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const employee = await User.create({
      name,
      email,
      language: language.trim().toLowerCase(),
      location,
      role: "Sales",
      employeeId: `EMP-${Date.now()}`,
      password: bcrypt.hashSync(email, 10),
      status: "Active",
    });

    await Activity.create({
      message: `Employee created: ${employee.name}`,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LIST EMPLOYEES (FIXED) ================= */
export const listEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // 1️⃣ Get employees
    const employees = await User.find({ role: "Sales" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const employeeIds = employees.map((e) => e._id);

    // 2️⃣ Aggregate lead counts
    const leadCounts = await Lead.aggregate([
      { $match: { assignedTo: { $in: employeeIds } } },
      {
        $group: {
          _id: "$assignedTo",
          assignedLeads: { $sum: 1 },
          closedLeads: {
            $sum: {
              $cond: [{ $eq: ["$status", "Closed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 3️⃣ Map counts
    const countMap = {};
    leadCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        assignedLeads: c.assignedLeads,
        closedLeads: c.closedLeads,
      };
    });

    // 4️⃣ Attach counts to employees
    const enrichedEmployees = employees.map((emp) => ({
      ...emp,
      assignedLeads: countMap[emp._id.toString()]?.assignedLeads || 0,
      closedLeads: countMap[emp._id.toString()]?.closedLeads || 0,
    }));

    const total = await User.countDocuments({ role: "Sales" });

    res.json({
      employees: enrichedEmployees,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE EMPLOYEES ================= */
export const deleteEmployees = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs array required" });
    }

    await User.deleteMany({ _id: { $in: ids } });

    await Activity.create({
      message: `Employee(s) deleted`,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE EMPLOYEE ================= */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status, language, location } = req.body;

    const employee = await User.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(status && { status }),
        ...(language && { language: language.toLowerCase() }),
        ...(location && { location }),
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Activity.create({
      message: `Employee updated: ${employee.name}`,
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
