const express = require("express");
const router = express.Router();

const mysql = require('mysql2');
const dbconfig   = require('../config/database.js');
const pool = mysql.createPool(dbconfig);

router.get("/", async (req, res) => {
   res.send('hello Alphabet A');
});

// 주봉 데이터 API
router.get("/weekly", async (req, res) => {
    pool.getConnection(function(err, conn) {    
        conn.query(
            "SELECT * FROM stock_daily_price", (error,results) => {
                if (error) {
                    console.log(error);
                    pool.releaseConnection(conn);
                }    
                
                // 전제 : 주식의 거래는 월~금에 이루어지므로, 1주를 나누는 단위의 경계는 직전 일요일 ~ 직후 토요일로 설정하였음
                // 배열상 직전 요소의 날짜와 직후 요소의 날짜를 비교하여 1일 이상 차이 나는 경우에 새로운 주간으로 나누는 방법도 생각해 보았으나
                // 주중 공유일이 낀 경우가 있다면 주간을 잘못 나누게 되는 오류를 발생시킬 것으로 판단하여 다소 복잡하지만 이와 같이 설계함
                const weeklyGraph = [];
                let weekInfo = {};                                 
                let prevSunday;
                let nextSaturday;
                let id = 0;

                results.forEach((dailyInfo, index) => {         
                    const thisDate = new Date (dailyInfo.date);
                    const thisDay = thisDate.getDay();  
                    const nextDate = (index === results.length -1 ) ? new Date(dailyInfo.date) : new Date (results[index+1].date);    

                    // thisDate가 한 주의 첫 거래일일 경우, 주 경계(prevSunday ~ nextSaturday) 및 해당 주간의 초기값(weekInfo) 설정
                    if (index === 0 || thisDate > nextSaturday) {
                        prevSunday = new Date (thisDate.getTime() - thisDay * 86400000);  
                        nextSaturday = new Date (thisDate.getTime() - thisDay * 86400000 + 6 * 86400000);
                        id += 1;

                        // firstDay : 해당 주의 첫 거래일
                        // lastDay : 해당 주의 마지막 거래일
                        // fluctuation : 해당 주의 등락 여부 (양봉 true, 음봉 false)
                        weekInfo.id = id;                        
                        weekInfo.ticker = dailyInfo.ticker;                        
                        weekInfo.firstDayKR = dailyInfo.date.toLocaleString('ko-KO').split('.',3).join('.');
                        weekInfo.lastDayKR = "";
                        weekInfo.bprc_adj = dailyInfo.bprc_adj;
                        weekInfo.prc_adj = dailyInfo.prc_adj;
                        weekInfo.hi_adj = dailyInfo.hi_adj;
                        weekInfo.lo_adj = dailyInfo.lo_adj; 
                        weekInfo.fluctuation =""
                        weekInfo.firstDay = dailyInfo.date;
                        weekInfo.lastDay = ""; 
                    }

                    // thisDate가 prevSunday ~ nextSaturday 사이의 날짜일 경우 고가, 저가 비교 실행
                    if (thisDate > prevSunday && thisDate < nextSaturday) {
                        if (dailyInfo.hi_adj > weekInfo.hi_adj) weekInfo.hi_adj = dailyInfo.hi_adj;
                        if (dailyInfo.lo_adj < weekInfo.lo_adj) weekInfo.lo_adj = dailyInfo.lo_adj;                        
                    }
                        
                    // 다음 날짜가 새로운 1주일로 전환되는 날짜일 경우, 현재 주간의 마지막 거래일(lastDay) 입력, 종가(prc_adj) 입력한 후
                    // weeklyGraph 배열에 weekInfo 객체를 push하여 주봉 한 단위의 데이터를 완성함
                    if (nextDate > nextSaturday || index === results.length-1) {                        
                        weekInfo.lastDay = dailyInfo.date;
                        weekInfo.lastDayKR = dailyInfo.date.toLocaleString('ko-KO').split('.',3).join('.');;
                        weekInfo.prc_adj = dailyInfo.prc_adj;                        
                        weekInfo.fluctuation = (weekInfo.prc_adj > weekInfo.bprc_adj) ? true : false;
                        
                        weeklyGraph.push(weekInfo);                                           
                        weekInfo = {};
                    }                                      
                })
            
            res.json(weeklyGraph);
            }
        );
        
        pool.releaseConnection(conn);
     }) 
});


// 월봉 데이터 API
router.get("/monthly", async (req, res) => {
    pool.getConnection(function(err, conn) {    
        conn.query(
            "SELECT * FROM stock_daily_price", (error,results) => {
                if (error) {
                    console.log(error);
                    pool.releaseConnection(conn);
                }    
                
                // 전제 : 
                const monthlyGraph = [];
                let monthInfo = {};                                                 
                let id = 0;

                results.forEach((dailyInfo, index) => {         
                    const thisDate = new Date (dailyInfo.date);
                    const prevDate = (index === 0 ) ? new Date(dailyInfo.date) : new Date (results[index-1].date);    
                    const nextDate = (index === results.length -1 ) ? new Date(dailyInfo.date) : new Date (results[index+1].date);

                    const thisDateKR = thisDate.toLocaleString('ko-KR').split('.',2).join('.');
                    const prevDateKR = prevDate.toLocaleString('ko-KR').split('.',2).join('.');                                   
                    const nextDateKR = nextDate.toLocaleString('ko-KR').split('.',2).join('.');                                   
                    
                    // thisDate가 한 달의 첫 거래일일 경우, 해당 월간의 초기값(weekInfo) 설정
                    if (index === 0 || thisDateKR !== prevDateKR) {                                                
                        id += 1;

                        // firstDay : 해당 월의 첫 거래일
                        // lastDay : 해당 월의 마지막 거래일
                        // fluctuation : 해당 월의 등락 여부 (양봉 true, 음봉 false)
                        monthInfo.id = id;
                        monthInfo.ticker = dailyInfo.ticker;

                        monthInfo.firstDayKR = dailyInfo.date.toLocaleString('ko-KO').split('.',3).join('.');
                        monthInfo.lastDayKR = "";
                        
                        monthInfo.bprc_adj = dailyInfo.bprc_adj;
                        monthInfo.prc_adj = dailyInfo.prc_adj;
                        monthInfo.hi_adj = dailyInfo.hi_adj;
                        monthInfo.lo_adj = dailyInfo.lo_adj; 
                        monthInfo.fluctuation ="" 
                        monthInfo.firstDay = dailyInfo.date;
                        monthInfo.lastDay = "";
                    }
                   
                    // 고가 및 저가 비교 실행
                    if (dailyInfo.hi_adj > monthInfo.hi_adj) monthInfo.hi_adj = dailyInfo.hi_adj;
                    if (dailyInfo.lo_adj < monthInfo.lo_adj) monthInfo.lo_adj = dailyInfo.lo_adj;                                            
                        
                    // 다음 날짜가 새로운 달로 전환되는 날짜일 경우, 현재 월간의 마지막 거래일(lastDay) 입력, 종가(prc_adj) 입력한 후
                    // monthlyGraph 배열에 monthInfo 객체를 push하여 월봉 한 단위의 데이터를 완성함
                    if (thisDateKR !== nextDateKR || index === results.length-1) {                        
                        monthInfo.lastDay = dailyInfo.date;
                        monthInfo.lastDayKR = dailyInfo.date.toLocaleString('ko-KO').split('.',3).join('.');
                        monthInfo.prc_adj = dailyInfo.prc_adj;                        
                        monthInfo.fluctuation = (monthInfo.prc_adj > monthInfo.bprc_adj) ? true : false;
                        
                        monthlyGraph.push(monthInfo);                                           
                        monthInfo = {};
                    }                                      
                })
            
            res.json(monthlyGraph);
            }
        );
        
        pool.releaseConnection(conn);
     }) 
});


// 일봉 데이터 API (*MySQL DB 내용 가공 없이 return)
router.get("/daily", async (req, res) => {
    pool.getConnection(function(err, conn) {    
        conn.query(
            "SELECT * FROM stock_daily_price", (error,results) => {
                if (error) {
                    console.log(error);
                    pool.releaseConnection(conn);
                }                
            res.json(results);
            }
        );
        
        pool.releaseConnection(conn);
     }) 
});

module.exports = router;