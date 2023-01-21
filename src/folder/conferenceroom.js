// 클래스명 입니다~~ participant main은 내 화면, participant는 다른 사람들 화면(물론 다른 사람 화면 클릭하면 main 이 바뀌어요 )
const PARTICIPANT_MAIN_CLASS = "participant main";
const PARTICIPANT_CLASS = "participant";

//중요한 변수들 입니다.
let ws;
let participants = {};
let personName;
let room;
let settingValue = {
  maxWidth: 320,
  maxFrameRate: 15,
  minFrameRate: 15,
};
let me;
let source = "webcam";

//참가자들 데이터를 객체로 저장하기 위함입니다. sample 코드를 최대한 수정 했지만, 엘리멘트 요소를 직접 건드려서 child 엘리먼트를 추가 하는 방식이라 건드리기 어렵습니다.
//차라리 css 파일을 건드려서 수정하는 식으로 하는 것을 추천 합니다.
function Participant(name) {
  this.name = name;
  let container = document.createElement("div");
  container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
  container.id = name;
  let span = document.createElement("span");
  let video = document.createElement("video");
  this.rtcPeer;

  container.appendChild(video);
  container.appendChild(span);
  container.onclick = switchContainerClass;
  document.getElementById("participants").appendChild(container); //////////////

  span.appendChild(document.createTextNode(name));

  video.id = "video-" + name;
  video.autoplay = true;
  video.controls = false;
  video.muted = false;
  // video.controls = false;

  this.getElement = function () {
    return container;
  };

  this.getVideoElement = function () {
    return video;
  };

  function switchContainerClass() {
    if (container.className === PARTICIPANT_CLASS) {
      var elements = Array.prototype.slice.call(
        document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)
      );
      elements.forEach(function (item) {
        item.className = PARTICIPANT_CLASS;
      });

      container.className = PARTICIPANT_MAIN_CLASS;
    } else {
      container.className = PARTICIPANT_CLASS;
    }
  }

  function isPresentMainParticipant() {
    return document.getElementsByClassName(PARTICIPANT_MAIN_CLASS).length != 0;
  }

  this.offerToReceiveVideo = function (error, offerSdp, wp) {
    if (error) return console.error("sdp offer error");
    console.log("Invoking SDP offer callback function");
    console.log(wp);
    var msg = { id: "receiveVideoFrom", sender: name, sdpOffer: offerSdp };
    sendMessage(msg);
  };

  this.onIceCandidate = function (candidate, wp) {
    console.log("Local candidate" + JSON.stringify(candidate));
    console.log(wp);
    var message = {
      id: "onIceCandidate",
      candidate: candidate,
      name: name,
    };
    sendMessage(message);
  };

  Object.defineProperty(this, "rtcPeer", { writable: true });

  this.dispose = function () {
    console.log("Disposing participant " + this.name);
    this.rtcPeer.dispose();
    container.parentNode.removeChild(container);
  };
}

//뮤트 기능
const isSetMuted = function (on) {
  me.audioEnabled = on;
};
const isGetMuted = function () {
  return me.audioEnabled;
};
//스크린 기능
const isSetScreen = function (on) {
  me.videoEnabled = on;
};
const isGetScreen = function () {
  return me.videoEnabled;
};
///
const setSource = function (resource) {
  source = resource;
};
//
const getParticipants = function () {
  return participants;
};
//
const ban = function (roomName, personName) {
  var message = {
    id: "ban",
    name: personName,
    room: roomName,
  };
  sendMessage(message);
};

const mute = function (roomName, personName) {
  var message = {
    id: "mute",
    name: personName,
    room: roomName,
  };
  sendMessage(message);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const open = function (url, person, roomName) {
  ws = new WebSocket(url);
  setEventListener();

  console.log(ws);
  ws.onopen = () => {
    register(person, roomName);
  };
};

const setEventListener = function () {
  ws.onmessage = (message) => {
    var parsedMessage = JSON.parse(message.data);
    console.info("Received message: " + message.data);

    switch (parsedMessage.id) {
      case "existingParticipants":
        onExistingParticipants(parsedMessage);
        break;
      case "newParticipantArrived":
        onNewParticipant(parsedMessage);
        break;
      case "participantLeft":
        onParticipantLeft(parsedMessage);
        break;
      case "receiveVideoAnswer":
        receiveVideoResponse(parsedMessage);
        break;
      case "iceCandidate":
        participants[parsedMessage.name].rtcPeer.addIceCandidate(
          parsedMessage.candidate,
          function (error) {
            if (error) {
              console.error("Error adding candidate: " + error);
              return;
            }
          }
        );
        break;
      case "ban":
        banCheck(parsedMessage);
        break;
      case "mute":
        muteCheck(parsedMessage);
        break;
      default:
        console.error("Unrecognized message", parsedMessage);
    }
  };
};

const setEnvironment = function (maxWidth, maxFrameRate, minFrameRate) {
  settingValue.maxWidth = maxWidth;
  settingValue.maxFrameRate = maxFrameRate;
  settingValue.minFrameRate = minFrameRate;
};

const close = () => {
  this.ws.close();
};

const register = function (person, roomName) {
  personName = person;
  room = roomName;

  var message = {
    id: "joinRoom",
    name: personName,
    room: roomName,
  };
  sendMessage(message);
};

const callResponse = function (message) {
  if (message.response != "accepted") {
    console.info("Call not accepted by peer. Closing call");
    stop();
  } else {
    window.kurentoUtils.webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
      if (error) return console.error(error);
    });
  }
};

const leave = function () {
  sendMessage({
    id: "leaveRoom",
  });
  for (var key in participants) {
    participants[key].dispose();
  }
  ws.close();
};

const receiveVideo = function (sender) {
  var participant = new Participant(sender);
  participants[sender] = participant;
  var video = participant.getVideoElement();

  var options = {
    remoteVideo: video,
    onicecandidate: participant.onIceCandidate.bind(participant),
  };

  participant.rtcPeer = new window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (
    error
  ) {
    if (error) {
      return console.error(error);
    }
    this.generateOffer(participant.offerToReceiveVideo.bind(participant));
  });
};

const sendMessage = function (message) {
  var jsonMessage = JSON.stringify(message);
  console.log("Sending message: " + jsonMessage);
  ws.send(jsonMessage);
};

///////////////////////메세지에 따른 매서드 정의 부분/////////////////////////
const onExistingParticipants = function (msg) {
  var constraints = {
    audio: true,
    video: {
      mandatory: {
        maxWidth: settingValue.maxWidth,
        maxFrameRate: settingValue.maxFrameRate,
        minFrameRate: settingValue.minFrameRate,
      },
    },
  };
  console.log(personName + " registered in room " + room);
  var participant = new Participant(personName);
  participants[personName] = participant;
  var video = participant.getVideoElement();

  var options = {
    localVideo: video,
    mediaConstraints: constraints,
    onicecandidate: participant.onIceCandidate.bind(participant),
    sendSource: source, /////////////////////////////////
  };

  const errFunction = function (error) {
    if (error == "shareEnd") {
      ///////////////////////////////////
      console.log("shareENDEND");
      return "shareEnd";
    } else if (error) {
      return console.error(error);
    }

    this.generateOffer(participant.offerToReceiveVideo.bind(participant));
  };

  participant.rtcPeer = new window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, errFunction);

  me = participant.rtcPeer;
  msg.data.forEach(receiveVideo);
};

const onNewParticipant = function (request) {
  receiveVideo(request.name);
};

const onParticipantLeft = function (request) {
  console.log("Participant " + request.name + " left");
  var participant = participants[request.name];
  participant.dispose();
  delete participants[request.name];
};

const receiveVideoResponse = function (result) {
  participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error) {
    if (error) return console.error(error);
  });
};

const banCheck = function (request) {
  console.log(request.name);
  console.log(personName);
  if (request.name == personName) {
    leave();
  }
};

const muteCheck = function (request) {
  console.log(request.name);
  console.log(personName);
  if (request.name == personName) {
    console.log("mute");
    isSetMuted(false);
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////아래는 화면 공유 내용입니다.//////////////////////////////////////////////////////////////////////////////////

const collection = {
  open,
  setEventListener,
  setEnvironment,
  close,
  register,
  callResponse,
  leave,
  receiveVideo,
  sendMessage,
  isSetMuted,
  isGetMuted,
  isSetScreen,
  isGetScreen,
  setSource,
  getParticipants,
  ban,
  mute,
};

export default collection;
