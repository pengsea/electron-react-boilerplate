import React, { useEffect, useState } from 'react';

import DataTable from './DataTable';
import styles from './Account.module.css';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

const { TabPane } = Tabs;

function callback(key: any) {
  console.log(key);
}


const Account = ({ dispatch, redis }) => {
  const [db, setDB] = useState([]);
  const [dbName, setDBName] = useState({});
  useEffect(() => {
    let temp: any = [];
    // console.log(redis.serverInfo);
    const { instance } = redis;
    if (!instance || instance.length === 0) {
      dispatch(routerRedux.push('/'));
    }
    // Object.keys(redis.serverInfo).forEach(key => {
    //   if (key.startsWith('db')) {
    //     temp.push(key.substring(2));
    //   }
    // });
    //
    // setDB(temp);
  }, []);

  //@ts-ignore
  // useEffect(async () => {
  //   let tempName: any = {};
  //
  //   for (let item of instance) {
  //     // window.redis.select(item);
  //     let result = await instance.hkeys('CONTENT');
  //     tempName[item] = result[0]?.substring(1)?.split(',')[0];
  //   }
  //   setDBName(tempName);
  // }, []);
  const { instance } = redis;
  return <>
    <a onClick={() => {
      dispatch({type:'redis/init'});
      dispatch(routerRedux.push('/'));
    }} className={styles.logout}>
      退出
    </a>
    <Tabs defaultActiveKey='1' onChange={callback} type='card'>
      {instance.map((item: any, i: any) =>
        <TabPane tab={item.name ? item.name : '未设置'} key={i}>
          <DataTable redisInstance={item} />
        </TabPane>
      )}
    </Tabs>
  </>;
};


export default connect(({ redis }) => ({
  redis
}))(Account);



