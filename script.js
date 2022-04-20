let connectBtn = document.querySelector("#connect");
let addMusicBtn = document.querySelector("#add-music-btn");
let otherIdInput = document.querySelector('#other-id');
let inputYouTubeUrl = document.querySelector("#input-youtube-url");
let peerIdEl = document.querySelector("#peerID");
let errorEl = document.querySelector("#error-status");
let connectionStatusEl = document.querySelector("#connection-status");
let currentMusicList = [];
let currentPlayingId = 0;
let peerReady = false, peer = new Peer, peerId, peerConnected = false, peerConnection;

peer.on('open', (id) => {
  // peer is now connected
  peerId = id;
  peerReady = true;
  peerIdEl.innerHTML = id;
  connectionStatusEl.innerHTML = "Connected.";
  connectBtn.attributes.removeNamedItem("disabled");
  console.log(">> Peer connected with ID: " + peerId);
  document.querySelector("#copy-id").onclick = () => {
    navigator.clipboard.writeText(id).then(r => console.log("ID Copied."));
  }
  connectBtn.onclick = () => {
    const conn = peer.connect(otherIdInput.value);
    connectionHandler(conn);
  }
});

const renderMusicList = () => {
  const musicItem = document.querySelector("#list-music-item");
  const playlistEl = document.querySelector("#playlist");
  currentMusicList.forEach(song => {
    const item = musicItem.content.cloneNode(true);
    console.log(item);
    item.querySelector('.song-name').innerHTML = song.url;
    playlistEl.append(item);
  });
}

const connectionHandler = (conn) => {
  peerConnected = true;
  peerConnection = conn;

  peerConnection.on('open', () => {
    otherIdInput.value = conn.peer;
    otherIdInput.disabled = true;

    // only enable add music btn when connected
    addMusicBtn.disabled = false;
    conn.on('data', (packet) => {
      console.log(packet);
      // Data received over WebRTC
      switch (packet.type) {
        case 'sync-playlist':
          currentMusicList = packet.data;
          renderMusicList();
          break;
      }
    });
    addMusicBtn.onclick = () => {
      if (inputYouTubeUrl.value && inputYouTubeUrl.value.trim() !== "" && parseYtbLink(inputYouTubeUrl.value)) {
        currentMusicList.push({
          songId: parseYtbLink(inputYouTubeUrl.value),
          url: inputYouTubeUrl.value
        });
        conn.send({
          type: 'sync-playlist',
          data: currentMusicList
        });
        renderMusicList();
        inputYouTubeUrl.value = '';
      }
    }
  });
}

peer.on('connection', conn => {
  connectionHandler(conn);
});

peer.on('close', () => {
  connectionStatusEl.innerHTML = "Closed.";
});

peer.on('call', () => {
  connectionStatusEl.innerHTML = "Received a call.";
});

peer.on('disconnected', () => {
  connectionStatusEl.innerHTML = "Disconnected.";
});

peer.on('error', (err) => {
  errorEl.innerHTML = err.type;
});