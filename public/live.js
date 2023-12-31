

async function live() {
    const client = Math.floor(Math.random() * 1000000)
    const simple = document.getElementById("video")
    simple.src = "load.mp4"

    // turn server
    let peerConfiguration = {}
    const response = await fetch("https://turnxosermock.metered.live/api/v1/turn/credentials?apiKey=d2bee12eb25c3c15544ba889da3db65cd459");
    const iceServers = await response.json();
    peerConfiguration.iceServers = iceServers

    const mpeer = new RTCPeerConnection(peerConfiguration)
    mpeer.onconnectionstatechange = ({currentTarget}) => {
        if (currentTarget.iceConnectionState == "disconnected") {
            simple.src = ""
            simple.poster = "https://fakeimg.pl/600x400?text=Live+has+been+ended"
            simple.controls = false
        }
    };
    // on got video from streamer
    mpeer.addEventListener("track", (event) => {
        simple.onloadeddata = async function() {
            simple.setAttribute("controls","")
            simple.setAttribute("autoplay","")
            simple.poster = "https://fakeimg.pl/600x400?text=Click+me"
        };
        document.getElementById('video').srcObject = event.streams[0]
    });
    // empty mediastream
    const video = simple.captureStream()
    video.getTracks().forEach(async (track) => {
        await mpeer.addTrack(track, video)
    })

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
    const msgContent = document.querySelector("#chat-messages")
    socket.on("send"+UUID,async (data)=> {
        msgContent.innerHTML += 
        `
        <div class="mt-3" style="text-align:left;margin-left:1%;display:flex;align-items:center;">
        <img class="mx-2" width="40" src="user.png" />
        <h5 class="bg-light p-1 rounded">${data.msg}</h5>
        </div>
        `
        msgContent.scrollTop = msgContent.scrollHeight;
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

let exe = {}
live().then(func => exe = func)
// document.body.innerHTML = JSON.stringify(navigator.userAgentData.brands)
Swal.fire({
  icon: 'info',
  title: 'แจ้งเตือน',
  text: 'browser บ้างรุ่นอาจไม่รองรับฟีเจอร์บ้างประเภท ขอแนะนำให้ท่านเปลี่ยน browser เป็น Google Chrome , Safari , Firefox',
})