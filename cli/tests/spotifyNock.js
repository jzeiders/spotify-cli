const nock = require("nock");

const reccomendations = {
  tracks: [
    {
      album: {
        album_type: "ALBUM",
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/4NHQUGzhtTLFvgF5SZesLK"
            },
            href: "https://api.spotify.com/v1/artists/4NHQUGzhtTLFvgF5SZesLK",
            id: "4NHQUGzhtTLFvgF5SZesLK",
            name: "Tove Lo",
            type: "artist",
            uri: "spotify:artist:4NHQUGzhtTLFvgF5SZesLK"
          }
        ],
        external_urls: {
          spotify: "https://open.spotify.com/album/5Z5O36p7BivXzkucc0PAfw"
        },
        href: "https://api.spotify.com/v1/albums/5Z5O36p7BivXzkucc0PAfw",
        id: "5Z5O36p7BivXzkucc0PAfw",
        images: [
          {
            height: 640,
            url:
              "https://i.scdn.co/image/6d18d4e8dcc3c8b617af00af9de35e332287648a",
            width: 640
          },
          {
            height: 300,
            url:
              "https://i.scdn.co/image/aeed8868b665a019c2d992a6b7b42aae29185e6a",
            width: 300
          },
          {
            height: 64,
            url:
              "https://i.scdn.co/image/5e4799a2753d3eec44e55f949454af37eef7567f",
            width: 64
          }
        ],
        name: "Queen Of The Clouds",
        type: "album",
        uri: "spotify:album:5Z5O36p7BivXzkucc0PAfw"
      }
    }
  ]
};

const api = nock("https://api.spotify.com/v1")
  .persist()
  .get("/recommendations")
  .query(true)
  .reply(200, reccomendations)
  .get("/me/top/artists")
  .query(true)
  .reply(200, reccomendations)
  .get("/me/player/currently-playing")
  .reply(200, reccomendations)
  .get("/me/top/tracks")
  .query(true)
  .reply(200, reccomendations)
  .put("/me/player/pause")
  .reply(200, reccomendations)
  .put("/me/player/play")
  .reply(200, reccomendations)
  .get("/me/player/search")
  .query({ type: "track" })
  .reply(200, reccomendations);

module.exports = api;
