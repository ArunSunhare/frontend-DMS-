import React, { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';

const InsertPage: React.FC = () => {
  const [SQL, setSQL] = useState<any>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [commandNumber, setCommandNumber] = useState('');
  const [numEntries, setNumEntries] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const SQL = await initSqlJs({
        locateFile: file => `/sql-wasm.wasm`
      });
      const db = new SQL.Database();
      db.run(`CREATE TABLE IF NOT EXISTS users1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        role TEXT,
        commandNumber INTEGER
      );`);
      setSQL(SQL);
      setDb(db);
    })();
  }, []);

  const handleInsert = () => {
    const cmd = parseInt(commandNumber);
    const count = parseInt(numEntries);
    if (!db || isNaN(cmd) || isNaN(count)) return;
    console.log(db)
    db.run('BEGIN TRANSACTION;');
    for (let i = 1; i <= count; i++) {
      const username = `operator_${cmd}_${i}`;
      const password = '1234';
      console.log(username)
      const role = 'OPERATOR';
      db.run(
        'INSERT INTO users1 (username, password, role, commandNumber) VALUES (?, ?, ?, ?)',
        [username, password, role, cmd]
      );
    }
    db.run('COMMIT;');
    setMessage(`Inserted ${count} users in command ${cmd}.`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Insert Operators</h1>
      <input
        type="number"
        placeholder="Command Number"
        value={commandNumber}
        onChange={(e) => setCommandNumber(e.target.value)}
        className="border p-2 mb-2 mr-2"
      />
      <input
        type="number"
        placeholder="Number of Entries"
        value={numEntries}
        onChange={(e) => setNumEntries(e.target.value)}
        className="border p-2 mb-2"
      />
      <button
        onClick={handleInsert}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
      >
        Insert
      </button>
      <p className="mt-4 text-green-700">{message}</p>
    </div>
  );
};

export default InsertPage;
