import express from "express";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 5000;

async function getAllComments(studioId) {
  let total = 0;
  let offset = 0;

  try {
    while (true) {
      const url = `https://api.scratch.mit.edu/studios/${studioId}/comments?offset=${offset}&limit=40`;
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 404) break;
        throw new Error(`Scratch API returned ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      total += data.length;

      // Count replies - Scratch API returns reply_count for each comment
      for (const comment of data) {
        if (comment.reply_count && comment.reply_count > 0) {
          total += comment.reply_count;
        }
      }

      offset += 40;
      // Safety break to prevent infinite loops if API behaves unexpectedly
      if (offset > 10000) break; 
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  return total;
}

app.get("/studio/:id/comments", async (req, res) => {
  const studioId = req.params.id;

  try {
    const total = await getAllComments(studioId);
    res.json({ studio: studioId, totalComments: total });
  } catch (e) {
    res.json({ error: "Failed to fetch comments", details: e.toString() });
  }
});

app.get("/", (req, res) => {
  res.send("Studio Comment Counter API is running! Use /studio/:id/comments to get comment counts.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
