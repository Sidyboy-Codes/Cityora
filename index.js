// importing all modules
const express = require("express");
const path = require("path");
const axios = require("axios");
const { json, response } = require("express");
const Twitter = require("twitter");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || "8888";


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

// ********** twitter api handler ****************
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// rendering simple layout page
app.get("/", (req, res) => {
  res.render("layout");
});

// handling search request
app.get("/cityname", async (req, res) => {
  var c_name = req.query.c_name;

  // getting data from weather api
  var weather_data = await get_weather(c_name);
  // getting data from news api
  var news_data = await get_news(c_name);
  // getting data from twitter api
  var twitter_data = await get_tweets(c_name);
  res.render("index", { w_data: weather_data, n_data: news_data, t_data: twitter_data, c_name: c_name });
});

// setting app port
app.listen(port, () => {
  console.log(`listening on localhost port ${port}`);
});

// api calling functions

// get weather api call
async function get_weather(c_name) {
  const weather_api_key = process.env.WEATHER_API_KEY
  try {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${c_name}&units=metric&appid=${weather_api_key}`;
    let response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // sending json object
    // console.log(url);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

// get news
async function get_news(c_name) {
  const news_api_key = process.env.NEWS_API_KEY
  try {
    url = `https://newsapi.org/v2/everything?q=${c_name}&searchin=title&from=2022-09-29&apiKey=${news_api_key}`;
    let response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // sending json object
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

// get tweets
async function get_tweets(c_name) {
  switch (c_name) {
    case "toronto":
      var woeid = 4118;
      break;
    case "vancouver":
      var woeid = 9807;
      break;
    case "new york":
      var woeid = 2459115;
      break;
    case "mumbai":
      var woeid = 2295411;
      break;
  }

  // axios api call
  try {
    console.log(woeid);
    url = `trends/place.json`;
    let response = await client.get(url, {
      id: woeid,
    });

    // console.log("********* twitter response ***********"+response[0].trends);
    return response[0].trends;
  } catch (err) {
    console.log(err);
  }
}
