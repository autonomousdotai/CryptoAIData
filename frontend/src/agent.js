import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';

const req = superagentPromise(_superagent, global.Promise);

const API_ROOT = 'http://127.0.0.1:8000';

export default {API_ROOT, req};
