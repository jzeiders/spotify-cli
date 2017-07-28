#!/usr/bin/env node

const Chalk = require("chalk");
const program = require("commander");
const Menu = require("appendable-cli-menu");
const Spotify = require("./spotify");
const Player = new Spotify();

async function main() {
  await Player.fetchToken();
  program.parse(process.argv);
}
program
  .command("play [name...]")
  .description("plays a given track")
  .action(name => {
    if (name.length) Player.playSong(name.join("")).then(printTrack);
    else Player.play().then(printPlaying);
  });

program
  .command("pause")
  .description("pauses spotify")
  .action(() => Player.pause().then(printPaused));
program
  .command("search")
  .arguments("<term...>")
  .description("search for a given item")
  .option("-t, --track", "Search Tracks")
  .option("-p, --playlist", "Search Playlists")
  .option("-b, --album", "Search Albums")
  .option("-a, --artist", "Search Artists")
  .action((term, { track, playlist, album, artist }) => {
    term = term.join(" ");
    if (playlist) searchPlaylist(term);
    else if (track) searchTrack(term);
    else if (album) searchAlbum(term);
    else if (artist) searchArtist(term);
    else searchTrack(term);
  });
program
  .command("skip")
  .description("skips the current track")
  .action(() => Player.skip().then(printSkip));
program
  .command("shuffle")
  .description("sets shuffle")
  .action(() => Player.shuffle().then(printShuffle));
program
  .command("stopshuffle")
  .description("disables shuffle")
  .action(() => Player.stopShuffle().then(printStopShuffle));
program
  .command("mute")
  .description("mutes spotify")
  .action(() => Player.setVolume(0));
program
  .command("volume [vol]")
  .option("-M, max", "sets the volume to max")
  .option("-m, --mute", "mutes spotify")
  .description("sets the volume")
  .action((vol, { max, mute }) => {
    if (max) vol = 100;
    if (mute) vol = 0;
    Player.setVolume(vol).then(printVolume.bind(vol));
  });
program.command("now").description("shows currently playing track");

program
  .command("radio <artist...>")
  .description("starts artist radio")
  .action(artist => {
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

function printShuffle() {
  console.log(Chalk.cyan("Shuffle is: ") + Chalk.green("enabled"));
}

function printStopShuffle() {
  console.log(Chalk.cyan("Shuffle is: ") + Chalk.red("disabled"));
}

function printVolume(vol) {
  console.log("The volume is now: " + Chalk.blue(vol));
}

function printSkip() {
  console.log(Chalk.green("Skipped Current Track"));
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
    Albums.slice(0, 10).map(Album => {
      menu.add({
        name: Album.name,
        value: Album
      });
    });
  });
}
