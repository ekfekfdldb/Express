/* global Chart */
import { // 필요한 API 요청 함수들을 모듈에서 불러옴
    fetchCryptoCandles, // 분봉(분 단위 캔들) 데이터 요청
    fetchTickData,      // 실시간 틱 데이터 요청
    fetchDailyCandles,  // 일봉 데이터 요청
    fetchWeeklyCandles  // 주봉 데이터 요청
} from '../api/indexRequest.js';

let chartInstance = null; // 현재 활성화된 차트 인스턴스를 저장하는 변수
let refreshTimer = null;  // 주기적 갱신을 위한 타이머 ID 저장

/**
 * 캔들 차트 공통 옵션 생성
 * @param {string} label - 차트 라벨
 * @param {'minute'|'day'|'week'} type - 캔들 단위
 * @returns {object} Chart.js 옵션 객체
 */
const getCandleOptions = (label, type = 'minute') => { // 캔들 차트 옵션 객체를 생성하는 함수, label은 라벨용 문자열, type은 시간 단위 (기본값: 'minute')
    const displayFormats = { // 시간 단위별로 차트에 표시될 포맷 정의
        minute: { minute: 'HH:mm' }, // 분 단위일 경우, 시:분 형식으로 표시
        day: { day: 'MM-dd' },       // 일 단위일 경우, 월-일 형식으로 표시
        week: { week: "'W'wo" }      // 주 단위일 경우, ISO 주차 형식으로 'W'와 주차번호를 표시
    };

    const titleMap = { // x축 제목 설정용 매핑 객체
        minute: '시간', // 분 단위일 경우 '시간'으로 표시
        day: '날짜',   // 일 단위일 경우 '날짜'로 표시
        week: '주차'   // 주 단위일 경우 '주차'로 표시
    };

    return { // 최종적으로 반환되는 차트 옵션 객체
        responsive: true, // 반응형 차트 설정 (브라우저 크기에 맞게 조절됨)
        maintainAspectRatio: false, // 가로세로 비율 유지하지 않음 (화면에 꽉 채움)
        plugins: { // 차트 플러그인 설정
            tooltip: { // 툴팁(마우스 오버 시 표시되는 정보) 설정
                callbacks: { // 툴팁 내부에서 표시할 텍스트를 커스터마이징
                    label: (context) => { // 각각의 데이터 포인트에 대해 툴팁 내용 설정
                        const ohlc = context.raw; // raw 데이터에서 OHLC(시가, 고가, 저가, 종가) 값 추출
                        return [ // 툴팁에 표시될 문자열 배열 반환
                            `시가: ${ohlc.o.toLocaleString()} KRW`, // 시가 (Open)
                            `고가: ${ohlc.h.toLocaleString()} KRW`, // 고가 (High)
                            `저가: ${ohlc.l.toLocaleString()} KRW`, // 저가 (Low)
                            `종가: ${ohlc.c.toLocaleString()} KRW`  // 종가 (Close)
                        ];
                    }
                }
            }
        },
        scales: { // 축(scale) 설정
            x: { // x축 (시간축) 설정
                type: 'time', // 시간 기반의 축으로 설정
                time: {
                    unit: type, // 축 단위를 매개변수 type 값으로 설정 ('minute', 'day', 'week')
                    displayFormats: displayFormats[type] // 단위에 따라 포맷 지정
                },
                title: {
                    display: true, // x축 제목 표시
                    text: titleMap[type] || '시간' // 제목 텍스트 설정, 기본값은 '시간'
                }
            },
            y: { // y축 (가격축) 설정
                beginAtZero: false, // 0부터 시작하지 않음, 실제 가격 범위를 반영
                title: {
                    display: true, // y축 제목 표시
                    text: '가격 (KRW)' // y축 제목 텍스트 설정
                }
            }
        }
    };
};


/**
 * 실시간 틱 차트 (선형 차트)
 * @returns {Promise<Chart>}
 */
const createTickChart = async (market) => { // 특정 마켓의 실시간 틱 차트를 생성하는 비동기 함수
    const element = document.getElementById('chartCanvas'); // 차트를 그릴 HTML 캔버스 요소를 가져옴 (id: chartCanvas)
    const data = await fetchTickData(market); // 마켓에 해당하는 실시간 틱 데이터를 비동기적으로 가져옴

    return new Promise((resolve) => { // 차트 생성이 완료되면 Promise로 반환
        requestAnimationFrame(() => { // 브라우저 렌더링 타이밍에 맞춰 차트 생성 (성능 최적화를 위해 사용)
            const chart = new Chart(element, { // Chart.js를 사용해 차트 생성
                type: 'line', // 선형(line) 차트 타입으로 설정
                data: { // 차트에 들어갈 데이터 설정
                    datasets: [{ // 데이터셋 배열
                        label: `${market} 실시간 틱`, // 데이터 라벨: '마켓명 실시간 틱'
                        data, // 실제 틱 데이터 (timestamp와 가격 배열)
                        borderColor: '#42a5f5', // 선의 색상 (하늘색)
                        borderWidth: 1, // 선의 두께
                        pointRadius: 0, // 각 데이터 포인트의 점을 표시하지 않음
                        tension: 0.1 // 곡선 정도 설정 (0이면 직선, 1이면 곡선)
                    }]
                },
                options: { // 차트 옵션 설정
                    responsive: true, // 반응형 차트로 설정 (화면 크기에 따라 자동 조절)
                    maintainAspectRatio: false, // 캔버스의 비율 고정을 해제하여 유연하게 만듦
                    resizeDelay: 0, // 리사이즈 지연 시간 없음
                    scales: { // 축 설정
                        x: { type: 'time' }, // x축은 시간 축으로 설정 (시간에 따른 변화 표현)
                        y: { beginAtZero: false } // y축은 0부터 시작하지 않음 (가격 축을 실제 값에 맞춤)
                    }
                }
            });

            chart.resize(); // 차트 크기를 명시적으로 한 번 강제 리사이즈 (레이아웃 문제 방지용)
            resolve(chart); // 생성된 차트를 Promise로 반환
        });
    });
};

/**
 * 공통 캔들 차트 생성 함수
 * @param {string} label - 차트 라벨
 * @param {Function} dataFetcher - 데이터 요청 함수
 * @param {'minute'|'day'|'week'} type - 단위 타입
 * @param {number} barThickness - 봉 두께
 * @returns {Promise<Chart>}
 */
const createCandleChart = async (label, dataFetcher, type = 'minute', barThickness = 6) => { // 캔들 차트를 생성하는 비동기 함수 
    const element = document.getElementById('chartCanvas'); // 차트를 렌더링할 HTML 캔버스 요소 선택
    const data = await dataFetcher(); // 외부에서 주어진 데이터 가져오는 함수 실행 (비동기)

    return new Promise((resolve) => { // 차트 생성 완료 후 반환을 위한 Promise 사용
        requestAnimationFrame(() => { // 브라우저 렌더링 타이밍에 맞춰 차트 생성
            const chart = new Chart(element, { // Chart.js를 사용해 차트 인스턴스 생성
                type: 'candlestick', // 차트 타입을 캔들스틱으로 지정 (금융 차트에서 사용)
                data: {
                    datasets: [{ // 데이터셋 설정
                        label, // 차트 상단에 표시될 라벨
                        data, // 실제로 표시할 OHLC 데이터
                        barThickness // 각 캔들(바)의 두께 설정
                    }]
                },
                options: getCandleOptions(label, type) // 캔들 차트 전용 옵션 적용 (x축 단위 등 포함)
            });

            chart.resize(); // 초기 렌더링 후 강제로 리사이즈 한 번 수행 (레이아웃 보정)
            resolve(chart); // 생성된 차트 객체 반환
        });
    });
};

// 캔들 차트 생성 함수들 (유형별로 간편하게 호출할 수 있도록 정의)

// 1분봉 차트 생성 함수
const createMinuteChart = (market) => 
    createCandleChart( // createCandleChart를 호출
        `${market} 1분봉`, // 차트 라벨: "마켓명 1분봉"
        () => fetchCryptoCandles(market, 1, 100), // 분봉 데이터 100개를 비동기로 가져오는 함수
        'minute', // x축 시간 단위 설정
        4 // 바 두께 설정
    );

// 일봉 차트 생성 함수
const createDailyChart = (market) => 
    createCandleChart( // 일봉에 맞춰 설정
        `${market} 일봉`, // 차트 라벨
        () => fetchDailyCandles(market, 100), // 일봉 데이터 100개를 불러옴
        'day' // x축 단위는 'day'
    );

// 주봉 차트 생성 함수
const createWeeklyChart = (market) => 
    createCandleChart( // 주봉에 맞춰 설정
        `${market} 주봉`, // 차트 라벨
        () => fetchWeeklyCandles(market, 100), // 주봉 데이터 100개를 불러옴
        'week' // x축 단위는 'week'
    );

/**
 * 선택한 유형에 따라 차트를 렌더링하고 자동 갱신
 * @param {'tick'|'minute'|'day'|'week'} type
 * @param {'KRW-BTC'|'KRW-ETH'} market - 마켓 코드 (예: 'KRW-BTC')
 */
const renderChart = async (type, market = 'KRW-BTC') => { 
    if (chartInstance) chartInstance.destroy(); // 이전에 생성된 차트 인스턴스가 있으면 제거
    if (refreshTimer) clearInterval(refreshTimer); // 이전에 설정된 갱신 타이머가 있으면 제거

    if (type === 'tick') { // 실시간 틱 차트일 경우
        chartInstance = await createTickChart(market); // 틱 차트 생성
        refreshTimer = setInterval(async () => { // 3초마다 새 데이터로 갱신
            const newData = await fetchTickData(market); // 최신 틱 데이터 요청
            chartInstance.data.datasets[0].data = newData; // 차트 데이터 교체
            chartInstance.update(); // 차트 갱신
        }, 3000); 
    } else if (type === 'day') { // 일봉 차트일 경우
        chartInstance = await createDailyChart(market); // 일봉 차트 생성
        refreshTimer = setInterval(async () => { // 하루(86400000ms)마다 갱신
            const newData = await fetchDailyCandles(market, 100); // 일봉 데이터 요청
            chartInstance.data.datasets[0].data = newData;
            chartInstance.update();
        }, 86400000);
    } else if (type === 'week') { // 주봉 차트일 경우
        chartInstance = await createWeeklyChart(market); // 주봉 차트 생성
        refreshTimer = setInterval(async () => { // 일주일(604800000ms)마다 갱신
            const newData = await fetchWeeklyCandles(market, 100); // 주봉 데이터 요청
            chartInstance.data.datasets[0].data = newData;
            chartInstance.update();
        }, 604800000);
    } else { // 기본은 1분봉(minute) 차트
        chartInstance = await createMinuteChart(market); // 1분봉 차트 생성
        refreshTimer = setInterval(async () => { // 1분마다(60000ms) 데이터 갱신
            const newData = await fetchCryptoCandles(market, 1, 100); // 1분봉 데이터 요청
            chartInstance.data.datasets[0].data = newData;
            chartInstance.update();
        }, 60000);
    }
};

// 초기 로딩 및 드롭다운 이벤트 핸들링
document.addEventListener('DOMContentLoaded', async () => { 
    // HTML 문서 로드 완료 시 실행되는 이벤트 리스너

    const typeSelect = document.getElementById('chartTypeSelect'); // 차트 유형 선택 요소 가져오기
    const marketSelect = document.getElementById('marketSelect'); // 마켓 선택 요소 가져오기

    const updateChart = async () => { // 현재 선택된 type과 market으로 차트를 다시 렌더링
        const type = typeSelect.value; // 선택된 차트 유형 가져오기
        const market = marketSelect.value; // 선택된 마켓 가져오기
        await renderChart(type, market); // 차트 렌더링 함수 호출
    };

    await updateChart(); // 페이지 로드 시 초기 차트 렌더링

    typeSelect.addEventListener('change', updateChart); // 차트 유형 변경 시 렌더링
    marketSelect.addEventListener('change', updateChart); // 마켓 변경 시 렌더링
});