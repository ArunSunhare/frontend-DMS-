import React, { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';

const ViewPage: React.FC = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
      const db = new SQL.Database();
      db.run(`CREATE TABLE IF NOT EXISTS users1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        role TEXT,
        commandNumber INTEGER
      );`);
      setDb(db);
      console.log(db)
      const result = db.exec('SELECT * FROM users1');
      console.log(result);
      if (result.length > 0) {
        const cols = result[0].columns;
        const values = result[0].values;
        const formatted = values.map(row => Object.fromEntries(cols.map((col, i) => [col, row[i]])));
        setRows(formatted);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Command Number</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t">
              <td>{row.id}</td>
              <td>{row.username}</td>
              <td>{row.password}</td>
              <td>{row.role}</td>
              <td>{row.commandNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewPage;
