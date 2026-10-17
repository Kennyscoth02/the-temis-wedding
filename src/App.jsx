import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Heart,
  Camera,
  Music2,
  CheckCircle2,
  Send,
  X,
  Volume2,
  VolumeX,
  Gift,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { invitation as data } from "./invitationData";

async function readApiResponse(response, action) {
  const body = await response.text();
  let result;
  if (body) {
    try {
      result = JSON.parse(body);
    } catch {
      const contentType = response.headers.get("content-type") || "unknown";
      throw new Error(
        `${action} returned an invalid response (HTTP ${response.status}, ${contentType}).`,
      );
    }
  }
  if (!response.ok) {
    throw new Error(
      result?.error || `${action} failed (HTTP ${response.status}).`,
    );
  }
  if (!result) {
    throw new Error(
      `${action} returned an empty response (HTTP ${response.status}).`,
    );
  }
  return result;
}

function Countdown() {
  const calculate = () => {
    const diff = Math.max(0, new Date(data.dateISO).getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    };
  };
  const [time, setTime] = useState(calculate);
  useEffect(() => {
    const timer = setInterval(() => setTime(calculate()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="countdown">
      {Object.entries(time).map(([label, value]) => (
        <div className="count-unit" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function EventCalendar({ dateISO }) {
  const [year, month, eventDay] = dateISO
    .slice(0, 10)
    .split("-")
    .map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );
  const eventDate = new Date(year, month - 1, eventDay).toLocaleDateString(
    undefined,
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const days = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="event-calendar">
      <p className="eyebrow">OUR WEDDING DAY</p>
      <h3>{monthName}</h3>
      <table aria-label={`Wedding date calendar for ${monthName}`}>
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <th scope="col" key={day}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day, index) => (
                <td key={day ?? `empty-${week}-${index}`}>
                  {day && (
                    <span
                      className={day === eventDay ? "event-day" : undefined}
                      aria-current={day === eventDay ? "date" : undefined}
                    >
                      {day}
                    </span>
                  )}
                </td>
              ))}
              {days.slice(week * 7, week * 7 + 7).length < 7 &&
                Array.from(
                  { length: 7 - days.slice(week * 7, week * 7 + 7).length },
                  (_, index) => <td key={`trailing-${week}-${index}`} />,
                )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="event-calendar-date">{eventDate}</p>
    </div>
  );
}

function GallerySlider({ photos, onSelect }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return undefined;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % photos.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [photos.length]);
  const move = (offset) =>
    setIndex((current) => (current + offset + photos.length) % photos.length);
  if (!photos.length)
    return (
      <p className="empty-gallery">
        Add your wedding photos in src/invitationData.js.
      </p>
    );
  return (
    <div className="gallery-slider">
      <button
        className="slide-image"
        onClick={() => onSelect(photos[index])}
        aria-label={`Open wedding photo ${index + 1}`}
      >
        <img src={photos[index]} alt={`Wedding photo ${index + 1}`} />
      </button>
      {photos.length > 1 && (
        <>
          <button
            className="slide-arrow slide-previous"
            onClick={() => move(-1)}
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </button>
          <button
            className="slide-arrow slide-next"
            onClick={() => move(1)}
            aria-label="Next photo"
          >
            <ChevronRight />
          </button>
          <div className="slide-indicators" aria-label="Choose a photo">
            {photos.map((photo, i) => (
              <button
                key={`${photo}-${i}`}
                className={i === index ? "active" : ""}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
          <span className="slide-count">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(photos.length).padStart(2, "0")}
          </span>
        </>
      )}
    </div>
  );
}

function FloralSprig({ className }) {
  return (
    <svg className={className} viewBox="0 0 220 260" aria-hidden="true">
      <path
        className="sprig-stem"
        d="M14 248C54 198 55 150 102 108s59-65 91-96"
      />
      <path
        className="sprig-stem"
        d="M70 169c-6-38-21-59-46-77m74 2c-5-34 0-55 18-78m34 31c22-6 39-4 57 6m-91 67c26-9 48-7 68 4"
      />
      <ellipse
        className="sprig-leaf"
        cx="39"
        cy="111"
        rx="10"
        ry="25"
        transform="rotate(-42 39 111)"
      />
      <ellipse
        className="sprig-leaf"
        cx="27"
        cy="79"
        rx="9"
        ry="22"
        transform="rotate(-48 27 79)"
      />
      <ellipse
        className="sprig-leaf"
        cx="116"
        cy="44"
        rx="10"
        ry="25"
        transform="rotate(23 116 44)"
      />
      <ellipse
        className="sprig-leaf"
        cx="144"
        cy="49"
        rx="9"
        ry="23"
        transform="rotate(76 144 49)"
      />
      <ellipse
        className="sprig-leaf"
        cx="176"
        cy="65"
        rx="9"
        ry="23"
        transform="rotate(67 176 65)"
      />
      <ellipse
        className="sprig-leaf"
        cx="140"
        cy="119"
        rx="10"
        ry="24"
        transform="rotate(55 140 119)"
      />
      <ellipse
        className="sprig-leaf"
        cx="178"
        cy="123"
        rx="9"
        ry="22"
        transform="rotate(68 178 123)"
      />
      <g className="sprig-flower" transform="translate(91 87)">
        <ellipse cx="0" cy="-13" rx="8" ry="15" />
        <ellipse cx="0" cy="-13" rx="8" ry="15" transform="rotate(60)" />
        <ellipse cx="0" cy="-13" rx="8" ry="15" transform="rotate(120)" />
        <ellipse cx="0" cy="-13" rx="8" ry="15" transform="rotate(180)" />
        <ellipse cx="0" cy="-13" rx="8" ry="15" transform="rotate(240)" />
        <ellipse cx="0" cy="-13" rx="8" ry="15" transform="rotate(300)" />
        <circle r="7" />
      </g>
      <g className="sprig-flower small" transform="translate(52 143)">
        <ellipse cx="0" cy="-9" rx="6" ry="11" />
        <ellipse cx="0" cy="-9" rx="6" ry="11" transform="rotate(72)" />
        <ellipse cx="0" cy="-9" rx="6" ry="11" transform="rotate(144)" />
        <ellipse cx="0" cy="-9" rx="6" ry="11" transform="rotate(216)" />
        <ellipse cx="0" cy="-9" rx="6" ry="11" transform="rotate(288)" />
        <circle r="5" />
      </g>
    </svg>
  );
}

function App() {
  const [opened, setOpened] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [guestName, setGuestName] = useState(
    new URLSearchParams(window.location.search).get("guest") || "",
  );
  const [attendance, setAttendance] = useState("yes");
  const [guests, setGuests] = useState("2");
  const [message, setMessage] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishError, setWishError] = useState("");
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [submittingWish, setSubmittingWish] = useState(false);
  const [guestbook, setGuestbook] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicTimerRef = useRef(null);
  const musicNoteRef = useRef(0);

  useEffect(() => {
    if (!opened || !autoScroll || rsvpOpen || lightbox) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoScroll(false);
      return undefined;
    }

    let timerId;
    let previousTime;
    let scrollRemainder = 0;
    const pauseForUser = (event) => {
      if (
        event.type === "keydown" &&
        ![
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(".auto-scroll-toggle, .music-toggle")
      )
        return;
      setAutoScroll(false);
    };
    document.documentElement.classList.add("auto-scrolling");
    const scroll = () => {
      const time = performance.now();
      if (previousTime !== undefined) {
        const elapsed = Math.min(time - previousTime, 250);
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll) {
          setAutoScroll(false);
          return;
        }
        scrollRemainder += elapsed * 0.028;
        const pixels = Math.floor(scrollRemainder);
        if (pixels > 0) {
          window.scrollBy(0, pixels);
          scrollRemainder -= pixels;
        }
      }
      previousTime = time;
    };

    window.addEventListener("wheel", pauseForUser, { passive: true });
    window.addEventListener("touchstart", pauseForUser, { passive: true });
    window.addEventListener("pointerdown", pauseForUser, { passive: true });
    window.addEventListener("keydown", pauseForUser);
    timerId = window.setInterval(scroll, 50);
    return () => {
      window.clearInterval(timerId);
      document.documentElement.classList.remove("auto-scrolling");
      window.removeEventListener("wheel", pauseForUser);
      window.removeEventListener("touchstart", pauseForUser);
      window.removeEventListener("pointerdown", pauseForUser);
      window.removeEventListener("keydown", pauseForUser);
    };
  }, [opened, autoScroll, rsvpOpen, lightbox]);

  async function submitRSVP(e) {
    e.preventDefault();
    const entry = {
      name: guestName,
      attendance,
      guests: Number(guests),
      message,
    };
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const result = await readApiResponse(response, "RSVP submission");
      if (result.wish) setGuestbook((current) => [...current, result.wish]);
    } catch (error) {
      console.error("Could not submit RSVP.", error);
      setRsvpError(
        error instanceof Error
          ? `${error.message} Please check the deployment's /api/health endpoint and Vercel Function logs.`
          : "We could not save your response. Please try again.",
      );
      return;
    }
    setSubmitted(true);
  }

  async function startMusic() {
    if (data.musicUrl && audioRef.current) {
      try {
        await audioRef.current.play();
        setMusicOn(true);
      } catch (error) {
        console.error("Background music could not be played.", error);
        setMusicOn(false);
      }
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass)
        throw new Error("Web Audio is not supported by this browser.");
      const currentContext = audioContextRef.current;
      const context =
        currentContext && currentContext.state !== "closed"
          ? currentContext
          : new AudioContextClass();
      audioContextRef.current = context;
      await context.resume();
      const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
      const playNote = () => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.value = notes[musicNoteRef.current % notes.length];
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 1.65);
        musicNoteRef.current += 1;
      };
      if (!musicTimerRef.current) {
        playNote();
        musicTimerRef.current = setInterval(playNote, 1800);
      }
      setMusicOn(true);
    } catch (error) {
      console.error("Background music could not be started.", error);
      setMusicOn(false);
    }
  }

  function stopMusic() {
    if (audioRef.current) audioRef.current.pause();
    if (musicTimerRef.current) {
      clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    if (audioContextRef.current) void audioContextRef.current.suspend();
    setMusicOn(false);
  }

  function openInvitation() {
    setOpened(true);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setAutoScroll(true);
    void startMusic();
  }

  async function submitWish(e) {
    e.preventDefault();
    setWishError("");
    setSubmittingWish(true);
    const entry = { name: wishName.trim(), message: wishMessage.trim() };
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const { wish } = await readApiResponse(response, "Guestbook submission");
      setGuestbook((current) => [...current, wish]);
    } catch (error) {
      console.error("Could not save the guestbook message.", error);
      setWishError(
        error instanceof Error
          ? `${error.message} Please try again.`
          : "Your message could not be saved. Please try again.",
      );
      setSubmittingWish(false);
      return;
    }
    setWishName("");
    setWishMessage("");
    setWishSubmitted(true);
    setSubmittingWish(false);
  }

  function addToCalendar() {
    const start = new Date(data.dateISO);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const formatDate = (date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const escapeText = (text) =>
      text
        .replace(/\\/g, "\\\\")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;")
        .replace(/\n/g, "\\n");
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@wedding-invitation`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeText(data.calendarTitle)}`,
      `LOCATION:${escapeText(`${data.venue}, ${data.address}`)}`,
      `DESCRIPTION:${escapeText(`Join us to celebrate ${data.partnerOneFull} and ${data.partnerTwoFull}.`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-invitation.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/guestbook")
      .then((response) => readApiResponse(response, "Guestbook request"))
      .then(({ wishes }) => {
        if (active) setGuestbook(wishes);
      })
      .catch((error) => {
        console.warn(
          "Could not load shared guestbook messages; using this browser’s saved messages.",
          error,
        );
        try {
          const stored = JSON.parse(
            localStorage.getItem("wedding-guestbook") || "[]",
          );
          if (active) setGuestbook(stored);
        } catch (storageError) {
          console.error(
            "Could not load the locally saved guestbook.",
            storageError,
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
      if (audioContextRef.current) {
        const context = audioContextRef.current;
        audioContextRef.current = null;
        void context.close();
      }
    },
    [],
  );

  return (
    <main>
      {!opened && (
        <div className="envelope-screen">
          <div className="cover-card">
            <img
              className="cover-photo"
              src={data.coverPhoto}
              alt="A preview photo of the couple"
            />
            <FloralSprig className="cover-flower cover-flower-left" />
            <FloralSprig className="cover-flower cover-flower-right" />
            <div className="cover-content">
              <div className="envelope-seal">
                <Heart size={19} fill="currentColor" />
              </div>
              <p className="cover-label">TOGETHER WITH OUR FAMILIES</p>
              <h1>
                {data.partnerOne}
                <span>&</span>
                {data.partnerTwo}
              </h1>
              <div className="cover-ornament">
                <span></span>
                <i>❦</i>
                <span></span>
              </div>
              <p className="cover-date">{data.shortDate}</p>
              <button className="open-invitation" onClick={openInvitation}>
                Open invitation
              </button>
            </div>
          </div>
          <p className="cover-note">
            Tap to open your invitation and start the music
          </p>
        </div>
      )}

      <div className={`invitation ${opened ? "visible" : "hidden"}`}>
        <nav className="topbar">
          <span className="monogram">
            {data.partnerOne[0]}
            <i>&</i>
            {data.partnerTwo[0]}
          </span>
          <span className="nav-date">{data.shortDate}</span>
          <button onClick={() => setRsvpOpen(true)} className="nav-rsvp">
            Confirm attendance <Heart size={14} />
          </button>
        </nav>
        <section
          className="hero"
          style={{ backgroundImage: `url("${data.coverPhoto}")` }}
        >
          <div className="hero-shade"></div>
          <div className="hero-content">
            <p className="eyebrow light">WITH FULL HEARTS AND GREAT JOY</p>
            <h1>
              {data.partnerOneFull}
              <br />
              <em>&</em> {data.partnerTwoFull}
            </h1>
            <div className="ornament">
              <span></span>
              <Heart size={17} />
              <span></span>
            </div>
            <p className="hero-date">{data.shortDate}</p>
            <p className="hero-subtitle">
              TOGETHER WITH OUR PARENTS, WE INVITE YOU TO CELEBRATE
            </p>
            <button className="cream-button" onClick={() => setRsvpOpen(true)}>
              Confirm attendance <Heart size={15} />
            </button>
          </div>
          <div className="hero-bottom">
            SCROLL TO EXPLORE <span>↓</span>
          </div>
        </section>

        <section className="invitation-art section-pad">
          <p className="eyebrow">OUR WEDDING INVITATION</p>
          <button
            className="invitation-art-image"
            onClick={() => setLightbox(data.invitationImage)}
            aria-label="View the full wedding invitation"
          >
            <img
              src={data.invitationImage}
              alt={`Wedding invitation for ${data.partnerOne} and ${data.partnerTwo}`}
            />
          </button>
        </section>

        <section className="gallery section-pad">
          <div className="gallery-heading">
            <div>
              <p className="eyebrow">LITTLE MOMENTS, BIG LOVE</p>
              <h2>
                Our <em>memories.</em>
              </h2>
            </div>
            <Camera size={27} />
          </div>
          <GallerySlider photos={data.photos} onSelect={setLightbox} />
        </section>

        <section className="intro section-pad">
          <p className="eyebrow">WITH THE BLESSINGS OF OUR FAMILIES</p>
          <h2>
            Joyfully invite you
            <br />
            <em>to our wedding.</em>
          </h2>
          <div className="small-rule"></div>
          <p className="body-copy">{data.welcome}</p>
          <div className="family-grid">
            {data.parents.map((parent) => (
              <div className="family-card" key={parent.names[0]}>
                <p>{parent.names[0]}</p>
                <p>{parent.names[1]}</p>
                <span>{parent.home}</span>
              </div>
            ))}
          </div>
          <div className="signature">
            {data.partnerOneFull} <span>&</span> {data.partnerTwoFull}
          </div>
          <p className="muted">{data.shortDate}</p>
        </section>

        <section className="story section-pad">
          <div className="story-photo">
            <img
              src={data.photos[0]}
              alt="Wedding celebration"
              loading="lazy"
            />
            <span className="photo-caption">A LOVE WORTH CELEBRATING</span>
          </div>
          <div className="story-text">
            <p className="eyebrow">OUR STORY</p>
            <h2>
              Two souls,
              <br />
              <em>one journey.</em>
            </h2>
            <div className="small-rule"></div>
            <p className="body-copy">{data.story}</p>
            <p className="script-note">We can't wait to celebrate with you.</p>
          </div>
        </section>

        <section className="details section-pad">
          <p className="eyebrow">SAVE THE DATE</p>
          <h2>
            The day we've
            <br />
            <em>been dreaming of.</em>
          </h2>
          <div className="event-grid">
            <article className="event-card">
              <div className="event-icon">
                <Heart />
              </div>
              <p className="eyebrow">CELEBRATION PARTY</p>
              <h3>{data.venue}</h3>
              <p>
                <Clock3 size={15} />
                {data.ceremonyTime}
              </p>
              <p>
                <MapPin size={15} />
                {data.address}
              </p>
              <a href={data.mapUrl} target="_blank" rel="noreferrer">
                GET DIRECTIONS ↗
              </a>
            </article>
          </div>
          <EventCalendar dateISO={data.dateISO} />
          <div className="countdown-panel">
            <p className="eyebrow light">COUNTING DOWN TO OUR DAY</p>
            <h3>We can't wait to celebrate with you.</h3>
            <Countdown />
            <button className="calendar-button" onClick={addToCalendar}>
              <CalendarDays size={16} /> Add to calendar
            </button>
          </div>
          <button
            className="dark-button confirm-button"
            onClick={() => setRsvpOpen(true)}
          >
            Confirm attendance <Heart size={15} />
          </button>
        </section>

        <section className="dress-code section-pad">
          <p className="eyebrow">DRESS CODE</p>
          <h2>{data.dressCode.title}</h2>
          <p className="body-copy">{data.dressCode.description}</p>
          <div
            className="dress-swatches"
            aria-label="Wedding dress-code colors"
          >
            {data.dressColors.map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
        </section>

        <section className="schedule section-pad">
          <p className="eyebrow">CELEBRATION DAY SCHEDULE</p>
          <h2>
            A day full of <em>love & joy.</em>
          </h2>
          <div className="schedule-list">
            {data.schedule.map((item, i) => (
              <article
                className="schedule-item"
                key={`${item.time}-${item.title}`}
              >
                <span className="schedule-time">{item.time}</span>
                <span className="schedule-dot">{i + 1}</span>
                <span className="schedule-title">{item.title}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="rsvp-banner">
          <div className="banner-inner">
            <Heart size={24} />
            <p className="eyebrow light">YOUR PRESENCE IS OUR PRESENT</p>
            <h2>
              Celebrate <em>with us.</em>
            </h2>
            <p>We would be honoured to have you share in our joy.</p>
            <button className="cream-button" onClick={() => setRsvpOpen(true)}>
              Respond to invitation <Send size={15} />
            </button>
          </div>
        </section>

        <section className="guestbook section-pad">
          <p className="eyebrow">GUESTBOOK</p>
          <h2>
            Leave a little <em>love.</em>
          </h2>
          <p className="body-copy">
            Share a message or a blessing for the happy couple.
          </p>
          {guestbook.length > 0 && (
            <div className="wishes">
              {guestbook
                .slice(-6)
                .reverse()
                .map((g, i) => (
                  <blockquote key={`${g.createdAt || g.name}-${i}`}>
                    <p>“{g.message}”</p>
                    <cite>— {g.name}</cite>
                  </blockquote>
                ))}
            </div>
          )}
          {wishSubmitted && (
            <p className="wish-success" role="status">
              Thank you for your lovely message!
            </p>
          )}
          {wishError && (
            <p className="wish-error" role="alert">
              {wishError}
            </p>
          )}
          <form className="guestbook-form" onSubmit={submitWish}>
            <label>
              Your name
              <input
                required
                maxLength="120"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>
            <label>
              Your message
              <textarea
                required
                maxLength="1000"
                rows="3"
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write a wish for the couple…"
              />
            </label>
            <button
              className="outline-button"
              type="submit"
              disabled={submittingWish}
            >
              {submittingWish ? "Sending…" : "Send wishes"} <Send size={15} />
            </button>
          </form>
        </section>

        <section className="gift-section section-pad">
          <div className="gift-heading">
            <p className="eyebrow">GIFT BOX</p>
            <h2>
              Your love is <em>our greatest gift.</em>
            </h2>
            <p className="body-copy">{data.gift.description}</p>
            <button
              className="gift-open-button"
              onClick={() => setGiftOpen((open) => !open)}
              aria-expanded={giftOpen}
              aria-controls="gift-details"
            >
              <Gift size={18} />
              {giftOpen ? "Close gift box" : "Open gift box"}
            </button>
          </div>
          {giftOpen && (
            <div className="gift-details" id="gift-details">
              <h3>{data.gift.title}</h3>
              {data.gift.accounts.length ? (
                data.gift.accounts.map((account) => (
                  <article
                    className="account-card"
                    key={`${account.bank}-${account.accountNumber}`}
                  >
                    <span>{account.bank}</span>
                    <strong>{account.accountName}</strong>
                    <code>{account.accountNumber}</code>
                  </article>
                ))
              ) : (
                <p className="account-pending">
                  Account details have not been provided yet. Edit the{" "}
                  <code>gift.accounts</code> list in src/invitationData.js to
                  add them.
                </p>
              )}
              <p className="gift-note">{data.gift.note}</p>
              <div className="gift-whatsapp">
                {data.gift.whatsappNumbers.map((number) => (
                  <a
                    key={number}
                    href={`https://wa.me/${number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp {number}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer>
          <span className="monogram">
            {data.partnerOne[0]}
            <i>&</i>
            {data.partnerTwo[0]}
          </span>
          <p>Made with love, for a day we'll remember forever.</p>
          <div className="footer-names">
            {data.partnerOne} <span>♥</span> {data.partnerTwo}
          </div>
        </footer>
      </div>

      {opened && (
        <div className="floating-controls">
          <button
            className="auto-scroll-toggle"
            onClick={() => setAutoScroll((running) => !running)}
            aria-label={
              autoScroll
                ? "Pause automatic scrolling"
                : "Resume automatic scrolling"
            }
            title={
              autoScroll
                ? "Pause automatic scrolling"
                : "Resume automatic scrolling"
            }
          >
            {autoScroll ? <Pause size={17} /> : <Play size={17} />}
            <span>{autoScroll ? "Auto scroll on" : "Auto scroll off"}</span>
          </button>
          <button
            className="music-toggle"
            onClick={() => (musicOn ? stopMusic() : void startMusic())}
            aria-label={
              musicOn ? "Mute background music" : "Play background music"
            }
            title={musicOn ? "Mute background music" : "Play background music"}
          >
            {musicOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
            <span>{musicOn ? "Music on" : "Music off"}</span>
          </button>
        </div>
      )}
      {data.musicUrl && (
        <audio ref={audioRef} src={data.musicUrl} loop preload="none" />
      )}
      {rsvpOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setRsvpOpen(false)
          }
        >
          <div className="rsvp-modal">
            <button
              className="modal-close"
              onClick={() => {
                setRsvpOpen(false);
                setSubmitted(false);
                setRsvpError("");
              }}
              aria-label="Close"
            >
              <X />
            </button>
            {submitted ? (
              <div className="success">
                <CheckCircle2 size={42} />
                <h2>
                  Thank you, <em>{guestName || "dear friend"}.</em>
                </h2>
                <p>
                  Your response has been noted. We can't wait to celebrate with
                  you!
                </p>
                <button
                  className="dark-button"
                  onClick={() => {
                    setRsvpOpen(false);
                    setSubmitted(false);
                    setRsvpError("");
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">KINDLY REPLY</p>
                <h2>
                  Will you <em>join us?</em>
                </h2>
                <p className="modal-intro">
                  Please let us know if you'll be celebrating with us.
                </p>
                {rsvpError && (
                  <p className="wish-error" role="alert">
                    {rsvpError}
                  </p>
                )}
                <form onSubmit={submitRSVP}>
                  <label>
                    Your full name
                    <input
                      required
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value);
                        setRsvpError("");
                      }}
                      placeholder="Enter your name"
                    />
                  </label>
                  <fieldset>
                    <legend>Will you attend?</legend>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="yes"
                        checked={attendance === "yes"}
                        onChange={(e) => setAttendance(e.target.value)}
                      />{" "}
                      Joyfully accepts
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="no"
                        checked={attendance === "no"}
                        onChange={(e) => setAttendance(e.target.value)}
                      />{" "}
                      Regretfully declines
                    </label>
                  </fieldset>
                  {attendance === "yes" && (
                    <label>
                      Number attending
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option value="1">1 guest</option>
                        <option value="2">2 guests</option>
                        <option value="3">3 guests</option>
                        <option value="4">4 guests</option>
                        <option value="5">5 guests</option>
                      </select>
                    </label>
                  )}
                  <label>
                    Leave a message (optional)
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Your wishes for the couple…"
                      rows="3"
                    />
                  </label>
                  <button className="dark-button" type="submit">
                    Send response <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button aria-label="Close photo">
            <X />
          </button>
          <img src={lightbox} alt="Expanded wedding memory" />
        </div>
      )}
    </main>
  );
}
export default App;
