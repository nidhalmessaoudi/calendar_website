exports.addProject = async function (conn, data) {
  try {
    const query = `INSERT INTO projects(pid, title, startDate, status, milestoneTitle, milestoneDate, milestoneUsers, githubRepo)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    await conn.execute(query, [
      data.proj_id,
      data.title,
      data.date,
      data.status,
      data.milestoneTitle || null,
      data.milestoneDate || null,
      data.milestoneUsers || null,
      data.githubRepo || null,
    ]);
  } catch (error) {
    throw error;
  }
};

exports.getProjects = async function (conn) {
  try {
    const query = "SELECT * FROM projects";
    const data = await asyncQuery(conn, query);

    return data;
  } catch (error) {
    throw error;
  }
};

exports.deleteProject = async function (conn, pid) {
  try {
    const query = "DELETE FROM projects WHERE pid = ?";
    await conn.execute(query, [pid]);
  } catch (error) {
    throw error;
  }
};

exports.updateProject = async function (conn, pid, data) {
  try {
    const query = `UPDATE projects SET
       title = ?, startDate = ?, status = ?, milestoneTitle = ?, milestoneDate = ?, milestoneUsers = ?, githubRepo = ?
       WHERE pid = ?
    `;

    await conn.execute(query, [
      data.title,
      data.date,
      data.status,
      data.milestoneTitle || null,
      data.milestoneDate || null,
      data.milestoneUsers || null,
      data.githubRepo || null,
      pid,
    ]);
  } catch (error) {
    throw error;
  }
};

function asyncQuery(conn, query) {
  return new Promise(function (res, rej) {
    conn.query(query, function (err, rows, fields) {
      if (err) {
        return rej(err);
      }

      res(rows);
    });
  });
}
