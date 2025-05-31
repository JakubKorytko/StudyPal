function createExtendedSchema(db) {
  db.serialize(() => {
    // Users
    db.run(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    // Study Plans
    db.run(`
      CREATE TABLE IF NOT EXISTS StudyPlan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Do zrobienia',
        FOREIGN KEY (user_id) REFERENCES User(id)
      )
    `);

    // Tasks
    db.run(`
      CREATE TABLE IF NOT EXISTS Task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_plan_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        due_date DATE,
        is_completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (study_plan_id) REFERENCES StudyPlan(id)
      )
    `);

    // Progress (for task completion per user)
    db.run(`
      CREATE TABLE IF NOT EXISTS Progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id),
        FOREIGN KEY (task_id) REFERENCES Task(id)
      )
    `);

    // Study Sessions
    db.run(`
      CREATE TABLE IF NOT EXISTS StudySession (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        topic VARCHAR(255),
        scheduled_at TIMESTAMP,
        link_to_meeting TEXT,
        FOREIGN KEY (creator_id) REFERENCES User(id)
      )
    `);

    // Study Session Participants
    db.run(`
      CREATE TABLE IF NOT EXISTS StudySessionParticipant (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        confirmed BOOLEAN DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES StudySession(id),
        FOREIGN KEY (user_id) REFERENCES User(id)
      )
    `);

    // Materials
    db.run(`
      CREATE TABLE IF NOT EXISTS Material (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        study_plan_id INTEGER,
        title VARCHAR(255),
        type VARCHAR(50),
        url_or_path TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id),
        FOREIGN KEY (study_plan_id) REFERENCES StudyPlan(id)
      )
    `);

    // Comments
    db.run(`
      CREATE TABLE IF NOT EXISTS Comment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        study_plan_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(id),
        FOREIGN KEY (study_plan_id) REFERENCES StudyPlan(id)
      )
    `);
  });

  db.run(`
    INSERT OR IGNORE INTO User (id, email, password_hash, name, role) VALUES 
    (null, 'testemail@test.com', 'hashedpassword123', 'Test User', 'admin')
    `);
}

export default createExtendedSchema;
