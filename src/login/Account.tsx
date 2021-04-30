import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { SettingOutlined, CopyOutlined, SyncOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { DataTable } from './DataTable';
import styles from './Account.module.css';
import { Tabs } from 'antd';

const { TabPane } = Tabs;
const { Panel } = Collapse;

function callback(key: any) {
  console.log(key);
}

const genExtra = () => (
  <div className={styles.opera}>
    <  SyncOutlined onClick={event => {
      // If you don't want click extra trigger collapse, you can prevent this:
      event.stopPropagation();
    }} />
    <CopyOutlined onClick={event => {
      // If you don't want click extra trigger collapse, you can prevent this:
      event.stopPropagation();
    }} />
    <SettingOutlined
      onClick={event => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
      }}
    />
  </div>
);
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

export const Account = () => {
  const [db, setDB] = useState([]);
  const [dbName, setDBName] = useState({});
  useEffect(() => {
    let temp: any = [];
    console.log(window.redis.serverInfo);
    Object.keys(window.redis.serverInfo).forEach(key => {
      if (key.startsWith('db')) {
        temp.push(key.substring(2));
      }
    });

    setDB(temp);
  }, []);

  //@ts-ignore
  useEffect(async () => {
    let tempName: any = {};

    for (let item of db) {
      window.redis.select(item);
      let result = await window.redis.hkeys('CONTENT');
      tempName[item] = result[0]?.substring(1)?.split(',')[0];
    }
    setDBName(tempName);
  }, [db]);
  return <>
    <Link to={'/'} className={styles.logout}>
      退出
    </Link>
    <Tabs defaultActiveKey='1' onChange={callback} type='card'>
      {db.map((item: any, i: any) =>
        <TabPane tab={`db${item}-${dbName[item]}`} key={i}>
          <DataTable dbIndex={item} />
        </TabPane>
      )}

    </Tabs>
  </>;
};







