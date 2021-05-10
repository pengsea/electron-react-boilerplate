import React, { useState } from 'react';


import styles from './Account.module.css';
import { Button, Input, Row } from 'antd';

import { routerRedux } from 'dva/router';
import { encrypt } from '../utils/utils';
import { connect } from 'dva';


const Encrypt = ({dispatch}) => {
  const [text, setText] = useState('');

  return <>
    <a onClick={() => {
      dispatch(routerRedux.push('/'));
    }} className={styles.logout}>
      退出
    </a>
    <Row>加密</Row>
    <Row>
      <Input.TextArea onChange={(e: any) => {
        setText(e.target.value);
      }}/>
    </Row>
    <Row>
      <Button/>
    </Row>
    <Row>
      <Input.TextArea value={encrypt(text)}/>
    </Row>
  </>;
};


export default connect(()=>{})(Encrypt);



