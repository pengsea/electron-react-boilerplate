import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Switch, Modal, Input, Popconfirm, Row, Col, Select, Tabs } from 'antd';
import styles from './dataTable.module.css';
import _ from 'lodash';
import { connect } from 'dva';
import { getIndex } from '../utils/utils';
import GenerateGridModal from './generateGridModal';
import EditModal from './editModal';

const { Option } = Select;
const DataTable = ({ dispatch, redis, redisInstance }) => {
  const [strategy, setStrategy] = useState([]);
  const [accountInfo, setAccountInfo] = useState('');
  const [accountMsg, setAccountMsg] = useState('');
  const [off, setOff] = useState('1');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [generateGridModalVisible, setGenerateGridModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [isCopyStrategyModalVisible, setIsCopyStrategyModalVisible] = useState(false);
  const [currentStrategyName, setCurrentStrategyName] = useState('');
  const [currentRecord, setCurrentRecord] = useState({});
  const [pasteStrategyName, setPasteStrategyName] = useState('');
  const [pasteAccountName, setPasteAccountName] = useState('');
  const [syncAccountName, setSyncAccountName] = useState('');
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
      title: 'GRID',
      dataIndex: 'GRID'
    },
    {
      title: 'OFF',
      dataIndex: 'OFF',
      render: (text: never, record: any, index: any) => (
        <div><Switch checkedChildren='开启' unCheckedChildren='关闭' checked={text === '0'}
                     onChange={(checked: boolean) => handleStrategyOff(checked, record, index)}/></div>
      )
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (text: any, record: any) => (
        <Space size='middle'>
          <a onClick={() => {
            setCurrentRecord(record);
            setEditModalVisible(true);
          }
          }>修改 </a>
          <Popconfirm
            title='是否确认删除策略?'
            onConfirm={async () => {
              await redisInstance.redis.del(text);
              await redisInstance.redis.hdel('CONTENT', text);
              await getData();
            }}
            onCancel={() => {
            }}
            okText='是'
            cancelText='否'
          >
            <a href='#'>删除</a>
          </Popconfirm>
          <a onClick={() => {
            let temp = strategy.map((item: any) => getIndex(item.name));
            let i = Math.max(...temp) + 1;
            setCurrentStrategyName(text);
            setPasteStrategyName(`strategy${i}`);
            setPasteAccountName(redisInstance.name);
            setIsCopyStrategyModalVisible(true);
          }}>复制</a>
          <a onClick={() => {
            setCurrentStrategyName(text);
            setGenerateGridModalVisible(true);
          }}>生成grid</a>
        </Space>
      )
    }
  ];
  //@ts-ignore
  useEffect(async () => {
    await getData();
  }, []);
  //获取数据
  const getData = async () => {
    let result = await redisInstance.redis.hkeys('CONTENT');
    let tempStrategy: any = [];
    for (let item of result) {
      let str = await redisInstance.redis.hgetall(item);
      if (Object.keys(str).length)
        tempStrategy.push({ ...str, name: item, key: item });
    }
    setStrategy(tempStrategy);
    let t = await redisInstance.redis.get('OFF');
    setOff(t);
    let info = await redisInstance.redis.hgetall(`(${redisInstance.name},info)`);
    setAccountInfo(JSON.stringify(info));
    let msg = await redisInstance.redis.hgetall(`(${redisInstance.name},msg)`);
    setAccountMsg(JSON.stringify(msg));
  };
  //策略开关
  const handleStrategyOff = async (checked: boolean, record: any, index: any) => {
    let t = checked ? '0' : '1';
    let result = await redisInstance.redis.hset(record.name, 'OFF', t);
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
    let result = await redisInstance.redis.set('OFF', t);
    if (result === 'OK') {
      setOff(t);
    } else {
      console.log(result);
    }
  };
  //复制策略
  const handleCopyStrategy = async () => {
    if (redisInstance.name === pasteAccountName) {//当前账户的复制
      let pastedName=`(${redisInstance.name},${pasteStrategyName})`;
      let str = await redisInstance.redis.hgetall(currentStrategyName);
      for (let item of Object.entries(str)) {
        await redisInstance.redis.hset(pastedName, item[0], item[1]);
      }
      await redisInstance.redis.hset('CONTENT', pastedName, '1');
      setIsCopyStrategyModalVisible(false);
      await getData();
    } else {//其他账户的复制
      const { instance } = redis;
      let redisInstancePasted = instance.find((item: any) => item.name === pasteAccountName);
      let str = await redisInstance.redis.hgetall(currentStrategyName);
      let pastedName=`(${pasteAccountName},${pasteStrategyName})`;
      for (let item of Object.entries(str)) {
        await redisInstancePasted.redis.hset(pastedName, item[0], item[1]);
      }
      await redisInstancePasted.redis.hset('CONTENT', pastedName, '1');
      setIsCopyStrategyModalVisible(false);
    }
  };
  //同步策略到其他账号
  const handleSyncAccount = async () => {
    const { instance } = redis;
    let redisInstanceSync = instance.find((item: any) => item.name === syncAccountName);

    for (let currentStrategy of strategy) {
      let str = await redisInstance.redis.hgetall(currentStrategy.name);
      let syncName=`(${syncAccountName},strategy${getIndex(currentStrategy.name)})`;
      for (let item of Object.entries(str)) {
        await redisInstanceSync.redis.hset(syncName, item[0], item[1]);
      }
      await redisInstanceSync.redis.hset('CONTENT', syncName, '1');
    }

    setSyncModalVisible(false);
  };
  //新增策略 新策略只包含OFF=1
  const handleAddStrategy = async () => {
    let i = 0;
    if (strategy && strategy.length) {
      let temp = strategy.map((item: any) => getIndex(item.name));
      i = Math.max(...temp) + 1;
    }
    let newName = `(${redisInstance.name},strategy${i})`;

    await redisInstance.redis.hset(newName, 'OFF', '1');

    await redisInstance.redis.hset('CONTENT', newName, '1');

    await getData();
  };

  return <>
    <Table columns={columns} dataSource={strategy} pagination={false} bordered size='small' title={
      () => <div className={styles.header}>
        <div><Switch checkedChildren='开启' unCheckedChildren='关闭' checked={off === '0'} onChange={handleOff}/></div>
        <div>
          <Button type='primary' className={styles.opera} onClick={()=>setSyncModalVisible(true)}>
            一键同步到其他账号
          </Button>
          <Button type='primary' className={styles.opera} onClick={handleAddStrategy}>
            新增策略
          </Button>
        </div>
      </div>
    }
           footer={() => <Row gutter={[16, 16]}>
             <Col span={12}><Row>info</Row>
               <Row>{accountInfo}</Row></Col>
             <Col span={12}> <Row>message</Row>
               <Row>{accountMsg}</Row></Col>
           </Row>}/>
    {syncModalVisible && <Modal title='同步账号' visible={true} onOk={handleSyncAccount} onCancel={() => {
      setSyncModalVisible(false);
    }
    }>
      <Row className={styles.copyRow}>
        <label>选择账号</label>
        <Select  style={{ width: '100%' }} onChange={value => {
          setSyncAccountName(value);
        }}>
          {redis.instance.map((item: any, i: any) => <Option value={item.name} disabled={item.name === redisInstance.name}
                                                             key={i}>{item.name}{item.name === redisInstance.name ? '(当前)' : ''}</Option>
          )}
        </Select>
      </Row>
    </Modal>}
    {isCopyStrategyModalVisible && <Modal title='复制策略' visible={true} onOk={handleCopyStrategy} onCancel={() => {
      setIsCopyStrategyModalVisible(false);
    }
    }>
      <Row>
        <label>新策略名</label>
        <Input defaultValue={pasteStrategyName} onChange={e => setPasteStrategyName(e.target.value)}/>
      </Row>
      <Row className={styles.copyRow}>
        <label>选择账号</label>
        <Select defaultValue={redisInstance.name} style={{ width: '100%' }} onChange={value => {
          setPasteAccountName(value);
        }}>
          {redis.instance.map((item: any, i: any) => <Option value={item.name}
                                                             key={i}>{item.name}{item.name === redisInstance.name ? '(当前)' : ''}</Option>
          )}
        </Select>
      </Row>
    </Modal>}
    {generateGridModalVisible &&
    <GenerateGridModal onCancel={() => {
      setGenerateGridModalVisible(false);
    }} onOk={async (grid: any) => {
      await redisInstance.redis.hset(currentStrategyName, 'GRID', grid);
      await getData();
      setGenerateGridModalVisible(false);
    }}/>
    }
    {editModalVisible &&
    <EditModal record={currentRecord}
               redisInstance={redisInstance}
               onCancel={async () => {
                 await getData();
                 setEditModalVisible(false);
               }} onOk={async () => {

      await getData();
      setEditModalVisible(false);
    }}/>
    }

  </>;
};
export default connect(({ redis }) => ({
  redis
}))(DataTable);
