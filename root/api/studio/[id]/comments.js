import fetch from "node-fetch";

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

      for (const comment of data) {
        if (comment.reply_count && comment.reply_count > 0) {
          total += comment.reply_count;
        }
      }

      offset += 40;
      if (offset > 10000) break;
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  return total;
}

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const total = await getAllComments(id);

    res.status(200).json({
      studio: id,
      totalComments: total,
      author: "@MaryamArif_1811",
      profile: "https://scratch.mit.edu/users/MaryamArif_1811/"
    });

  } catch (e) {
    res.status(500).json({
      error: "Failed to fetch comments",
      details: e.toString(),
      author: "@MaryamArif_1811",
      profile: "https://scratch.mit.edu/users/MaryamArif_1811/"
    });
  }
}
