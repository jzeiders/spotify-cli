const req = require("request");
const tokens = require("./tokens.json");
const opn = require("opn");
const fs = require("fs");
const http = require("http");
const url = require("url");
const path = require("path");

function request(options) {
  return new Promise((res, rej) => {
    req(options, (err, response, body) => {
      if (err) rej(err);
      res(body);
    });
  });
}

class SpotifyController {
  constructor() {}
  login() {
    return new Promise((resolve, reject) => {
      opn("http://localhost:3000", "chrome");
      var server;
      server = http.createServer((req, res) => {
        let access = url.parse(req.url, true).query.access_token;
        let refresh = url.parse(req.url, true).query.refresh_token;
        fs.writeFileSync(
          path.join(__dirname, "tokens.json"),
          JSON.stringify({
            refresh_token: refresh,
            access_token: access
          })
        );
        res.end(); //close the response
        req.connection.end(); //close the socket
        req.connection.destroy; //close it really
        server.close();
        resolve();
      });
      server.listen(7777);
    });
  }
  setToken(token) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }
  spotifyGet(options) {
    let final = Object.assign({}, options, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.getToken()
      },
      json: true
    });
    final.url = "https://api.spotify.com/v1/" + options.url;
    return request(final);
  }
  spotifyPost(options) {
    let final = Object.assign({}, options, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.getToken()
      },
      json: true
    });
    final.url = "https://api.spotify.com/v1/" + options.url;
    return request(final);
  }
  spotifyPut(options) {
    let final = Object.assign({}, options, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.getToken()
      },
      json: true
    });
    final.url = "https://api.spotify.com/v1/" + options.url;
    return request(final);
  }
  favoriteTracks(term) {
    let options = {
      url: "/me/top/tracks",
      qs: {
        time_range: "short_term"
      }
    };
    return spotifyGet(options).then(body => body.items);
  }
  favoriteArtists() {
    let options = {
      url: "/me/top/artists",
      qs: {
        time_range: "short_term"
      }
    };
    return spotifyGet(options).then(body => body.items);
  }
  fetchToken() {
    let options = {
      method: "GET",
      url: "http://localhost:3000/refresh",
      qs: {
        refresh_token: tokens.refresh_token
      }
    };
    return request(options).then(body => this.setToken(body));
  }

  pause() {
    let options = {
      url: "me/player/pause"
    };
    return this.spotifyPut(options);
  }
  searchTrack(term) {
    let options = {
      url: "search",
      qs: {
        q: term,
        type: "track"
      }
    };
    return this.spotifyGet(options).then(body => {
      return body.tracks.items[0];
    });
  }
  searchTracks(term) {
    let options = {
      url: "search",
      qs: {
        q: term,
        type: "track"
      }
    };
    return this.spotifyGet(options).then(body => body.tracks.items);
  }
  searchPlaylists(term) {
    let options = {
      url: "search",
      qs: {
        q: term,
        type: "playlist"
      }
    };
    return this.spotifyGet(options).then(body => body.playlists.items);
  }
  searchAlbums(term) {
    let options = {
      url: "search",
      qs: {
        q: term,
        type: "album"
      }
    };
    return this.spotifyGet(options).then(body => body.albums.items);
  }
  setVolume(value) {
    let options = {
      url: "me/player/volume",
      qs: {
        volume_percent: value
      }
    };
    return this.spotifyPut(options);
  }
  searchArtists(term) {
    let options = {
      url: "search",
      qs: {
        q: term,
        type: "artist"
      }
    };
    return this.spotifyGet(options).then(body => body.artists.items);
  }
  skip() {
    let options = {
      url: "me/player/next"
    };
    return this.spotifyPost(options);
  }
  shuffle() {
    let options = {
      url: "me/player/shuffle",
      qs: {
        state: true
      }
    };
    return this.spotifyPut(options);
  }
  stopShuffle() {
    let options = {
      url: "me/player/shuffle",
      qs: {
        state: false
      }
    };
    return this.spotifyPut(options);
  }
  playAlbum(album) {
    let options = {
      url: "me/player/play",
      body: {
        context_uri: album.uri
      }
    };
    return this.spotifyPut(options).then(() => album);
  }
  playRadio(artist) {
    return this.getRecommendations(artist.id).then(tracks => {
      return this.playTracks(tracks);
    });
  }
  playTrack(track) {
    let options = {
      url: "me/player/play",
      body: {
        uris: [track.uri]
      }
    };
    return this.spotifyPut(options).then(() => track);
  }
  playTracks(tracks) {
    let options = {
      url: "me/player/play",
      body: {
        uris: tracks.map(track => track.uri)
      }
    };
    return this.spotifyPut(options).then(() => tracks[0]);
  }
  getRecommendations(artist_id) {
    let options = {
      url: "recommendations",
      qs: {
        seed_artists: artist_id
      }
    };
    return this.spotifyGet(options).then(body => body.tracks);
  }
  playArtist(artist) {
    let options = {
      url: "me/player/play",
      body: {
        context_uri: artist.uri
      }
    };
    return this.spotifyPut(options).then(() => artist);
  }
  playPlaylist(playlist) {
    let options = {
      url: "me/player/play",
      body: {
        context_uri: playlist.uri
      }
    };
    return this.spotifyPut(options).then(() => playlist);
  }
  playSong(song) {
    return this.searchTrack(song).then(track => this.playTrack(track));
  }
  play() {
    let options = {
      url: "me/player/play"
    };
    return this.spotifyPut(options);
  }
  getStatus() {
    let options = {
      url: "me/player/currently-playing"
    };
    return this.spotifyGet(options);
  }
}
module.exports = SpotifyController;
