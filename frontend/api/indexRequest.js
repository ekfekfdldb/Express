import { getServerUrl, getCookie } from '../utils/function.js';

export const getPosts = (offset, limit) => {
    return fetch(`${getServerUrl()}/posts?offset=${offset}&limit=${limit}`, {
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        mode: 'cors',
    });
};

/**
 * 실시간 틱 체결 데이터를 조회
 * @param {string} market - 마켓 코드 (예: KRW-BTC)
 * @param {number} count - 조회할 체결 수 (최대 200)
 * @returns {Promise<Array<{ x: Date, y: number }>>} - 시간/가격 배열
 */
export const fetchTickData = async (market = 'KRW-BTC', count = 100) => {
    try {
        const res = await fetch(
            `https://api.upbit.com/v1/trades/ticks?market=${market}&count=${count}`,
            {}
        );
        if (!res.ok) throw new Error(`틱 데이터 조회 실패: ${res.status}`);
        const raw = await res.json();
        return raw.reverse().map((t) => ({
            x: new Date(t.timestamp),
            y: t.trade_price,
        }));
    } catch (err) {
        console.error('fetchTickData 오류:', err);
        throw err;
    }
};

/**
 * 분봉 캔들 데이터 조회 (예: 1분봉, 3분봉, ...)
 * @param {string} market - 마켓 코드 (예: KRW-BTC)
 * @param {number} unit - 분 단위 (1, 3, 5, 10, 15, 30, 60, 240)
 * @param {number} count - 가져올 봉 개수 (최대 200)
 * @returns {Promise<Array<{ x: Date, o: number, h: number, l: number, c: number }>>}
 */
export const fetchCryptoCandles = async (
    market = 'KRW-BTC',
    unit = 1,
    count = 100
) => {
    try {
        const url = `https://api.upbit.com/v1/candles/minutes/${unit}?market=${market}&count=${count}`;
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`분봉 데이터 조회 실패: ${res.status}`);
        const raw = await res.json();
        return raw.reverse().map((c) => ({
            x: new Date(c.candle_date_time_kst),
            o: c.opening_price,
            h: c.high_price,
            l: c.low_price,
            c: c.trade_price,
        }));
    } catch (err) {
        console.error('fetchCryptoCandles 오류:', err);
        throw err;
    }
};

/**
 * 일봉 데이터 조회
 * @param {string} market - 마켓 코드 (예: KRW-BTC)
 * @param {number} count - 가져올 봉 개수 (최대 200)
 * @returns {Promise<Array<{ x: Date, o: number, h: number, l: number, c: number }>>}
 */
export const fetchDailyCandles = async (market = 'KRW-BTC', count = 100) => {
    try {
        const url = `https://api.upbit.com/v1/candles/days?market=${market}&count=${count}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`일봉 데이터 조회 실패: ${res.status}`);
        const raw = await res.json();
        return raw.reverse().map((c) => ({
            x: new Date(c.candle_date_time_kst),
            o: c.opening_price,
            h: c.high_price,
            l: c.low_price,
            c: c.trade_price,
        }));
    } catch (err) {
        console.error('fetchDailyCandles 오류:', err);
        throw err;
    }
};

/**
 * 주봉 데이터 조회
 * @param {string} market - 마켓 코드 (예: KRW-BTC)
 * @param {number} count - 가져올 봉 개수 (최대 200)
 * @returns {Promise<Array<{ x: Date, o: number, h: number, l: number, c: number }>>}
 */
export const fetchWeeklyCandles = async (market = 'KRW-BTC', count = 100) => {
    try {
        const url = `https://api.upbit.com/v1/candles/weeks?market=${market}&count=${count}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`주봉 데이터 조회 실패: ${res.status}`);
        const raw = await res.json();
        return raw.reverse().map((c) => ({
            x: new Date(c.candle_date_time_kst),
            o: c.opening_price,
            h: c.high_price,
            l: c.low_price,
            c: c.trade_price,
        }));
    } catch (err) {
        console.error('fetchWeeklyCandles 오류:', err);
        throw err;
    }
};

export const getRewardToken = async (address) => {
    return await fetch(
        `${getServerUrl()}/users/reward/token?address=${address}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                session: getCookie('session'),
                userid: getCookie('userId'),
            },
        }
    );
};