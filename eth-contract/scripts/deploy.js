const hre = require("hardhat"); // Hardhat 런타임 환경 불러오기

async function main() {
  const Token = await hre.ethers.getContractFactory("CommunityToken"); // CommunityToken 컨트랙트 팩토리 생성
  const token = await Token.deploy(1000000); // CommunityToken 컨트랙트 배포 (초기 공급량: 100만 개)

  await token.waitForDeployment(); // 블록체인 상에 배포 완료될 때까지 대기
  console.log(`Token deployed at ${await token.getAddress()}`); // 배포된 컨트랙트 주소 출력
}

main(); // 메인 함수 실행