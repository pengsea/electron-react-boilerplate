import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Tabs } from 'antd';
import { useHistory } from 'react-router-dom';
import { connectToRedis } from '../utils/connection';
import styles from './login.module.css';
import { decrypt, getAccount } from '../utils/utils';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

const Store = require('electron-store');
const { remote } = require('electron');
const { Menu, MenuItem } = remote;

const store = new Store({ name: 'redis' });
let customServer = store.get('server');
console.log(customServer);
const { TabPane } = Tabs;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};

const Login = ({ dispatch, redis }) => {
  let history = useHistory();
  const [users, setUsers] = useState([]);
  const [savedUsers, setSavedUsers] = useState([]);

  useEffect(() => {
    let template = [
      {
        label: '加密', click: () => {
          dispatch(routerRedux.push('/encrypt'))
        }
      }
    ];
    let menu = Menu.buildFromTemplate(template);
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      menu.popup();
    });
    return ()=>{document.removeEventListener('contextmenu',()=>{})}
  }, []);
  useEffect(() => {
    console.log(customServer);
    if (customServer && customServer.length) {
      for (let customServerElement of customServer) {
        let tempPwd = decrypt(customServerElement.password);
        connectToRedis({ ...customServerElement, password: tempPwd }, (redisInstance: any) => {
          dispatch({
            type: 'redis/saveHost',
            payload: { ...customServerElement, password: tempPwd, redis: redisInstance }
          });
        });
      }
    } else {
      store.set('server', [{ host: '', port: '', password: '' }]);
      alert('未找到配置文件,请联系管理员,已经默认生成了配置文件,地址: ' + store.path);

    }
    let userHistory = localStorage.getItem('userHistory');
    if (userHistory) {
      let temp = JSON.parse(userHistory);
      setUsers(Object.entries(temp));
    }
  }, []);
  const handleLogin = async (values: any) => {
    console.log('Success:', values);
    const { hostInstance } = redis;
    // console.log(hostInstance.length);
    // console.log(hostInstance);
    for (const hostInstanceElement of hostInstance) {
      await hostInstanceElement.redis.select('13');
      let userResult = await hostInstanceElement.redis.hgetall('user');

      if (Object.keys(userResult).includes(values.user)) {
        if (userResult[values.user] === values.password) {
          let userHistory = localStorage.getItem('userHistory');
          if (userHistory) {
            let temp = JSON.parse(userHistory);
            temp[values.user] = values;
            userHistory = JSON.stringify(temp);
          } else {
            userHistory = JSON.stringify({ [values.user]: values });
          }
          localStorage.setItem('userHistory', userHistory);
          let permissionResult = await hostInstanceElement.redis.hget('permission', values.user);

          let accounts = permissionResult.split(',');
          for (const account of accounts) {
            let db = await hostInstanceElement.redis.hget('account', account);
            connectToRedis(hostInstanceElement, async (redisInstance: any) => {
              await redisInstance.select(db);
              // let result = await  redisInstance.hkeys('CONTENT');
              // let tempName=getAccount(result[0])
              console.log(db);
              console.log(account);
              dispatch({
                type: 'redis/save',
                payload: { name: account, redis: redisInstance }
              });
              // routerRedux.push('/account');
              dispatch(routerRedux.push('/account'));
            });
          }
        }
      }
    }

  };
  return (
    <div>
      <h1 className={styles.title}>登录</h1>
      <Tabs tabPosition={'left'}>
        <TabPane tab='New' key='New'>
          <div className='Hello'>
            <LoginForm onLogin={handleLogin} data={{}}/>
          </div>
        </TabPane>
        {users.map((item: any) => <TabPane tab={item[0]} key={item[0]}>
          <div className='Hello'>
            <LoginForm onLogin={handleLogin} data={item[1]}/>
          </div>
        </TabPane>)}
      </Tabs>
    </div>
  );
};

const LoginForm = (props: any) => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
    props.onLogin(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  return <Form    {...layout}
                  name='basic'
                  initialValues={props.data}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
  >
    <Form.Item
      label='user'
      name='user'
      rules={[{ required: true, message: 'Please input your user!' }]}
    >
      <Input/>
    </Form.Item>
    <Form.Item label='password'
               name='password'
               rules={[{ required: true, message: 'Please input your password!' }]}>
      <Input.Password/>
    </Form.Item>
    <Form.Item {...tailLayout}>
      <Button type='primary' htmlType='submit'>
        登录
      </Button>
    </Form.Item>
  </Form>;
};
export default connect(({ redis }) => ({
  redis
}))(Login);
