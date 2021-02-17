# COINJOA
모의 투자 사이트개발 불법 절대X (MEAN tutorial 기반)

https://coinjoa.herokuapp.com/

# 개인용 환경 구축방법
  *MongoDB 가입, Cluster와 DB생성, ip와 관리자 아이디설정 후 

  시스템 환경변수에 MONGO_DB 로 추가

    mongodb+srv://alscjf9751:alscjfrhtn1!@cluster0.w8bvr.mongodb.net/test?retryWrites=true&w=majority

  마찬가지로 GOOGLE_CLIENT_ID, GOOGLE_SECRET 추가

    489912810266-ffk6n0b5ldnlbn7mvllg06d30mltbrg3.apps.googleusercontent.com

    9H0rtg4B2_bc5gR-HEKeGPB9
  그 후 $npm install 하십시오
  
# 구조 설명
config - Express의 인증 미들웨어인 Passport.js가 들어있다. 구글로그인 구현 중
models - mongoose.Schema로 db에 저장되는 table 형식들이 모여있음
public - css js 모아놓은곳
routes - router.get으로 라우팅하는곳임 요청에 응답하는 방식을 알려줌
views - ejs로 작성된 말그대로 페이지 뷰, html이랑 문법이 디게 비슷한데 <% %>같은 걸 쓰는 문법형식을 따른다.
*<ejs 문법>
주석 : <%# ... %>
JS 코드 : <% ... %>
변수 출력(html escape 처리: >를 $gt로 변환) : <%= ... %>
태그내부 공백 제거 : <%_ ... _%>
html escape안하고 변수 출력 : <%- ... %>
분할시 : <% include 파일명(ex. ./nav.ejs) %>

실행시 app.set('view engine', 'ejs'); 필요하다.

index.js - 제일중요하다 모든 세팅과 실행을 해줌
package.json - 의존성 알려줌 npm 설치할때마다 --save 하면 자동으로 적힘 웹에 올릴때 참고되는 파일
package-lock - 개발자 시점에서 적힌 구체적인 의존성 모음 툴이라고 해야하나 npm install하면 알아서 생기더라
util.js - 잡다한 기능
