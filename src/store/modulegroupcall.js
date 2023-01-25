//////////////////////////////////////////////////constructor 세팅 시작///////////////////////////////////////////////////////////////////////////////////////////
function Participant(parents, name, receiveCallback, iceCallback, recovery) {
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
  //화면 반환을 위한 receive 콜백 함수 설정
  this.offerToReceiveVideo = receiveCallback;
  //ICE 세팅 ( == 어떤 서버를 통해 연결해야 가장 빠른지 판단하는 부분 Turn / Stun ..등 등 )
  this.onIceCandidate = iceCallback;
  Object.defineProperty(this, "rtcPeer", { writable: true });

  this.dispose = function () {
    console.log("Disposing participant " + this.name);
    this.rtcPeer.dispose();
    parents.removeChild(video);
    //사용한 엘리먼트 => 다시 사용할 수 있게 반환
    recovery();
  };
}
//////////////////////////////////////////////////constructor 세팅 시작///////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////store 시작//////////////////////////////////////////////////////////////////
const modulegroupcall = {
  namespaced: true,
  state: {
    isViewAlarmDiv: false,
    isViewExitDiv:false,
    isViewMuteDiv:false,
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
    alarmDivText: "",
    muteDivText: "",
    exitDivText: "",
    requestMuteParticipant: "",
    muteCnt : 0,
    exitCnt : 0,
    remainTime : 0,

  },
  getters: {
    getRemainTime(state){
      return state.remainTime;
    },
    getAlarmDivText(state) {
      return state.alarmDivText;
    },
    getMuteDivText(state) {
      return state.muteDivText;
    },
    getExitDivText(state) {
      return state.exitDivText;
    },
    getIsViewAlarmDiv(state) {
      return state.isViewAlarmDiv;
    },
    getIsViewExitDiv(state) {
      return state.isViewExitDiv;
    },
    getIsViewMuteDiv(state) {
      return state.isViewMuteDiv;
    },
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
    SET_ALARM_VIEW(state, on){
      state.isViewAlarmDiv = on;
    },
    ADD_MUTE_CNT(state){
      state.muteCnt += 1;
    },
    ADD_EXIT_CNT(state){
      state.exitCnt += 1;
    },
    SET_MUTE_VIEW(state,on){
      state.isViewMuteDiv = on
    },
    SET_EXIT_VIEW(state,on){
      state.isViewExitDiv = on
    },
    SET_ALARM_TEXT(state,text){
      state.alarmDivText = text;
    },
    SET_MUTE_TEXT(state,text){
      state.muteDivText = text;
    },
    SET_EXIT_TEXT(state,text){
      state.exitDivText = text;
    },
  },
  actions: {
    //////////////기능 제어 관련 시작///////////////
    //화면을 세팅할 엘리먼트 추가할 수 있는 부분
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
    //webcam or desktop 중 선택
    setSource({ commit }, resource) {
      commit("SET_SOURCE", resource);
    },
    //초기 참가자이름 세팅
    setPersonName({ commit }, name) {
      commit("SET_PERSON_NAME", name);
    },
    //초기 방이름 세팅
    setRoomName({ commit }, name) {
      commit("SET_ROOM_NAME", name);
    },
    setViewAlarmDiv({commit},on){
      commit("SET_ALARM_VIEW", on);
    },
    //////////////비디오 오디오 방 제어 관련 끝///////////////

    //////////////통신 제어 관련 시작///////////////
    open({ state, dispatch, commit }, { url, person, room }) {
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
    mute({ state, dispatch }) {
      let message = {
        id: "mute",
        name: state.requestMuteParticipant,
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    exit({ state, dispatch }) {
      let message = {
        id: "exit",
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    requestMuteSend({state,dispatch},target){
      let message = {
        id: "requestMute",
        name: target,
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    requestExitSend({state,dispatch}){
      let message = {
        id: "requestExit",
        room: state.roomName,
      };
      dispatch("sendMessage", message);
    },
    //////////////시그널링 서버로 메세지 전달 관련 끝///////////////

    
    //////////////실질적인 RTC 데이터를 비디오로 변환하는 부분 시작///////////////
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
    //////////////실질적인 RTC 데이터를 비디오로 변환하는 부분 끝///////////////

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
          case "requestMuteVote":
              dispatch("requestMuteVote", parsedMessage);
              break;
          case "requestExitVote":
              dispatch("requestExitVote");
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
          case "exit":
            dispatch("onExit");
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
    requestMuteVote({ state,commit,dispatch }, result){
      state.requestMuteParticipant = result.name;
      state.muteCnt = 0;
      commit("SET_MUTE_TEXT","["+result.name+"]님을 음소거 하시겠습니까?");
      setTimeout(() => {
        state.isViewMuteDiv = true;
      }, 1000);//1초뒤에 투표화면  보여짐... because muteCnt 초기화 시간이 필요...Backend에서 할 경우, thread가 많아져서 서버 터질 확률 높음

      state.remainTime = 6000;
      let timerId = setInterval(() => {
        state.remainTime = state.remainTime -10;
      }, 10);//10ms마다 반복


      const voteResult = () => {
        const participantNum = Object.keys(state.participants).length;
        state.isViewMuteDiv = false;  //timeout 투표 시간 지났을 경우, 화면을 끄기 위함
        if(state.muteCnt > (participantNum/2) ){
          dispatch("isSetAudio",false);
          //알람으로 알려주기
          commit("SET_ALARM_VIEW",true);
          commit("SET_ALARM_TEXT", "["+result.name+"]님이 음소거 되셨습니다.");
          //알람으로 알려주기
        }else{
          //알람으로 알려주기
          commit("SET_ALARM_VIEW",true);
          commit("SET_ALARM_TEXT", "["+result.name+"]님이 음소거가 거부되었습니다");
          //알람으로 알려주기
        }
        clearInterval(timerId);
      };


      setTimeout(voteResult, 6000);

    },
    requestExitVote({ state,commit,dispatch }){
      state.exitCnt = 0;
      commit("SET_EXIT_TEXT","스터디를 끝내시겠습니까? ");

      setTimeout(() => {
        state.isViewExitDiv = true;
      }, 1000);//1초뒤에 투표화면  보여짐... because muteCnt 초기화 시간이 필요...Backend에서 할 경우, thread가 많아져서 서버 터질 확률 높음

      state.remainTime = 6000;
      let timerId = setInterval(() => {
        state.remainTime = state.remainTime -10;
      }, 10);//10ms마다 반복


      const voteResult = () => {
        const participantNum = Object.keys(state.participants).length;
        state.isViewExitDiv = false;  //timeout 투표 시간 지났을 경우, 화면을 끄기 위함
        if(state.exitCnt > (participantNum/2) ){
          ////////방나가기....
          dispatch("leave");
        }
        clearInterval(timerId);
      };


      setTimeout(voteResult, 6000);

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
        commit("ADD_MUTE_CNT");
      }
    },
    onExit({ commit },) {
        console.log("exit");
        commit("ADD_EXIT_CNT");
    },
    //isViewMuteDiv
    setIsViewMuteDiv({commit},on){
      commit("SET_MUTE_VIEW",on);
    },
    //isViewMuteDiv
    setIsViewExitDiv({commit},on){
      commit("SET_EXIT_VIEW",on);
    },
    //////////////시그널링 서버에서 메세지 수신 관련 끝///////////////

    
    ////////////////////////////ETC 시작/////////////////////////////
    // 시그널링 서버로 데이터 전달
    sendMessage({ state }, message) {
      let jsonMessage = JSON.stringify(message);
      console.log("Sending message: " + jsonMessage);
      state.webSock.send(jsonMessage);
    },
    // 메인화면 엘리먼트 전달
    setMainParents({ commit }, el) {
      commit("SET_MAIN_PARENTS", el);
    },
    // 메인화면 엘리먼트로 video 화면 복사(지속적으로 복사)
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
    
    ////////////////////////////ETC 끝/////////////////////////////
  },
};
export default modulegroupcall;

////////////////////////////////////////////////////////////////store 끝//////////////////////////////////////////////////////////////////
