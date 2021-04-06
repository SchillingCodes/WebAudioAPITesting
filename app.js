var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {

    // I've added two basic validation checks here, but in a real world use case you'd probably be a little more stringient. 
    // Be aware that Firefox uses 'audio/mpeg' as the MP3 MIME type, Chrome uses 'audio/mp3'.
    if (this.files.length > 0 && ["audio/mpeg", "audio/mp3"].includes(this.files[0].type)) {

        // We're using the File API to obtain the MP3 bytes, here but they could also come from an XMLHttpRequest 
        // object that has downloaded an MP3 file from the internet, or any other ArrayBuffer containing MP3 data. 
        obtainMp3BytesInArrayBufferUsingFileAPI(this.files[0], function (mp3BytesAsArrayBuffer) {

        // Pass the ArrayBuffer to the decode method
        decodeMp3BytesFromArrayBufferAndPlay(mp3BytesAsArrayBuffer);
        });
    } 
    else alert("Error! No attached file or attached file was of the wrong type!");

    const fileList = this.files; /* now you can work with the file list */
    const file = fileList[0];
    console.log(file.name);
}

let dropbox;

dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    //const dt = e.dataTransfer;
    console.log(e.dataTransfer.files[0].name);

    //handleFiles(dt);
}

var audioContext = new (window.AudioContext || window.webKitAudioContext)(); // Our audio context
var source = null; // This is the BufferSource containing the buffered audio


// Used the File API in order to asynchronously obtain the bytes of the file that the user selected in the 
// file input box. The bytes are returned using a callback method that passes the resulting ArrayBuffer. 
function obtainMp3BytesInArrayBufferUsingFileAPI(selectedFile, callback) {

  var reader = new FileReader(); 
  reader.onload = function (ev) {
    // The FileReader returns us the bytes from the computer's file system as an ArrayBuffer  
    var mp3BytesAsArrayBuffer = reader.result; 
    callback(mp3BytesAsArrayBuffer); 
  }
  reader.readAsArrayBuffer(selectedFile);

}


function decodeMp3BytesFromArrayBufferAndPlay(mp3BytesAsArrayBuffer) {

    // The AudioContext will asynchronously decode the bytes in the ArrayBuffer for us and return us
    // the decoded samples in an AudioBuffer object.  
    audioContext.decodeAudioData(mp3BytesAsArrayBuffer, function (decodedSamplesAsAudioBuffer) {

        // Clear any existing audio source that we might be using
        if (source != null) {
            source = null; // Leave existing source to garbage collection
        } 

        // In order to play the decoded samples contained in the audio buffer we need to wrap them in  
        // an AudioBufferSourceNode object. This object will stream the audio samples to any other 
        // AudioNode or AudioDestinationNode object. 
        source = audioContext.createBufferSource();
        source.buffer = decodedSamplesAsAudioBuffer; // set the buffer to play to our audio buffer
        let channelBuffer = source.buffer.getChannelData(0);

        const myImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = myImageData.data;
        const loopLength = Math.floor(channelBuffer.length / data.length);
        /*
        for (var i = 0; i < data.length; i++) {
            data[i] = Math.round((channelBuffer[i*loopLength] + 1) * (255/2));
            if (i > 3) {
                data[i] = data[i-4] + ((data[i]-data[i-4]) * 10/255);
            }
        }*/

        var increment = 10000;
        for (var i = 0; i < data.length; i+=increment) {
            for (var j = i; j < i+increment; j++) {
                data[j] = Math.round((channelBuffer[i*loopLength] + 1) * (255/2));
                if (i%3==0) {
                    data[j] = 255;
                }
            }
        }

        ctx.putImageData(myImageData, 0, 0);
    }); 
}