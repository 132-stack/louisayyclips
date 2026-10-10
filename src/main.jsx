
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Shuffle,
  Play,
  Video,
  ExternalLink,
  Sparkles,
  Clapperboard,
  Plus,
  Trash2,
} from "lucide-react";
import "./style.css";

// Add real video IDs from LouisAyy's YouTube channel.
// Example: youtube.com/watch?v=VIDEO_ID
const initialVideos = [];

function getVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0];
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    const parts = parsed.pathname.split("/");
    const marker = parts.findIndex((part) =>
      ["embed", "shorts", "live"].includes(part)
    );
    return marker >= 0 ? parts[marker + 1] : "";
  } catch {
    return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : "";
  }
}

function randomClip(videos, previousKey = "") {
  if (!videos.length) return null;

  let clip;
  for (let tries = 0; tries < 10; tries++) {
    const video = videos[Math.floor(Math.random() * videos.length)];
    const maxStart = Math.max(0, video.duration - 15);
    const start = Math.floor(Math.random() * (maxStart + 1));
    clip = { ...video, start, key: `${video.id}-${start}` };
    if (clip.key !== previousKey) break;
  }
  return clip;
}

function timestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function App() {
  const [videos, setVideos] = useState(initialVideos);
  const [clip, setClip] = useState(null);
  const [rolls, setRolls] = useState(0);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("300");
  const [error, setError] = useState("");

  function addVideo(event) {
    event.preventDefault();
    const id = getVideoId(url);

    if (!id) {
      setError("That doesn't look like a valid YouTube video URL.");
      return;
    }

    if (videos.some((video) => video.id === id)) {
      setError("That video is already in your collection.");
      return;
    }

    const seconds = Number(duration);
    if (!Number.isFinite(seconds) || seconds < 15) {
      setError("Enter a video duration of at least 15 seconds.");
      return;
    }

    const video = {
      id,
      title: title.trim() || "LouisAyy video",
      duration: Math.floor(seconds),
    };

    setVideos((current) => [...current, video]);
    setUrl("");
    setTitle("");
    setError("");
    if (!clip) {
      setClip(randomClip([video]));
      setRolls(1);
    }
  }

  function roll() {
    if (!videos.length) {
      setError("Add a LouisAyy video first, then roll!");
      return;
    }
    setClip((current) =>
      randomClip(videos, current?.key || "")
    );
    setRolls((count) => count + 1);
    setError("");
  }

  function removeVideo(id) {
    setVideos((current) => current.filter((video) => video.id !== id));
    if (clip?.id === id) setClip(null);
  }

  const videoLink = clip
    ? `https://www.youtube.com/watch?v=${clip.id}&t=${clip.start}s`
    : "";

  return (
    <main className="shell">
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon"><Clapperboard /></span>
          CLIP<span className="accent">ROULETTE</span>
        </a>
        <span className="status"><i /> RANDOM MODE</span>
      </nav>

      <header className="hero">
        <div className="eyebrow">
          <Sparkles size={14} /> THE CHAOS BUTTON
        </div>
        <h1>
          One click.
          <br />
          <span>Random LouisAyy.</span>
        </h1>
        <p>
          Skip the endless scrolling. Add videos from the channel,
          roll the dice, and discover a random moment.
        </p>
      </header>

      <section className="player-card">
        <div className="player-heading">
          <span><i className="sound-bars">▂▅▃</i> YOUR RANDOM PICK</span>
          <span className="counter">ROLL #{String(rolls).padStart(3, "0")}</span>
        </div>

        <div className="video-frame">
          {clip ? (
            <iframe
              key={clip.key}
              src={`https://www.youtube-nocookie.com/embed/${clip.id}?start=${clip.start}&rel=0`}
              title={clip.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="empty-player">
              <div className="play-orb"><Play fill="currentColor" /></div>
              <h2>Your next random moment awaits.</h2>
              <p>Add a video below to start the roulette.</p>
            </div>
          )}
        </div>

        <div className="clip-info">
          <div className="clip-meta">
            <span className="tag">LOUISAYY RANDOMIZER</span>
            {clip && (
              <span className="timestamp">
                <Play size={12} fill="currentColor" />
                STARTS AT {timestamp(clip.start)}
              </span>
            )}
          </div>

          <h2>{clip?.title || "No clip selected yet"}</h2>
          <p>
            {clip
              ? "A random starting point from your video collection. Roll again to find another moment."
              : "Build your collection of LouisAyy videos, then hit the button."}
          </p>

          <div className="actions">
            <button className="primary-button" onClick={roll}>
              <Shuffle size={17} /> ROLL ANOTHER CLIP <span>↗</span>
            </button>
            {clip && (
              <a className="secondary-button" href={videoLink}
                target="_blank" rel="noreferrer">
                <Video size={17} /> Open on YouTube <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="collection">
        <div className="section-heading">
          <div>
            <div className="eyebrow small">BUILD YOUR CLIP POOL</div>
            <h2>Your video collection <span>({videos.length})</span></h2>
          </div>
        </div>

        <form className="add-form" onSubmit={addVideo}>
          <label>
            YouTube video URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </label>
          <label>
            Video title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="LouisAyy video title"
            />
          </label>
          <label>
            Duration (seconds)
            <input
              type="number"
              min="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </label>
          <button className="add-button" type="submit">
            <Plus size={17} /> Add video
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {videos.length === 0 ? (
          <div className="collection-empty">
            <Video size={25} />
            <p>No videos added yet.</p>
            <span>Open LouisAyy's channel, copy a video link, and paste it above.</span>
            <a href="https://www.youtube.com/@itslouisayy"
              target="_blank" rel="noreferrer">
              Visit channel <ExternalLink size={13} />
            </a>
          </div>
        ) : (
          <div className="video-list">
            {videos.map((video) => (
              <div className="video-row" key={video.id}>
                <span className="video-symbol"><Video size={18} /></span>
                <div className="video-text">
                  <strong>{video.title}</strong>
                  <span>{timestamp(video.duration)} · YouTube video</span>
                </div>
                <button
                  className="icon-button"
                  title="Remove video"
                  onClick={() => removeVideo(video.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>MADE FOR THE AYYTEAM ✦</span>
        <span>Fan-made project · Not affiliated with LouisAyy</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
