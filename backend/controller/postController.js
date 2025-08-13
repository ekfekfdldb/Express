const postModel = require('../model/postModel.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE
} = require('../util/constant/httpStatusCode');
const { rewardUser } = require('../util/rewardService');

/**
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 작성
exports.writePost = async (request, response, next) => {
    const { userid: userId } = request.headers;
    const { postTitle, postContent, attachFilePath } = request.body;

    try {
        if (!postTitle) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (postTitle.length > 26) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE_LENGTH);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (!postContent) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_CONTENT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (postContent.length > 1500) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_CONTENT_LENGHT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null
        };
        const responseData = await postModel.writePost(requestData);

        if (responseData === STATUS_MESSAGE.NOT_FOUND_USER) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.WRITE_POST_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            message: STATUS_MESSAGE.WRITE_POST_SUCCESS,
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 목록 조회
exports.getPosts = async (request, response, next) => {
    const { offset, limit } = request.query;

    try {
        if (!offset || !limit) {
            const error = new Error(STATUS_MESSAGE.INVALID_OFFSET_OR_LIMIT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10)
        };
        const responseData = await postModel.getPosts(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            message: STATUS_MESSAGE.GET_POSTS_SUCCESS,
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 상세 조회
exports.getPost = async (request, response, next) => {
    const { post_id: postId } = request.params;

    try {
        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId
        };
        const responseData = await postModel.getPost(requestData, response);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            message: null,
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 수정
exports.updatePost = async (request, response, next) => {
    const { post_id: postId } = request.params;
    const { userid: userId } = request.headers;
    const { postTitle, postContent, attachFilePath } = request.body;

    try {
        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (postTitle.length > 26) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE_LENGTH);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId,
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null
        };
        const responseData = await postModel.updatePost(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            message: STATUS_MESSAGE.UPDATE_POST_SUCCESS,
            data: responseData
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 삭제
exports.softDeletePost = async (request, response, next) => {
    const { post_id: postId } = request.params;

    try {
        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId
        };
        const results = await postModel.softDeletePost(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            message: STATUS_MESSAGE.DELETE_POST_SUCCESS,
            data: null
        });
    } catch (error) {
        return next(error);
    }
};

exports.rewardToken = async (request, response, next) => { // 보상용 토큰을 전송하는 비동기 API 핸들러
    const { userid: userId } = request.headers; // 헤더에서 userid 추출
    const { address } = request.body; // 요청 본문에서 지갑 주소 추출

    if (!userId) { // userId가 없으면 400 Bad Request 반환
        return response.status(STATUS_CODE.BAD_REQUEST).json({
            message: STATUS_MESSAGE.INVALID_USER_ID, // 유저 ID 없음 메시지
            data: null
        });
    }

    if (!address) { // address가 없으면 400 Bad Request 반환
        return response.status(STATUS_CODE.BAD_REQUEST).json({
            message: STATUS_MESSAGE.INVALID_WALLET_ADDRESS, // 지갑 주소 없음 메시지
            data: null
        });
    }

    try {
        const txHash = await rewardUser(address, 1); // 지갑 주소로 1토큰 보상 (rewardUser는 스마트컨트랙트 호출)
        if (txHash) { // 보상이 성공적으로 처리되었을 경우
            return response.status(STATUS_CODE.OK).json({
                message: STATUS_MESSAGE.GIVE_REWARD_SUCCESS, // 보상 성공 메시지
                data: {
                    txHash // 트랜잭션 해시 반환
                }
            });
        } else { // txHash가 없을 경우 보상 실패
            return response.status(500).json({ message: '토큰 보상 실패' });
        }
    } catch (error) { // 스마트 컨트랙트 호출 중 예외 발생 시
        console.error('보상 실패:', error); // 에러 로그 출력
        return next(error); // 에러 핸들링 미들웨어로 전달
    }
};