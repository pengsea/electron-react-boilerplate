import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Tabs } from 'antd';
import { useHistory } from 'react-router-dom';
import { connectToRedis } from '../utils/connection';
import styles from './login.module.css';

const { TabPane } = Tabs;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export const Login = () => {
  let history = useHistory();
  const [hosts, setHosts] = useState([]);
  useEffect(() => {
    let hostHistory = localStorage.getItem('hostHistory');
    if (hostHistory) {
      let temp = JSON.parse(hostHistory);
      setHosts(Object.entries(temp));
    }
  }, []);
  const handleLogin = (values: never) => {
    console.log('Success:', values);
    connectToRedis(values, (redis: never) => {
      let hostHistory = localStorage.getItem('hostHistory');
      if (hostHistory) {
        let temp = JSON.parse(hostHistory);
        temp[values.host] = values;
        hostHistory = JSON.stringify(temp);
      } else {
        hostHistory = JSON.stringify({ [values.host]: values });
      }
      localStorage.setItem('hostHistory', hostHistory);
      window.redis = redis;
      history.push('/account');
    });
  };
  return (

    <div>

      <h1 className={styles.title}>登录</h1>
      <Tabs tabPosition={'left'}>
        <TabPane tab='New' key='New'>
          <div className='Hello'>
            <LoginForm onLogin={handleLogin} data={{}} />
          </div>
        </TabPane>
        {hosts.map((item: never) => <TabPane tab={item[0]} key={item[0]}>
          <div className='Hello'>
            <LoginForm onLogin={handleLogin} data={item[1]} />
          </div>
        </TabPane>)}
      </Tabs>
    </div>
  );
};

const LoginForm = (props: never) => {
  const onFinish = (values: never) => {
    console.log('Success:', values);
    props.onLogin(values);
  };

  const onFinishFailed = (errorInfo: never) => {
    console.log('Failed:', errorInfo);
  };
  return <Form    {...layout}
    name='basic'
    initialValues={props.data}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
  >
    <Form.Item
      label='host'
      name='host'
      rules={[{ required: true, message: 'Please input your host!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      label='port'
      name='port'
      rules={[{ required: true, message: 'Please input your port!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item label='password'
               name='password'
               rules={[{ required: true, message: 'Please input your password!' }]}>
      <Input.Password />
    </Form.Item>

    <Form.Item {...tailLayout}>
      <Button type='primary' htmlType='submit'>
        登录
      </Button>
    </Form.Item>
  </Form>;
};
