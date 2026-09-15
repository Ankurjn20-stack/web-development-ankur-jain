# web-development-ankur-jainimport React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, Plus, Check, X, ChevronRight, ChevronDown, Sparkles, Trash2,
  ArrowUpDown, Loader2, Star, Heart, Flame, Wallet, Award, MessageSquare,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seed data — used the first time anyone opens this artifact, before real
// gigs/bookings/reviews exist in shared storage.
// ---------------------------------------------------------------------------
const seedGigs = [
  {
    id: "g1",
    creatorName: "Priya Nair",
    title: "I'll edit your Reels into a scroll-stopping cut",
    category: "Video editing",
    rate: 45,
    tags: ["Reels", "captions", "fast turnaround"],
    description:
      "Fast turnaround jump-cuts, captions, and pacing tuned for retention. Send raw footage, get a ready-to-post Reel in 48 hours.",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "g2",
    creatorName: "Diego Alvarez",
    title: "Custom lo-fi beat for your podcast intro",
    category: "Music",
    rate: 80,
    tags: ["lo-fi", "royalty-free", "mixing"],
    description:
      "Original 15–30 second loop, mixed and mastered, royalty-free forever. Two revision rounds included.",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "g3",
    creatorName: "Priya Nair",
    title: "Thumbnail design that actually gets clicks",
    category: "Design",
    rate: 25,
    tags: ["YouTube", "thumbnails"],
    description:
      "Bold, high-contrast YouTube thumbnails based on what's working in your niche right now. Source files included.",
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: "g4",
    creatorName: "Sam Okoye",
    title: "1:1 coaching call — growing 0 to 10k followers",
    category: "Coaching",
    rate: 60,
    tags: ["strategy", "1:1 call"],
    description:
      "45-minute call walking through your niche, posting cadence, and hook writing. Recording included so you can rewatch.",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];

// A few seed reviews so the marketplace doesn't feel empty on first load.
// bookingIds here are synthetic and will never collide with real bookings.
const seedReviews = [
  { id: "r1", bookingId: "seed-r1", gigId: "g1", clientName: "Marcus Webb", rating: 5, comment: "Turned my raw clips into something that actually kept people watching. Fast too.", createdAt: Date.now() - 1000 * 60 * 60 * 40 },
  { id: "r2", bookingId: "seed-r2", gigId: "g1", clientName: "Aisha Rahman", rating: 4, comment: "Great pacing, asked for one small caption tweak and it was done same day.", createdAt: Date.now() - 1000 * 60 * 60 * 90 },
  { id: "r3", bookingId: "seed-r3", gigId: "g1", clientName: "Owen Clarke", rating: 5, comment: "Best editor I've worked with for short-form. Will book again.", createdAt: Date.now() - 1000 * 60 * 60 * 200 },
  { id: "r4", bookingId: "seed-r4", gigId: "g2", clientName: "Nina Petrov", rating: 5, comment: "Exactly the vibe I described, mixed cleanly, no notes.", createdAt: Date.now() - 1000 * 60 * 60 * 60 },
  { id: "r5", bookingId: "seed-r5", gigId: "g2", clientName: "Leo Fischer", rating: 5, comment: "Loop is seamless, my listeners keep asking where the intro music is from.", createdAt: Date.now() - 1000 * 60 * 60 * 300 },
  { id: "r6", bookingId: "seed-r6", gigId: "g4", clientName: "Tara Singh", rating: 4, comment: "Practical advice, not generic — gave me an actual posting plan.", createdAt: Date.now() - 1000 * 60 * 60 * 20 },
];

const CATEGORIES = ["Video editing", "Design", "Music", "Coaching", "Writing", "Photography"];
const CATEGORY_COLORS = {
  "Video editing": { bg: "#EAEDFF", fg: "#2B4EFF" },
  Design: { bg: "#F1EBFF", fg: "#7C3AED" },
  Music: { bg: "#FCE8F5", fg: "#C21E8F" },
  Coaching: { bg: "#E1F7F4", fg: "#0F9B8E" },
  Writing: { bg: "#FFF3E0", fg: "#B45309" },
  Photography: { bg: "#EEF2F6", fg: "#475569" },
};
const AVATAR_COLORS = ["#2B4EFF", "#7C3AED", "#C21E8F", "#0F9B8E", "#B45309", "#475569", "#DC2626"];

const STORAGE_KEYS = {
  gigs: "sidegig:gigs",
  bookings: "sidegig:bookings",
  reviews: "sidegig:reviews",
  identity: "sidegig:identity",
  favorites: "sidegig:favorites",
};

const uid = () => Math.random().toString(36).slice(2, 10);

const timeAgo = (ts) => {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || parts[0][1] || "")).toUpperCase();
}

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function Avatar({ name, size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(name || "?"),
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
      }}
    >
      {initials(name || "?")}
    </div>
  );
}

const STATUS_STYLE = {
  Pending: { bg: "#FFF3CF", fg: "#8A6300", dot: "#E4A400" },
  Accepted: { bg: "#DEFBE6", fg: "#146C2E", dot: "#1C9A45" },
  Completed: { bg: "#E1EBFF", fg: "#1E40AF", dot: "#2B4EFF" },
  Declined: { bg: "#FBE2DE", fg: "#9A2A16", dot: "#D8402A" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 3,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        whiteSpace: "nowrap",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

// -- star rating (display, partial-fill) -------------------------------------
function StarRow({ value, size = 13, color = "#E4A400" }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <span key={i} style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
            <Star size={size} color="#E4E0D6" fill="#E4E0D6" style={{ position: "absolute", top: 0, left: 0 }} />
            <span style={{ position: "absolute", top: 0, left: 0, width: `${fill}%`, overflow: "hidden" }}>
              <Star size={size} color={color} fill={color} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// -- star rating (interactive picker) -----------------------------------------
function StarPicker({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{ background: "none", border: "none", padding: 2, display: "flex" }}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
        >
          <Star size={size} color={i <= shown ? "#E4A400" : "#D8D3C7"} fill={i <= shown ? "#E4A400" : "none"} />
        </button>
      ))}
    </span>
  );
}

function RatingLine({ avg, count, size = 13 }) {
  if (!count) {
    return <span style={{ fontSize: 12, color: "#A39D8F" }}>No reviews yet</span>;
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <StarRow value={avg} size={size} />
      <span style={{ fontSize: 12, color: "#65605A", fontWeight: 600 }}>{avg.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: "#A39D8F" }}>({count})</span>
    </span>
  );
}

// -- toasts ---------------------------------------------------------------
function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, display: "grid", gap: 8, zIndex: 100 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toastin"
          style={{
            background: "#17181C",
            color: "white",
            padding: "11px 16px",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 6px 20px rgba(23,24,28,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 300,
          }}
        >
          {t.icon}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function App() {
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [tab, setTab] = useState("browse");

  const [creatorName, setCreatorName] = useState("Priya Nair");
  const [clientName, setClientName] = useState("Jordan Lee");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sortBy, setSortBy] = useState("newest");
  const [bookingGigId, setBookingGigId] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [showDecisions, setShowDecisions] = useState(false);
  const [dashFilter, setDashFilter] = useState("All");
  const [toasts, setToasts] = useState([]);

  function pushToast(message, icon = null) {
    const id = uid();
    setToasts((t) => [...t, { id, message, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }

  // -- initial load from persistent storage -----------------------------
  useEffect(() => {
    (async () => {
      try {
        let g;
        try {
          const r = await window.storage.get(STORAGE_KEYS.gigs, true);
          g = r ? JSON.parse(r.value) : null;
        } catch {
          g = null;
        }
        if (!g) {
          g = seedGigs;
          try {
            await window.storage.set(STORAGE_KEYS.gigs, JSON.stringify(g), true);
          } catch {}
        }
        setGigs(g);

        let b;
        try {
          const r = await window.storage.get(STORAGE_KEYS.bookings, true);
          b = r ? JSON.parse(r.value) : null;
        } catch {
          b = null;
        }
        setBookings(b || []);

        let rv;
        try {
          const r = await window.storage.get(STORAGE_KEYS.reviews, true);
          rv = r ? JSON.parse(r.value) : null;
        } catch {
          rv = null;
        }
        if (!rv) {
          rv = seedReviews;
          try {
            await window.storage.set(STORAGE_KEYS.reviews, JSON.stringify(rv), true);
          } catch {}
        }
        setReviews(rv);

        try {
          const r = await window.storage.get(STORAGE_KEYS.favorites, false);
          setFavorites(r ? JSON.parse(r.value) : []);
        } catch {
          setFavorites([]);
        }

        try {
          const r = await window.storage.get(STORAGE_KEYS.identity, false);
          if (r) {
            const id = JSON.parse(r.value);
            if (id.creatorName) setCreatorName(id.creatorName);
            if (id.clientName) setClientName(id.clientName);
          }
        } catch {}
      } catch {
        setGigs(seedGigs);
        setBookings([]);
        setReviews(seedReviews);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -- persist helpers ----------------------------------------------------
  const persist = async (key, value, shared) => {
    try {
      const ok = await window.storage.set(key, JSON.stringify(value), shared);
      if (!ok) throw new Error("no result");
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };

  const identityDebounce = useRef(null);
  const skipIdentitySave = useRef(true);
  useEffect(() => {
    if (loading) return;
    // Skip the run that fires the moment loading finishes — creatorName/clientName
    // were just set FROM storage, so saving them back again is a wasted write.
    if (skipIdentitySave.current) {
      skipIdentitySave.current = false;
      return;
    }
    clearTimeout(identityDebounce.current);
    identityDebounce.current = setTimeout(() => {
      persist(STORAGE_KEYS.identity, { creatorName, clientName }, false);
    }, 500);
  }, [creatorName, clientName, loading]);

  // -- derived data ---------------------------------------------------------
  const categoryColor = (c) => CATEGORY_COLORS[c] || { bg: "#EEE", fg: "#555" };

  const reviewsByGig = useMemo(() => {
    const map = {};
    for (const r of reviews) (map[r.gigId] = map[r.gigId] || []).push(r);
    return map;
  }, [reviews]);

  const gigRating = (gigId) => {
    const list = reviewsByGig[gigId] || [];
    if (list.length === 0) return { avg: 0, count: 0 };
    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
    return { avg, count: list.length };
  };

  const bookingsByGig = (gigId) => bookings.filter((b) => b.gigId === gigId).sort((a, b) => b.createdAt - a.createdAt);
  const bookingCountByGig = (gigId) => bookings.filter((b) => b.gigId === gigId).length;

  const reviewedBookingIds = useMemo(() => new Set(reviews.map((r) => r.bookingId)), [reviews]);

  const filteredGigs = useMemo(() => {
    let list = gigs
      .filter((g) => (category === "All categories" ? true : g.category === category))
      .filter((g) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.creatorName.toLowerCase().includes(q) ||
          (g.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      });
    if (sortBy === "newest") list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "low") list = [...list].sort((a, b) => a.rate - b.rate);
    if (sortBy === "high") list = [...list].sort((a, b) => b.rate - a.rate);
    if (sortBy === "rating") {
      list = [...list].sort((a, b) => {
        const ra = gigRating(a.id), rb = gigRating(b.id);
        if (rb.avg !== ra.avg) return rb.avg - ra.avg;
        return rb.count - ra.count;
      });
    }
    if (sortBy === "trending") {
      list = [...list].sort((a, b) => bookingCountByGig(b.id) - bookingCountByGig(a.id));
    }
    return list;
  }, [gigs, search, category, sortBy, reviewsByGig, bookings]);

  const myCreatorGigs = gigs.filter((g) => g.creatorName.trim().toLowerCase() === creatorName.trim().toLowerCase());
  const myCreatorGigIds = new Set(myCreatorGigs.map((g) => g.id));
  const myAllBookings = bookings.filter((b) => myCreatorGigIds.has(b.gigId));
  const dashStats = {
    All: myAllBookings.length,
    Pending: myAllBookings.filter((b) => b.status === "Pending").length,
    Accepted: myAllBookings.filter((b) => b.status === "Accepted").length,
    Completed: myAllBookings.filter((b) => b.status === "Completed").length,
    Declined: myAllBookings.filter((b) => b.status === "Declined").length,
  };
  const totalEarnings = myCreatorGigs.reduce((sum, g) => {
    const completed = bookings.filter((b) => b.gigId === g.id && b.status === "Completed").length;
    return sum + completed * g.rate;
  }, 0);
  const myGigRatings = myCreatorGigs.map((g) => gigRating(g.id)).filter((r) => r.count > 0);
  const overallAvgRating =
    myGigRatings.length > 0
      ? myGigRatings.reduce((s, r) => s + r.avg * r.count, 0) / myGigRatings.reduce((s, r) => s + r.count, 0)
      : 0;
  const overallReviewCount = myGigRatings.reduce((s, r) => s + r.count, 0);

  const myClientBookings = bookings
    .filter((b) => b.clientName.trim().toLowerCase() === clientName.trim().toLowerCase())
    .sort((a, b) => b.createdAt - a.createdAt);

  const favoriteGigs = gigs.filter((g) => favorites.includes(g.id));

  // -- actions ---------------------------------------------------------------
  function postGig(gig) {
    const next = [{ ...gig, id: uid(), createdAt: Date.now() }, ...gigs];
    setGigs(next);
    persist(STORAGE_KEYS.gigs, next, true);
    setTab("browse");
    pushToast("Gig posted — it's live on Browse & search.", <Sparkles size={15} />);
  }

  function deleteGig(gigId) {
    const nextGigs = gigs.filter((g) => g.id !== gigId);
    const nextBookings = bookings.filter((b) => b.gigId !== gigId);
    const nextReviews = reviews.filter((r) => r.gigId !== gigId);
    setGigs(nextGigs);
    setBookings(nextBookings);
    setReviews(nextReviews);
    persist(STORAGE_KEYS.gigs, nextGigs, true);
    persist(STORAGE_KEYS.bookings, nextBookings, true);
    persist(STORAGE_KEYS.reviews, nextReviews, true);
  }

  function submitBooking(gigId, { name, message }) {
    const booking = { id: uid(), gigId, clientName: name, message, status: "Pending", createdAt: Date.now() };
    // DP2 — intentionally no check against existing bookings on this gig.
    const next = [booking, ...bookings];
    setBookings(next);
    persist(STORAGE_KEYS.bookings, next, true);
    setBookingGigId(null);
    setConfirmedBooking(booking);
  }

  function setBookingStatus(bookingId, status) {
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    setBookings(next);
    persist(STORAGE_KEYS.bookings, next, true);
    if (status === "Accepted") pushToast("Booking accepted.", <Check size={15} />);
    if (status === "Declined") pushToast("Booking declined.", <X size={15} />);
    if (status === "Completed") pushToast("Marked as completed — client can now leave a review.", <Award size={15} />);
  }

  function withdrawBooking(bookingId) {
    const next = bookings.filter((b) => b.id !== bookingId);
    setBookings(next);
    persist(STORAGE_KEYS.bookings, next, true);
  }

  function submitReview(booking, { rating, comment }) {
    const review = {
      id: uid(),
      bookingId: booking.id,
      gigId: booking.gigId,
      clientName: booking.clientName,
      rating,
      comment: comment.trim(),
      createdAt: Date.now(),
    };
    const next = [review, ...reviews];
    setReviews(next);
    persist(STORAGE_KEYS.reviews, next, true);
    setReviewingBooking(null);
    pushToast("Review posted. Thanks for the feedback.", <Star size={15} />);
  }

  function toggleFavorite(gigId) {
    const next = favorites.includes(gigId) ? favorites.filter((id) => id !== gigId) : [...favorites, gigId];
    setFavorites(next);
    persist(STORAGE_KEYS.favorites, next, false);
  }

  async function resetDemoData() {
    setGigs(seedGigs);
    setBookings([]);
    setReviews(seedReviews);
    setFavorites([]);
    await persist(STORAGE_KEYS.gigs, seedGigs, true);
    await persist(STORAGE_KEYS.bookings, [], true);
    await persist(STORAGE_KEYS.reviews, seedReviews, true);
    await persist(STORAGE_KEYS.favorites, [], false);
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#F7F5F0", color: "#17181C", minHeight: "100vh", width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input, textarea, select { font-family: inherit; }
        ::selection { background: #2B4EFF; color: white; }
        .hoverline { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .hoverline:hover { border-color: #C7C1B2 !important; box-shadow: 0 2px 10px rgba(23,24,28,0.05); }
        .tabbtn:focus-visible, .hoverline:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid #2B4EFF; outline-offset: 2px;
        }
        .tabscroll::-webkit-scrollbar { display: none; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .fadein { animation: fadein 0.25s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes toastin { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .toastin { animation: toastin 0.2s ease; }
        .heartbtn { transition: transform 0.12s ease; }
        .heartbtn:active { transform: scale(0.85); }
        @media (max-width: 640px) {
          .identityRow { width: 100%; justify-content: flex-start !important; }
          .identityRow input { flex: 1; }
        }
      `}</style>

      <header style={{ borderBottom: "1px solid #E4E0D6", background: "#F7F5F0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, margin: 0, letterSpacing: "-0.02em" }}>
                Sidegig
              </h1>
              {saveError && (
                <span style={{ fontSize: 11, color: "#D8402A" }} title="Your last change may not have saved.">
                  changes aren't saving
                </span>
              )}
            </div>
            <div className="identityRow" style={{ display: "flex", gap: 18, fontSize: 13, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#65605A" }}>
                Creator name
                <input
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  style={{ border: "1px solid #D8D3C7", borderRadius: 3, padding: "5px 8px", fontSize: 13, width: 130, background: "white" }}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#65605A" }}>
                Client name
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ border: "1px solid #D8D3C7", borderRadius: 3, padding: "5px 8px", fontSize: 13, width: 130, background: "white" }}
                />
              </label>
            </div>
          </div>

          <nav className="tabscroll" style={{ display: "flex", gap: 4, marginTop: 22, overflowX: "auto" }}>
            {[
              ["browse", "Browse & search"],
              ["post", "Post a gig"],
              ["dashboard", "Creator dashboard"],
              ["mybookings", "My bookings"],
              ["saved", "Saved"],
            ].map(([key, label]) => (
              <button
                key={key}
                className="tabbtn"
                onClick={() => setTab(key)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: tab === key ? "2px solid #17181C" : "2px solid transparent",
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: tab === key ? 600 : 500,
                  color: tab === key ? "#17181C" : "#8A8478",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {label}
                {key === "dashboard" && dashStats.Pending > 0 && (
                  <span style={{ marginLeft: 6, background: "#E4A400", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>
                    {dashStats.Pending}
                  </span>
                )}
                {key === "saved" && favoriteGigs.length > 0 && (
                  <span style={{ marginLeft: 6, background: "#D8D3C7", color: "#17181C", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>
                    {favoriteGigs.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8A8478", fontSize: 14, padding: "60px 0", justifyContent: "center" }}>
            <Loader2 size={16} className="spin" />
            Loading marketplace…
          </div>
        ) : (
          <div className="fadein" key={tab}>
            {tab === "browse" && (
              <BrowseView
                gigs={filteredGigs}
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categoryColor={categoryColor}
                onBook={(id) => setBookingGigId(id)}
                gigRating={gigRating}
                bookingCountByGig={bookingCountByGig}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onStartEarning={() => setTab("post")}
              />
            )}
            {tab === "post" && <PostGigView onSubmit={postGig} defaultCreator={creatorName} />}
            {tab === "dashboard" && (
              <DashboardView
                creatorName={creatorName}
                gigs={myCreatorGigs}
                bookingsByGig={bookingsByGig}
                setBookingStatus={setBookingStatus}
                deleteGig={deleteGig}
                categoryColor={categoryColor}
                stats={dashStats}
                filter={dashFilter}
                setFilter={setDashFilter}
                totalEarnings={totalEarnings}
                overallAvgRating={overallAvgRating}
                overallReviewCount={overallReviewCount}
                gigRating={gigRating}
              />
            )}
            {tab === "mybookings" && (
              <MyBookingsView
                clientName={clientName}
                bookings={myClientBookings}
                gigs={gigs}
                categoryColor={categoryColor}
                onRebook={(id) => setBookingGigId(id)}
                onWithdraw={withdrawBooking}
                reviewedBookingIds={reviewedBookingIds}
                onReview={(b) => setReviewingBooking(b)}
                reviews={reviews}
              />
            )}
            {tab === "saved" && (
              <SavedView
                gigs={favoriteGigs}
                categoryColor={categoryColor}
                gigRating={gigRating}
                bookingCountByGig={bookingCountByGig}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onBook={(id) => setBookingGigId(id)}
              />
            )}

            <div style={{ marginTop: 56, borderTop: "1px solid #E4E0D6", paddingTop: 18 }}>
              <button
                onClick={() => setShowDecisions((s) => !s)}
                style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#65605A", padding: 0 }}
              >
                {showDecisions ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Product decisions behind this build
              </button>
              {showDecisions && (
                <div style={{ marginTop: 14, display: "grid", gap: 14, fontSize: 13, color: "#4A453E", lineHeight: 1.6, maxWidth: 640 }}>
                  <div>
                    <strong style={{ color: "#17181C" }}>Rejection —</strong> a declined booking stays visible to the
                    client in My bookings, marked Declined, with no reason field. The client can book again with one
                    click, and isn't blocked from that gig or the marketplace.
                  </div>
                  <div>
                    <strong style={{ color: "#17181C" }}>Double booking —</strong> a gig is a repeatable service, not
                    a single calendar slot, so several clients can have a Pending or Accepted booking on the same gig
                    at once. The creator manages capacity manually from their dashboard.
                  </div>
                  <div>
                    <strong style={{ color: "#17181C" }}>Reviews —</strong> only a client with a booking the creator
                    marked Completed can leave a review, one review per booking, and it can't be edited afterward —
                    that keeps ratings tied to a real transaction instead of open voting.
                  </div>
                  <div>
                    <strong style={{ color: "#17181C" }}>Discovery —</strong> Browse defaults to newest-first, but
                    price, rating, and trending sorts are one click away, so no single ranking rule is forced on
                    everyone.
                  </div>
                </div>
              )}
              <div style={{ marginTop: 18, fontSize: 12, color: "#A39D8F" }}>
                Gigs, bookings, and reviews are shared marketplace data — visible to anyone who opens this app. Saved
                gigs are private to you.{" "}
                <button onClick={resetDemoData} style={{ background: "none", border: "none", color: "#8A8478", textDecoration: "underline", fontSize: 12, padding: 0 }}>
                  Reset demo data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {bookingGigId && (
        <BookingModal gig={gigs.find((g) => g.id === bookingGigId)} defaultName={clientName} onClose={() => setBookingGigId(null)} onSubmit={submitBooking} />
      )}
      {confirmedBooking && (
        <ConfirmationModal booking={confirmedBooking} gig={gigs.find((g) => g.id === confirmedBooking.gigId)} onClose={() => setConfirmedBooking(null)} />
      )}
      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          gig={gigs.find((g) => g.id === reviewingBooking.gigId)}
          onClose={() => setReviewingBooking(null)}
          onSubmit={submitReview}
        />
      )}
      <ToastStack toasts={toasts} />
    </div>
  );
}

// ---------------------------------------------------------------------------
function GigCard({ g, categoryColor, onBook, gigRating, bookingCountByGig, favorites, toggleFavorite }) {
  const cc = categoryColor(g.category);
  const { avg, count } = gigRating(g.id);
  const trending = bookingCountByGig(g.id) >= 3;
  const isFav = favorites.includes(g.id);
  return (
    <div className="hoverline" style={{ border: "1px solid #E4E0D6", borderRadius: 4, padding: "18px 20px", background: "white", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", position: "relative" }}>
      <button
        className="heartbtn"
        onClick={() => toggleFavorite(g.id)}
        title={isFav ? "Remove from saved" : "Save this gig"}
        style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", padding: 4, display: "flex" }}
      >
        <Heart size={17} color={isFav ? "#C21E8F" : "#C7C1B2"} fill={isFav ? "#C21E8F" : "none"} />
      </button>
      <div style={{ flex: "1 1 380px", display: "flex", gap: 12 }}>
        <Avatar name={g.creatorName} size={34} />
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cc.fg, background: cc.bg, padding: "2px 8px", borderRadius: 3 }}>{g.category}</span>
            <span style={{ fontSize: 12, color: "#8A8478" }}>{g.creatorName} · {timeAgo(g.createdAt)}</span>
            {trending && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#B45309", background: "#FFF3E0", padding: "2px 7px", borderRadius: 3 }}>
                <Flame size={11} /> Trending
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, margin: "0 0 4px", fontWeight: 600, paddingRight: 24 }}>{g.title}</h3>
          <div style={{ marginBottom: 6 }}>
            <RatingLine avg={avg} count={count} />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#4A453E", lineHeight: 1.5, maxWidth: 500 }}>{g.description}</p>
          {g.tags && g.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {g.tags.map((t) => (
                <span key={t} style={{ fontSize: 11, color: "#65605A", background: "#F1EFE7", padding: "2px 8px", borderRadius: 20 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>${g.rate}</div>
        <button onClick={() => onBook(g.id)} style={{ background: "#17181C", color: "white", border: "none", borderRadius: 3, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
          Book this gig
        </button>
      </div>
    </div>
  );
}

function BrowseView({ gigs, search, setSearch, category, setCategory, sortBy, setSortBy, categoryColor, onBook, gigRating, bookingCountByGig, favorites, toggleFavorite, onStartEarning }) {
  return (
    <div>
      <section
        style={{
          background: "#17181C",
          color: "white",
          borderRadius: 8,
          padding: "42px 40px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 620 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#B9C4FF", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 14 }}>
            <Sparkles size={14} /> Small skills. Big possibilities.
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 14px", maxWidth: 560 }}>
            Find the perfect side gig for your next idea.
          </h2>
          <p style={{ color: "#C7C9D1", fontSize: 16, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 520 }}>
            Hire talented people for the work you need, or turn your own skills into an opportunity. Simple, flexible, and made for getting things moving.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => document.getElementById("gig-search")?.focus()}
              style={{ background: "white", color: "#17181C", border: "none", borderRadius: 3, padding: "11px 17px", fontSize: 13, fontWeight: 600 }}
            >
              Explore gigs <ChevronRight size={14} style={{ verticalAlign: "-2px", marginLeft: 4 }} />
            </button>
            <button
              onClick={onStartEarning}
              style={{ background: "transparent", color: "white", border: "1px solid #555861", borderRadius: 3, padding: "10px 17px", fontSize: 13, fontWeight: 600 }}
            >
              Start earning
            </button>
          </div>
        </div>
        <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "#2B4EFF", opacity: 0.28, right: -70, top: -90, filter: "blur(2px)" }} />
        <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", border: "1px solid #777DFF", opacity: 0.45, right: 80, bottom: -75 }} />
      </section>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A8478" }} />
          <input
            id="gig-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gigs, creators, tags…"
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #D8D3C7", borderRadius: 3, fontSize: 14, background: "white" }}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option>All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div style={{ position: "relative" }}>
          <ArrowUpDown size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8A8478", pointerEvents: "none" }} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selectStyle, paddingLeft: 30 }}>
            <option value="newest">Newest</option>
            <option value="rating">Top rated</option>
            <option value="trending">Trending</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>

      {gigs.length === 0 ? (
        <EmptyState text="No gigs match that search. Try a different word or clear the category filter." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {gigs.map((g) => (
            <GigCard
              key={g.id}
              g={g}
              categoryColor={categoryColor}
              onBook={onBook}
              gigRating={gigRating}
              bookingCountByGig={bookingCountByGig}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedView({ gigs, categoryColor, gigRating, bookingCountByGig, favorites, toggleFavorite, onBook }) {
  if (gigs.length === 0) {
    return <EmptyState text="Nothing saved yet. Tap the heart on any gig in Browse & search to keep it here." />;
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {gigs.map((g) => (
        <GigCard
          key={g.id}
          g={g}
          categoryColor={categoryColor}
          onBook={onBook}
          gigRating={gigRating}
          bookingCountByGig={bookingCountByGig}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
}

const selectStyle = { padding: "10px 12px", border: "1px solid #D8D3C7", borderRadius: 3, fontSize: 14, background: "white", color: "#17181C" };

// ---------------------------------------------------------------------------
function PostGigView({ onSubmit, defaultCreator }) {
  const [creatorName, setCreatorName] = useState(defaultCreator || "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rate, setRate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [justPosted, setJustPosted] = useState(false);
  const descLimit = 280;

  function handleSubmit(e) {
    e.preventDefault();
    if (!creatorName.trim() || !title.trim() || !rate || !description.trim()) {
      setError("Fill in every field before posting.");
      return;
    }
    if (Number(rate) <= 0) {
      setError("Rate needs to be more than $0.");
      return;
    }
    setError("");
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
    onSubmit({ creatorName: creatorName.trim(), title: title.trim(), category, rate: Number(rate), description: description.trim(), tags });
    setTitle("");
    setRate("");
    setTagsInput("");
    setDescription("");
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 3000);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, marginTop: 0 }}>List a new gig</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <Field label="Your name">
          <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Gig title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. I'll design your podcast cover art" style={inputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <Field label="Category" style={{ flex: 1 }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Rate (USD)" style={{ flex: 1 }}>
            <input value={rate} onChange={(e) => setRate(e.target.value)} type="number" min="1" placeholder="45" style={inputStyle} />
          </Field>
        </div>
        <Field label="Tags (comma-separated, optional)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. fast turnaround, captions, Reels" style={inputStyle} />
        </Field>
        <Field label={`Description (${description.length}/${descLimit})`}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, descLimit))}
            rows={4}
            placeholder="What do clients get, and how fast?"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
        {error && <div style={{ fontSize: 13, color: "#D8402A" }}>{error}</div>}
        {justPosted && <div style={{ fontSize: 13, color: "#146C2E" }}>Gig posted — find it on Browse & search.</div>}
        <button
          type="submit"
          style={{ justifySelf: "start", background: "#2B4EFF", color: "white", border: "none", borderRadius: 3, padding: "11px 20px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={16} /> Post gig
        </button>
      </form>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 13, color: "#65605A", ...style }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = { border: "1px solid #D8D3C7", borderRadius: 3, padding: "10px 12px", fontSize: 14, background: "white", color: "#17181C", width: "100%" };

// ---------------------------------------------------------------------------
function StatCard({ icon, label, value, sub }) {
  return (
    <div style={{ border: "1px solid #E4E0D6", borderRadius: 4, background: "white", padding: "16px 18px", flex: "1 1 160px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A8478", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#A39D8F", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function DashboardView({ creatorName, gigs, bookingsByGig, setBookingStatus, deleteGig, categoryColor, stats, filter, setFilter, totalEarnings, overallAvgRating, overallReviewCount, gigRating }) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (!creatorName.trim()) return <EmptyState text="Enter your creator name at the top to see your gigs and bookings." />;
  if (gigs.length === 0) return <EmptyState text={`No gigs posted as "${creatorName}" yet. Post one from the "Post a gig" tab.`} />;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={<Wallet size={13} />} label="Earned so far" value={`$${totalEarnings}`} sub="from completed bookings" />
        <StatCard
          icon={<Star size={13} />}
          label="Average rating"
          value={overallReviewCount ? overallAvgRating.toFixed(1) : "—"}
          sub={overallReviewCount ? `across ${overallReviewCount} review${overallReviewCount === 1 ? "" : "s"}` : "no reviews yet"}
        />
        <StatCard icon={<Award size={13} />} label="Completed" value={stats.Completed} sub={`${stats.All} total booking${stats.All === 1 ? "" : "s"}`} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["All", "Pending", "Accepted", "Completed", "Declined"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              border: filter === s ? "1px solid #17181C" : "1px solid #D8D3C7",
              background: filter === s ? "#17181C" : "white",
              color: filter === s ? "white" : "#4A453E",
              borderRadius: 3,
              padding: "7px 12px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {s} <span style={{ opacity: 0.7 }}>{stats[s]}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 28 }}>
        {gigs.map((g) => {
          const gigBookings = bookingsByGig(g.id).filter((b) => filter === "All" || b.status === filter);
          const cc = categoryColor(g.category);
          const totalForGig = bookingsByGig(g.id).length;
          const { avg, count } = gigRating(g.id);
          if (filter !== "All" && gigBookings.length === 0) return null;
          return (
            <div key={g.id} style={{ border: "1px solid #E4E0D6", borderRadius: 4, background: "white" }}>
              <div style={{ padding: "16px 20px", borderBottom: gigBookings.length ? "1px solid #EFEBE1" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: cc.fg, background: cc.bg, padding: "2px 7px", borderRadius: 3 }}>{g.category}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: "0 0 4px" }}>{g.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#8A8478" }}>${g.rate}</span>
                    <RatingLine avg={avg} count={count} size={11} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 12, color: "#8A8478" }}>
                    {totalForGig} booking{totalForGig === 1 ? "" : "s"}
                  </span>
                  {confirmingId === g.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#9A2A16" }}>Delete gig?</span>
                      <button
                        onClick={() => {
                          deleteGig(g.id);
                          setConfirmingId(null);
                        }}
                        style={{ ...pillBtn, background: "#9A2A16", color: "white" }}
                      >
                        Yes, delete
                      </button>
                      <button onClick={() => setConfirmingId(null)} style={{ ...pillBtn, background: "white", border: "1px solid #D8D3C7", color: "#17181C" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(g.id)}
                      title="Delete gig"
                      style={{ background: "none", border: "1px solid #E4C6BE", color: "#9A2A16", borderRadius: 3, padding: 6, display: "flex" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {gigBookings.length > 0 && (
                <div>
                  {gigBookings.map((b) => (
                    <div key={b.id} style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: "1px solid #F2EFE7", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 260px", display: "flex", gap: 10 }}>
                        <Avatar name={b.clientName} size={26} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{b.clientName}</div>
                          {b.message && <div style={{ fontSize: 13, color: "#65605A", marginTop: 2 }}>{b.message}</div>}
                          <div style={{ fontSize: 11, color: "#A39D8F", marginTop: 4 }}>{timeAgo(b.createdAt)}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <StatusBadge status={b.status} />
                        {b.status === "Pending" && (
                          <>
                            <button onClick={() => setBookingStatus(b.id, "Accepted")} style={{ ...pillBtn, background: "#146C2E", color: "white" }}>
                              <Check size={13} /> Accept
                            </button>
                            <button onClick={() => setBookingStatus(b.id, "Declined")} style={{ ...pillBtn, background: "white", color: "#9A2A16", border: "1px solid #E4C6BE" }}>
                              <X size={13} /> Decline
                            </button>
                          </>
                        )}
                        {b.status === "Accepted" && (
                          <button onClick={() => setBookingStatus(b.id, "Completed")} style={{ ...pillBtn, background: "#2B4EFF", color: "white" }}>
                            <Award size={13} /> Mark complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const pillBtn = { border: "none", borderRadius: 3, padding: "7px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 };

// ---------------------------------------------------------------------------
function MyBookingsView({ clientName, bookings, gigs, categoryColor, onRebook, onWithdraw, reviewedBookingIds, onReview, reviews }) {
  if (!clientName.trim()) return <EmptyState text="Enter your client name at the top to see your bookings." />;
  if (bookings.length === 0) return <EmptyState text={`No bookings yet for "${clientName}". Browse gigs and book one to see it here.`} />;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {bookings.map((b) => {
        const gig = gigs.find((g) => g.id === b.gigId);
        const cc = gig ? categoryColor(gig.category) : null;
        const alreadyReviewed = reviewedBookingIds.has(b.id);
        const myReview = alreadyReviewed ? reviews.find((r) => r.bookingId === b.id) : null;
        return (
          <div key={b.id} style={{ border: "1px solid #E4E0D6", borderRadius: 4, padding: "16px 20px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              {gig && <span style={{ fontSize: 11, fontWeight: 600, color: cc.fg, background: cc.bg, padding: "2px 7px", borderRadius: 3, marginRight: 8 }}>{gig.category}</span>}
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, marginTop: 4 }}>{gig ? gig.title : "Gig no longer listed"}</div>
              <div style={{ fontSize: 12, color: "#8A8478", marginTop: 3 }}>
                {gig?.creatorName} · booked {timeAgo(b.createdAt)}
              </div>
              {myReview && (
                <div style={{ marginTop: 8 }}>
                  <StarRow value={myReview.rating} size={12} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={b.status} />
              {b.status === "Pending" && (
                <button onClick={() => onWithdraw(b.id)} style={{ ...pillBtn, background: "white", color: "#65605A", border: "1px solid #D8D3C7" }}>
                  Withdraw
                </button>
              )}
              {b.status === "Declined" && gig && (
                <button onClick={() => onRebook(gig.id)} style={{ ...pillBtn, background: "#F7F5F0", color: "#17181C", border: "1px solid #D8D3C7" }}>
                  Book again
                </button>
              )}
              {b.status === "Completed" && !alreadyReviewed && (
                <button onClick={() => onReview(b)} style={{ ...pillBtn, background: "#2B4EFF", color: "white" }}>
                  <MessageSquare size={13} /> Leave a review
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
function BookingModal({ gig, defaultName, onClose, onSubmit }) {
  const [name, setName] = useState(defaultName || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!gig) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Your name is required.");
      return;
    }
    onSubmit(gig.id, { name: name.trim(), message: message.trim() });
  }

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, marginTop: 0 }}>Book "{gig.title}"</h3>
      <p style={{ fontSize: 13, color: "#65605A", marginTop: -6 }}>
        {gig.creatorName} · ${gig.rate}
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 6 }}>
        <Field label="Your name">
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Message (optional)">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tell them what you need…" style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        {error && <div style={{ fontSize: 13, color: "#D8402A" }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ ...pillBtn, background: "white", border: "1px solid #D8D3C7", color: "#17181C", padding: "9px 16px" }}>
            Cancel
          </button>
          <button type="submit" style={{ ...pillBtn, background: "#17181C", color: "white", padding: "9px 16px" }}>
            Confirm booking
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function ConfirmationModal({ booking, gig, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#DEFBE6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={16} color="#146C2E" />
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, margin: 0 }}>Booking sent</h3>
      </div>
      <p style={{ fontSize: 14, color: "#4A453E", lineHeight: 1.5 }}>
        Your request for <strong>{gig?.title}</strong> is <strong>Pending</strong> — {gig?.creatorName} will accept or decline it from their dashboard. Track it any time from My bookings.
      </p>
      <button onClick={onClose} style={{ ...pillBtn, background: "#17181C", color: "white", padding: "9px 16px", marginTop: 6 }}>
        Done
      </button>
    </Overlay>
  );
}

function ReviewModal({ booking, gig, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, marginTop: 0 }}>Review "{gig?.title || "this gig"}"</h3>
      <p style={{ fontSize: 13, color: "#65605A", marginTop: -6 }}>Your rating is public and can't be edited once posted.</p>
      <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#65605A", marginBottom: 8 }}>Your rating</div>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Field label="Comment (optional)">
          <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 240))} rows={3} placeholder="What was it like working with them?" style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ ...pillBtn, background: "white", border: "1px solid #D8D3C7", color: "#17181C", padding: "9px 16px" }}>
            Cancel
          </button>
          <button type="button" onClick={() => onSubmit(booking, { rating, comment })} style={{ ...pillBtn, background: "#17181C", color: "white", padding: "9px 16px" }}>
            Post review
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,24,28,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="fadein" style={{ background: "#F7F5F0", border: "1px solid #E4E0D6", borderRadius: 6, padding: 24, width: "100%", maxWidth: 420 }}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ border: "1px dashed #D8D3C7", borderRadius: 4, padding: "40px 24px", textAlign: "center", color: "#8A8478", fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <Sparkles size={18} />
      {text}
    </div>
  );
}


# backend 
# Sidegig Backend

A real backend for the Sidegig gig marketplace: Node.js + Express + SQLite
(via `better-sqlite3`), with JWT authentication. It replaces the
`window.storage` calls in the React artifact with a proper API and database,
and moves the important rules (who can accept a booking, one review per
booking, etc.) from the browser into the server, where they can't be
bypassed.

## 1. Setup

'''bash
cd sidegig-backend
npm install
cp .env.example .env'''


Open `.env` and set `JWT_SECRET` to a long random string (e.g. run
`openssl rand -hex 32` and paste the output). Set `CORS_ORIGIN` to wherever
your frontend runs, e.g. `http://localhost:5173` for Vite or
`http://localhost:3000` for Create React App / Next.

```bash
npm run dev      # starts on http://localhost:4000 with auto-reload
# or
npm start
```

A `sidegig.db` SQLite file is created automatically on first run — no
separate database server to install. Delete that file any time to reset all
data.

> **Note on `better-sqlite3`:** it's a native module. `npm install` compiles
> it (or pulls a prebuilt binary) automatically on Mac/Linux/Windows. If it
> ever fails to install on your machine, the most common fix is making sure
> you have a recent Node.js LTS version installed.

## 2. API reference

All request/response bodies are JSON. Protected routes require a header:
`Authorization: Bearer <token>` (the token you get back from register/login).

### Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | password ≥ 8 chars. Returns `{ token, user }`. |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }`. |
| GET | `/api/auth/me` | — | Protected. Returns the logged-in user. |

### Gigs
| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/api/gigs?search=&category=&sort=` | — | Public. `sort` ∈ `newest,low,high,rating,trending`. |
| GET | `/api/gigs/:id` | — | Public. |
| POST | `/api/gigs` | `{ title, category, rate, description, tags[] }` | Protected. Creator = logged-in user. |
| DELETE | `/api/gigs/:id` | — | Protected. Only the gig's creator. |

### Bookings
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/bookings/mine` | — | Protected. Bookings you made as a client. |
| GET | `/api/bookings/received` | — | Protected. Bookings made on gigs you created. |
| POST | `/api/bookings` | `{ gigId, message }` | Protected. Status starts as `Pending`. |
| PATCH | `/api/bookings/:id/status` | `{ status }` | Protected. Only the gig's creator; status ∈ `Accepted, Declined, Completed`. |
| DELETE | `/api/bookings/:id` | — | Protected. Only the client, only while `Pending` (withdraw). |

### Reviews
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/reviews/gig/:gigId` | — | Public. |
| POST | `/api/reviews` | `{ bookingId, rating, comment }` | Protected. Only the client on a `Completed` booking, once. |

### Favorites (saved gigs)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/favorites` | Protected. List of saved gig IDs. |
| POST | `/api/favorites/:gigId` | Protected. Save a gig. |
| DELETE | `/api/favorites/:gigId` | Protected. Unsave a gig. |

## 3. Wiring this into the React app

The React component currently reads/writes through `window.storage`, e.g.:

```js
const r = await window.storage.get(STORAGE_KEYS.gigs, true);
const g = r ? JSON.parse(r.value) : null;
```

You'll replace each of those with a `fetch` call to this API instead. A
small API client makes this a clean swap:

```js
// api.js
const API_URL = "http://localhost:4000/api";
let token = null; // set this after login/register

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  setToken: (t) => { token = t; },
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getGigs: (params = {}) =>
    request(`/gigs?${new URLSearchParams(params)}`),
  postGig: (gig) => request("/gigs", { method: "POST", body: JSON.stringify(gig) }),
  deleteGig: (id) => request(`/gigs/${id}`, { method: "DELETE" }),
  createBooking: (gigId, message) =>
    request("/bookings", { method: "POST", body: JSON.stringify({ gigId, message }) }),
  setBookingStatus: (id, status) =>
    request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  submitReview: (bookingId, rating, comment) =>
    request("/reviews", { method: "POST", body: JSON.stringify({ bookingId, rating, comment }) }),
};
```

Then in the component, e.g. `postGig`:

```js
// before (window.storage)
function postGig(gig) {
  const next = [{ ...gig, id: uid(), createdAt: Date.now() }, ...gigs];
  setGigs(next);
  persist(STORAGE_KEYS.gigs, next, true);
}

// after (real API)
async function postGig(gig) {
  const created = await api.postGig(gig); // server assigns id/createdAt/creator
  setGigs((prev) => [created, ...prev]);
}
```

The two biggest structural changes to the React app:

1. **Add a login/register screen.** Right now "creator name" and "client
   name" are just text inputs. You'll replace them with real sign-up/login
   forms, store the returned `token` (e.g. in React state or `sessionStorage`
   on your *own* domain — not inside a Claude artifact), and call
   `api.setToken(token)` after login.
2. **Derive "my gigs" / "my bookings" from the server, not from a typed
   name.** Use `GET /api/bookings/mine` and `GET /api/bookings/received`
   instead of filtering the full bookings list by a name string.

## 4. Suggested next steps

- Add rate limiting (e.g. `express-rate-limit`) on `/api/auth/*` to slow
  down brute-force login attempts.
- Add pagination to `GET /api/gigs` once you have more than a page or two
  of listings.
- Swap SQLite for hosted Postgres (Supabase, Neon, Railway) when you're
  ready to deploy somewhere with multiple server instances.
- Add Stripe Connect if you want real payments between clients and
  creators.


# -------------------------
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "sidegig.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gigs (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      rate REAL NOT NULL CHECK (rate > 0),
      tags TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending','Accepted','Completed','Declined')),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, gig_id)
    );

    CREATE INDEX IF NOT EXISTS idx_gigs_creator ON gigs(creator_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_gig ON bookings(gig_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_gig ON reviews(gig_id);
  `);
}

module.exports = { db, initDb };

# ----------------
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "sidegig.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gigs (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      rate REAL NOT NULL CHECK (rate > 0),
      tags TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending','Accepted','Completed','Declined')),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, gig_id)
    );

    CREATE INDEX IF NOT EXISTS idx_gigs_creator ON gigs(creator_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_gig ON bookings(gig_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_gig ON reviews(gig_id);
  `);
}

module.exports = { db, initDb };




