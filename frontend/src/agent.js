import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = 'http://127.0.0.1:8000';

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
  if (token) {
    req.set('authorization', `JWT ${token}`);
  }
}


const requests = {
  del: url =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: url =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url, body) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url, body) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).type('form').then(responseBody)
};


const Auth = {
  login: (email, password) =>
    requests.post('/api/signin/', {email, password}),
  save: user =>
    requests.put('/user', {user})
};

const Category = {
  list: () =>
    requests.get('/api/category/'),
};


export default {
  Auth,
  Category,
  setToken: _token => {
    token = _token;
  }
};
