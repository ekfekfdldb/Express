// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Solidity 컴파일러 버전 명시

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // OpenZeppelin ERC20 토큰 인터페이스 임포트

contract CommunityToken is ERC20 { // CommunityToken은 ERC20을 상속
    constructor(uint256 initialSupply) ERC20("CommunityToken", "CTK") { // 생성자: 토큰명과 심볼 지정
        _mint(msg.sender, initialSupply * (10 ** decimals())); // 초기 공급량을 발행자에게 지급 (소수점 단위 반영)
    }
}