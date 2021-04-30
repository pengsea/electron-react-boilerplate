import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Switch, Modal, Input } from 'antd';
import styles from './dataTable.module.css';
import _ from 'lodash';

export const DataTable = (props: any) => {
  const [strategy, setStrategy] = useState([]);
  const [off, setOff] = useState('1');
  const [isCopyStrategyModalVisible, setIsCopyStrategyModalVisible] = useState(false);
  const [copyStrategyName, setCopyStrategyName] = useState('');
  const [pasteStrategyName, setPasteStrategyName] = useState('');
  const [isCopyAccountModalVisible, setIsCopyAccountModalVisible] = useState(false);
  const [copyAccountName, setCopyAccountName] = useState('');
  const columns = [
    {
      title: '名称',
      dataIndex: 'name'
    },
    {
      title: 'HEDGE_INSTRUMENT',
      dataIndex: 'HEDGE_INSTRUMENT'
    },
    {
      title: 'QUOTE_INSTRUMENT',
      dataIndex: 'QUOTE_INSTRUMENT'
    },
    {
      title: 'HF_SWITCH',
      dataIndex: 'HF_SWITCH'
    },
    {
      title: 'PB_THREASHOLD',
      dataIndex: 'PB_THREASHOLD'
    },
    {
      title: 'GRID',
      dataIndex: 'GRID'
    },
    {
      title: 'OFF',
      dataIndex: 'OFF',
      render: (text: never, record: any, index: any) => (
        <div><Switch checkedChildren='开启' unCheckedChildren='关闭' checked={text === '0'}
                     onChange={(checked: boolean) => handleStrategyOff(checked, record, index)} /></div>
      )
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (text: never, record: any) => (
        <Space size='middle'>
          <a>修改 </a>
          <a>删除</a>
          <a onClick={() => {
            setIsCopyStrategyModalVisible(true);
            setCopyStrategyName(text);
          }}>复制</a>
          <a>生成grid</a>
        </Space>
      )
    }
  ];
  //@ts-ignore
  useEffect(async () => {
 await getData();
  }, []);
  //获取数据
  const getData=async ()=>{
    window.redis.select(props.dbIndex);
    let result = await window.redis.hkeys('CONTENT');
    let tempStrategy: any = [];
    for (let item of result) {
      let str = await window.redis.hgetall(item);
      if (Object.keys(str).length)
        tempStrategy.push({ ...str, name: item, key: item });
    }
    setStrategy(tempStrategy);
    let t = await window.redis.get('OFF');
    setOff(t);
  }
  //策略开关
  const handleStrategyOff = async (checked: boolean, record: any, index: any) => {
    let t = checked ? '0' : '1';
    let result = await window.redis.hset(record.name, 'OFF', t);
    if (result === 0) {
      let strategyTemp = _.cloneDeep(strategy);
      strategyTemp[index]['OFF'] = t;
      setStrategy(strategyTemp);
    } else {
      console.log(result);
    }
  };
  //账号开关
  const handleOff = async (checked: never) => {
    let t = checked ? '0' : '1';
    let result = await window.redis.set('OFF', t);
    if (result === 'OK') {
      setOff(t);
    } else {
      console.log(result);
    }
  };
  //复制策略
  const handleCopyStrategy = async () => {
    let str = await window.redis.hgetall(copyStrategyName);
    for (let item of Object.entries(str)) {
      await window.redis.hset(pasteStrategyName, item[0], item[1]);
    }
    await window.redis.hset('CONTENT', pasteStrategyName, '1');
    setIsCopyStrategyModalVisible(false);
   await getData();
  };
  return <>
    <Table columns={columns} dataSource={strategy} pagination={false} bordered size='small' title={
      () => <div className={styles.header}>
        <div><Switch checkedChildren='开启' unCheckedChildren='关闭' checked={off === '0'} onChange={handleOff} /></div>
        <div>
          <Button type='primary' className={styles.opera}>
            一键同步到其他账号
          </Button>
          <Button type='primary' className={styles.opera}>
            新增策略
          </Button>
          <Button type='primary' className={styles.opera}>
            复制
          </Button>
        </div>
      </div>
    } />
    {isCopyStrategyModalVisible && <Modal title='复制策略' visible={true} onOk={handleCopyStrategy} onCancel={() => {
      setIsCopyStrategyModalVisible(false);
    }
    }>
      <Input defaultValue={copyStrategyName} onChange={e => setPasteStrategyName(e.target.value)} />
    </Modal>}
  </>;
};
