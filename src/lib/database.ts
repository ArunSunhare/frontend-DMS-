// import initSqlJs, { Database } from 'sql.js';
// import bcrypt from 'bcryptjs';
// import { v4 as uuidv4 } from 'uuid';


// export interface User {
//  id: string;
//  username: string;
//  password: string;
//  role: 'ADMINISTRATOR' | 'CONTROLLER' | 'OPERATOR'
//  commandNumber: number;
//  // Registration data fields - UPDATED to match form
//  operatorCategory?: string;
//  operatorCategoryName?: string;
//  command?: string;
//  commandName?: string;
//  division?: string;
//  divisionName?: string;
//  brigade?: string;
//  brigadeName?: string;
//  corps?: string;
//  corpsName?: string;
//  unit?: string;
//  createdAt?: string;
// }


// // Updated interface for drone specifications with all new fields
// export interface DroneSpec {
//  id: string;
//  user_id: string;
//  droneName: string;
//  droneIds: string[]; // Array of drone IDs
//  quantity: number;
//  frequency: number;
//  clockDrift: number;
//  spectralLeakage: number;
//  modularshapeId: number;
//  maxHeight: number;
//  maxSpeed: number;
//  maxRange: number;
//  maxDuration: number;
//  gpsEnabled: string;
//  autonomous: string;
//  controlled: string;
//  cameraEnabled: string;
//  cameraResolution?: string;
//  operatingFrequency?: string;
//  createdAt: string;
// }


// // Interface for individual drone IDs (for database storage)
// export interface DroneId {
//  id: string;
//  drone_spec_id: string;
//  drone_id: string;
// }


// export interface Flight {
//  id: string;
//  user_id: string;
//  drone_model: string;
//  drone_class: string;
//  command_name: string;
//  frequency: number;
//  clockDrift: number;
//  spectralLeakage: number;
//  modularshapeId: number;
//  purpose: string;
//  start: string;
//  end: string;
//  status: 'planned' | 'active' | 'completed';
//  cancel_requested: boolean;
// }


// export interface Waypoint {
//  flight_id: string;
//  lat: number;
//  lng: number;
//  elev: number;
//  sequence: number;
// }


// // Updated interface for registration data to match your form's actual output
// export interface RegistrationData {
//  username: string;
//  password: string;
//  operatorCategory: {
//    key: string;
//    name: string;
//  };
//  command: {
//    key: string;
//    name: string;
//  };
//  division: {
//    key: string;
//    name: string;
//  };
//  brigade: {
//    key: string;
//    name: string;
//  };
//  corps: {
//    key: string;
//    name: string;
//  };
//  unit: string;
//  droneSpecs: {
//    droneName: string;
//    droneIds: string[];
//    quantity: number;
//    frequency: number;
//    clockDrift: number;
//    spectralLeakage: number;
//    modularshapeId: number;
//    maxHeight: number;
//    maxSpeed: number;
//    maxRange: number;
//    maxDuration: number;
//    gpsEnabled: string;
//    autonomous: string;
//    controlled: string;
//    cameraEnabled: string;
//    cameraResolution?: string;
//    operatingFrequency?: string;
//  }[];
// }


// class DatabaseManager {
//  private db: Database | null = null;
//  private initialized = false;


//  /** Call once at startup */
//  async initialize() {
//    if (this.initialized) return;


//    const SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
//    const saved = localStorage.getItem('dms_database');


//    if (saved) {
//      console.log("Running saved");
//      const data = new Uint8Array(JSON.parse(saved));
//      this.db = new SQL.Database(data);
//      await this.migrateSchema();
//    } else {
//      console.log("Running else");
//      this.db = new SQL.Database();
//      await this.createTables();
//      await this.seedData();
//      this.save();
//    }


//    this.activateDueFlights();
//    this.initialized = true;
//    console.log('DB initialized');
//  }


//  /** Add new columns if needed */
//  private async migrateSchema() {
//    if (!this.db) throw new Error('DB not initialized');
 
//    // Check flights table
//    const flightInfo = this.db.prepare(`PRAGMA table_info('flights')`);
//    const flightCols = new Set<string>();
//    while (flightInfo.step()) {
//      flightCols.add((flightInfo.getAsObject() as any).name);
//    }
//    flightInfo.free();


//    if (!flightCols.has('drone_class')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN drone_class TEXT NOT NULL DEFAULT 'UNKNOWN'`);
//    }
//    if (!flightCols.has('cancel_requested')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN cancel_requested INTEGER NOT NULL DEFAULT 0`);
//    }
//    if (!flightCols.has('command_name')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN command_name TEXT NOT NULL DEFAULT ''`);
//    }
//    // Add missing flight fields for collision detection
//    if (!flightCols.has('clockDrift')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN clockDrift REAL NOT NULL DEFAULT 0`);
//    }
//    if (!flightCols.has('spectralLeakage')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN spectralLeakage REAL NOT NULL DEFAULT 0`);
//    }
//    if (!flightCols.has('modularshapeId')) {
//      this.db.run(`ALTER TABLE flights ADD COLUMN modularshapeId INTEGER NOT NULL DEFAULT 0`);
//    }


//    // Check users table for new columns
//    const userInfo = this.db.prepare(`PRAGMA table_info('users')`);
//    const userCols = new Set<string>();
//    while (userInfo.step()) {
//      userCols.add((userInfo.getAsObject() as any).name);
//    }
//    userInfo.free();


//    // Add all user registration fields with both keys and names
//    const userFields = [
//      'operatorCategory', 'operatorCategoryName',
//      'command', 'commandName',
//      'division', 'divisionName',
//      'brigade', 'brigadeName',
//      'corps', 'corpsName',
//      'unit', 'command_number', 'createdAt'
//    ];
  
//    for (const field of userFields) {
//      if (!userCols.has(field)) {
//        if (field === 'command_number') {
//          this.db.run(`ALTER TABLE users ADD COLUMN ${field} INTEGER DEFAULT 1`);
//        } else if (field === 'createdAt') {
//          this.db.run(`ALTER TABLE users ADD COLUMN ${field} DATETIME DEFAULT CURRENT_TIMESTAMP`);
//        } else {
//          this.db.run(`ALTER TABLE users ADD COLUMN ${field} TEXT`);
//        }
//      }
//    }


//    // Check if drone_specs table exists and has all required columns
//    const tables = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='drone_specs'`);
//    const hasTable = tables.step();
//    tables.free();
 
//    if (!hasTable) {
//      this.db.run(`
//        CREATE TABLE drone_specs (
//          id TEXT PRIMARY KEY,
//          user_id TEXT NOT NULL,
//          droneName TEXT NOT NULL,
//          quantity INTEGER NOT NULL,
//          frequency REAL NOT NULL,
//          clockDrift REAL NOT NULL DEFAULT 0,
//          spectralLeakage REAL NOT NULL DEFAULT 0,
//          modularshapeId INTEGER NOT NULL DEFAULT 0,
//          maxHeight REAL NOT NULL,
//          maxSpeed REAL NOT NULL,
//          maxRange REAL NOT NULL,
//          maxDuration INTEGER NOT NULL,
//          gpsEnabled TEXT NOT NULL,
//          autonomous TEXT NOT NULL,
//          controlled TEXT NOT NULL,
//          cameraEnabled TEXT NOT NULL,
//          cameraResolution TEXT DEFAULT '',
//          operatingFrequency TEXT DEFAULT '',
//          createdAt DATETIME NOT NULL,
//          FOREIGN KEY (user_id) REFERENCES users(id)
//        );
//      `);
//    } else {
//      // Check if drone_specs table has all new columns
//      const droneSpecInfo = this.db.prepare(`PRAGMA table_info('drone_specs')`);
//      const droneSpecCols = new Set<string>();
//      while (droneSpecInfo.step()) {
//        droneSpecCols.add((droneSpecInfo.getAsObject() as any).name);
//      }
//      droneSpecInfo.free();


//      // Add missing columns to drone_specs
//      const droneSpecFields = [
//        { name: 'clockDrift', type: 'REAL NOT NULL DEFAULT 0' },
//        { name: 'spectralLeakage', type: 'REAL NOT NULL DEFAULT 0' },
//        { name: 'modularshapeId', type: 'INTEGER NOT NULL DEFAULT 0' }
//      ];


//      for (const field of droneSpecFields) {
//        if (!droneSpecCols.has(field.name)) {
//          this.db.run(`ALTER TABLE drone_specs ADD COLUMN ${field.name} ${field.type}`);
//        }
//      }
//    }


//    // Check if drone_ids table exists
//    const droneIdsTable = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='drone_ids'`);
//    const hasDroneIdsTable = droneIdsTable.step();
//    droneIdsTable.free();
 
//    if (!hasDroneIdsTable) {
//      this.db.run(`
//        CREATE TABLE drone_ids (
//          id TEXT PRIMARY KEY,
//          drone_spec_id TEXT NOT NULL,
//          drone_id TEXT NOT NULL,
//          FOREIGN KEY (drone_spec_id) REFERENCES drone_specs(id) ON DELETE CASCADE
//        );
//      `);
//    }


//    this.save();
//  }


//  private async createTables() {
//    if (!this.db) throw new Error('DB not initialized');
 
//    // Users table with all registration fields (both keys and names)
//    this.db.run(`
//      CREATE TABLE users (
//        id TEXT PRIMARY KEY,
//        username TEXT UNIQUE NOT NULL,
//        password TEXT NOT NULL,
//        role TEXT NOT NULL DEFAULT 'OPERATOR',
//        command_number INTEGER DEFAULT 1,
//        operatorCategory TEXT,
//        operatorCategoryName TEXT,
//        command TEXT,
//        commandName TEXT,
//        division TEXT,
//        divisionName TEXT,
//        brigade TEXT,
//        brigadeName TEXT,
//        corps TEXT,
//        corpsName TEXT,
//        unit TEXT,
//        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//      );
//    `);


//    // Drone specifications table with all new fields
//    this.db.run(`
//      CREATE TABLE drone_specs (
//        id TEXT PRIMARY KEY,
//        user_id TEXT NOT NULL,
//        droneName TEXT NOT NULL,
//        quantity INTEGER NOT NULL,
//        frequency REAL NOT NULL,
//        clockDrift REAL NOT NULL DEFAULT 0,
//        spectralLeakage REAL NOT NULL DEFAULT 0,
//        modularshapeId INTEGER NOT NULL DEFAULT 0,
//        maxHeight REAL NOT NULL,
//        maxSpeed REAL NOT NULL,
//        maxRange REAL NOT NULL,
//        maxDuration INTEGER NOT NULL,
//        gpsEnabled TEXT NOT NULL,
//        autonomous TEXT NOT NULL,
//        controlled TEXT NOT NULL,
//        cameraEnabled TEXT NOT NULL,
//        cameraResolution TEXT DEFAULT '',
//        operatingFrequency TEXT DEFAULT '',
//        createdAt DATETIME NOT NULL,
//        FOREIGN KEY (user_id) REFERENCES users(id)
//      );
//    `);


//    // Separate table for drone IDs (allows multiple IDs per spec)
//    this.db.run(`
//      CREATE TABLE drone_ids (
//        id TEXT PRIMARY KEY,
//        drone_spec_id TEXT NOT NULL,
//        drone_id TEXT NOT NULL,
//        FOREIGN KEY (drone_spec_id) REFERENCES drone_specs(id) ON DELETE CASCADE
//      );
//    `);


//    // Updated flights table with all required fields
//    this.db.run(`
//      CREATE TABLE flights (
//        id TEXT PRIMARY KEY,
//        user_id TEXT NOT NULL,
//        drone_model TEXT NOT NULL,
//        drone_class TEXT NOT NULL,
//        command_name TEXT NOT NULL DEFAULT '',
//        frequency REAL NOT NULL,
//        clockDrift REAL NOT NULL DEFAULT 0,
//        spectralLeakage REAL NOT NULL DEFAULT 0,
//        modularshapeId INTEGER NOT NULL DEFAULT 0,
//        purpose TEXT NOT NULL,
//        start DATETIME NOT NULL,
//        end DATETIME NOT NULL,
//        status TEXT NOT NULL DEFAULT 'planned',
//        cancel_requested INTEGER NOT NULL DEFAULT 0,
//        FOREIGN KEY (user_id) REFERENCES users(id)
//      );
//    `);
 
//    this.db.run(`
//      CREATE TABLE waypoints (
//        flight_id TEXT NOT NULL,
//        lat REAL NOT NULL,
//        lng REAL NOT NULL,
//        elev INTEGER NOT NULL,
//        sequence INTEGER NOT NULL,
//        FOREIGN KEY (flight_id) REFERENCES flights(id)
//      );
//    `);
//  }


//  private async seedData() {
//    if (!this.db) throw new Error('DB not initialized');
 
//    const adminId = uuidv4(), controllerId = uuidv4(), userId = uuidv4();
//    const adminPwd = await bcrypt.hash('admin123', 10);
//    const controllerPwd = await bcrypt.hash('controller123', 10);
//    const userPwd = await bcrypt.hash('user123', 10);
//    const now = new Date().toISOString();
 
//    console.log("Seeding initial users");
 
//    // Admin user
//    this.db.run(
//      `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, createdAt)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//      [adminId, 'admin', adminPwd, 'ADMINISTRATOR', 1, 'a', 'Army', 'ec', 'Eastern Command', 'ar', 'HQ 3 CORPS', 'bde1', 'HQ 2 MNT DIV', 'cor36', '2 ARTY BDE', 'HQ ADMIN UNIT', now]
//    );
 
//    // Controller user
//    this.db.run(
//      `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, createdAt)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//      [controllerId, 'controller', controllerPwd, 'CONTROLLER', 2, 'a', 'Army', 'wc', 'Western Command', 'ar', 'HQ 2 CORPS', 'bde2', 'HQ 9 INF DIV', 'cor77', '9 ARTY BDE', 'HQ CONTROL UNIT', now]
//    );
 
//    // Default operator user
//    this.db.run(
//      `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, createdAt)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//      [userId, '67GR', userPwd, 'OPERATOR', 3, 'a', 'Army', 'sc', 'Southern Command', 'ar', 'HQ 12 CORPS', 'bde2', '11 RAPID', 'cor5', '31 INF BDE', '67 FIELD REGIMENT', now]
//    );


//    // Add sample drone specs for the default user with all new fields
//    const droneSpecId = uuidv4();
//    this.db.run(
//      `INSERT INTO drone_specs
//       (id, user_id, droneName, quantity, frequency, clockDrift, spectralLeakage, modularshapeId, maxHeight, maxSpeed,
//        maxRange, maxDuration, gpsEnabled, autonomous, controlled, cameraEnabled, cameraResolution,
//        operatingFrequency, createdAt)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//      [
//        droneSpecId, userId, 'MQ-9 Reaper', 1, 1090.0, 0.1, 0.2, 1, 15000, 50,
//        100, 120, 'yes', 'yes', 'yes', 'yes', '4K', '2.4 GHz to 5.8 GHz', now
//      ]
//    );


//    // Add drone IDs for the spec
//    const droneIdEntry = uuidv4();
//    this.db.run(
//      `INSERT INTO drone_ids (id, drone_spec_id, drone_id) VALUES (?, ?, ?)`,
//      [droneIdEntry, droneSpecId, 'DR-001-MQ9']
//    );


//    const flightId = uuidv4();
//    const later = new Date(new Date().getTime() + 2*60*60*1000);
 
//    this.db.run(
//      `INSERT INTO flights
//         (id, user_id, drone_model, drone_class, command_name, frequency, clockDrift, spectralLeakage, modularshapeId, purpose, start, end, status, cancel_requested)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//      [
//        flightId, userId,
//        'MQ-9 Reaper','MEDIUM','SOUTHERN COMMAND', 1090.0, 0.1, 0.2, 1,
//        'Recon Alpha',
//        now,
//        later.toISOString(),
//        'active', 0
//      ]
//    );
 
//    const wps = [
//      { lat:28.6139,lng:77.2090,elev:1000 },
//      { lat:28.7041,lng:77.1025,elev:1200 },
//      { lat:28.5355,lng:77.3910,elev:1100 },
//    ];
 
//    wps.forEach((wp,i) => {
//      this.db!.run(
//        `INSERT INTO waypoints (flight_id, lat, lng, elev, sequence) VALUES (?, ?, ?, ?, ?)`,
//        [flightId, wp.lat, wp.lng, wp.elev, i+1]
//      );
//    });
//  }


//  // UPDATED METHOD: Register user with full registration data including multiple drones
//  async registerUser(registrationData: RegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
//    if (!this.db) throw new Error('DB not initialized');


//    try {
//      // Check if username already exists
//      const existingUser = this.db.prepare(`SELECT username FROM users WHERE username = ?`);
//      existingUser.bind([registrationData.username]);
//      if (existingUser.step()) {
//        existingUser.free();
//        return { success: false, message: 'Username already exists' };
//      }
//      existingUser.free();


//      // Hash password
//      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
   
//      // Generate user ID
//      const userId = uuidv4();
   
//      // Get next command number
//      const commandNumberStmt = this.db.prepare(`SELECT MAX(command_number) as maxNum FROM users`);
//      commandNumberStmt.step();
//      const result = commandNumberStmt.getAsObject() as { maxNum: number };
//      const nextCommandNumber = (result.maxNum || 0) + 1;
//      commandNumberStmt.free();


//      // Insert user with ALL registration data (both keys and names)
//      this.db.run(
//        `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, createdAt)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//        [
//          userId,
//          registrationData.username,
//          hashedPassword,
//          'OPERATOR',
//          nextCommandNumber,
//          registrationData.operatorCategory.key,
//          registrationData.operatorCategory.name,
//          registrationData.command.key,
//          registrationData.command.name,
//          registrationData.division.key,
//          registrationData.division.name,
//          registrationData.brigade.key,
//          registrationData.brigade.name,
//          registrationData.corps.key,
//          registrationData.corps.name,
//          registrationData.unit,
//          new Date().toISOString()
//        ]
//      );


//      // Insert multiple drone specifications with all new fields
//      for (const droneSpec of registrationData.droneSpecs) {
//        const droneSpecId = uuidv4();
      
//        // Insert drone spec with all fields including the new ones
//        this.db.run(
//          `INSERT INTO drone_specs
//           (id, user_id, droneName, quantity, frequency, clockDrift, spectralLeakage, modularshapeId, maxHeight, maxSpeed,
//            maxRange, maxDuration, gpsEnabled, autonomous, controlled, cameraEnabled, cameraResolution,
//            operatingFrequency, createdAt)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//          [
//            droneSpecId,
//            userId,
//            droneSpec.droneName,
//            droneSpec.quantity,
//            droneSpec.frequency,
//            droneSpec.clockDrift,
//            droneSpec.spectralLeakage,
//            droneSpec.modularshapeId,
//            droneSpec.maxHeight,
//            droneSpec.maxSpeed,
//            droneSpec.maxRange,
//            droneSpec.maxDuration,
//            droneSpec.gpsEnabled,
//            droneSpec.autonomous,
//            droneSpec.controlled,
//            droneSpec.cameraEnabled,
//            droneSpec.cameraResolution || '',
//            droneSpec.operatingFrequency || '',
//            new Date().toISOString()
//          ]
//        );


//        // Insert multiple drone IDs for this spec
//        for (const droneId of droneSpec.droneIds) {
//          if (droneId.trim()) { // Only insert non-empty IDs
//            const droneIdRecordId = uuidv4();
//            this.db.run(
//              `INSERT INTO drone_ids (id, drone_spec_id, drone_id) VALUES (?, ?, ?)`,
//              [droneIdRecordId, droneSpecId, droneId.trim()]
//            );
//          }
//        }
//      }


//      this.save();
//      return { success: true, message: 'Registration successful', userId };


//    } catch (error) {
//      console.error('Registration failed:', error);
//      return { success: false, message: 'Registration failed due to an error' };
//    }
//  }


//  // UPDATED METHOD: Get user's drone specifications with drone IDs
//  getUserDroneSpecs(userId: string): DroneSpec[] {
//    if (!this.db) return [];
 
//    const stmt = this.db.prepare(`SELECT * FROM drone_specs WHERE user_id = ? ORDER BY createdAt DESC`);
//    stmt.bind([userId]);
 
//    const specs: DroneSpec[] = [];
//    while (stmt.step()) {
//      const r = stmt.getAsObject() as any;
    
//      // Get drone IDs for this spec
//      const droneIdsStmt = this.db.prepare(`SELECT drone_id FROM drone_ids WHERE drone_spec_id = ?`);
//      droneIdsStmt.bind([r.id]);
//      const droneIds: string[] = [];
//      while (droneIdsStmt.step()) {
//        const idRow = droneIdsStmt.getAsObject() as any;
//        droneIds.push(idRow.drone_id);
//      }
//      droneIdsStmt.free();


//      specs.push({
//        id: r.id,
//        user_id: r.user_id,
//        droneName: r.droneName,
//        droneIds: droneIds,
//        quantity: r.quantity,
//        frequency: r.frequency,
//        clockDrift: r.clockDrift || 0,
//        spectralLeakage: r.spectralLeakage || 0,
//        modularshapeId: r.modularshapeId || 0,
//        maxHeight: r.maxHeight,
//        maxSpeed: r.maxSpeed,
//        maxRange: r.maxRange,
//        maxDuration: r.maxDuration,
//        gpsEnabled: r.gpsEnabled,
//        autonomous: r.autonomous,
//        controlled: r.controlled,
//        cameraEnabled: r.cameraEnabled,
//        cameraResolution: r.cameraResolution,
//        operatingFrequency: r.operatingFrequency,
//        createdAt: r.createdAt
//      });
//    }
//    stmt.free();
//    return specs;
//  }


//  // UPDATED METHOD: Get all users with their registration data
//  getAllUsers(): User[] {
//    if (!this.db) return [];
  
//    const stmt = this.db.prepare(`SELECT * FROM users ORDER BY createdAt DESC`);
//    const users: User[] = [];
  
//    while (stmt.step()) {
//      const r = stmt.getAsObject() as any;
//      users.push({
//        id: r.id,
//        username: r.username,
//        password: r.password, // In real app, don't return password
//        role: r.role,
//        commandNumber: r.command_number,
//        operatorCategory: r.operatorCategory,
//        operatorCategoryName: r.operatorCategoryName,
//        command: r.command,
//        commandName: r.commandName,
//        division: r.division,
//        divisionName: r.divisionName,
//        brigade: r.brigade,
//        brigadeName: r.brigadeName,
//        corps: r.corps,
//        corpsName: r.corpsName,
//        unit: r.unit,
//        createdAt: r.createdAt
//      });
//    }
//    stmt.free();
//    return users;
//  }


//  // UPDATED METHOD: Get user details by ID
//  getUserById(userId: string): User | null {
//    if (!this.db) return null;
  
//    const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
//    stmt.bind([userId]);
  
//    if (stmt.step()) {
//      const r = stmt.getAsObject() as any;
//      stmt.free();
//      return {
//        id: r.id,
//        username: r.username,
//        password: r.password,
//        role: r.role,
//        commandNumber: r.command_number,
//        operatorCategory: r.operatorCategory,
//        operatorCategoryName: r.operatorCategoryName,
//        command: r.command,
//        commandName: r.commandName,
//        division: r.division,
//        divisionName: r.divisionName,
//        brigade: r.brigade,
//        brigadeName: r.brigadeName,
//        corps: r.corps,
//        corpsName: r.corpsName,
//        unit: r.unit,
//        createdAt: r.createdAt
//      };
//    }
//    stmt.free();
//    return null;
//  }


//  // UPDATED METHOD: Get all drone specs for admin view
//  getAllDroneSpecs(): (DroneSpec & { username: string; userUnit: string })[] {
//    if (!this.db) return [];
  
//    const stmt = this.db.prepare(`
//      SELECT ds.*, u.username, u.unit as userUnit
//      FROM drone_specs ds
//      JOIN users u ON ds.user_id = u.id
//      ORDER BY ds.createdAt DESC
//    `);
  
//    const specs: (DroneSpec & { username: string; userUnit: string })[] = [];
//    while (stmt.step()) {
//      const r = stmt.getAsObject() as any;
    
//      // Get drone IDs for this spec
//      const droneIdsStmt = this.db.prepare(`SELECT drone_id FROM drone_ids WHERE drone_spec_id = ?`);
//      droneIdsStmt.bind([r.id]);
//      const droneIds: string[] = [];
//      while (droneIdsStmt.step()) {
//        const idRow = droneIdsStmt.getAsObject() as any;
//        droneIds.push(idRow.drone_id);
//      }
//      droneIdsStmt.free();


//      specs.push({
//        id: r.id,
//        user_id: r.user_id,
//        droneName: r.droneName,
//        droneIds: droneIds,
//        quantity: r.quantity,
//        frequency: r.frequency,
//        clockDrift: r.clockDrift || 0,
//        spectralLeakage: r.spectralLeakage || 0,
//        modularshapeId: r.modularshapeId || 0,
//        maxHeight: r.maxHeight,
//        maxSpeed: r.maxSpeed,
//        maxRange: r.maxRange,
//        maxDuration: r.maxDuration,
//        gpsEnabled: r.gpsEnabled,
//        autonomous: r.autonomous,
//        controlled: r.controlled,
//        cameraEnabled: r.cameraEnabled,
//        cameraResolution: r.cameraResolution,
//        operatingFrequency: r.operatingFrequency,
//        createdAt: r.createdAt,
//        username: r.username,
//        userUnit: r.userUnit
//      });
//    }
//    stmt.free();
//    return specs;
//  }


//  save() {
//    if (!this.db) return;
//    localStorage.setItem('dms_database', JSON.stringify(Array.from(this.db.export())));
//  }


//  activateDueFlights() {
//    if (!this.db) throw new Error('DB not initialized');
//    const nowIso = new Date().toISOString();
//    this.db.run(
//      `UPDATE flights SET status='active' WHERE status='planned' AND start <= ?`,
//      [nowIso]
//    );
//    this.save();
//  }


//  requestCancelFlight(flightId:string) {
//    if (!this.db) throw new Error('DB not initialized');
//    this.db.run(`UPDATE flights SET cancel_requested=1 WHERE id=?`, [flightId]);
//    this.save();
//  }


//  deleteFlight(flightId:string) {
//    if (!this.db) throw new Error('DB not initialized');
//    this.db.run(`DELETE FROM waypoints WHERE flight_id=?`, [flightId]);
//    this.db.run(`DELETE FROM flights WHERE id=?`, [flightId]);
//    this.save();
//  }


//  // ADD: Missing updateFlight method referenced in UserDashboard
//  updateFlight(flightId: string, updates: {
//    drone_model?: string;
//    command_name?: string;
//    purpose?: string;
//    start?: string;
//    end?: string;
//  }) {
//    if (!this.db) throw new Error('DB not initialized');
  
//    const updateFields: string[] = [];
//    const updateValues: any[] = [];
  
//    if (updates.drone_model !== undefined) {
//      updateFields.push('drone_model = ?');
//      updateValues.push(updates.drone_model);
//    }
//    if (updates.command_name !== undefined) {
//      updateFields.push('command_name = ?');
//      updateValues.push(updates.command_name);
//    }
//    if (updates.purpose !== undefined) {
//      updateFields.push('purpose = ?');
//      updateValues.push(updates.purpose);
//    }
//    if (updates.start !== undefined) {
//      updateFields.push('start = ?');
//      updateValues.push(updates.start);
//    }
//    if (updates.end !== undefined) {
//      updateFields.push('end = ?');
//      updateValues.push(updates.end);
//    }
  
//    if (updateFields.length === 0) return;
  
//    updateValues.push(flightId);
  
//    const sql = `UPDATE flights SET ${updateFields.join(', ')} WHERE id = ?`;
//    this.db.run(sql, updateValues);
//    this.save();
//  }


//  runQuery(sql:string):any[] {
//    if (!this.db) throw new Error('DB not initialized');
//    const stmt = this.db.prepare(sql), rows:any[]=[];
//    while(stmt.step()) rows.push(stmt.getAsObject());
//    stmt.free();
//    return rows;
//  }


//  // UPDATED: authenticateUser to include new fields
//  async authenticateUser(username:string,password:string) {
//    if (!this.db) throw new Error('DB not initialized');
//    const stmt = this.db.prepare(`SELECT * FROM users WHERE username=?`);
//    stmt.bind([username]);
//    if (stmt.step()) {
//      const r = stmt.getAsObject();
//      if (await bcrypt.compare(password, r.password as string)) {
//        stmt.free();
//        return {
//          success:true,
//          user: {
//            id: r.id,
//            username: r.username,
//            role: r.role,
//            commandNumber: r.command_number,
//            operatorCategory: r.operatorCategory,
//            operatorCategoryName: r.operatorCategoryName,
//            command: r.command,
//            commandName: r.commandName,
//            division: r.division,
//            divisionName: r.divisionName,
//            brigade: r.brigade,
//            brigadeName: r.brigadeName,
//            corps: r.corps,
//            corpsName: r.corpsName,
//            unit: r.unit,
//            createdAt: r.createdAt
//          } as User
//        };
//      }
//    }
//    stmt.free();
//    return { success:false, user:{} as User };
//  }


//  getAllFlights():Flight[] {
//    this.activateDueFlights();
//    if (!this.db) return [];
//    const stmt = this.db.prepare(`SELECT * FROM flights ORDER BY start DESC`);
//    const out:Flight[] = [];
//    while(stmt.step()) {
//      const r = stmt.getAsObject() as any;
//      out.push({
//        id: r.id,
//        user_id: r.user_id,
//        drone_model: r.drone_model,
//        drone_class: r.drone_class,
//        command_name: r.command_name,
//        frequency: r.frequency,
//        clockDrift: r.clockDrift || 0,
//        spectralLeakage: r.spectralLeakage || 0,
//        modularshapeId: r.modularshapeId || 0,
//        purpose: r.purpose,
//        start: r.start,
//        end: r.end,
//        status: r.status,
//        cancel_requested: Boolean(r.cancel_requested)
//      });
//    }
//    stmt.free();
//    return out;
//  }


//  getFlightWaypoints(flightId:string):Waypoint[] {
//    if (!this.db) return [];
//    const stmt = this.db.prepare(
//      `SELECT * FROM waypoints WHERE flight_id=? ORDER BY sequence`
//    );
//    stmt.bind([flightId]);
//    const wps:Waypoint[] = [];
//    while(stmt.step()) {
//      const r = stmt.getAsObject() as any;
//      wps.push({
//        flight_id: r.flight_id,
//        lat: r.lat,
//        lng: r.lng,
//        elev: r.elev,
//        sequence: r.sequence
//      });
//    }
//    stmt.free();
//    return wps;
//  }


//  createFlight(
//    flight:Omit<Flight,'id'|'cancel_requested'>,
//    waypoints:Omit<Waypoint,'flight_id'>[]
//  ):string {
//    if (!this.db) throw new Error('DB not initialized');
//    const id = uuidv4();
//    this.db.run(
//      `INSERT INTO flights
//        (id,user_id,drone_model,drone_class,command_name,frequency,clockDrift,spectralLeakage,modularshapeId,purpose,start,end,status,cancel_requested)
//       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//      [
//        id,
//        flight.user_id,
//        flight.drone_model,
//        flight.drone_class,
//        flight.command_name,
//        flight.frequency,
//        flight.clockDrift,
//        flight.spectralLeakage,
//        flight.modularshapeId,
//        flight.purpose,
//        flight.start,
//        flight.end,
//        flight.status,
//        0
//      ]
//    );
//    waypoints.forEach((wp,i) => {
//      this.db!.run(
//        `INSERT INTO waypoints (flight_id,lat,lng,elev,sequence) VALUES(?,?,?,?,?)`,
//        [id, wp.lat, wp.lng, wp.elev, i+1]
//      );
//    });
//    this.save();
//    return id;
//  }


//  checkCollision(newWp:{lat:number;lng:number;elev:number},_s:string,_e:string):boolean {
//    const fls = this.getAllFlights().filter(f=>f.status!=='completed');
//    for(const f of fls){
//      for(const wp of this.getFlightWaypoints(f.id)){
//        const d = this.haversineDistance(newWp.lat,newWp.lng,wp.lat,wp.lng);
//        const a = Math.abs(newWp.elev - wp.elev);
//        if(d<5 && a<300) return true;
//      }
//    }
//    return false;
//  }


//  private haversineDistance(lat1:number,lon1:number,lat2:number,lon2:number):number {
//    const R=3440.065;
//    const dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
//    const a = Math.sin(dLat/2)**2 +
//              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
//    return R * 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
//  }
// }


// export const dbManager = new DatabaseManager();
// if (typeof window !== 'undefined') (window as any).dbManager = dbManager;



import initSqlJs, { Database } from 'sql.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Updated User interface with new RBAC roles and all required fields
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'SUPER_ADMIN' | 'COMMAND_ADMIN' | 'CONTROLLER' | 'OPERATOR'; // Updated roles
  commandNumber: number;
  // Registration data fields - UPDATED to match form
  operatorCategory?: string;
  operatorCategoryName?: string;
  command?: string;
  commandName?: string;
  division?: string;
  divisionName?: string;
  brigade?: string;
  brigadeName?: string;
  corps?: string;
  corpsName?: string;
  unit?: string;
  // New RBAC fields
  assigned_command?: string;        // Command that admin manages
  can_access_all_commands?: boolean; // Super admin flag
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Role permissions object
  rolePermissions?: {
    canAccessAllCommands: boolean;
    assignedCommand?: string;
    assignedCommandName?: string;
  };
}

// Updated interface for drone specifications with command association
export interface DroneSpec {
  id: string;
  user_id: string;
  droneName: string;
  droneIds: string[]; // Array of drone IDs
  quantity: number;
  frequency: number;
  clockDrift: number;
  spectralLeakage: number;
  modularshapeId: number;
  maxHeight: number;
  maxSpeed: number;
  maxRange: number;
  maxDuration: number;
  gpsEnabled: string;
  autonomous: string;
  controlled: string;
  cameraEnabled: string;
  cameraResolution?: string;
  operatingFrequency?: string;
  command_code?: string; // New field for command association
  createdAt: string;
}

// Interface for individual drone IDs (for database storage)
export interface DroneId {
  id: string;
  drone_spec_id: string;
  drone_id: string;
}

// Updated Flight interface with command association
export interface Flight {
  id: string;
  user_id: string;
  drone_model: string;
  drone_class: string;
  command_name: string;
  command_code?: string; // New field for command association
  frequency: number;
  clockDrift: number;
  spectralLeakage: number;
  modularshapeId: number;
  purpose: string;
  start: string;
  end: string;
  status: 'planned' | 'active' | 'completed';
  cancel_requested: boolean;
  approved_by?: string; // New field for approval tracking
}

export interface Waypoint {
  flight_id: string;
  lat: number;
  lng: number;
  elev: number;
  sequence: number;
}

// Updated interface for registration data
export interface RegistrationData {
  username: string;
  password: string;
  role?: 'OPERATOR' | 'CONTROLLER' | 'COMMAND_ADMIN'; // Added role field
  operatorCategory: {
    key: string;
    name: string;
  };
  command: {
    key: string;
    name: string;
  };
  division: {
    key: string;
    name: string;
  };
  brigade: {
    key: string;
    name: string;
  };
  corps: {
    key: string;
    name: string;
  };
  unit: string;
  assignedCommand?: string; // For command admins
  droneSpecs: {
    droneName: string;
    droneIds: string[];
    quantity: number;
    frequency: number;
    clockDrift: number;
    spectralLeakage: number;
    modularshapeId: number;
    maxHeight: number;
    maxSpeed: number;
    maxRange: number;
    maxDuration: number;
    gpsEnabled: string;
    autonomous: string;
    controlled: string;
    cameraEnabled: string;
    cameraResolution?: string;
    operatingFrequency?: string;
  }[];
}

// Command hierarchy interface
export interface CommandHierarchy {
  id: string;
  command_code: string;
  command_name: string;
  command_full_name: string;
  headquarters_location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

class DatabaseManager {
  private db: Database | null = null;
  private initialized = false;

  /** Call once at startup */
  async initialize() {
    if (this.initialized) return;

    const SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
    const saved = localStorage.getItem('dms_database');

    if (saved) {
      console.log("Loading saved database");
      const data = new Uint8Array(JSON.parse(saved));
      this.db = new SQL.Database(data);
      await this.migrateSchema();
    } else {
      console.log("Creating new database");
      this.db = new SQL.Database();
      await this.createTables();
      await this.seedData();
      this.save();
    }

    this.activateDueFlights();
    this.initialized = true;
    console.log('Database initialized with RBAC support');
  }

  /** Add new columns and tables for RBAC */
  private async migrateSchema() {
    if (!this.db) throw new Error('DB not initialized');

    // Check users table for RBAC fields
    const userInfo = this.db.prepare(`PRAGMA table_info('users')`);
    const userCols = new Set<string>();
    while (userInfo.step()) {
      userCols.add((userInfo.getAsObject() as any).name);
    }
    userInfo.free();

    // Add RBAC fields to users table
    if (!userCols.has('assigned_command')) {
      this.db.run(`ALTER TABLE users ADD COLUMN assigned_command TEXT`);
    }
    if (!userCols.has('can_access_all_commands')) {
      this.db.run(`ALTER TABLE users ADD COLUMN can_access_all_commands INTEGER DEFAULT 0`);
    }
    if (!userCols.has('is_active')) {
      this.db.run(`ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1`);
    }
    if (!userCols.has('updatedAt')) {
      this.db.run(`ALTER TABLE users ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP`);
    }

    // Update existing admin user to SUPER_ADMIN
    this.db.run(`UPDATE users SET role = 'SUPER_ADMIN', can_access_all_commands = 1 WHERE role = 'ADMINISTRATOR'`);

    // Check drone_specs table for command_code
    const droneSpecInfo = this.db.prepare(`PRAGMA table_info('drone_specs')`);
    const droneSpecCols = new Set<string>();
    while (droneSpecInfo.step()) {
      droneSpecCols.add((droneSpecInfo.getAsObject() as any).name);
    }
    droneSpecInfo.free();

    if (!droneSpecCols.has('command_code')) {
      this.db.run(`ALTER TABLE drone_specs ADD COLUMN command_code TEXT`);
    }

    // Check flights table for RBAC fields
    const flightInfo = this.db.prepare(`PRAGMA table_info('flights')`);
    const flightCols = new Set<string>();
    while (flightInfo.step()) {
      flightCols.add((flightInfo.getAsObject() as any).name);
    }
    flightInfo.free();

    if (!flightCols.has('command_code')) {
      this.db.run(`ALTER TABLE flights ADD COLUMN command_code TEXT`);
    }
    if (!flightCols.has('approved_by')) {
      this.db.run(`ALTER TABLE flights ADD COLUMN approved_by TEXT`);
    }

    // Create command hierarchy table if it doesn't exist
    const tables = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='command_hierarchy'`);
    const hasCommandTable = tables.step();
    tables.free();

    if (!hasCommandTable) {
      this.db.run(`
        CREATE TABLE command_hierarchy (
          id TEXT PRIMARY KEY,
          command_code TEXT NOT NULL UNIQUE,
          command_name TEXT NOT NULL,
          command_full_name TEXT NOT NULL,
          headquarters_location TEXT,
          latitude REAL,
          longitude REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Insert command hierarchy data
      this.insertCommandHierarchy();
    }

    this.save();
  }

  private insertCommandHierarchy() {
    if (!this.db) return;

    const commands = [
      { code: 'ec', name: 'Eastern Command', fullName: 'EASTERN COMMAND', location: 'Kolkata', lat: 33.7738, lng: 76.5762 },
      { code: 'wc', name: 'Western Command', fullName: 'WESTERN COMMAND', location: 'Chandimandir', lat: 32.7266, lng: 74.8570 },
      { code: 'sc', name: 'Southern Command', fullName: 'SOUTHERN COMMAND', location: 'Pune', lat: 18.5204, lng: 73.8567 },
      { code: 'nc', name: 'Northern Command', fullName: 'NORTHERN COMMAND', location: 'Udhampur', lat: 34.0837, lng: 74.7973 },
      { code: 'swc', name: 'South Western Command', fullName: 'SOUTH WESTERN COMMAND', location: 'Jaipur', lat: 26.9124, lng: 75.7873 },
      { code: 'anc', name: 'Central Command', fullName: 'CENTRAL COMMAND', location: 'Lucknow', lat: 23.1815, lng: 79.9864 }
    ];

    for (const cmd of commands) {
      this.db.run(
        `INSERT OR REPLACE INTO command_hierarchy (id, command_code, command_name, command_full_name, headquarters_location, latitude, longitude, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), cmd.code, cmd.name, cmd.fullName, cmd.location, cmd.lat, cmd.lng, new Date().toISOString()]
      );
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('DB not initialized');

    // Users table with RBAC fields
    this.db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'OPERATOR',
        command_number INTEGER DEFAULT 1,
        operatorCategory TEXT,
        operatorCategoryName TEXT,
        command TEXT,
        commandName TEXT,
        division TEXT,
        divisionName TEXT,
        brigade TEXT,
        brigadeName TEXT,
        corps TEXT,
        corpsName TEXT,
        unit TEXT,
        assigned_command TEXT,
        can_access_all_commands INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Command hierarchy table
    this.db.run(`
      CREATE TABLE command_hierarchy (
        id TEXT PRIMARY KEY,
        command_code TEXT NOT NULL UNIQUE,
        command_name TEXT NOT NULL,
        command_full_name TEXT NOT NULL,
        headquarters_location TEXT,
        latitude REAL,
        longitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drone specifications table with command association
    this.db.run(`
      CREATE TABLE drone_specs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        droneName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        frequency REAL NOT NULL,
        clockDrift REAL NOT NULL DEFAULT 0,
        spectralLeakage REAL NOT NULL DEFAULT 0,
        modularshapeId INTEGER NOT NULL DEFAULT 0,
        maxHeight REAL NOT NULL,
        maxSpeed REAL NOT NULL,
        maxRange REAL NOT NULL,
        maxDuration INTEGER NOT NULL,
        gpsEnabled TEXT NOT NULL,
        autonomous TEXT NOT NULL,
        controlled TEXT NOT NULL,
        cameraEnabled TEXT NOT NULL,
        cameraResolution TEXT DEFAULT '',
        operatingFrequency TEXT DEFAULT '',
        command_code TEXT,
        createdAt DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Separate table for drone IDs
    this.db.run(`
      CREATE TABLE drone_ids (
        id TEXT PRIMARY KEY,
        drone_spec_id TEXT NOT NULL,
        drone_id TEXT NOT NULL,
        FOREIGN KEY (drone_spec_id) REFERENCES drone_specs(id) ON DELETE CASCADE
      );
    `);

    // Updated flights table with command association
    this.db.run(`
      CREATE TABLE flights (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        drone_model TEXT NOT NULL,
        drone_class TEXT NOT NULL,
        command_name TEXT NOT NULL DEFAULT '',
        command_code TEXT,
        frequency REAL NOT NULL,
        clockDrift REAL NOT NULL DEFAULT 0,
        spectralLeakage REAL NOT NULL DEFAULT 0,
        modularshapeId INTEGER NOT NULL DEFAULT 0,
        purpose TEXT NOT NULL,
        start DATETIME NOT NULL,
        end DATETIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'planned',
        cancel_requested INTEGER NOT NULL DEFAULT 0,
        approved_by TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      );
    `);

    this.db.run(`
      CREATE TABLE waypoints (
        flight_id TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        elev INTEGER NOT NULL,
        sequence INTEGER NOT NULL,
        FOREIGN KEY (flight_id) REFERENCES flights(id)
      );
    `);

    // Insert command hierarchy
    this.insertCommandHierarchy();
  }

  private async seedData() {
    if (!this.db) throw new Error('DB not initialized');

    const now = new Date().toISOString();

    // Create Super Admin
    const superAdminId = uuidv4();
    const superAdminPwd = await bcrypt.hash('admin123', 10);
    
    console.log('Creating Super Admin...');
    this.db.run(
      `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, can_access_all_commands, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [superAdminId, 'admin', superAdminPwd, 'SUPER_ADMIN', 1, 'a', 'Army', 'ec', 'Eastern Command', 'ar', 'HQ 3 CORPS', 'bde1', 'HQ 2 MNT DIV', 'cor36', '2 ARTY BDE', 'HQ SUPER ADMIN', 1, now]
    );

    // Create Command Admins for each command
    const commandAdmins = [
      { username: 'admin_ec', password: 'EasternCmd@2024', command: 'ec', commandName: 'Eastern Command' },
      { username: 'admin_wc', password: 'WesternCmd@2024', command: 'wc', commandName: 'Western Command' },
      { username: 'admin_sc', password: 'SouthernCmd@2024', command: 'sc', commandName: 'Southern Command' },
      { username: 'admin_nc', password: 'NorthernCmd@2024', command: 'nc', commandName: 'Northern Command' },
      { username: 'admin_swc', password: 'SWCmd@2024', command: 'swc', commandName: 'South Western Command' },
      { username: 'admin_cc', password: 'CentralCmd@2024', command: 'anc', commandName: 'Central Command' }
    ];

    let commandNumber = 100;
    console.log('Creating Command Admins...');
    for (const admin of commandAdmins) {
      const adminId = uuidv4();
      const hashedPwd = await bcrypt.hash(admin.password, 10);
      
      this.db.run(
        `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, assigned_command, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [adminId, admin.username, hashedPwd, 'COMMAND_ADMIN', commandNumber++, 'a', 'Army', admin.command, admin.commandName, 'ar', 'HQ ADMIN', 'bde1', 'ADMIN BDE', 'cor1', 'ADMIN CORPS', `${admin.commandName} HQ`, admin.command, now]
      );
    }

    // Create single dummy operator for testing
    const userId = uuidv4();
    const userPwd = await bcrypt.hash('user123', 10);
    
    const operatorParams = [
      userId, '67GR', userPwd, 'OPERATOR', commandNumber++,
      'a', 'Army', 'sc', 'Southern Command',
      'ar', 'HQ 12 CORPS', 'bde2', '11 RAPID',
      'cor5', '31 INF BDE', '67 FIELD REGIMENT', now
    ];
    
    console.log('Inserting operator user with params:', operatorParams); // Debug log
    this.db.run(
      `INSERT INTO users (
        id, username, password, role, command_number,
        operatorCategory, operatorCategoryName, command, commandName,
        division, divisionName, brigade, brigadeName,
        corps, corpsName, unit, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      operatorParams
    );

    // Add sample drone spec
    const droneSpecId = uuidv4();
    const droneSpecParams = [
      droneSpecId, userId, 'MQ-9 Reaper', 1, 1090.0, 0.1, 0.2, 1,
      15000, 50, 100, 120, 'yes', 'yes', 'yes', 'yes',
      '4K', '2.4 GHz to 5.8 GHz', 'sc', now
    ];
    
    console.log('Inserting drone spec with params:', droneSpecParams); // Debug log
    this.db.run(
      `INSERT INTO drone_specs (
        id, user_id, droneName, quantity, frequency, clockDrift, spectralLeakage,
        modularshapeId, maxHeight, maxSpeed, maxRange, maxDuration,
        gpsEnabled, autonomous, controlled, cameraEnabled, cameraResolution,
        operatingFrequency, command_code, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      droneSpecParams
    );

    // Add drone ID
    const droneIdEntry = uuidv4();
    this.db.run(
      `INSERT INTO drone_ids (id, drone_spec_id, drone_id) VALUES (?, ?, ?)`,
      [droneIdEntry, droneSpecId, 'DR-001-MQ9']
    );

    // Add sample flight
    const flightId = uuidv4();
    const later = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const flightParams = [
      flightId, userId, 'MQ-9 Reaper', 'MEDIUM', 'SOUTHERN COMMAND', 'sc',
      1090.0, 0.1, 0.2, 1, 'Recon Alpha', now, later.toISOString(), 'active'
    ];
    
    console.log('Inserting flight with params:', flightParams); // Debug log
    this.db.run(
      `INSERT INTO flights (
        id, user_id, drone_model, drone_class, command_name, command_code, frequency,
        clockDrift, spectralLeakage, modularshapeId, purpose, start, end, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      flightParams
    );

    // Add sample waypoints
    const waypoints = [
      { lat: 28.6139, lng: 77.2090, elev: 1000 },
      { lat: 28.7041, lng: 77.1025, elev: 1200 },
      { lat: 28.5355, lng: 77.3910, elev: 1100 }
    ];

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const waypointParams = [flightId, wp.lat, wp.lng, wp.elev, i + 1];
      console.log('Inserting waypoint with params:', waypointParams); // Debug log
      this.db.run(
        'INSERT INTO waypoints (flight_id, lat, lng, elev, sequence) VALUES (?, ?, ?, ?, ?)',
        waypointParams
      );
    }

    console.log('RBAC seed data created successfully');
  }

  // Updated authentication with role-based response
  async authenticateUser(username: string, password: string) {
    if (!this.db) throw new Error('DB not initialized');
    
    console.log('Authenticating user:', username);
    
    const stmt = this.db.prepare(`SELECT * FROM users WHERE username = ? AND is_active = 1`);
    stmt.bind([username]);
    
    if (stmt.step()) {
      const r = stmt.getAsObject() as any;
      console.log('User found:', r.username, 'Role:', r.role);
      
      if (await bcrypt.compare(password, r.password)) {
        stmt.free();
        const user = {
          id: r.id,
          username: r.username,
          role: r.role,
          commandNumber: r.command_number,
          operatorCategory: r.operatorCategory,
          operatorCategoryName: r.operatorCategoryName,
          command: r.command,
          commandName: r.commandName,
          division: r.division,
          divisionName: r.divisionName,
          brigade: r.brigade,
          brigadeName: r.brigadeName,
          corps: r.corps,
          corpsName: r.corpsName,
          unit: r.unit,
          assigned_command: r.assigned_command,
          can_access_all_commands: Boolean(r.can_access_all_commands),
          is_active: Boolean(r.is_active),
          createdAt: r.createdAt,
          rolePermissions: {
            canAccessAllCommands: Boolean(r.can_access_all_commands),
            assignedCommand: r.assigned_command,
            assignedCommandName: this.getCommandName(r.assigned_command)
          }
        } as User;
        
        console.log('Authentication successful for:', user.username, 'Role:', user.role);
        return { success: true, user };
      } else {
        console.log('Password mismatch for:', username);
      }
    } else {
      console.log('User not found or inactive:', username);
    }
    
    stmt.free();
    return { success: false, user: {} as User };
  }

  private getCommandName(commandCode: string): string {
    if (!this.db || !commandCode) return '';
    
    const stmt = this.db.prepare(`SELECT command_name FROM command_hierarchy WHERE command_code = ?`);
    stmt.bind([commandCode]);
    
    if (stmt.step()) {
      const result = stmt.getAsObject() as any;
      stmt.free();
      return result.command_name;
    }
    
    stmt.free();
    return '';
  }

  // Helper method to get user's accessible commands
  getUserAccessibleCommands(user: User): string[] {
    if (user.role === 'SUPER_ADMIN' && user.can_access_all_commands) {
      return ['ec', 'wc', 'sc', 'nc', 'swc', 'anc'];
    }
    
    if (user.role === 'COMMAND_ADMIN' && user.assigned_command) {
      return [user.assigned_command];
    }
    
    if (user.command) {
      return [user.command];
    }
    
    return [];
  }

  // Role-based users retrieval
  getUsersByCommandAccess(currentUser: User): User[] {
    if (!this.db) return [];
    
    const accessibleCommands = this.getUserAccessibleCommands(currentUser);
    if (accessibleCommands.length === 0) return [];
    
    const placeholders = accessibleCommands.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE command IN (${placeholders}) OR assigned_command IN (${placeholders})
      ORDER BY createdAt DESC
    `);
    stmt.bind([...accessibleCommands, ...accessibleCommands]);
    
    const users: User[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      users.push({
        id: r.id,
        username: r.username,
        password: r.password,
        role: r.role,
        commandNumber: r.command_number,
        operatorCategory: r.operatorCategory,
        operatorCategoryName: r.operatorCategoryName,
        command: r.command,
        commandName: r.commandName,
        division: r.division,
        divisionName: r.divisionName,
        brigade: r.brigade,
        brigadeName: r.brigadeName,
        corps: r.corps,
        corpsName: r.corpsName,
        unit: r.unit,
        assigned_command: r.assigned_command,
        can_access_all_commands: Boolean(r.can_access_all_commands),
        is_active: Boolean(r.is_active),
        createdAt: r.createdAt
      });
    }
    stmt.free();
    return users;
  }

  // Updated getAllUsers with RBAC response structure
  getAllUsers(): { users: User[]; userRole: string; accessibleCommands: string[]; totalCount: number } | User[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare(`SELECT * FROM users WHERE is_active = 1 ORDER BY createdAt DESC`);
    const users: User[] = [];
    
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      users.push({
        id: r.id,
        username: r.username,
        password: r.password,
        role: r.role,
        commandNumber: r.command_number,
        operatorCategory: r.operatorCategory,
        operatorCategoryName: r.operatorCategoryName,
        command: r.command,
        commandName: r.commandName,
        division: r.division,
        divisionName: r.divisionName,
        brigade: r.brigade,
        brigadeName: r.brigadeName,
        corps: r.corps,
        corpsName: r.corpsName,
        unit: r.unit,
        assigned_command: r.assigned_command,
        can_access_all_commands: Boolean(r.can_access_all_commands),
        is_active: Boolean(r.is_active),
        createdAt: r.createdAt
      });
    }
    stmt.free();
    
    // Return in RBAC format for compatibility
    return {
      users,
      userRole: '',
      accessibleCommands: [],
      totalCount: users.length
    };
  }

  // Updated getAllDroneSpecs with RBAC response structure
  getAllDroneSpecs(): any {
    if (!this.db) return { allSpecs: [], specsByCommand: [], userRole: '', accessibleCommands: [], totalSpecs: 0, totalDrones: 0 };
    
    const stmt = this.db.prepare(`
      SELECT ds.*, u.username, u.unit as userUnit, u.commandName
      FROM drone_specs ds
      JOIN users u ON ds.user_id = u.id
      ORDER BY ds.createdAt DESC
    `);
    
    const specs: (DroneSpec & { username: string; userUnit: string; commandName: string })[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      
      // Get drone IDs for this spec
      const droneIdsStmt = this.db.prepare(`SELECT drone_id FROM drone_ids WHERE drone_spec_id = ?`);
      droneIdsStmt.bind([r.id]);
      const droneIds: string[] = [];
      while (droneIdsStmt.step()) {
        const idRow = droneIdsStmt.getAsObject() as any;
        droneIds.push(idRow.drone_id);
      }
      droneIdsStmt.free();

      specs.push({
        id: r.id,
        user_id: r.user_id,
        droneName: r.droneName,
        droneIds: droneIds,
        quantity: r.quantity,
        frequency: r.frequency,
        clockDrift: r.clockDrift || 0,
        spectralLeakage: r.spectralLeakage || 0,
        modularshapeId: r.modularshapeId || 0,
        maxHeight: r.maxHeight,
        maxSpeed: r.maxSpeed,
        maxRange: r.maxRange,
        maxDuration: r.maxDuration,
        gpsEnabled: r.gpsEnabled,
        autonomous: r.autonomous,
        controlled: r.controlled,
        cameraEnabled: r.cameraEnabled,
        cameraResolution: r.cameraResolution,
        operatingFrequency: r.operatingFrequency,
        command_code: r.command_code,
        createdAt: r.createdAt,
        username: r.username,
        userUnit: r.userUnit,
        commandName: r.commandName
      });
    }
    stmt.free();
    
    // Return in RBAC format
    return {
      allSpecs: specs,
      specsByCommand: [],
      userRole: '',
      accessibleCommands: [],
      totalSpecs: specs.length,
      totalDrones: specs.reduce((sum, spec) => sum + (spec.quantity || 1), 0)
    };
  }

  // Updated getUserDroneSpecs with RBAC response structure
  getUserDroneSpecs(userId: string): any {
    if (!this.db) return { specs: [], userId, canModify: false };
    
    const stmt = this.db.prepare(`
      SELECT ds.*, u.username, u.commandName, u.unit as userUnit
      FROM drone_specs ds
      JOIN users u ON ds.user_id = u.id
      WHERE ds.user_id = ? 
      ORDER BY ds.createdAt DESC
    `);
    stmt.bind([userId]);
    
    const specs: DroneSpec[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      
      // Get drone IDs for this spec
      const droneIdsStmt = this.db.prepare(`SELECT drone_id FROM drone_ids WHERE drone_spec_id = ?`);
      droneIdsStmt.bind([r.id]);
      const droneIds: string[] = [];
      while (droneIdsStmt.step()) {
        const idRow = droneIdsStmt.getAsObject() as any;
        droneIds.push(idRow.drone_id);
      }
      droneIdsStmt.free();

      specs.push({
        id: r.id,
        user_id: r.user_id,
        droneName: r.droneName,
        droneIds: droneIds,
        quantity: r.quantity,
        frequency: r.frequency,
        clockDrift: r.clockDrift || 0,
        spectralLeakage: r.spectralLeakage || 0,
        modularshapeId: r.modularshapeId || 0,
        maxHeight: r.maxHeight,
        maxSpeed: r.maxSpeed,
        maxRange: r.maxRange,
        maxDuration: r.maxDuration,
        gpsEnabled: r.gpsEnabled,
        autonomous: r.autonomous,
        controlled: r.controlled,
        cameraEnabled: r.cameraEnabled,
        cameraResolution: r.cameraResolution,
        operatingFrequency: r.operatingFrequency,
        command_code: r.command_code,
        createdAt: r.createdAt
      });
    }
    stmt.free();
    
    return {
      specs,
      userId,
      canModify: true
    };
  }

  // Updated getUserById to include RBAC fields
  getUserById(userId: string): User | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
    stmt.bind([userId]);
    
    if (stmt.step()) {
      const r = stmt.getAsObject() as any;
      stmt.free();
      return {
        id: r.id,
        username: r.username,
        password: r.password,
        role: r.role,
        commandNumber: r.command_number,
        operatorCategory: r.operatorCategory,
        operatorCategoryName: r.operatorCategoryName,
        command: r.command,
        commandName: r.commandName,
        division: r.division,
        divisionName: r.divisionName,
        brigade: r.brigade,
        brigadeName: r.brigadeName,
        corps: r.corps,
        corpsName: r.corpsName,
        unit: r.unit,
        assigned_command: r.assigned_command,
        can_access_all_commands: Boolean(r.can_access_all_commands),
        is_active: Boolean(r.is_active),
        createdAt: r.createdAt
      };
    }
    stmt.free();
    return null;
  }

  // Updated registerUser method with RBAC support
  async registerUser(registrationData: RegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    if (!this.db) throw new Error('DB not initialized');

    try {
      // Check if username already exists
      const existingUser = this.db.prepare(`SELECT username FROM users WHERE username = ?`);
      existingUser.bind([registrationData.username]);
      if (existingUser.step()) {
        existingUser.free();
        return { success: false, message: 'Username already exists' };
      }
      existingUser.free();

      // Hash password
      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
      const userId = uuidv4();
      
      // Get next command number
      const commandNumberStmt = this.db.prepare(`SELECT MAX(command_number) as maxNum FROM users`);
      commandNumberStmt.step();
      const result = commandNumberStmt.getAsObject() as { maxNum: number };
      const nextCommandNumber = (result.maxNum || 0) + 1;
      commandNumberStmt.free();

      // Determine role and RBAC fields
      const role = registrationData.role || 'OPERATOR';
      const assignedCommand = role === 'COMMAND_ADMIN' ? registrationData.assignedCommand : null;

      // Insert user with RBAC fields
      this.db.run(
        `INSERT INTO users (id, username, password, role, command_number, operatorCategory, operatorCategoryName, command, commandName, division, divisionName, brigade, brigadeName, corps, corpsName, unit, assigned_command, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          registrationData.username,
          hashedPassword,
          role,
          nextCommandNumber,
          registrationData.operatorCategory.key,
          registrationData.operatorCategory.name,
          registrationData.command.key,
          registrationData.command.name,
          registrationData.division.key,
          registrationData.division.name,
          registrationData.brigade.key,
          registrationData.brigade.name,
          registrationData.corps.key,
          registrationData.corps.name,
          registrationData.unit,
          assignedCommand,
          new Date().toISOString()
        ]
      );

      // Insert drone specifications with command association
      for (const droneSpec of registrationData.droneSpecs) {
        const droneSpecId = uuidv4();
        
        this.db.run(
          `INSERT INTO drone_specs
           (id, user_id, droneName, quantity, frequency, clockDrift, spectralLeakage, modularshapeId, maxHeight, maxSpeed,
            maxRange, maxDuration, gpsEnabled, autonomous, controlled, cameraEnabled, cameraResolution,
            operatingFrequency, command_code, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            droneSpecId,
            userId,
            droneSpec.droneName,
            droneSpec.quantity,
            droneSpec.frequency,
            droneSpec.clockDrift,
            droneSpec.spectralLeakage,
            droneSpec.modularshapeId,
            droneSpec.maxHeight,
            droneSpec.maxSpeed,
            droneSpec.maxRange,
            droneSpec.maxDuration,
            droneSpec.gpsEnabled,
            droneSpec.autonomous,
            droneSpec.controlled,
            droneSpec.cameraEnabled,
            droneSpec.cameraResolution || '',
            droneSpec.operatingFrequency || '',
            registrationData.command.key, // Set command code
            new Date().toISOString()
          ]
        );

        // Insert drone IDs
        for (const droneId of droneSpec.droneIds) {
          if (droneId.trim()) {
            const droneIdRecordId = uuidv4();
            this.db.run(
              `INSERT INTO drone_ids (id, drone_spec_id, drone_id) VALUES (?, ?, ?)`,
              [droneIdRecordId, droneSpecId, droneId.trim()]
            );
          }
        }
      }

      this.save();
      return { success: true, message: 'Registration successful', userId };

    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Registration failed due to an error' };
    }
  }

  // Updated getAllFlights with RBAC response structure
  getAllFlights(): any {
    this.activateDueFlights();
    if (!this.db) return { allFlights: [], flightsByCommand: [], statusCounts: { planned: 0, active: 0, completed: 0 }, userRole: '', accessibleCommands: [], totalFlights: 0 };
    
    const stmt = this.db.prepare(`SELECT * FROM flights ORDER BY start DESC`);
    const flights: Flight[] = [];
    
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      flights.push({
        id: r.id,
        user_id: r.user_id,
        drone_model: r.drone_model,
        drone_class: r.drone_class,
        command_name: r.command_name,
        command_code: r.command_code,
        frequency: r.frequency,
        clockDrift: r.clockDrift || 0,
        spectralLeakage: r.spectralLeakage || 0,
        modularshapeId: r.modularshapeId || 0,
        purpose: r.purpose,
        start: r.start,
        end: r.end,
        status: r.status,
        cancel_requested: Boolean(r.cancel_requested),
        approved_by: r.approved_by
      });
    }
    stmt.free();
    
    // Calculate status counts
    const statusCounts = { planned: 0, active: 0, completed: 0 };
    flights.forEach(flight => {
      statusCounts[flight.status]++;
    });
    
    return {
      allFlights: flights,
      flightsByCommand: [],
      statusCounts,
      userRole: '',
      accessibleCommands: [],
      totalFlights: flights.length
    };
  }

  // Rest of the methods remain the same
  save() {
    if (!this.db) return;
    localStorage.setItem('dms_database', JSON.stringify(Array.from(this.db.export())));
  }

  activateDueFlights() {
    if (!this.db) throw new Error('DB not initialized');
    const nowIso = new Date().toISOString();
    this.db.run(
      `UPDATE flights SET status='active' WHERE status='planned' AND start <= ?`,
      [nowIso]
    );
    this.save();
  }

  requestCancelFlight(flightId: string) {
    if (!this.db) throw new Error('DB not initialized');
    this.db.run(`UPDATE flights SET cancel_requested=1 WHERE id=?`, [flightId]);
    this.save();
  }

  deleteFlight(flightId: string) {
    if (!this.db) throw new Error('DB not initialized');
    this.db.run(`DELETE FROM waypoints WHERE flight_id=?`, [flightId]);
    this.db.run(`DELETE FROM flights WHERE id=?`, [flightId]);
    this.save();
  }

  updateFlight(flightId: string, updates: {
    drone_model?: string;
    command_name?: string;
    purpose?: string;
    start?: string;
    end?: string;
  }) {
    if (!this.db) throw new Error('DB not initialized');
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (updates.drone_model !== undefined) {
      updateFields.push('drone_model = ?');
      updateValues.push(updates.drone_model);
    }
    if (updates.command_name !== undefined) {
      updateFields.push('command_name = ?');
      updateValues.push(updates.command_name);
    }
    if (updates.purpose !== undefined) {
      updateFields.push('purpose = ?');
      updateValues.push(updates.purpose);
    }
    if (updates.start !== undefined) {
      updateFields.push('start = ?');
      updateValues.push(updates.start);
    }
    if (updates.end !== undefined) {
      updateFields.push('end = ?');
      updateValues.push(updates.end);
    }
    
    if (updateFields.length === 0) return;
    
    updateValues.push(flightId);
    
    const sql = `UPDATE flights SET ${updateFields.join(', ')} WHERE id = ?`;
    this.db.run(sql, updateValues);
    this.save();
  }

  runQuery(sql: string): any[] {
    if (!this.db) throw new Error('DB not initialized');
    const stmt = this.db.prepare(sql);
    const rows: any[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  getFlightWaypoints(flightId: string): Waypoint[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(
      `SELECT * FROM waypoints WHERE flight_id=? ORDER BY sequence`
    );
    stmt.bind([flightId]);
    const wps: Waypoint[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject() as any;
      wps.push({
        flight_id: r.flight_id,
        lat: r.lat,
        lng: r.lng,
        elev: r.elev,
        sequence: r.sequence
      });
    }
    stmt.free();
    return wps;
  }

  createFlight(
    flight: Omit<Flight, 'id' | 'cancel_requested'>,
    waypoints: Omit<Waypoint, 'flight_id'>[]
  ): string {
    if (!this.db) throw new Error('DB not initialized');
    const id = uuidv4();
    this.db.run(
      `INSERT INTO flights
        (id,user_id,drone_model,drone_class,command_name,command_code,frequency,clockDrift,spectralLeakage,modularshapeId,purpose,start,end,status,cancel_requested)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        flight.user_id,
        flight.drone_model,
        flight.drone_class,
        flight.command_name,
        flight.command_code,
        flight.frequency,
        flight.clockDrift,
        flight.spectralLeakage,
        flight.modularshapeId,
        flight.purpose,
        flight.start,
        flight.end,
        flight.status,
        0
      ]
    );
    waypoints.forEach((wp, i) => {
      this.db!.run(
        `INSERT INTO waypoints (flight_id,lat,lng,elev,sequence) VALUES(?,?,?,?,?)`,
        [id, wp.lat, wp.lng, wp.elev, i + 1]
      );
    });
    this.save();
    return id;
  }

  checkCollision(newWp: { lat: number; lng: number; elev: number }, _s: string, _e: string): boolean {
    const fls = this.getAllFlights();
    const flights = Array.isArray(fls) ? fls : fls.allFlights;
    const activeFlights = flights.filter(f => f.status !== 'completed');
    
    for (const f of activeFlights) {
      for (const wp of this.getFlightWaypoints(f.id)) {
        const d = this.haversineDistance(newWp.lat, newWp.lng, wp.lat, wp.lng);
        const a = Math.abs(newWp.elev - wp.elev);
        if (d < 5 && a < 300) return true;
      }
    }
    return false;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.065;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const dbManager = new DatabaseManager();
if (typeof window !== 'undefined') (window as any).dbManager = dbManager;
