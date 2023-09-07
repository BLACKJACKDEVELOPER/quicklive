

async function live() {
    const client = Math.floor(Math.random() * 1000000)
    const simple = document.getElementById("video")
    simple.src = "load.mp4"
    simple.onloadedmetadata = () => {
        simple.click()
    };

    // turn server
    let peerConfiguration = {}
    const response = await fetch("https://turnxosermock.metered.live/api/v1/turn/credentials?apiKey=d2bee12eb25c3c15544ba889da3db65cd459");
    const iceServers = await response.json();
    peerConfiguration.iceServers = iceServers

    const mpeer = new RTCPeerConnection(peerConfiguration)
    // on got video from streamer
    mpeer.addEventListener("track", (event) => {
        document.getElementById('video').srcObject = event.streams[0]
        simple.poster = "play.jpg"
    });
    // empty mediastream
<<<<<<< HEAD
    const video = simple.captureStream()
    video.getTracks().forEach(async (track) => {
        await mpeer.addTrack(track, video)
    })
=======
    const video = await navigator.mediaDevices.getUserMedia({video:true})
>>>>>>> 32c72ea235387a5172339ea163755fde4ee93769
    await mpeer.addStream(video)
    const offer = await mpeer.createOffer();
    await mpeer.setLocalDescription(offer)

    // get url params
    const url = new URL(window.location);
    const UUID = url.searchParams.get("UUID");
    const verify = url.searchParams.get("verify")

    // listener socket
    const socket = new io()
    socket.on('client' + client, async (data) => {
        socket.on('setICE' + client, async (data) => {
            const ICE = new RTCIceCandidate(data.ice)
            await mpeer.addIceCandidate(ICE)
        })
        await mpeer.setRemoteDescription(data.data.answer)

        mpeer.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                socket.emit('candidate', { ice: event.candidate, UUID })
            }
        });
    })

    // message incoming
    const msgContent = document.querySelector("#chat")
    socket.on("send"+UUID,async (data)=> {
        msgContent.innerHTML += 
        `
        <div class="mt-3" style="text-align:left;margin-left:1%;display:flex;align-items:center;">
        <img class="mx-2" width="40" src="user.png" />
        <h5 class="bg-light p-1 rounded">${data.msg}</h5>
        </div>
        `
    })

    socket.emit('call', { UUID, offer, client })

    return {
        send:()=> {
            let msg = (document.querySelectorAll('input')[0]).value
            document.querySelectorAll('input')[0].value = ""
            socket.emit("msg",{ UUID , msg })
        }
    }
}
<<<<<<< HEAD
let exe = {}
live().then(func => exe = func)
=======
live()
>>>>>>> 32c72ea235387a5172339ea163755fde4ee93769
