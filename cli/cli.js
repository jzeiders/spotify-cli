#!/usr/bin/env node

const Chalk = require("chalk");
const program = require("commander");
const Menu = require("appendable-cli-menu");
const Spotify = require("./spotify");
const UA = require("universal-analytics");
const uuidv4 = require("uuid/v4");
const fs = require("fs");
const Player = new Spotify();
const GAID = "UA-104115780-1";

var User;
try {
  let UserData = require("./user.json");
  User = new UA(GAID, UserData.uuid);
} catch (e) {
  let uuid = uuidv4();
  fs.writeFileSync("./user.json", JSON.stringify({ uuid }));
  User = new UA(GAID, uuid);
}

function main() {
  Player.fetchToken().then(() => {
    program.parse(process.argv);
  });
}
program
  .command("play [name...]")
  .description("plays a given track")
  .action(name => {
    User.event("CLI", "Play");
    if (name.length) {
      Player.playSong(name.join("")).then(printTrack).catch(err => {
        if (err === "none") {
          printNoMatching("track");
        }
      });
    } else Player.play().then(printPlaying);
  });

program.command("pause").description("pauses spotify").action(() => {
  User.event("CLI", "Pause");
  Player.pause().then(printPaused);
});
program
  .command("search")
  .arguments("<term...>")
  .description("search for a given item")
  .option("-t, --track", "Search Tracks")
  .option("-p, --playlist", "Search Playlists")
  .option("-b, --album", "Search Albums")
  .option("-a, --artist", "Search Artists")
  .action((term, { track, playlist, album, artist }) => {
    User.event("CLI", "Search").send();
    term = term.join(" ");
    if (playlist) searchPlaylist(term);
    else if (track) searchTrack(term);
    else if (album) searchAlbum(term);
    else if (artist) searchArtist(term);
    else searchTrack(term);
  });
program.command("skip").description("skips the current track").action(() => {
  User.event("CLI", "Skip").send();
  Promise.all([Player.getCurrentTrack(), Player.skip()]).then(result => {
    printSkip(result[0]);
  });
});
program.command("shuffle").description("enables shuffle").action(() => {
  User.event("CLI", "shuffle").send();
  Player.shuffle().then(printShuffle);
});
program.command("stopshuffle").description("disables shuffle").action(() => {
  User.event("CLI", "stopshuffle").send();
  Player.stopShuffle().then(printStopShuffle);
});
program.command("mute").description("mutes spotify").action(() => {
  User.event("CLI", "mute").send();
  Player.setVolume(0);
});
program
  .command("volume [vol]")
  .option("-M, --max", "sets the volume to max")
  .option("-m, --mute", "mutes spotify")
  .description("sets the volume")
  .action((vol, { max, mute }) => {
    User.event("CLI", "volume").send();
    if (max) vol = 100;
    if (mute) vol = 0;
    Player.setVolume(vol).then(printVolume.bind(null, vol));
  });
program
  .command("now")
  .description("shows currently playing track")
  .action(() => {
    User.event("CLI", "now").send();
    nowPlaying();
  });

program
  .command("radio <artist...>")
  .description("starts artist radio")
  .action(artist => {
    User.event("CLI", "radio").send();
    radio(artist.join(" "));
  });
program.command("init").description("Gets Initial Tokens").action(init);

main();

function init() {
  Player.login().then(() => {
    console.log("Successfully Authorized");
    process.exit();
  });
}
function nowPlaying() {
  Player.getCurrentTrack().then(printCurrentTrack);
}
function printShuffle() {
  console.log(Chalk.cyan("Shuffle is: ") + Chalk.green("enabled"));
}

function printStopShuffle() {
  console.log(Chalk.cyan("Shuffle is: ") + Chalk.red("disabled"));
}

function printVolume(vol) {
  console.log("The volume is now: " + Chalk.blue(vol));
}

function printSkip(now) {
  console.log(Chalk.yellow("Skipped: ") + trackToString(now));
  setTimeout(nowPlaying, 500);
}
function printCurrentTrack(track) {
  console.log(Chalk.green("Now Playing: ") + trackToString(track));
}

function printPlaying() {
  console.log(Chalk.green("Playing Spotify"));
}

function printPaused() {
  console.log(Chalk.yellow("Paused Spotify"));
}

function trackToString(track) {
  return `${Chalk.cyan(track.name)} by ${Chalk.blue(track.artists[0].name)} `;
}

function printTrack(track) {
  console.log(Chalk.green("Playing") + ": " + trackToString(track));
}

function searchTrack(term) {
  let menu = Menu("Select A Song", track => Player.playTrack(track.value));
  Player.searchTracks(term).then(tracks => {
    if (tracks.length == 0) {
      printNoMatching("tracks");
      process.exit();
    }
    tracks.slice(0, 10).map(track => {
      menu.add({
        name: trackToString(track),
        value: track
      });
    });
  });
}

function radio(term) {
  let menu = Menu("Select An Artist", artist => Player.playRadio(artist.value));
  Player.searchArtists(term).then(artists => {
    artists.slice(0, 10).map(artist => {
      menu.add({
        name: artist.name,
        value: artist
      });
    });
  });
}

function searchArtist(term) {
  let menu = Menu("Select An Artist", artist =>
    Player.playArtist(artist.value)
  );
  Player.searchArtists(term).then(artists => {
    if (artists.length == 0) {
      printNoMatching("artists");
      process.exit();
    }
    artists.slice(0, 10).map(artist => {
      menu.add({
        name: artist.name,
        value: artist
      });
    });
  });
}

function searchPlaylist(term) {
  let menu = Menu("Select A Playlist", Playlist =>
    Player.playPlaylist(Playlist.value)
  );
  Player.searchPlaylists(term).then(Playlists => {
    if (Playlists.length == 0) {
      printNoMatching("playlists");
      process.exit();
    }
    Playlists.slice(0, 10).map(Playlist => {
      menu.add({
        name: Playlist.name,
        value: Playlist
      });
    });
  });
}

function searchAlbum(term) {
  let menu = Menu("Select A Album", Album => Player.playAlbum(Album.value));
  Player.searchAlbums(term).then(Albums => {
    if (Albums.length == 0) {
      printNoMatching("albums");
      process.exit();
    }
    Albums.slice(0, 10).map(Album => {
      menu.add({
        name: Album.name,
        value: Album
      });
    });
  });
}
function printNoMatching(term) {
  console.log("No Matching " + Chalk.magenta(term) + " found");
}

// process.on("UnhandledPromiseRejectionWarning", e => {
//   console.loog(e);
// });
