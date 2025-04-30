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
<img width="1066" alt="Image" src="https://github.com/user-attachments/assets/867d3d1f-a769-4e3d-b661-50a8356fcd8b" />

## 주요 기능 소개

### 🏠 메인 페이지

- 메인 페이지에서는 이벤트 창 확인, MBTI 매칭 서비스 이용, 다른 페이지로 이동이 가능합니다.

### 🔑 로그인 / 사용자 인증

- 소셜 로그인(OAuth)을 제공합니다. (카카오, 네이버, 구글)
- passport 전략 기반으로 각 플랫폼의 OAuth 인증을 처리하며, 처음 로그인한 경우 DB에 유저 정보를 저장합니다.
- 전화번호 미등록 유저에게는 임시 토큰(temp_access_token)을 발급하여 추가 정보 입력을 유도하고, 등록 완료 시 정식 토큰(access, refresh)을 재발급합니다.
- JWT 인증 전략을 기반으로 요청을 보호하며, access_token은 클라이언트에, refresh_token은 DB에 저장되어 관리됩니다.
- refresh_token 요청 시 DB에 저장된 값과 일치하는 경우에만 access 토큰을 재발급합니다.

### 🐶 반려동물 등록 및 관리

- 사용자당 한 마리의 반려동물 프로필을 등록/수정할 수 있으며, 강아지의 성별, MBTI, 성격, 위치 등을 함께 저장합니다.
- 이미지 파일은 Multer를 이용해 서버 로컬 디렉토리에 저장됩니다.
- 위치 정보 등록 시 반경 3km 이내의 다른 강아지를 ST_Distance_Sphere SQL 함수 기반 raw query로 탐색합니다.

 
### 💳 결제 시스템

- Toss Payments API를 활용해 유료 기능(예: 프리미엄 매칭)을 위한 결제를 처리합니다.
- 결제 시작 시 고유 orderId를 생성하여 DB에 저장하고, 성공 시 결제 상태를 SUCCESS로 업데이트하고 사용자 권한을 변경합니다.
- 월간/연간 결제 금액에 따라 권한(role)을 POWER_MONTH, POWER_YEAR로 부여하며, 유효기간을 DB에 저장합니다.
- 결제 실패 시 상태를 FAILED로 저장하고 실패 사유를 기록합니다.
- 관리자 페이지를 위한 결제 내역 조회 및 통계 기능도 제공합니다.


### 🕒 스케줄러

- NestJS @Cron 기능을 활용하여 매일 새벽 1시에 실행됩니다.
- 유효기간이 지난 POWER_MONTH, POWER_YEAR 유저의 권한을 자동으로 일반 유저(USER)로 변경하고 만료일을 초기화합니다.


### 🤖 AI 매칭

- 구글 Gemini API를 활용하여 사용자의 반려견 MBTI 및 성격에 기반해 궁합이 잘 맞는 조합을 3개 추천받습니다.
- 해당 조합과 실제 반경 3km 이내의 강아지들을 비교하여, 조건에 맞는 매칭 강아지를 반환합니다.
- 추천 실패 시 에러 메시지를 반환하며, 사용자가 거절한 조합은 제외됩니다.

### 🐾 산책메이트

- 위치 정보를 기반으로 ST_Distance_Sphere를 사용해 반경 3km 이내의 강아지를 조회합니다.
- 조회된 강아지에 대해 산책 신청(=채팅 신청)이 가능합니다.
- 채팅 신청 시 최초 1회에 한해 알림이 자동 생성됩니다.

### 📝 게시판

- 게시글, 댓글, 대댓글, 좋아요 등의 CRUD 기능을 제공합니다.
- 게시글, 댓글 등에 대한 신고 기능을 제공하며, 신고 내용은 DB에 저장됩니다.
- 무한스크롤 기반 페이지네이션, 게시글 검색, 게시글 당 댓글/좋아요 수 카운트 기능을 포함합니다.
- 좋아요 및 댓글 작성 시 작성자에게 알림이 생성됩니다

### 🙋‍♂️ MyProfile

- 사용자 정보(닉네임, 전화번호, 성별 등) 및 반려동물 프로필을 조회 및 수정할 수 있습니다.
- 사용자가 작성한 게시글, 좋아요한 게시글, 받은 알림을 각각 페이지네이션 형식으로 제공합니다.
- 다른 사용자의 마이페이지 정보도 조회할 수 있습니다.

### 👥 팔로우 시스템

- 사용자는 다른 유저를 팔로우/언팔로우 할 수 있으며, 상태는 toggle 방식으로 동작합니다.
- 팔로우 시 알림이 생성되며, 팔로우/팔로잉 목록, 개수 조회 API를 제공합니다.
- 상대방이 나를 팔로우 중인지 여부도 함께 확인 가능합니다.

### 📢 알림 시스템

- 팔로우, 좋아요, 댓글 작성, 채팅 신청 등 이벤트 발생 시 알림을 생성하여 사용자에게 전달합니다.
- 알림 목록 조회, 읽음 처리, 읽지 않은 알림 존재 여부 확인 기능을 제공합니다.
- 알림은 sender와 receiver 간 관계, 반려견 이미지 포함 등 추가 정보를 포함해 응답됩니다.

### 💬 채팅

- 사용자 간 1:1 채팅 기능을 제공합니다.
- 메시지 전송 시 첫 메시지에 한해 알림(notification)을 생성하고, 읽음 상태를 관리합니다.
- 사용자 기준으로 채팅방 목록을 조회할 수 있으며, 나간 채팅방은 제외됩니다.
- ChatCondition 테이블을 활용해 채팅방의 나가기 상태와 삭제 상태를 분리 관리하며, 양쪽 유저가 모두 나간 경우에만 DB에서 완전 삭제됩니다.
- 시스템 메시지(예: "OO님이 채팅을 나갔습니다")를 자동 생성해 사용자 경험을 향상시킵니다.


### 🛠 admin

- 관리자 전용 기능으로 통계 확인, 유저 관리, 신고/문의 내역 관리, 블랙리스트 관리 기능을 제공합니다.


👉 **프론트 레포지토리**: [PuppyCupid_front-project](https://github.com/Team-YES/PuppyCupid_FrontEnd)
