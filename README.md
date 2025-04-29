# 🐶 소개팅 – GPS 기반 반려동물 친구 만들기 서비스
![표지](https://github.com/user-attachments/assets/da5bd035-7759-4d7c-9223-14c81ce95aca)

## 🚀 프로젝트 소개

- 소개팅은 GPS 기반으로 주변 반려동물 친구를 찾아주고,
  산책을 함께할 친구를 매칭해주는 반려동물 소개팅 웹 서비스입니다.
  
### 프로젝트 실행

```
cd back-project
npm install
npm run start:dev
```

## ☁️ 배포 링크

- 🔗 소개팅 홈페이지 주소: http://52.79.135.142
- 🌐 프론트 배포 서버: AWS EC2 (Next.js)
- 🛠 백엔드 서버: AWS EC2 (NestJS)
- 💾 DB: AWS (MySQL)

## 🎥 서비스 미리보기

- 아래는 **소개팅**의 주요 화면을 미리 볼 수 있는 이미지입니다.  
  각 페이지의 UI 및 기능을 확인해보세요!

<table>
  <tr>
    <td align="center">
      <strong>메인 페이지</strong><br><br>
      <img src="https://github.com/user-attachments/assets/9ee8d7db-5647-4c46-92b0-14316b3d3949" alt="mainpage" width="250" height="250">
    </td>
    <td align="center">
      <strong>전체 게시물</strong><br><br>
      <img src="https://github.com/user-attachments/assets/c5e59416-c6ff-4fd0-89da-8b6b52652b44" alt="all-post" width="250" height="250">
    </td>
    <td align="center">
       <strong>상세 게시물</strong><br><br>
      <img src="https://github.com/user-attachments/assets/5ba43f33-d9b9-4332-a8fa-d55677fcdb21" alt="post" width="250" height="250">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>채팅하기</strong><br><br>
      <img src="https://github.com/user-attachments/assets/e6d3f330-0ae4-47d8-83cd-d55063b688ca" alt="chat" width="250" height="250">
    </td>
    <td align="center">
      <strong>내 정보 보기</strong><br><br>
      <img src="https://github.com/user-attachments/assets/6288bde7-1dcf-485b-9c98-f0d051e8786e" alt="my-profile" width="250" height="250">
    </td>
     <td align="center">
      <strong>산책 메이트 & AI 매칭</strong><br><br>
       <img alt="ai-page" src="https://github.com/user-attachments/assets/8b08b489-aa37-4d95-b706-2578f7e162ec" width="250" height="250"/>
    </td>
  </tr>
   <tr>
    <td align="center">
      <strong>소셜 로그인</strong><br><br>
      <img src="https://github.com/user-attachments/assets/6fb5ec66-3a87-4909-a2a3-7988230765a6" alt="login" width="250" height="250">
    </td>
    <td align="center">
      <strong>결제하기</strong><br><br>
      <img src="https://github.com/user-attachments/assets/c4f46d4d-906a-4c81-b165-a230cb200dd6" alt="pay-page" width="250" height="250">
    </td>
     <td align="center">
      <strong>ADMIN</strong><br><br>
       <img alt="admin-page" src="https://github.com/user-attachments/assets/e39b6e99-70d3-4dcb-95d7-08ce80a132dc" width="250" height="250"/>
    </td>
  </tr>
</table>

## 📌 목차

## 📆 프로젝트 기간 및 팀 구성

- 기간: 2025.03.31 ~ 2025.04.25 (약 4주)
- 팀원: 프론트엔드 2명 / 백엔드 1명 (총 3명)

## :busts_in_silhouette: Developers

| FE. 김은주                          | FE. 최승연                                  | BE. 최유진                              |
| ----------------------------------- | ------------------------------------------- | --------------------------------------- |
| [ounjuu](https://github.com/ounjuu) | [werther901](https://github.com/werther901) | [yujeen02](https://github.com/yujeen02) |

## 🎯 개발 동기

- 반려동물 간의 사회성을 길러주기 위한 서비스입니다.
- 위치 기반 매칭 및 채팅 기능을 통해 보호자 간의 실질적인 교류와 만남의 장을 제공합니다.
- 단순 정보 공유를 넘어선 실시간 소통이 가능한 커뮤니티 플랫폼입니다.

## 🖥️ 주요 기능

- 📍 GPS 기반 친구 찾기
- 💬 실시간 채팅 및 팔로우 기능
- 💛 소셜 로그인 및 좋아요 기능
- 📢 게시물 및 댓글, 대댓글 작성 기능
- 🐶 반려동물 프로필 등록 및 조회
- 🙋 마이페이지 - 내 정보, 알림 확인 등

## ⚙️ 기술 스택

- **🛠️ Frontend**: Next.js, TypeScript, Redux-toolkit, React Query, styled-components
- **🛠️ Backend**: Nest.js, TypeORM, MySQL, JWT
- **🛠️ DevOps**: AWS EC2, Nginx, PM2
- **🛠️ Others**: OAuth (Kakao, Naver, Google), Formik, Yup, Figma, Notion

## 🗂️ DB 설계도
<img width="700" alt="db" src="https://github.com/user-attachments/assets/0e210187-bbd8-4771-ac92-c3fc0c541789" />

## 🧾 API 명세서

## 주요 기능 소개

### 🏠 메인 페이지

- 메인 페이지에서는 이벤트 창 확인, MBTI 매칭 서비스 이용, 다른 페이지로 이동이 가능합니다.

### 🔑 로그인 / 추가 정보 입력

1. 소셜 로그인 기능을 제공합니다. (카카오, 네이버, 구글)
- 각각 passport 기반으로 전략을 설정했습니다.
- validate() 매서드에서 OAuth 프로필 정보를 가공하여 유저 정보를 리턴합니다.
- 로그인 시 기존 유저를 조회하거나, 없으면 신규 유저를 생성합니다.
- 전화번호가 등록되지 않은 유저의 경우 임시 토큰을 발급해 추가 정보 입력 페이지로 리다이렉트합니다.
  
2. JWT 인증 전략을 적용합니다.
- passport의 jwt 전략을 사용해, access_token을 Authorization 헤더에서 추출해 인증합니다.
- 토큰 payload에는 유저 ID, 역할, 전화번호 인증 여부 등이 포함됩니다.
- 발급된 access_token은 서버에 저장하지 않고, 클라이언트에게 보냅니다.
  
3. 토큰 발급 및 관리 기능을 제공합니다.
- access_token과 refresh_token을 발급합니다.
- access_token은 짧은 만료 시간으로 발급하며, refresh_token은 데이터베이스에 저장해 관리합니다.
- refresh_token을 사용해 access_token을 재발급할 수 있습니다.
- refresh 요청 시, DB에 저장된 refresh_token과 비교해 일치할 경우에만 새로운 access_token을 발급합니다.
  
4. 전화번호 등록 및 추가 정보 입력 기능을 제공합니다.
- 소셜 로그인한 유저가 전화번호, 성별, 닉네임을 추가로 등록할 수 있도록 지원합니다.
- 전화번호 등록 완료 시, 기존 임시 토큰을 access_token과 refresh_token으로 대체합니다.
  
5. 로그인 상태 및 인증 상태를 확인하는 기능을 제공합니다.
- access_token을 이용해 로그인 여부를 확인할 수 있습니다.
- 임시 토큰을 기반으로 전화번호 등록 유저 인증도 가능합니다.
- 관리자 계정도 확인하는 기능을 제공합니다.
 
### 💳 결제 페이지

1. 결제 생성 기능을 제공합니다.
- 사용자가 결제를 시작할 때 금액과 결제 방법을 입력받아 새로운 결제 레코드를 생성합니다.
- 결제 요처 시 고유한 orderId를 생성해 결제 정보를 관리합니다.
- 생성된 결제 데이터는 데이터베이스에 저장됩니다.
  
2. 결제 성공 처리 기능을 제공합니다.
- 결제 완료 후, Toss에서 결제 성공 정보를 전달받아 결제 상태를 SUCCESS로 업데이트합니다.
- 결제 금액에 따라 유저의 권한을 업데이트합니다.
  
3. 결제 실패 처리 기능을 제공합니다.
- 결제 실패 시, 실패 정보를 받아 결제 상태를 FAILED로 업데이트합니다.
- 실패 메시지를 결제 레코드에 기록합니다.
  
4. 결제 내역 조회 기능을 제공합니다.
   
5. 관리자 결제 관리 기능을 제공합니다.

6. Toss Client Key 제공 기능을 제공합니다.
- 클라이언트에서 Toss 결제 요청을 진행할 수 있도록, Toss Client Key를 반환합니다.

### 🤖 AI 매칭

1. 강아지 매칭 추천 기능을 제공합니다.
- 사용자의 강아지 정보를 기반으로, 3km이내에 있는 강아지 중 궁합이 잘 맞는 강아지를 추천합니다.
- 사용자가 현재 위치(위도, 경도)를 전달하면, 해당 위치를 기준으로 근처 강아지들을 탐색합니다.

2. 3km 반경 인근 강아지 탐색
- 
3. Gemini AI를 활용한 추천 로직을 적용합니다.
- 구글의 Gemini API를 호출해, 사용자의 강아지 MBTI와 성격을 기반으로 매칭에 적합한 강아지 MBTI·성격 조합을 추천받습니다.
- AI가 추천한 결과를 파싱해, 서버에서 실제 근처 강아지들과 비교합니다.
- AI가 제안한 조합과 실제 인근 강아지의 MBTI, 성격이 1개 이상 일치하면 매칭합니다.
  
4. 매칭 결과를 반환합니다.
- 조건에 맞는 강아지가 있다면 해당 강아지 정보를 반환하며 없는 경우 매칭 실패 에러를 반환합니다.

### 🐾 산책메이트

- 현재 위치를 기준으로 근처에 있는 산책 친구들을 찾아볼 수 있습니다.
- 원하는 상대에게 채팅 신청을 보내 실시간으로 대화를 시작할 수 있습니다.

### 📝 게시글 등록 / 수정

- 사용자는 텍스트 내용과 여러 이미지를 업로드해 작성할 수 있습니다.
- 사용자는 자신의 게시글의 텍스트 내용을 수정할 수 있습니다.

### 📌 전체게시판

- 날씨 API를 활용하여 접속한 위치에 맞는 실시간 날씨 정보를 산책과 관련된 문구로 제공합니다.
- 로그인 한 모든 사용자는 게시판에 올라온 게시글을 열람할 수 있습니다.
- 게시글 제목 검색을 통해 원하는 게시글을 찾을 수 있습니다.
- 게시물 상세 페이지 확인이 가능합니다.
- 댓글 기능, 대댓글 기능, 좋아요 기능을 제공합니다.
- 무한 스크롤로 게시글을 계속해서 확인할 수 있습니다.
- 게시물을 신고할 수 있는 기능을 제공합니다.
- 게시물 작성 페이지로 이동할 수 있습니다.
- 카카오 API를 이용한 게시물 공유 기능이 제공됩니다.

### 👀 OtherProfile

- 반려동물의 프로필이나 다른 사람의 게시글을 모아서 볼 수 있는 기능을 제공합니다.
- 팔로우 버튼을 클릭하여 다른 사용자를 팔로우하거나 팔로우를 취소할 수 있습니다.
- 메시지 보내기 기능을 통해 다른 사용자에게 직접 메시지를 보낼 수 있습니다.
- 무한 스크롤 기능을 통해 게시글을 계속해서 자동으로 불러옵니다.
- 팔로워, 팔로우 목록을 확인할 수 있는 기능을 제공합니다.

### 🙋‍♂️ MyProfile

- 회원 정보 및 강아지 프로필을 수정할 수 있는 기능을 제공합니다.
- 내가 작성한 게시글, 좋아요를 누른 게시글을 확인할 수 있는 기능을 제공합니다.
- 받은 알림을 확인할 수 있는 기능을 제공합니다.
- 회원권 정보를 확인할 수 있는 기능을 제공합니다.
- 회원 탈퇴 기능을 제공합니다.
- 무한 스크롤 기능을 통해 게시글을 계속해서 자동으로 불러옵니다.
- 팔로워, 팔로우 목록을 확인할 수 있는 기능을 제공합니다.
- 게시글의 상세 페이지를 확인할 수 있는 기능을 제공합니다.
- 게시글에 호버 시 댓글 및 좋아요 개수를 확인할 수 있는 기능을 제공합니다.

### 💬 채팅

- 실시간으로 메시지를 주고받을 수 있는 기능을 제공합니다.
- 채팅방을 신고할 수 있는 기능을 제공합니다.
- 채팅 삭제 기능을 제공합니다.
- 반응형 디자인에 따라 다른 UI를 제공합니다.

### ❓ 문의하기

- 서비스 관련 질문을 접수할 수 있는 기능을 제공합니다.
- 환불 문의를 접수할 수 있는 기능을 제공합니다.
- 관리자 페이지에서 문의 내용을 관리할 수 있는 기능을 제공합니다.

### 🚨 신고하기

- 부적절한 사용자 또는 게시글, 댓글을 신고할 수 있는 기능을 제공합니다.
- 신속한 조치를 위한 신고 사유를 입력할 수 있는 기능을 제공합니다.

### 🛠 admin

- 관리자 전용 페이지입니다.
- 통계 자료를 표시할 수 있는 기능을 제공합니다.
- 회원 정보, 신고 정보, 문의 정보를 확인할 수 있는 기능을 제공합니다.
- 블랙리스트를 관리할 수 있는 기능을 제공합니다.


👉 **프론트 레포지토리**: [PuppyCupid_front-project](https://github.com/Team-YES/PuppyCupid_FrontEnd)
