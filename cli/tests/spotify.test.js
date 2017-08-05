const Spotify = require("../spotify");
const spotify = new Spotify();
var spies = {};
const album = {
  uri: 1
};
const artist = {
  uri: 2
};
const track = {
  uri: 3
};
const playlist = {
  uri: 4
};
const spotNock = require("./spotifyNock");
beforeAll(() => {
  Object.getOwnPropertyNames(Spotify.prototype).map(name => {
    spies[name] = jest.spyOn(spotify, name);
  });
});
test("favoriteArtists", async () => {
  let options = {
    url: "me/top/artists",
    qs: {
      time_range: "short_term"
    }
  };
  expect.assertions(1);
  await spotify.favoriteArtists();
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("favoriteTracks", async () => {
  let options = {
    url: "me/top/tracks",
    qs: {
      time_range: "short_term"
    }
  };
  expect.assertions(1);
  await spotify.favoriteTracks();
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("fetchToken", async () => {});
test("getCurrentTrack", async () => {
  expect.assertions(1);
  await spotify.getCurrentTrack();
  expect(spies.getStatus).toHaveBeenCalled();
});
test("getReccomendations", async () => {
  let options = {
    url: "recommendations",
    qs: {
      seed_artists: 1
    }
  };
  expect.assertions(1);
  await spotify.getRecommendations(options.qs.seed_artists);
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("getStatus", async () => {
  let options = {
    url: "me/player/currently-playing"
  };
  expect.assertions(1);
  await spotify.getStatus();
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("login", async () => {});
test("pause", async () => {
  let options = {
    url: "me/player/pause"
  };
  expect.assertions(1);
  await spotify.pause();
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("play", async () => {
  let options = {
    url: "me/player/play"
  };
  expect.assertions(1);
  await spotify.play();
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("playAlbum", async () => {
  let options = {
    url: "me/player/play",
    body: {
      context_uri: album.uri
    }
  };
  expect.assertions(1);
  await spotify.playAlbum(album);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("playArtist", async () => {
  let options = {
    url: "me/player/play",
    body: {
      context_uri: artist.uri
    }
  };
  expect.assertions(1);
  await spotify.playArtist(artist);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});

test("playPlaylist", async () => {
  let options = {
    url: "me/player/play",
    body: {
      context_uri: playlist.uri
    }
  };
  expect.assertions(1);
  await spotify.playPlaylist(playlist);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("playRadio", async () => {
  expect.assertions(2);
  await spotify.playRadio(artist);
  expect(spies.getRecommendations).toHaveBeenCalledWith(artist.id);
  expect(spies.playTracks).toHaveBeenCalled();
});
test("playSong", async () => {
  let song = "test";
  expect.assertions(1);
  await spotify.playSong(song);
  expect(spies.searchTrack).toHaveBeenCalledWith(song);
  expect(spies.playTrack).toHaveBeenCalled();
});
test("playTrack", async () => {
  let track = {
    uri: "test"
  };
  let options = {
    url: "me/player/play",
    body: {
      uris: [track.uri]
    }
  };
  expect.assertions(1);
  await spotify.playTrack(track);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("playTracks", async () => {
  let track = {
    uri: "test"
  };
  let tracks = [track, track];
  let options = {
    url: "me/player/play",
    body: {
      uris: tracks.map(track => track.uri)
    }
  };
  expect.assertions(1);
  await spotify.playTracks(tracks);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("searchAlbums", async () => {
  let term = "test";
  let options = {
    url: "search",
    qs: {
      q: term,
      type: "album"
    }
  };
  expect.assertions(1);
  await spotify.searchAlbums(test);
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("searchArtists", async () => {
  let options = {
    url: "search",
    qs: {
      q: term,
      type: "artist"
    }
  };
  expect.assertions(1);
  await spotify.searchArtists();
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("searchPlaylists", async () => {
  let term = "test";
  let options = {
    url: "search",
    qs: {
      q: term,
      type: "playlist"
    }
  };
  expect.assertions(1);
  await spotify.searchPlaylists();
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("searchTrack", async () => {});
test("searchTracks", async () => {
  let term = "test";
  let options = {
    url: "search",
    qs: {
      q: term,
      type: "track"
    }
  };
  expect.assertions(1);
  await spotify.serachTracks(term);
  expect(spies.spotifyGet).toHaveBeenCalledWith(options);
});
test("setVolume", async () => {
  let value = 50;
  let options = {
    url: "me/player/volume",
    qs: {
      volume_percent: value
    }
  };
  expect.assertions(1);
  await spotify.setVolume(value);
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("shuffle", async () => {
  let options = {
    url: "me/player/shuffle",
    qs: {
      state: true
    }
  };
  expect.assertions(1);
  await spotify.shuffle();
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
test("skip", async () => {
  let options = {
    url: "me/player/next"
  };
  expect.assertions(1);
  await spotify.play();
  expect(spies.spotifyPost).toHaveBeenCalledWith(options);
});
test("spotifyGet", async () => {});
test("spotifyPost ", async () => {});
test("spotifyPut", async () => {});
test("stopShuffle", async () => {
  let options = {
    url: "me/player/shuffle",
    qs: {
      state: false
    }
  };
  expect.assertions(1);
  await spotify.stopShuffle();
  expect(spies.spotifyPut).toHaveBeenCalledWith(options);
});
