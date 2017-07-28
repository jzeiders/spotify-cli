const express = require("express");
const path = require("path");

const request = require("request"); // "Request" library
const querystring = require("querystring");
const cookieParser = require("cookie-parser");

const redirect_uri = "http://bashify-cli.com/token"; // Your redirect uri
const stateKey = "spotify_auth_state";
const tokens = require("./tokens.json");

const app = express();
app.use(cookieParser());
const generateRandomString = function(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scopes =
    "user-read-playback-state playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-read user-library-modify user-read-private user-follow-read user-top-read user-read-recently-played user-read-currently-playing user-modify-playback-state";
  res.cookie(stateKey, state);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: tokens.client_id,
        scope: scopes,
        redirect_uri: redirect_uri,
        state: state
      })
  );
});
app.get("/token", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch"
        })
    );
  } else {
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(tokens.client_id + ":" + tokens.client_secret).toString(
            "base64"
          )
      },
      json: true
    };
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
        );
      }
    });
  }
});
app.get("/refresh", (req, res) => {
  console.log(req.query.refresh_token);
  let options = {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "refresh_token",
      refresh_token: req.query.refresh_token,
      client_id: tokens.client_id,
      client_secret: tokens.client_secret
    },
    json: true
  };
  request(options, function(error, response, body) {
    console.log(body);
    res.send(body.access_token);
  });
});
app.listen(3000, function() {
  console.log("Started Server");
});
