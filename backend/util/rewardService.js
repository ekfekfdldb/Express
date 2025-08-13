// rewardService.js
const { ethers } = require('ethers'); // ethers.js 모듈 불러오기
const fs = require('fs'); // 파일 시스템 모듈
const path = require('path'); // 경로 조작 모듈
require('dotenv').config(); // .env 환경 변수 로드

const abiPath = path.join(__dirname, '../contractABI.json'); // ABI JSON 파일 경로 설정
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi; // ABI 파일 읽고 파싱

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // RPC URL로 프로바이더 생성
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // 개인 키와 프로바이더로 지갑 생성
const token = new ethers.Contract(process.env.TOKEN_CONTRACT, abi, wallet); // 토큰 컨트랙트 인스턴스 생성

exports.rewardUser = async (toAddress, amount) => { // toAddress에게 amount만큼 토큰을 전송하는 함수
    try {
        const balance = await token.balanceOf(wallet.address); // 서버 지갑의 토큰 잔액 조회
        const formattedBalance = ethers.formatUnits(balance, 18); // 잔액을 18자리 소수 기준으로 포맷
        console.log(`현재 서버 지갑 보유 토큰: ${formattedBalance} CTK`); // 로그 출력

        if (Number(formattedBalance) < Number(amount)) { // 잔액 부족 검사
            throw new Error('잔액이 부족합니다.');
        }

        const tx = await token.transfer( // 토큰 전송 실행
            toAddress,
            ethers.parseUnits(amount.toString(), 18) // 정수로 입력된 금액을 18자리 단위로 변환
        );
        console.log(`TX Sent: ${tx.hash}`); // 트랜잭션 해시 출력

        return tx.hash; // 성공 시 트랜잭션 해시 반환
    } catch (error) {
        console.error('토큰 전송 실패:', error.message); // 에러 로그 출력
        throw new Error('토큰 전송 중 오류가 발생했습니다.'); // 에러 메시지 던지기
    }
};

exports.getRewardTokenBalance = async (address) => { // address의 토큰 잔액을 조회하는 함수
    try {
        if (!ethers.isAddress(address)) { // 유효한 이더리움 주소인지 검증
            throw new Error('유효하지 않은 주소입니다.');
        }

        const balance = await token.balanceOf(address); // 주소의 잔액 조회
        const formatted = ethers.formatUnits(balance, 18); // 18자리 소수 기준으로 포맷
        return formatted; // 포맷된 잔액 반환
    } catch (error) {
        console.error(`잔액 조회 실패: ${error.message}`); // 에러 로그 출력
        throw new Error('잔액 조회 중 오류 발생'); // 에러 메시지 던지기
    }
};