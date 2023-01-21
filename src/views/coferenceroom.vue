<template>
  <div>
    <!-- 중앙 메인화면 -->
    <div style="width: 70%" ref="main"></div>
    <!-- 모든 참가자 화면 -->
    <v-sheet class="mx-auto" max-width="100%">
      <v-slide-group multiple show-arrows>
        <div style="display: inline-block" ref="el1" @click="viewChange"></div>
        <div style="display: inline-block" ref="el2" @click="viewChange"></div>
        <div style="display: inline-block" ref="el3" @click="viewChange"></div>
        <div style="display: inline-block" ref="el4" @click="viewChange"></div>
        <div style="display: inline-block" ref="el5" @click="viewChange"></div>
        <div style="display: inline-block" ref="el6" @click="viewChange"></div>
        <div style="display: inline-block" ref="el7" @click="viewChange"></div>
        <div style="display: inline-block" ref="el8" @click="viewChange"></div>
        <div style="display: inline-block" ref="el9" @click="viewChange"></div>
        <div style="display: inline-block" ref="el10" @click="viewChange"></div>
        <div style="display: inline-block" ref="el11" @click="viewChange"></div>
        <div style="display: inline-block" ref="el12" @click="viewChange"></div>
        <div style="display: inline-block" ref="el13" @click="viewChange"></div>
        <div style="display: inline-block" ref="el14" @click="viewChange"></div>
        <div style="display: inline-block" ref="el15" @click="viewChange"></div>
        <div style="display: inline-block" ref="el16" @click="viewChange"></div>
        <div style="display: inline-block" ref="el17" @click="viewChange"></div>
        <div style="display: inline-block" ref="el18" @click="viewChange"></div>
        <div style="display: inline-block" ref="el19" @click="viewChange"></div>
        <div style="display: inline-block" ref="el20" @click="viewChange"></div>
      </v-slide-group>
    </v-sheet>
    <!-- 기능모음 -->
    <div id="room" style="width: 100%">
      <v-btn type="button" id="button-leave" @mouseup="leaveRoom">Leave room</v-btn>
      <v-btn @click="setMute">소리on/off</v-btn>
      <v-btn @click="test">get소리</v-btn>
      <v-btn @click="setScreen">화면on/off</v-btn>
      <v-btn @click="test2">get화면</v-btn>
      <v-btn @click="shareScreen">화면공유on/off</v-btn>
      <select v-model="selected" @click="getPeople" style="width: 100px">
        <option v-for="(item, index) in namesFromParticipants" :key="index">{{ item }}</option>
      </select>
      <v-btn @click="banParticipant">강퇴</v-btn>
      <v-btn @click="keepQuiet">mute시키기</v-btn>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
const modulegroupcall = "modulegroupcall";
export default {
  data() {
    return {
      namesFromParticipants: [], //이름만
      selected: "",
    };
  },
  created() {},
  beforeDestroy() {
    this.leave();
  },
  mounted() {
    // 최우선
    this.addInitEl([
      this.$refs.el1,
      this.$refs.el2,
      this.$refs.el3,
      this.$refs.el4,
      this.$refs.el5,
      this.$refs.el6,
      this.$refs.el7,
      this.$refs.el8,
      this.$refs.el9,
      this.$refs.el10,
      this.$refs.el11,
      this.$refs.el12,
      this.$refs.el13,
      this.$refs.el14,
      this.$refs.el15,
      this.$refs.el16,
      this.$refs.el17,
      this.$refs.el18,
      this.$refs.el19,
      this.$refs.el20,
    ]);

    this.setMainParents(this.$refs.main);
    this.setSource("webcam");
    const data = {
      url: "ws://localhost:8080/groupcall",
      person: this.getPersonName,
      room: this.getRoomName,
    };
    this.open(data);
  },

  computed: {
    ...mapGetters(modulegroupcall, [
      "getPersonName",
      "getRoomName",
      "getAudio",
      "getScreen",
      "getParticipants",
      "getSource",
    ]),
  },
  methods: {
    ...mapActions(modulegroupcall, [
      "addInitEl",
      "setMainParents",
      "setSource",
      "open",
      "leave",
      "isSetAudio",
      "isSetScreen",
      "ban",
      "mute",
      "reset",
      "share",
    ]),
    leaveRoom() {
      this.leave();
    },
    shareScreen() {
      const data = {
        url: "ws://localhost:8080/groupcall",
        person: this.getPersonName,
        room: this.getRoomName,
      };
      if (this.getSource == "desktop") {
        //반대로 가야 함.
        this.reset(data);
      } else {
        this.share(data);
      }
    },
    setMute() {
      this.isSetAudio(!this.getAudio);
    },
    setScreen() {
      this.isSetScreen(!this.getScreen);
    },
    getPeople() {
      const obj = this.getParticipants;
      console.log(obj);
      const keys = Object.keys(obj); // ['name', 'weight', 'price', 'isFresh']
      this.namesFromParticipants = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]; // 각각의 키
        const value = obj[key]; // 각각의 키에 해당하는 각각의 값
        if (value.name != this.getPersonName) this.namesFromParticipants.push(value.name);
      }
      console.log(this.namesFromParticipants);
    },
    banParticipant() {
      console.log(this.selected);
      this.ban(this.selected);
    },
    keepQuiet() {
      console.log(this.selected);
      this.mute(this.selected);
    },
    viewChange(el) {
      const curEl = el.currentTarget.firstChild;
      const mainView = this.$refs.main;
      while (mainView.hasChildNodes()) {
        mainView.removeChild(mainView.firstChild);
      }

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      let videoEl = curEl;

      canvas.style = "width:100%";
      mainView.appendChild(canvas);

      function updateCanvas() {
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        window.requestAnimationFrame(updateCanvas);
      }

      requestAnimationFrame(updateCanvas);
    },
    //////////////////////////////////////////////////////
    test() {
      console.log(this.getAudio);
    },
    test2() {
      console.log(this.getScreen);
    },
  },
};
</script>

<!-- scoped처리로 해당 컴포넌트에서만 동작하게 설정함.   -->
<style scoped></style>
