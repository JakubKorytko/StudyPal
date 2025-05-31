import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import createExtendedSchema from "./db/schema.js";

const app = express();
const db = new sqlite3.Database("./db/database.sqlite");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function updatePlanStatus(planId) {
  db.all(
    "SELECT is_completed FROM Task WHERE study_plan_id = ?",
    [planId],
    (err, rows) => {
      if (err) return console.error(err);

      const total = rows.length;
      const completed = rows.filter((r) => r.is_completed === 1).length;

      let status = "Do zrobienia";
      if (completed === total && total > 0) status = "Zrobione";
      else if (completed > 0) status = "W trakcie";

      db.run("UPDATE StudyPlan SET status = ? WHERE id = ?", [status, planId]);
    },
  );
}

createExtendedSchema(db);

app.get("/api/plans", (req, res) => {
  db.all("SELECT * FROM StudyPlan", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/plans", (req, res) => {
  const { title, date } = req.body;
  db.run(
    "INSERT INTO StudyPlan (title, date, status, user_id) VALUES (?, ?, ?, ?)",
    [title, date, "Do zrobienia", 1],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    },
  );
});

app.delete("/api/plans/:id", (req, res) => {
  const planId = req.params.id;
  db.run("DELETE FROM Task WHERE study_plan_id = ?", [planId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run("DELETE FROM StudyPlan WHERE id = ?", [planId], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

app.post("/api/plans/:planId/steps", (req, res) => {
  const { description } = req.body;
  db.run(
    "INSERT INTO Task (study_plan_id, title, is_completed) VALUES (?, ?, ?)",
    [req.params.planId, description, 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      updatePlanStatus(req.params.planId);
      res.json({ id: this.lastID });
    },
  );
});

app.get("/api/plans/:planId/steps", (req, res) => {
  db.all(
    "SELECT * FROM Task WHERE study_plan_id = ?",
    [req.params.planId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

app.post("/api/steps/:stepId/toggle", (req, res) => {
  const stepId = req.params.stepId;

  db.get(
    "SELECT is_completed, study_plan_id FROM Task WHERE id = ?",
    [stepId],
    (err, row) => {
      if (err || !row)
        return res
          .status(500)
          .json({ error: err?.message || "Step not found" });

      const newStatus = row.is_completed ? 0 : 1;
      db.run(
        "UPDATE Task SET is_completed = ? WHERE id = ?",
        [newStatus, stepId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          updatePlanStatus(row.study_plan_id);
          res.json({ success: true });
        },
      );
    },
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
