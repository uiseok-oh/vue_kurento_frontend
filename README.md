# 로컬 환경설정하는 법
(1)docker설치
(2)명령어로 kurento 서버 실행
> docker run -p 8888:8888/tcp -p 5000-5051:5000-5051/udp -e KMS_MIN_PORT=5000 -e KMS_MAX_PORT=5051 kurento/kurento-media-server:latest &

(3) 백엔드 설치
https://lab.ssafy.com/s08-webmobile1-sub2/S08P12A104/-/tree/feat-BE/WebRTC
intelli J 로 실행
(4) 프론트 설치
https://github.com/uiseok-oh/vue_kurento_frontend
npm i
npm run serve
#  세팅하는 법
## (1) public 폴터
public 폴더에 kurento-util.js 추가
public 폴더에 adapter.js 추가
## (2) public/index.html
```
<script src="./kurento-utils.js"></script>
<script src="./adapter.js"></script> 
```
head부분에 추가 하기
## (3) store 폴더
store 폴더에 modulegroupcall.js 추가
## (4) store/index.js
```
import modulegroupcall from "@/store/modulegroupcall";
```
```
  modules: {
    modulegroupcall,
  },
```
해당 소스코드 넣어주기

## (5) views 폴더
coferencechat.vue
coferenceroom.vue
ladder.vue
해당 파일들 views폴더에 추가하기

# 동작 FLOW
(1) HomeView.vue에서 modulegroupcall store에 있는 setPersonName, setRoomName 를 통해 참가자 이름(닉네임)과 방 이름(DB에서 스터디룸 SEQ값)을 저장한다.
(2) 그 후에 coferenceroom.vue 로 url을 이동하면 된다.

 
