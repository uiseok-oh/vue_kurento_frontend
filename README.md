1. 세팅
public 폴더에 kurento-util.js 추가   -> 해당 파일은 외부 라이브러리라 윈도우 객체로 만드는 것이 컨트롤하기 좋다고 생각이 들었습니다.(물론 화면 공유 등 다른 기능을 추가 했지만, 다 바꾸기는 시간적 여유가 없습니다<br>
public 폴더에 adpater.js 추가   -> 해당 파일은 외부 라이브러리라 윈도우 객체로 만드는 것이 컨트롤하기 좋다고 생각이 들었습니다.<br>
public/index.html -> <script src="./kurento-utils.js"></script> 추가 <br>
                  ->  <script src="./adapter.js"></script> <br>

src폴더에 필요 js파일 세팅.<br>

