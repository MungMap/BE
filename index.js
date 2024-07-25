require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/nearest_parks", async (req, res) => {
  const { lat, lon, radius = 10 } = req.query; // radius는 km 단위, 기본값 10km

  console.log(`Received coordinates: lat=${lat}, lon=${lon}, radius=${radius}`);

  try {
    const { data: parks, error } = await supabase.rpc(
      "find_parks_within_radius",
      {
        user_lat: parseFloat(lat),
        user_lon: parseFloat(lon),
        radius_km: parseFloat(radius),
      }
    );

    if (error) {
      console.error("Error fetching nearest parks:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(parks);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/search_parks", async (req, res) => {
  const { query } = req.query;

  // const { data: parks, error } = await supabase
  //   .from("parks")
  //   .select()
  //   .textSearch("공원명_소재지도로명주소_소재지지번주소", query);

  const { data: parks, error } = await supabase
    .from("parks")
    .select("*")
    .or(
      `공원명.ilike.%${query}%,소재지도로명주소.ilike.%${query}%,소재지지번주소.ilike.%${query}%`
    );

  if (error) return res.status(500).json({ error: error.message });

  res.json(parks);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
