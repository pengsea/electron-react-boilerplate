import React, { useEffect, useState } from 'react';
import { Modal, Button, Tabs, Row, Col, Input, Select, InputNumber, message, Popconfirm, Space } from 'antd';
import _ from 'lodash';
import styles from './generateGridModal.module.css';
import { Field } from '../utils/const';

const { Option } = Select;
const { TabPane } = Tabs;
const EditModal = ({ onOk, onCancel, record, redisInstance }) => {

  const [list, setList] = useState([]);
  const [grid, setGrid] = useState('');

  useEffect(() => {
    let temp = { ...record };
    delete temp['name'];
    delete temp['key'];
    setList(Object.entries(temp));
  }, []);

  const handleGenerate2 = () => {
    let temp = list.map((item: any) => {
      return `(${item.point},${item.column})`;
    });
    setGrid(`[${temp.join(',')}]`);
  };
  let options = Field.map((item: any) => {
    return <Option value={item} key={item}>{item}</Option>;
  });
  return (
    <>
      <Modal title='修改策略' visible={true} onOk={() => onOk(grid)} onCancel={onCancel} width={800} footer={null}>
        <Row gutter={[16, 16]} className={styles.row}>
          <Col span={8}>
            <Select defaultValue={'name'} style={{ width: '100%' }} disabled={true}>
              <Option value={'name'}>名称</Option>
            </Select>
          </Col>
          <Col span={8}><Input defaultValue={record.name} disabled={true} /></Col>
        </Row>
        {list.map((item: any, i: any) => {
          return <Row gutter={[16, 16]} key={item[0]} className={styles.row}>
            <Col span={8}>
              <Select defaultValue={item[0]} style={{ width: '100%' }} onChange={value => {
                let temp = _.cloneDeep(list);
                temp[i][0] = value;
                setList(temp);
              }}>
                {options}
              </Select>
            </Col>
            <Col span={8}><Input defaultValue={item[1]} onChange={event => {
              let temp = _.cloneDeep(list);
              temp[i][1] = event.target.value;
              setList(temp);
            }} /></Col>
            <Col span={3}><Button onClick={async () => {
              await redisInstance.redis.hset(record.name, item[0], item[1]);
              message.success('保存成功!');
            }}>保存</Button></Col>
            <Col span={3}>
              <Popconfirm
                title='是否确认删除?'
                onConfirm={async () => {
                  await redisInstance.redis.hdel(record.name, item[0]);
                  let temp = _.cloneDeep(list);
                  temp.splice(i, 1);
                  setList(temp);
                  message.success('删除成功');
                }}
                onCancel={() => {
                }}
                okText='是'
                cancelText='否'
              > <Button>删除</Button>
              </Popconfirm>
            </Col>
            {list.length === i + 1 && <Col span={2}>
              <Button type='primary' onClick={() => {
                let temp = _.cloneDeep(list);
                temp.push([]);
                setList(temp);
              }}>+</Button>
            </Col>}

          </Row>;
        })}


      </Modal>
    </>
  );
};
export default EditModal;
