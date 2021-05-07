import React, { useState } from 'react';
import { Modal, Button, Tabs, Row, Col, Input, Select, InputNumber } from 'antd';
import _ from 'lodash';
import styles from './generateGridModal.module.css';

const { Option } = Select;
const { TabPane } = Tabs;
const GenerateGridModal = ({ onOk, onCancel }) => {

  const [list, setList] = useState([{ i: Date.now() }]);
  const [grid, setGrid] = useState('');
  const [gen, setGen] = useState({ direction: 'low' });

  function callback(key) {
    console.log(key);
  }

  const handleGenerate1 = () => {
    let temp = [];
    let point = gen.point, column = gen.column;
    for (let i = 0; i < gen.number; i++) {
      temp.push(`(${point},${column})`);
      if (gen.direction === 'low') {
        point += gen.pointGrid;
        column -= gen.columnGrid;
      } else {
        point -= gen.pointGrid;
        column += gen.columnGrid;
      }
    }
    setGrid(`[${temp.join(',')}]`);
  };
  const handleGenerate2 = () => {
    let temp = list.map((item: any) => {
      return `(${item.point},${item.column})`;
    });
    setGrid(`[${temp.join(',')}]`);
  };
  return (
    <>
      <Modal title='生成grid' visible={true} onOk={() => onOk(grid)} onCancel={onCancel}>
        <Tabs defaultActiveKey='1' onChange={callback}>
          <TabPane tab='快速生成' key='1'>
            <Row gutter={[16, 16]} className={styles.row} justify={'center'}>
              <Col span={6}>
                <Select defaultValue={'low'} onChange={value => {
                  setGen({ ...gen, direction: value });
                }}>
                  <Option value='low'>最低</Option>
                  <Option value='high'>最高</Option>
                </Select></Col>
              <Col span={6}><InputNumber placeholder={'数量'} onChange={value => {
                setGen({ ...gen, number: value });
              }} /></Col>
            </Row>
            <Row gutter={[16, 16]} className={styles.row} justify={'center'}>
              <Col span={6}>
                <InputNumber placeholder={'起始点'} onChange={value => {
                  setGen({ ...gen, point: value });
                }} /> </Col>
              <Col span={6}><InputNumber placeholder={'间隔'} onChange={value => {
                setGen({ ...gen, pointGrid: value });
              }} /></Col>
            </Row>
            <Row gutter={[16, 16]} className={styles.row} justify={'center'}>
              <Col span={6}>
                <InputNumber placeholder={'仓位'} onChange={value => {
                  setGen({ ...gen, column: value });
                }} /></Col>
              <Col span={6}><InputNumber placeholder={'间隔'} onChange={value => {
                setGen({ ...gen, columnGrid: value });
              }} /></Col>
            </Row>
            <Row gutter={[16, 16]} className={styles.row}>
              <Col span={24} className={styles.generate}>
                <Button onClick={() => {
                  handleGenerate1();
                }}>点击生成grid</Button>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab='逐个生成' key='2'>
            {list.map((item: any, i: any) =>
              <Row gutter={[16, 16]} key={item.i} className={styles.row}>
                <Col span={8}><InputNumber onChange={value => {
                  let temp = _.cloneDeep(list);
                  temp[i] = { ...item, point: value };
                  setList(temp);
                }} /></Col>
                <Col span={8}><InputNumber onChange={value => {
                  let temp = _.cloneDeep(list);
                  temp[i] = { ...item, column: value };
                  setList(temp);
                }} /></Col>
                {list.length === i + 1 && <Col span={4}><Button type='primary' onClick={() => {
                  let temp = _.cloneDeep(list);
                  temp.push({ i: Date.now() });
                  setList(temp);
                }}>+</Button></Col>}
                {list.length === i + 1 && list.length !== 1 && <Col span={4}><Button onClick={() => {
                  let temp = _.cloneDeep(list);
                  temp.pop();
                  setList(temp);
                }}>-</Button></Col>}
              </Row>)}
            <Row gutter={[16, 16]} className={styles.row}>
              <Col span={24} className={styles.generate}>
                <Button onClick={() => {
                  handleGenerate2();
                }}>点击生成grid</Button>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <Row gutter={[16, 16]} className={styles.row}>
          <Col span={24}>
            <Input.TextArea value={grid} onChange={event => setGrid(event.target.value)} />
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default GenerateGridModal;
