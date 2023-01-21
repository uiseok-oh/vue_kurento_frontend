<template>
  <div class="home">
    <div id="container">
      <div id="wrapper">
        <div id="join" class="animate join">
          <h1>Join a Room</h1>
          <p>
            <v-text-field
              v-model="person"
              type="text"
              name="name"
              value=""
              id="name"
              required
            ></v-text-field>
          </p>
          <p>
            <v-text-field
              v-model="room"
              type="text"
              name="room"
              value=""
              id="roomName"
              required
            ></v-text-field>
          </p>
          <v-btn elevation="2" x-large @click="register" name="commit">Join</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
const modulegroupcall = "modulegroupcall";

export default {
  data() {
    return {
      person: "",
      room: "1",
    };
  },
  methods: {
    ...mapActions(modulegroupcall, ["setPersonName", "setRoomName"]),
    register() {
      this.setPersonName(this.person);
      this.setRoomName(this.room);
      this.$router.push("/coferenceroom");
    },
  },
  created() {
    this.person = Math.random().toString(36).substring(2, 12);
  },
};
</script>

<!-- scoped처리로 해당 컴포넌트에서만 동작하게 설정함.   -->
<style scoped>
/* @import  "@/folder/style.css"; */
</style>
