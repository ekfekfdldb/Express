require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // .env 파일에 있는 환경 변수들을 process.env로 로드

module.exports = {
  solidity: "0.8.28", // 사용할 Solidity 컴파일러 버전 지정
  networks: {
    sepolia: { // Sepolia 테스트넷 설정
      url: process.env.RPC_URL, // Alchemy나 Infura의 RPC 엔드포인트 (예: https://eth-sepolia.g.alchemy.com/v2/...)
      accounts: [process.env.PRIVATE_KEY], // 배포에 사용할 지갑의 개인 키 (0x 포함된 전체 문자열)
    },
  },
};