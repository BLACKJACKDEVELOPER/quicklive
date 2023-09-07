

function start(UUID) {
    let playing = true;
    const video_ = document.getElementById('video')
    let video; // unsign obj video

    document.getElementById('link').setAttribute("value",window.location.origin+"/live?UUID="+UUID);
    // listener socket
    const socket = new io();
    socket.on('live' + UUID, async (data) => {
        const response = await fetch("https://turnxosermock.metered.live/api/v1/turn/credentials?apiKey=d2bee12eb25c3c15544ba889da3db65cd459");
        const iceServers = await response.json();
        // control peer
        let peerConfiguration = {}
        peerConfiguration.iceServers = iceServers
        const peer = new RTCPeerConnection(peerConfiguration);
        video.getTracks().forEach(async (track)=> {
            await peer.addTrack(track,video)
        })

        socket.on('setICE'+UUID,async (data)=> {
            const ICE = new RTCIceCandidate(data.ice)
            await peer.addIceCandidate(ICE)
        })
        peer.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                socket.emit('candidate',{ client:data.client , ice:event.candidate })
            }
        });
        
        await peer.setRemoteDescription(data.offer)
        const answer =  await peer.createAnswer();
        await peer.setLocalDescription(answer)
        socket.emit('answer',{answer,client:data.client})
    })

    // video configuration
    const vconifg = {
        audio: false,
        video: {
            width: 1280,
            height: 720
        }
    }

    // message incoming
    const msgContent = document.querySelector("#chat")
    console.log(msgContent)
    socket.on("send"+UUID,async (data)=> {
        msgContent.innerHTML += 
        `
        <div class="mt-3" style="text-align:left;margin-left:1%;display:flex;align-items:center;">
        <img class="mx-2" width="40" src="user.png" />
        <h5 class="bg-light p-1 rounded">${data.msg}</h5>
        </div>
        `
    })
    
    return {
        async camera(target) {
            try {
                if (playing === true) {
                    video = await navigator.mediaDevices.getUserMedia(vconifg)
                    video_.srcObject = video
                    target.style.backgroundColor = 'red';
                    playing = video.getTracks()
                } else {
                    playing[0].stop()
                    target.style.backgroundColor = '#000';
                    playing = true;
                    video_.src = 'load.mp4'
                }
            } catch (e) {
                alert('อุปกรณ์ไม่รองรับ')
            }
        },
        async display(target) {
            try {
                if (playing === true) {
                    video = await navigator.mediaDevices.getDisplayMedia(vconifg)
                    video_.srcObject = video
                    target.style.backgroundColor = 'red';
                    playing = video.getTracks()
                } else {
                    playing[0].stop()
                    target.style.backgroundColor = '#000';
                    playing = true;
                    video_.src = 'load.mp4'
                }
            } catch (e) {
                alert('อุปกรณ์ไม่รองรับ')
            }
        },
        send:()=> {
            let msg = (document.querySelectorAll('input')[1]).value
            document.querySelectorAll('input')[1].value = ""
            socket.emit("msg",{ UUID , msg })
        }
    }
}



async function copy(target) {
    const input = document.getElementById('link')
    input.select();
    navigator.clipboard.writeText(input.value)   
    target.innerHTML = 'COPIED'
}