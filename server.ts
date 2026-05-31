import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { INITIAL_CMS_DATA } from "./src/initial_data.js";
import { CMSData } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Persistent database setup
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Password Hashing Utility
function hashPassword(password: string): string {
  if (/^[a-f0-9]{64}$/i.test(password)) {
    return password;
  }
  return crypto.createHash("sha256").update(password + "-moose-lodge-1676-salt!").digest("hex");
}

// Ensure data folder and db file exist
function initializeDatabase(): CMSData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      console.log("Database file doesn't exist. Seeding with initial lodge data...");
      const seeded = { ...INITIAL_CMS_DATA };
      seeded.users = seeded.users.map(u => ({
        ...u,
        passwordHash: hashPassword(u.passwordHash)
      }));
      fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf-8");
      return seeded as CMSData;
    }

    const dataRaw = fs.readFileSync(DB_FILE, "utf-8");
    const loaded = JSON.parse(dataRaw) as CMSData;
    
    // Auto-migrate if users collection is absent on older JSON database stores due to past sessions
    if (!loaded.users) {
      console.log("Database schema out of date. Seeding default users...");
      loaded.users = INITIAL_CMS_DATA.users;
    }

    if (!loaded.meetingMinutes) {
      loaded.meetingMinutes = INITIAL_CMS_DATA.meetingMinutes || [];
    }
    if (!loaded.financials) {
      loaded.financials = INITIAL_CMS_DATA.financials || [];
    }
    if (!loaded.customEventCategories) {
      loaded.customEventCategories = INITIAL_CMS_DATA.customEventCategories || ["public", "members", "fundraiser", "wom", "legion"];
    }
    if (!loaded.customPhotoCategories) {
      loaded.customPhotoCategories = INITIAL_CMS_DATA.customPhotoCategories || ["Events", "Charity", "Lodge Hall", "Sports", "Family"];
    }
    if (!loaded.customNewsCategories) {
      loaded.customNewsCategories = INITIAL_CMS_DATA.customNewsCategories || ["Lodge Update", "Fundraising", "Member Spotlight", "Community Work", "Scholarship", "Women of Moose"];
    }

    // Secure plain passwords dynamically on load
    loaded.users = loaded.users.map(u => ({
      ...u,
      passwordHash: hashPassword(u.passwordHash)
    }));
    
    // Write back immediately so they are encrypted on-disk right away
    fs.writeFileSync(DB_FILE, JSON.stringify(loaded, null, 2), "utf-8");
    return loaded;
  } catch (err) {
    console.error("Error reading or initializing local database file:", err);
    return INITIAL_CMS_DATA;
  }
}

let db = initializeDatabase();

// In-Memory Active Session Map: Token -> User Object
const activeSessions = new Map<string, any>();

// AUTHENTICATION MIDDLEWARE
function authenticateToken(req: any, res: any, next: any) {
  let token = "";
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }

  // Backup pass for legacy passcode verification
  const passcode = req.body && req.body.passcode;
  if (!token && passcode === "1676") {
    const defaultAdmin = db.users.find(u => u.role === "admin");
    if (defaultAdmin) {
      req.user = defaultAdmin;
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Access Denied: authentication session token is required to edit content." });
  }

  const user = activeSessions.get(token);
  if (!user) {
    return res.status(401).json({ error: "Access Denied: session has expired or is invalid. Please log in again." });
  }

  req.user = user;
  next();
}

// AUTHORIZATION MIDDLEWARE FOR SECTIONS
function canUpdateSection(section: 'rentals' | 'memberships' | 'settings' | 'events' | 'posts' | 'photos' | 'users') {
  return (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Access Denied" });
      }
      
      if (user.role === "admin" || user.allowedSections.includes(section)) {
        return next();
      }
      
      res.status(403).json({ 
        error: `Access Denied: Your staff profile doesn't have privileges to update the '${section}' section. Raise with Lodge Admin if required.` 
      });
    });
  };
}

// Sync current memory state to JSON file
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to commit database write:", err);
  }
}

// Ensure database state is completely synced on exit
process.on("SIGINT", () => {
  saveDatabase();
  process.exit();
});

// ── SECURE API ENDPOINTS ──

// 1. Health check & configuration
app.get("/api/health", (req, res) => {
  res.json({ status: "online", lodge: "Brooksville Moose Lodge 1676", time: new Date() });
});

// 2. Fetch all public CMS content
app.get("/api/cms", (req, res) => {
  // Return the entire DB except user password hashes for extreme security!
  const sanitized = {
    ...db,
    users: db.users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      allowedSections: u.allowedSections,
      title: u.title || "",
      approved: u.approved !== false,
      memberRights: u.memberRights || []
    })),
    meetingMinutes: db.meetingMinutes || [],
    financials: db.financials || [],
    customEventCategories: db.customEventCategories || ["public", "members", "fundraiser", "wom", "legion"],
    customPhotoCategories: db.customPhotoCategories || ["Events", "Charity", "Lodge Hall", "Sports", "Family"],
    customNewsCategories: db.customNewsCategories || ["Lodge Update", "Fundraising", "Member Spotlight", "Community Work", "Scholarship", "Women of Moose"]
  };
  res.json(sanitized);
});

// ── AUTHENTICATION SYSTEM ENDPOINTS ──

app.post("/api/auth/login", (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  
  username = username.trim().toLowerCase();
  
  // Accept '1676' as a quick username shortcut pointing to admin
  if (username === "1676") {
    username = "admin";
  }

  const user = db.users.find(u => u.username.toLowerCase() === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Double check username or password." });
  }
  
  const hashed = hashPassword(password);
  
  // Allow either the original passwordHash OR the convenient passcode '1676' as a valid login password
  const isMatch = (user.passwordHash === hashed) || (password.trim() === "1676");
  
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials. Double check username or password." });
  }
  
  // Generate a random high-entropy token
  const token = crypto.randomBytes(32).toString("hex");

  // If registering as a member and not approved yet, return a graceful warning
  if (user.role === "member" && user.approved === false) {
    return res.status(403).json({ error: "Your membership portal account registration is pending administrator approval." });
  }

  activeSessions.set(token, user);
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      allowedSections: user.allowedSections,
      title: user.title || "Lodge Member",
      approved: user.approved !== false,
      memberRights: user.memberRights || ["announcements"]
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  let token = "";
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }
  
  if (!token) {
    return res.status(401).json({ error: "No active session token provided" });
  }
  
  const user = activeSessions.get(token);
  if (!user) {
    return res.status(401).json({ error: "Stale or expired session" });
  }

  if (user.role === "member" && user.approved === false) {
    return res.status(403).json({ error: "Your membership portal account registration is pending administrator approval." });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      allowedSections: user.allowedSections,
      title: user.title || "Lodge Member",
      approved: user.approved !== false,
      memberRights: user.memberRights || ["announcements"]
    }
  });
});

app.post("/api/auth/logout", (req, res) => {
  let token = "";
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ message: "Successfully logged out. Session deleted." });
});


// ── STAFF USERS PROFILE MANAGEMENT (ADMINS ONLY) ──

app.get("/api/users", canUpdateSection("users"), (req, res) => {
  res.json(db.users.map(u => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    allowedSections: u.allowedSections,
    title: u.title || "",
    approved: u.approved !== false,
    memberRights: u.memberRights || []
  })));
});

app.post("/api/users", canUpdateSection("users"), (req, res) => {
  const { user } = req.body;
  if (!user || !user.username || !user.role || !user.fullName) {
    return res.status(400).json({ error: "Missing required profile credentials" });
  }
  
  const usernameLower = user.username.trim().toLowerCase();
  
  if (user.id) {
    // Edit User Profile
    const existingIndex = db.users.findIndex(u => u.id === user.id);
    if (existingIndex !== -1) {
      // Keep old hash unless password is being updated
      let pHash = db.users[existingIndex].passwordHash;
      if (user.password && user.password.trim() !== "") {
        pHash = hashPassword(user.password);
      }
      
      db.users[existingIndex] = {
        ...db.users[existingIndex],
        username: usernameLower,
        fullName: user.fullName,
        role: user.role,
        allowedSections: user.allowedSections || [],
        passwordHash: pHash,
        title: user.title || "",
        approved: user.approved !== false,
        memberRights: user.memberRights || []
      };
      
      // Update session properties live so they take effect immediately
      for (const [t, u] of activeSessions.entries()) {
        if (u.id === user.id) {
          activeSessions.set(t, db.users[existingIndex]);
        }
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } else {
    // Add New User Profile
    const duplicate = db.users.some(u => u.username.toLowerCase() === usernameLower);
    if (duplicate) {
      return res.status(400).json({ error: "Username already exists. Choose another login name." });
    }
    
    if (!user.password || user.password.trim() === "") {
      return res.status(400).json({ error: "Password is required for new accounts" });
    }
    
    const newUser = {
      id: "usr-" + Date.now().toString(),
      username: usernameLower,
      fullName: user.fullName,
      role: user.role,
      allowedSections: user.allowedSections || [],
      passwordHash: hashPassword(user.password),
      title: user.title || "",
      approved: user.approved !== false,
      memberRights: user.memberRights || []
    };
    db.users.push(newUser);
  }
  
  saveDatabase();
  res.json({
    message: "Staff member directory updated successfully",
    users: db.users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      allowedSections: u.allowedSections,
      title: u.title || "",
      approved: u.approved !== false,
      memberRights: u.memberRights || []
    }))
  });
});

app.delete("/api/users/:id", canUpdateSection("users"), (req: any, res) => {
  const id = req.params.id;
  
  // Guard self deletion
  if (req.user && req.user.id === id) {
    return res.status(400).json({ error: "Vulnerability Safeguard: You are not permitted to delete your own logged-in account!" });
  }
  
  db.users = db.users.filter(u => u.id !== id);
  saveDatabase();
  
  // Session eviction
  for (const [t, u] of activeSessions.entries()) {
    if (u.id === id) {
      activeSessions.delete(t);
    }
  }
  
  res.json({ message: "Staff user evicted from roster", id });
});


// ── LODGE BUSINESS WORKFLOW ENDPOINTS ──

// 3. Lodge Settings
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

app.post("/api/settings", canUpdateSection("settings"), (req, res) => {
  const { settings } = req.body;
  if (!settings) {
    return res.status(400).json({ error: "No settings object provided" });
  }

  db.settings = { ...db.settings, ...settings };
  saveDatabase();
  res.json({ message: "Lodge settings saved successfully", settings: db.settings });
});

// 4. Events Calendar Endpoints
app.get("/api/events", (req, res) => {
  res.json(db.events);
});

app.post("/api/events", canUpdateSection("events"), (req, res) => {
  const { event } = req.body;
  if (!event || !event.title || !event.date) {
    return res.status(400).json({ error: "Incomplete event details" });
  }

  if (event.id) {
    // Edit existing event
    const index = db.events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      db.events[index] = { ...db.events[index], ...event };
    } else {
      db.events.push(event);
    }
  } else {
    // Create new event
    const newEvent = {
      ...event,
      id: "evt-" + Date.now().toString()
    };
    db.events.push(newEvent);
  }

  saveDatabase();
  res.json({ message: "Event saved successfully", events: db.events });
});

app.delete("/api/events/:id", canUpdateSection("events"), (req, res) => {
  const id = req.params.id;
  db.events = db.events.filter(e => e.id !== id);
  saveDatabase();
  res.json({ message: "Event deleted", id });
});

// 5. News Posts Endpoints
app.get("/api/posts", (req, res) => {
  res.json(db.posts);
});

app.post("/api/posts", canUpdateSection("posts"), (req, res) => {
  const { post } = req.body;
  if (!post || !post.title || !post.content) {
    return res.status(400).json({ error: "Incomplete post details" });
  }

  if (post.id) {
    // Edit existing
    const index = db.posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      db.posts[index] = { ...db.posts[index], ...post };
    } else {
      db.posts.push(post);
    }
  } else {
    // Create new
    const newPost = {
      ...post,
      id: "post-" + Date.now().toString(),
      date: new Date().toISOString().split("T")[0]
    };
    db.posts.push(newPost);
  }

  saveDatabase();
  res.json({ message: "Post saved successfully", posts: db.posts });
});

app.delete("/api/posts/:id", canUpdateSection("posts"), (req, res) => {
  const id = req.params.id;
  db.posts = db.posts.filter(p => p.id !== id);
  saveDatabase();
  res.json({ message: "Post deleted", id });
});

// 6. Photo Gallery Endpoints
app.get("/api/gallery", (req, res) => {
  res.json(db.photos);
});

app.post("/api/gallery", canUpdateSection("photos"), (req, res) => {
  const { photo } = req.body;
  if (!photo || !photo.url || !photo.title) {
    return res.status(400).json({ error: "Incomplete photo details" });
  }

  const newPhoto = {
    ...photo,
    id: photo.id || "p-" + Date.now().toString(),
    date: photo.date || new Date().toISOString().split("T")[0]
  };

  db.photos.push(newPhoto);
  saveDatabase();
  res.json({ message: "Photo added successfully", photos: db.photos });
});

app.delete("/api/gallery/:id", canUpdateSection("photos"), (req, res) => {
  const id = req.params.id;
  db.photos = db.photos.filter(p => p.id !== id);
  saveDatabase();
  res.json({ message: "Photo deleted from archive", id });
});

// 7. Hall Rental Request Submissions
app.get("/api/rentals", (req, res) => {
  res.json(db.rentals);
});

app.post("/api/rentals", (req, res) => {
  const inquiry = req.body;
  if (!inquiry || !inquiry.fullName || !inquiry.email || !inquiry.eventDate) {
    return res.status(400).json({ error: "Incomplete inquiry details" });
  }

  const newInquiry = {
    ...inquiry,
    id: "rent-" + Date.now().toString(),
    status: "pending",
    dateSubmitted: new Date().toISOString().split("T")[0]
  };

  db.rentals.push(newInquiry);
  saveDatabase();
  res.json({ message: "Hall Rental Inquiry submitted successfully!", inquiry: newInquiry });
});

app.patch("/api/rentals/:id", canUpdateSection("rentals"), (req, res) => {
  const { status, estimatedPrice, notes } = req.body;
  const id = req.params.id;
  const index = db.rentals.findIndex(r => r.id === id);
  if (index !== -1) {
    if (status !== undefined) db.rentals[index].status = status;
    if (estimatedPrice !== undefined) db.rentals[index].estimatedPrice = Number(estimatedPrice);
    if (notes !== undefined) db.rentals[index].notes = notes;
    saveDatabase();
    res.json({ message: "Inquiry updated successfully", inquiry: db.rentals[index] });
  } else {
    res.status(404).json({ error: "Rental record not found" });
  }
});

// 8. Membership Submissions
app.get("/api/applications", (req, res) => {
  res.json(db.applications);
});

app.post("/api/applications", (req, res) => {
  const appData = req.body;
  if (!appData || !appData.fullName || !appData.email || !appData.phone) {
    return res.status(400).json({ error: "Incomplete application details" });
  }

  const newApplication = {
    ...appData,
    id: "app-" + Date.now().toString(),
    status: "pending",
    dateSubmitted: new Date().toISOString().split("T")[0]
  };

  db.applications.push(newApplication);
  saveDatabase();
  res.json({ message: "Membership application request submitted successfully!", application: newApplication });
});

app.patch("/api/applications/:id", canUpdateSection("memberships"), (req, res) => {
  const { status } = req.body;
  const id = req.params.id;
  const index = db.applications.findIndex(a => a.id === id);
  if (index !== -1) {
    db.applications[index].status = status;
    saveDatabase();
    res.json({ message: "Application status updated", application: db.applications[index] });
  } else {
    res.status(404).json({ error: "Application record not found" });
  }
});

// 9. Officer list
app.get("/api/officers", (req, res) => {
  res.json(db.officers);
});

app.post("/api/officers", canUpdateSection("settings"), (req, res) => {
  const { officers } = req.body;
  if (!Array.isArray(officers)) {
    return res.status(400).json({ error: "Invalid officers data structure" });
  }

  db.officers = officers;
  saveDatabase();
  res.json({ message: "Board of officers updated successfully", officers: db.officers });
});


// 10. Public Member Signup
app.post("/api/auth/signup", (req, res) => {
  const { username, password, fullName, title } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: "Username, password, and full name are required." });
  }

  const usernameLower = username.trim().toLowerCase();
  const duplicate = db.users.some(u => u.username.toLowerCase() === usernameLower);
  if (duplicate) {
     return res.status(400).json({ error: "Username already exists. Please choose another username." });
  }

  // Create pending member account
  const newMember = {
    id: "usr-" + Date.now().toString(),
    username: usernameLower,
    passwordHash: hashPassword(password),
    role: "member" as const,
    fullName: fullName.trim(),
    title: title ? title.trim() : "Lodge Member",
    allowedSections: [] as any[],
    approved: false, // Pending authorization by admin
    memberRights: ["announcements", "minutes"] // default rights
  };

  db.users.push(newMember);
  saveDatabase();

  res.json({ message: "Registration successful! Your member account is pending admin approval and rights assignment." });
});


// 11. Meeting Minutes Administration
app.get("/api/minutes", (req, res) => {
  res.json(db.meetingMinutes || []);
});

app.post("/api/minutes", authenticateToken, (req: any, res) => {
  const user = req.user;
  if (user.role !== "admin" && !user.allowedSections.includes("settings")) {
    return res.status(403).json({ error: "Unauthorized to edit meeting minutes" });
  }

  const { minute } = req.body;
  if (!minute || !minute.title || !minute.content) {
    return res.status(400).json({ error: "Incomplete details." });
  }

  if (!db.meetingMinutes) db.meetingMinutes = [];

  if (minute.id) {
    const idx = db.meetingMinutes.findIndex(m => m.id === minute.id);
    if (idx !== -1) {
      db.meetingMinutes[idx] = { ...db.meetingMinutes[idx], ...minute };
    } else {
      db.meetingMinutes.push({ ...minute, id: minute.id });
    }
  } else {
    db.meetingMinutes.push({
      ...minute,
      id: "min-" + Date.now().toString()
    });
  }

  saveDatabase();
  res.json({ message: "Meeting minutes saved", minutes: db.meetingMinutes });
});

app.delete("/api/minutes/:id", authenticateToken, (req: any, res) => {
  const user = req.user;
  if (user.role !== "admin" && !user.allowedSections.includes("settings")) {
    return res.status(403).json({ error: "Unauthorized to delete meeting minutes" });
  }
  const id = req.params.id;
  if (db.meetingMinutes) {
    db.meetingMinutes = db.meetingMinutes.filter(m => m.id !== id);
  }
  saveDatabase();
  res.json({ message: "Meeting document deleted", id });
});


// 12. Financial Reports Administration
app.get("/api/financials", (req, res) => {
  res.json(db.financials || []);
});

app.post("/api/financials", authenticateToken, (req: any, res) => {
  const user = req.user;
  if (user.role !== "admin" && !user.allowedSections.includes("settings")) {
    return res.status(403).json({ error: "Unauthorized to edit financial reports" });
  }

  const { financial } = req.body;
  if (!financial || !financial.title || !financial.date) {
    return res.status(400).json({ error: "Incomplete statement details." });
  }

  if (!db.financials) db.financials = [];

  const payload = {
    ...financial,
    revenue: Number(financial.revenue || 0),
    expenses: Number(financial.expenses || 0),
    netIncome: Number(financial.netIncome || (Number(financial.revenue || 0) - Number(financial.expenses || 0))),
    unrestrictedFunds: Number(financial.unrestrictedFunds || 0)
  };

  if (payload.id) {
    const idx = db.financials.findIndex(f => f.id === payload.id);
    if (idx !== -1) {
      db.financials[idx] = { ...db.financials[idx], ...payload };
    } else {
      db.financials.push({ ...payload, id: payload.id });
    }
  } else {
    payload.id = "fin-" + Date.now().toString();
    db.financials.push(payload);
  }

  saveDatabase();
  res.json({ message: "Financial report saved successfully", financials: db.financials });
});

app.delete("/api/financials/:id", authenticateToken, (req: any, res) => {
  const user = req.user;
  if (user.role !== "admin" && !user.allowedSections.includes("settings")) {
    return res.status(403).json({ error: "Unauthorized to delete financials" });
  }
  const id = req.params.id;
  if (db.financials) {
    db.financials = db.financials.filter(f => f.id !== id);
  }
  saveDatabase();
  res.json({ message: "Financial statement deleted", id });
});


// 13. Save Custom Categories
app.post("/api/categories", authenticateToken, (req, res) => {
  const { type, categories } = req.body;
  if (!type || !Array.isArray(categories)) {
     return res.status(400).json({ error: "Invalid categories payload" });
  }

  if (type === "event") {
    db.customEventCategories = categories;
  } else if (type === "photo") {
    db.customPhotoCategories = categories;
  } else if (type === "news") {
    db.customNewsCategories = categories;
  } else {
    return res.status(400).json({ error: "Invalid type" });
  }

  saveDatabase();
  res.json({ 
    message: "Categories updated successfully", 
    customEventCategories: db.customEventCategories, 
    customPhotoCategories: db.customPhotoCategories, 
    customNewsCategories: db.customNewsCategories 
  });
});


// ── ASSET SERVING & INTEGRATED DEV WEB MIDDLEWARE ──

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🐺 Brooksville Moose Lodge 1676 Server Started`);
    console.log(`🔗 Interface: http://localhost:${PORT}`);
    console.log(`📂 DB Location: ${DB_FILE}`);
    console.log(`🔐 Admin Access Passcode: 1676`);
    console.log(`===============================================`);
  });
}

startServer();
