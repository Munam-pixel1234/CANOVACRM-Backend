import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import assignLeadsBatch from "../utils/assignLead.js";
import parseCSV from "../utils/csvParser.js";
import fs from "fs";

/* ===============================
   GET ALL LEADS (ADMIN / SALES)
================================ */
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedTo", "name employeeId")
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   CREATE LEAD (ADMIN)
================================ */
export const createLead = async (req, res) => {
  try {
    const { name, email, source, date, location, language } = req.body;

    if (!name || !email || !language) {
      return res.status(400).json({
        message: "Name, email, and language required",
      });
    }

    const normalizedLang = language.trim().toLowerCase();

    // 🔹 Assign exactly one lead
    const [assignedTo] = await assignLeadsBatch(normalizedLang, 1);

    const lead = await Lead.create({
      name,
      email,
      source,
      date: date ? new Date(date) : new Date(),
      location,
      language: normalizedLang,
      assignedTo: assignedTo || null,
      status: "Ongoing",
    });

    // ✅ Increment assigned leads
    if (assignedTo) {
      await User.findByIdAndUpdate(assignedTo, {
        $inc: { assignedLeads: 1 },
      });
    }

    // ✅ Activity log
    await Activity.create({
      message: assignedTo
        ? `Lead assigned (${normalizedLang})`
        : `Lead created but unassigned (${normalizedLang})`,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPDATE LEAD (SALES)
================================ */
export const updateLead = async (req, res) => {
  try {
    const { type, scheduledDate, status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    /* ================= SCHEDULE ================= */
    if (type === "Scheduled") {
      if (!scheduledDate) {
        return res.status(400).json({
          message: "Scheduled date required",
        });
      }

      lead.type = "Scheduled";
      lead.scheduledDate = new Date(scheduledDate);
      lead.status = "Ongoing";
    }

    /* ================= CLOSE ================= */
    if (status === "Closed" && lead.status !== "Closed") {
      // ❌ Block closing before scheduled time
      if (
        lead.type === "Scheduled" &&
        lead.scheduledDate &&
        new Date() < new Date(lead.scheduledDate)
      ) {
        return res.status(400).json({
          message: "Lead can be closed only after scheduled time",
        });
      }

      lead.status = "Closed";

      if (lead.assignedTo) {
        await User.findByIdAndUpdate(lead.assignedTo, {
          $inc: { closedLeads: 1 },
        });
      }

      await Activity.create({
        message: "Lead status updated to Closed",
      });
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   CSV UPLOAD (ADMIN)
================================ */
export const uploadCSV = async (req, res) => {
  try {
    const leads = await parseCSV(req.file.path);

    if (!leads.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "No valid leads found in CSV",
      });
    }

    const grouped = {};
    let inserted = 0;
    let unassigned = 0;

    // 🔹 Group leads by language
    for (const lead of leads) {
      const lang = lead.language?.trim().toLowerCase();
      if (!lang) continue;

      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push(lead);
    }

    // 🔹 Assign leads per language
    for (const lang in grouped) {
      const batch = grouped[lang];
      const assignedUsers = await assignLeadsBatch(lang, batch.length);

      await Promise.all(
        batch.map((lead, i) =>
          Lead.create({
            ...lead,
            assignedTo: assignedUsers[i] || null,
            status: "Ongoing",
          }).then(async () => {
            // ✅ Increment assigned leads
            if (assignedUsers[i]) {
              await User.findByIdAndUpdate(assignedUsers[i], {
                $inc: { assignedLeads: 1 },
              });
            }

            // ✅ Activity log
            await Activity.create({
              message: assignedUsers[i]
                ? `Lead assigned (${lang})`
                : `Lead unassigned (${lang})`,
            });

            assignedUsers[i] ? inserted++ : unassigned++;
          })
        )
      );
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      inserted,
      unassigned,
      total: leads.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




/* ===============================
   GET ASSIGNED LEADS (SALES)
================================ */
export const getAssignedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      assignedTo: req.user._id,
    }).select(
      "name email phone source date status type scheduledDate"
    ).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
