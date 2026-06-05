const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { TikTokLiveConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// GANTI username TikTok kamu di sini, TANPA @
const TIKTOK_USERNAME = "pixiaaated";

let giveaway = {
  active: false,
  title: "🎁 GIVEAWAY LIVE",
  subtitle: "Ketik keyword di chat untuk masuk daftar peserta",
  keyword: "JOIN",
  participants: [],
  winner: null,
  connected: false,
  liveRoomId: null,
  lastJoin: null,
};

app.use(express.static("public"));
app.use(express.json());

function normalizeText(text) {
  return String(text || "").trim().toUpperCase();
}

function normalizeUsername(username) {
  return String(username || "").trim().replace(/^@/, "");
}

function broadcast() {
  io.emit("giveaway:update", giveaway);
}

function getUsername(data) {
  return (
    data.uniqueId ||
    data.user?.uniqueId ||
    data.user?.unique_id ||
    data.user?.uniqueID ||
    data.nickname ||
    data.user?.nickname ||
    data.userId ||
    data.user?.userId ||
    data.secUid ||
    data.user?.secUid ||
    "unknown_user"
  );
}

function getNickname(data) {
  return (
    data.nickname ||
    data.user?.nickname ||
    data.uniqueId ||
    data.user?.uniqueId ||
    ""
  );
}

function getUrlFromObject(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.startsWith("http") ? value : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = getUrlFromObject(item);
      if (found) return found;
    }
    return "";
  }

  if (typeof value === "object") {
    if (typeof value.url === "string" && value.url.startsWith("http")) {
      return value.url;
    }

    if (typeof value.uri === "string" && value.uri.startsWith("http")) {
      return value.uri;
    }

    if (Array.isArray(value.urlList)) {
      const found = value.urlList.find((url) => {
        return typeof url === "string" && url.startsWith("http");
      });
      if (found) return found;
    }

    if (Array.isArray(value.urls)) {
      const found = value.urls.find((url) => {
        return typeof url === "string" && url.startsWith("http");
      });
      if (found) return found;
    }
  }

  return "";
}

function scanForImageUrl(value, results = []) {
  if (!value) return results;

  if (typeof value === "string") {
    const looksLikeImageUrl =
      value.startsWith("http") &&
      (
        value.includes("tiktok") ||
        value.includes("muscdn") ||
        value.includes("akamaized") ||
        value.includes("p16") ||
        value.includes("avatar") ||
        value.includes("webp") ||
        value.includes("jpeg") ||
        value.includes("jpg") ||
        value.includes("png")
      );

    if (looksLikeImageUrl) {
      results.push(value);
    }

    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => scanForImageUrl(item, results));
    return results;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => scanForImageUrl(item, results));
    return results;
  }

  return results;
}

function getAvatar(data) {
  const directCandidates = [
    data.profilePictureUrl,
    data.avatar,
    data.avatarUrl,
    data.avatarThumb,
    data.avatarMedium,
    data.avatarLarger,

    data.user?.profilePictureUrl,
    data.user?.avatar,
    data.user?.avatarUrl,
    data.user?.avatarThumb,
    data.user?.avatarMedium,
    data.user?.avatarLarger,

    data.userDetails?.profilePictureUrl,
    data.userDetails?.avatar,
    data.userDetails?.avatarThumb,
    data.userDetails?.avatarMedium,
    data.userDetails?.avatarLarger,
  ];

  for (const candidate of directCandidates) {
    const url = getUrlFromObject(candidate);
    if (url) return url;
  }

  const scannedUrls = scanForImageUrl(data);

  return (
    scannedUrls.find((url) => url.toLowerCase().includes("avatar")) ||
    scannedUrls.find((url) => url.toLowerCase().includes("p16")) ||
    scannedUrls[0] ||
    ""
  );
}

function addParticipant(userData) {
  const cleanUsername = normalizeUsername(userData.username);

  if (!cleanUsername || cleanUsername === "unknown_user") {
    console.log("[JOIN FAILED] Username kosong:", userData.username);
    return;
  }

  const exists = giveaway.participants.some((participant) => {
    return participant.username.toLowerCase() === cleanUsername.toLowerCase();
  });

  if (exists) {
    console.log(`[JOIN SKIP] @${cleanUsername} sudah join`);
    return;
  }

  const participant = {
    username: cleanUsername,
    nickname: userData.nickname || cleanUsername,
    avatar: userData.avatar || "",
    joinedAt: Date.now(),
  };

  giveaway.participants.push(participant);
  giveaway.lastJoin = participant;

  broadcast();

  console.log(`[JOIN SUCCESS] @${cleanUsername}`);
  console.log(`[AVATAR SAVED] ${participant.avatar || "KOSONG / FALLBACK HURUF"}`);
}

function drawWinner() {
  if (giveaway.participants.length === 0) {
    giveaway.winner = null;
    broadcast();
    return null;
  }

  const index = Math.floor(Math.random() * giveaway.participants.length);
  giveaway.winner = giveaway.participants[index];

  broadcast();

  console.log(`[WINNER] @${giveaway.winner.username}`);

  return giveaway.winner;
}

app.get("/", (req, res) => {
  res.redirect("/admin.html");
});

app.get("/api/state", (req, res) => {
  res.json(giveaway);
});

app.post("/api/settings", (req, res) => {
  if (req.body?.title !== undefined) {
    giveaway.title = String(req.body.title || "").trim() || "🎁 GIVEAWAY LIVE";
  }

  if (req.body?.subtitle !== undefined) {
    giveaway.subtitle =
      String(req.body.subtitle || "").trim() ||
      "Ketik keyword di chat untuk masuk daftar peserta";
  }

  if (req.body?.keyword !== undefined) {
    giveaway.keyword = normalizeText(req.body.keyword || "JOIN");
  }

  broadcast();

  res.json({ ok: true, giveaway });
});

app.post("/api/start", (req, res) => {
  giveaway.active = true;
  giveaway.winner = null;

  if (req.body?.title !== undefined) {
    giveaway.title = String(req.body.title || "").trim() || "🎁 GIVEAWAY LIVE";
  }

  if (req.body?.subtitle !== undefined) {
    giveaway.subtitle =
      String(req.body.subtitle || "").trim() ||
      "Ketik keyword di chat untuk masuk daftar peserta";
  }

  if (req.body?.keyword !== undefined) {
    giveaway.keyword = normalizeText(req.body.keyword || "JOIN");
  }

  broadcast();

  console.log(`[GIVEAWAY] Dibuka`);
  console.log(`[TITLE] ${giveaway.title}`);
  console.log(`[KEYWORD] ${giveaway.keyword}`);

  res.json({ ok: true, giveaway });
});

app.post("/api/stop", (req, res) => {
  giveaway.active = false;
  broadcast();

  console.log("[GIVEAWAY] Ditutup");

  res.json({ ok: true, giveaway });
});

app.post("/api/reset", (req, res) => {
  giveaway.participants = [];
  giveaway.winner = null;
  giveaway.lastJoin = null;

  broadcast();

  console.log("[GIVEAWAY] Reset peserta");

  res.json({ ok: true, giveaway });
});

app.post("/api/draw", (req, res) => {
  const winner = drawWinner();

  res.json({
    ok: true,
    winner,
    giveaway,
  });
});

app.post("/api/manual-add", (req, res) => {
  const username = req.body.username;
  const avatar = req.body.avatar || "";

  addParticipant({
    username,
    nickname: username,
    avatar,
  });

  res.json({ ok: true, giveaway });
});

io.on("connection", (socket) => {
  console.log("[SOCKET] Admin/Overlay connected");
  socket.emit("giveaway:update", giveaway);
});

const tiktok = new TikTokLiveConnection(TIKTOK_USERNAME);

tiktok
  .connect()
  .then((state) => {
    giveaway.connected = true;
    giveaway.liveRoomId = state.roomId || null;
    broadcast();

    console.log(`Connected to TikTok Live @${TIKTOK_USERNAME}`);
    console.log(`Room ID: ${state.roomId}`);
  })
  .catch((err) => {
    giveaway.connected = false;
    broadcast();

    console.error("Gagal connect ke TikTok Live:");
    console.error(err);
  });

tiktok.on("chat", (data) => {
  const username = getUsername(data);
  const nickname = getNickname(data);
  const avatar = getAvatar(data);
  const comment = normalizeText(data.comment);

  console.log(`[CHAT] @${username}: ${data.comment}`);

  if (!giveaway.active) return;

  if (comment === giveaway.keyword) {
    addParticipant({
      username,
      nickname,
      avatar,
    });
  }
});

tiktok.on("disconnected", () => {
  giveaway.connected = false;
  broadcast();

  console.log("TikTok disconnected");
});

server.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
  console.log(`Admin   : http://localhost:${PORT}/admin.html`);
  console.log(`Overlay : http://localhost:${PORT}/overlay.html`);
});