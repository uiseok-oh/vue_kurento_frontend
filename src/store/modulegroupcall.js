//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Participant(parents, name, receiveCallback, iceCallback) {
  console.log("Participant 생성");

  this.name = name;

  let video = document.createElement("video");
  this.rtcPeer;

  video.id = "video-" + name;
  video.autoplay = true;
  video.controls = false;
  video.muted = false;
  video.style = "display:inline-block;max-width:600px;";
  parents.appendChild(video);

  this.getVideoElement = function () {
    return video;
  };
  this.offerToReceiveVideo = receiveCallback;
  // this.offerToReceiveVideo = function (error, offerSdp, wp) {
  //   if (error) return console.error("sdp offer error");
  //   console.log("Invoking SDP offer callback function");
  //   console.log(wp);
  //   let msg = { id: "receiveVideoFrom", sender: name, sdpOffer: offerSdp };
  //   sendMessage(msg);
  // };
  this.onIceCandidate = iceCallback;
  // this.onIceCandidate = function (candidate, wp) {
  //   console.log("Local candidate" + JSON.stringify(candidate));
  //   console.log(wp);
  //   let message = {
  //     id: "onIceCandidate",
  //     candidate: candidate,
  //     name: name,
  //   };
  //   sendMessage(message);
  // };

  Object.defineProperty(this, "rtcPeer", { writable: true });

  this.dispose = function () {
    console.log("Disposing participant " + this.name);
    this.rtcPeer.dispose();
    parents.removeChild(video);
  };
}

////////////////////////////////////////////////////////////////store 시작//////////////////////////////////////////////////////////////////
const modulegroupcall = {
  namespaced: true,
  state: {
    availableEl: [],
    unAvailableEl: [],
    exitURL: "/",
    webSockUrl: "",
    audioState: true,
    screenState: true,
    mainParents: null,
    webSock: null,
    personName: "UNKNOWN",
    roomName: "UNKNOWN",
    participants: {},
    settingValue: {
      maxWidth: 640,
      maxFrameRate: 15,
      minFrameRate: 15,
    },
    me: null,
    source: "webcam",
  },
  getters: {
    getPersonName(state) {
      return state.personName;
    },
    getRoomName(state) {
      return state.roomName;
    },
    getParticipants(state) {
      return state.participants;
    },
    getSettingValue(state) {
      return state.settingValue;
    },
    getMe(state) {
      return state.me;
    },
    getSource(state) {
      return state.source;
    },
    getAudio(state) {
      return state.audioState;
    },
    getScreen(state) {
      return state.screenState;
    },
  },
  mutations: {
    SET_INIT(state) {
      state.availableEl = [];
      state.unAvailableEl = [];
      state.audioState = true;
      state.screenState = true;
      state.mainParents = null;
      state.webSock = null;
      state.personName = "UNKNOWN";
      state.roomName = "UNKNOWN";
      state.participants = {};
      state.settingValue = {
        maxWidth: 640,
        maxFrameRate: 15,
        minFrameRate: 15,
      };
      state.me = null;
      state.source = "webcam";
    },
    SET_WEBSOCKET_URL(state, url) {
      state.webSockUrl = url;
    },
    SET_WEBSOCK(state, data) {
      state.webSock = data;
    },
    SET_PERSON_NAME(state, name) {
      state.personName = name;
    },
    SET_ROOM_NAME(state, name) {
      state.roomName = name;
    },
    SET_PARTICIPANTS(state, { key, participants }) {
      console.log("key");
      console.log(key);
      console.log("participants");
      console.log(participants);
      state.participants[key] = participants;
    },
    SET_ME(state, me) {
      state.me = me;
    },
    SET_SOURCE(state, source) {
      state.source = source;
    },
    SET_AUDIO(state, on) {
      state.audioState = on;
      state.me.audioEnabled = on;
    },
    SET_SCREEN(state, on) {
      state.screenState = on;
      state.me.videoEnabled = on;
    },
    SET_SETTING_VALUE(state, { maxWidth, maxFrameRate, minFrameRate }) {
      state.settingValue.maxWidth = maxWidth;
      state.settingValue.maxFrameRate = maxFrameRate;
      state.settingValue.minFrameRate = minFrameRate;
    },
    SET_MAIN_PARENTS(state, el) {
      state.mainParents = el;
    },
    ADD_INIT_EL(state, els) {
      state.availableEl = els;
    },
    ADD_EL(state, el) {
      state.availableEl.push(el);
    },
    SUB_EL(state, el) {
      state.unAvailableEl.push(el);
    },
  },
  actions: {
    //////////////비디오 오디오 방 제어 관련 시작///////////////
    addInitEl({ commit }, el) {
      commit("ADD_INIT_EL", el);
    },
    //뮤트 기능
    isSetAudio({ commit }, on) {
      commit("SET_AUDIO", on);
    },
    //스크린 기능
    isSetScreen({ commit }, on) {
      commit("SET_SCREEN", on);
    },
    setSource({ commit }, resource) {
      commit("SET_SOURCE", resource);
    },
    //상대 밴 보내기
    ban({ state, dispatch }, personName) {
      let message = {
        id: "ban",
        name: personName,
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    //상대 뮤트 보내기
    mute({ state, dispatch }, personName) {
      let message = {
        id: "mute",
        name: personName,
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    //초기 이름 세팅
    setPersonName({ commit }, name) {
      commit("SET_PERSON_NAME", name);
    },
    //초기 방이름 세팅
    setRoomName({ commit }, name) {
      commit("SET_ROOM_NAME", name);
    },
    //////////////비디오 오디오 방 제어 관련 끝///////////////

    //////////////통신 제어 관련 시작///////////////
    open({ state, dispatch, commit }, { url, person, room }) {
      ////////////////////////////////////////////
      commit("SET_WEBSOCKET_URL", url);
      commit("SET_WEBSOCK", new WebSocket(url));
      dispatch("setEventListener");

      console.log(state.webSock);
      state.webSock.onopen = () => {
        console.log("start");
        let message = {
          id: "joinRoom",
          name: person,
          room: room,
        };
        dispatch("sendMessage", message);
      };
    },

    setEnvironment({ commit }, { maxWidth, maxFrameRate, minFrameRate }) {
      commit("SET_SETTING_VALUE", { maxWidth, maxFrameRate, minFrameRate });
    },

    //////////////통신 제어 관련 끝///////////////
    //////////////시그널링 서버로 메세지 전달 관련 시작///////////////

    leave({ state, commit, dispatch }) {
      const message = {
        id: "leaveRoom",
      };
      dispatch("sendMessage", message);

      for (let key in state.participants) {
        state.participants[key].dispose();
      }
      state.webSock.close();
      commit("SET_INIT");
      window.location.href = window.location.origin + state.exitURL;
    },
    reset({ dispatch, state }, data) {
      const message = {
        id: "leaveRoom",
      };
      dispatch("sendMessage", message);

      for (let key in state.participants) {
        state.participants[key].dispose();
      }
      state.webSock.close();
      state.source = "webcam";
      dispatch("open", data);
    },

    share({ dispatch, state }, data) {
      const message = {
        id: "leaveRoom",
      };
      dispatch("sendMessage", message);

      for (let key in state.participants) {
        state.participants[key].dispose();
      }
      state.webSock.close();
      state.source = "desktop";
      dispatch("open", data);
    },

    //////////////시그널링 서버로 메세지 전달 관련 끝///////////////

    receiveVideo({ commit, dispatch, state }, sender) {
      const receiveCallback = function (error, offerSdp, wp) {
        if (error) return console.error("sdp offer error");
        console.log("Invoking SDP offer callback function");
        console.log(wp);
        let msg = { id: "receiveVideoFrom", sender: sender, sdpOffer: offerSdp };
        dispatch("sendMessage", msg);
      };

      const iceCallback = function (candidate, wp) {
        console.log("Local candidate" + JSON.stringify(candidate));
        console.log(wp);
        let message = {
          id: "onIceCandidate",
          candidate: candidate,
          name: sender,
        };
        dispatch("sendMessage", message);
      };

      let pEl = state.availableEl.pop();
      commit("SUB_EL", pEl);

      const recovery = function () {
        commit("ADD_EL", pEl);
        state.availableEl.splice(pEl, 1);
      };

      let participant = new Participant(pEl, sender, receiveCallback, iceCallback, recovery);
      // state.participants[sender] = participant;
      commit("SET_PARTICIPANTS", { key: sender, participants: participant }); // key, participants
      let video = participant.getVideoElement();

      let options = {
        remoteVideo: video,
        // onicecandidate: participant.onIceCandidate.bind(participant),
        onicecandidate: iceCallback,
      };

      participant.rtcPeer = new window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
        options,
        function (error) {
          if (error) {
            return console.error(error);
          }
          this.generateOffer(participant.offerToReceiveVideo.bind(participant));
        }
      );
    },

    //////////////시그널링 서버에서 메세지 수신 관련 시작///////////////
    /*
        필요한 응답이 있으면 말해주시면, "sendMessage로 보낼 데이터와,setEventListener로 받을 데이터"를 생각해주세요
    */
    //응답에 대한 리스너 함수
    setEventListener({ state, dispatch }) {
      state.webSock.onmessage = (message) => {
        let parsedMessage = JSON.parse(message.data);
        console.info("Received message: " + message.data);
        console.info("Received message: " + parsedMessage.id);

        switch (parsedMessage.id) {
          case "existingParticipants":
            dispatch("onExistingParticipants", parsedMessage);
            break;
          case "newParticipantArrived":
            dispatch("onNewParticipant", parsedMessage);
            break;
          case "participantLeft":
            dispatch("onParticipantLeft", parsedMessage);
            break;
          case "receiveVideoAnswer":
            dispatch("receiveVideoResponse", parsedMessage);
            break;
          case "iceCandidate":
            console.log("iceCandidate");
            console.log(parsedMessage);
            console.log(state.participants);
            state.participants[parsedMessage.name].rtcPeer.addIceCandidate(
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
            dispatch("onBan", parsedMessage);
            break;
          case "mute":
            dispatch("onMute", parsedMessage);
            break;
          default:
            console.error("Unrecognized message", parsedMessage);
        }
      };
    },
    //그룹 통화방에 들어갔을 때
    onExistingParticipants({ dispatch, state, commit }, msg) {
      const receiveCallback = function (error, offerSdp, wp) {
        if (error) return console.error("sdp offer error");
        console.log("Invoking SDP offer callback function");
        console.log(wp);
        let message = { id: "receiveVideoFrom", sender: state.personName, sdpOffer: offerSdp };
        dispatch("sendMessage", message);
      };

      const iceCallback = function (candidate, wp) {
        console.log("Local candidate" + JSON.stringify(candidate));
        console.log(wp);
        let message = {
          id: "onIceCandidate",
          candidate: candidate,
          name: state.personName,
        };
        dispatch("sendMessage", message);
      };

      let constraints = {
        audio: true,
        video: {
          mandatory: {
            maxWidth: state.settingValue.maxWidth,
            maxFrameRate: state.settingValue.maxFrameRate,
            minFrameRate: state.settingValue.minFrameRate,
          },
        },
      };
      console.log(state.personName + " registered in room " + state.roomName);

      let pEl = state.availableEl.pop();
      commit("SUB_EL", pEl);

      const recovery = function () {
        commit("ADD_EL", pEl);
        state.availableEl.splice(pEl, 1);
      };

      let participant = new Participant(
        pEl,
        state.personName,
        receiveCallback,
        iceCallback,
        recovery
      );
      state.participants[state.personName] = participant;
      let video = participant.getVideoElement();

      let options = {
        localVideo: video,
        mediaConstraints: constraints,
        // onicecandidate: participant.onIceCandidate.bind(participant),
        onicecandidate: iceCallback,
        sendSource: state.source,
      };

      const errFunction = function (error) {
        if (error == "shareEnd") {
          ///////////////////////////////////공유 끝
          console.log("shareENDEND");
          dispatch("reset", {
            url: state.webSockUrl,
            person: state.personName,
            room: state.roomName,
          });
          return "shareEnd";
        } else if (error) {
          return console.error(error);
        }

        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      };

      participant.rtcPeer = new window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
        options,
        errFunction
      );

      dispatch("makeMainScreen", participant);
      msg.data.forEach(function (sender) {
        const receiveCallback2 = function (error, offerSdp, wp) {
          if (error) return console.error("sdp offer error");
          console.log("Invoking SDP offer callback function");
          console.log(wp);
          let message = { id: "receiveVideoFrom", sender: sender, sdpOffer: offerSdp };
          dispatch("sendMessage", message);
        };

        const iceCallback2 = function (candidate, wp) {
          console.log("Local candidate" + JSON.stringify(candidate));
          console.log(wp);
          let message = {
            id: "onIceCandidate",
            candidate: candidate,
            name: sender,
          };
          dispatch("sendMessage", message);
        };

        let pEl2 = state.availableEl.pop();
        commit("SUB_EL", pEl2);

        const recovery2 = function () {
          commit("ADD_EL", pEl2);
          state.availableEl.splice(pEl2, 1);
        };

        let participant = new Participant(pEl, sender, receiveCallback2, iceCallback2, recovery2);
        // state.participants[sender] = participant;
        commit("SET_PARTICIPANTS", { key: sender, participants: participant }); //// key, participants
        let video = participant.getVideoElement();

        let options = {
          remoteVideo: video,
          onicecandidate: participant.onIceCandidate.bind(participant),
          //onicecandidate: iceCallback,
        };

        participant.rtcPeer = new window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
          options,
          function (error) {
            if (error) {
              return console.error(error);
            }
            this.generateOffer(participant.offerToReceiveVideo.bind(participant));
          }
        );
      });
    },
    //그룹 통화에 참가자가 들어왔을 때
    onNewParticipant({ dispatch }, request) {
      dispatch("receiveVideo", request.name);
    },
    //그룹 통화 참가자가 나갔을 때
    onParticipantLeft({ state }, request) {
      console.log("Participant " + request.name + " left");
      let participant = state.participants[request.name];
      participant.dispose();
      delete state.participants[request.name];
    },
    //video 받았을 때
    receiveVideoResponse({ state }, result) {
      console.log("result.name");
      console.log(result.name);
      console.log("participants");
      console.log(state.participants);
      state.participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error) {
        if (error) return console.error(error);
      });
    },
    //다른 사람이 나를 ban했을 때
    onBan({ state, dispatch }, request) {
      if (request.name == state.personName) {
        dispatch("leave");
      }
    },
    //다른 사람이 나를 mute했을 때
    onMute({ state, commit }, request) {
      if (request.name == state.personName) {
        console.log("mute");
        commit("SET_AUDIO", false);
      }
    },
    //////////////시그널링 서버에서 메세지 수신 관련 끝///////////////
    sendMessage({ state }, message) {
      let jsonMessage = JSON.stringify(message);
      console.log("Sending message: " + jsonMessage);
      state.webSock.send(jsonMessage);
    },

    setMainParents({ commit }, el) {
      commit("SET_MAIN_PARENTS", el);
    },
    makeMainScreen({ commit, state }, main) {
      // state.mainParents 제거 부분
      while (state.mainParents.hasChildNodes()) {
        state.mainParents.removeChild(state.mainParents.firstChild);
      }

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      let videoEl = main.getVideoElement();

      canvas.style = "width:100%";
      state.mainParents.appendChild(canvas);

      function updateCanvas() {
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        window.requestAnimationFrame(updateCanvas);
      }

      requestAnimationFrame(updateCanvas);
      commit("SET_ME", main.rtcPeer);
    },
  },
};
export default modulegroupcall;

////////////////////////////////////////////////////////////////store 끝//////////////////////////////////////////////////////////////////
