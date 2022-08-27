# 알파벳에이 코딩과제 - 지원자 우재영


## 1. 문제 해결과정

1) AWS EC2에 MySQL 설치 및 프로젝트용 DB, 테이블을 세팅하였습니다.
2) 전달 주신 SQL Script를 실행하여 DB에 데이터를 입력하였습니다.
3) 로직 상의 문제 해결과정은 소스코드에 주석으로 작성하였습니다. 


## 2. API 주소 

* 현재 배포 중이므로 아래 링크로 접속하시면 API의 return을 확인하실 수 있습니다. 

1) 주봉 API : http://13.125.145.26:3000/api/charts/weekly
2) 월봉 API : http://13.125.145.26:3000/api/charts/monthly


## 3. API 명세

![api](https://user-images.githubusercontent.com/99331753/187027671-3275846c-8d6a-46f1-88ac-c6a73116e1f1.jpg)


## 4. 문제 해결 중 아쉬운 점

1) EC2 및 MySQL 타임존을 KST (+09:00)로 적용했음에도, 브라우저 출력시 날짜가 UTC 기준으로 출력되는 점을 수정하지 못했습니다.
2) 이에 따로 변수를 지정하여 String 형태로 KST 기준 일자를 표기하여, FrontEnd에서 각 주봉/월봉의 날짜 정보를 KST 기준의 String 값을 활용하거나 UTC 기준의 DateString을 활용하는 것 중 선택할 수 있게 작성하였습니다.

