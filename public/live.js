

async function live() {
    const client = Math.floor(Math.random() * 1000000)

    // turn server
    let peerConfiguration = {}
    const response = await fetch("https://turnxosermock.metered.live/api/v1/turn/credentials?apiKey=d2bee12eb25c3c15544ba889da3db65cd459");
    const iceServers = await response.json();
    peerConfiguration.iceServers = iceServers

    const mpeer = new RTCPeerConnection(peerConfiguration)
// on got video from streamer
    mpeer.addEventListener("addstream", (event) => {
        console.log(event)
        document.getElementById('video').srcObject = event.stream
    });
    // empty mediastream
    const video = await navigator.mediaDevices.getUserMedia({video:true})
    await mpeer.addStream(video)
    const offer = await mpeer.createOffer();
    await mpeer.setLocalDescription(offer)

    // get url params
    const url = new URL(window.location);
    const UUID = url.searchParams.get("UUID");

    // listener socket
    const socket = new io()
    socket.on('client' + client, async (data) => {
        console.log(data)
        socket.on('setICE'+client,async (data)=> {
            const ICE = new RTCIceCandidate(data.ice)
            await mpeer.addIceCandidate(ICE)
        })
        await mpeer.setRemoteDescription(data.data.answer)
        
        mpeer.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                socket.emit('candidate',{ ice:event.candidate , UUID })
            }
        });
    })

    socket.emit('call', { UUID, offer, client })
}
live()
