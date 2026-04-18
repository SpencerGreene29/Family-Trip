import { useState, useEffect, useRef } from “react”;
import { initializeApp } from “firebase/app”;
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, updateDoc, serverTimestamp, query, orderBy, getDoc } from “firebase/firestore”;

// ── Firebase config (already set up for you!) ──
const firebaseConfig = {
apiKey: “AIzaSyDh8Y3uMcFg0duzzjbw1kJztLMkmEzHZck”,
authDomain: “family-trip-d260f.firebaseapp.com”,
projectId: “family-trip-d260f”,
storageBucket: “family-trip-d260f.firebasestorage.app”,
messagingSenderId: “663445929783”,
appId: “1:663445929783:web:4cdc3b2f0ae5dc31c8a4b2”,
measurementId: “G-183S1RCNBK”
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Constants ──
const DRINK_EMOJIS = [“🍺”, “🍻”, “🍷”, “🍸”, “🍹”, “🥂”, “🥃”, “🍾”];
const METER_LABELS = [“Stone Cold Sober”, “Feelin’ It”, “Sippin’ Easy”, “Getting Loosey”, “Party Mode ON”, “Vibing Hard”, “Full Send”, “Wobbly”, “Blackout Adjacent”, “LEGENDARY”];
const PALETTE = [”#ff6b35”, “#ff4da6”, “#ffd700”, “#39ff14”, “#00cfff”, “#c77dff”, “#ff6666”];

const C = {
bg: “#1a0a2e”, card: “#2d1b4e”, cardLight: “#3d2660”,
accent: “#ff6b35”, gold: “#ffd700”, pink: “#ff4da6”,
text: “#f0e6ff”, muted: “#9b7fc4”,
};

// ── Helpers ──
function getMeterColor(v) {
if (v <= 3) return “#39ff14”;
if (v <= 6) return “#ffd700”;
if (v <= 8) return “#ff6b35”;
return “#ff4da6”;
}
function formatTime(ts) {
if (!ts) return “”;
const d = ts.toDate ? ts.toDate() : new Date(ts);
return d.toLocaleTimeString([], { hour: “2-digit”, minute: “2-digit” });
}
function formatDate(ts) {
if (!ts) return “”;
const d = ts.toDate ? ts.toDate() : new Date(ts);
return d.toLocaleDateString([], { month: “short”, day: “numeric” }) + “ · “ + d.toLocaleTimeString([], { hour: “2-digit”, minute: “2-digit” });
}

// ── Resize image to keep it small enough for Firestore ──
function resizeImage(dataUrl, maxWidth = 800) {
return new Promise((resolve) => {
const img = new Image();
img.onload = () => {
const scale = Math.min(1, maxWidth / img.width);
const canvas = document.createElement(“canvas”);
canvas.width = img.width * scale;
canvas.height = img.height * scale;
canvas.getContext(“2d”).drawImage(img, 0, 0, canvas.width, canvas.height);
resolve(canvas.toDataURL(“image/jpeg”, 0.7));
};
img.src = dataUrl;
});
}

// ── Avatar ──
function Avatar({ src, color, size = 44, style = {} }) {
if (src) return (
<div style={{ width: size, height: size, borderRadius: “50%”, overflow: “hidden”, flexShrink: 0, border: `2px solid ${color}88`, boxShadow: `0 0 12px ${color}44`, …style }}>
<img src={src} alt=”” style={{ width: “100%”, height: “100%”, objectFit: “cover” }} />
</div>
);
return (
<div style={{ width: size, height: size, borderRadius: “50%”, flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${color}66)`, border: `2px solid ${color}66`, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: size * 0.44, …style }}>
🙂
</div>
);
}

// ── Toast ──
function Toast({ toasts, remove }) {
return (
<div style={{ position: “fixed”, top: 20, left: 20, right: 20, zIndex: 9999, display: “flex”, flexDirection: “column”, gap: 10 }}>
{toasts.map(t => (
<div key={t.id} onClick={() => remove(t.id)} style={{ background: “linear-gradient(135deg, #ff6b35, #ff4da6)”, color: “#fff”, padding: “14px 18px”, borderRadius: 16, fontFamily: “‘Fredoka One’, cursive”, fontSize: 15, cursor: “pointer”, boxShadow: “0 8px 32px rgba(255,107,53,0.5)”, animation: “slideIn 0.4s ease”, lineHeight: 1.5 }}>
🔔 {t.msg}
</div>
))}
</div>
);
}

// ── Profile Setup ──
function ProfileSetup({ onCreate }) {
const [name, setName] = useState(””);
const [color, setColor] = useState(”#ff6b35”);
const [photoSrc, setPhotoSrc] = useState(null);
const [saving, setSaving] = useState(false);
const fileRef = useRef();

const handlePhoto = (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = async (ev) => {
const resized = await resizeImage(ev.target.result, 300);
setPhotoSrc(resized);
};
reader.readAsDataURL(file);
};

const handleCreate = async () => {
if (!name.trim() || saving) return;
setSaving(true);
await onCreate({ name: name.trim(), photo: photoSrc, color });
setSaving(false);
};

return (
<div style={{ minHeight: “100vh”, background: C.bg, display: “flex”, alignItems: “center”, justifyContent: “center”, padding: 20, fontFamily: “‘Fredoka One’, cursive” }}>
<div style={{ background: C.card, borderRadius: 28, padding: 40, width: “100%”, maxWidth: 420, boxShadow: “0 20px 80px rgba(0,0,0,0.6)”, textAlign: “center” }}>
<h1 style={{ color: C.gold, fontSize: 32, margin: “0 0 4px”, letterSpacing: 1 }}>Family Trip 🎉</h1>
<p style={{ color: C.muted, fontSize: 14, marginBottom: 28, fontFamily: “Georgia, serif”, fontStyle: “italic” }}>Create your profile to join the fun</p>

```
    <div style={{ marginBottom: 24 }}>
      <div onClick={() => fileRef.current.click()} style={{ width: 110, height: 110, borderRadius: "50%", margin: "0 auto 12px", background: photoSrc ? "transparent" : `${color}22`, border: `3px dashed ${color}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: `0 0 24px ${color}44`, transition: "all 0.2s" }}>
        {photoSrc ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div><div style={{ fontSize: 32 }}>📷</div><div style={{ color: C.muted, fontSize: 11, fontFamily: "Nunito, sans-serif", marginTop: 4 }}>Add photo</div></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
      {photoSrc && <button onClick={() => { setPhotoSrc(null); fileRef.current.value = ""; }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, fontFamily: "Nunito, sans-serif", cursor: "pointer", textDecoration: "underline" }}>Remove</button>}
    </div>

    <div style={{ marginBottom: 20 }}>
      <p style={{ color: C.text, fontSize: 14, marginBottom: 10, textAlign: "left" }}>Your color</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {PALETTE.map(c => <div key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "3px solid white" : "3px solid transparent", boxShadow: color === c ? `0 0 12px ${c}` : "none", transition: "all 0.2s" }} />)}
      </div>
    </div>

    <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder="Your name..." style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `2px solid ${C.cardLight}`, background: "rgba(255,255,255,0.07)", color: C.text, fontSize: 18, fontFamily: "'Fredoka One', cursive", outline: "none", marginBottom: 20, boxSizing: "border-box" }} />

    <button onClick={handleCreate} disabled={!name.trim() || saving} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${color}, ${C.pink})`, color: "#fff", fontSize: 20, fontFamily: "'Fredoka One', cursive", cursor: name.trim() && !saving ? "pointer" : "not-allowed", opacity: name.trim() && !saving ? 1 : 0.5, boxShadow: `0 8px 32px ${color}55`, transition: "all 0.2s" }}>
      {saving ? "Setting up... ⏳" : "Join the Party 🎊"}
    </button>
  </div>
</div>
```

);
}

// ── Main App ──
export default function App() {
const [me, setMe] = useState(null);
const [members, setMembers] = useState([]);
const [messages, setMessages] = useState([]);
const [photos, setPhotos] = useState([]);
const [newMsg, setNewMsg] = useState(””);
const [tab, setTab] = useState(“board”);
const [toasts, setToasts] = useState([]);
const [drinkType, setDrinkType] = useState(“🍺”);
const [showMeterPicker, setShowMeterPicker] = useState(false);
const [pendingPhoto, setPendingPhoto] = useState(null);
const [photoCaption, setPhotoCaption] = useState(””);
const [expandedPhoto, setExpandedPhoto] = useState(null);
const [posting, setPosting] = useState(false);

const msgRef = useRef(null);
const toastId = useRef(0);
const photoFileRef = useRef();
const profileFileRef = useRef();

const addToast = (msg) => {
const id = ++toastId.current;
setToasts(t => […t, { id, msg }]);
setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
};
const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

// Load saved profile
useEffect(() => {
const saved = localStorage.getItem(“familyTripUserId”);
if (saved) {
getDoc(doc(db, “members”, saved)).then(snap => {
if (snap.exists()) setMe({ id: snap.id, …snap.data() });
});
}
}, []);

// Real-time members
useEffect(() => {
return onSnapshot(collection(db, “members”), snap => {
const all = snap.docs.map(d => ({ id: d.id, …d.data() }));
setMembers(all);
setMe(prev => {
if (!prev) return prev;
const updated = all.find(m => m.id === prev.id);
return updated || prev;
});
});
}, []);

// Real-time messages
useEffect(() => {
const q = query(collection(db, “messages”), orderBy(“ts”, “asc”));
return onSnapshot(q, snap => setMessages(snap.docs.map(d => ({ id: d.id, …d.data() }))));
}, []);

// Real-time photos
useEffect(() => {
const q = query(collection(db, “photos”), orderBy(“ts”, “desc”));
return onSnapshot(q, snap => setPhotos(snap.docs.map(d => ({ id: d.id, …d.data() }))));
}, []);

// Scroll chat
useEffect(() => {
if (msgRef.current && tab === “board”) msgRef.current.scrollTop = msgRef.current.scrollHeight;
}, [messages, tab]);

const handleCreate = async ({ name, photo, color }) => {
const member = { name, photo: photo || null, color, drinks: 0, meter: 0, joinedAt: serverTimestamp() };
const docRef = doc(collection(db, “members”));
await setDoc(docRef, member);
localStorage.setItem(“familyTripUserId”, docRef.id);
setMe({ id: docRef.id, …member });
await addDoc(collection(db, “messages”), { author: “System”, photo: null, color: C.gold, text: `🎉 ${name} just joined the trip! Welcome to the party!`, ts: serverTimestamp() });
addToast(`Welcome ${name}! You're in! 🎊`);
};

const updateProfilePhoto = (e) => {
const file = e.target.files[0];
if (!file || !me) return;
const reader = new FileReader();
reader.onload = async (ev) => {
const resized = await resizeImage(ev.target.result, 300);
await updateDoc(doc(db, “members”, me.id), { photo: resized });
};
reader.readAsDataURL(file);
};

const sendMessage = async () => {
if (!newMsg.trim() || !me) return;
const text = newMsg.trim();
setNewMsg(””);
await addDoc(collection(db, “messages”), { author: me.name, photo: me.photo || null, color: me.color, text, ts: serverTimestamp() });
};

const logDrink = async () => {
if (!me) return;
const newCount = (me.drinks || 0) + 1;
await updateDoc(doc(db, “members”, me.id), { drinks: newCount });
const ordinals = [“1st”,“2nd”,“3rd”,“4th”,“5th”,“6th”,“7th”,“8th”,“9th”,“10th”,“11th”,“12th”,“13th”,“14th”,“15th”];
const ord = ordinals[newCount - 1] || `${newCount}th`;
const msg = `${me.name} just finished their ${ord} drink! ${drinkType}`;
addToast(msg);
await addDoc(collection(db, “messages”), { author: “Drink Log”, photo: null, color: C.gold, text: `🍻 ${msg}`, ts: serverTimestamp() });
};

const setMeterLevel = async (level) => {
if (!me) return;
await updateDoc(doc(db, “members”, me.id), { meter: level });
setShowMeterPicker(false);
const msg = `${me.name} just moved up the Drunk-O-Meter to ${level}/10! ${level >= 8 ? "🚨" : level >= 5 ? "🔥" : "😄"}`;
addToast(msg);
await addDoc(collection(db, “messages”), { author: “Drunk-O-Meter”, photo: null, color: C.pink, text: `🌡️ ${me.name} is now at level ${level}/10 — "${METER_LABELS[level - 1]}"`, ts: serverTimestamp() });
};

const handlePhotoSelect = (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = async (ev) => {
const resized = await resizeImage(ev.target.result, 800);
setPendingPhoto(resized);
};
reader.readAsDataURL(file);
e.target.value = “”;
};

const postPhoto = async () => {
if (!pendingPhoto || !me || posting) return;
setPosting(true);
try {
await addDoc(collection(db, “photos”), { src: pendingPhoto, caption: photoCaption.trim(), author: me.name, authorId: me.id, photo: me.photo || null, color: me.color, ts: serverTimestamp(), likes: [] });
addToast(`${me.name} posted a new memory! 📸`);
setPendingPhoto(null);
setPhotoCaption(””);
} finally {
setPosting(false);
}
};

const toggleLike = async (photoId, currentLikes) => {
if (!me) return;
const liked = currentLikes.includes(me.name);
await updateDoc(doc(db, “photos”, photoId), { likes: liked ? currentLikes.filter(n => n !== me.name) : […currentLikes, me.name] });
};

if (!me) return <ProfileSetup onCreate={handleCreate} />;

const tabs = [
{ id: “board”, label: “💬”, title: “Board” },
{ id: “frozen”, label: “❄️”, title: “Frozen” },
{ id: “drinks”, label: “🍺”, title: “Drinks” },
{ id: “meter”, label: “🌡️”, title: “Meter” },
{ id: “crew”, label: “👥”, title: “Crew” },
];

return (
<div style={{ minHeight: “100vh”, background: C.bg, fontFamily: “‘Fredoka One’, cursive”, color: C.text, maxWidth: 480, margin: “0 auto” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap'); * { box-sizing: border-box; } @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } } @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } } @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #3d2660; border-radius: 4px; } input:focus, textarea:focus { outline: none; }`}</style>

```
  <Toast toasts={toasts} remove={removeToast} />

  {/* Lightbox */}
  {expandedPhoto && (
    <div onClick={() => setExpandedPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9998, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <img src={expandedPhoto.src} alt="" style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 16, objectFit: "contain" }} />
      {expandedPhoto.caption && <div style={{ color: C.text, fontFamily: "Nunito, sans-serif", fontSize: 16, marginTop: 16, textAlign: "center", fontStyle: "italic", maxWidth: 360 }}>"{expandedPhoto.caption}"</div>}
      <div style={{ color: C.muted, fontSize: 13, fontFamily: "Nunito, sans-serif", marginTop: 8 }}>{expandedPhoto.author} · {formatDate(expandedPhoto.ts)}</div>
      <div style={{ color: C.muted, fontSize: 12, marginTop: 12, fontFamily: "Nunito, sans-serif" }}>Tap anywhere to close</div>
    </div>
  )}

  {/* Photo caption modal */}
  {pendingPhoto && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: 24, width: "100%", maxWidth: 400, animation: "fadeUp 0.3s ease" }}>
        <div style={{ fontSize: 20, marginBottom: 16, textAlign: "center" }}>Add your memory ✨</div>
        <img src={pendingPhoto} alt="" style={{ width: "100%", borderRadius: 16, marginBottom: 16, maxHeight: 260, objectFit: "cover" }} />
        <textarea value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Write a caption... (optional)" rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `2px solid ${C.cardLight}`, background: "rgba(255,255,255,0.06)", color: C.text, fontSize: 15, fontFamily: "Nunito, sans-serif", resize: "none", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setPendingPhoto(null); setPhotoCaption(""); }} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `2px solid ${C.cardLight}`, background: "transparent", color: C.muted, fontSize: 16, fontFamily: "'Fredoka One', cursive", cursor: "pointer" }}>Cancel</button>
          <button onClick={postPhoto} disabled={posting} style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #c77dff, #ff4da6)", color: "#fff", fontSize: 16, fontFamily: "'Fredoka One', cursive", cursor: posting ? "not-allowed" : "pointer", opacity: posting ? 0.7 : 1 }}>
            {posting ? "Posting... ⏳" : "Post Memory 📸"}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Header */}
  <div style={{ background: `linear-gradient(135deg, ${C.card}, #1a0a3e)`, padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.cardLight}` }}>
    <div onClick={() => profileFileRef.current.click()} style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
      <Avatar src={me.photo} color={me.color} size={48} />
      <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: `2px solid ${C.bg}` }}>📷</div>
    </div>
    <input ref={profileFileRef} type="file" accept="image/*" onChange={updateProfilePhoto} style={{ display: "none" }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 17 }}>{me.name}</div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: "Nunito, sans-serif" }}>🍺 {me.drinks || 0} drinks · 🌡️ {me.meter || 0}/10</div>
    </div>
    <div style={{ fontSize: 26, animation: "float 3s ease-in-out infinite" }}>🎉</div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 13, color: C.gold }}>Family Trip</div>
      <div style={{ fontSize: 10, color: C.muted, fontFamily: "Nunito, sans-serif" }}>🟢 Live · {members.length} members</div>
    </div>
  </div>

  {/* Tabs */}
  <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.cardLight}` }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 2px 8px", border: "none", background: "transparent", color: tab === t.id ? C.accent : C.muted, fontFamily: "'Fredoka One', cursive", cursor: "pointer", borderBottom: tab === t.id ? `3px solid ${C.accent}` : "3px solid transparent", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <span style={{ fontSize: 18 }}>{t.label}</span>
        <span style={{ fontSize: 9 }}>{t.title}</span>
      </button>
    ))}
  </div>

  <div style={{ paddingBottom: 24 }}>

    {/* BOARD */}
    {tab === "board" && (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 184px)" }}>
        <div ref={msgRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
          {messages.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontFamily: "Nunito, sans-serif" }}>No messages yet. Say hello! 👋</div>}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
              {["System","Drink Log","Drunk-O-Meter"].includes(msg.author)
                ? <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${msg.color}22`, border: `2px solid ${msg.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{msg.author === "System" ? "🎉" : msg.author === "Drink Log" ? "🍺" : "🌡️"}</div>
                : <Avatar src={msg.photo} color={msg.color} size={38} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                  <span style={{ color: msg.color, fontSize: 14 }}>{msg.author}</span>
                  <span style={{ color: C.muted, fontSize: 11, fontFamily: "Nunito, sans-serif" }}>{formatTime(msg.ts)}</span>
                </div>
                <div style={{ background: msg.author === me.name ? `${me.color}22` : C.card, borderRadius: "4px 16px 16px 16px", padding: "10px 14px", fontSize: 15, fontFamily: "Nunito, sans-serif", lineHeight: 1.5, border: `1px solid ${msg.author === me.name ? me.color + "44" : C.cardLight}` }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.cardLight}`, display: "flex", gap: 10, background: C.bg }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Say something..." style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: `2px solid ${C.cardLight}`, background: C.card, color: C.text, fontSize: 15, fontFamily: "Nunito, sans-serif" }} />
          <button onClick={sendMessage} style={{ width: 48, height: 48, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${me.color}, ${C.pink})`, color: "#fff", fontSize: 20, cursor: "pointer" }}>➤</button>
        </div>
      </div>
    )}

    {/* FROZEN IN TIME */}
    {tab === "frozen" && (
      <div style={{ padding: 16 }}>
        <div style={{ background: "linear-gradient(135deg, #0d0520, #1e0840)", borderRadius: 22, padding: "22px 20px 18px", marginBottom: 16, textAlign: "center", border: `1px solid #c77dff44`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -20%, #c77dff18 0%, transparent 65%)" }} />
          <div style={{ fontSize: 40, marginBottom: 6 }}>❄️ 📸 ❄️</div>
          <div style={{ fontSize: 26, color: "#c77dff" }}>Frozen in Time</div>
          <div style={{ color: C.muted, fontSize: 13, fontFamily: "Nunito, sans-serif", marginTop: 5 }}>Your weekend memories, preserved forever</div>
        </div>
        <input ref={photoFileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
        <button onClick={() => photoFileRef.current.click()} style={{ width: "100%", padding: "16px", borderRadius: 18, border: `2px dashed #c77dff88`, background: "rgba(199,125,255,0.07)", color: "#c77dff", fontSize: 18, fontFamily: "'Fredoka One', cursive", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>📷</span> Freeze a Moment
        </button>
        {photos.length === 0
          ? <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 60, marginBottom: 14 }}>🌅</div>
              <div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 15 }}>No memories frozen yet</div>
              <div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 13, marginTop: 6 }}>Be the first to capture this weekend!</div>
            </div>
          : photos.map((p, idx) => (
              <div key={p.id} style={{ background: C.card, borderRadius: 22, marginBottom: 20, overflow: "hidden", border: `1px solid ${C.cardLight}`, animation: idx === 0 ? "fadeUp 0.4s ease" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 10px" }}>
                  <Avatar src={p.photo} color={p.color} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: p.color, fontSize: 15 }}>{p.author}</div>
                    <div style={{ color: C.muted, fontSize: 11, fontFamily: "Nunito, sans-serif" }}>{formatDate(p.ts)}</div>
                  </div>
                </div>
                <div onClick={() => setExpandedPhoto(p)} style={{ cursor: "zoom-in" }}>
                  <img src={p.src} alt="" style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }} />
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: p.caption ? 10 : 0 }}>
                    <button onClick={() => toggleLike(p.id, p.likes || [])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, filter: (p.likes||[]).includes(me.name) ? "none" : "grayscale(0.8)", transition: "transform 0.15s", transform: (p.likes||[]).includes(me.name) ? "scale(1.15)" : "scale(1)" }}>❤️</button>
                    <span style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 13 }}>{(p.likes||[]).length > 0 ? `${p.likes.length} ${p.likes.length === 1 ? "love" : "loves"}` : "Be the first to love this"}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 18, cursor: "pointer", opacity: 0.6 }} onClick={() => setExpandedPhoto(p)}>🔍</span>
                  </div>
                  {p.caption && <div style={{ fontFamily: "Nunito, sans-serif", fontSize: 14, color: C.text, lineHeight: 1.55 }}><span style={{ color: p.color, marginRight: 6 }}>{p.author}</span><span style={{ fontStyle: "italic" }}>{p.caption}</span></div>}
                  {(p.likes||[]).length > 0 && <div style={{ color: C.muted, fontSize: 11, fontFamily: "Nunito, sans-serif", marginTop: 5 }}>❤️ {p.likes.join(", ")}</div>}
                </div>
              </div>
            ))
        }
      </div>
    )}

    {/* DRINKS */}
    {tab === "drinks" && (
      <div style={{ padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 80, animation: "float 2s ease-in-out infinite" }}>{drinkType}</div>
          <div style={{ fontSize: 56, color: C.gold, lineHeight: 1 }}>{me.drinks || 0}</div>
          <div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 14 }}>total drinks logged</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 10 }}>What are you drinking?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {DRINK_EMOJIS.map(d => <button key={d} onClick={() => setDrinkType(d)} style={{ fontSize: 32, padding: "8px 12px", borderRadius: 14, cursor: "pointer", background: drinkType === d ? C.cardLight : C.card, border: drinkType === d ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.2s" }}>{d}</button>)}
          </div>
        </div>
        <button onClick={logDrink} style={{ width: "100%", padding: "20px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, color: "#fff", fontSize: 22, fontFamily: "'Fredoka One', cursive", cursor: "pointer", boxShadow: "0 8px 32px rgba(255,107,53,0.5)", animation: "pulse 2s ease-in-out infinite", marginBottom: 28 }}>
          {drinkType} Cheers! Log a Drink
        </button>
        <p style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>🏆 Crew Drink Leaderboard</p>
        {[...members].sort((a, b) => (b.drinks||0) - (a.drinks||0)).map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.card, borderRadius: 16, marginBottom: 10, border: m.id === me.id ? `2px solid ${m.color}66` : "2px solid transparent" }}>
            <div style={{ fontSize: 22, width: 30, textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</div>
            <Avatar src={m.photo} color={m.color} size={38} />
            <div style={{ flex: 1 }}><div style={{ color: m.color, fontSize: 16 }}>{m.name}</div></div>
            <div style={{ fontSize: 22, color: C.gold }}>{m.drinks || 0} 🍺</div>
          </div>
        ))}
      </div>
    )}

    {/* METER */}
    {tab === "meter" && (
      <div style={{ padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 18, color: C.muted, marginBottom: 8, fontFamily: "Nunito, sans-serif" }}>Your current level</div>
          {!me.meter
            ? <div style={{ fontSize: 48, color: C.muted }}>—</div>
            : <>
                <div style={{ fontSize: 80, lineHeight: 1, color: getMeterColor(me.meter) }}>{me.meter}</div>
                <div style={{ fontSize: 16, color: getMeterColor(me.meter), marginTop: 4 }}>/ 10 — "{METER_LABELS[me.meter - 1]}"</div>
                <div style={{ height: 12, background: C.cardLight, borderRadius: 8, margin: "16px 0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${me.meter * 10}%`, background: `linear-gradient(90deg, #39ff14, ${getMeterColor(me.meter)})`, borderRadius: 8, transition: "width 0.5s ease" }} />
                </div>
              </>
          }
        </div>
        <button onClick={() => setShowMeterPicker(!showMeterPicker)} style={{ width: "100%", padding: "18px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${C.pink}, #c77dff)`, color: "#fff", fontSize: 20, fontFamily: "'Fredoka One', cursive", cursor: "pointer", boxShadow: "0 8px 32px rgba(255,77,166,0.4)", marginBottom: 20 }}>🌡️ Update My Level</button>
        {showMeterPicker && (
          <div style={{ background: C.card, borderRadius: 20, padding: 16, marginBottom: 24, border: `1px solid ${C.cardLight}` }}>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 12, textAlign: "center", fontFamily: "Nunito, sans-serif" }}>Tap your level — this notifies everyone!</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {METER_LABELS.map((label, i) => {
                const v = i + 1; const mc = getMeterColor(v);
                return <button key={v} onClick={() => setMeterLevel(v)} style={{ padding: "12px 10px", borderRadius: 14, border: `2px solid ${mc}44`, background: me.meter === v ? `${mc}22` : "rgba(255,255,255,0.04)", color: me.meter === v ? mc : C.muted, cursor: "pointer", fontFamily: "Nunito, sans-serif", fontSize: 13, textAlign: "left", transition: "all 0.2s" }}>
                  <span style={{ color: mc, fontFamily: "'Fredoka One', cursive", fontSize: 16, marginRight: 6 }}>{v}</span>{label}
                </button>;
              })}
            </div>
          </div>
        )}
        <p style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>🌡️ Crew Status</p>
        {members.map(m => (
          <div key={m.id} style={{ padding: "14px 16px", background: C.card, borderRadius: 16, marginBottom: 10, border: m.id === me.id ? `2px solid ${m.color}66` : "2px solid transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: m.meter > 0 ? 8 : 0 }}>
              <Avatar src={m.photo} color={m.color} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ color: m.color, fontSize: 16 }}>{m.name}</div>
                <div style={{ color: C.muted, fontSize: 12, fontFamily: "Nunito, sans-serif" }}>{!m.meter ? "No level set yet" : `Level ${m.meter}/10 — "${METER_LABELS[m.meter - 1]}"`}</div>
              </div>
              <div style={{ fontSize: 24 }}>{!m.meter ? "😐" : m.meter >= 8 ? "🚨" : m.meter >= 5 ? "🔥" : "😄"}</div>
            </div>
            {m.meter > 0 && <div style={{ height: 8, background: C.cardLight, borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${m.meter * 10}%`, background: `linear-gradient(90deg, #39ff14, ${getMeterColor(m.meter)})`, borderRadius: 6 }} /></div>}
          </div>
        ))}
      </div>
    )}

    {/* CREW */}
    {tab === "crew" && (
      <div style={{ padding: 20 }}>
        <div style={{ background: `linear-gradient(135deg, ${C.card}, ${C.cardLight})`, borderRadius: 24, padding: 24, marginBottom: 20, textAlign: "center", border: `1px solid ${C.cardLight}` }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
            <Avatar src={me.photo} color={me.color} size={90} />
            <div onClick={() => profileFileRef.current.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", border: `2px solid ${C.bg}` }}>📷</div>
          </div>
          <div style={{ fontSize: 24, color: me.color }}>{me.name}</div>
          <div style={{ color: C.muted, fontSize: 12, fontFamily: "Nunito, sans-serif", marginTop: 4 }}>Tap 📷 to update your photo</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            {[{ val: me.drinks || 0, label: "Drinks", color: C.gold }, { val: me.meter || "—", label: "Meter", color: C.pink }, { val: photos.filter(p => p.authorId === me.id).length, label: "Photos", color: "#c77dff" }].map(stat => (
              <div key={stat.label} style={{ background: C.bg, borderRadius: 14, padding: "10px 16px", textAlign: "center" }}>
                <div style={{ color: stat.color, fontSize: 26 }}>{stat.val}</div>
                <div style={{ color: C.muted, fontSize: 11, fontFamily: "Nunito, sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>👨‍👩‍👧 The Crew ({members.length})</p>
        {members.filter(m => m.id !== me.id).length === 0
          ? <div style={{ background: C.card, borderRadius: 20, padding: 28, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>😢</div><div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 14 }}>You're the only one here so far!</div><div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 13, marginTop: 6 }}>Share the app link with your family!</div></div>
          : members.filter(m => m.id !== me.id).map(m => (
            <div key={m.id} style={{ background: C.card, borderRadius: 16, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={m.photo} color={m.color} size={50} />
              <div style={{ flex: 1 }}>
                <div style={{ color: m.color, fontSize: 16 }}>{m.name}</div>
                <div style={{ color: C.muted, fontSize: 12, fontFamily: "Nunito, sans-serif" }}>🍺 {m.drinks || 0} drinks · 🌡️ {m.meter > 0 ? `${m.meter}/10` : "—"}</div>
              </div>
            </div>
          ))
        }
        <div style={{ background: C.card, borderRadius: 20, padding: 20, marginTop: 10, textAlign: "center", border: `2px dashed ${C.cardLight}` }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
          <div style={{ color: C.text, fontSize: 16, marginBottom: 6 }}>Invite Family Members</div>
          <div style={{ color: C.muted, fontFamily: "Nunito, sans-serif", fontSize: 13 }}>Share this app's URL — everyone joins the same live trip!</div>
        </div>
      </div>
    )}
  </div>
</div>
```

);
}
