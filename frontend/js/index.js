import BoardItem from '../component/board/boardItem.js';
import Header from '../component/header/header.js';
import { authCheck, getServerUrl, prependChild } from '../utils/function.js';
import { getPosts, getRewardToken } from '../api/indexRequest.js';

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 5;
const ITEMS_PER_LOAD = 5;

const HTTP_OK = 200;

// getBoardItem 함수
const getBoardItem = async (offset = 0, limit = 5) => {
    const response = await getPosts(offset, limit);
    if (!response.ok) {
        throw new Error('Failed to load post list.');
    }

    const data = await response.json();
    return data.data;
};

const setBoardItem = (boardData) => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        const itemsHtml = boardData
            .map((data) =>
                BoardItem(
                    data.post_id,
                    data.created_at,
                    data.post_title,
                    data.hits,
                    data.profileImagePath === null
                        ? null
                        : data.profileImagePath,
                    data.nickname,
                    data.comment_count,
                    data.like
                )
            )
            .join('');
        boardList.innerHTML += ` ${itemsHtml}`;
    }
};

const setRewardTokenBalance = async (address) => {
    const balanceElement = document.getElementById('balanceText');
    const response = await getRewardToken(address);
    if (!response.ok) {
        console.error('토큰 잔액 조회 실패');
        return;
    }

    if (response.status === HTTP_OK) {
        const data = await response.json();
        balanceElement.textContent = `보유 토큰: ${data.data.balance} ${data.data.symbol}`;
    }
};

// 스크롤 이벤트 추가
const addInfinityScrollEvent = () => {
    let offset = INITIAL_OFFSET,
        isEnd = false,
        isProcessing = false;

    window.addEventListener('scroll', async () => {
        const hasScrolledToThreshold =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight * SCROLL_THRESHOLD;
        if (hasScrolledToThreshold && !isProcessing && !isEnd) {
            isProcessing = true;

            try {
                const newItems = await getBoardItem(offset, ITEMS_PER_LOAD);
                if (!newItems || newItems.length === 0) {
                    isEnd = true;
                } else {
                    offset += ITEMS_PER_LOAD;
                    setBoardItem(newItems);
                }
            } catch (error) {
                console.error('Error fetching new items:', error);
                isEnd = true;
            } finally {
                isProcessing = false;
            }
        }
    });
};

const init = async () => {
    try {
		    if (typeof window.ethereum === 'undefined') {
            alert('메타마스크가 설치되어 있지 않습니다. 설치 페이지로 이동합니다.');
            window.location.href = 'https://metamask.io/download.html';
        }
        
        const [address] = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        const response = await authCheck();
        const data = await response.json();
        if (response.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
            data.data.profileImagePath === null
                ? DEFAULT_PROFILE_IMAGE
                : `${getServerUrl()}${data.data.profileImagePath}`;

        const boardScroll = document.querySelector('.board-scroll');
        prependChild(boardScroll, Header('Community', 0, profileImagePath));

        const boardList = await getBoardItem();
        setBoardItem(boardList);

        setRewardTokenBalance(address);
        addInfinityScrollEvent();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

await init();