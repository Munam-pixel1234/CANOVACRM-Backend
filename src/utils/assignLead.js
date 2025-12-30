import Lead from "../models/Lead.js";
import User from "../models/User.js";

const MAX_LEADS_PER_EMPLOYEE = 7;

const assignLeadsBatch = async (language, leadCount) => {
  if (!language || leadCount <= 0) {
    throw new Error("Language or lead count missing");
  }

  const lang = language.trim().toLowerCase();

  // 1️⃣ Get active sales users for language
  const employees = await User.find({
    role: "Sales",
    status: "Active",
    language: lang,
  }).sort({ createdAt: 1 });

  if (!employees.length) {
    throw new Error(`No ACTIVE Sales user found for language: ${lang}`);
  }

  // 2️⃣ Get current assigned lead counts
  const leadCounts = await Lead.aggregate([
    {
      $match: {
        assignedTo: { $in: employees.map(e => e._id) },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  leadCounts.forEach(c => {
    countMap[c._id.toString()] = c.count;
  });

  // 3️⃣ Filter eligible employees (less than 7 leads)
  const eligibleEmployees = employees.filter(emp => {
    const currentCount = countMap[emp._id.toString()] || 0;
    return currentCount < MAX_LEADS_PER_EMPLOYEE;
  });

  if (!eligibleEmployees.length) {
    // No one eligible → all leads remain unassigned
    return new Array(leadCount).fill(null);
  }

  // 4️⃣ Assign leads round-robin among eligible employees
  const assignments = [];

  let empIndex = 0;

  for (let i = 0; i < leadCount; i++) {
    const emp = eligibleEmployees[empIndex];

    const empId = emp._id.toString();
    const currentCount = countMap[empId] || 0;

    if (currentCount >= MAX_LEADS_PER_EMPLOYEE) {
      empIndex = (empIndex + 1) % eligibleEmployees.length;
      i--;
      continue;
    }

    assignments.push(emp._id);
    countMap[empId] = currentCount + 1;

    empIndex = (empIndex + 1) % eligibleEmployees.length;
  }

  return assignments;
};

export default assignLeadsBatch;
