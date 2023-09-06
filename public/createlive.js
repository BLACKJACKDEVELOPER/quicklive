

function start(UUID) {
    let playing = true;
    const video_ = document.getElementById('video')
    let video; // unsign obj video


    // listener socket
    const socket = new io();
    socket.on('live' + UUID, async (data) => {
        console.log(data)
        const response = await fetch("https://turnxosermock.metered.live/api/v1/turn/credentials?apiKey=d2bee12eb25c3c15544ba889da3db65cd459");
        const iceServers = await response.json();
        // control peer
        let peerConfiguration = {}
        peerConfiguration.iceServers = iceServers
        const peer = new RTCPeerConnection(peerConfiguration);
        await peer.addStream(video);

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

    return {
        async camera(target) {
            try {
                if (playing === true) {
                    video = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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
                    video = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
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
        }
    }
}



async function copy(target) {
    const input = document.getElementById('link')
    input.select();
    navigator.clipboard.writeText(input.value)
    target.innerHTML = 'COPIED'
}