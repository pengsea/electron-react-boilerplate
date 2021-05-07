import dva from 'dva';
import './App.global.css';

// 1. Initialize
const app = dva();

// 2. Plugins
app.use({});

// 3. Model
app.model(require('./models/redis').default);

// 4. Router
app.router(require('./App').default);

// 5. Start
app.start('#root');
